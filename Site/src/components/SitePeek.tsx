"use client";

import { useEffect, useState } from "react";

export type SitePage = { name: string; path: string };

export function SitePeek({
  name,
  slug,
  live,
  sandbox,
  lab,
  pages,
  src,
}: {
  name: string;
  slug: string;
  live: string | null;
  sandbox: string | null;
  lab: boolean;
  pages: SitePage[];
  src: string;
}) {
  const [frame, setFrame] = useState(lab ? "" : src);
  const [note, setNote] = useState(lab ? "Calling the house." : "");
  const [sandboxUp, setSandboxUp] = useState<boolean | null>(null);
  const [hits, setHits] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/plots/stats?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { hits?: number }) => {
        if (alive) setHits(typeof data.hits === "number" ? data.hits : 0);
      })
      .catch(() => {
        if (alive) setHits(0);
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
    const base = (live || src).replace(/\/$/, "");
    const next = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    setFrame(next);
  }

  return (
    <div className="campus-site-tab">
      <div className="campus-site-head">
        <h2>{name}</h2>
        <p className="campus-site-hits">
          {hits === null ? "Counting hits." : `${hits} hits on the live site.`}
        </p>
        <p className="site-acts">
          {live ? (
            <a href={live} target="_blank" rel="noreferrer">
              Live site
            </a>
          ) : null}
          {sandbox ? (
            <button
              type="button"
              className="campus-site-sandbox"
              onClick={() => setFrame(sandbox)}
            >
              Sandbox · {sandboxUp === false ? "down" : "live"}
            </button>
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
          {pages.map((page) => (
            <button
              key={page.path}
              type="button"
              onClick={() => openPage(page.path)}
            >
              {page.name}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
