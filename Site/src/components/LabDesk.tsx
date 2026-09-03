"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useEnsureHouse } from "@/components/EnsureHouse";
import { KIND_LABEL, LabCompose, LabThumbs, type LabKind } from "@/components/LabCompose";
import { labStationPath } from "@/lib/lab-host";
import { CAMPUS_PAGES, campusPageLabel } from "@/lib/campus-pages";

type LabMessage = {
  id: string;
  createdAt: string;
  author: string;
  authorId: string;
  kind: LabKind;
  text: string;
  images: string[];
  status: "pending" | "working" | "done" | "error";
  reply?: string;
  repliedAt?: string;
  plot: string;
  page?: string;
};

export function LabDesk({
  plot,
  houseName,
}: {
  plot: string;
  houseName: string;
}) {
  const [messages, setMessages] = useState<LabMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLost, setAuthLost] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const campus = plot === "dln";
  const [page, setPage] = useState(campus ? "/admin" : `/lab/${plot}/admin`);
  const phase = useEnsureHouse(campus ? null : plot);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/lab/messages?plot=${encodeURIComponent(plot)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.status === 401) {
        setAuthLost(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { messages?: LabMessage[] };
      setAuthLost(false);
      setMessages(data.messages || []);
      setLoading(false);
    } catch {
      /* Campus rebuild or blip — keep the compose box. */
    }
  }, [plot]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 8000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const pendingCount = useMemo(
    () => messages.filter((m) => m.status === "pending" || m.status === "working").length,
    [messages],
  );

  if (loading) {
    return (
      <div className="lab-desk wrap">
        <p className="kicker">{campus ? "Campus" : `Unit · ${houseName}`}</p>
        <h1>{campus ? "Campus building site" : houseName}</h1>
        {!campus && phase === "starting" ? (
          <p className="body">Starting the {houseName} app in its own room.</p>
        ) : null}
        <p className="body">Loading the queue…</p>
      </div>
    );
  }

  return (
    <div className="lab-desk wrap">
      <p className="kicker">{campus ? "Campus" : `Unit · ${houseName}`}</p>
      <h1>{campus ? "Campus building site" : houseName}</h1>
      {!campus ? (
        <p className="body">
          {phase === "starting"
            ? `Starting the ${houseName} app in its own room.`
            : null}
          {phase === "ready" ? (
            <>
              The {houseName} app is up.{" "}
              <Link href={labStationPath(plot)}>Open the unit</Link>.
            </>
          ) : null}
          {phase === "error"
            ? `The ${houseName} app did not come up. Open the unit to retry.`
            : null}
        </p>
      ) : null}
      <p className="lede">
        {campus
          ? "This queue is the campus. Units have their own builder. Ewan and Dave are named on every line. While someone is signed in, campus sniff takes the queue."
          : `This queue writes into the ${houseName} unit. That folder’s Cursor acts while that instance is sniffing. Ewan and Dave are named on every line.`}{" "}
        {pendingCount ? `${pendingCount} waiting.` : "Nothing waiting."}
      </p>

      <div className="lab-thread" ref={threadRef}>
        {messages.length === 0 ? (
          <p className="body">No notes yet. Send a change, a plan, or a note. Attach images or video.</p>
        ) : (
          messages.map((m) => (
            <article key={m.id} className={`lab-bubble is-${m.status}`}>
              <p className="lab-meta">
                <strong>{m.author}</strong>
                {" · "}
                {KIND_LABEL[m.kind]}
                {" · "}
                {m.status}
                {m.page ? ` · ${campusPageLabel(m.page)}` : ""}
              </p>
              <p>{m.text}</p>
              <LabThumbs srcs={m.images} />
              {m.reply ? <p className="lab-reply">{m.reply}</p> : null}
            </article>
          ))
        )}
      </div>

      {authLost ? (
        <p className="err">
          Campus dropped this session.{" "}
          <a
            href={`/login?next=${encodeURIComponent(campus ? "/admin" : `/lab/${plot}/admin`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Sign in in a new tab
          </a>
          , then send again — this draft stays.
        </p>
      ) : null}
      <LabCompose plot={plot} page={page} defaultKind="change" onSent={load}>
        {campus ? (
          <>
            <p className="lab-comment-kicker">
              Note on this page
              <span className="page-id">{campusPageLabel(page)}</span>
            </p>
            <div className="page-ids" role="group" aria-label="Page">
              {CAMPUS_PAGES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={page === p.id ? "page-id is-on" : "page-id"}
                  onClick={() => setPage(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="lab-comment-kicker">
            Note on this page
            <span className="page-id">{campusPageLabel(page) || page}</span>
          </p>
        )}
      </LabCompose>
    </div>
  );
}
