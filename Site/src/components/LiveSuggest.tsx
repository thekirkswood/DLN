"use client";

import { FormEvent, useState } from "react";

function SuggestWell({
  plotSlug,
  kind,
  title,
  hint,
  label,
  cta,
  embed,
  rows,
  okLine,
}: {
  plotSlug: string;
  kind: "note" | "hotfix";
  title: string;
  hint: string;
  label: string;
  cta: string;
  embed: boolean;
  rows: number;
  okLine: string;
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plotSlug,
        body,
        fromName,
        page,
        company: honey,
        kind,
      }),
    });
    if (res.status === 401) {
      setPending(false);
      setError("Sign in to Design Lab North to send a change request.");
      return;
    }
    setPending(false);
    if (!res.ok) {
      setError("That didn’t land. Try again in a moment.");
      return;
    }
    setBody("");
    setFromName("");
    setOk(okLine);
  }

  return (
    <form
      className={`live-suggest${embed ? " is-embed" : ""}${kind === "hotfix" ? " is-hotfix" : ""}`}
      onSubmit={onSubmit}
    >
      <h2 className="kicker">{title}</h2>
      <p className="body">{hint}</p>
      <label htmlFor={`suggest-body-${kind}`}>{label}</label>
      <textarea
        id={`suggest-body-${kind}`}
        rows={rows}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={2000}
      />
      <label htmlFor={`suggest-who-${kind}`}>Your name (optional)</label>
      <input
        id={`suggest-who-${kind}`}
        value={fromName}
        onChange={(e) => setFromName(e.target.value)}
        autoComplete="name"
      />
      <p className="suggest-honey" aria-hidden>
        <label htmlFor={`suggest-company-${kind}`}>Company</label>
        <input
          id={`suggest-company-${kind}`}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
        />
      </p>
      <button type="submit" disabled={pending}>
        {pending ? "…" : cta}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}

export function LiveSuggest({
  plotSlug,
  plotName,
  embed = false,
}: {
  plotSlug: string;
  plotName: string;
  embed?: boolean;
}) {
  return (
    <div className="live-suggest-pair">
      <p className="kicker">{embed ? plotName : plotName}</p>
      <SuggestWell
        plotSlug={plotSlug}
        kind="note"
        title="A change you’d like"
        hint="Write what you’d like to change. If there are comments, we aim to roll an update that evening. Nothing on this host changes from the box itself."
        label="Comment"
        cta="Send"
        embed={embed}
        rows={embed ? 4 : 6}
        okLine="Received. We’ll read it and turn it into a plan."
      />
      <SuggestWell
        plotSlug={plotSlug}
        kind="hotfix"
        title="Hotfix"
        hint="Something is wrong right now. We try to audit this within the hour."
        label="What’s wrong"
        cta="Send hotfix"
        embed={embed}
        rows={embed ? 3 : 4}
        okLine="Received. We’ll look at it as a hotfix."
      />
    </div>
  );
}
