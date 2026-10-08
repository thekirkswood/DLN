"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { type Faculty } from "@/data/faculties";
import { type FrameworkTopic } from "@/data/framework-play";
import { CUSTOMER_SEATS } from "@/data/board-map";
import { topicSheet } from "@/data/board-sheets";
import { bitHref, withPlot, type BoardLive } from "@/data/board-live";
import { cellKind } from "@/data/board-kinds";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { boardEnterHref } from "@/lib/board-enter";
import { pressKitForPlot } from "@/lib/epk-map";
import {
  packSummary,
  readPack,
  seatNameFromHeld,
  writePack,
  type BoardPack,
} from "@/lib/board-pack";
import "./BoardComms.css";

type MessagePack = Extract<BoardPack, { kind: "message" }>;
type ChannelPack = Extract<BoardPack, { kind: "channel" }>;
type CommsAudiencePack = Extract<BoardPack, { kind: "comms-audience" }>;
type SpotlightPack = Extract<BoardPack, { kind: "spotlight" }>;

const BOOK_BITS = [
  { id: "mission", label: "Mission", key: "plot:mission" },
  { id: "promise", label: "Promise", key: "plot:promise" },
  { id: "proposition", label: "Proposition", key: "plot:proposition" },
  { id: "big-idea", label: "Big idea", key: "plot:big-idea" },
] as const;

const PLACES = [
  {
    id: "screen" as const,
    label: "Screen",
    still: "A phone, a site",
    hint: "A place on a screen, not a platform logo.",
  },
  {
    id: "print" as const,
    label: "Print",
    still: "A pack, paper, a board in a street",
    hint: "Paper, pack, a board in a street.",
  },
  {
    id: "room" as const,
    label: "A room",
    still: "A sitting, a shop, a hall",
    hint: "A sitting, a shop, a hall.",
  },
];

type StillRow = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
  kit?: string;
};

function useSharedStills(plot?: string) {
  const [rows, setRows] = useState<StillRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const kit = plot ? pressKitForPlot(plot) : null;
    if (!kit) {
      setRows([]);
      setReady(true);
      return;
    }
    let live = true;
    fetch(`/api/assets?kit=${encodeURIComponent(kit)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: StillRow[] } | null) => {
        if (!live) return;
        const items = (data?.items || [])
          .filter((item) => isImageHref(item.href) && isShared(item))
          .slice(0, 8);
        setRows(items);
        setReady(true);
      })
      .catch(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [plot]);

  return { rows, ready };
}

function CommsStillSocket({
  plot,
  rows,
  ready,
  empty,
}: {
  plot?: string;
  rows: StillRow[];
  ready: boolean;
  empty: string;
}) {
  const lit = ready && rows.length > 0;
  return (
    <aside
      className={lit ? "comms-still-socket is-lit" : "comms-still-socket is-empty"}
      aria-label="Assets stills"
    >
      <p className="kicker">Assets</p>
      {lit ? (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={boardEnterHref("plot", plot)} title={row.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.href} alt="" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="comms-still-empty">
          {plot ? empty : "A plot on the book can show its stills here."}
        </p>
      )}
    </aside>
  );
}

function cellSnippet(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  return packSummary(body) || body.split("\n")[0].trim();
}

function messageLineOf(live: BoardLive | null): string {
  const raw = cellSnippet(live, "comms:message");
  if (!raw) return "";
  return raw.split(" — ")[0]?.trim() || raw;
}

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function sameIntent(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function mentionsDeck(s: string): boolean {
  return /\bdecks?\b/i.test(s);
}

function looksLikeEngagement(s: string): boolean {
  return /\bengagement\b/i.test(s);
}

function splitMoments(raw: string): [string, string, string] {
  const lines = raw.split("\n");
  return [lines[0] || "", lines[1] || "", lines.slice(2).join("\n")];
}

function joinMoments(one: string, two: string, three: string): string {
  return [one, two, three].join("\n").replace(/\n+$/, "");
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

function SaveBar({
  live,
  pending,
  error,
}: {
  live: BoardLive | null;
  pending: boolean;
  error: string;
}) {
  if (!live) return null;
  return (
    <p className="board-save comms-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function namedSeats(live: BoardLive | null) {
  return CUSTOMER_SEATS.map((c) => {
    const raw =
      live?.snippets[`mapping:audience:${c.n}`] ||
      (live?.seats || []).find((s) => s.n === c.n)?.held ||
      "";
    const name = seatNameFromHeld(raw);
    return {
      n: c.n,
      href: withPlot(c.href, live?.plot),
      name,
    };
  }).filter((s) => s.name);
}

function CommsChrome({
  faculty,
  topic,
  live,
  children,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  children: ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const related = live?.related || [];
  if (!sheet) return null;
  return (
    <article className={`board-room is-sheet is-comms is-${topic.id}`}>
      <header className="comms-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>
      {children}
      <details className="board-holds">
        <summary>Behind this room</summary>
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
        {related.length ? (
          <ul className="board-related">
            {related.map((row) => (
              <li key={row.href + row.label}>
                {row.href.startsWith("http") ? (
                  <a href={row.href} target="_blank" rel="noreferrer">
                    {row.label}
                  </a>
                ) : (
                  <Link href={row.href}>{row.label}</Link>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    </article>
  );
}

export function BoardComms({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const kind = cellKind(faculty.id, topic.id);
  if (kind === "channel") return <ChannelRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "comms-audience") return <AudienceRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "spotlight") return <SpotlightRoom faculty={faculty} topic={topic} live={live} />;
  return <MessageRoom faculty={faculty} topic={topic} live={live} />;
}

function MessageRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: MessagePack =
    existing?.kind === "message"
      ? existing
      : { v: 1, kind: "message", line: live?.held || "", never: "", doors: "" };
  const [line, setLine] = useState(start.line);
  const [never, setNever] = useState(start.never);
  const [doors, setDoors] = useState(start.doors);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const personality = cellSnippet(live, "plot:personality");
  const book = BOOK_BITS.map((bit) => ({
    ...bit,
    body: cellSnippet(live, bit.key),
    href: withPlot(bitHref(bit.id), live?.plot),
  }));
  const otherDoors = [
    { id: "channel", label: "Channel", href: "/board/comms/channel", body: cellSnippet(live, "comms:channel") },
    { id: "audience", label: "Audience", href: "/board/comms/audience", body: cellSnippet(live, "comms:audience") },
    { id: "spotlight", label: "Spotlight", href: "/board/comms/spotlight", body: cellSnippet(live, "comms:spotlight") },
  ]
    .map((d) => ({ ...d, href: withPlot(d.href, live?.plot) }))
    .filter((d) => d.body && !sameIntent(line, d.body.split(" — ")[0] || d.body));
  const bookElse = book.filter((b) => b.body && line.trim() && !sameIntent(line, b.body.split(" — ")[0] || b.body));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: MessagePack = { v: 1, kind: "message", line, never, doors };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <CommsChrome faculty={faculty} topic={topic} live={live}>
      <form className="comms-message" onSubmit={onSubmit}>
        <label className="comms-message-stand" htmlFor="msg-line">
          <span className="kicker">One line</span>
          <textarea
            id="msg-line"
            rows={2}
            value={line}
            onChange={(e) => setLine(e.target.value)}
            spellCheck
            placeholder="If you cannot say it once, you do not have a message."
          />
        </label>
        <p className={personality ? "comms-message-voice" : "comms-message-voice is-empty"}>
          <Link href={withPlot("/board/plot/personality", live?.plot)}>
            <span className="kicker">Voice</span>
            <strong>{personality || "Unsigned"}</strong>
          </Link>
        </p>
        <details className="comms-message-more">
          <summary>Never / other doors</summary>
          <label className="comms-message-never" htmlFor="msg-never">
            <span className="kicker">Must never say</span>
            <textarea
              id="msg-never"
              rows={2}
              value={never}
              onChange={(e) => setNever(e.target.value)}
              placeholder="The second voice you are cutting."
            />
          </label>
          <label className="comms-message-door" htmlFor="msg-doors">
            <span className="kicker">A door that says something else</span>
            <textarea
              id="msg-doors"
              rows={2}
              value={doors}
              onChange={(e) => setDoors(e.target.value)}
              placeholder="Name the door."
            />
          </label>
          {otherDoors.length || bookElse.length ? (
            <ul className="comms-message-else">
              {bookElse.map((b) => (
                <li key={b.id}>
                  <Link href={b.href}>
                    <strong>{b.label}</strong>
                    <span>{b.body}</span>
                  </Link>
                </li>
              ))}
              {otherDoors.map((d) => (
                <li key={d.id}>
                  <Link href={d.href}>
                    <strong>{d.label}</strong>
                    <span>{d.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="comms-message-book-list">
            {book.map((b) => (
              <li key={b.id} className={b.body ? undefined : "is-empty"}>
                <Link href={b.href}>{b.label}</Link>
              </li>
            ))}
          </ul>
        </details>
        <CommsStillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="Stills ticked for this plot sit here."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </CommsChrome>
  );
}

function ChannelRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: ChannelPack =
    existing?.kind === "channel"
      ? existing
      : { v: 1, kind: "channel", screen: live?.held || "", print: "", room: "", breaks: "" };
  const [screen, setScreen] = useState(start.screen);
  const [print, setPrint] = useState(start.print);
  const [room, setRoom] = useState(start.room);
  const [breaks, setBreaks] = useState(start.breaks);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const stillLit = stills.ready && stills.rows.length > 0;
  const message = messageLineOf(live);
  const values = { screen, print, room };
  const setters = { screen: setScreen, print: setPrint, room: setRoom };
  const emptyPlaces = !screen.trim() && !print.trim() && !room.trim();
  const missing = !screen.trim() || !print.trim() || !room.trim();
  const deckOnly =
    mentionsDeck(`${screen} ${print} ${room} ${breaks}`) &&
    ([screen, print, room].filter((p) => p.trim()).every((p) => mentionsDeck(p)) ||
      (!print.trim() && !room.trim()));
  const unfinished = missing || deckOnly || mentionsDeck(breaks);
  const nowhere = Boolean(message) && emptyPlaces;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ChannelPack = { v: 1, kind: "channel", screen, print, room, breaks };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <CommsChrome faculty={faculty} topic={topic} live={live}>
      <form
        className={unfinished ? "comms-channel is-unfinished" : "comms-channel"}
        onSubmit={onSubmit}
      >
        {message ? (
          <p className={nowhere ? "comms-channel-line is-nowhere" : "comms-channel-line"}>
            <span className="kicker">{nowhere ? "Nowhere to live" : "This line"}</span>
            <strong>{message}</strong>
          </p>
        ) : (
          <p className="comms-channel-line is-empty">
            <span className="kicker">The line</span>
            <Link href={withPlot("/board/comms/message", live?.plot)}>Write it first.</Link>
          </p>
        )}
        <div className="comms-places">
          {PLACES.map((place) => {
            const value = values[place.id];
            const empty = !value.trim();
            return (
              <label
                key={place.id}
                className={`comms-place is-${place.id}${empty ? " is-empty" : ""}${stillLit ? " is-lit" : ""}`}
                htmlFor={`ch-${place.id}`}
              >
                <span className="kicker">{place.label}</span>
                <textarea
                  id={`ch-${place.id}`}
                  rows={5}
                  value={value}
                  onChange={(e) => setters[place.id](e.target.value)}
                  placeholder={empty && nowhere ? "Empty socket." : place.hint}
                />
                <span className={stillLit ? "comms-place-socket is-lit" : "comms-place-socket is-empty"}>
                  {stillLit ? place.still : "Empty socket."}
                </span>
              </label>
            );
          })}
        </div>
        <CommsStillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="A phone, a pack, a hall. Stills ticked to share sit here. Nothing is generated."
        />
        <details className="comms-message-more">
          <summary>Where it breaks</summary>
          <label className="comms-break" htmlFor="ch-breaks">
            <span className="kicker">Already breaks</span>
            <textarea
              id="ch-breaks"
              rows={3}
              value={breaks}
              onChange={(e) => setBreaks(e.target.value)}
              placeholder="If it only works in a deck, it is not a channel."
            />
          </label>
          {unfinished ? (
            <p className="comms-channel-warn">
              {deckOnly || mentionsDeck(breaks)
                ? "If it only works in a deck, this room is unfinished."
                : "Three places. Empty ones are sockets."}
            </p>
          ) : null}
        </details>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </CommsChrome>
  );
}

function AudienceRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: CommsAudiencePack =
    existing?.kind === "comms-audience"
      ? existing
      : { v: 1, kind: "comms-audience", who: live?.held || "", not: "", effect: "" };
  const [who, setWho] = useState(start.who);
  const [not, setNot] = useState(start.not);
  const [effect, setEffect] = useState(start.effect);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const seats = useMemo(() => namedSeats(live), [live]);
  const engagement = looksLikeEngagement(effect);

  function pointSeat(name: string) {
    setWho((cur) => (norm(cur) === norm(name) ? "" : name));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: CommsAudiencePack = { v: 1, kind: "comms-audience", who, not, effect };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <CommsChrome faculty={faculty} topic={topic} live={live}>
      <form className="comms-audience" onSubmit={onSubmit}>
        <p className="comms-spine">Lasswell — to whom, with what effect</p>
        <p className="comms-audience-note">
          Spoken-to of the line. Not the eight customer seats on Mapping. Those are people the plot has to hold in the
          landscape.
        </p>
        <div className="comms-audience-cols">
          <label className="comms-audience-for" htmlFor="aud-who">
            <span className="kicker">Spoken to</span>
            <textarea
              id="aud-who"
              rows={6}
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="A person you can name. Point at a seat if they already sit there. Or name a spoken-to who is not a seat yet."
            />
            {seats.length ? (
              <ul className="comms-audience-points">
                {seats.map((s) => (
                  <li key={s.n}>
                    <button
                      type="button"
                      className={norm(who) === norm(s.name) ? "is-on" : undefined}
                      aria-pressed={norm(who) === norm(s.name)}
                      onClick={() => pointSeat(s.name)}
                    >
                      Seat {s.n} · {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="comms-audience-empty">No named seat yet. You may still name who is spoken to.</p>
            )}
          </label>
          <label className="comms-audience-not" htmlFor="aud-not">
            <span className="kicker">Not spoken to</span>
            <textarea
              id="aud-not"
              rows={6}
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Clarity is also refusal."
            />
          </label>
        </div>
        <label className={engagement ? "comms-audience-effect is-warn" : "comms-audience-effect"} htmlFor="aud-effect">
          <span className="kicker">An effect you could notice</span>
          <textarea
            id="aud-effect"
            rows={3}
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            placeholder="What should happen in them. Not engagement."
          />
          {engagement ? (
            <em>Engagement is not an effect you could notice in a person. Name what they would do, say, or refuse.</em>
          ) : null}
        </label>
        <p className="comms-audience-doors">
          <Link className="act act-line" href={withPlot("/board/mapping/audience", live?.plot)}>
            Eight customer seats
          </Link>
          <Link className="act act-line" href={withPlot("/board/plot/people", live?.plot)}>
            People
          </Link>
        </p>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </CommsChrome>
  );
}

function SpotlightRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: SpotlightPack =
    existing?.kind === "spotlight"
      ? existing
      : { v: 1, kind: "spotlight", moments: live?.held || "", share: "", quiet: "" };
  const stills = useSharedStills(live?.plot);
  const [one, two, three] = splitMoments(start.moments);
  const [m1, setM1] = useState(one);
  const [m2, setM2] = useState(two);
  const [m3, setM3] = useState(three);
  const [share, setShare] = useState(start.share);
  const [quiet, setQuiet] = useState(start.quiet);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const message = messageLineOf(live);
  const people = cellSnippet(live, "plot:people");
  const differ = Boolean(share.trim() && message.trim() && !sameIntent(share, message));
  const theatre = !message.trim();
  const rows = [
    { n: "01", id: "sp-m1", value: m1, set: setM1, hint: "Launch" },
    { n: "02", id: "sp-m2", value: m2, set: setM2, hint: "Sitting, a pack" },
    { n: "03", id: "sp-m3", value: m3, set: setM3, hint: "A host going live" },
  ];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SpotlightPack = {
      v: 1,
      kind: "spotlight",
      moments: joinMoments(m1, m2, m3),
      share,
      quiet,
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <CommsChrome faculty={faculty} topic={topic} live={live}>
      <form className={theatre ? "comms-spotlight is-theatre" : "comms-spotlight"} onSubmit={onSubmit}>
        <p className="comms-spine">Lasswell — the moments of saying</p>
        <header className="comms-call-head">
          <span>Call sheet</span>
          <span>Next three moments</span>
          <span>Not a blog</span>
        </header>
        {theatre ? (
          <p className="comms-spotlight-hole">
            Spotlight without Message is theatre.{" "}
            <Link href={withPlot("/board/comms/message", live?.plot)}>Write the line they must share.</Link>
          </p>
        ) : null}
        <ol className="comms-call">
          {rows.map((row) => (
            <li key={row.n} className="comms-call-row">
              <span className="comms-call-n">{row.n}</span>
              <label htmlFor={row.id}>
                <span className="kicker">{row.hint}</span>
                <textarea
                  id={row.id}
                  rows={2}
                  value={row.value}
                  onChange={(e) => row.set(e.target.value)}
                  placeholder="The moment that cannot invent a second intent."
                />
              </label>
            </li>
          ))}
        </ol>
        <div className="comms-call-foot">
          <label className={differ ? "comms-call-share is-warn" : "comms-call-share"} htmlFor="sp-share">
            <span className="kicker">The line they share</span>
            <textarea
              id="sp-share"
              rows={2}
              value={share}
              onChange={(e) => setShare(e.target.value)}
              placeholder="Must be able to equal Message."
            />
            {message ? (
              <p className="comms-call-msg">
                <span className="kicker">On Message</span>
                <Link href={withPlot("/board/comms/message", live?.plot)}>{message}</Link>
              </p>
            ) : null}
            {differ ? (
              <em>These two lines differ. Spotlight cannot invent a second intent.</em>
            ) : null}
          </label>
          <label className="comms-call-quiet" htmlFor="sp-quiet">
            <span className="kicker">Allowed to be quiet</span>
            <textarea
              id="sp-quiet"
              rows={6}
              value={quiet}
              onChange={(e) => setQuiet(e.target.value)}
              placeholder="Not every moment is a spotlight."
            />
          </label>
        </div>
        <p className="comms-call-script">
          <span className="kicker">Who holds the script</span>
          {people ? (
            <Link href={withPlot("/board/plot/people", live?.plot)}>{people}</Link>
          ) : (
            <Link href={withPlot("/board/plot/people", live?.plot)}>not named</Link>
          )}
        </p>
        <CommsStillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="A launch, a sitting, a pack, a host going live. Stills ticked in Assets sit here. Nothing is generated."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </CommsChrome>
  );
}
