"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { type Faculty } from "@/data/faculties";
import { type FrameworkTopic } from "@/data/framework-play";
import { LANDSCAPE_TOKENS } from "@/data/board-map";
import { topicSheet } from "@/data/board-sheets";
import { emptyLead, type BoardLive } from "@/data/board-live";
import { boardEnterHref } from "@/lib/board-enter";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { pressKitForPlot } from "@/lib/epk-map";
import { readScaleId, SCALE_FLAG_READ } from "@/data/campus";
import {
  packSummary,
  readPack,
  writePack,
  type SolportChannelsPack,
  type SolportContentPack,
  type SolportSittingPack,
  type SolportToolsPack,
  type SolportWeekDay,
  type SolportWeekDayId,
} from "@/lib/board-pack";
import "./BoardSolport.css";

type RoomProps = {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
};

type StillRow = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
};

const WEEK: { id: SolportWeekDayId; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const SIT_ROOMS = [
  { id: "sitting", name: "Sitting", key: "solport:sitting" },
  { id: "tools-in-use", name: "Tools in use", key: "solport:tools-in-use" },
  { id: "channels", name: "Channels", key: "solport:channels" },
  { id: "content", name: "Content", key: "solport:content" },
] as const;

function snip(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  return packSummary(body) || body.split("\n")[0].trim();
}

function clip(line: string, n = 88): string {
  const t = line.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
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

function proseFallback(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  if (text.startsWith("{")) return packSummary(text);
  return text;
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

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
    let on = true;
    fetch(`/api/assets?kit=${encodeURIComponent(kit)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: StillRow[] } | null) => {
        if (!on) return;
        setRows(
          (data?.items || []).filter(
            (item) => item.kind === "image" && isImageHref(item.href) && isShared(item),
          ),
        );
        setReady(true);
      })
      .catch(() => {
        if (on) {
          setRows([]);
          setReady(true);
        }
      });
    return () => {
      on = false;
    };
  }, [plot]);

  return { rows, ready };
}

function StillSocket({
  plot,
  rows,
  ready,
  empty,
  preferPeople,
}: {
  plot?: string;
  rows: StillRow[];
  ready: boolean;
  empty: string;
  preferPeople?: boolean;
}) {
  const shown = preferPeople && rows.some((r) => r.flags.people)
    ? rows.filter((r) => r.flags.people).slice(0, 6)
    : rows.slice(0, 6);
  const lit = ready && shown.length > 0;
  return (
    <aside className={lit ? "solport-stills is-lit" : "solport-stills is-empty"} aria-label="Assets stills">
      <p className="kicker">Assets</p>
      {lit ? (
        <ul>
          {shown.map((row) => (
            <li key={row.id}>
              <Link href={boardEnterHref("plot", plot)} title={row.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.href} alt="" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="solport-stills-empty">
          {plot ? (ready ? empty : "Looking in Assets…") : "A plot on the book can show its stills here."}
        </p>
      )}
    </aside>
  );
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
    <p className="board-save solport-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function GenerateSocket() {
  return (
    <p className="solport-gen">
      <button type="button" disabled>
        Generate from this sitting
      </button>
      <span>
        Studio key later. The prompt is this sitting plus the plot book and stills from Assets — not a blank
        model.
      </span>
    </p>
  );
}

function SitSpine({ topicId, live }: { topicId: string; live: BoardLive | null }) {
  const plot = live?.plot;
  return (
    <nav className="solport-spine" aria-label="This sitting">
      {SIT_ROOMS.map((r) => {
        const held = Boolean(snip(live, r.key));
        return (
          <Link
            key={r.id}
            href={boardEnterHref(r.key, plot)}
            className={`${r.id === topicId ? "is-on" : ""}${held ? " is-held" : ""}`.trim()}
          >
            {r.name}
          </Link>
        );
      })}
    </nav>
  );
}

function ScaleAside({ live }: { live: BoardLive | null }) {
  const scaleId = readScaleId(live?.snippets["mapping:scale"] || "");
  if (!scaleId) return null;
  return <p className="solport-scale">{SCALE_FLAG_READ[scaleId]}</p>;
}

function Theatre({ live, topicId }: { live: BoardLive | null; topicId: string }) {
  if (topicId === "sitting") return null;
  const sitting = snip(live, "solport:sitting");
  if (sitting) return null;
  return (
    <p className="solport-theatre">
      A sitting that does not write a cell is theatre.{" "}
      <Link href={boardEnterHref("solport:sitting", live?.plot)}>Name who sat.</Link>
    </p>
  );
}

function SolportChrome({
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
  if (!sheet) return null;
  return (
    <article className={`board-room is-solport is-${topic.id}`}>
      <header className="board-id-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>
      <SitSpine topicId={topic.id} live={live} />
      <ScaleAside live={live} />
      <Theatre live={live} topicId={topic.id} />
      {children}
      <details className="board-holds solport-holds">
        <summary>Behind this room</summary>
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
        {sheet.questions.length ? (
          <ul>
            {sheet.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        ) : null}
        <GenerateSocket />
      </details>
    </article>
  );
}

export function BoardSolport({ faculty, topic, live }: RoomProps) {
  if (topic.id === "tools-in-use") return <ToolsRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "channels") return <ChannelsRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "content") return <ContentRoom faculty={faculty} topic={topic} live={live} />;
  return <SittingRoom faculty={faculty} topic={topic} live={live} />;
}

function startSitting(raw: string): SolportSittingPack {
  const existing = readPack(raw);
  if (existing?.kind === "solport-sitting") {
    return {
      v: 1,
      kind: "solport-sitting",
      who: existing.who || "",
      purpose: existing.purpose || "",
      leave: existing.leave || "",
    };
  }
  return { v: 1, kind: "solport-sitting", who: proseFallback(raw), purpose: "", leave: "" };
}

function SittingRoom({ faculty, topic, live }: RoomProps) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startSitting(live?.held || "");
  const [who, setWho] = useState(start.who);
  const [purpose, setPurpose] = useState(start.purpose);
  const [leave, setLeave] = useState(start.leave);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const people = snip(live, "plot:people");
  const empty = !who.trim() && !purpose.trim() && !leave.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SolportSittingPack = { v: 1, kind: "solport-sitting", who, purpose, leave };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <SolportChrome faculty={faculty} topic={topic} live={live}>
      <form className={empty ? "solport-table is-empty" : "solport-table"} onSubmit={onSubmit}>
        <p className="kicker">A table for two. Not a webinar.</p>
        <div className="solport-chairs">
          <label className={who.trim() ? "solport-chair is-near is-held" : "solport-chair is-near is-vacant"} htmlFor="sit-who">
            <span className="kicker">Who is in the sitting</span>
            <textarea
              id="sit-who"
              rows={5}
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder={
                live
                  ? emptyLead(live.plotName, sheet?.name || "Sitting", Boolean(people))
                  : "A named person. Not a persona."
              }
            />
          </label>
          <label
            className={purpose.trim() ? "solport-chair is-across is-held" : "solport-chair is-across is-vacant"}
            htmlFor="sit-purpose"
          >
            <span className="kicker">What this sitting is for</span>
            <textarea
              id="sit-purpose"
              rows={5}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="The actual work on the table today."
            />
          </label>
        </div>
        <div className="solport-board-edge" aria-hidden />
        <label className={leave.trim() ? "solport-slip is-held" : "solport-slip"} htmlFor="sit-leave">
          <span className="kicker">What they must leave with today</span>
          <textarea
            id="sit-leave"
            rows={3}
            value={leave}
            onChange={(e) => setLeave(e.target.value)}
            placeholder="The next thing. If this is empty, the sitting did not happen."
          />
        </label>
        <p className={people ? "solport-read" : "solport-read is-empty"}>
          <Link href={boardEnterHref("plot:people", live?.plot)}>
            <span className="kicker">People on the book</span>
            <strong>{people || "People is empty. Do not invent who sat."}</strong>
          </Link>
        </p>
        <StillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          preferPeople
          empty="Stills ticked for this plot in Assets sit here. Nothing is generated."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </SolportChrome>
  );
}

function padHands(hands: string[]): string[] {
  const next = (hands || []).map((h) => h || "");
  while (next.length < 4) next.push("");
  return next;
}

function startTools(raw: string): SolportToolsPack {
  const existing = readPack(raw);
  if (existing?.kind === "solport-tools") {
    return {
      v: 1,
      kind: "solport-tools",
      hands: padHands(existing.hands || []),
      leave: existing.leave || "",
      tempted: existing.tempted || "",
    };
  }
  const prose = proseFallback(raw);
  return {
    v: 1,
    kind: "solport-tools",
    hands: padHands(prose ? [prose] : []),
    leave: "",
    tempted: "",
  };
}

function ToolsRoom({ faculty, topic, live }: RoomProps) {
  const start = startTools(live?.held || "");
  const [hands, setHands] = useState(start.hands);
  const [leave, setLeave] = useState(start.leave);
  const [tempted, setTempted] = useState(start.tempted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const desk = snip(live, "workbench:tools");
  const named = hands.map((h) => h.trim()).filter(Boolean);

  function setHand(i: number, value: string) {
    setHands((rows) => rows.map((row, n) => (n === i ? value : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SolportToolsPack = {
      v: 1,
      kind: "solport-tools",
      hands: named,
      leave,
      tempted,
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <SolportChrome faculty={faculty} topic={topic} live={live}>
      <form className="solport-bench" onSubmit={onSubmit}>
        <p className="kicker">Already in their hands — not a recommended stack.</p>
        <ul className="solport-wells">
          {hands.map((hand, i) => (
            <li key={`hand-${i}`} className={hand.trim() ? "solport-well is-held" : "solport-well is-vacant"}>
              <label htmlFor={`tool-hand-${i}`}>
                <span className="kicker">{hand.trim() ? "In hand" : "Vacant"}</span>
                <textarea
                  id={`tool-hand-${i}`}
                  rows={3}
                  value={hand}
                  onChange={(e) => setHand(i, e.target.value)}
                  placeholder="Name the tool they already run."
                />
              </label>
            </li>
          ))}
        </ul>
        <p className="solport-bench-more">
          <button type="button" className="act act-line" onClick={() => setHands((rows) => [...rows, ""])}>
            Another tool they already have
          </button>
        </p>
        <label className="solport-leave-alone" htmlFor="tool-leave">
          <span className="kicker">What we can leave alone</span>
          <textarea
            id="tool-leave"
            rows={3}
            value={leave}
            onChange={(e) => setLeave(e.target.value)}
            placeholder="If it already works, do not replace it in the sitting."
          />
        </label>
        <label className={tempted.trim() ? "solport-tempted is-named" : "solport-tempted"} htmlFor="tool-tempted">
          <span className="kicker">What we are tempted to invent</span>
          <textarea
            id="tool-tempted"
            rows={2}
            value={tempted}
            onChange={(e) => setTempted(e.target.value)}
            placeholder="Write it so we do not add it."
          />
        </label>
        <p className={desk ? "solport-read" : "solport-read is-empty"}>
          <Link href={boardEnterHref("workbench:tools", live?.plot)}>
            <span className="kicker">Workbench tools</span>
            <strong>{desk || "The coal face is empty. This room is what they already hold, not that desk."}</strong>
          </Link>
        </p>
        <StillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="No still ticked for this plot in Assets. Empty on purpose."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </SolportChrome>
  );
}

function emptyWeek(): SolportWeekDay[] {
  return WEEK.map((d) => ({ day: d.id, where: "", writes: "" }));
}

function startChannels(raw: string): SolportChannelsPack {
  const existing = readPack(raw);
  if (existing?.kind === "solport-channels") {
    const byDay = new Map((existing.days || []).map((d) => [d.day, d]));
    return {
      v: 1,
      kind: "solport-channels",
      days: WEEK.map((d) => ({
        day: d.id,
        where: byDay.get(d.id)?.where || "",
        writes: byDay.get(d.id)?.writes || "",
      })),
      dormant: existing.dormant || "",
    };
  }
  const days = emptyWeek();
  const prose = proseFallback(raw);
  if (prose) days[0] = { ...days[0], where: prose };
  return { v: 1, kind: "solport-channels", days, dormant: "" };
}

function ChannelsRoom({ faculty, topic, live }: RoomProps) {
  const start = startChannels(live?.held || "");
  const [days, setDays] = useState(start.days);
  const [dormant, setDormant] = useState(start.dormant);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const channel = snip(live, "comms:channel");
  const location = snip(live, "plot:location");
  const living = days.filter((d) => d.where.trim() || d.writes.trim()).length;

  function setDay(id: SolportWeekDayId, patch: Partial<SolportWeekDay>) {
    setDays((rows) => rows.map((row) => (row.day === id ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SolportChannelsPack = { v: 1, kind: "solport-channels", days, dormant };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <SolportChrome faculty={faculty} topic={topic} live={live}>
      <form className="solport-week-form" onSubmit={onSubmit}>
        <p className="kicker">
          This week{living ? ` · ${living} day${living === 1 ? "" : "s"} named` : " · nowhere yet"}
        </p>
        <ol className="solport-week">
          {WEEK.map((d, i) => {
            const row = days[i];
            const held = Boolean(row.where.trim() || row.writes.trim());
            return (
              <li key={d.id} className={held ? "solport-day is-held" : "solport-day is-quiet"}>
                <span className="solport-day-name">{d.label}</span>
                <label htmlFor={`ch-where-${d.id}`}>
                  <span className="kicker">Where</span>
                  <textarea
                    id={`ch-where-${d.id}`}
                    rows={3}
                    value={row.where}
                    onChange={(e) => setDay(d.id, { where: e.target.value })}
                    placeholder="This week only."
                  />
                </label>
                <label htmlFor={`ch-writes-${d.id}`}>
                  <span className="kicker">Who writes</span>
                  <textarea
                    id={`ch-writes-${d.id}`}
                    rows={2}
                    value={row.writes}
                    onChange={(e) => setDay(d.id, { writes: e.target.value })}
                    placeholder="Name them."
                  />
                </label>
              </li>
            );
          })}
        </ol>
        <label className="solport-dormant" htmlFor="ch-dormant">
          <span className="kicker">What is dormant</span>
          <textarea
            id="ch-dormant"
            rows={2}
            value={dormant}
            onChange={(e) => setDormant(e.target.value)}
            placeholder="A channel that exists and is not this week."
          />
        </label>
        <p className="solport-week-doors">
          <Link href={boardEnterHref("comms:channel", live?.plot)}>
            <span className="kicker">Comms channel</span>
            <strong>{channel || "Screen, print, a room — empty until that cell is held."}</strong>
          </Link>
          <Link href={boardEnterHref("plot:location", live?.plot)}>
            <span className="kicker">Location</span>
            <strong>{location || "Where they trade is empty on the book."}</strong>
          </Link>
        </p>
        <StillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="No still ticked for this plot in Assets. Empty on purpose."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </SolportChrome>
  );
}

function startContent(raw: string): SolportContentPack {
  const existing = readPack(raw);
  if (existing?.kind === "solport-content") {
    return {
      v: 1,
      kind: "solport-content",
      next: existing.next || "",
      does: existing.does || "",
      landscape: existing.landscape || "",
    };
  }
  return { v: 1, kind: "solport-content", next: proseFallback(raw), does: "", landscape: "" };
}

function ContentRoom({ faculty, topic, live }: RoomProps) {
  const start = startContent(live?.held || "");
  const [next, setNext] = useState(start.next);
  const [does, setDoes] = useState(start.does);
  const [landscape, setLandscape] = useState(start.landscape);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const stills = useSharedStills(live?.plot);
  const message = snip(live, "comms:message").split(" — ")[0]?.trim() || "";
  const token = LANDSCAPE_TOKENS.find((t) => t.id === landscape);
  const tokenHeld = token ? snip(live, `mapping:${token.id}`) : "";
  const noNeighbourhood = Boolean(next.trim()) && !landscape;
  const mismatch = Boolean(next.trim() && message && !sameIntent(next, message) && !sameIntent(does, message));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SolportContentPack = { v: 1, kind: "solport-content", next, does, landscape };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <SolportChrome faculty={faculty} topic={topic} live={live}>
      <form className="solport-publish" onSubmit={onSubmit}>
        <label className="solport-next" htmlFor="pub-next">
          <span className="kicker">The next thing to publish</span>
          <textarea
            id="pub-next"
            rows={3}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Name it. Not a calendar."
          />
        </label>
        <label className="solport-does" htmlFor="pub-does">
          <span className="kicker">What it does when it does</span>
          <textarea
            id="pub-does"
            rows={3}
            value={does}
            onChange={(e) => setDoes(e.target.value)}
            placeholder="An effect, not a post count."
          />
        </label>
        <p className={message ? "solport-message" : "solport-message is-empty"}>
          <Link href={boardEnterHref("comms:message", live?.plot)}>
            <span className="kicker">{mismatch ? "Must match Message — this is wandering" : "Message"}</span>
            <strong>{message || "Message is empty. Content without a line is a post with no voice."}</strong>
          </Link>
        </p>
        {noNeighbourhood ? (
          <p className="solport-theatre">
            Content without a landscape cell is a post with no neighbourhood.
          </p>
        ) : null}
        <fieldset className="solport-tokens">
          <legend className="kicker">The landscape token it serves</legend>
          <ul>
            {LANDSCAPE_TOKENS.map((t) => {
              const fill = snip(live, `mapping:${t.id}`);
              const on = landscape === t.id;
              return (
                <li key={t.id} className={`${on ? "is-on" : ""}${fill ? " is-held" : " is-empty"}`.trim()}>
                  <button type="button" onClick={() => setLandscape(on ? "" : t.id)}>
                    <strong>{t.label}</strong>
                    <span>{fill ? clip(fill, 56) : t.lede}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {token ? (
            <p className="solport-token-door">
              <Link href={boardEnterHref(`mapping:${token.id}`, live?.plot)}>
                {token.label}
                {tokenHeld ? ` · ${clip(tokenHeld, 48)}` : " · empty on the landscape"}
              </Link>
            </p>
          ) : null}
        </fieldset>
        <StillSocket
          plot={live?.plot}
          rows={stills.rows}
          ready={stills.ready}
          empty="Stills of what goes out sit here once they are ticked in Assets. Nothing is generated."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </SolportChrome>
  );
}
