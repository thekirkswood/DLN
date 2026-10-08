"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { type Faculty } from "@/data/faculties";
import { type FrameworkTopic } from "@/data/framework-play";
import { APES_COMPASS, CUSTOMER_SEATS, LANDSCAPE_TOKENS } from "@/data/board-map";
import { SCALES, SCALE_FLAG_READ, readScaleId, type ScaleId } from "@/data/campus";
import { topicSheet } from "@/data/board-sheets";
import { emptyLead, withPlot, type BoardLive } from "@/data/board-live";
import { cellKind } from "@/data/board-kinds";
import {
  emptyAdvocate,
  emptyLaw,
  legacyLandscape,
  packFilled,
  packSummary,
  readPack,
  seatNameFromHeld,
  writePack,
  type AdvocatePerson,
  type AdvocatesPack,
  type CommentatorsPack,
  type CulturalPack,
  type EvidencePack,
  type LandscapeFieldPack,
  type LawRule,
  type LawsPack,
  type OpinionPack,
  type RelLink,
  type RelNode,
  type RelSort,
  type RelationsPack,
  type ScalePack,
  type SeatPack,
  type TrendsPack,
} from "@/lib/board-pack";

const MAP_DOORS: { id: string; name: string; href: string }[] = [
  { id: "landscape", name: "Landscape", href: "/board/mapping/landscape" },
  ...LANDSCAPE_TOKENS.map((t) => ({ id: t.id, name: t.label, href: t.href })),
  { id: "relations", name: "Relationships", href: "/board/mapping/relations" },
  { id: "evidence", name: "Evidence", href: "/board/mapping/evidence" },
  { id: "scale", name: "Scale", href: "/board/mapping/scale" },
  { id: "audience", name: "Customers", href: "/board/mapping/audience" },
];

const DEPTH = [
  { id: "internal", label: "Internal" },
  { id: "prospects", label: "Prospects" },
  { id: "sector", label: "Sector" },
  { id: "world", label: "Rest of world" },
] as const;

const REL_SORTS: { id: RelSort; label: string }[] = [
  { id: "person", label: "Person" },
  { id: "product", label: "Product" },
  { id: "place", label: "Place" },
];


function snippetLine(live: BoardLive | null, key: string, fallback: string): string {
  const body = live?.snippets[key]?.trim();
  if (!body) return fallback;
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > 88 ? `${line.slice(0, 87)}…` : line;
}

function cellSnippet(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  return packSummary(body) || body.split("\n")[0].trim();
}

function clip(line: string, n = 72): string {
  const t = line.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

function MappingChrome({
  faculty,
  topic,
  live,
  still,
  children,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  still: string;
  children: React.ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const plot = live?.plot;
  const related = live?.related || [];
  if (!sheet) return null;
  return (
    <article className="board-room is-sheet is-map">
      <header className="board-map-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
          {live?.seat ? ` · Seat ${live.seat}` : ""}
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
        <ul className="board-topic-doors">
          {MAP_DOORS.map((t) => (
            <li key={t.id}>
              <Link
                href={withPlot(t.href, plot)}
                aria-current={t.id === topic.id ? "page" : undefined}
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="board-map-still">
          {still} Generate later.
        </p>
      </details>
    </article>
  );
}

function Horizon({ topicId, plot }: { topicId: string; plot?: string }) {
  return (
    <nav className="board-horizon board-map-horizon" aria-label="Landscape along the top of the table">
      <Link
        href={withPlot("/board/mapping/landscape", plot)}
        className={topicId === "landscape" ? "is-on" : undefined}
      >
        Landscape
      </Link>
      {LANDSCAPE_TOKENS.map((t) => (
        <Link
          key={t.id}
          href={withPlot(t.href, plot)}
          className={t.id === topicId ? "is-on" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  rows,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="board-field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        rows={rows || 4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
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
    <p className="board-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function Now({
  empty,
  kicker,
  body,
}: {
  empty: boolean;
  kicker: string;
  body: string;
}) {
  return (
    <section className={empty ? "board-now is-empty" : "board-now"}>
      <p className="kicker">{kicker}</p>
      <p className="body">{body}</p>
    </section>
  );
}

export function BoardMapping({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const kind = cellKind(faculty.id, topic.id);
  if (kind === "seat") return <SeatRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "scale") return <ScaleRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "evidence") return <EvidenceRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "relations") return <RelationsRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "advocates") return <AdvocatesRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "commentators") return <CommentatorsRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "trends") return <TrendsRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "cultural") return <CulturalRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "laws") return <LawsRoom faculty={faculty} topic={topic} live={live} />;
  if (kind === "opinion") return <OpinionRoom faculty={faculty} topic={topic} live={live} />;
  return <FieldRoom faculty={faculty} topic={topic} live={live} />;
}

function padPeople(people: AdvocatePerson[]): AdvocatePerson[] {
  const next = people.slice(0, 6).map((p) => ({
    who: p.who || "",
    wear: p.wear || "",
    hear: p.hear || "",
    never: p.never || "",
  }));
  while (next.length < 3) next.push(emptyAdvocate());
  return next;
}

function startAdvocates(raw: string): AdvocatesPack {
  const existing = readPack(raw);
  if (existing?.kind === "advocates") {
    return { v: 1, kind: "advocates", people: padPeople(existing.people || []) };
  }
  const old = legacyLandscape(raw);
  const first = old.who || old.does || old.hear ? { who: old.who, wear: old.does, hear: old.hear, never: "" } : emptyAdvocate();
  return { v: 1, kind: "advocates", people: padPeople([first]) };
}

function AdvocatesRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const start = startAdvocates(live?.held || "");
  const [people, setPeople] = useState(start.people);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function setPerson(i: number, patch: Partial<AdvocatePerson>) {
    setPeople((rows) => rows.map((row, n) => (n === i ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: AdvocatesPack = { v: 1, kind: "advocates", people };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const named = people.filter((p) => p.who.trim());
  const seatDoors = overlappingSeats(live, named.map((p) => p.who));

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of someone who already wears this work. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <form className="board-map-gallery" onSubmit={onSubmit}>
        {people.map((person, i) => (
          <article
            key={`adv-${i}`}
            className={person.who.trim() ? "board-map-person is-held" : "board-map-person is-empty"}
          >
            <label htmlFor={`adv-who-${i}`}>
              <span className="kicker">{i + 1}</span>
              <input
                id={`adv-who-${i}`}
                className="board-map-person-name"
                type="text"
                value={person.who}
                onChange={(e) => setPerson(i, { who: e.target.value })}
                placeholder="A person"
              />
            </label>
            <label htmlFor={`adv-wear-${i}`}>
              <span className="kicker">They wear</span>
              <textarea
                id={`adv-wear-${i}`}
                rows={2}
                value={person.wear}
                onChange={(e) => setPerson(i, { wear: e.target.value })}
                placeholder="Of this brand"
              />
            </label>
            <details>
              <summary>Where / never</summary>
              <Field
                id={`adv-hear-${i}`}
                label="Where we hear them"
                value={person.hear}
                onChange={(v) => setPerson(i, { hear: v })}
                rows={2}
              />
              <Field
                id={`adv-never-${i}`}
                label="Must never say"
                value={person.never}
                onChange={(v) => setPerson(i, { never: v })}
                rows={2}
              />
            </details>
          </article>
        ))}
        {people.length < 6 ? (
          <button
            type="button"
            className="board-map-add"
            onClick={() => setPeople((rows) => [...rows, emptyAdvocate()])}
          >
            Another
          </button>
        ) : null}
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      {seatDoors.length ? (
        <p className="board-map-doors">
          {seatDoors.map((s) => (
            <Link key={s.n} className="act act-line" href={withPlot(`/board/mapping/audience?seat=${s.n}`, live?.plot)}>
              Seat {s.n}
              {s.name ? ` · ${s.name}` : ""}
            </Link>
          ))}
        </p>
      ) : null}
    </MappingChrome>
  );
}

function overlappingSeats(live: BoardLive | null, names: string[]): { n: string; name: string }[] {
  const needles = names.map((n) => n.trim().toLowerCase()).filter((n) => n.length > 2);
  if (!needles.length) return [];
  const out: { n: string; name: string }[] = [];
  for (let i = 1; i <= 8; i += 1) {
    const raw = live?.snippets[`mapping:audience:${i}`] || "";
    const pack = readPack(raw);
    const hay = pack?.kind === "seat" ? `${pack.name} ${pack.who}` : packSummary(raw);
    const low = hay.trim().toLowerCase();
    if (low.length < 3) continue;
    if (needles.some((n) => low.includes(n) || n.includes(low))) {
      out.push({ n: String(i), name: seatNameFromHeld(raw) });
    }
  }
  return out;
}

function startCommentators(raw: string): CommentatorsPack {
  const existing = readPack(raw);
  if (existing?.kind === "commentators") return existing;
  const old = legacyLandscape(raw);
  return {
    v: 1,
    kind: "commentators",
    who: old.who,
    from: old.hear,
    story: old.does,
    skip: "",
    sector: "",
    world: "",
  };
}

function CommentatorsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startCommentators(live?.held || "");
  const [who, setWho] = useState(start.who);
  const [from, setFrom] = useState(start.from);
  const [story, setStory] = useState(start.story);
  const [skip, setSkip] = useState(start.skip);
  const [sector, setSector] = useState(start.sector);
  const [world, setWorld] = useState(start.world);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: CommentatorsPack = { v: 1, kind: "commentators", who, from, story, skip, sector, world };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the room they already talk in. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now
        empty={empty}
        kicker={empty ? "Not on this plot yet" : "Who speaks about it"}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
            : "Press, peers, a loud neighbour. They do not have to wear it.")
        }
      />
      <form className="board-map-voices" onSubmit={onSubmit}>
        <div className="board-map-voice">
          <Field id="com-who" label="Who talks" value={who} onChange={setWho} rows={3} hint="Press, peers, a neighbour. Not an advocate." />
          <Field id="com-from" label="From where" value={from} onChange={setFrom} rows={3} />
        </div>
        <div className="board-map-quote">
          <Field
            id="com-story"
            label="The story already in the room"
            value={story}
            onChange={setStory}
            rows={6}
            hint="The line they carry is rarely yours."
          />
          <Field
            id="com-skip"
            label="What we do not bother correcting"
            value={skip}
            onChange={setSkip}
            rows={3}
          />
        </div>
        <div className="board-map-depth">
          <p className="kicker">Depth — not extra routes</p>
          <Field id="com-sector" label="Sector" value={sector} onChange={setSector} rows={3} />
          <Field id="com-world" label="Rest of world" value={world} onChange={setWorld} rows={3} />
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startTrends(raw: string): TrendsPack {
  const existing = readPack(raw);
  if (existing?.kind === "trends") return existing;
  const old = legacyLandscape(raw);
  return { v: 1, kind: "trends", moving: old.who, noise: old.does, refuse: "", object: old.hear };
}

function TrendsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startTrends(live?.held || "");
  const [moving, setMoving] = useState(start.moving);
  const [noise, setNoise] = useState(start.noise);
  const [refuse, setRefuse] = useState(start.refuse);
  const [object, setObject] = useState(start.object);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: TrendsPack = { v: 1, kind: "trends", moving, noise, refuse, object };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of one object in the world that already shows the movement. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now
        empty={empty}
        kicker={empty ? "Not on this plot yet" : "What is moving"}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
            : "Form in this neighbourhood. Not a moodboard raid.")
        }
      />
      <form className="board-map-strip" onSubmit={onSubmit}>
        <Field id="tr-moving" label="What is moving" value={moving} onChange={setMoving} hint="Point at it in this neighbourhood." />
        <Field id="tr-noise" label="What is noise" value={noise} onChange={setNoise} hint="A feed is not a movement." />
        <Field id="tr-refuse" label="What this brand will not chase" value={refuse} onChange={setRefuse} />
        <Field
          id="tr-object"
          label="One object that already shows it"
          value={object}
          onChange={setObject}
          hint="In the world. Name it."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startCultural(raw: string): CulturalPack {
  const existing = readPack(raw);
  if (existing?.kind === "cultural") return existing;
  const old = legacyLandscape(raw);
  return {
    v: 1,
    kind: "cultural",
    who: old.who,
    shame: old.hear,
    belong: old.does,
    a: "",
    p: "",
    e: "",
    s: "",
  };
}

function CulturalRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startCultural(live?.held || "");
  const [who, setWho] = useState(start.who);
  const [shame, setShame] = useState(start.shame);
  const [belong, setBelong] = useState(start.belong);
  const [a, setA] = useState(start.a);
  const [p, setP] = useState(start.p);
  const [e, setE] = useState(start.e);
  const [s, setS] = useState(start.s);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: CulturalPack = { v: 1, kind: "cultural", who, shame, belong, a, p, e, s };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const apes = [
    { id: "a", letter: "A", name: "Analytical", value: a, set: setA },
    { id: "p", letter: "P", name: "Practical", value: p, set: setP },
    { id: "e", letter: "E", name: "Emotional", value: e, set: setE },
    { id: "s", letter: "S", name: "Social", value: s, set: setS },
  ] as const;

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the culture this work walks into. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now
        empty={empty}
        kicker={empty ? "Not on this plot yet" : "How it is read between people"}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
            : "Rituals, language, belonging. Not a Swarm hive.")
        }
      />
      <form className="board-map-culture" onSubmit={onSubmit}>
        <div className="board-map-culture-main">
          <Field id="cu-who" label="Who is in the culture around this work" value={who} onChange={setWho} />
          <Field id="cu-shame" label="What would shame it" value={shame} onChange={setShame} />
          <Field id="cu-belong" label="What would let it belong" value={belong} onChange={setBelong} />
        </div>
        <div className="board-map-apes" role="group" aria-label="How A.P.E.S. would look at that">
          {apes.map((lens) => (
            <label key={lens.id} className="board-map-lens" htmlFor={`cu-${lens.id}`}>
              <span>
                <Link href={withPlot(APES_COMPASS.find((c) => c.letter === lens.letter)?.href || "/board/apes", live?.plot)}>
                  {lens.letter}
                </Link>{" "}
                {lens.name}
              </span>
              <textarea id={`cu-${lens.id}`} rows={4} value={lens.value} onChange={(ev) => lens.set(ev.target.value)} />
            </label>
          ))}
        </div>
        <p className="board-map-engine is-unlit">
          <span className="kicker">Social engine</span>
          <span>Later. Exclusive to this cell. Not a hive, not a caption mill.</span>
        </p>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startLaws(raw: string): LawsPack {
  const existing = readPack(raw);
  if (existing?.kind === "laws") {
    const rules = existing.rules?.length ? existing.rules : [emptyLaw()];
    return { v: 1, kind: "laws", rules };
  }
  const old = legacyLandscape(raw);
  const first =
    old.who || old.does || old.hear
      ? { rule: old.does || old.who, whose: old.who && old.does ? old.who : "", breaks: old.hear, match: "" }
      : emptyLaw();
  return { v: 1, kind: "laws", rules: [first] };
}

function LawsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startLaws(live?.held || "");
  const [rules, setRules] = useState<LawRule[]>(start.rules);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();

  function setRule(i: number, patch: Partial<LawRule>) {
    setRules((rows) => rows.map((row, n) => (n === i ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: LawsPack = { v: 1, kind: "laws", rules };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the code, plate, or room that binds this work. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now
        empty={empty}
        kicker={empty ? "Not on this plot yet" : "What the work may not ignore"}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
            : "Regulation, house rules, codes. Not a vibe.")
        }
      />
      <form className="board-map-stack" onSubmit={onSubmit}>
        {rules.map((row, i) => (
          <fieldset key={`law-${i}`} className={row.rule.trim() ? "board-map-rule is-held" : "board-map-rule"}>
            <legend>Rule {i + 1}</legend>
            <Field id={`law-rule-${i}`} label="The rule" value={row.rule} onChange={(v) => setRule(i, { rule: v })} rows={3} />
            <Field id={`law-whose-${i}`} label="Whose rule" value={row.whose} onChange={(v) => setRule(i, { whose: v })} rows={2} />
            <Field
              id={`law-breaks-${i}`}
              label="What breaks if we skip it"
              value={row.breaks}
              onChange={(v) => setRule(i, { breaks: v })}
              rows={3}
            />
            <Field
              id={`law-match-${i}`}
              label="Ethics and standards it must match"
              value={row.match}
              onChange={(v) => setRule(i, { match: v })}
              rows={3}
              hint="The bits on the left. Name them."
            />
          </fieldset>
        ))}
        <p className="board-map-more">
          <button type="button" className="act act-line" onClick={() => setRules((rows) => [...rows, emptyLaw()])}>
            Another rule
          </button>
          <Link className="act act-line" href={withPlot("/board/plot/ethics", live?.plot)}>
            Ethics
          </Link>
          <Link className="act act-line" href={withPlot("/board/plot/standards", live?.plot)}>
            Standards
          </Link>
        </p>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startOpinion(raw: string): OpinionPack {
  const existing = readPack(raw);
  if (existing?.kind === "opinion") return existing;
  const old = legacyLandscape(raw);
  return { v: 1, kind: "opinion", story: old.does || old.who, holds: old.who && old.does ? old.who : "", change: old.hear, promise: "" };
}

function OpinionRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startOpinion(live?.held || "");
  const [story, setStory] = useState(start.story);
  const [holds, setHolds] = useState(start.holds);
  const [change, setChange] = useState(start.change);
  const [promise, setPromise] = useState(start.promise);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const publicPromise = cellSnippet(live, "plot:promise");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: OpinionPack = { v: 1, kind: "opinion", story, holds, change, promise };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the story already in the room. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now
        empty={empty}
        kicker={empty ? "Not on this plot yet" : "The story already in the room"}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
            : "Not a survey score. The sentence the public would say today.")
        }
      />
      <form className="board-map-story" onSubmit={onSubmit}>
        <blockquote className="board-map-quote-block">
          <Field
            id="op-story"
            label="The story"
            value={story}
            onChange={setStory}
            rows={6}
            hint="Write the sentence they would say, before we add a line."
          />
        </blockquote>
        <div className="board-map-story-side">
          <Field id="op-holds" label="Who holds it" value={holds} onChange={setHolds} rows={3} />
          <Field id="op-change" label="What would change it" value={change} onChange={setChange} rows={3} />
          <Field
            id="op-promise"
            label="The promise already made in public"
            value={promise}
            onChange={setPromise}
            rows={3}
            hint={publicPromise ? `On the left: ${clip(publicPromise)}` : "The promise bit on the left, if it is held."}
          />
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startField(raw: string): LandscapeFieldPack {
  const existing = readPack(raw);
  if (existing?.kind === "landscape-field") return existing;
  const old = legacyLandscape(raw);
  return {
    v: 1,
    kind: "landscape-field",
    internal: old.who,
    prospects: "",
    sector: old.does,
    world: old.hear,
  };
}

function FieldRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startField(live?.held || "");
  const [internal, setInternal] = useState(start.internal);
  const [prospects, setProspects] = useState(start.prospects);
  const [sector, setSector] = useState(start.sector);
  const [world, setWorld] = useState(start.world);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const depthHeld = packFilled(held);
  const plates = LANDSCAPE_TOKENS.map((t) => {
    const raw = live?.snippets[`mapping:${t.id}`] || "";
    const fill = packSummary(raw);
    return { ...t, fill, empty: !fill.trim() };
  });
  const filledN = plates.filter((p) => !p.empty).length;
  const empty = filledN === 0 && !depthHeld;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: LandscapeFieldPack = { v: 1, kind: "landscape-field", internal, prospects, sector, world };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const depthSetters: Record<(typeof DEPTH)[number]["id"], (v: string) => void> = {
    internal: setInternal,
    prospects: setProspects,
    sector: setSector,
    world: setWorld,
  };
  const depthValues: Record<(typeof DEPTH)[number]["id"], string> = {
    internal,
    prospects,
    sector,
    world,
  };

  const lead = empty
    ? live
      ? emptyLead(live.plotName, sheet?.name || topic.name, (live.related || []).length > 0)
      : "The field is the six plates. Empty stays empty."
    : filledN
      ? `${filledN} of six plates held.`
      : packSummary(held);

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of this neighbourhood. Disabled until Assets hook."
    >
      <Horizon topicId={topic.id} plot={live?.plot} />
      <Now empty={empty} kicker={empty ? "Not on this plot yet" : "The field"} body={lead} />
      <ul className="board-map-plates">
        {plates.map((p) => (
          <li key={p.id} className={p.empty ? "board-map-plate is-empty" : "board-map-plate is-filled"}>
            <Link href={withPlot(p.href, live?.plot)}>
              <strong>{p.label}</strong>
              <span>{p.empty ? "Empty" : clip(p.fill)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <form className="board-map-depth is-field" onSubmit={onSubmit}>
        <p className="kicker">Depth — labels, not extra header chips</p>
        {DEPTH.map((d) => (
          <Field
            key={d.id}
            id={`field-${d.id}`}
            label={d.label}
            value={depthValues[d.id]}
            onChange={depthSetters[d.id]}
            rows={3}
          />
        ))}
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <p className="board-map-doors">
        <Link className="act act-line" href={withPlot("/board/plot/positioning", live?.plot)}>
          Positioning
        </Link>
        <Link className="act act-line" href={withPlot("/board/plot/location", live?.plot)}>
          Location
        </Link>
      </p>
    </MappingChrome>
  );
}

function startSeat(raw: string): SeatPack {
  const existing = readPack(raw);
  if (existing?.kind === "seat") return existing;
  const old = legacyLandscape(raw);
  return { v: 1, kind: "seat", name: "", who: old.who, want: old.does, reach: old.hear, never: "" };
}

function seatPackOf(raw: string): SeatPack {
  return startSeat(raw);
}

function CustomerStreet({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const scaleId = readScaleId(live?.snippets["mapping:scale"] || "");
  const scaleLine = scaleId
    ? SCALE_FLAG_READ[scaleId]
    : "Scale is empty. Set the flag on the scale plate before the seats pretend to know who they are.";
  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the people this plot has to hold. Disabled until a still is ticked in Assets."
    >
      <p className="kicker">A street of people. Click a seat to go in.</p>
      <ol className="board-customer-street">
        {CUSTOMER_SEATS.map((c) => {
          const raw = (live?.seats || []).find((s) => s.n === c.n)?.held || "";
          const pack = seatPackOf(raw);
          const named = pack.name.trim();
          return (
            <li key={c.n} className={named ? "is-held" : "is-vacant"}>
              <Link href={withPlot(c.href, live?.plot)}>
                <span className="board-customer-n">{c.n}</span>
                <strong>{named || `Seat ${c.n}`}</strong>
                <em>{named ? pack.who || pack.want || "Held" : "Vacant on purpose"}</em>
              </Link>
            </li>
          );
        })}
      </ol>
      <aside className="board-customer-bustle">
        <p>
          <strong>Who came through this host</strong>
          Analytics sit here when Clock can name them. No invented numbers.
        </p>
        <p>
          <strong>Suggested from who you are</strong>
          {scaleLine}
        </p>
      </aside>
    </MappingChrome>
  );
}

function SeatRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  if (!live?.seat) return <CustomerStreet faculty={faculty} topic={topic} live={live} />;
  const seat = live.seat;
  const start = startSeat(live?.held || "");
  const [name, setName] = useState(start.name);
  const [who, setWho] = useState(start.who);
  const [want, setWant] = useState(start.want);
  const [reach, setReach] = useState(start.reach);
  const [never, setNever] = useState(start.never);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: SeatPack = { v: 1, kind: "seat", name, who, want, reach, never };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of this person. Disabled until Assets hook."
    >
      <ol className="board-seat-rail board-map-seats" aria-label="Customers on the right of the table">
        {CUSTOMER_SEATS.map((c) => {
          const raw = live?.snippets[`mapping:audience:${c.n}`] || (live?.seats || []).find((s) => s.n === c.n)?.held || "";
          const heldName = c.n === seat && name.trim() ? name.trim() : seatNameFromHeld(raw);
          const label = heldName || `Seat ${c.n}`;
          return (
            <li key={c.n} className={c.n === seat ? "is-on" : undefined}>
              <Link href={withPlot(`${c.href}`, live?.plot)}>
                <span className="apes-n">{c.n}</span>
                <strong>{label}</strong>
              </Link>
            </li>
          );
        })}
      </ol>
      <Now
        empty={empty}
        kicker={empty ? `Seat ${seat} is empty` : `Seat ${seat}`}
        body={
          summary.trim() ||
          (live
            ? emptyLead(live.plotName, `Seat ${seat}`, (live.related || []).length > 0)
            : "Eight seats. Real people this plot has to hold.")
        }
      />
      <form className="board-map-seat" onSubmit={onSubmit}>
        <Field
          id="seat-name"
          label="Name"
          value={name}
          onChange={setName}
          rows={2}
          hint="A person this plot actually has to hold. Not a persona nickname."
        />
        <Field id="seat-who" label="Who they are" value={who} onChange={setWho} hint="Demographics only as far as they change the work." />
        <Field id="seat-want" label="What they want from this brand" value={want} onChange={setWant} />
        <Field
          id="seat-reach"
          label="How this brand reaches them"
          value={reach}
          onChange={setReach}
          hint="Channel, hour, object in the hand — not ‘awareness’."
        />
        <Field id="seat-never" label="What we never say to them" value={never} onChange={setNever} />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <p className="board-map-doors">
        <Link className="act act-line" href={withPlot("/board/plot/people", live?.plot)}>
          People
        </Link>
        <Link className="act act-line" href={withPlot("/board/plot/value", live?.plot)}>
          Value
        </Link>
        <Link className="act act-line" href={withPlot("/board/plot/benefit", live?.plot)}>
          Benefit
        </Link>
        <Link className="act act-line" href={withPlot("/board/comms/audience", live?.plot)}>
          Comms audience
        </Link>
      </p>
    </MappingChrome>
  );
}

function startScale(raw: string): ScalePack {
  const existing = readPack(raw);
  if (existing?.kind === "scale") return existing;
  const old = legacyLandscape(raw);
  return { v: 1, kind: "scale", scale: "", note: old.who || old.does || old.hear };
}

function ScaleRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const start = startScale(live?.held || "");
  const [scale, setScale] = useState<ScaleId | "">(start.scale);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ScalePack = { v: 1, kind: "scale", scale: scale || "", note };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the size of this house as it actually trades. Disabled until Assets hook."
    >
      <Horizon topicId="scale" plot={live?.plot} />
      <form className="board-map-scale" onSubmit={onSubmit}>
        <p className="kicker">A flag on this plot, set early. Not a switch on the table.</p>
        <div className="board-map-chips fw-scales" role="group" aria-label="Scale of the business">
          {SCALES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={scale === s.id ? "is-on" : undefined}
              onClick={() => setScale(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {scale ? <p className="board-map-scale-read">{SCALE_FLAG_READ[scale]}</p> : null}
        <Field
          id="scale-note"
          label="What that size means for this plot"
          value={note}
          onChange={setNote}
          hint="A sole trader, a bigger business, and a corporation are not the same neighbourhood."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </MappingChrome>
  );
}

function startEvidence(raw: string): EvidencePack {
  const existing = readPack(raw);
  if (existing?.kind === "evidence") return existing;
  const old = legacyLandscape(raw);
  return { v: 1, kind: "evidence", know: old.who, dont: old.does, need: old.hear };
}

function EvidenceRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const start = startEvidence(live?.held || "");
  const [know, setKnow] = useState(start.know);
  const [dont, setDont] = useState(start.dont);
  const [need, setNeed] = useState(start.need);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: EvidencePack = { v: 1, kind: "evidence", know, dont, need };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const facts = know
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of the evidence before anyone draws. Disabled until Assets hook."
    >
      <Horizon topicId="evidence" plot={live?.plot} />
      {facts.length > 1 ? (
        <ol className="board-map-facts">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      ) : null}
      <form className="board-map-triad" onSubmit={onSubmit}>
        <div className="board-map-well">
          <Field id="ev-know" label="What we know" value={know} onChange={setKnow} hint="One fact per line. Before a line is drawn." rows={8} />
        </div>
        <div className="board-map-well is-guess">
          <Field id="ev-dont" label="What we are guessing" value={dont} onChange={setDont} rows={8} />
        </div>
        <div className="board-map-well is-need">
          <Field id="ev-need" label="What we still have to find" value={need} onChange={setNeed} rows={8} />
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <p className="board-map-doors">
        <Link className="act act-line" href={withPlot("/board/process/stage-3", live?.plot)}>
          RAD
        </Link>
      </p>
    </MappingChrome>
  );
}

function freshNode(i: number): RelNode {
  return { id: `n${i}`, name: "", sort: "person" };
}

function startRelations(raw: string): RelationsPack {
  const existing = readPack(raw);
  if (existing?.kind === "relations") {
    const nodes = existing.nodes?.length ? existing.nodes : [];
    const links = existing.links?.length ? existing.links : [];
    if (nodes.length || links.length) {
      return { v: 1, kind: "relations", nodes, links };
    }
    const from = existing.from || "";
    const to = existing.to || "";
    const how = existing.how || "";
    if (from || to || how) {
      return {
        v: 1,
        kind: "relations",
        nodes: [
          { id: "n1", name: from, sort: "person" },
          { id: "n2", name: to, sort: "person" },
        ],
        links: [{ from: "n1", to: "n2", how }],
      };
    }
    return { v: 1, kind: "relations", nodes: [freshNode(1), freshNode(2)], links: [{ from: "n1", to: "n2", how: "" }] };
  }
  const old = legacyLandscape(raw);
  if (old.who || old.does || old.hear) {
    return {
      v: 1,
      kind: "relations",
      nodes: [
        { id: "n1", name: old.who, sort: "person" },
        { id: "n2", name: old.does, sort: "person" },
      ],
      links: [{ from: "n1", to: "n2", how: old.hear }],
    };
  }
  return {
    v: 1,
    kind: "relations",
    nodes: [freshNode(1), freshNode(2)],
    links: [{ from: "n1", to: "n2", how: "" }],
  };
}

function RelationsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const start = useMemo(() => startRelations(live?.held || ""), [live?.held]);
  const [nodes, setNodes] = useState<RelNode[]>(start.nodes);
  const [links, setLinks] = useState<RelLink[]>(start.links);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const named = nodes.filter((n) => n.name.trim());

  function setNode(id: string, patch: Partial<RelNode>) {
    setNodes((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function setLink(i: number, patch: Partial<RelLink>) {
    setLinks((rows) => rows.map((row, n) => (n === i ? { ...row, ...patch } : row)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: RelationsPack = { v: 1, kind: "relations", nodes, links };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <MappingChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A picture of who touches whom. Disabled until Assets hook."
    >
      <Horizon topicId="relations" plot={live?.plot} />
      <p className="kicker">Named nodes, then how. Advocates and commentators are not the same seat.</p>
      {named.length ? (
        <ul className="board-map-web">
          {named.map((n) => (
            <li key={n.id} className={`board-map-node is-${n.sort}`}>
              <strong>{n.name}</strong>
              <span>{n.sort}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="board-now is-empty">
          <span className="kicker">Empty web</span>
        </p>
      )}
      {links.filter((l) => l.how.trim() || (l.from && l.to)).length ? (
        <ul className="board-map-hows">
          {links.map((l, i) => {
            const a = nodes.find((n) => n.id === l.from)?.name || "";
            const b = nodes.find((n) => n.id === l.to)?.name || "";
            if (!a && !b && !l.how.trim()) return null;
            return (
              <li key={`${l.from}-${l.to}-${i}`}>
                <span>{a || "—"}</span>
                <em>{l.how.trim() || "touches"}</em>
                <span>{b || "—"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      <form className="board-map-relations" onSubmit={onSubmit}>
        <div className="board-map-node-edit">
          {nodes.map((n, i) => (
            <fieldset key={n.id} className="board-map-node-fields">
              <legend>Node {i + 1}</legend>
              <label className="board-field" htmlFor={`rel-name-${n.id}`}>
                <span>Name</span>
                <textarea
                  id={`rel-name-${n.id}`}
                  rows={2}
                  value={n.name}
                  onChange={(ev) => setNode(n.id, { name: ev.target.value })}
                />
              </label>
              <div className="board-map-chips fw-scales" role="group" aria-label="Kind of node">
                {REL_SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={n.sort === s.id ? "is-on" : undefined}
                    onClick={() => setNode(n.id, { sort: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <p className="board-map-more">
          <button
            type="button"
            className="act act-line"
            onClick={() => setNodes((rows) => [...rows, freshNode(rows.length + 1)])}
          >
            Another node
          </button>
        </p>
        <div className="board-map-link-edit">
          {links.map((l, i) => (
            <fieldset key={`link-${i}`} className="board-map-link-fields">
              <legend>How {i + 1}</legend>
              <label className="board-field">
                <span>From</span>
                <select value={l.from} onChange={(ev) => setLink(i, { from: ev.target.value })}>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name.trim() || `Node ${nodes.indexOf(n) + 1}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="board-field">
                <span>To</span>
                <select value={l.to} onChange={(ev) => setLink(i, { to: ev.target.value })}>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name.trim() || `Node ${nodes.indexOf(n) + 1}`}
                    </option>
                  ))}
                </select>
              </label>
              <Field id={`rel-how-${i}`} label="How" value={l.how} onChange={(v) => setLink(i, { how: v })} rows={2} hint="A door, a contract, a feed." />
            </fieldset>
          ))}
        </div>
        <p className="board-map-more">
          <button
            type="button"
            className="act act-line"
            onClick={() =>
              setLinks((rows) => [
                ...rows,
                { from: nodes[0]?.id || "n1", to: nodes[1]?.id || nodes[0]?.id || "n1", how: "" },
              ])
            }
          >
            Another how
          </button>
        </p>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <p className="board-map-doors">
        <Link className="act act-line" href={withPlot("/board/mapping/advocates", live?.plot)}>
          Advocates
        </Link>
        <Link className="act act-line" href={withPlot("/board/mapping/commentators", live?.plot)}>
          Commentators
        </Link>
      </p>
    </MappingChrome>
  );
}
