"use client";

import { useEffect, useMemo, useState } from "react";
import { CaptureWell } from "@/components/CaptureWell";
import { CommentBox } from "@/components/CommentBox";
import { epkHref } from "@/lib/epk-map";

export type SitePage = { name: string; path: string };

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
  const [hits, setHits] = useState<number | null>(null);
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
    setHits(null);
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
    setPage(path);
    setFrame(next);
  }

  const pageName =
    pages.find((row) => row.path === page)?.name || "this page";

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
      {showPress ? (
        <section className="campus-site-press">
          <h3>Press kit</h3>
          {kit ? (
            <a href={epkHref(kit)}>Open the pack</a>
          ) : (
            <p>The pack sits with this site.</p>
          )}
        </section>
      ) : null}
      {signedIn ? <PlotLog slug={slug} /> : null}
    </div>
  );
}

function PlotLog({ slug }: { slug: string }) {
  const [lines, setLines] = useState<{ t: string; s: string }[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/plots/log?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { lines?: { t: string; s: string }[] }) => {
        if (alive) setLines(data.lines || []);
      })
      .catch(() => {
        if (alive) setLines([]);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <div className="campus-site-log">
      <h2>Patch notes</h2>
      {lines === null ? (
        <p>Loading the notes.</p>
      ) : lines.length === 0 ? (
        <p>When we update this site, the notes land here — date, then what changed.</p>
      ) : (
        <ol>
          {lines.map((row) => (
            <li key={`${row.t}-${row.s}`}>
              <time dateTime={row.t}>
                {new Date(row.t).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
              <span>{row.s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
