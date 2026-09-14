"use client";

import { FormEvent, useState } from "react";

export function BlockedScreen() {
  const [why, setWhy] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!why.trim()) return;
    setPending(true);
    setError("");
    const res = await fetch("/api/blocked/appeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ why }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That did not hold. Try again, or do not.");
      return;
    }
    setSent(true);
  }

  return (
    <article className="blocked-page wrap">
      <p className="kicker">Design Lab North</p>
      <h1>This address is not allowed in.</h1>
      {sent ? (
        <p className="body">
          That is on the book. If a person wrote it, we may look. Do not wait
          here.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="blocked-form">
          <label>
            Why should this address be unblocked?
            <textarea
              rows={5}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              required
              maxLength={1200}
            />
          </label>
          <button type="submit" className="house-add" disabled={pending}>
            {pending ? "Sending…" : "Send"}
          </button>
          {error ? <p className="status">{error}</p> : null}
        </form>
      )}
    </article>
  );
}
