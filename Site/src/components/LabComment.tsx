"use client";

import { FormEvent, useState } from "react";

type LabKind = "change" | "plan" | "note";

export function LabComment({
  plot,
  page,
  compact,
}: {
  plot: string;
  page: string;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<LabKind>("note");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    setPending(true);
    setError("");
    setDone("");
    const res = await fetch("/api/lab/messages", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plot,
        kind,
        text: text.trim(),
        page,
        origin: window.location.pathname,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That note didn’t take.");
      return;
    }
    setText("");
    setDone("Sent to this house’s builder.");
  }

  return (
    <form className={compact ? "lab-comment is-compact" : "lab-comment"} onSubmit={onSubmit}>
      <p className="lab-comment-kicker">
        Note on this page
        {page ? ` · ${page}` : ""}
      </p>
      <div className="lab-kinds" role="group" aria-label="Kind">
        {(["note", "change"] as LabKind[]).map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? "is-on" : ""}
            onClick={() => setKind(k)}
          >
            {k === "note" ? "Note" : "Change"}
          </button>
        ))}
      </div>
      <textarea
        rows={compact ? 3 : 4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What should happen here?"
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : plot === "dln" ? "Send to campus" : "Send to this unit"}
      </button>
      {done ? <p className="lab-ok">{done}</p> : null}
      {error ? <p className="err">{error}</p> : null}
    </form>
  );
}
