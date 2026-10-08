"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import "./BoardProcess.css";
import { type Faculty } from "@/data/faculties";
import type { FrameworkTopic } from "@/data/framework-play";
import { PROCESS_STEPS } from "@/data/board-map";
import { topicSheet } from "@/data/board-sheets";
import { withPlot, type BoardLive } from "@/data/board-live";
import { packSummary, readPack, writePack, type ProcessPack } from "@/lib/board-pack";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { pressKitForPlot } from "@/lib/epk-map";

type RoomProps = {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
};

type Door = { href: string; name: string; line: string };

function clip(line: string, n = 88): string {
  const t = line.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

function snip(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  return packSummary(body) || body.split("\n")[0].trim();
}

function signFromLine(body: string): string {
  const line = (packSummary(body) || body).split("\n")[0].trim();
  return line.split(" — ")[0]?.trim() || "";
}

function emptyPack(stage: string): ProcessPack {
  return { v: 1, kind: "process", stage, is: "", isNot: "", sign: "", note: "" };
}

const RHYTHMS = [
  { id: "week", label: "Every week" },
  { id: "fortnight", label: "Fortnight" },
  { id: "month", label: "Every month" },
  { id: "quarter", label: "Quarter" },
] as const;

function ticksFor(often: string): number {
  const t = often.toLowerCase();
  if (t.includes("week") && !t.includes("fort")) return 8;
  if (t.includes("fort")) return 4;
  if (t.includes("month")) return 2;
  if (t.includes("quarter")) return 1;
  return often.trim() ? 3 : 0;
}

function rhythmOn(often: string, id: string, label: string): boolean {
  if (often === label) return true;
  const t = often.toLowerCase();
  if (id === "week") return t.includes("week") && !t.includes("fort");
  if (id === "fortnight") return t.includes("fort");
  if (id === "month") return t.includes("month");
  if (id === "quarter") return t.includes("quarter");
  return false;
}

function peopleLines(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function processRange(raw: string): string[] {
  const pack = readPack(raw);
  if (pack?.kind === "process") {
    const rows = (pack.range || []).map((r) => r.trim()).filter(Boolean);
    if (rows.length) return rows;
  }
  const line = packSummary(raw);
  return line ? [line] : [];
}

function processDirection(raw: string): string {
  const pack = readPack(raw);
  if (pack?.kind === "process") return (pack.direction || pack.is || "").trim();
  return packSummary(raw);
}

type StillRow = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
};

function StillSocket({ plot, empty }: { plot?: string; empty: string }) {
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
        const items = (data?.items || [])
          .filter((item) => item.kind === "image" && isImageHref(item.href) && isShared(item))
          .slice(0, 6);
        setRows(items);
        setReady(true);
      })
      .catch(() => {
        if (on) setReady(true);
      });
    return () => {
      on = false;
    };
  }, [plot]);

  return (
    <div className={rows.length ? "board-process-stills is-lit" : "board-process-stills"}>
      {ready && rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.href} alt="" />
              <span>{row.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="board-process-stills-empty">
          {plot ? empty : "A plot on the book can show its stills here. Nothing is generated."}
        </p>
      )}
    </div>
  );
}

function startProcess(raw: string, stage: string): ProcessPack {
  const pack = readPack(raw);
  if (pack?.kind === "process") {
    return {
      v: 1,
      kind: "process",
      stage,
      is: pack.is || "",
      isNot: pack.isNot || "",
      sign: pack.sign || "",
      note: pack.note || "",
      range: pack.range,
      direction: pack.direction,
      file: pack.file,
      sandbox: pack.sandbox,
      liveHost: pack.liveHost,
      look: pack.look,
      often: pack.often,
    };
  }
  const prose = raw.trim() && !raw.trim().startsWith("{") ? raw.trim() : "";
  const base = emptyPack(stage);
  if (!prose) return base;
  if (stage === "4") return { ...base, range: [prose], note: prose };
  if (stage === "5") return { ...base, direction: prose, is: prose };
  if (stage === "6") return { ...base, file: prose, is: prose };
  if (stage === "7") return { ...base, liveHost: prose, is: prose };
  if (stage === "8") return { ...base, look: prose, note: prose };
  return { ...base, is: prose };
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

function Field({
  id,
  label,
  value,
  onChange,
  rows,
  hint,
  stand,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  stand?: boolean;
}) {
  return (
    <label className={stand ? "board-process-field is-stand" : "board-process-field"} htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} rows={rows || 4} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint ? <em>{hint}</em> : null}
    </label>
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
    <p className="board-process-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function ProcessChrome({
  faculty,
  topic,
  live,
  localFill,
  localSign,
  leave: _leave,
  hole,
  doors,
  still,
  lie,
  children,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  localFill: string;
  localSign?: string;
  leave: string;
  hole?: string;
  doors: Door[];
  still?: string;
  lie: string;
  children: ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const plot = live?.plot;
  const related = live?.related || [];
  const ownerFromBook = signFromLine(live?.snippets["process:stage-1"] || "");
  const owner = (topic.id === "stage-1" ? localSign : "") || ownerFromBook;
  const spine = [...PROCESS_STEPS].reverse();
  const step = PROCESS_STEPS.find((s) => s.id === topic.id);
  const evidenceEmpty = !snip(live, "mapping:evidence");
  if (!sheet) return null;

  return (
    <article className={`board-room is-process is-${topic.id}`}>
      <header className="board-process-mast">
        <p className="kicker">
          {step ? `${step.n} · ${step.short}` : sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>
      {step ? <p className="board-process-stamp" aria-hidden>{step.short}</p> : null}

      <div className="board-process-layout">
        <ol className="board-process-spine" aria-label="Process stack">
          {spine.map((s) => {
            const now = s.id === topic.id;
            const fill = now ? localFill : snip(live, `process:${s.id}`);
            const held = Boolean(fill);
            const past = Number(s.n) < Number(topic.id.replace("stage-", ""));
            const radHole = s.id === "stage-3" && evidenceEmpty;
            const cls = now ? "is-now" : held ? "is-held" : radHole ? "is-hole" : undefined;
            return (
              <li key={s.id}>
                <Link
                  href={withPlot(s.href, plot)}
                  className={cls}
                  aria-current={now ? "page" : undefined}
                >
                  <span className="board-process-spine-n">{s.n}</span>
                  <span className="board-process-spine-copy">
                    <strong>{s.short}</strong>
                    {past && fill ? <span>{clip(signFromLine(fill), 42)}</span> : null}
                    {!past && !now && fill ? <span>{clip(fill, 42)}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="board-process-main">
          {hole ? <p className="board-process-hole">{hole}</p> : null}

          <p className={owner ? "board-process-owner is-in" : "board-process-owner"}>
            <span className="kicker">Owner</span>
            <strong>{owner || "Unsigned"}</strong>
          </p>

          {children}

          {still ? <StillSocket plot={plot} empty={still} /> : null}

          <details className="board-holds">
            <summary>Behind this room</summary>
            {sheet.meaning.map((p) => (
              <p key={p} className="body">
                {p}
              </p>
            ))}
            {related.length ? (
              <ul className="board-process-brought-list">
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
            {doors.length ? (
              <ul className="board-process-doors">
                {doors.map((d) => (
                  <li key={d.href}>
                    <Link href={withPlot(d.href, plot)}>{d.name}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="board-process-socket-note">
              Generate later. {lie}
            </p>
          </details>
        </div>
      </div>
    </article>
  );
}

function ObjectRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "1");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = { v: 1, kind: "process", stage: "1", is, isNot, sign, note };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      localSign={sign}
      leave="What it is, what it is not, a named owner."
      hole={sign.trim() ? undefined : "Unsigned."}
      doors={[
        { href: "/board/plot/mission", name: "Mission", line: snip(live, "plot:mission") || "What they said the work is for." },
        { href: "/board/plot/purpose", name: "Purpose", line: snip(live, "plot:purpose") || "Why it exists, if they have written it." },
      ]}
      still="A still of the thing itself, when Assets has one ticked. Empty is the stand-in."
      lie="What would make it a lie to skip The Project — the object still fuzzy, no owner."
    >
      <form className="board-process-object" onSubmit={onSubmit}>
        <label className="board-process-standin" htmlFor="obj-is">
          <span className="kicker">This is</span>
          <textarea
            id="obj-is"
            rows={3}
            value={is}
            onChange={(e) => setIs(e.target.value)}
            placeholder="The work, in a line you can stand in."
          />
        </label>
        <div className="board-process-object-side">
          <label className="board-process-owner-stamp" htmlFor="obj-sign">
            <span className="kicker">Owner</span>
            <input
              id="obj-sign"
              type="text"
              value={sign}
              onChange={(e) => setSign(e.target.value)}
              placeholder="A person"
            />
          </label>
          <label className="board-process-plate is-not" htmlFor="obj-not">
            <span className="kicker">Not this</span>
            <textarea
              id="obj-not"
              rows={3}
              value={isNot}
              onChange={(e) => setIsNot(e.target.value)}
              placeholder="If this is empty, later stages are decoration."
            />
          </label>
        </div>
        <details className="board-process-more">
          <summary>Also held</summary>
          <Field id="obj-note" label="Must not drift" value={note} onChange={setNote} />
        </details>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function PeopleRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "2");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const named = sign.trim().toLowerCase() !== "not yet" && Boolean(sign.trim() || is.trim());
  const notYet = sign.trim().toLowerCase() === "not yet";
  const identityPeople = snip(live, "plot:people");
  const street: { name: string; kind: "in" | "live" | "identity" | "vacant" }[] = [];
  for (const n of peopleLines(is)) street.push({ name: n, kind: "in" });
  for (const n of peopleLines(isNot)) street.push({ name: n, kind: "live" });
  if (identityPeople) street.push({ name: clip(identityPeople, 36), kind: "identity" });
  if (named && sign.trim() && !peopleLines(is).includes(sign.trim()) && !peopleLines(isNot).includes(sign.trim())) {
    street.unshift({ name: sign.trim(), kind: "in" });
  }
  while (street.length < 8) street.push({ name: notYet ? "Not yet" : "", kind: "vacant" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = { v: 1, kind: "process", stage: "2", is, isNot, sign, note };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="The people are named, or we have said not yet. Who has to live it is not a blank."
      hole={named || sign.trim().toLowerCase() === "not yet" ? undefined : "Nobody is named, and we have not said not yet."}
      doors={[{ href: "/board/plot/people", name: "People", line: snip(live, "plot:people") || "The identity bit they populate. We do not overwrite it from here." }]}
      lie="What would make it a lie to skip The People — a plan nobody has to live."
    >
      <form className="board-process-people" onSubmit={onSubmit}>
        <p className="board-process-echo">A street of people-places. Vacant on purpose until named.</p>
        <ol className="board-process-street" aria-label="People-places">
          {street.slice(0, 8).map((place, i) => (
            <li key={`place-${i}`} className={place.kind === "vacant" ? "is-vacant" : `is-${place.kind}`}>
              <span className="kicker">
                {place.kind === "live" ? "Lives it" : place.kind === "identity" ? "On identity" : place.kind === "in" ? "In the room" : "Vacant"}
              </span>
              <strong>{place.name || `Place ${i + 1}`}</strong>
            </li>
          ))}
        </ol>
        <div className="board-process-yet">
          <button
            type="button"
            className={notYet ? "is-on" : undefined}
            aria-pressed={notYet}
            onClick={() => setSign("not yet")}
          >
            Not yet
          </button>
        </div>
        <div className="board-process-people-split">
          <div className="board-process-people-col">
            <p className="kicker">In the room</p>
            <Field
              id="ppl-in"
              label="Who is here"
              value={is}
              onChange={setIs}
              hint="One name per line. How we talk so the work stays one thing."
            />
          </div>
          <div className="board-process-people-col is-live">
            <p className="kicker">Have to live it</p>
            <Field
              id="ppl-live"
              label="Who is not in the room"
              value={isNot}
              onChange={setIsNot}
              hint="If they have to live the plan and are missing, say so."
            />
          </div>
        </div>
        <Field
          id="ppl-sign"
          label="The people, named"
          value={sign}
          onChange={setSign}
          rows={2}
          hint="A name, or the words not yet. Do not invent a stakeholder wheel."
        />
        <Field id="ppl-note" label="How we talk" value={note} onChange={setNote} />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function RadRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "3");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const evidence = snip(live, "mapping:evidence");
  const landscape = snip(live, "mapping:landscape");
  const facts = is
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = { v: 1, kind: "process", stage: "3", is, isNot, sign, note };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="Evidence is on the table. What you already run, who it is for, what the market needs."
      hole={
        evidence
          ? undefined
          : "The evidence cell is empty. Design Lab North will not pretend RAD is done. That hole stays visible."
      }
      doors={[
        { href: "/board/mapping/evidence", name: "Evidence", line: evidence || "Empty. Discovery has not been pinned." },
        { href: "/board/mapping/landscape", name: "Landscape", line: landscape || "The neighbourhood has not been named." },
      ]}
      lie="What would make it a lie to skip RAD — a line drawn with no evidence."
    >
      <form className="board-process-rad" onSubmit={onSubmit}>
        {evidence ? (
          <div className="board-process-rad-well">
            <p className="kicker">Evidence on the table</p>
            <p>{evidence}</p>
          </div>
        ) : (
          <div className="board-process-rad-void" role="status">
            <p className="kicker">Evidence</p>
            <p>Empty. Mapping has not pinned a fact. This hole stays until it does. Design Lab North will not invent a number to fill it.</p>
          </div>
        )}
        {facts.length > 1 ? (
          <ol className="board-process-rad-facts">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ol>
        ) : null}
        <div className="board-process-rad-grid">
          <Field
            id="rad-run"
            label="What you already run"
            value={is}
            onChange={setIs}
            rows={8}
            hint="One fact per line. Before a line is drawn."
          />
          <Field
            id="rad-lie"
            label="What we would be pretending"
            value={isNot}
            onChange={setIsNot}
            rows={8}
            hint="The wish that is trying to sit as a fact."
          />
          <Field
            id="rad-need"
            label="Who it is for, what the market needs"
            value={note}
            onChange={setNote}
          />
        </div>
        <Field
          id="rad-sign"
          label="Who can sign this as honest"
          value={sign}
          onChange={setSign}
          rows={2}
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function ConceptsRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "4");
  const [range, setRange] = useState(() => {
    const rows = (start.range || []).slice();
    while (rows.length < 3) rows.push("");
    return rows;
  });
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const idea = snip(live, "plot:big-idea");
  const filled = range.map((r) => r.trim()).filter(Boolean);
  const alreadyOne = processDirection(live?.snippets["process:stage-5"] || "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = {
      v: 1,
      kind: "process",
      stage: "4",
      is,
      isNot,
      sign,
      note,
      range: range.map((r) => r.trim()).filter(Boolean),
    };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="There is a range. Nothing has been crowned. Then we cut."
      hole={filled.length >= 2 ? undefined : "A wide pass with one line is already a candidate. Put at least two others on the table."}
      doors={[{ href: "/board/workbench/ideas", name: "Ideas through", line: snip(live, "workbench:ideas") || "Take a great idea through the stack, not around it." }]}
      lie="What would make it a lie to skip Initial Ideas — jumping to the one that felt loud."
    >
      <form className="board-process-concepts" onSubmit={onSubmit}>
        <p className="board-process-echo">A range, not one direction</p>
        <p className="kicker">Nothing is the answer yet. Then we cut.</p>
        {alreadyOne ? (
          <p className="board-process-candidate-chip">
            Candidate already holds one direction. If it got in too early, put it back in this list: <strong>{alreadyOne}</strong>
          </p>
        ) : null}
        {idea ? (
          <p className="board-process-candidate-chip">
            Big idea already on the book, as a candidate among others, not the winner: <strong>{idea}</strong>
          </p>
        ) : null}
        <ol className="board-process-range">
          {range.map((row, i) => (
            <li key={`range-${i}`}>
              <span className="board-process-range-n">{String(i + 1).padStart(2, "0")}</span>
              <label className="board-process-field" htmlFor={`range-${i}`}>
                <span className="visually-hidden">Direction {i + 1}</span>
                <textarea
                  id={`range-${i}`}
                  rows={2}
                  value={row}
                  onChange={(e) => setRange((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
                />
              </label>
            </li>
          ))}
        </ol>
        <button type="button" className="board-process-add" onClick={() => setRange((cur) => [...cur, ""])}>
          Add another direction
        </button>
        <Field
          id="con-early"
          label="What got in too early as the one"
          value={isNot}
          onChange={setIsNot}
          hint="Name it so we can put it back in the list."
        />
        <Field id="con-is" label="What the wide pass is seeing" value={is} onChange={setIs} rows={3} />
        <Field id="con-sign" label="Who holds the range" value={sign} onChange={setSign} rows={2} />
        <Field id="con-note" label="What we refused to generate" value={note} onChange={setNote} />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function CandidateRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "5");
  const [direction, setDirection] = useState(start.direction || "");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const positioning = snip(live, "plot:positioning");
  const landscape = snip(live, "mapping:landscape");
  const pose = Boolean(positioning) && !landscape;
  const fromRange = processRange(live?.snippets["process:stage-4"] || "");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = {
      v: 1,
      kind: "process",
      stage: "5",
      is,
      isNot,
      sign,
      note,
      direction,
    };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="One direction you can hold. Naming, positioning, the first system."
      hole={
        pose
          ? "Positioning is on the book with no landscape. That is a pose. The Concept cannot honestly complete until the neighbourhood is named."
          : direction.trim()
            ? undefined
            : "No direction is named. A range without a cut is still Initial Ideas."
      }
      doors={[
        { href: "/board/plot/proposition", name: "Proposition", line: snip(live, "plot:proposition") || "What they say it is, if they have said it." },
        { href: "/board/plot/positioning", name: "Positioning", line: positioning || "Empty. A pose until landscape sits beside it." },
        { href: "/board/mapping/landscape", name: "Landscape", line: landscape || "No neighbourhood snippet yet." },
      ]}
      lie="What would make it a lie to skip The Concept — still a list, or a pose with no landscape."
    >
      <form className="board-process-candidate" onSubmit={onSubmit}>
        <p className="board-process-echo">One direction from that range</p>
        {pose ? (
          <p className="board-process-pose">
            Positioning without landscape is a pose. Design Lab North will say so until the map has a line.
          </p>
        ) : null}
        {fromRange.length ? (
          <ol className="board-process-from-range" aria-label="The range we cut from">
            {fromRange.map((row) => (
              <li key={row} className={direction.trim() && row === direction.trim() ? "is-held" : undefined}>
                {row}
              </li>
            ))}
          </ol>
        ) : (
          <p className="board-process-from-range-empty">Initial Ideas has not held a range yet. This room is still one plate.</p>
        )}
        <div className="board-process-hold">
          <p className="kicker">The one we can hold</p>
          <label className="board-process-field" htmlFor="can-dir">
            <span className="visually-hidden">Direction</span>
            <textarea id="can-dir" rows={3} value={direction} onChange={(e) => setDirection(e.target.value)} />
          </label>
          <em>Not the range. One plate. If you still need a list, you are on Initial Ideas.</em>
        </div>
        <Field
          id="can-letgo"
          label="What we let go"
          value={isNot}
          onChange={setIsNot}
          hint="The directions that do not hold."
        />
        <Field id="can-is" label="First system" value={is} onChange={setIs} hint="Naming, and the first system that can sit here." />
        <Field id="can-sign" label="Who holds this direction" value={sign} onChange={setSign} rows={2} />
        <div className="board-process-letgo">
          <Field id="can-note" label="Said out loud" value={note} onChange={setNote} />
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function SystemRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "6");
  const [file, setFile] = useState(start.file || "");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const tools = snip(live, "workbench:tools");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = { v: 1, kind: "process", stage: "6", is, isNot, sign, note, file };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="There is a file, or a sitting. Description is not the build."
      hole={file.trim() ? undefined : "No file. If you cannot point at it, it is not the build."}
      doors={[{ href: "/board/workbench/tools", name: "Tools", line: tools || "The coal face. If the tool is not on that desk, this is still a wish." }]}
      still="A still of the thing being made — print, screen, or the sitting. Empty is a socket. Nothing is generated."
      lie="What would make it a lie to skip The Build — a description with no file."
    >
      <form className="board-process-system" onSubmit={onSubmit}>
        <p className="board-process-echo">The file. Made, not described.</p>
        <div className="board-process-file">
          <span className="board-process-file-fold" aria-hidden />
          <Field
            id="sys-file"
            label="The file"
            value={file}
            onChange={setFile}
            rows={2}
            hint="Point at the file or the sitting. Print, screen, or the session itself."
          />
        </div>
        <div className="board-process-system-split">
          <Field id="sys-is" label="What is actually being made" value={is} onChange={setIs} />
          <Field
            id="sys-not"
            label="What is still only a description"
            value={isNot}
            onChange={setIsNot}
          />
        </div>
        <Field id="sys-sign" label="Who has the file" value={sign} onChange={setSign} rows={2} />
        <Field id="sys-note" label="Production" value={note} onChange={setNote} />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function ImplementationRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "7");
  const [sandbox, setSandbox] = useState(start.sandbox || "");
  const [liveHost, setLiveHost] = useState(start.liveHost || live?.hostUrl || "");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const host = snip(live, "workbench:host");
  const named = Boolean(sandbox.trim() || liveHost.trim());

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = {
      v: 1,
      kind: "process",
      stage: "7",
      is,
      isNot,
      sign,
      note,
      sandbox,
      liveHost,
    };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="It has left the desk. Sandbox and live are named as two rooms."
      hole={named ? undefined : "Neither sandbox nor live is named. Implementation cannot honestly complete as a wish on this desk."}
      doors={[{ href: "/board/workbench/host", name: "Host", line: host || "The live plot they sit with while it grows." }]}
      still="A still of the live host, or the pack that left. Empty is a socket. Nothing is generated."
      lie="What would make it a lie to skip Implementation — still on the desk, pretending it left."
    >
      <form className="board-process-impl" onSubmit={onSubmit}>
        <p className="board-process-echo">Sandbox and live, named as two hosts.</p>
        <div className="board-process-hosts">
          <div className="board-process-host is-sandbox">
            <p className="board-process-window">Sandbox</p>
            <p className="kicker">Trying</p>
            <label className="board-process-field" htmlFor="imp-sand">
              <span>Where we try</span>
              <textarea id="imp-sand" rows={4} value={sandbox} onChange={(e) => setSandbox(e.target.value)} />
              <em>Trying a thing must not overwrite the public site.</em>
            </label>
          </div>
          <div className="board-process-host is-live">
            <p className="board-process-window">Live</p>
            <p className="kicker">Sitting with it</p>
            <label className="board-process-field" htmlFor="imp-live">
              <span>Where they sit with it</span>
              <textarea id="imp-live" rows={4} value={liveHost} onChange={(e) => setLiveHost(e.target.value)} />
              <em>Named. Not a field that flips the other off.</em>
            </label>
          </div>
        </div>
        <Field id="imp-is" label="What left the desk" value={is} onChange={setIs} />
        <Field
          id="imp-not"
          label="What is still on the desk pretending it left"
          value={isNot}
          onChange={setIsNot}
        />
        <Field id="imp-sign" label="Who put it out" value={sign} onChange={setSign} rows={2} />
        <Field id="imp-note" label="Notes from the session" value={note} onChange={setNote} />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

function GuardianshipRoom({ faculty, topic, live }: RoomProps) {
  const start = startProcess(live?.held || "", "8");
  const [look, setLook] = useState(start.look || "");
  const [often, setOften] = useState(start.often || "");
  const [is, setIs] = useState(start.is);
  const [isNot, setIsNot] = useState(start.isNot);
  const [sign, setSign] = useState(start.sign);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const fill = packSummary(held);
  const watched = Boolean(look.trim() && often.trim());

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ProcessPack = {
      v: 1,
      kind: "process",
      stage: "8",
      is,
      isNot,
      sign,
      note,
      look,
      often,
    };
    try {
      const body = writePack(pack);
      await holdCell(live.plot, live.cellKey, body);
      setHeld(body);
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ProcessChrome
      faculty={faculty}
      topic={topic}
      live={live}
      localFill={fill}
      leave="Someone looks, on a rhythm."
      hole={watched ? undefined : "No cadence."}
      doors={[
        { href: "/board/plot/ethics", name: "Ethics", line: snip(live, "plot:ethics") || "What must still hold as it grows." },
        { href: "/board/plot/standards", name: "Standards", line: snip(live, "plot:standards") || "The line we will not break later." },
        { href: "/board/workbench/host", name: "Host", line: "Private preview can reopen. Live stays up." },
      ]}
      lie="What would make it a lie to skip Guardianship — photographed and left."
    >
      <form className="board-process-guard" onSubmit={onSubmit}>
        <div className="board-process-ticks" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} className={i < ticksFor(often) ? "is-on" : undefined} />
          ))}
        </div>
        <div className="board-process-cadence">
          <label className="board-process-cadence-plate is-look" htmlFor="g-look">
            <span className="kicker">Who looks</span>
            <textarea
              id="g-look"
              rows={2}
              value={look}
              onChange={(e) => setLook(e.target.value)}
              placeholder="A person, not a mailbox"
            />
          </label>
          <i className="board-process-rule" aria-hidden />
          <div className="board-process-cadence-plate is-often">
            <span className="kicker">How often</span>
            <div className="board-process-rhythms" role="group" aria-label="Cadence">
              {RHYTHMS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={rhythmOn(often, r.id, r.label) ? "is-on" : undefined}
                  onClick={() => setOften(often === r.label ? "" : r.label)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <details className="board-process-more">
          <summary>The watch</summary>
          <Field id="g-is" label="What we keep coming in for" value={is} onChange={setIs} />
          <Field id="g-not" label="If they go quiet" value={isNot} onChange={setIsNot} />
          <Field id="g-sign" label="Who signs" value={sign} onChange={setSign} rows={2} />
          <Field id="g-note" label="How they get in" value={note} onChange={setNote} />
        </details>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </ProcessChrome>
  );
}

export function BoardProcess({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const stage = topic.id.replace("stage-", "");
  const props = { faculty, topic, live };
  if (stage === "2") return <PeopleRoom key="2" {...props} />;
  if (stage === "3") return <RadRoom key="3" {...props} />;
  if (stage === "4") return <ConceptsRoom key="4" {...props} />;
  if (stage === "5") return <CandidateRoom key="5" {...props} />;
  if (stage === "6") return <SystemRoom key="6" {...props} />;
  if (stage === "7") return <ImplementationRoom key="7" {...props} />;
  if (stage === "8") return <GuardianshipRoom key="8" {...props} />;
  return <ObjectRoom key="1" {...props} />;
}
