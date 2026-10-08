"use client";

import { FormEvent, useState, type ReactNode } from "react";
import Link from "next/link";
import { facultyGlyph, type Faculty } from "@/data/faculties";
import { frameworkTopics, type FrameworkTopic } from "@/data/framework-play";
import { boardAvenueHref, boardTopicHref } from "@/data/board-map";
import { boardSideLine, topicSheet } from "@/data/board-sheets";
import {
  APES_CARDS,
  APES_CYCLE,
  APES_INTERROGATE,
  APES_MINDSETS,
  APES_TASK_TYPES,
  apesMindset,
  apesTaskType,
  type ApesMindset,
} from "@/data/apes-play";
import { bitHref, emptyLead, withPlot, type BoardLive } from "@/data/board-live";
import { packSummary, readPack, writePack, type ApesLensPack } from "@/lib/board-pack";
import { BoardApesCombinations } from "@/components/BoardApesCombinations";
import "./BoardApes.css";

const PLOT_BITS = [
  { id: "mission", key: "plot:mission", label: "Mission" },
  { id: "people", key: "plot:people", label: "People" },
  { id: "personality", key: "plot:personality", label: "Personality" },
  { id: "ethics", key: "plot:ethics", label: "Ethics" },
] as const;

const LENS_PRIMARY: Record<string, string[]> = {
  analytical: ["mission", "ethics"],
  practical: ["people", "mission"],
  emotional: ["personality", "people"],
  social: ["people", "ethics"],
};

const RANGE = [
  { id: "does", name: "What it does" },
  { id: "says", name: "What it says" },
  { id: "looks", name: "What it looks like" },
  { id: "behaves", name: "How it behaves" },
];

const CARD_READS: Record<string, string[]> = {
  apes: ["plot:mission"],
  context: ["plot:people", "plot:location"],
  drivers: ["plot:purpose", "plot:personality"],
  risks: ["plot:ethics", "plot:standards"],
  options: ["plot:people"],
  impact: ["plot:mission", "plot:promise"],
};

const STATION_READS: Record<string, string> = {
  analyse: "plot:mission",
  probe: "plot:people",
  evaluate: "plot:ethics",
  synthesize: "plot:personality",
};

function snip(live: BoardLive | null | undefined, key: string, n = 120): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > n ? `${line.slice(0, n - 1)}…` : line;
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

function GenerateSocket({ line }: { line: string }) {
  return (
    <p className="board-gen">
      <button type="button" disabled>
        Talk to this cell
      </button>
      <span>{line}</span>
    </p>
  );
}

function SocialEngineDoor({ live }: { live: BoardLive | null }) {
  const cultural = snip(live, "mapping:cultural");
  const plot = live?.plot;
  return (
    <aside className={cultural ? "apes-engine chamfer" : "apes-engine chamfer is-unlit"}>
      <p className="kicker">Social engine</p>
      <Link href={withPlot("/board/mapping/cultural", plot)}>Cultural / Social</Link>
      <p>A.P.E.S. Social looking at culture around this plot. Exclusive to that cell.</p>
      {cultural ? <p>{cultural}</p> : <p>Unlit until that room is held.</p>}
    </aside>
  );
}

function Clover({ plot, compact }: { plot?: string; compact?: boolean }) {
  return (
    <ul className={compact ? "apes-clover is-compact" : "apes-clover"}>
      {APES_MINDSETS.map((m) => (
        <li key={m.id}>
          <Link href={withPlot(boardTopicHref("apes", m.id), plot)} className="apes-mind chamfer">
            <span className="apes-letter">{m.letter}</span>
            <strong>{m.name}</strong>
            <span>{m.ask}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PlotBits({
  live,
  primary,
}: {
  live: BoardLive | null;
  primary: string[];
}) {
  const plot = live?.plot;
  return (
    <ul className="apes-looks-plot">
      {PLOT_BITS.map((bit) => {
        const body = snip(live, bit.key);
        const isPrimary = primary.includes(bit.id);
        const cls = [
          "apes-bit chamfer",
          isPrimary ? "is-primary" : "",
          body ? "is-held" : "is-empty",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <li key={bit.id}>
            <Link href={bitHref(bit.id, plot)} className={cls}>
              <span className="kicker">
                {isPrimary ? "This lens is looking at" : "Also on the table"}
              </span>
              <strong>{bit.label}</strong>
              <span>{body || (live ? `Not on ${live.plotName} yet.` : "No plot on this account yet.")}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ApesChrome({
  faculty,
  topic,
  live,
  roomClass,
  lede,
  children,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  roomClass: string;
  lede: string;
  children: ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const topics = frameworkTopics(faculty.id);
  const plot = live?.plot;
  const related = live?.related || [];
  return (
    <article className={`board-room is-apes ${roomClass}`}>
      <header className="board-room-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={facultyGlyph(faculty.id)} alt="" />
        <div>
          <p className="kicker">
            {faculty.n} {faculty.name}
          </p>
          <h1>{sheet?.name || topic.name}</h1>
          <p className="lede">{lede}</p>
        </div>
      </header>
      <p className="board-side">{boardSideLine(sheet?.side || "think")}</p>
      {live ? (
        <p className="board-plot-line">
          Reading {live.plotName}
          {live.hostUrl ? (
            <>
              {" · "}
              <a href={live.hostUrl} target="_blank" rel="noreferrer">
                {live.hostUrl.replace(/^https?:\/\//, "")}
              </a>
            </>
          ) : null}
          <span> · {live.status}</span>
        </p>
      ) : (
        <p className="board-plot-line">No plot on this account yet. The lens is ready when a site is on the book.</p>
      )}
      <nav className="board-horizon" aria-label="A.P.E.S. rooms">
        {topics.map((t) => (
          <Link
            key={t.id}
            href={withPlot(boardTopicHref(faculty.id, t.id), plot)}
            className={t.id === topic.id ? "is-on" : undefined}
          >
            {t.name}
          </Link>
        ))}
      </nav>
      {children}
      {related.length ? (
        <>
          <h2>From the rest of the plot</h2>
          <ul className="board-related">
            {related.map((row) => (
              <li key={row.href + row.label}>
                <Link href={row.href}>
                  <strong>{row.label}</strong>
                  <span>{row.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <GenerateSocket line="Studio key later. Pre-prompt from this cell, the plot book, and stills. A person still decides." />
      {sheet ? (
        <details className="board-holds">
          <summary>What this cell holds</summary>
          {sheet.meaning.map((p) => (
            <p key={p} className="body">
              {p}
            </p>
          ))}
        </details>
      ) : null}
      <p className="actions">
        <Link className="act act-line" href={withPlot(boardAvenueHref(faculty.id), plot)}>
          Back to {faculty.name}
        </Link>
      </p>
    </article>
  );
}

function LensRoom({
  faculty,
  topic,
  live,
  mindset,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  mindset: ApesMindset;
}) {
  const existing = readPack(live?.held || "");
  const start: ApesLensPack =
    existing?.kind === "apes-lens"
      ? existing
      : {
          v: 1,
          kind: "apes-lens",
          mindset: mindset.id,
          see: live?.held?.trim() && !live.held.trim().startsWith("{") ? live.held.trim() : "",
          refuse: "",
        };
  const [see, setSee] = useState(start.see);
  const [refuse, setRefuse] = useState(start.refuse);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const primary = LENS_PRIMARY[mindset.id] || ["mission"];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ApesLensPack = { v: 1, kind: "apes-lens", mindset: mindset.id, see, refuse };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass={`is-lens is-${mindset.id}`} lede={mindset.ask}>
      <p className="apes-ask">{mindset.ask}</p>
      <p className="apes-note">
        A lens, not a person. Never label someone as an {mindset.name} thinker.
      </p>
      <p className="body">{mindset.body}</p>
      <p className="apes-fail">
        <strong>Left alone.</strong> {mindset.fail}
      </p>
      <h2>This plot through {mindset.name}</h2>
      <p className="apes-note">
        Identity bits are the material. The lens looks at them; it does not replace them.
      </p>
      <PlotBits live={live} primary={primary} />
      {mindset.id === "social" ? <SocialEngineDoor live={live} /> : null}
      <h2>Questions</h2>
      <ol className="apes-questions">
        {mindset.questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      <section className={empty ? "board-now is-empty" : "board-now"}>
        <p className="kicker">{empty ? "This lens has not spoken" : "What this lens sees"}</p>
        <p className="body">
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, mindset.name, (live.related || []).length > 0)
              : "Switch the lens on when the moment matters.")}
        </p>
      </section>
      <form className="apes-lens-pack" onSubmit={onSubmit}>
        <label className="apes-field is-see" htmlFor={`apes-see-${mindset.id}`}>
          <span>What this lens sees</span>
          <textarea
            id={`apes-see-${mindset.id}`}
            rows={4}
            value={see}
            onChange={(e) => setSee(e.target.value)}
          />
          <em>On this plot. Not a type of person.</em>
        </label>
        <label className="apes-field" htmlFor={`apes-refuse-${mindset.id}`}>
          <span>What would make it a lie to ship</span>
          <textarea
            id={`apes-refuse-${mindset.id}`}
            rows={4}
            value={refuse}
            onChange={(e) => setRefuse(e.target.value)}
          />
          <em>Because this lens has not spoken, or because it refuses.</em>
        </label>
        {live ? (
          <p className="board-save">
            <button type="submit" className="house-add" disabled={pending}>
              {pending ? "Holding…" : "Hold this room"}
            </button>
            {error ? <span className="board-infer">{error}</span> : null}
          </p>
        ) : null}
      </form>
      <h2>The other three</h2>
      <Clover plot={live?.plot} compact />
    </ApesChrome>
  );
}

function CreativeRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const mission = snip(live, "plot:mission");
  const task = apesTaskType("creative");
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-creative" lede={task?.body || topic.body}>
      <p className="body">{task?.move}</p>
      <p className="apes-note">Range is not the answer. Walk each response through all four. Do not pick yet.</p>
      <div className="apes-combo-work">
        <p className="kicker">The work on the table</p>
        {mission ? <strong>{mission}</strong> : <p className="apes-note">No mission line yet. Generate range from what is actually on the plot.</p>}
      </div>
      <ul className="apes-range">
        {RANGE.map((r) => (
          <li key={r.id} className="chamfer">
            <strong>{r.name}</strong>
            <span>Ask it of this plot, then take the answer through Analytical, Practical, Emotional, and Social.</span>
          </li>
        ))}
      </ul>
      <h2>Walk each through all four</h2>
      <Clover plot={live?.plot} compact />
    </ApesChrome>
  );
}

function CriticalRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const task = apesTaskType("critical");
  const mission = snip(live, "plot:mission");
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-critical" lede={task?.body || topic.body}>
      <p className="body">{task?.move}</p>
      <p className="apes-note">Taste is not the test. For and against, four times. Keep what still stands.</p>
      {mission ? (
        <div className="apes-combo-work">
          <p className="kicker">Against this work</p>
          <strong>{mission}</strong>
        </div>
      ) : null}
      <ul className="apes-critical">
        {APES_MINDSETS.map((m) => (
          <li key={m.id} className="chamfer">
            <span className="apes-letter">{m.letter}</span>
            <div>
              <b>For</b>
              <span>{m.strong[0]}</span>
            </div>
            <div>
              <b>Against</b>
              <span>{m.fail}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="apes-note">Name the lens that has not spoken, then enter it.</p>
      <Clover plot={live?.plot} compact />
    </ApesChrome>
  );
}

function DecisionRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const task = apesTaskType("decision");
  const mission = snip(live, "plot:mission");
  const plot = live?.plot;
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-decision" lede={task?.body || topic.body}>
      <p className="body">{task?.move}</p>
      <p className="apes-note">Hold the choice across all four, not the loudest seat. Record why on the combinations plate.</p>
      {mission ? (
        <div className="apes-combo-work">
          <p className="kicker">The choice on the table</p>
          <strong>{mission}</strong>
        </div>
      ) : null}
      <ul className="apes-decide">
        <li>
          <p className="kicker">What if we choose this</p>
          <p>Walk Analytical, Practical, Emotional, and Social. If one is silent, it is not a decision yet.</p>
        </li>
        <li>
          <p className="kicker">What if we refuse</p>
          <p>The other path still has to survive all four. A veto from one seat is not 360.</p>
        </li>
      </ul>
      <p className="actions">
        <Link className="act act-line" href={withPlot(boardTopicHref("apes", "combinations"), plot)}>
          Pin which combo this choice sits in
        </Link>
      </p>
      <Clover plot={plot} compact />
    </ApesChrome>
  );
}

function FullRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const task = apesTaskType("full");
  const plot = live?.plot;
  const quadrants = [
    { m: APES_MINDSETS[0], key: "plot:mission" },
    { m: APES_MINDSETS[1], key: "plot:people" },
    { m: APES_MINDSETS[2], key: "plot:personality" },
    { m: APES_MINDSETS[3], key: "plot:ethics" },
  ];
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-full" lede={task?.body || topic.body}>
      <p className="body">{task?.move}</p>
      <p className="apes-note">
        Full 360 is the last row of the combinations plate. Unfinished until all four have had a turn.
      </p>
      <ul className="apes-hold-four">
        {quadrants.map((row) => {
          const body = snip(live, row.key);
          return (
            <li key={row.m.id} className={body ? "chamfer" : "chamfer is-silent"}>
              <span className="apes-letter">{row.m.letter}</span>
              <strong>{row.m.name}</strong>
              <span>{body || "This letter has not spoken on this plot."}</span>
              <Link href={withPlot(boardTopicHref("apes", row.m.id), plot)}>Enter {row.m.name}</Link>
            </li>
          );
        })}
      </ul>
      <p className="actions">
        <Link className="act act-line" href={withPlot(boardTopicHref("apes", "combinations"), plot)}>
          Last row of the combinations plate
        </Link>
      </p>
    </ApesChrome>
  );
}

function CycleRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const [stage, setStage] = useState("launch");
  const current = APES_CYCLE.find((s) => s.id === stage) || APES_CYCLE[0];
  const standingOnReflect = current.id === "reflect" || current.id === "land";
  const mission = snip(live, "plot:mission");
  const plot = live?.plot;
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-cycle" lede="Launch to landing. Reflection consolidates; it does not reopen.">
      <p className="apes-note">
        Bounded tasks. Known context, defined time, clear purpose. This is attention, not a method of production.
      </p>
      <div className="apes-cycle-path" role="tablist" aria-label="Working cycle">
        {APES_CYCLE.map((s) => {
          const closed = standingOnReflect && (s.id === "launch" || s.id === "action");
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === current.id}
              className={[
                "apes-cycle-step chamfer",
                s.id === current.id ? "is-on" : "",
                closed ? "is-closed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setStage(s.id)}
            >
              <span className="apes-n">{s.n}</span>
              <strong>{s.name}</strong>
              <span>{s.job}</span>
            </button>
          );
        })}
      </div>
      <section className="apes-cycle-panel">
        <p className="kicker">Standing on</p>
        <h2>
          {current.n}. {current.name}
        </h2>
        <p className="body">{current.job}</p>
        {current.id === "launch" ? (
          <>
            <p className="apes-fail">Do not solve it yet. Name the kind of thinking and set limits.</p>
            {mission ? <strong>{mission}</strong> : <p className="apes-note">Frame from the plot’s mission when it is written.</p>}
          </>
        ) : null}
        {current.id === "action" ? (
          <>
            <p className="apes-note">Range first. An idea that stays in one mindset is unfinished.</p>
            <Clover plot={plot} compact />
          </>
        ) : null}
        {current.id === "turnaround" ? (
          <p className="apes-note">
            Stop generating when insight, tension, or a real choice has appeared. Then{" "}
            <Link href={withPlot(boardTopicHref("apes", "combinations"), plot)}>pin the combination</Link>.
          </p>
        ) : null}
        {current.id === "reflect" ? (
          <>
            <p className="apes-fail">Reflection consolidates. It does not reopen the brief.</p>
            <ol className="apes-collect">
              {APES_CYCLE.filter((s) => s.id !== "reflect" && s.id !== "land").map((s) => (
                <li key={s.id}>
                  <strong>
                    {s.n}. {s.name}
                  </strong>
                  <span>{s.job}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}
        {current.id === "land" ? (
          <>
            <p className="apes-note">Return to delivery. Keep only what holds across all four.</p>
            <Clover plot={plot} compact />
          </>
        ) : null}
      </section>
    </ApesChrome>
  );
}

function CardsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const [openTo, setOpenTo] = useState(0);
  return (
    <ApesChrome faculty={faculty} topic={topic} live={live} roomClass="is-cards" lede="Six honest questions until the context is understood.">
      <p className="apes-note">Do not skip to so-what. Keep the questions honest until the context is actually understood.</p>
      <ul className="apes-card-row">
        {APES_CARDS.map((card, i) => {
          const locked = i > openTo;
          const on = i === openTo;
          const reads = (CARD_READS[card.id] || []).map((key) => snip(live, key)).filter(Boolean);
          return (
            <li
              key={card.id}
              className={["apes-card chamfer", locked ? "is-locked" : "", on ? "is-on" : ""].filter(Boolean).join(" ")}
            >
              <span className="kicker">{String(i + 1).padStart(2, "0")}</span>
              <strong>{card.name}</strong>
              <span>{card.ask}</span>
              {locked ? (
                <p>Locked until the cards before this are understood.</p>
              ) : (
                <>
                  <ol>
                    {card.prompts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                  {reads[0] ? <p>{reads[0]}</p> : <p>Answer from this plot. Do not invent a line.</p>}
                  {i < APES_CARDS.length - 1 ? (
                    <button type="button" className="apes-card-go chamfer" onClick={() => setOpenTo(i + 1)}>
                      This is understood
                    </button>
                  ) : (
                    <p>So what, for this plot — only after the five before it.</p>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </ApesChrome>
  );
}

function InterrogationRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const [station, setStation] = useState("analyse");
  return (
    <ApesChrome
      faculty={faculty}
      topic={topic}
      live={live}
      roomClass="is-probe"
      lede="Analyse, probe, evaluate, synthesise — the human stays sovereign."
    >
      <p className="apes-note">
        These letters are not the mindsets. They are how an LLM should walk context later. Do not fake talk-to.
      </p>
      <div className="apes-interrogate" role="tablist" aria-label="Interrogation">
        {APES_INTERROGATE.map((s) => {
          const body = snip(live, STATION_READS[s.id] || "plot:mission");
          const on = s.id === station;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? "apes-station chamfer is-on" : "apes-station chamfer"}
              onClick={() => setStation(s.id)}
            >
              <span className="apes-n">{s.n}</span>
              <strong>{s.id === "synthesize" ? "Synthesise" : s.name}</strong>
              <span>{s.job}</span>
              {on ? <span>{body || "Nothing on this plot for this step yet."}</span> : null}
            </button>
          );
        })}
      </div>
      <p className="apes-sovereign">The decision stays with a person. Generate does not run from here.</p>
    </ApesChrome>
  );
}

export function BoardApesTopic({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  initialScale?: string;
  live?: BoardLive | null;
}) {
  const plotLive = live ?? null;
  const mindset = apesMindset(topic.id);
  if (mindset) {
    return <LensRoom faculty={faculty} topic={topic} live={plotLive} mindset={mindset} />;
  }
  if (topic.id === "combinations") {
    return (
      <ApesChrome
        faculty={faculty}
        topic={topic}
        live={plotLive}
        roomClass="is-combo"
        lede="Which combo is this work sitting in. Not a personality quiz."
      >
        <BoardApesCombinations live={plotLive} />
      </ApesChrome>
    );
  }
  if (topic.id === "cycle") return <CycleRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "cards") return <CardsRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "interrogation") return <InterrogationRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "creative") return <CreativeRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "critical") return <CriticalRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "decision") return <DecisionRoom faculty={faculty} topic={topic} live={plotLive} />;
  if (topic.id === "full") return <FullRoom faculty={faculty} topic={topic} live={plotLive} />;
  const task = apesTaskType(topic.id);
  return (
    <ApesChrome faculty={faculty} topic={topic} live={plotLive} roomClass="is-task" lede={task?.body || topic.body}>
      <p className="body">{APES_TASK_TYPES[0]?.move}</p>
      <Clover plot={plotLive?.plot} />
    </ApesChrome>
  );
}
