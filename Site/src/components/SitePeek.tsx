"use client";

import { useEffect, useMemo, useState } from "react";
import { CaptureWell } from "@/components/CaptureWell";
import { CommentBox } from "@/components/CommentBox";
import { PlotLog } from "@/components/PlotLog";
import { epkHref } from "@/lib/epk-map";

export type SitePage = { name: string; path: string };

type SiteMap = {
  hits: number;
  pages: { path: string; name: string; hits: number }[];
  from: { label: string; hits: number }[];
};

export function SitePeek({
  name,
  slug,
  live,
  sandbox,
  lab,
  pages,
  src,
  kit = null,
  showPress = false,
  signedIn = false,
}: {
  name: string;
  slug: string;
  live: string | null;
  sandbox: string | null;
  lab: boolean;
  pages: SitePage[];
  src: string;
  kit?: string | null;
  showPress?: boolean;
  signedIn?: boolean;
}) {
  const [frame, setFrame] = useState(lab ? "" : src);
  const [note, setNote] = useState(lab ? "Calling the house." : "");
  const [sandboxUp, setSandboxUp] = useState<boolean | null>(null);
  const [map, setMap] = useState<SiteMap | null>(null);
  const [openMap, setOpenMap] = useState(false);
  const [page, setPage] = useState(pages[0]?.path || "/");
  const pageKey = useMemo(
    () => pages.map((row) => `${row.name}:${row.path}`).join("|"),
    [pages],
  );

  useEffect(() => {
    setPage(pages[0]?.path || "/");
  }, [slug, pageKey, pages]);

  useEffect(() => {
    let alive = true;
    setMap(null);
    setOpenMap(false);
    fetch(`/api/plots/stats?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: SiteMap & { hits?: number }) => {
        if (!alive) return;
        setMap({
          hits: typeof data.hits === "number" ? data.hits : 0,
          pages: Array.isArray(data.pages) ? data.pages : [],
          from: Array.isArray(data.from) ? data.from : [],
        });
      })
      .catch(() => {
        if (alive) setMap({ hits: 0, pages: [], from: [] });
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    let alive = true;
    if (!lab) {
      setFrame(src);
      setNote("");
      setSandboxUp(true);
      return;
    }
    setFrame("");
    setNote("Calling the house.");
    fetch(`/api/houses/wake?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { ok?: boolean; called?: boolean; url?: string }) => {
        if (!alive) return;
        setFrame(data.url || src);
        setSandboxUp(Boolean(data.ok));
        if (data.ok) setNote("");
        else if (data.called) setNote("Called — if it stays blank, the port is still coming up.");
        else setNote("Port quiet — the link is the IP.");
      })
      .catch(() => {
        if (!alive) return;
        setFrame(src);
        setSandboxUp(false);
        setNote("Port quiet — the link is the IP.");
      });
    return () => {
      alive = false;
    };
  }, [lab, slug, src]);

  function openPage(path: string) {
    const base = (sandbox || src).replace(/\/$/, "");
    const next = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    setPage(path);
    setFrame(next);
  }

  const pageName =
    pages.find((row) => row.path === page)?.name || "this page";
  const hits = map?.hits;
  const hasLive = Boolean(live);

  return (
    <div className="campus-site-tab">
      <div className="campus-site-head">
        <h2>{name}</h2>
        {hasLive ? null : (
          <p className="campus-site-live-ask">
            <a href="/host">No live site yet.</a>
          </p>
        )}
        <p className="campus-site-hits">
          {hits === null || map === null ? (
            "Counting hits."
          ) : (
            <button
              type="button"
              className="campus-site-hits-open"
              aria-expanded={openMap}
              onClick={() => setOpenMap((v) => !v)}
            >
              {hits} hits on the sandbox.
            </button>
          )}
        </p>
        {openMap && map ? (
          <div className="campus-site-map">
            <h3>Most opened</h3>
            {map.pages.length ? (
              <ol>
                {map.pages.map((row) => (
                  <li key={row.path}>
                    <strong>{row.name}</strong>
                    <span>{row.hits}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No walks on the sandbox yet.</p>
            )}
            <h3>Where from</h3>
            {map.from.length ? (
              <ol>
                {map.from.map((row) => (
                  <li key={row.label}>
                    <strong>{row.label}</strong>
                    <span>{row.hits}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No entry walks yet.</p>
            )}
          </div>
        ) : null}
        <p className="site-acts">
          {hasLive ? (
            <a href={live as string} target="_blank" rel="noreferrer">
              Live site
            </a>
          ) : (
            <span className="site-act-off">Live site</span>
          )}
          {sandbox ? (
            <button
              type="button"
              className="campus-site-sandbox"
              onClick={() => setFrame(sandbox)}
            >
              Sandbox · {sandboxUp === false ? "down" : "live"}
            </button>
          ) : null}
          {showPress && kit ? (
            <a href={epkHref(kit)} className="campus-site-sandbox">
              EPK
            </a>
          ) : null}
        </p>
      </div>
      <div className="campus-plot-preview chamfer">
        {note ? <p className="campus-plot-note">{note}</p> : null}
        {frame ? (
          <iframe title={`${name} site`} src={frame} loading="lazy" />
        ) : null}
      </div>
      {pages.length ? (
        <nav className="campus-site-pages" aria-label="Main pages">
          {pages.map((row) => (
            <button
              key={row.path}
              type="button"
              className={page === row.path ? "is-on" : undefined}
              aria-pressed={page === row.path}
              onClick={() => openPage(row.path)}
            >
              {row.name}
            </button>
          ))}
        </nav>
      ) : null}
      {signedIn ? (
        <div className="campus-site-talk">
          <CaptureWell
            plotSlug={slug}
            plotOptions={[{ slug, name }]}
            page={page}
            pageName={pageName}
          />
          <CommentBox
            plotSlug={slug}
            plotOptions={[{ slug, name }]}
            kind="hotfix"
            title="Hotfix"
            hint="Something is wrong right now."
            label="What is wrong"
            cta="Send hotfix"
            rows={4}
            page={page}
          />
        </div>
      ) : null}
      {signedIn ? <PlotLog key={slug} slug={slug} /> : null}
    </div>
  );
}
