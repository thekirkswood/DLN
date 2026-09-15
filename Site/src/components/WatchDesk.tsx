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
import type { WatchInstance } from "@/lib/watch-types";
import type { BlockAppeal } from "@/lib/appeals";

type SortKey = "depth" | "attempts" | "when";

export function WatchDesk({
  notices,
  traps,
  blocked = [],
  web,
  appeals = [],
  focus,
}: {
  notices: StudioNotice[];
  traps: WatchInstance[];
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
        Sorting first, plates second. Depth is how many slashes they walked.
        Related paths sit on the same address. Signed-in people are never
        blocked — they land here so we can see it.
      </p>

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
