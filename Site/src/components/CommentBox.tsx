"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CommentBox({
  plotSlug,
  plotOptions,
  hint,
  title,
  clientId,
  kind = "note",
  label = "A note",
  cta = "Leave note",
  rows = 3,
  page,
}: {
  plotSlug: string;
  plotOptions: { slug: string; name: string }[];
  hint?: string;
  title?: string;
  clientId?: string;
  kind?: "note" | "hotfix" | "query";
  label?: string;
  cta?: string;
  rows?: number;
  page?: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(plotSlug);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSlug(plotSlug);
  }, [plotSlug]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    setPending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plotSlug: slug,
        body,
        clientId,
        kind,
        page: page || undefined,
      }),
    });
    setPending(false);
    if (!res.ok) return;
    setBody("");
    router.refresh();
  }

  if (!plotOptions.length && !plotSlug) return null;

  return (
    <form
      className={`comment-box${kind === "hotfix" ? " is-hotfix" : " is-wide"}`}
      onSubmit={onSubmit}
    >
      {title ? <h3>{title}</h3> : null}
      {hint ? <p className="body bill-note">{hint}</p> : null}
      {plotOptions.length > 1 ? (
        <>
          <label htmlFor={`c-plot-${kind}`}>Site</label>
          <select
            id={`c-plot-${kind}`}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            {plotOptions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      ) : null}
      <label htmlFor={`c-body-${kind}`}>{label}</label>
      <textarea
        id={`c-body-${kind}`}
        rows={rows}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : cta}
      </button>
    </form>
  );
}
