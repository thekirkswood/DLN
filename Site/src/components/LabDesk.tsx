"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useEnsureHouse } from "@/components/EnsureHouse";
import { labStationPath } from "@/lib/lab-host";

type LabKind = "change" | "plan" | "note";

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

const KIND_LABEL: Record<LabKind, string> = {
  change: "Change",
  plan: "Plan",
  note: "Note",
};

export function LabDesk({
  plot,
  houseName,
}: {
  plot: string;
  houseName: string;
}) {
  const [messages, setMessages] = useState<LabMessage[]>([]);
  const [kind, setKind] = useState<LabKind>("change");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [queued, setQueued] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const campus = plot === "dln";
  const phase = useEnsureHouse(campus ? null : plot);

  const load = useCallback(async () => {
    const res = await fetch(`/api/lab/messages?plot=${encodeURIComponent(plot)}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const data = (await res.json()) as { messages?: LabMessage[] };
    setMessages(data.messages || []);
    setLoading(false);
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

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    setQueued("");
    const form = new FormData();
    form.set("plot", plot);
    form.set("kind", kind);
    form.set("text", text.trim());
    form.set("page", "/admin");
    form.set("origin", window.location.pathname);
    files.forEach((f) => form.append("files", f));
    let res: Response;
    try {
      res = await fetch("/api/lab/messages", {
        method: "POST",
        credentials: "include",
        body: form,
      });
    } catch {
      setSending(false);
      setError("Could not reach the campus (connection failed).");
      return;
    }
    setSending(false);
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        data.error
          ? `${res.status}: ${data.error}`
          : `Could not send (${res.status}).`,
      );
      return;
    }
    setText("");
    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
    await load();
    setError("");
    setQueued(
      campus
        ? "Queued. Campus takes it while someone is signed in."
        : "Queued. This unit’s Cursor takes it while that instance is sniffing.",
    );
  }

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
          <p className="body">No notes yet. Send a change, a plan, or a note.</p>
        ) : (
          messages.map((m) => (
            <article key={m.id} className={`lab-bubble is-${m.status}`}>
              <p className="lab-meta">
                <strong>{m.author}</strong>
                {" · "}
                {KIND_LABEL[m.kind]}
                {" · "}
                {m.status}
                {m.page ? ` · ${m.page}` : ""}
              </p>
              <p>{m.text}</p>
              {m.images.length ? (
                <div className="lab-thumbs">
                  {m.images.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" />
                  ))}
                </div>
              ) : null}
              {m.reply ? <p className="lab-reply">{m.reply}</p> : null}
            </article>
          ))
        )}
      </div>

      <form className="lab-compose" onSubmit={send}>
        <div className="lab-kinds" role="group" aria-label="Kind">
          {(["change", "plan", "note"] as LabKind[]).map((k) => (
            <button
              key={k}
              type="button"
              className={kind === k ? "is-on" : ""}
              onClick={() => setKind(k)}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <label htmlFor={`lab-text-${plot}`}>Message</label>
        <textarea
          id={`lab-text-${plot}`}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <label htmlFor={`lab-files-${plot}`}>Images</label>
        <input
          id={`lab-files-${plot}`}
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <button type="submit" disabled={sending}>
          {sending ? "…" : "Send"}
        </button>
        {queued ? <p className="lab-ok">{queued}</p> : null}
        {error ? <p className="err">{error}</p> : null}
      </form>
    </div>
  );
}
