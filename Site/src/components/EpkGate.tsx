"use client";

import { useState } from "react";
import { kitCopy } from "@/lib/epk-copy";
import { epkHref } from "@/lib/epk-map";

export function EpkGate({
  wanted,
  next,
}: {
  wanted?: string;
  next?: string;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const house = wanted ? kitCopy(wanted) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const code = String(new FormData(e.currentTarget).get("code") || "");
    const res = await fetch("/api/epk/enter", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        wanted: wanted || undefined,
        next: next || undefined,
      }),
    });
    const data = (await res.json().catch(() => null)) as { kit?: string; next?: string; error?: string } | null;
    setPending(false);
    if (res.status === 429) {
      setError("Too many tries. Wait a quarter of an hour.");
      return;
    }
    if (res.status === 409) {
      setError("That code opens a different house.");
      return;
    }
    if (!res.ok || !data?.kit) {
      setError("That code does not open a pack.");
      return;
    }
    window.location.href = data.next || epkHref(data.kit);
  }

  return (
    <div className="epk-gate">
      <div className="epk-gate__card chamfer">
        <p className="kicker">Press kit</p>
        <h1>{house ? house.name : "Press kit"}</h1>
        <p className="epk-gate__lede">
          {house
            ? `Type the code you were given for ${house.name}.`
            : "Type the code you were given."}
        </p>
        <form className="epk-gate__form" onSubmit={onSubmit}>
          {error ? <p className="err">{error}</p> : null}
          <label htmlFor="code">Access code</label>
          <input
            id="code"
            name="code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            maxLength={12}
          />
          <button type="submit" disabled={pending}>
            {pending ? "…" : "Open"}
          </button>
        </form>
      </div>
    </div>
  );
}
