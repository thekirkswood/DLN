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
  const [ok, setOk] = useState("");

  useEffect(() => {
    setSlug(plotSlug);
  }, [plotSlug]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    setPending(true);
    setOk("");
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
    const data = (await res.json().catch(() => null)) as
      | {
          ok?: boolean;
          hotfix?: { actioned?: boolean; hostUp?: boolean | null };
        }
      | null;
    setPending(false);
    if (!res.ok) return;
    setBody("");
    if (kind === "hotfix" && data?.hotfix) {
      if (data.hotfix.actioned && data.hotfix.hostUp === false) {
        setOk("The host did not answer. We’ll look at it as a hotfix.");
      } else if (data.hotfix.actioned) {
        setOk("Received. We’ll look at it as a hotfix.");
      } else {
        setOk(
          "The host is answering. That’s a change to the work, not a hotfix.",
        );
      }
    }
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
      {ok ? <p className="status">{ok}</p> : null}
    </form>
  );
}
