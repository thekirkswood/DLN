"use client";

import { Component, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

export class StudioBound extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) {
      return <p className="body bill-note">Studio did not hold. Campus is still here.</p>;
    }
    return this.props.children;
  }
}

type Ledger = { plotSlug: string; balance: number; grantedThisPeriod: number };

type Project = {
  id: string;
  title: string;
  plotSlug: string;
  workspaceSlug: string;
  sandboxSlug: string;
  createdAt: string;
};

type Sort = "recent" | "name";

function projectSrc(
  origin: string,
  ticket: string,
  plot: string,
  brand: string,
  workspace: string,
  sandbox: string,
  basePath = "",
) {
  const prefix = basePath.replace(/\/$/, "");
  const next = new URL(`${prefix}/w/${workspace}/s/${sandbox}`, origin);
  next.searchParams.set("hub", window.location.origin);
  next.searchParams.set("ticket", ticket);
  next.searchParams.set("plot", plot);
  if (brand) next.searchParams.set("brand", brand);
  next.searchParams.set("embed", "1");
  return next.toString();
}

export function StudioTab({
  plots,
  lastPlot,
}: {
  plots: { slug: string; name: string }[];
  lastPlot?: string;
}) {
  const [plot, setPlot] = useState(lastPlot || plots[0]?.slug || "");
  const [ticket, setTicket] = useState("");
  const [origin, setOrigin] = useState("");
  const [basePath, setBasePath] = useState("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [stillCost, setStillCost] = useState(12);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sort, setSort] = useState<Sort>("recent");
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const plotName = plots.find((row) => row.slug === plot)?.name || plot;

  useEffect(() => {
    let live = true;
    fetch("/api/studio/enter", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((body) => {
        if (!live) return;
        if (!body?.ok || !body.origin || !body.ticket) {
          setError("Studio is not open on this seat.");
          return;
        }
        setStillCost(body.stillCost || 12);
        setLedgers(Array.isArray(body.ledgers) ? body.ledgers : []);
        setTicket(body.ticket);
        setBasePath(String(body.basePath || ""));
        const next = new URL(body.origin);
        const host = window.location.hostname;
        const lab =
          host === "localhost" ||
          host === "127.0.0.1" ||
          host === "dln.local" ||
          host.endsWith(".local") ||
          /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
        if (lab) {
          next.protocol = window.location.protocol;
          next.hostname = host;
        }
        setOrigin(next.origin);
      })
      .catch(() => {
        if (live) setError("Studio did not answer.");
      });
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
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; projects?: Project[] };
    setProjects(body.projects || []);
  }, []);

  useEffect(() => {
    setOpen(null);
    setTitle("");
    setError("");
    void loadProjects(plot);
  }, [plot, loadProjects]);

  useEffect(() => {
    function onMsg(event: MessageEvent) {
      if (event.data?.type !== "dln-studio-spent") return;
      const balance = Number(event.data.balance);
      const slug = String(event.data.plotSlug || plot);
      if (!Number.isFinite(balance)) return;
      setLedgers((rows) => rows.map((row) => (row.plotSlug === slug ? { ...row, balance } : row)));
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [plot]);

  const held = useMemo(
    () => ledgers.find((row) => row.plotSlug === plot) || ledgers[0],
    [ledgers, plot],
  );

  const shown = useMemo(() => {
    const rows = projects.slice();
    if (sort === "name") rows.sort((a, b) => a.title.localeCompare(b.title));
    return rows;
  }, [projects, sort]);

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
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; project?: Project; error?: string };
    setBusy(false);
    if (!res.ok || !body.project) {
      setError(body.error || "Could not make that project.");
      return;
    }
    setTitle("");
    setProjects((rows) => [body.project as Project, ...rows.filter((row) => row.id !== body.project?.id)]);
    setOpen(body.project);
  }

  const src =
    open && origin && ticket
      ? projectSrc(origin, ticket, plot, plotName, open.workspaceSlug, open.sandboxSlug, basePath)
      : "";

  return (
    <div className="campus-studio">
      <div className="campus-studio-rail">
        {plots.length ? (
          <label className="campus-studio-site">
            Site
            <select
              value={plot}
              onChange={(event) => {
                setPlot(event.target.value);
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
        <p className="campus-plot-note">
          {held ? `${held.balance} Instant updates on ${plotName || "this site"}` : plotName}
          {` · a still is ${stillCost}`}
        </p>
      </div>

      {open ? (
        <>
          <p className="campus-studio-path">
            <button type="button" onClick={() => setOpen(null)}>
              {plotName} projects
            </button>
            <span aria-hidden>/</span>
            <strong>{open.title}</strong>
          </p>
          <div className="campus-studio-frame">
            {src ? <iframe title={open.title} src={src} /> : <p className="campus-plot-note">Opening that project.</p>}
          </div>
        </>
      ) : (
        <div className="campus-studio-projects">
          <p className="kicker">{plotName || "Studio"}</p>
          <h2>Projects</h2>
          <p className="lede">Jobs for this site. Open one to make pictures. Video later.</p>
          <div className="campus-studio-chips">
            <button type="button" className={sort === "recent" ? "is-on" : ""} onClick={() => setSort("recent")}>
              Recent
            </button>
            <button type="button" className={sort === "name" ? "is-on" : ""} onClick={() => setSort("name")}>
              A–Z
            </button>
          </div>
          <form
            className="campus-studio-new"
            onSubmit={(event) => {
              event.preventDefault();
              void createProject();
            }}
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Name a project — a shoot, a campaign, a person"
            />
            <button type="submit" className="chamfer" disabled={busy || !title.trim() || !plot}>
              {busy ? "Making…" : "New project"}
            </button>
          </form>
          {error ? <p className="err">{error}</p> : null}
          <ul>
            {shown.length ? (
              shown.map((row) => (
                <li key={row.id}>
                  <button type="button" className="campus-studio-plate chamfer" onClick={() => setOpen(row)}>
                    <span>
                      <strong>{row.title}</strong>
                      <em>{plotName}</em>
                    </span>
                    <span className="campus-plot-note">{row.createdAt.slice(0, 10)}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="campus-plot-note">No projects on this site yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
