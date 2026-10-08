"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type Faculty } from "@/data/faculties";
import { frameworkTopics, type FrameworkTopic } from "@/data/framework-play";
import {
  BRIEFING_NOTES,
  CUSTOMER_SEATS,
  IDENTITY_BITS,
  LANDSCAPE_TOKENS,
  PROCESS_STEPS,
  boardAvenueHref,
  boardOverviewHref,
  boardTopicHref,
} from "@/data/board-map";
import { topicSheet } from "@/data/board-sheets";
import { emptyLead, withPlot, type BoardLive } from "@/data/board-live";
import {
  packSummary,
  readPack,
  writePack,
  type WorkbenchBoardPack,
  type WorkbenchHostPack,
  type WorkbenchIdeasPack,
  type WorkbenchToolsPack,
} from "@/lib/board-pack";
import { isImageHref, isShared, type ShareFlags } from "@/lib/assets-view";
import { pressKitForPlot } from "@/lib/epk-map";
import "./BoardWorkbench.css";

type AssetRow = {
  id: string;
  href: string;
  title: string;
  kind: string;
  flags: ShareFlags;
};

function sharedImages(items: AssetRow[]): AssetRow[] {
  return items.filter((item) => item.kind === "image" && isImageHref(item.href) && isShared(item));
}

function pickHostStill(items: AssetRow[]): AssetRow | undefined {
  return items.find((i) => i.flags.banner) || items.find((i) => i.flags.pack) || items[0];
}

function useSharedStills(plot?: string) {
  const [rows, setRows] = useState<AssetRow[]>([]);
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
      .then((data: { items?: AssetRow[] } | null) => {
        if (!live) return;
        setRows(sharedImages(data?.items || []));
        setReady(true);
      })
      .catch(() => {
        if (live) {
          setRows([]);
          setReady(true);
        }
      });
    return () => {
      live = false;
    };
  }, [plot]);

  return { rows, ready };
}

function StillSocket({
  plot,
  size,
  label,
  pick = "first",
}: {
  plot?: string;
  size: "host" | "small";
  label: string;
  pick?: "host" | "first";
}) {
  const { rows, ready } = useSharedStills(plot);
  const still = pick === "host" ? pickHostStill(rows) : rows[0];
  const emptyCopy = !plot
    ? "A plot on the book can show a still here."
    : ready
      ? "No still ticked for this plot in Assets. Nothing is generated."
      : "Looking in Assets…";

  return (
    <figure className={`board-wb-still is-${size}${still ? " is-held" : " is-empty"}`}>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={still.href} alt="" />
      ) : (
        <div className="board-wb-still-well" aria-hidden />
      )}
      <figcaption>
        <span className="kicker">{label}</span>
        {still ? still.title || "From Assets" : emptyCopy}
      </figcaption>
    </figure>
  );
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

function snip(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > 96 ? `${line.slice(0, 95)}…` : line;
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

function WorkbenchChrome({
  faculty,
  topic,
  live,
  children,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
  children: React.ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topic.id);
  const topics = frameworkTopics(faculty.id);
  const plot = live?.plot;
  const related = live?.related || [];
  if (!sheet) return null;
  return (
    <article className={`board-room is-workbench is-wb-${topic.id}`}>
      <header className="board-id-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>
      <nav className="board-horizon" aria-label="Workbench rooms">
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
      <ol className="board-wb-pad">
        {BRIEFING_NOTES.filter((n) => n.n === "3" || n.n === "4").map((n) => (
          <li key={n.n}>
            <Link href={withPlot(n.href, plot)} className={n.href.includes(topic.id) ? "is-on" : undefined}>
              <span className="kicker">Pad {n.n}</span>
              {n.label}
            </Link>
          </li>
        ))}
      </ol>
      {children}
      <details className="board-holds">
        <summary>Behind this room</summary>
        {related.length ? (
          <ul className="board-related">
            {related.map((row) => (
              <li key={row.href + row.label}>
                <Link href={row.href}>{row.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
      </details>
      <p className="actions">
        <Link className="act act-line" href={withPlot(boardAvenueHref(faculty.id), plot)}>
          Back to {faculty.name}
        </Link>
        <Link className="act act-line" href={withPlot("/board/plot", plot)}>
          The thing itself
        </Link>
      </p>
    </article>
  );
}

function ToolsRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: WorkbenchToolsPack =
    existing?.kind === "workbench-tools"
      ? existing
      : {
          v: 1,
          kind: "workbench-tools",
          making: live?.held?.trim() || "",
          file: "",
          tools: [""],
        };
  const [making, setMaking] = useState(start.making);
  const [file, setFile] = useState(start.file);
  const [tools, setTools] = useState(start.tools.length ? start.tools : [""]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const named = tools.map((t) => t.trim()).filter(Boolean);
  const build = snip(live, "process:stage-6");
  const empty = !making.trim() && !file.trim() && named.length === 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: WorkbenchToolsPack = {
      v: 1,
      kind: "workbench-tools",
      making: making.trim(),
      file: file.trim(),
      tools: named,
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <WorkbenchChrome faculty={faculty} topic={topic} live={live}>
      <section className={empty ? "board-now is-empty" : "board-now"}>
        <p className="kicker">{empty ? "Nothing in hand" : "On this desk"}</p>
        <p className="body">
          {empty
            ? live
              ? emptyLead(live.plotName, "Tools", Boolean(live.related.length) || Boolean(build))
              : "Name what is being made, in which file, with which tools."
            : [making, file, named[0]].filter(Boolean).join(" — ")}
        </p>
      </section>
      {build ? (
        <p className="board-wb-read">
          Stage 6 already says: {build}{" "}
          <Link href={withPlot("/board/process/stage-6", live?.plot)}>The Build</Link>
        </p>
      ) : (
        <p className="board-wb-hole">
          The Build is still a description until a tool and a file sit here.{" "}
          <Link href={withPlot("/board/process/stage-6", live?.plot)}>Stage 6</Link>
        </p>
      )}
      <form className="board-wb-tools" onSubmit={onSubmit}>
        <label className="board-wb-making" htmlFor="wb-making">
          <span className="kicker">What is being made</span>
          <textarea id="wb-making" rows={2} value={making} onChange={(e) => setMaking(e.target.value)} />
        </label>
        <label htmlFor="wb-file">
          <span className="kicker">Which file</span>
          <input id="wb-file" type="text" value={file} onChange={(e) => setFile(e.target.value)} />
        </label>
        <fieldset className="board-wb-named">
          <legend>Tools in use, named</legend>
          <p className="board-wb-hint">Not “Adobe”. The thing in someone’s hands this week.</p>
          <ul>
            {tools.map((row, i) => (
              <li key={i}>
                <input
                  type="text"
                  value={row}
                  onChange={(e) => {
                    const next = tools.slice();
                    next[i] = e.target.value;
                    setTools(next);
                  }}
                  aria-label={`Tool ${i + 1}`}
                />
                {tools.length > 1 ? (
                  <button
                    type="button"
                    className="board-wb-drop"
                    onClick={() => setTools(tools.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <button type="button" className="board-wb-add" onClick={() => setTools([...tools, ""])}>
            Add a tool
          </button>
        </fieldset>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <StillSocket plot={live?.plot} size="small" label="The thing being made" />
    </WorkbenchChrome>
  );
}

function IdeasRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: WorkbenchIdeasPack =
    existing?.kind === "workbench-ideas"
      ? existing
      : { v: 1, kind: "workbench-ideas", idea: live?.held?.trim() || "", stage: "", skip: "" };
  const [idea, setIdea] = useState(start.idea);
  const [stage, setStage] = useState(start.stage);
  const [skip, setSkip] = useState(start.skip);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const big = snip(live, "plot:big-idea");
  const mission = snip(live, "plot:mission");
  const stageN = Number(stage.replace("stage-", "") || "0");
  const holes = PROCESS_STEPS.filter((s) => {
    const n = Number(s.n);
    return stageN >= 6 && n < stageN && n >= 3 && !snip(live, `process:stage-${s.n}`);
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: WorkbenchIdeasPack = {
      v: 1,
      kind: "workbench-ideas",
      idea: idea.trim(),
      stage,
      skip: skip.trim(),
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <WorkbenchChrome faculty={faculty} topic={topic} live={live}>
      <section className={!idea.trim() ? "board-now is-empty" : "board-now"}>
        <p className="kicker">Through, not around</p>
        <p className="body">
          {idea.trim()
            ? idea
            : "A great idea that skips the stack is how a live host invents a second brand."}
        </p>
      </section>
      <div className="board-wb-reads">
        <p>
          <span className="kicker">Big idea</span>
          {big ? (
            <Link href={withPlot("/board/plot/big-idea", live?.plot)}>{big}</Link>
          ) : (
            <Link className="is-hole" href={withPlot("/board/plot/big-idea", live?.plot)}>
              Empty — a wide pass is still allowed
            </Link>
          )}
        </p>
        <p>
          <span className="kicker">Mission</span>
          {mission ? (
            <Link href={withPlot("/board/plot/mission", live?.plot)}>{mission}</Link>
          ) : (
            <span>Not held</span>
          )}
        </p>
      </div>
      <form className="board-wb-ideas" onSubmit={onSubmit}>
        <label className="board-wb-idea" htmlFor="wb-idea">
          <span className="kicker">The idea going through</span>
          <textarea id="wb-idea" rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} />
        </label>
        <fieldset className="board-wb-spine">
          <legend>Stage it is in, honestly</legend>
          <ol>
            {PROCESS_STEPS.map((s) => {
              const filled = Boolean(snip(live, `process:${s.id}`));
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={stage === s.id ? "is-on" : filled ? "is-held" : undefined}
                    aria-pressed={stage === s.id}
                    onClick={() => setStage(s.id)}
                  >
                    <span className="kicker">{s.n}</span>
                    <strong>{s.short}</strong>
                  </button>
                  <Link href={withPlot(s.href, live?.plot)}>Open</Link>
                </li>
              );
            })}
          </ol>
        </fieldset>
        {holes.length ? (
          <div className="board-wb-skip">
            <p className="kicker">Skipped checkpoints</p>
            <p>If this idea wants Implementation without these, the host will invent a second brand.</p>
            <ul>
              {holes.map((s) => (
                <li key={s.id}>
                  <Link href={withPlot(s.href, live?.plot)}>{s.short} is empty</Link>
                </li>
              ))}
            </ul>
            <label htmlFor="wb-skip">
              <span className="kicker">Why it is trying to skip</span>
              <textarea id="wb-skip" rows={2} value={skip} onChange={(e) => setSkip(e.target.value)} />
            </label>
          </div>
        ) : (
          <label htmlFor="wb-skip">
            <span className="kicker">What would stop it</span>
            <textarea id="wb-skip" rows={2} value={skip} onChange={(e) => setSkip(e.target.value)} />
          </label>
        )}
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <StillSocket plot={live?.plot} size="small" label="The idea" />
    </WorkbenchChrome>
  );
}

function BoardZoomRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: WorkbenchBoardPack =
    existing?.kind === "workbench-board"
      ? existing
      : { v: 1, kind: "workbench-board", focus: "", note: live?.held?.trim() || "" };
  const [focus, setFocus] = useState(start.focus);
  const [note, setNote] = useState(start.note);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const hero = snip(live, "plot:mission") || snip(live, "plot:purpose") || snip(live, "plot:identity");
  const cells = useMemo(() => {
    const rows: { key: string; label: string; href: string }[] = [
      ...IDENTITY_BITS.slice(0, 8).map((b) => ({
        key: `plot:${b.id}`,
        label: b.label,
        href: `/board/plot/${b.id}`,
      })),
      ...LANDSCAPE_TOKENS.map((t) => ({
        key: `mapping:${t.id}`,
        label: t.label,
        href: t.href,
      })),
      ...CUSTOMER_SEATS.slice(0, 4).map((s) => ({
        key: `mapping:audience:${s.n}`,
        label: `Seat ${s.n}`,
        href: s.href,
      })),
      ...PROCESS_STEPS.map((s) => ({
        key: `process:${s.id}`,
        label: s.short,
        href: s.href,
      })),
    ];
    return rows;
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: WorkbenchBoardPack = { v: 1, kind: "workbench-board", focus, note: note.trim() };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  const focused = cells.find((c) => c.key === focus);

  return (
    <WorkbenchChrome faculty={faculty} topic={topic} live={live}>
      <section className="board-wb-zoom-hero">
        <p className="kicker">Centre, from this desk</p>
        <p className="board-wb-hero">{hero || "The thing itself has not written a line yet."}</p>
        <p>
          <Link href={withPlot("/board/plot", live?.plot)}>Open the showcase</Link>
          {" · "}
          <Link href={boardOverviewHref()}>Overview</Link>
        </p>
      </section>
      <form className="board-wb-zoom" onSubmit={onSubmit}>
        <div className="board-wb-zoom-grid">
          <div>
            <p className="kicker">Pick a cell</p>
            <ul className="board-wb-cells">
              {cells.map((c) => {
                const held = Boolean(snip(live, c.key));
                return (
                  <li key={c.key}>
                    <button
                      type="button"
                      className={focus === c.key ? "is-on" : held ? "is-held" : "is-empty"}
                      aria-pressed={focus === c.key}
                      onClick={() => setFocus(c.key)}
                    >
                      <strong>{c.label}</strong>
                      <span>{held ? snip(live, c.key) : "Vacant"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="board-wb-effect">
            <p className="kicker">Effect</p>
            {focused ? (
              <>
                <p>
                  Looking at <strong>{focused.label}</strong>
                </p>
                <p>{snip(live, focused.key) || "Empty. Holding a line here is the effect."}</p>
                <p>
                  <Link href={withPlot(focused.href, live?.plot)}>Enter this cell</Link>
                </p>
              </>
            ) : (
              <p>Pick a cell. Neighbours light from the plot file. Generate later; today the effect is hold and read.</p>
            )}
            <label htmlFor="wb-note">
              <span className="kicker">What this board should know today</span>
              <textarea id="wb-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <StillSocket plot={live?.plot} size="small" label="This plot" />
    </WorkbenchChrome>
  );
}

function HostRoom({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  const existing = readPack(live?.held || "");
  const start: WorkbenchHostPack =
    existing?.kind === "workbench-host"
      ? existing
      : {
          v: 1,
          kind: "workbench-host",
          liveUrl: live?.hostUrl || "",
          sandbox: "",
          who: live?.held?.trim() || "",
        };
  const [liveUrl, setLiveUrl] = useState(start.liveUrl);
  const [sandbox, setSandbox] = useState(start.sandbox);
  const [who, setWho] = useState(start.who);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const location = snip(live, "plot:location");
  const impl = snip(live, "process:stage-7");
  const empty = !liveUrl.trim() && !sandbox.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: WorkbenchHostPack = {
      v: 1,
      kind: "workbench-host",
      liveUrl: liveUrl.trim(),
      sandbox: sandbox.trim(),
      who: who.trim(),
    };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <WorkbenchChrome faculty={faculty} topic={topic} live={live}>
      <section className={empty ? "board-now is-empty" : "board-now"}>
        <p className="kicker">{empty ? "No host yet" : "One package"}</p>
        <p className="body">
          {empty
            ? "Live and a constant sandbox. Trying a thing must not overwrite the public site. Implementation cannot honestly complete while this is vacant."
            : [liveUrl, sandbox].filter(Boolean).join(" · ")}
        </p>
      </section>
      <form className="board-wb-host-plates" onSubmit={onSubmit}>
        <div className="board-wb-plate is-live">
          <p className="kicker">Live</p>
          <StillSocket plot={live?.plot} size="host" label="Host still" pick="host" />
          <label htmlFor="wb-live">
            <span>Named URL</span>
            <input
              id="wb-live"
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder={live?.hostUrl || "https://"}
            />
          </label>
          {live?.hostUrl ? (
            <p>
              On the book:{" "}
              <a href={live.hostUrl} target="_blank" rel="noreferrer">
                {live.hostUrl.replace(/^https?:\/\//, "")}
              </a>
              <span> · {live.status}</span>
            </p>
          ) : (
            <p>No live URL on this plot yet.</p>
          )}
        </div>
        <div className="board-wb-plate is-sandbox">
          <p className="kicker">Sandbox</p>
          <label htmlFor="wb-sandbox">
            <span>Where they try</span>
            <input id="wb-sandbox" type="text" value={sandbox} onChange={(e) => setSandbox(e.target.value)} />
          </label>
          <label htmlFor="wb-who">
            <span>Who sits with it</span>
            <textarea id="wb-who" rows={2} value={who} onChange={(e) => setWho(e.target.value)} />
          </label>
          <p className="board-wb-warn">This plate does not write over live. There is no toggle that publishes.</p>
        </div>
        <SaveBar live={live} pending={pending} error={error} />
      </form>
      <p>
        <span className="kicker">Location</span>{" "}
        {location ? (
          <Link href={withPlot("/board/plot/location", live?.plot)}>{location}</Link>
        ) : (
          <Link className="is-hole" href={withPlot("/board/plot/location", live?.plot)}>
            Where this lives is empty
          </Link>
        )}
      </p>
      <p>
        <span className="kicker">Implementation</span>{" "}
        {impl ? (
          <Link href={withPlot("/board/process/stage-7", live?.plot)}>{impl}</Link>
        ) : (
          <Link className="is-hole" href={withPlot("/board/process/stage-7", live?.plot)}>
            Stage 7 cannot honestly complete while the host is vacant
          </Link>
        )}
      </p>
    </WorkbenchChrome>
  );
}

export function BoardWorkbench({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  if (topic.id === "tools") return <ToolsRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "ideas") return <IdeasRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "board") return <BoardZoomRoom faculty={faculty} topic={topic} live={live} />;
  if (topic.id === "host") return <HostRoom faculty={faculty} topic={topic} live={live} />;
  return <ToolsRoom faculty={faculty} topic={topic} live={live} />;
}
