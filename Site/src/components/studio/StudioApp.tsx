"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mark } from "@/components/Mark";
import { readLastPlot, writeLastPlot } from "@/data/campus";

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
type PoolItem = {
  id: string;
  href: string;
  title: string;
  lane: string;
  laneLabel: string;
  flags?: { logo?: boolean; pack?: boolean };
  note?: string;
  source?: "job" | "vault";
};
type Attach = { id: string; href: string; title: string; lane: string; note: string };
type Steer = { prompt: string; cleaned: string; avenue: string; setting: string; missing: string[] };
type Sort = "recent" | "name";

const AVENUES = [
  { id: "auto" as const, label: "Auto" },
  { id: "brand" as const, label: "Brand" },
  { id: "social" as const, label: "Social" },
  { id: "editorial" as const, label: "Editorial" },
];

const FOLDERS = [
  { id: "all", label: "All" },
  { id: "job", label: "This job" },
  { id: "logo", label: "Logo" },
  { id: "pack", label: "Pack" },
  { id: "people", label: "People" },
  { id: "promo", label: "Promo" },
  { id: "banner", label: "Banner" },
  { id: "picture", label: "Picture" },
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
  if (lane === "pack") return "use the bottle from this — copy type, cap, finish";
  if (lane === "logo") return "use this mark";
  return "";
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
  const [sort, setSort] = useState<Sort>("recent");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const plotName = plots.find((row) => row.slug === plot)?.name || plot;
  const held = useMemo(() => ledgers.find((row) => row.plotSlug === plot) || null, [ledgers, plot]);

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
      rows.some((row) => row.plotSlug === plot)
        ? rows.map((row) => (row.plotSlug === plot ? { ...row, balance: next } : row))
        : [...rows, { plotSlug: plot, balance: next, grantedThisPeriod: 0 }],
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
              <span className="pipe-tab pipe-tokens">{tokens} Instant updates</span>
            ) : (
              <span className="pipe-tab pipe-tokens">{plotName || "This site"} · a still is {stillCost}</span>
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
          <TextRoom job={job} plot={plot} plotName={plotName} stillCost={stillCost} onBalance={onBalance} />
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
            How you write is separate from the job. Open assets for this site’s vault — each still can say what to take
            from it. A still is {stillCost} Instant updates.
          </p>

          <div className="studio-assets-row">
            <p className="pipe-control-label">Pictures on this prompt</p>
            <button type="button" className="dln-chip" onClick={() => setPoolOpen(true)}>
              {attaches.length ? `${attaches.length} attached · edit` : "Open assets"}
            </button>
            {attaches.length ? (
              <ul className="studio-attach-list">
                {attaches.map((item) => (
                  <li key={item.id} className="pipe-attach">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.href} alt="" />
                    <p>
                      <span>{item.lane}</span>
                      {item.note ? ` — ${item.note}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="studio-hint">Nothing attached yet. Open assets and pick what this still is for.</p>
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
              {busy === "gen" ? "Making it…" : `Generate · ${stillCost} Instant updates`}
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
                  {attaches.length ? ` · ${attaches.length} refs` : ""}
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
        job={job}
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
  const [vault, setVault] = useState<PoolItem[]>([]);
  const [poolOpen, setPoolOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/studio/pool?plot=${encodeURIComponent(plot)}`, { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setVault(Array.isArray(body.items) ? body.items : []))
      .catch(() => {});
  }, [plot]);

  const choices = useMemo(() => {
    const fromJob = (job.stills || []).map((row) => ({
      id: row.id,
      href: row.href,
      title: row.title,
      lane: "picture",
      laneLabel: "Picture",
      source: "job" as const,
    }));
    const logos = vault.filter((row) => row.flags?.logo || row.lane === "logo" || row.flags?.pack);
    const seen = new Set<string>();
    return [...fromJob, ...logos, ...vault].filter((row) => {
      if (seen.has(row.href)) return false;
      seen.add(row.href);
      return true;
    });
  }, [job.stills, vault]);

  useEffect(() => {
    if (!source && choices[0]) setSource(choices[0].href);
  }, [choices, source]);

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
              Open assets
            </button>
            <div className="pipe-control-row">
              {choices.slice(0, 6).map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={`pipe-seg ${source === row.href ? "is-on" : ""}`}
                  onClick={() => setSource(row.href)}
                >
                  {row.title || "Still"}
                </button>
              ))}
            </div>
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
              {busy ? "Filling…" : `Fill · ${stillCost} Instant updates`}
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
        job={job}
        attaches={source ? [{ id: source, href: source, title: "Still", lane: "picture", note: "" }] : []}
        onClose={() => setPoolOpen(false)}
        onChange={(rows) => {
          if (rows[0]) setSource(rows[0].href);
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
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [href, setHref] = useState("");
  const [body, setBody] = useState("");

  async function write() {
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/studio/text", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: job.id,
        plotSlug: plot,
        plotName,
        title: title.trim(),
        prompt: prompt.trim(),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      href?: string;
      body?: string;
      error?: string;
      balance?: number;
    };
    setBusy(false);
    if (typeof data.balance === "number") onBalance(data.balance);
    if (!res.ok || !data.href) {
      setError(data.error || "Could not write that.");
      return;
    }
    setHref(data.href);
    setBody(data.body || "");
  }

  return (
    <main className="studio-desk-grid">
      <section>
        <p className="dln-kicker">01 · /text</p>
        <h1 className="dln-title">Write a document</h1>
        <p className="dln-lede">A letter, a one-pager, a PDF for the brand. It lands in Assets on this site.</p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title — optional"
          className="dln-field studio-field"
        />
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={7}
          placeholder="What should this document be, and who is it for?"
          className="dln-field studio-field"
        />
        <div className="studio-acts">
          <button type="button" className="dln-btn" disabled={busy || !prompt.trim()} onClick={() => void write()}>
            {busy ? "Writing…" : `Write · ${stillCost} Instant updates`}
          </button>
        </div>
        {error ? <p className="studio-error">{error}</p> : null}
      </section>
      <section>
        <p className="dln-kicker">02 · document</p>
        <div className="pipe-stage studio-doc">
          {body ? (
            <>
              <p>{body}</p>
              {href ? (
                <p>
                  <a href={href} target="_blank" rel="noreferrer">
                    Open the PDF
                  </a>
                </p>
              ) : null}
            </>
          ) : (
            <p className="pipe-empty">The document lands here.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function VaultSheet({
  open,
  plot,
  plotName,
  job,
  attaches,
  onClose,
  onChange,
}: {
  open: boolean;
  plot: string;
  plotName: string;
  job: Project;
  attaches: Attach[];
  onClose: () => void;
  onChange: (next: Attach[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<"pack" | "logo" | "ref">("ref");
  const [items, setItems] = useState<PoolItem[]>([]);
  const [house, setHouse] = useState(plotName);
  const [folder, setFolder] = useState("all");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    if (!plot) return;
    fetch(`/api/studio/pool?plot=${encodeURIComponent(plot)}`, { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        const vault = (Array.isArray(body.items) ? body.items : []).map((item: PoolItem) => ({
          ...item,
          source: "vault" as const,
        }));
        const jobRows: PoolItem[] = (job.stills || []).map((row) => ({
          id: `job:${row.id}`,
          href: row.href,
          title: row.title,
          lane: "picture",
          laneLabel: "Picture",
          source: "job",
        }));
        setItems([...jobRows, ...vault]);
        if (body.house) setHouse(body.house);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [plot, job.stills]);

  useEffect(() => {
    if (!open) return;
    setReady(false);
    load();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, load, onClose]);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: items.length, job: 0 };
    for (const item of items) {
      if (item.source === "job") next.job = (next.job || 0) + 1;
      const lane = item.lane || "picture";
      next[lane] = (next[lane] || 0) + 1;
    }
    return next;
  }, [items]);

  const shown = useMemo(() => {
    if (folder === "all") return items;
    if (folder === "job") return items.filter((row) => row.source === "job");
    return items.filter((row) => (row.lane || "picture") === folder);
  }, [items, folder]);

  function toggle(item: PoolItem) {
    const has = attaches.some((row) => row.id === item.id);
    onChange(
      has
        ? attaches.filter((row) => row.id !== item.id)
        : [
            ...attaches,
            {
              id: item.id,
              href: item.href,
              title: item.title,
              lane: item.lane,
              note: defaultNote(item.lane),
            },
          ],
    );
  }

  async function upload(file: File, kind: "pack" | "logo" | "ref") {
    setBusy(true);
    const form = new FormData();
    form.set("plotSlug", plot);
    form.set("file", file);
    form.set("title", file.name.replace(/\.[^.]+$/, ""));
    if (kind === "logo") form.set("logo", "1");
    if (kind === "pack") form.set("pack", "1");
    await fetch("/api/studio/deposit", { method: "POST", credentials: "include", body: form });
    setBusy(false);
    load();
  }

  if (!open) return null;

  return (
    <div className="pipe-overlay" onClick={onClose} role="presentation">
      <div
        className="pipe-sheet pipe-sheet-vault"
        role="dialog"
        aria-modal="true"
        aria-label={`${house || plotName} vault`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="studio-vault-head">
          <div>
            <p className="dln-kicker">{house || plotName}</p>
            <h2 className="dln-title studio-vault-title">The vault</h2>
            <p className="dln-lede">
              This site’s folder — the same book as Assets on the account. Jobs pick from it. Upload lands in this house,
              not a private dump.
            </p>
          </div>
          <div className="pipe-control-row">
            <a href={`/account?desk=assets&kit=${encodeURIComponent(plot)}`} className="dln-chip">
              Full vault
            </a>
            <button type="button" className="dln-chip" onClick={onClose}>
              Done
            </button>
          </div>
        </div>

        <div className="pipe-control-row studio-vault-folders">
          {FOLDERS.filter((row) => row.id === "all" || row.id === "job" || (counts[row.id] || 0) > 0).map((row) => (
            <button
              key={row.id}
              type="button"
              className={`dln-chip ${folder === row.id ? "is-on" : ""}`}
              onClick={() => setFolder(row.id)}
            >
              {row.label}
              {counts[row.id] ? ` · ${counts[row.id]}` : ""}
            </button>
          ))}
        </div>

        <div className="pipe-control-row">
          {(["pack", "logo", "ref"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className="dln-chip"
              disabled={busy}
              onClick={() => {
                kindRef.current = kind;
                fileRef.current?.click();
              }}
            >
              {kind === "ref" ? "Upload a picture" : `Upload ${kind}`}
            </button>
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = "";
            if (file) void upload(file, kindRef.current);
          }}
        />

        {!ready ? (
          <p className="studio-hint">Opening the vault…</p>
        ) : shown.length === 0 ? (
          <p className="studio-hint">
            {folder === "job"
              ? "Nothing on this job yet. Generated stills land here."
              : `Nothing in the ${house || plotName} vault${folder !== "all" ? ` · ${folder}` : ""} yet.`}
          </p>
        ) : (
          <ul className="studio-vault-grid">
            {shown.map((item) => {
              const attach = attaches.find((row) => row.id === item.id);
              return (
                <li key={item.id} className={`pipe-pick ${attach ? "is-on" : ""}`}>
                  <button type="button" className="pipe-pick-still" onClick={() => toggle(item)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.href} alt="" />
                    <span>
                      {item.laneLabel || item.lane}
                      {item.source === "job" ? " · this job" : ""}
                    </span>
                  </button>
                  {attach ? (
                    <input
                      value={attach.note}
                      onChange={(event) =>
                        onChange(attaches.map((row) => (row.id === item.id ? { ...row, note: event.target.value } : row)))
                      }
                      placeholder={
                        item.lane === "pack"
                          ? "use the bottle from this"
                          : item.lane === "logo"
                            ? "use this mark"
                            : "her hair / her makeup / the light…"
                      }
                      className="dln-field"
                    />
                  ) : (
                    <p className="studio-hint">{item.note || item.title}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
