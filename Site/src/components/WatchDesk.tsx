"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { formatLondonDate, formatLondonTime } from "@/lib/clock";
import { isPrivateIp } from "@/lib/client-ip";
import { linksFor } from "@/lib/ip-pattern";
import type { BlockRow } from "@/lib/block";
import type { StudioNotice } from "@/lib/notices";
import type { TrapDoor, TrapWeb } from "@/lib/trap-sort";
import { slashCount, visitorsFromWeb } from "@/lib/trap-sort";
import type { VisitKind, WatchAttempt, WatchInstance } from "@/lib/watch-types";
import { visitKind } from "@/lib/watch-types";
import { deviceLine } from "@/lib/watch-ua";
import type { BlockAppeal } from "@/lib/appeals";

type SortKey = "depth" | "attempts" | "when";

export function WatchDesk({
  notices,
  traps,
  visits = [],
  attempts = [],
  blocked = [],
  web,
  appeals = [],
  focus,
}: {
  notices: StudioNotice[];
  traps: WatchInstance[];
  visits?: WatchInstance[];
  attempts?: WatchAttempt[];
  blocked?: BlockRow[];
  web?: TrapWeb;
  appeals?: BlockAppeal[];
  focus?: "notices" | "traps" | null;
}) {
  const [gone, setGone] = useState<string[]>([]);
  const [banned, setBanned] = useState<string[]>([]);
  const [cleared, setCleared] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("depth");
  const open = notices.filter(
    (n) => !n.read && n.kind !== "trap" && !gone.includes(n.id),
  );
  const liveTraps = traps.filter(
    (row) => !banned.includes(row.id) && !cleared.includes(row.id),
  );
  const signedIn = liveTraps.filter((row) => row.email);
  const anonymous = liveTraps.filter((row) => !row.email);
  const blockedIps = new Set(
    blocked.flatMap((row) => (row.enforced ? row.ips : [])),
  );
  const doors = web?.doors || [];
  const visitors = useMemo(() => (web ? visitorsFromWeb(web) : []), [web]);
  const groups = useMemo(() => {
    const map = new Map<number, TrapDoor[]>();
    for (const door of doors) {
      const n = slashCount(door.path);
      const list = map.get(n) || [];
      list.push(door);
      map.set(n, list);
    }
    const keys = [...map.keys()].sort((a, b) => a - b);
    return keys.map((n) => {
      const list = map.get(n) || [];
      list.sort((a, b) => {
        if (sort === "attempts") return b.attempts - a.attempts;
        if (sort === "when") return a.last < b.last ? 1 : -1;
        return a.path.localeCompare(b.path);
      });
      return {
        n,
        attempts: list.reduce((s, d) => s + d.attempts, 0),
        doors: list,
      };
    });
  }, [doors, sort]);

  return (
    <div className="watch-desk">
      <p className="body bill-note">
        Every live host on this box. Who is in, who tried the door, who walked
        a site. A long look is a snoop, not a ban. Signed-in people are never
        blocked.
      </p>

      <WatchNow visits={visits} />
      <WatchAttempts attempts={attempts} />
      <WatchVisits visits={visits} />

      <section
        id="watch-notices"
        className={focus === "notices" ? "watch-section is-focus" : "watch-section"}
      >
        <h2>Notifications</h2>
        {open.length === 0 ? (
          <p className="body">None.</p>
        ) : (
          <div className="watch-grid">
            {open.map((n, i) => (
              <NoticeBubble
                key={n.id}
                notice={n}
                delay={i}
                onClear={() => setGone((ids) => [...ids, n.id])}
              />
            ))}
          </div>
        )}
      </section>

      {appeals.filter((a) => a.status === "new").length ? (
        <section className="watch-section">
          <h2>Unblock asks</h2>
          <ul className="watch-paths">
            {appeals
              .filter((a) => a.status === "new")
              .map((a) => (
                <li key={a.id}>
                  {a.ip} · {formatLondonDate(a.t)} — {a.why}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <section className="watch-section">
        <h2>Signed-in probes</h2>
        <p className="body bill-note">
          A logged-in person walked a trap path. They stay in. This is the
          communication that was missing.
        </p>
        {signedIn.length === 0 ? (
          <p className="body">None.</p>
        ) : (
          <div className="watch-grid">
            {signedIn.map((row, i) => (
              <InstanceBubble
                key={row.id}
                row={row}
                delay={i}
                links={linksFor(row, liveTraps, blocked)}
                signedIn
                onBan={() => setBanned((ids) => [...ids, row.id])}
                onClear={() => setCleared((ids) => [...ids, row.id])}
              />
            ))}
          </div>
        )}
      </section>

      <section
        id="watch-traps"
        className={focus === "traps" ? "watch-section is-focus" : "watch-section"}
      >
        <h2>Trap sort</h2>
        <p className="body bill-note">
          {web
            ? `${web.attempts} attempts · ${doors.length} distinct slashes · ${visitors.length} addresses since ${formatLondonDate(web.started)}.`
            : "The web of slashes they try."}
        </p>
        <div className="watch-sort" role="group" aria-label="Sort traps">
          {(
            [
              ["depth", "By depth"],
              ["attempts", "By count"],
              ["when", "By when"],
            ] as [SortKey, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={sort === id ? "is-on" : undefined}
              onClick={() => setSort(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {groups.length === 0 ? (
          <p className="body">None yet.</p>
        ) : (
          groups.map((group) => (
            <details key={group.n} className="watch-depth" open={group.n <= 2}>
              <summary>
                {group.n} {group.n === 1 ? "slash" : "slashes"} · {group.attempts}{" "}
                attempts · {group.doors.length} paths
              </summary>
              <div className="watch-grid">
                {group.doors.map((door, i) => (
                  <PathBubble
                    key={door.path}
                    door={door}
                    delay={i}
                    blockedIps={blockedIps}
                    related={doors.filter(
                      (d) =>
                        d.path !== door.path &&
                        d.ips.some((ip) =>
                          door.ips.some((mine) => mine.ip === ip.ip),
                        ),
                    )}
                  />
                ))}
              </div>
            </details>
          ))
        )}

        <details className="watch-depth">
          <summary>Addresses · {visitors.length}</summary>
          <div className="watch-grid">
            {visitors.slice(0, 80).map((row, i) => (
              <article
                key={row.ip}
                className="lift-plate watch-bubble"
                style={{ "--d": i } as CSSProperties}
              >
                <div className="lift-plate-face book-kpi">
                  <span className="book-kpi-n">{row.attempts}</span>
                  {row.ip}
                </div>
                <div className="watch-bubble-more">
                  <p className="status">
                    {formatLondonDate(row.first)} → {formatLondonDate(row.last)}
                  </p>
                  <p>
                    Depths:{" "}
                    {Object.entries(row.depths)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([d, n]) => `${d}/${n}`)
                      .join(" · ")}
                  </p>
                  <ol className="watch-paths">
                    {row.paths.slice(0, 24).map((p) => (
                      <li key={p.path}>
                        {p.path}
                        <span className="status"> · {p.n}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            ))}
          </div>
        </details>

        <details className="watch-depth">
          <summary>Individual attempts · {anonymous.length} open</summary>
          <p className="body bill-note">
            One plate is one visitor still poking. Prefer the sort above. Clear
            a poke off this list; the web still holds the count.
          </p>
          {anonymous.length === 0 ? (
            <p className="body">None open.</p>
          ) : (
            <div className="watch-grid">
              {anonymous.map((row, i) => (
                <InstanceBubble
                  key={row.id}
                  row={row}
                  delay={i}
                  links={linksFor(row, liveTraps, blocked)}
                  onBan={() => setBanned((ids) => [...ids, row.id])}
                  onClear={() => setCleared((ids) => [...ids, row.id])}
                />
              ))}
            </div>
          )}
        </details>
      </section>

      <section id="watch-blocked" className="watch-section">
        <h2>Blocked</h2>
        <p className="body bill-note">
          Addresses we shut for known-malicious doors. Each plate lists the
          slashes they also tried.
        </p>
        {blocked.length === 0 ? (
          <p className="body">None yet.</p>
        ) : (
          <div className="watch-grid">
            {blocked.map((row, i) => (
              <BlockedBubble key={row.id} row={row} delay={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const HOUSE_LABEL: Record<string, string> = {
  dln: "Design Lab North",
  modyu: "ModYu",
  daa: "Digital Adoption Advisor",
  pfp: "Paul Fosbury Portraits",
  swarm: "Swarm Fund",
  "various-titles": "Various Titles",
  dks: "Dave Kirkwood",
};

type WindowKey = "today" | "7d" | "30d" | "all";

function sinceMs(window: WindowKey): number {
  const now = Date.now();
  if (window === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (window === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  if (window === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

function whoLine(row: WatchInstance): string {
  if (row.displayName && row.email) return `${row.displayName} · ${row.email}`;
  if (row.email) return row.email;
  if (row.displayName) return row.displayName;
  return "unsigned";
}

function WatchNow({ visits }: { visits: WatchInstance[] }) {
  const now = Date.now();
  const live = visits.filter((row) => now - Date.parse(row.last) < 15 * 60 * 1000);
  const byHouse = new Map<string, WatchInstance[]>();
  for (const row of live) {
    const key = row.plot || row.host || "unknown";
    const list = byHouse.get(key) || [];
    list.push(row);
    byHouse.set(key, list);
  }
  return (
    <section id="watch-now" className="watch-section">
      <h2>In now</h2>
      <p className="body bill-note">
        Last fifteen minutes. Same address twice is one walk. Different
        addresses are different people.
      </p>
      {live.length === 0 ? (
        <p className="body">Nobody on a live host in this window.</p>
      ) : (
        [...byHouse.entries()].map(([id, rows]) => (
          <div key={id} className="watch-house">
            <h3>
              {HOUSE_LABEL[id] || id}
              <span>
                {rows.length} {rows.length === 1 ? "walk" : "walks"}
              </span>
            </h3>
            <ol className="watch-visits">
              {rows
                .sort((a, b) => (a.last < b.last ? 1 : -1))
                .map((row) => (
                  <VisitRow key={row.id} row={row} />
                ))}
            </ol>
          </div>
        ))
      )}
    </section>
  );
}

function WatchAttempts({ attempts }: { attempts: WatchAttempt[] }) {
  const [window, setWindow] = useState<WindowKey>("30d");
  const [gate, setGate] = useState<"all" | "ok" | "fail">("all");
  const cut = sinceMs(window);
  const rows = attempts.filter((row) => {
    if (cut && Date.parse(row.t) < cut) return false;
    if (gate === "ok") return row.ok;
    if (gate === "fail") return !row.ok;
    return true;
  });
  const fail = rows.filter((row) => !row.ok).length;
  return (
    <section id="watch-attempts" className="watch-section">
      <h2>Sign-in attempts</h2>
      <p className="body bill-note">
        The door itself. A miss is as useful as a match — that is how a guess
        at a login shows up. Passwords are not stored here.
      </p>
      <p className="watch-visit-filters" role="group" aria-label="Attempt window">
        {(
          [
            ["today", "Today"],
            ["7d", "7 days"],
            ["30d", "30 days"],
            ["all", "All held"],
          ] as [WindowKey, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={window === id ? "is-on" : undefined}
            onClick={() => setWindow(id)}
          >
            {label}
          </button>
        ))}
      </p>
      <p className="watch-visit-filters" role="group" aria-label="Attempt result">
        {(
          [
            ["all", `All ${rows.length}`],
            ["fail", `Miss ${gate === "all" ? fail : rows.length}`],
            ["ok", "In"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={gate === id ? "is-on" : undefined}
            onClick={() => setGate(id)}
          >
            {label}
          </button>
        ))}
      </p>
      {rows.length === 0 ? (
        <p className="body">None in this window.</p>
      ) : (
        <ol className="watch-visits">
          {rows.slice(0, 250).map((row) => (
            <li key={row.id} className={row.ok ? "is-browse" : "is-probe"}>
              <strong>{row.ok ? "in" : "miss"}</strong>
              <span className="watch-who">{row.email || "no address"}</span>
              <span className="watch-device">{deviceLine(row.ua)}</span>
              <span>{row.host || "host"}</span>
              <span>{isPrivateIp(row.ip) ? "on the LAN" : row.ip}</span>
              <span>
                {formatLondonDate(row.t)} {formatLondonTime(row.t)}
              </span>
              {row.reason ? <span className="watch-last-path">{row.reason}</span> : null}
            </li>
          ))}
        </ol>
      )}
      {rows.length > 250 ? (
        <p className="status">Showing 250 of {rows.length} in this window.</p>
      ) : null}
    </section>
  );
}

function VisitRow({ row }: { row: WatchInstance }) {
  const rowKind = visitKind(row);
  const lastPath = row.paths[row.paths.length - 1]?.path || "";
  const hosts = [...new Set(row.paths.map((p) => p.host).filter(Boolean))];
  return (
    <li className={`is-${rowKind}`}>
      <strong>{rowKind}</strong>
      <span className="watch-who">{whoLine(row)}</span>
      <span className="watch-device">{deviceLine(row.ua)}</span>
      <span>{hosts[0] || row.host || "host"}</span>
      <span>{isPrivateIp(row.ip) ? "on the LAN" : row.ip}</span>
      <span>
        {formatLondonDate(row.last)} {formatLondonTime(row.last)}
      </span>
      <span>{row.paths.length} paths</span>
      {lastPath ? <span className="watch-last-path">{lastPath}</span> : null}
    </li>
  );
}

function WatchVisits({ visits }: { visits: WatchInstance[] }) {
  const [house, setHouse] = useState("all");
  const [kind, setKind] = useState<"all" | VisitKind>("all");
  const [window, setWindow] = useState<WindowKey>("30d");
  const houses = useMemo(() => {
    const cut = sinceMs(window);
    const inWindow = visits.filter((row) => !cut || Date.parse(row.last) >= cut);
    const map = new Map<string, WatchInstance[]>();
    for (const row of inWindow) {
      const key = row.plot || row.host || "unknown";
      const list = map.get(key) || [];
      list.push(row);
      map.set(key, list);
    }
    return {
      total: inWindow.length,
      groups: [...map.entries()]
        .map(([id, rows]) => ({
          id,
          name: HOUSE_LABEL[id] || id,
          n: rows.length,
          rows: [...rows].sort((a, b) => (a.last < b.last ? 1 : -1)),
        }))
        .sort((a, b) => b.n - a.n),
    };
  }, [visits, window]);
  const shown = houses.groups
    .filter((h) => house === "all" || h.id === house)
    .map((h) => ({
      ...h,
      rows: h.rows.filter((row) => kind === "all" || visitKind(row) === kind),
    }))
    .filter((h) => h.rows.length);

  return (
    <section id="watch-visits" className="watch-section">
      <h2>Visitors</h2>
      <p className="body bill-note">
        Each house on this host, including subdomains and own domains. Browse
        and snoop stay. Scrape and probe sit first. Studio walking Design Lab
        North itself is still quiet; a walk on a hosted house is listed.
      </p>
      {visits.length === 0 ? (
        <p className="body">
          None on this book yet. Public and client walks land here as they
          happen.
        </p>
      ) : (
        <>
          <p className="watch-visit-filters" role="group" aria-label="Visitor window">
            {(
              [
                ["today", "Today"],
                ["7d", "7 days"],
                ["30d", "30 days"],
                ["all", "All held"],
              ] as [WindowKey, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={window === id ? "is-on" : undefined}
                onClick={() => setWindow(id)}
              >
                {label}
              </button>
            ))}
          </p>
          <p className="watch-visit-filters" role="group" aria-label="Filter visitors">
            <button
              type="button"
              className={house === "all" ? "is-on" : undefined}
              onClick={() => setHouse("all")}
            >
              All houses {houses.total}
            </button>
            {houses.groups.map((h) => (
              <button
                key={h.id}
                type="button"
                className={house === h.id ? "is-on" : undefined}
                onClick={() => setHouse(h.id)}
              >
                {h.name} {h.n}
              </button>
            ))}
          </p>
          <p className="watch-visit-filters" role="group" aria-label="Kind">
            {(["all", "probe", "scrape", "snoop", "browse"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={kind === k ? "is-on" : undefined}
                onClick={() => setKind(k)}
              >
                {k}
              </button>
            ))}
          </p>
          {shown.map((group) => (
            <div key={group.id} className="watch-house">
              <h3>
                {group.name}
                <span>
                  {group.rows.length}{" "}
                  {group.rows.length === 1 ? "visitor" : "visitors"}
                </span>
              </h3>
              <ol className="watch-visits">
                {group.rows.slice(0, 250).map((row) => (
                  <VisitRow key={row.id} row={row} />
                ))}
              </ol>
              {group.rows.length > 250 ? (
                <p className="status">Showing 250 of {group.rows.length}.</p>
              ) : null}
            </div>
          ))}
        </>
      )}
    </section>
  );
}

function PathBubble({
  door,
  delay,
  blockedIps,
  related,
}: {
  door: TrapDoor;
  delay: number;
  blockedIps: Set<string>;
  related: TrapDoor[];
}) {
  const [open, setOpen] = useState(false);
  const blocked = door.ips.filter((row) => blockedIps.has(row.ip)).sort((a, b) => b.n - a.n);
  const others = door.ips.filter((row) => !blockedIps.has(row.ip)).sort((a, b) => b.n - a.n);

  return (
    <article
      className={`lift-plate watch-bubble${open ? " is-open" : ""}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <button
        type="button"
        className="lift-plate-face book-kpi"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="book-kpi-n">{door.attempts}</span>
        {door.path}
      </button>
      {open ? (
        <div className="watch-bubble-more">
          <p className="status">
            {slashCount(door.path)} slashes · {formatLondonDate(door.first)} →{" "}
            {formatLondonDate(door.last)} · {formatLondonTime(door.last)}
          </p>
          {blocked.length ? (
            <>
              <p>Blocked addresses that tried this slash</p>
              <ul className="watch-ip-list">
                {blocked.map((row) => (
                  <li key={row.ip}>
                    {row.ip}
                    <span className="status"> · {row.n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="status">No blocked address on this slash yet.</p>
          )}
          {others.length ? (
            <>
              <p className="status">Other addresses</p>
              <ul className="watch-ip-list">
                {others.map((row) => (
                  <li key={row.ip}>
                    {row.ip}
                    <span className="status"> · {row.n}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {related.length ? (
            <>
              <p className="status">Other slashes those addresses also tried</p>
              <ol className="watch-paths">
                {related.slice(0, 16).map((d) => (
                  <li key={d.path}>
                    {d.path}
                    <span className="status"> · {d.attempts}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function NoticeBubble({
  notice,
  delay,
  onClear,
}: {
  notice: StudioNotice;
  delay: number;
  onClear: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function clear() {
    setPending(true);
    const res = await fetch("/api/studio/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notice.id }),
    });
    setPending(false);
    if (res.ok) {
      onClear();
      router.refresh();
    }
  }

  return (
    <article
      className={`lift-plate watch-bubble${open ? " is-open" : ""}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <button
        type="button"
        className="lift-plate-face book-kpi"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="book-kpi-n">{kindWord(notice.kind)}</span>
        {notice.title}
      </button>
      {open ? (
        <div className="watch-bubble-more">
          <p className="status">
            {formatLondonDate(notice.t)} · {formatLondonTime(notice.t)}
          </p>
          <p>{notice.body}</p>
          <button type="button" className="act-quiet" disabled={pending} onClick={clear}>
            {pending ? "…" : "Clear"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function InstanceBubble({
  row,
  delay,
  links,
  signedIn = false,
  onBan,
  onClear,
}: {
  row: WatchInstance;
  delay: number;
  links: string[];
  signedIn?: boolean;
  onBan: () => void;
  onClear: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const doors = row.paths.filter((p) => p.trap);
  const label = doors[0]?.path || row.paths[0]?.path || row.ip;
  const who = row.email
    ? `${row.displayName || row.email}${row.role ? ` · ${row.role}` : ""}`
    : "No signed-in account";
  const local = isPrivateIp(row.ip);

  async function clear() {
    setPending(true);
    const res = await fetch("/api/studio/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceId: row.id, clear: true }),
    });
    setPending(false);
    if (res.ok) {
      onClear();
      router.refresh();
    }
  }

  async function ban() {
    if (signedIn) return;
    setPending(true);
    const res = await fetch("/api/studio/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceId: row.id }),
    });
    setPending(false);
    if (res.ok) {
      onBan();
      router.refresh();
    }
  }

  return (
    <article
      className={`lift-plate watch-bubble${open ? " is-open" : ""}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <button
        type="button"
        className="lift-plate-face book-kpi"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="book-kpi-n">{row.paths.length}</span>
        {label}
        {row.email ? <span className="status"> · {row.displayName || row.email}</span> : null}
      </button>
      {open ? (
        <div className="watch-bubble-more">
          <p className="status">
            {formatLondonDate(row.t)} · {formatLondonTime(row.t)}
            {row.retro ? " · from the old book" : ""}
          </p>
          <p>{row.ip}</p>
          {row.host ? <p>{row.host}</p> : null}
          {row.plot ? <p>Plot {row.plot}</p> : null}
          <p>{who}</p>
          {row.email ? <p>{row.email}</p> : null}
          {links.length ? (
            <p className="status">Linked: {links.join(" · ")}</p>
          ) : null}
          <ol className="watch-paths">
            {row.paths.map((hit, i) => (
              <li key={`${hit.t}-${hit.path}-${i}`} className={hit.trap ? "is-door" : undefined}>
                <span className="watch-path-when">{formatLondonTime(hit.t)}</span>
                {hit.path}
              </li>
            ))}
          </ol>
          {row.ua ? <p className="watch-ua">{row.ua}</p> : null}
          <button type="button" className="act-quiet" disabled={pending} onClick={clear}>
            {pending ? "…" : "Clear"}
          </button>{" "}
          {signedIn ? null : (
            <button type="button" className="act-quiet" disabled={pending} onClick={ban}>
              {pending ? "…" : local ? "Keep on the list" : "Block"}
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

function BlockedBubble({ row, delay }: { row: BlockRow; delay: number }) {
  const [open, setOpen] = useState(false);
  const label = row.doors[0] || row.ips[0] || "Blocked";

  return (
    <article
      className={`lift-plate watch-bubble${open ? " is-open" : ""}`}
      style={{ "--d": delay } as CSSProperties}
    >
      <button
        type="button"
        className="lift-plate-face book-kpi"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="book-kpi-n">{row.ips.length}</span>
        {label}
        <span className="status"> · {row.ips.join(" · ")}</span>
      </button>
      {open ? (
        <div className="watch-bubble-more">
          <p className="status">
            {formatLondonDate(row.last)} · {formatLondonTime(row.last)}
            {row.enforced ? " · shut" : " · listed, not shut"}
            {row.how === "studio" ? " · by us" : " · from a door"}
          </p>
          {row.nets.length ? <p>{row.nets.join(" · ")}</p> : null}
          {row.doors.length ? <p>Doors: {row.doors.join(" · ")}</p> : null}
          <ol className="watch-paths">
            {row.paths.map((hit, i) => (
              <li key={`${hit.t}-${hit.path}-${i}`} className={hit.trap ? "is-door" : undefined}>
                <span className="watch-path-when">{formatLondonTime(hit.t)}</span>
                {hit.path}
                {hit.host ? <span className="status"> · {hit.host}</span> : null}
              </li>
            ))}
          </ol>
          {row.ua ? <p className="watch-ua">{row.ua}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function kindWord(kind: StudioNotice["kind"]): string {
  if (kind === "trap") return "Trap";
  if (kind === "probe") return "In";
  if (kind === "appeal") return "Ask";
  if (kind === "onboard") return "On";
  if (kind === "booking") return "Book";
  if (kind === "mail") return "Mail";
  if (kind === "ship") return "Ship";
  if (kind === "pay") return "Paid";
  if (kind === "request") return "Ask";
  if (kind === "account") return "Client";
  return "Note";
}
