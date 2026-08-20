"use client";

import { FormEvent, useState } from "react";

export function LiveSuggest({
  plotSlug,
  plotName,
  embed = false,
}: {
  plotSlug: string;
  plotName: string;
  embed?: boolean;
}) {
  const [body, setBody] = useState("");
  const [fromName, setFromName] = useState("");
  const [honey, setHoney] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!body.trim()) return;
    setPending(true);
    const page =
      typeof window !== "undefined" ? window.location.pathname : undefined;
    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plotSlug,
        body,
        fromName,
        page,
        company: honey,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That didn’t land. Try again in a moment.");
      return;
    }
    setBody("");
    setFromName("");
    setOk("Received. We’ll read it and turn it into a plan.");
  }

  return (
    <form
      className={`live-suggest${embed ? " is-embed" : ""}`}
      onSubmit={onSubmit}
    >
      <h1 className="kicker">{embed ? "A change you’d like" : plotName}</h1>
      <p className="body">
        Write what you’d like to change. We read it, turn it into a plan, and
        run it ourselves. Nothing on this host changes from this box.
      </p>
      <label htmlFor="suggest-body">Suggestion</label>
      <textarea
        id="suggest-body"
        rows={embed ? 4 : 6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={2000}
      />
      <label htmlFor="suggest-who">Your name (optional)</label>
      <input
        id="suggest-who"
        value={fromName}
        onChange={(e) => setFromName(e.target.value)}
        autoComplete="name"
      />
      <p className="suggest-honey" aria-hidden>
        <label htmlFor="suggest-company">Company</label>
        <input
          id="suggest-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
        />
      </p>
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Send"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}
