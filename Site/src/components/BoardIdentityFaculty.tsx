"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import "./BoardIdentityFaculty.css";
import { type Faculty } from "@/data/faculties";
import type { FrameworkTopic } from "@/data/framework-play";
import { topicSheet } from "@/data/board-sheets";
import { emptyLead, withPlot, type BoardLive } from "@/data/board-live";
import { boardEnterHref } from "@/lib/board-enter";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { pressKitForPlot } from "@/lib/epk-map";
import {
  packSummary,
  readPack,
  writePack,
  type IdentityEthicsPack,
  type IdentityPrinciplesPack,
  type IdentitySystemsPack,
  type IdentityToolkitPack,
} from "@/lib/board-pack";

type RoomProps = {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
};

const ROOMS: { id: string; stamp: string; name: string; href: string }[] = [
  { id: "principles", stamp: "Rule", name: "Principles", href: "/board/identity/principles" },
  { id: "ethics", stamp: "Protocol", name: "Ethics", href: "/board/identity/ethics" },
  { id: "toolkit", stamp: "Kit", name: "Toolkit", href: "/board/identity/toolkit" },
  { id: "systems", stamp: "Split", name: "Systems", href: "/board/identity/systems" },
];

const REBEL = /\b(rebel|guerrilla|outsider|punk|maverick|anarch)/i;
const HOUSE = /\b(house|institution|corporate|letterhead|establishment|formal)/i;

type StillRow = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
};

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

function proseSeed(raw: string): string {
  const text = raw.trim();
  if (!text || text.startsWith("{")) return "";
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

function Field({
  id,
  label,
  value,
  onChange,
  rows,
  hint,
  plate,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  plate?: boolean;
}) {
  return (
    <label className={plate ? "bif-field is-plate" : "bif-field"} htmlFor={id}>
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
    <p className="bif-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function Material({
  href,
  plot,
  name,
  line,
  empty,
}: {
  href: string;
  plot?: string;
  name: string;
  line: string;
  empty: string;
}) {
  return (
    <Link href={withPlot(href, plot)} className={line ? "bif-material is-held" : "bif-material is-hole"}>
      <strong>{name}</strong>
      <span>{line ? clip(line, 96) : empty}</span>
    </Link>
  );
}

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

  const lit = ready && rows.length > 0;
  return (
    <aside className={lit ? "bif-stills is-lit" : "bif-stills is-empty"} aria-label="Assets stills">
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
        <p className="bif-stills-empty">
          {plot ? empty : "A plot on the book can show its stills here. Nothing is generated."}
        </p>
      )}
    </aside>
  );
}

function FacultyChrome({
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
  children: ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const plot = live?.plot;
  if (!sheet) return null;
  return (
    <article className={`board-room is-id-faculty is-${topic.id}`}>
      <header className="board-id-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>

      <ol className="bif-stamps" aria-label="Identity systems rooms">
        {ROOMS.map((r) => {
          const fill = r.id === topic.id ? "" : snip(live, `identity:${r.id}`);
          return (
            <li key={r.id}>
              <Link
                href={withPlot(r.href, plot)}
                className={r.id === topic.id ? "is-now" : fill ? "is-held" : undefined}
                aria-current={r.id === topic.id ? "page" : undefined}
              >
                <span className="bif-stamp-mark">{r.stamp}</span>
                <strong>{r.name}</strong>
              </Link>
            </li>
          );
        })}
      </ol>

      {children}

      <StillSocket plot={plot} empty={still} />

      <details className="board-holds">
        <summary>Behind this room</summary>
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
        <p className="bif-generate">Generate later.</p>
      </details>
    </article>
  );
}

export function BoardIdentityFaculty({ faculty, topic, live }: RoomProps) {
  if (topic.id === "ethics") return <EthicsRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "toolkit") return <ToolkitRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "systems") return <SystemsRoom faculty={faculty} topic={topic} live={live} />;
  return <PrinciplesRoom faculty={faculty} topic={topic} live={live} />;
}

function startPrinciples(raw: string): IdentityPrinciplesPack {
  const pack = readPack(raw);
  if (pack?.kind === "identity-principles") {
    return {
      v: 1,
      kind: "identity-principles",
      rule: pack.rule || "",
      rush: pack.rush || "",
      optional: pack.optional || "",
    };
  }
  const seed = proseSeed(raw);
  return { v: 1, kind: "identity-principles", rule: seed, rush: "", optional: "" };
}

function PrinciplesRoom({ faculty, topic, live }: RoomProps) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startPrinciples(live?.held || "");
  const [rule, setRule] = useState(start.rule);
  const [rush, setRush] = useState(start.rush);
  const [optional, setOptional] = useState(start.optional);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const standards = snip(live, "plot:standards");
  const plotEthics = snip(live, "plot:ethics");
  const philosophy = snip(live, "plot:philosophy");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: IdentityPrinciplesPack = { v: 1, kind: "identity-principles", rule, rush, optional };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <FacultyChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A still of a printed rule, if Assets has one. Shared images only."
    >
      <p className={empty ? "bif-now is-empty" : "bif-now"}>
        <span className="kicker">{empty ? "Not on this plot yet" : "The rule that survives a rush job"}</span>
        <span>
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, sheet?.name || topic.name, false)
              : "One rule you could print. The left-column bits are material, not this plate.")}
        </span>
      </p>

      <form className="bif-principles" onSubmit={onSubmit}>
        <fieldset className={rule.trim() ? "bif-print-plate is-held" : "bif-print-plate"}>
          <legend>Printable rule</legend>
          <label className="bif-rule" htmlFor="id-fac-rule">
            <span>What this system will not break</span>
            <textarea
              id="id-fac-rule"
              rows={4}
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="One line. A flyer cannot invent a second identity."
            />
          </label>
          <p className="bif-print-note">A plate you could pin. Not a mission stand-in.</p>
        </fieldset>

        <div className="bif-protocol-pair">
          <Field
            id="id-fac-rush"
            label="What a rush job tries to skip"
            value={rush}
            onChange={setRush}
            rows={3}
            hint="Name the shortcut, not a mood."
          />
          <Field
            id="id-fac-optional"
            label="Who thinks it is optional"
            value={optional}
            onChange={setOptional}
            rows={3}
          />
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>

      <section className="bif-from-left" aria-label="Material from the left of the table">
        <p className="kicker">Material from the left — they fill those cells</p>
        <p className="bif-from-left-lede">
          Standards, their ethics, and philosophy are not this room. The system has to hold what they already wrote.
        </p>
        <div className="bif-from-left-row">
          <Material
            href="/board/plot/standards"
            plot={live?.plot}
            name="Standards"
            line={standards}
            empty="The bar they can check is not on this plot yet."
          />
          <Material
            href="/board/plot/ethics"
            plot={live?.plot}
            name="Ethics (theirs)"
            line={plotEthics}
            empty="What they will not do for a win is not on this plot yet."
          />
          <Material
            href="/board/plot/philosophy"
            plot={live?.plot}
            name="Philosophy"
            line={philosophy}
            empty="Quiet, or empty on purpose."
          />
        </div>
      </section>
    </FacultyChrome>
  );
}

function startEthics(raw: string): IdentityEthicsPack {
  const pack = readPack(raw);
  if (pack?.kind === "identity-ethics") {
    return {
      v: 1,
      kind: "identity-ethics",
      protocol: pack.protocol || "",
      fight: pack.fight || "",
      enforce: pack.enforce || "",
      thin: pack.thin || "",
    };
  }
  const seed = proseSeed(raw);
  return { v: 1, kind: "identity-ethics", protocol: seed, fight: "", enforce: "", thin: "" };
}

function EthicsRoom({ faculty, topic, live }: RoomProps) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startEthics(live?.held || "");
  const [protocol, setProtocol] = useState(start.protocol);
  const [fight, setFight] = useState(start.fight);
  const [enforce, setEnforce] = useState(start.enforce);
  const [thin, setThin] = useState(start.thin);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const theirEthics = snip(live, "plot:ethics");
  const standards = snip(live, "plot:standards");
  const message = snip(live, "comms:message");
  const promise = snip(live, "plot:promise");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: IdentityEthicsPack = { v: 1, kind: "identity-ethics", protocol, fight, enforce, thin };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const clauses = [
    {
      n: "01",
      id: "id-fac-protocol",
      label: "The protocol",
      value: protocol,
      set: setProtocol,
      hint: "Ours. How the system holds as the work grows. Not what they refuse for a win.",
      rows: 5,
    },
    {
      n: "02",
      id: "id-fac-fight",
      label: "Where the public line already fights it",
      value: fight,
      set: setFight,
      hint: message ? `Message on the table: ${clip(message, 64)}` : "The public line, if one is held.",
      rows: 4,
    },
    {
      n: "03",
      id: "id-fac-enforce",
      label: "Who enforces it",
      value: enforce,
      set: setEnforce,
      hint: "A person or a desk. A protocol nobody holds is wallpaper.",
      rows: 3,
    },
    {
      n: "04",
      id: "id-fac-thin",
      label: "One place it is already thin",
      value: thin,
      set: setThin,
      rows: 3,
    },
  ];

  return (
    <FacultyChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A still of the protocol in use, if Assets has one. Shared images only."
    >
      <p className={empty ? "bif-now is-empty" : "bif-now"}>
        <span className="kicker">{empty ? "Not on this plot yet" : "Our protocol for the system"}</span>
        <span>
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, sheet?.name || topic.name, false)
              : "Design Lab North’s protocol as the work grows. Different from the plot’s ethics bit.")}
        </span>
      </p>

      <div className="bif-ethics">
        <form className="bif-ethics-ledger" onSubmit={onSubmit}>
          <p className="kicker">Protocol — this faculty</p>
          {clauses.map((c) => (
            <label key={c.n} className={c.value.trim() ? "bif-clause is-held" : "bif-clause"} htmlFor={c.id}>
              <span className="bif-clause-n">{c.n}</span>
              <span className="bif-clause-body">
                <span>{c.label}</span>
                <textarea
                  id={c.id}
                  rows={c.rows}
                  value={c.value}
                  onChange={(e) => c.set(e.target.value)}
                />
                {c.hint ? <em>{c.hint}</em> : null}
              </span>
            </label>
          ))}
          <SaveBar live={live} pending={pending} error={error} />
        </form>

        <aside className="bif-theirs" aria-label="Their ethics bit — not this room">
          <p className="kicker">Left column — theirs</p>
          <p className="bif-theirs-lede">
            What they will not do for a win lives on the plot ethics bit. It is not this ledger. Do not merge the two.
          </p>
          <Material
            href="/board/plot/ethics"
            plot={live?.plot}
            name="Ethics (bit)"
            line={theirEthics}
            empty="They have not written the refusal yet. That cell stays theirs."
          />
          <Material
            href="/board/plot/standards"
            plot={live?.plot}
            name="Standards"
            line={standards}
            empty="The bar they can check is not on this plot yet."
          />
          {promise ? (
            <p className="bif-theirs-promise">
              Promise on the table: {clip(promise, 72)}
            </p>
          ) : null}
        </aside>
      </div>
    </FacultyChrome>
  );
}

function startToolkit(raw: string): IdentityToolkitPack {
  const pack = readPack(raw);
  if (pack?.kind === "identity-toolkit") {
    return {
      v: 1,
      kind: "identity-toolkit",
      letterhead: pack.letterhead || "",
      pack: pack.pack || "",
      screen: pack.screen || "",
      sheet: pack.sheet || "",
      missing: pack.missing || "",
    };
  }
  const seed = proseSeed(raw);
  return { v: 1, kind: "identity-toolkit", letterhead: seed, pack: "", screen: "", sheet: "", missing: "" };
}

function ToolkitRoom({ faculty, topic, live }: RoomProps) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startToolkit(live?.held || "");
  const [letterhead, setLetterhead] = useState(start.letterhead);
  const [packItem, setPackItem] = useState(start.pack);
  const [screen, setScreen] = useState(start.screen);
  const [ruleSheet, setRuleSheet] = useState(start.sheet);
  const [missing, setMissing] = useState(start.missing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const brandType = snip(live, "plot:brand-type");
  const typeHole = !brandType.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: IdentityToolkitPack = {
      v: 1,
      kind: "identity-toolkit",
      letterhead,
      pack: packItem,
      screen,
      sheet: ruleSheet,
      missing,
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const artefacts: {
    id: string;
    name: string;
    hint: string;
    value: string;
    set: (v: string) => void;
  }[] = [
    {
      id: "id-fac-letterhead",
      name: "Letterhead",
      hint: "Paper a person can put in a printer.",
      value: letterhead,
      set: setLetterhead,
    },
    {
      id: "id-fac-pack",
      name: "Pack",
      hint: "A box, a sleeve, a bag — something they can hold.",
      value: packItem,
      set: setPackItem,
    },
    {
      id: "id-fac-screen",
      name: "Screen",
      hint: "A layout a person can use. Not a login we do not want.",
      value: screen,
      set: setScreen,
    },
    {
      id: "id-fac-sheet",
      name: "Rule sheet",
      hint: "What they may print without asking us every Tuesday.",
      value: ruleSheet,
      set: setRuleSheet,
    },
  ];

  const houseKit = HOUSE.test([letterhead, packItem, screen, ruleSheet].join(" "));
  const rebelType = REBEL.test(brandType);
  const typeWarn = rebelType && houseKit;

  return (
    <FacultyChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A still of a letterhead, pack, screen, or rule sheet already in Assets. Shared images only."
    >
      <p className={empty ? "bif-now is-empty" : "bif-now"}>
        <span className="kicker">{empty ? "Not on this plot yet" : "Artefacts a human can hold"}</span>
        <span>
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, sheet?.name || topic.name, false)
              : "Tools to print or buy. For humans only — not a prompt pack.")}
        </span>
      </p>

      <p className={typeHole ? "bif-type-bar is-hole" : "bif-type-bar"}>
        <span className="kicker">Brand type constrains this kit</span>
        {typeHole ? (
          <span>Type is empty. The toolkit cannot know what it is allowed to be.</span>
        ) : (
          <span>{clip(brandType, 140)}</span>
        )}
        <Link href={withPlot("/board/plot/brand-type", live?.plot)}>Brand type</Link>
      </p>
      {typeWarn ? (
        <p className="bif-split-flag">
          Type reads rebel. These artefacts read as a house. Systems has to show that split.
        </p>
      ) : null}

      <form className="bif-toolkit" onSubmit={onSubmit}>
        <p className="bif-humans">
          Named artefacts for people in the room. Not a downloadable AI toolkit. Not a prompt pack.
        </p>
        <ul className="bif-artefacts">
          {artefacts.map((a) => (
            <li key={a.id} className={a.value.trim() ? "is-held" : "is-empty"}>
              <label htmlFor={a.id}>
                <span className="kicker">{a.name}</span>
                <textarea id={a.id} rows={5} value={a.value} onChange={(e) => a.set(e.target.value)} />
                <em>{a.hint}</em>
              </label>
            </li>
          ))}
        </ul>
        <Field
          id="id-fac-missing"
          label="Still a file on someone’s desktop"
          value={missing}
          onChange={setMissing}
          rows={3}
          hint="What is missing from the kit they can actually issue."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>
    </FacultyChrome>
  );
}

function startSystems(raw: string): IdentitySystemsPack {
  const pack = readPack(raw);
  if (pack?.kind === "identity-systems") {
    return {
      v: 1,
      kind: "identity-systems",
      understand: pack.understand || "",
      flyer: pack.flyer || "",
      site: pack.site || "",
      fix: pack.fix || "",
    };
  }
  const seed = proseSeed(raw);
  return { v: 1, kind: "identity-systems", understand: seed, flyer: "", site: "", fix: "" };
}

function SystemsRoom({ faculty, topic, live }: RoomProps) {
  const sheet = topicSheet(faculty.id, topic.id);
  const start = startSystems(live?.held || "");
  const [understand, setUnderstand] = useState(start.understand);
  const [flyer, setFlyer] = useState(start.flyer);
  const [site, setSite] = useState(start.site);
  const [fix, setFix] = useState(start.fix);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const summary = packSummary(held);
  const empty = !summary.trim();
  const statements = snip(live, "plot:identity");
  const brandType = snip(live, "plot:brand-type");
  const toolkit = snip(live, "identity:toolkit");
  const splitHeld = flyer.trim() && site.trim() && flyer.trim() !== site.trim();
  const autoSplit = REBEL.test(`${brandType} ${statements}`) && HOUSE.test(toolkit || flyer);
  const broken = splitHeld || autoSplit;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: IdentitySystemsPack = { v: 1, kind: "identity-systems", understand, flyer, site, fix };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <FacultyChrome
      faculty={faculty}
      topic={topic}
      live={live}
      still="A still of the flyer and the site, if both live in Assets. Shared images only."
    >
      <p className={empty ? "bif-now is-empty" : "bif-now"}>
        <span className="kicker">{empty ? "Not on this plot yet" : "Understand, break, fix"}</span>
        <span>
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, sheet?.name || topic.name, false)
              : "Where the identity has already split, in one concrete example.")}
        </span>
      </p>

      <ol className="bif-ubf" aria-label="Understand, break, fix">
        <li className={understand.trim() ? "is-held" : undefined}>
          <span>Understand</span>
        </li>
        <li className={broken ? "is-break" : undefined}>
          <span>Break</span>
        </li>
        <li className={fix.trim() ? "is-held" : undefined}>
          <span>Fix</span>
        </li>
      </ol>

      {autoSplit ? (
        <p className="bif-split-flag">
          The bits say rebel. The toolkit reads as a house. Name the split on the flyer and the site.
        </p>
      ) : null}

      <form className="bif-systems" onSubmit={onSubmit}>
        <Field
          id="id-fac-understand"
          plate
          label="What system is in play"
          value={understand}
          onChange={setUnderstand}
          rows={3}
          hint="Name it. Growth does not mean a new logo each year."
        />

        <div className={broken ? "bif-split is-split" : "bif-split"}>
          <label className={flyer.trim() ? "bif-side is-held" : "bif-side"} htmlFor="id-fac-flyer">
            <span className="kicker">Flyer</span>
            <textarea
              id="id-fac-flyer"
              rows={7}
              value={flyer}
              onChange={(e) => setFlyer(e.target.value)}
              placeholder="What the printed piece is doing."
            />
          </label>
          <p className="bif-break-mark" aria-hidden="true">
            {broken ? "Split" : "vs"}
          </p>
          <label className={site.trim() ? "bif-side is-held" : "bif-side"} htmlFor="id-fac-site">
            <span className="kicker">Site</span>
            <textarea
              id="id-fac-site"
              rows={7}
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="What the site is doing."
            />
          </label>
        </div>

        <Field
          id="id-fac-fix"
          plate
          label="What fixing it would change on the table"
          value={fix}
          onChange={setFix}
          rows={4}
          hint="A cell that would have to move. Not a new mark."
        />
        <SaveBar live={live} pending={pending} error={error} />
      </form>

      <section className="bif-from-left" aria-label="What the system has to hold">
        <p className="kicker">What the system has to hold</p>
        <div className="bif-from-left-row">
          <Material
            href="/board/plot/identity"
            plot={live?.plot}
            name="Identity statements"
            line={statements}
            empty="The sentences they would say are not on this plot yet."
          />
          <Material
            href="/board/plot/brand-type"
            plot={live?.plot}
            name="Brand type"
            line={brandType}
            empty="What it is allowed to be is not on this plot yet."
          />
          <Material
            href="/board/identity/toolkit"
            plot={live?.plot}
            name="Toolkit"
            line={toolkit}
            empty="No artefacts issued yet."
          />
        </div>
      </section>
    </FacultyChrome>
  );
}
