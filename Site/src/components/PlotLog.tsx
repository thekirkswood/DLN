"use client";

import { useEffect, useState } from "react";

export function PlotLog({ slug }: { slug: string }) {
  const [lines, setLines] = useState<
    { t: string; s: string; lines?: string[] }[] | null
  >(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/plots/log?plot=${encodeURIComponent(slug)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { lines?: { t: string; s: string; lines?: string[] }[] }) => {
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
        <ol className="campus-site-log-clip">
          {lines.map((row) => (
            <li key={`${row.t}-${row.s}`}>
              <time dateTime={row.t}>
                {new Date(row.t).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
              <p>{row.s}</p>
              {row.lines?.length ? (
                <ul>
                  {row.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
