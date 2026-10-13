"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AssetHub } from "@/components/AssetHub";
import { Mark } from "@/components/Mark";
import { readLastPlot, writeLastPlot } from "@/data/campus";
import type { AssetItem } from "@/lib/assets";
import { assetLane, isImageHref } from "@/lib/assets-view";
import { vaultKitForPlot } from "@/lib/epk-map";

type Plot = { slug: string; name: string };
type Ledger = { plotSlug: string; balance: number; grantedThisPeriod: number };
type Still = { id: string; href: string; title: string; createdAt: string };
type Project = {
  id: string;
  title: string;
  plotSlug: string;
  createdAt: string;
  stills?: Still[];
};
type Room = "picture" | "inpaint" | "text";
type Attach = { id: string; href: string; title: string; lane: string; note: string; kind?: string };

function attachFromAsset(item: AssetItem, note?: string): Attach {
  const lane = assetLane(item.flags);
  return {
    id: item.id,
    href: item.href,
    title: item.title,
    lane,
    kind: item.kind,
    note: note ?? defaultNote(lane),
  };
}
type Steer = { prompt: string; cleaned: string; avenue: string; setting: string; missing: string[] };
type TextSteer = { kind: string; title: string; cleaned: string; setting: string; missing: string[]; prompt?: string };
type Sort = "recent" | "name";
type TextKind = "press" | "social" | "slides";

const TEXT_JOBS: { id: TextKind; label: string }[] = [
  { id: "press", label: "Press pack" },
  { id: "social", label: "Social post" },
  { id: "slides", label: "Meeting slides" },
];

const AVENUES = [
  { id: "auto" as const, label: "Auto" },
  { id: "brand" as const, label: "Brand" },
  { id: "social" as const, label: "Social" },
  { id: "editorial" as const, label: "Editorial" },
];


function parsePath(path: string): { id: string; room: Room } {
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  const id = parts[1] || "";
  const tail = parts[2];
  const room: Room = tail === "inpaint" || tail === "text" ? tail : "picture";
  return { id, room };
}

function jobHref(id: string, room: Room) {
  if (room === "picture") return `/studio/${id}`;
  return `/studio/${id}/${room}`;
}

function defaultNote(lane: string) {
  if (lane === "logo") return "Copy this exact mark. Place it where the line says. Do not invent a substitute.";
  if (lane === "pack") return "This is the real pack. Copy type, shape, and finish.";
  if (lane === "people") return "This is the person. Keep likeness.";
  if (lane === "promo" || lane === "banner") return "Keep the marks and layout cues from this still.";
  return "Take only what the prompt asks from this still.";
}

function AttachFace({ href, title, kind }: { href: string; title: string; kind?: string }) {
  if (isImageHref(href)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={href} alt="" />
    );
  }
  return <span className="studio-file-face">{kind || title || "File"}</span>;
}

function AttachRow({
  item,
  onRemove,
}: {
  item: Attach;
  onRemove: () => void;
}) {
  return (
    <li className="pipe-attach">
      <AttachFace href={item.href} title={item.title} kind={item.kind} />
      <p>
        <span>{item.lane}</span>
        {item.note ? ` — ${item.note}` : item.title ? ` — ${item.title}` : ""}
      </p>
      <button type="button" className="dln-chip" onClick={onRemove}>
        Remove
      </button>
    </li>
  );
}

export function StudioApp() {
  const path = usePathname() || "/studio";
  const router = useRouter();
  const { id, room } = parsePath(path);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plot, setPlot] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [job, setJob] = useState<Project | null>(null);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [stillCost, setStillCost] = useState(12);
  const [textCost, setTextCost] = useState(12);
  const [sort, setSort] = useState<Sort>("recent");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const plotName = plots.find((row) => row.slug === plot)?.name || plot;
  const held = useMemo(
    () => ledgers.find((row) => row.plotSlug === plot) || ledgers[0] || null,
    [ledgers, plot],
  );

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!live) return;
        const next = ((body.plots || []) as Plot[]).filter((row) => row.slug !== "various-titles");
        setPlots(next);
        const stored = readLastPlot();
        const pick = (stored && next.find((row) => row.slug === stored)?.slug) || next[0]?.slug || "";
        if (pick) {
          setPlot(pick);
          writeLastPlot(pick);
        }
      })
      .catch(() => {
        if (live) setError("Could not read the account.");
      });
    fetch("/api/studio/enter", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!live) return;
        if (body?.stillCost) setStillCost(body.stillCost);
        if (body?.textCost) setTextCost(body.textCost);
        if (Array.isArray(body?.ledgers)) setLedgers(body.ledgers);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const loadProjects = useCallback(async (slug: string) => {
    if (!slug) return;
    const res = await fetch(`/api/studio/projects?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as { projects?: Project[] };
    setProjects(body.projects || []);
  }, []);

  useEffect(() => {
    if (!plot) return;
    setError("");
    void loadProjects(plot);
  }, [plot, loadProjects]);

  useEffect(() => {
    if (!id) {
      setJob(null);
      return;
    }
    let live = true;
    fetch(`/api/studio/projects?id=${encodeURIComponent(id)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((body) => {
        if (!live || !body.project) return;
        const next = body.project as Project;
        setJob(next);
        if (next.plotSlug) {
          setPlot(next.plotSlug);
          writeLastPlot(next.plotSlug);
        }
      })
      .catch(() => {
        if (live) setError("That project is not on this book.");
      });
    return () => {
      live = false;
    };
  }, [id]);

  const shown = useMemo(() => {
    const rows = projects.slice();
    if (sort === "name") rows.sort((a, b) => a.title.localeCompare(b.title));
    return rows;
  }, [projects, sort]);

  function onBalance(next: number) {
    setLedgers((rows) =>
      rows.length
        ? rows.map((row) => ({ ...row, balance: next, plotSlug: plot || row.plotSlug }))
        : [{ plotSlug: plot, balance: next, grantedThisPeriod: 0 }],
    );
  }

  async function createProject() {
    if (!title.trim() || !plot) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotSlug: plot, plotName, title: title.trim() }),
    });
    const body = (await res.json().catch(() => ({}))) as { project?: Project; error?: string };
    setBusy(false);
    if (!res.ok || !body.project) {
      setError(body.error || "Could not make that project.");
      return;
    }
    setTitle("");
    setProjects((rows) => [body.project as Project, ...rows.filter((row) => row.id !== body.project?.id)]);
    router.push(`/studio/${body.project.id}`);
  }

  const tokens = held?.balance;

  return (
    <div className="studio-desk">
      <header className="dln-bar">
        <Link href="/" className="dln-mark-link" aria-label="Design Lab North">
          <Mark />
        </Link>
        <nav className="dln-path" aria-label="Path">
          <span className="dln-seg">
            <span className="dln-slash">/</span>
            <Link href="/studio" className={!id ? "is-here" : undefined}>
              studio
            </Link>
          </span>
          {plotName ? (
            <span className="dln-seg">
              <span className="dln-slash">/</span>
              <span className={id ? undefined : "is-here"}>{plotName}</span>
            </span>
          ) : null}
          {job ? (
            <span className="dln-seg">
              <span className="dln-slash">/</span>
              <Link href={`/studio/${job.id}`} className="is-here">
                {job.title}
              </Link>
            </span>
          ) : null}
        </nav>
        {plots.length >= 2 ? (
          <label className="studio-site">
            Site
            <select
              value={plot}
              onChange={(event) => {
                const next = event.target.value;
                setPlot(next);
                writeLastPlot(next);
                if (id) router.push("/studio");
              }}
            >
              {plots.map((row) => (
                <option key={row.slug} value={row.slug}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      {id && job ? (
        <div className="pipe-bar">
          <div className="pipe-rooms" aria-label="In this project">
            {(["picture", "inpaint", "text"] as Room[]).map((item) => (
              <Link key={item} href={jobHref(job.id, item)} className={`pipe-tab ${room === item ? "is-on" : ""}`}>
                {item === "picture" ? "Picture gen" : item === "inpaint" ? "Inpaint" : "Text"}
              </Link>
            ))}
            {typeof tokens === "number" ? (
              <span className="pipe-tab pipe-tokens">{tokens} tokens</span>
            ) : (
              <span className="pipe-tab pipe-tokens">{plotName || "This site"} · a still is {stillCost} tokens</span>
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="studio-error">{error}</p> : null}

      {!id ? (
        <main className="studio-home">
          <p className="dln-kicker">/studio</p>
          <h1 className="dln-title">Studio</h1>
          <p className="dln-lede">
            One tab per job. Type a line, we steer it, you get a still. Open assets is this site’s vault — the same
            book as Account → Assets.
          </p>
          <form
            className="studio-new"
            onSubmit={(event) => {
              event.preventDefault();
              void createProject();
            }}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Name a project — a brand, a shoot, a person"
              className="dln-field"
            />
            <button type="submit" className="dln-btn" disabled={busy || !title.trim() || !plot}>
              {busy ? "Making…" : "New project"}
            </button>
          </form>
          <div className="pipe-control-row studio-sort">
            <button type="button" className={`pipe-seg ${sort === "recent" ? "is-on" : ""}`} onClick={() => setSort("recent")}>
              Recent
            </button>
            <button type="button" className={`pipe-seg ${sort === "name" ? "is-on" : ""}`} onClick={() => setSort("name")}>
              Name
            </button>
          </div>
          {shown.length ? (
            <ul className="studio-jobs">
              {shown.map((row) => (
                <li key={row.id}>
                  <Link className="dln-plate studio-job" href={`/studio/${row.id}`}>
                    <span>
                      <strong>/{row.title}</strong>
                      <em>{new Date(row.createdAt).toLocaleDateString("en-GB")}</em>
                    </span>
                    {row.stills?.[0]?.href ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.stills[0].href} alt="" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dln-lede">No projects on this site yet.</p>
          )}
        </main>
      ) : job ? (
        room === "picture" ? (
          <PictureRoom
            job={job}
            plot={plot}
            plotName={plotName}
            stillCost={stillCost}
            onBalance={onBalance}
            onJob={setJob}
          />
        ) : room === "inpaint" ? (
          <InpaintRoom
            job={job}
            plot={plot}
            plotName={plotName}
            stillCost={stillCost}
            onBalance={onBalance}
            onJob={setJob}
          />
        ) : (
          <TextRoom job={job} plot={plot} plotName={plotName} stillCost={textCost} onBalance={onBalance} />
        )
      ) : (
        <p className="studio-pad dln-lede">Opening the project…</p>
      )}
    </div>
  );
}

function PictureRoom({
  job,
  plot,
  plotName,
  stillCost,
  onBalance,
  onJob,
}: {
  job: Project;
  plot: string;
  plotName: string;
  stillCost: number;
  onBalance: (n: number) => void;
  onJob: (job: Project) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [who, setWho] = useState("");
  const [where, setWhere] = useState("");
  const [product, setProduct] = useState("");
  const [mustKeep, setMustKeep] = useState("");
  const [mode, setMode] = useState<"naked" | "plus">("naked");
  const [avenue, setAvenue] = useState<"auto" | "brand" | "social" | "editorial">("auto");
  const [attaches, setAttaches] = useState<Attach[]>([]);
  const [poolOpen, setPoolOpen] = useState(false);
  const [busy, setBusy] = useState<"steer" | "gen" | null>(null);
  const [error, setError] = useState("");
  const [href, setHref] = useState(job.stills?.[0]?.href || "");
  const [steered, setSteered] = useState<Steer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!prompt.trim()) {
        setSteered(null);
        return;
      }
      setBusy("steer");
      void fetch("/api/studio/steer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode,
          extras: {
            who,
            where,
            product,
            mustKeep,
            plotName,
            avenue: avenue === "auto" ? undefined : avenue,
          },
          attaches,
        }),
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.steered) setSteered(body.steered);
        })
        .finally(() => setBusy((value) => (value === "steer" ? null : value)));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [prompt, mode, avenue, who, where, product, mustKeep, attaches, plotName]);

  async function generate() {
    if (!prompt.trim()) return;
    setBusy("gen");
    setError("");
    const res = await fetch("/api/studio/still", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: job.id,
        plotSlug: plot,
        plotName,
        prompt: prompt.trim(),
        mode,
        avenue: avenue === "auto" ? undefined : avenue,
        extras: { who, where, product, mustKeep, plotName },
        attaches,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      href?: string;
      error?: string;
      balance?: number;
      steered?: Steer;
    };
    setBusy(null);
    if (typeof body.balance === "number") onBalance(body.balance);
    if (!res.ok || !body.href) {
      setError(body.error || "Could not make that picture.");
      return;
    }
    setHref(body.href);
    if (body.steered) setSteered(body.steered);
    onJob({
      ...job,
      stills: [
        { id: body.href, href: body.href, title: prompt.trim(), createdAt: new Date().toISOString() },
        ...(job.stills || []),
      ],
    });
  }

  return (
    <>
      <main className="studio-desk-grid">
        <section>
          <p className="dln-kicker">{plotName ? plotName : "01 · /studio"}</p>
          <h1 className="dln-title">Make a picture</h1>
          <p className="dln-lede">
            How you write is separate from the job. Open assets for this site’s vault — attached stills go in as
            pictures, not as a description. Say where the mark sits. A still is {stillCost} tokens.
          </p>

          <div className="studio-assets-row">
            <p className="pipe-control-label">Pictures on this prompt</p>
            <button type="button" className="dln-chip" onClick={() => setPoolOpen(true)}>
              {attaches.length ? `${attaches.length} attached · edit` : "Open assets"}
            </button>
            {attaches.length ? (
              <ul className="studio-attach-list">
                {attaches.map((item) => (
                  <AttachRow
                    key={item.id}
                    item={item}
                    onRemove={() => setAttaches(attaches.filter((row) => row.id !== item.id))}
                  />
                ))}
              </ul>
            ) : (
              <p className="studio-hint">Nothing attached yet. Open assets and pick the mark, pack, or person — they go into the gen as pictures.</p>
            )}
          </div>

          <div className="studio-plus-gap">
            <div className="pipe-control">
              <p className="pipe-control-label">How you write</p>
              <div className="pipe-control-row">
                <button
                  type="button"
                  className={`dln-chip ${mode === "naked" ? "is-on" : ""}`}
                  onClick={() => setMode("naked")}
                >
                  Naked prompt
                </button>
                <button
                  type="button"
                  className={`dln-chip ${mode === "plus" ? "is-on" : ""}`}
                  onClick={() => setMode("plus")}
                >
                  + information
                </button>
              </div>
            </div>
            <div className="pipe-control">
              <p className="pipe-control-label">Avenue</p>
              <div className="pipe-control-row">
                {AVENUES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pipe-seg ${avenue === item.id ? "is-on" : ""}`}
                    onClick={() => setAvenue(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            placeholder="X person is in X place doing X thing."
            className="dln-field studio-field"
          />
          {mode === "plus" ? (
            <div className="studio-plus-fields">
              <input value={who} onChange={(event) => setWho(event.target.value)} placeholder="X person" className="dln-field" />
              <input value={where} onChange={(event) => setWhere(event.target.value)} placeholder="X place" className="dln-field" />
              <input
                value={product}
                onChange={(event) => setProduct(event.target.value)}
                placeholder="X thing — or the real product"
                className="dln-field"
              />
              <input
                value={mustKeep}
                onChange={(event) => setMustKeep(event.target.value)}
                placeholder="Must stay true — cap, finish, type, hands…"
                className="dln-field"
              />
            </div>
          ) : null}

          <div className="studio-acts">
            <button type="button" className="dln-btn" disabled={!prompt.trim() || busy === "gen"} onClick={() => void generate()}>
              {busy === "gen" ? "Making it…" : `Generate · ${stillCost} tokens`}
            </button>
            {href ? (
              <Link href={`/studio/${job.id}/inpaint`} className="dln-chip">
                Inpaint
              </Link>
            ) : null}
          </div>
          {error ? <p className="studio-error">{error}</p> : null}

          <p className="dln-kicker studio-kicker">02 · what we send</p>
          <div className="pipe-note">
            {busy === "steer" && !steered ? (
              <p>Reading the line…</p>
            ) : steered ? (
              <>
                <p>
                  {steered.avenue} · {steered.setting}
                  {attaches.length ? ` · ${attaches.length} pictures in the gen` : ""}
                </p>
                {steered.cleaned !== prompt.trim() ? <p>Cleaned: {steered.cleaned}</p> : null}
                <p>{steered.prompt}</p>
                {steered.missing.length ? (
                  <p className="studio-warn">Still missing: {steered.missing.join("; ")}.</p>
                ) : null}
              </>
            ) : (
              <p>The steered prompt lands here as you type. Nothing is spent yet.</p>
            )}
          </div>
        </section>
        <section>
          <p className="dln-kicker">03 · output</p>
          <div className="pipe-stage">
            {href ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={href} alt="" />
            ) : (
              <p className="pipe-empty">The picture lands here.</p>
            )}
          </div>
          {job.stills?.length ? (
            <ul className="studio-thumbs">
              {job.stills.slice(0, 12).map((row) => (
                <li key={row.id}>
                  <button type="button" onClick={() => setHref(row.href)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.href} alt="" className={href === row.href ? "is-on" : ""} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
      <VaultSheet
        open={poolOpen}
        plot={plot}
        plotName={plotName}
        attaches={attaches}
        onClose={() => setPoolOpen(false)}
        onChange={setAttaches}
      />
    </>
  );
}

function InpaintRoom({
  job,
  plot,
  plotName,
  stillCost,
  onBalance,
  onJob,
}: {
  job: Project;
  plot: string;
  plotName: string;
  stillCost: number;
  onBalance: (n: number) => void;
  onJob: (job: Project) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const painting = useRef(false);
  const [prompt, setPrompt] = useState("");
  const [source, setSource] = useState(job.stills?.[0]?.href || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [href, setHref] = useState("");
  const [poolOpen, setPoolOpen] = useState(false);
  const [picked, setPicked] = useState<Attach | null>(
    job.stills?.[0]
      ? { id: job.stills[0].id, href: job.stills[0].href, title: job.stills[0].title, lane: "picture", note: "" }
      : null,
  );

  useEffect(() => {
    if (!source && job.stills?.[0]?.href) setSource(job.stills[0].href);
  }, [job.stills, source]);

  function paintAt(event: PointerEvent<HTMLCanvasElement>) {
    const node = canvas.current;
    if (!node) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    const box = node.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * node.width;
    const y = ((event.clientY - box.top) / box.height) * node.height;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  function clearMask() {
    const node = canvas.current;
    if (!node) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, node.width, node.height);
  }

  useEffect(() => {
    const node = canvas.current;
    const box = frame.current;
    if (!node || !box) return;
    node.width = Math.max(box.clientWidth, 640);
    node.height = Math.max(box.clientHeight, 420);
    clearMask();
  }, [source]);

  async function fill() {
    if (!prompt.trim() || !source || !canvas.current) return;
    setBusy(true);
    setError("");
    const mask = await new Promise<Blob | null>((resolve) => canvas.current?.toBlob(resolve, "image/png"));
    if (!mask) {
      setBusy(false);
      setError("Paint a hole first.");
      return;
    }
    const form = new FormData();
    form.set("projectId", job.id);
    form.set("plotSlug", plot);
    form.set("plotName", plotName);
    form.set("prompt", prompt.trim());
    form.set("sourceHref", source);
    form.set("mask", mask, "mask.png");
    const res = await fetch("/api/studio/inpaint", { method: "POST", credentials: "include", body: form });
    const body = (await res.json().catch(() => ({}))) as { href?: string; error?: string; balance?: number };
    setBusy(false);
    if (typeof body.balance === "number") onBalance(body.balance);
    if (!res.ok || !body.href) {
      setError(body.error || "Fill failed.");
      return;
    }
    setHref(body.href);
    onJob({
      ...job,
      stills: [
        { id: body.href, href: body.href, title: prompt.trim(), createdAt: new Date().toISOString() },
        ...(job.stills || []),
      ],
    });
  }

  return (
    <>
      <main className="studio-desk-grid">
        <section>
          <p className="dln-kicker">01 · /inpaint</p>
          <h1 className="dln-title">Paint a hole</h1>
          <p className="dln-lede">Newest gen first, else a brand still from the vault. Paint the hole, then say what goes in.</p>
          <div className="studio-assets-row">
            <p className="pipe-control-label">The still</p>
            <button type="button" className="dln-chip" onClick={() => setPoolOpen(true)}>
              {picked ? "Change still · vault" : "Open assets"}
            </button>
            {picked ? (
              <ul className="studio-attach-list">
                <AttachRow item={picked} onRemove={() => setPicked(null)} />
              </ul>
            ) : (
              <p className="studio-hint">Open assets and pick a still from this site’s vault.</p>
            )}
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            placeholder="What goes in the hole"
            className="dln-field studio-field"
          />
          <div className="studio-acts">
            <button type="button" className="dln-btn" disabled={busy || !prompt.trim() || !source} onClick={() => void fill()}>
              {busy ? "Filling…" : `Fill · ${stillCost} tokens`}
            </button>
            <button type="button" className="dln-chip" onClick={clearMask}>
              Clear the hole
            </button>
          </div>
          {error ? <p className="studio-error">{error}</p> : null}
        </section>
        <section>
          <p className="dln-kicker">02 · frame</p>
          <div className="pipe-stage studio-inpaint-stage" ref={frame}>
            {source ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={source} alt="" />
            ) : (
              <p className="pipe-empty">Open assets and pick a still.</p>
            )}
            <canvas
              ref={canvas}
              onPointerDown={(event) => {
                painting.current = true;
                paintAt(event);
              }}
              onPointerMove={(event) => {
                if (painting.current) paintAt(event);
              }}
              onPointerUp={() => {
                painting.current = false;
              }}
              onPointerLeave={() => {
                painting.current = false;
              }}
            />
          </div>
          {href ? (
            <div className="pipe-stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={href} alt="" />
            </div>
          ) : null}
        </section>
      </main>
      <VaultSheet
        open={poolOpen}
        plot={plot}
        plotName={plotName}
        attaches={picked ? [picked] : []}
        single
        onClose={() => setPoolOpen(false)}
        onChange={(rows) => {
          const next = rows[0] || null;
          setPicked(next);
          if (next) setSource(next.href);
        }}
      />
    </>
  );
}

function TextRoom({
  job,
  plot,
  plotName,
  stillCost,
  onBalance,
}: {
  job: Project;
  plot: string;
  plotName: string;
  stillCost: number;
  onBalance: (n: number) => void;
}) {
  const [kind, setKind] = useState<TextKind>("press");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [offer, setOffer] = useState("");
  const [cta, setCta] = useState("");
  const [mustKeep, setMustKeep] = useState("");
  const [attaches, setAttaches] = useState<Attach[]>([]);
  const [poolOpen, setPoolOpen] = useState(false);
  const [busy, setBusy] = useState<"steer" | "gen" | null>(null);
  const [error, setError] = useState("");
  const [href, setHref] = useState("");
  const [body, setBody] = useState("");
  const [provider, setProvider] = useState("");
  const [steered, setSteered] = useState<TextSteer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!prompt.trim()) {
        setSteered(null);
        return;
      }
      setBusy("steer");
      void fetch("/api/studio/text", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steerOnly: true,
          plotSlug: plot,
          plotName,
          kind,
          title: title.trim(),
          prompt: prompt.trim(),
          extras: { audience, offer, cta, mustKeep, plotName },
          attaches,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.steered) setSteered(data.steered);
        })
        .finally(() => setBusy((value) => (value === "steer" ? null : value)));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [prompt, kind, title, audience, offer, cta, mustKeep, attaches, plot, plotName]);

  async function write() {
    if (!prompt.trim()) return;
    setBusy("gen");
    setError("");
    const res = await fetch("/api/studio/text", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: job.id,
        plotSlug: plot,
        plotName,
        kind,
        title: title.trim(),
        prompt: prompt.trim(),
        extras: { audience, offer, cta, mustKeep, plotName },
        attaches,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      href?: string;
      body?: string;
      error?: string;
      balance?: number;
      provider?: string;
      steered?: TextSteer;
    };
    setBusy(null);
    if (typeof data.balance === "number") onBalance(data.balance);
    if (!res.ok || !data.href) {
      setError(data.error || "Could not write that.");
      return;
    }
    setHref(data.href);
    setBody(data.body || "");
    setProvider(data.provider || "");
    if (data.steered) setSteered(data.steered);
  }

  const openLabel =
    kind === "slides" ? "Open the slides" : kind === "social" ? "Open the caption" : "Open the PDF";

  return (
    <>
      <main className="studio-desk-grid">
        <section>
          <p className="dln-kicker">01 · /text</p>
          <h1 className="dln-title">Write from this project</h1>
          <p className="dln-lede">
            Same job as the picture. Press pack, a social post, or slides for a room. We steer the brief; the file
            lands in this site’s vault.
          </p>

          <div className="pipe-control">
            <p className="pipe-control-label">The job</p>
            <div className="pipe-control-row">
              {TEXT_JOBS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pipe-seg ${kind === item.id ? "is-on" : ""}`}
                  onClick={() => setKind(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="studio-assets-row">
            <p className="pipe-control-label">Pictures on this job</p>
            <button type="button" className="dln-chip" onClick={() => setPoolOpen(true)}>
              {attaches.length ? `${attaches.length} attached · edit` : "Open assets"}
            </button>
            {attaches.length ? (
              <ul className="studio-attach-list">
                {attaches.map((item) => (
                  <AttachRow
                    key={item.id}
                    item={item}
                    onRemove={() => setAttaches(attaches.filter((row) => row.id !== item.id))}
                  />
                ))}
              </ul>
            ) : (
              <p className="studio-hint">Attach stills from the vault if the page should carry them.</p>
            )}
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title — optional"
            className="dln-field studio-field"
          />
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            placeholder={
              kind === "social"
                ? "What should this post say, and who is it for?"
                : kind === "slides"
                  ? "What is the meeting, and what should they leave knowing?"
                  : "What should this press pack cover, and who is it for?"
            }
            className="dln-field studio-field"
          />
          <div className="studio-plus-fields">
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="Who it is for — promoters, press, a market"
              className="dln-field"
            />
            <input
              value={offer}
              onChange={(event) => setOffer(event.target.value)}
              placeholder="The offer or the news"
              className="dln-field"
            />
            <input
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="Call to action"
              className="dln-field"
            />
            <input
              value={mustKeep}
              onChange={(event) => setMustKeep(event.target.value)}
              placeholder="Must stay true — names, dates, claims"
              className="dln-field"
            />
          </div>
          <div className="studio-acts">
            <button type="button" className="dln-btn" disabled={busy === "gen" || !prompt.trim()} onClick={() => void write()}>
              {busy === "gen" ? "Writing…" : `Write · ${stillCost} tokens`}
            </button>
          </div>
          {error ? <p className="studio-error">{error}</p> : null}

          <p className="dln-kicker studio-kicker">02 · what we send</p>
          <div className="pipe-note">
            {busy === "steer" && !steered ? (
              <p>Reading the brief…</p>
            ) : steered ? (
              <>
                <p>
                  {steered.setting}
                  {attaches.length ? ` · ${attaches.length} refs` : ""}
                </p>
                {steered.cleaned !== prompt.trim() ? <p>Cleaned: {steered.cleaned}</p> : null}
                {steered.missing.length ? (
                  <p className="studio-warn">Still missing: {steered.missing.join("; ")}.</p>
                ) : null}
              </>
            ) : (
              <p>The steered brief lands here as you type. Nothing is spent yet.</p>
            )}
          </div>
        </section>
        <section>
          <p className="dln-kicker">03 · document</p>
          <div className="pipe-stage studio-doc">
            {body ? (
              <>
                {provider ? <p className="studio-hint">Written on this house · {provider}</p> : null}
                <p>{body}</p>
                {href ? (
                  <p>
                    <a href={href} target="_blank" rel="noreferrer">
                      {openLabel}
                    </a>
                  </p>
                ) : null}
              </>
            ) : (
              <p className="pipe-empty">The document lands here, and in the vault.</p>
            )}
          </div>
        </section>
      </main>
      <VaultSheet
        open={poolOpen}
        plot={plot}
        plotName={plotName}
        attaches={attaches}
        onClose={() => setPoolOpen(false)}
        onChange={setAttaches}
      />
    </>
  );
}

function VaultSheet({
  open,
  plot,
  plotName,
  attaches,
  onClose,
  onChange,
  single = false,
}: {
  open: boolean;
  plot: string;
  plotName: string;
  attaches: Attach[];
  onClose: () => void;
  onChange: (next: Attach[]) => void;
  single?: boolean;
}) {
  const kit = vaultKitForPlot(plot) || plot;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggle(item: AssetItem) {
    const next = attachFromAsset(item);
    if (single) {
      onChange(attaches[0]?.id === item.id ? [] : [next]);
      return;
    }
    const has = attaches.some((row) => row.id === item.id);
    onChange(has ? attaches.filter((row) => row.id !== item.id) : [...attaches, next]);
  }

  if (!open) return null;

  return (
    <div className="pipe-overlay" onClick={onClose} role="presentation">
      <div
        className="pipe-sheet pipe-sheet-vault"
        role="dialog"
        aria-modal="true"
        aria-label={`${plotName} vault`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="studio-vault-head">
          <div>
            <p className="dln-kicker">{plotName}</p>
            <h2 className="dln-title studio-vault-title">The vault</h2>
            <p className="dln-lede">
              This site’s folder — the same book as Account → Assets. Drop or click to upload; it lands here and
              attaches. Picked stills carry an ink frame; click again or Remove to take them off. The press kit is
              only a share flag on the same files.
            </p>
          </div>
          <div className="pipe-control-row">
            <a href={`/account?desk=assets&kit=${encodeURIComponent(kit)}`} className="dln-chip">
              Full vault
            </a>
            <button type="button" className="dln-chip" onClick={onClose}>
              Done
            </button>
          </div>
        </div>

        <AssetHub
          lockedKit={kit}
          pick
          pickedIds={attaches.map((row) => row.id)}
          onToggle={toggle}
          onUploaded={(item) => {
            const next = attachFromAsset(item);
            onChange(single ? [next] : [...attaches.filter((row) => row.id !== item.id), next]);
          }}
        />

        {attaches.length ? (
          <ul className="studio-pick-notes">
            {attaches.map((item) => (
              <li key={item.id}>
                <AttachFace href={item.href} title={item.title} kind={item.kind} />
                <div>
                  <p>
                    {item.title}
                    <em>{item.lane}</em>
                  </p>
                  {single ? null : (
                    <input
                      value={item.note}
                      onChange={(event) =>
                        onChange(attaches.map((row) => (row.id === item.id ? { ...row, note: event.target.value } : row)))
                      }
                      placeholder="what to take from this still"
                      className="dln-field"
                    />
                  )}
                  <button
                    type="button"
                    className="dln-chip"
                    onClick={() => onChange(attaches.filter((row) => row.id !== item.id))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
