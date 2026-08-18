"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LabComment } from "@/components/LabComment";
import { useEnsureHouse } from "@/components/EnsureHouse";

export function LabStation({
  slug,
  name,
  src,
  hint,
  port,
}: {
  slug: string;
  name: string;
  src: string;
  hint: string;
  port: number | null;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [page, setPage] = useState("/");
  const run = useEnsureHouse(port ? slug : null);
  const phase = port ? (run === "idle" ? "starting" : run) : "error";
  const frameSrc = phase === "ready" ? src : "";

  useEffect(() => {
    const timer = window.setInterval(() => {
      try {
        const win = frameRef.current?.contentWindow;
        if (!win) return;
        const path = win.location.pathname || "/";
        const prefix = `/go/${slug}`;
        const inner = path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
        setPage(inner);
      } catch {
        /* cross-origin — house not behind /go with BASE_PATH */
      }
    }, 800);
    return () => window.clearInterval(timer);
  }, [slug]);

  return (
    <div className="lab-station">
      <div className="lab-station-bar wrap">
        <div>
          <p className="kicker">Station</p>
          <h1>{name}</h1>
        </div>
        <nav className="lab-station-nav">
          <Link href="/lab">All builds</Link>
          <Link href={`/lab/${slug}/admin`}>Unit builder</Link>
        </nav>
      </div>
      {phase === "starting" ? (
        <div className="lab-empty wrap">
          <p className="body">Starting {name} in its own room. A moment.</p>
        </div>
      ) : null}
      {phase === "error" ? (
        <div className="lab-empty wrap">
          <p className="body">
            This house did not come up. The builder can start it from the
            folder. {hint ? <code>{hint}</code> : null}
          </p>
        </div>
      ) : null}
      {phase === "ready" && frameSrc ? (
        <iframe
          ref={frameRef}
          className="lab-frame"
          title={name}
          src={frameSrc}
        />
      ) : null}
      <div className="lab-dock wrap">
        <LabComment plot={slug} page={page} compact />
      </div>
    </div>
  );
}
