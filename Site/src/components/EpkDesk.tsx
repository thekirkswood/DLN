"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { epkHref } from "@/lib/epk-map";

type KitRow = {
  id: string;
  name: string;
  kicker?: string;
  lede?: string;
  bespoke?: boolean;
  createdAt: string;
  rotatedAt?: string;
  editedAt?: string | null;
};

type Unlock = { at: string; kit: string; ip: string };

export function EpkDesk() {
  const [kits, setKits] = useState<KitRow[]>([]);
  const [unlocks, setUnlocks] = useState<Unlock[]>([]);
  const [error, setError] = useState("");
  const [code, setCode] = useState<{ id: string; code: string } | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await fetch("/api/studio/epk", { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      setError("Could not load EPKs.");
      return;
    }
    const data = (await res.json()) as { kits?: KitRow[]; unlocks?: Unlock[] };
    setKits(data.kits || []);
    setUnlocks(data.unlocks || []);
    setError("");
  }

  useEffect(() => {
    load();
  }, []);

  async function rotate(id: string) {
    if (!window.confirm("Rotate this house’s press code? The old code stops working.")) return;
    setBusy(id);
    setCode(null);
    const res = await fetch("/api/studio/epk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy("");
    const data = (await res.json().catch(() => null)) as { code?: string } | null;
    if (!res.ok || !data?.code) {
      setError("Could not rotate.");
      return;
    }
    setCode({ id, code: data.code });
    await load();
  }

  return (
    <div className="epk-desk">
      <p className="lede">Open a kit, or rotate its journalist code.</p>
      {error ? <p className="err">{error}</p> : null}
      {code ? (
        <p className="status">
          New code for {code.id}: <strong>{code.code}</strong> — copy it now. It
          will not be shown again.
        </p>
      ) : null}
      <ul className="epk-index">
        {kits.map((row) => (
          <li key={row.id}>
            <p className="kicker">{row.kicker || "Press kit"}</p>
            <strong>{row.name}</strong>
            {row.lede ? <p>{row.lede}</p> : null}
            <p className="epk-index__acts">
              <Link href={epkHref(row.id)}>Open</Link>
              <Link href={`/account?desk=epk&kit=${row.id}`}>Edit kit</Link>
              <Link href="/account?desk=assets">Assets</Link>
              <button type="button" className="assets-text-btn" disabled={busy === row.id} onClick={() => rotate(row.id)}>
                {busy === row.id ? "…" : "Rotate code"}
              </button>
            </p>
          </li>
        ))}
      </ul>
      {unlocks.length ? (
        <>
          <p className="kicker">Recent opens</p>
          <ul className="note-list">
            {unlocks.slice(0, 12).map((row, i) => (
              <li key={`${row.at}-${i}`}>
                <span className="status">
                  {row.at.slice(0, 16).replace("T", " ")} · {row.kit}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
