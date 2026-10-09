"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ledger = {
  plotSlug: string;
  stack: number;
  balance: number;
  grantedThisPeriod: number;
};

export function CaptureWell({
  plotSlug,
  plotOptions,
}: {
  plotSlug: string;
  plotOptions: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(plotSlug);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, setPending] = useState<"sweep" | "now" | "">("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [pingCost, setPingCost] = useState(8);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);

  useEffect(() => {
    let live = true;
    fetch("/api/tokens")
      .then((res) => res.json())
      .then((body) => {
        if (!live || !body?.ok) return;
        setPingCost(Number(body.pingCost) || 8);
        setLedgers(Array.isArray(body.ledgers) ? body.ledgers : []);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [ok]);

  const held = ledgers.find((row) => row.plotSlug === slug);
  const remaining = held?.balance ?? 0;

  async function send(pace: "sweep" | "now") {
    if (!slug) return;
    if (!text.trim() && !files?.length) return;
    setPending(pace);
    setErr("");
    setOk("");
    const form = new FormData();
    form.set("plotSlug", slug);
    form.set("text", text);
    form.set("pace", pace);
    if (files) {
      Array.from(files).forEach((file) => form.append("files", file));
    }
    const res = await fetch("/api/captures", { method: "POST", body: form });
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;
    setPending("");
    if (!res.ok) {
      if (body?.error === "balance") {
        setErr("Not enough tokens this month. Leave a note, or wait for the next grant.");
      } else {
        setErr("That did not land. Try a smaller file, or write it as a comment.");
      }
      return;
    }
    setText("");
    setFiles(null);
    setOk(pace === "now" ? "Sent now." : "Saved.");
    router.refresh();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send("sweep");
  }

  if (!plotOptions.length && !plotSlug) return null;

  return (
    <form className="comment-box is-wide capture-well" onSubmit={onSubmit}>
      <p className="body bill-note">
        Leave a note, a document, or an idea. Send now spends tokens to push
        immediate edits
        {held ? ` — ${remaining} of ${held.grantedThisPeriod} tokens on this site` : ""}
        .
      </p>
      {plotOptions.length > 1 ? (
        <>
          <label htmlFor="cap-plot">Site</label>
          <select
            id="cap-plot"
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
      <label htmlFor="cap-body">Brief or note</label>
      <textarea
        id="cap-body"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <label htmlFor="cap-files">Files</label>
      <input
        id="cap-files"
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      {err ? <p className="status">{err}</p> : null}
      {ok ? <p className="status">{ok}</p> : null}
      <div className="capture-acts">
        <button type="submit" disabled={Boolean(pending)}>
          {pending === "sweep" ? "…" : "Leave a note"}
        </button>
        <button
          type="button"
          className="bench-cta"
          disabled={Boolean(pending)}
          onClick={() => void send("now")}
        >
          {pending === "now" ? "…" : `Send now · ${pingCost} tokens`}
        </button>
      </div>
    </form>
  );
}
