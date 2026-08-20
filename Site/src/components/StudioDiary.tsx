"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addCalendarDays,
  formatLondonDayHead,
  formatLondonTime,
  isoFromYmd,
  londonStartOfDay,
  weekdayIndexLondon,
  ymdLondon,
} from "@/lib/clock";
import {
  HOSTS,
  type Booking,
  type HostId,
  type Hours,
  type HoursBook,
  type Slot,
} from "@/lib/hosts";
import type { PublicUser } from "@/lib/auth";

const WEEKDAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" },
] as const;

const TIMES = Array.from({ length: 27 }, (_, i) => {
  const hour = 7 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs)).sort();
}

function dayOn(hours: Hours, ymd: string, dayIso: string): boolean {
  if (hours.openDates.includes(ymd)) return true;
  if (hours.closedDates.includes(ymd)) return false;
  return hours.days.includes(weekdayIndexLondon(dayIso));
}

function toggleWeekday(hours: Hours, n: number): Hours {
  const days = hours.days.includes(n)
    ? hours.days.filter((d) => d !== n)
    : [...hours.days, n].sort();
  return { ...hours, days };
}

function toggleDate(hours: Hours, ymd: string, dayIso: string): Hours {
  const standing = hours.days.includes(weekdayIndexLondon(dayIso));
  if (dayOn(hours, ymd, dayIso)) {
    if (standing) {
      return {
        ...hours,
        closedDates: uniq([...hours.closedDates, ymd]),
        openDates: hours.openDates.filter((d) => d !== ymd),
      };
    }
    return { ...hours, openDates: hours.openDates.filter((d) => d !== ymd) };
  }
  if (standing) {
    return { ...hours, closedDates: hours.closedDates.filter((d) => d !== ymd) };
  }
  return {
    ...hours,
    openDates: uniq([...hours.openDates, ymd]),
    closedDates: hours.closedDates.filter((d) => d !== ymd),
  };
}

function toggleSlot(hours: Hours, startIso: string, ymd: string, dayIso: string): Hours {
  if (!dayOn(hours, ymd, dayIso)) {
    const opened = toggleDate(hours, ymd, dayIso);
    return { ...opened, blocked: opened.blocked.filter((s) => s !== startIso) };
  }
  if (hours.blocked.includes(startIso)) {
    return { ...hours, blocked: hours.blocked.filter((s) => s !== startIso) };
  }
  return { ...hours, blocked: uniq([...hours.blocked, startIso]) };
}

function laterTimes(start: string): string[] {
  return TIMES.filter((t) => t > start);
}

export function StudioDiary({ people }: { people: PublicUser[] }) {
  const router = useRouter();
  const [from, setFrom] = useState(londonStartOfDay());
  const [days, setDays] = useState<string[]>([]);
  const [hosts, setHosts] = useState<Record<HostId, Slot[]>>({ dave: [], ewan: [] });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hours, setHours] = useState<HoursBook | null>(null);
  const [mode, setMode] = useState<"hours" | "hold">("hours");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [weekOnly, setWeekOnly] = useState(true);
  const pendingRef = useRef("");
  pendingRef.current = pending;

  useEffect(() => {
    try {
      if (localStorage.getItem("dln-diary-week") === "0") setWeekOnly(false);
    } catch {
      /* ignore */
    }
  }, []);

  async function load(start = from) {
    const res = await fetch(`/api/diary?from=${encodeURIComponent(start)}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as {
      days?: string[];
      hosts?: Record<HostId, Slot[]>;
      bookings?: Booking[];
      hours?: HoursBook;
    } | null;
    setDays(data?.days || []);
    setHosts(data?.hosts || { dave: [], ewan: [] });
    setBookings(data?.bookings || []);
    if (data?.hours) setHours(data.hours);
  }

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      if (!pendingRef.current) void load();
    }, 15000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from]);

  function who(id: string | null) {
    if (!id) return "Held";
    return people.find((p) => p.id === id)?.displayName || "Client";
  }

  async function pushHours(next: HoursBook) {
    setError("");
    setHours(next);
    setPending("hours");
    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "hours", hours: next }),
    });
    setPending("");
    if (!res.ok) {
      setError("Couldn’t save hours.");
      await load();
      return;
    }
    const data = (await res.json().catch(() => null)) as { hours?: HoursBook } | null;
    if (data?.hours) setHours(data.hours);
    await load();
    router.refresh();
  }

  async function hold(slot: Slot, facet: "design" | "build") {
    setError("");
    setPending(slot.startIso);
    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startIso: slot.startIso,
        facet,
        hostId: slot.hostId,
        hold: true,
      }),
    });
    setPending("");
    if (!res.ok) {
      setError("Couldn’t hold that slot.");
      return;
    }
    await load();
    router.refresh();
  }

  async function cancel(id: string) {
    setPending(id);
    await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", id }),
    });
    setPending("");
    await load();
    router.refresh();
  }

  const todayYmd = ymdLondon(londonStartOfDay());
  const todayIso = londonStartOfDay();
  const weekLabel = useMemo(() => {
    if (days.length < 2) return "This week";
    return `${formatLondonDayHead(isoFromYmd(days[0]))} – ${formatLondonDayHead(isoFromYmd(days[days.length - 1]))}`;
  }, [days]);

  const meetings = bookings
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => a.startIso.localeCompare(b.startIso));

  return (
    <div className={`studio-diary${weekOnly ? " is-week" : ""}`}>
      <div className="diary-nav">
        {weekOnly ? (
          <span />
        ) : (
          <button
            type="button"
            className="act-quiet"
            onClick={() => setFrom(addCalendarDays(from, -7))}
          >
            Previous
          </button>
        )}
        <div className="diary-nav-mid">
          <strong>Live calendars</strong>
          <span>{weekOnly ? "This week" : weekLabel}</span>
        </div>
        <div className="diary-nav-end">
          {weekOnly ? null : (
            <button
              type="button"
              className="act-quiet"
              onClick={() => setFrom(addCalendarDays(from, 7))}
            >
              Next
            </button>
          )}
          <button
            type="button"
            className="act-quiet diary-size"
            onClick={() => {
              const next = !weekOnly;
              setWeekOnly(next);
              try {
                localStorage.setItem("dln-diary-week", next ? "1" : "0");
              } catch {
                /* ignore */
              }
            }}
          >
            {weekOnly ? "Full calendars" : "This week"}
          </button>
        </div>
      </div>
      <p className="body bill-note">
        Set hours on the grid. Dave is Design and Strategy. Ewan is Build,
        unless you hold a slot on the other calendar. Book what is on from
        here — the public pages do not show a calendar.
      </p>
      <div className="diary-modes" role="tablist">
        <button
          type="button"
          className={`diary-ctrl${mode === "hours" ? " is-on" : ""}`}
          aria-pressed={mode === "hours"}
          onClick={() => setMode("hours")}
        >
          Set hours
        </button>
        <button
          type="button"
          className={`diary-ctrl${mode === "hold" ? " is-on" : ""}`}
          aria-pressed={mode === "hold"}
          onClick={() => setMode("hold")}
        >
          Hold a slot
        </button>
      </div>
      {hours
        ? (["dave", "ewan"] as const).map((hostId) => {
            const hostHours = hours[hostId];
            const inToday = dayOn(hostHours, todayYmd, todayIso);
            return (
              <div key={hostId} className="diary-host">
                <div className="diary-host-bar">
                  <div>
                    <h3>{HOSTS[hostId].name}</h3>
                    <p className="diary-host-meta">
                      {hostId === "ewan" ? "Build" : "Design and Strategy"}
                    </p>
                  </div>
                  <div className="diary-gates">
                    <button
                      type="button"
                      className={`diary-ctrl${inToday ? " is-on" : ""}`}
                      disabled={Boolean(pending)}
                      onClick={() => {
                        if (inToday) return;
                        void pushHours({
                          ...hours,
                          [hostId]: toggleDate(hostHours, todayYmd, todayIso),
                        });
                      }}
                    >
                      In
                    </button>
                    <button
                      type="button"
                      className={`diary-ctrl${!inToday ? " is-on" : ""}`}
                      disabled={Boolean(pending)}
                      onClick={() => {
                        if (!inToday) return;
                        void pushHours({
                          ...hours,
                          [hostId]: toggleDate(hostHours, todayYmd, todayIso),
                        });
                      }}
                    >
                      Away
                    </button>
                  </div>
                </div>
                <div className="diary-hours-row">
                  <div className="diary-weekdays">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.n}
                        type="button"
                        className={`diary-ctrl hours-chip${hostHours.days.includes(day.n) ? " is-on" : ""}`}
                        aria-pressed={hostHours.days.includes(day.n)}
                        disabled={Boolean(pending)}
                        onClick={() =>
                          void pushHours({
                            ...hours,
                            [hostId]: toggleWeekday(hostHours, day.n),
                          })
                        }
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <div className="diary-window">
                    <label>
                      From
                      <select
                        value={hostHours.start}
                        disabled={Boolean(pending)}
                        onChange={(e) => {
                          const start = e.target.value;
                          const end =
                            hostHours.end > start ? hostHours.end : laterTimes(start)[0] || "17:00";
                          void pushHours({
                            ...hours,
                            [hostId]: { ...hostHours, start, end },
                          });
                        }}
                      >
                        {(TIMES.slice(0, -1).includes(hostHours.start)
                          ? TIMES.slice(0, -1)
                          : [hostHours.start, ...TIMES.slice(0, -1)]
                        )
                          .slice()
                          .sort()
                          .map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      To
                      <select
                        value={hostHours.end}
                        disabled={Boolean(pending)}
                        onChange={(e) =>
                          void pushHours({
                            ...hours,
                            [hostId]: { ...hostHours, end: e.target.value },
                          })
                        }
                      >
                        {(laterTimes(hostHours.start).includes(hostHours.end)
                          ? laterTimes(hostHours.start)
                          : [hostHours.end, ...laterTimes(hostHours.start)].sort()
                        ).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="diary-stage">
                  <div className="diary-week">
                    {days.map((day, index) => {
                      const dayIso = isoFromYmd(day, 12, 0);
                      const open = dayOn(hostHours, day, dayIso);
                      const rows = (hosts[hostId] || []).filter(
                        (s) => ymdLondon(s.startIso) === day,
                      );
                      return (
                        <div
                          key={`${hostId}-${day}`}
                          className={`lift-plate diary-day${open ? "" : " is-off"}`}
                          style={{ ["--d" as string]: String(index) }}
                        >
                          <div className="lift-plate-face">
                            <button
                              type="button"
                              className="diary-day-toggle diary-ctrl"
                              disabled={Boolean(pending)}
                              onClick={() =>
                                void pushHours({
                                  ...hours,
                                  [hostId]: toggleDate(hostHours, day, dayIso),
                                })
                              }
                            >
                              {formatLondonDayHead(dayIso)}
                              {open ? "" : " · off"}
                            </button>
                            {rows.map((slot) => {
                              const hit = bookings.find((b) => b.id === slot.bookingId);
                              const state = slot.state || (slot.open ? "open" : "off");
                              const label =
                                state === "taken"
                                  ? who(hit?.userId || null)
                                  : state === "held"
                                    ? "Held"
                                    : state === "blocked"
                                      ? "Closed"
                                      : state === "off"
                                        ? "Off"
                                        : state === "past"
                                          ? "Past"
                                          : "Open";
                              return (
                                <button
                                  key={slot.startIso}
                                  type="button"
                                  className={`diary-slot diary-ctrl is-${state}`}
                                  disabled={Boolean(pending) || (state === "past" && !hit)}
                                  onClick={() => {
                                    if (hit) {
                                      void cancel(hit.id);
                                      return;
                                    }
                                    if (mode === "hold") {
                                      if (state === "open") {
                                        void hold(slot, hostId === "ewan" ? "build" : "design");
                                      }
                                      return;
                                    }
                                    if (state === "past") return;
                                    void pushHours({
                                      ...hours,
                                      [hostId]: toggleSlot(
                                        hostHours,
                                        slot.startIso,
                                        day,
                                        dayIso,
                                      ),
                                    });
                                  }}
                                >
                                  <span>{formatLondonTime(slot.startIso)}</span>
                                  <span>{label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        : (
          <p className="body">Hours load with the week.</p>
        )}
      <h3>This week</h3>
      {meetings.length === 0 ? (
        <p className="body">Nothing booked this week.</p>
      ) : (
        <div className="book-grid">
          {meetings.map((row, index) => (
            <div
              key={row.id}
              className="lift-plate"
              style={{ ["--d" as string]: String(index) }}
            >
              <div className="lift-plate-face book-card">
                <div className="book-card-top">
                  <strong>{HOSTS[row.hostId].name.split(" ")[0]}</strong>
                  <span className="book-chip">{row.facet}</span>
                </div>
                <p className="book-who">{row.status === "hold" ? "Held" : who(row.userId)}</p>
                <p className="book-when">
                  {formatLondonDayHead(row.startIso)} · {formatLondonTime(row.startIso)}
                </p>
                <div className="book-acts">
                  <button type="button" className="act-quiet" onClick={() => cancel(row.id)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error ? <p className="err">{error}</p> : null}
    </div>
  );
}
