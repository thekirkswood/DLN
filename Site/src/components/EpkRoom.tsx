"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isImageHref } from "@/lib/assets-view";
import { EpkDocView, type PackItem } from "@/components/EpkDocView";
import { KIT_COPY } from "@/lib/epk-copy";
import { epkDoc } from "@/lib/epk-doc";
import { epkHref } from "@/lib/epk-map";

type Draft = {
  kicker: string;
  lede: string;
  overview: string[];
  quotes: string[];
  extra: string[];
};

type PackPayload = {
  name?: string;
  kicker?: string;
  lede?: string;
  overview?: string[];
  quotes?: string[];
  extra?: string[];
  bespoke?: boolean;
  draft?: Draft | null;
  items?: PackItem[];
};

const emptyDraft = (): Draft => ({
  kicker: "",
  lede: "",
  overview: [""],
  quotes: [""],
  extra: [""],
});

export function EpkRoom({
  kit,
  studio,
  tagged,
  startEdit,
  initial,
}: {
  kit: string;
  name: string;
  studio?: boolean;
  tagged?: boolean;
  startEdit?: boolean;
  initial?: PackPayload;
}) {
  const doc = epkDoc(kit);
  const [data, setData] = useState<PackPayload | null>(initial || null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<PackItem | null>(null);
  const [editing, setEditing] = useState(Boolean(startEdit && studio));
  const [draft, setDraft] = useState<Draft>(() => {
    if (initial?.draft) {
      return {
        kicker: initial.draft.kicker,
        lede: initial.draft.lede,
        overview: initial.draft.overview.length ? initial.draft.overview : [""],
        quotes: initial.draft.quotes.length ? initial.draft.quotes : [""],
        extra: initial.draft.extra.length ? initial.draft.extra : [""],
      };
    }
    return emptyDraft();
  });
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [capTitle, setCapTitle] = useState("");
  const [capNote, setCapNote] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/press/pack?kit=${encodeURIComponent(kit)}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      setError("This pack is closed.");
      return;
    }
    const next = (await res.json()) as PackPayload;
    setData(next);
    if (next.draft) {
      setDraft({
        kicker: next.draft.kicker,
        lede: next.draft.lede,
        overview: next.draft.overview.length ? next.draft.overview : [""],
        quotes: next.draft.quotes.length ? next.draft.quotes : [""],
        extra: next.draft.extra.length ? next.draft.extra : [""],
      });
    }
    setError("");
  }, [kit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setEditing(Boolean(startEdit && studio));
  }, [kit, startEdit, studio]);

  useEffect(() => {
    if (!picked) return;
    setCapTitle(picked.title);
    setCapNote(picked.note || "");
    document.getElementById("picked")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [picked]);

  async function leave() {
    if (tagged) {
      window.location.href = "/account";
      return;
    }
    await fetch("/api/epk/leave", { method: "POST", credentials: "include" });
    window.location.href = "/epk";
  }

  async function saveCopy() {
    setSaving(true);
    setNote("");
    const res = await fetch("/api/studio/epk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: kit,
        action: "save",
        kicker: draft.kicker,
        lede: draft.lede,
        overview: draft.overview,
        quotes: draft.quotes,
        extra: draft.extra,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setNote("Could not save.");
      return;
    }
    setNote("Saved.");
    await load();
  }

  async function resetCopy() {
    if (!window.confirm("Reset this kit to the generated base?")) return;
    setSaving(true);
    setNote("");
    const res = await fetch("/api/studio/epk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: kit, action: "reset" }),
    });
    setSaving(false);
    if (!res.ok) {
      setNote("Could not reset.");
      return;
    }
    setNote("Back to the base.");
    await load();
  }

  async function saveCaption() {
    if (!picked) return;
    const res = await fetch("/api/studio/assets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: picked.id, title: capTitle, note: capNote }),
    });
    if (!res.ok) return;
    setPicked({ ...picked, title: capTitle, note: capNote });
    await load();
  }

  const items = data?.items || [];

  return (
    <div className="epk">
      <header className="epk-top">
        <div className="epk-top__inner">
          <p className="epk-top__mark">
            {doc.product} <span>{doc.kitTitle}</span>
          </p>
          <nav className="epk-top__links" aria-label="Press kit">
            <a href="#assets">Asset vault</a>
            <a href="#contact">Contact</a>
            {studio ? (
              <>
                <button
                  type="button"
                  className="assets-text-btn"
                  onClick={() => setEditing((v) => !v)}
                >
                  {editing ? "Close edit" : "Edit"}
                </button>
                <Link href="/epk">EPKs</Link>
                <Link href="/account?desk=assets">Assets</Link>
              </>
            ) : tagged ? (
              <Link href="/account">Account</Link>
            ) : (
              <button type="button" className="assets-text-btn" onClick={leave}>
                Leave
              </button>
            )}
          </nav>
        </div>
      </header>
      <div className="epk-frame">
        <aside className="epk-nav" aria-label="Press kit">
          <p className="epk-nav__brand">
            <strong>{doc.product}</strong>
            <small>{doc.kitTitle}</small>
          </p>
          <div className="epk-nav__group">
            <ul>
              {doc.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                  {item.sub?.length ? (
                    <ul className="epk-nav__sub">
                      {item.sub.map((sub) => (
                        <li key={sub}>{sub}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          {studio ? (
            <div className="epk-nav__group">
              <p className="epk-nav__group-title">Houses</p>
              <ul>
                {KIT_COPY.map((row) => (
                  <li key={row.id}>
                    <Link href={epkHref(row.id)} aria-current={row.id === kit ? "page" : undefined}>
                      {row.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="epk-nav__host">
            Hosted by Design Lab North
            <br />
            <a href="mailto:design@designlabnorth.com">design@designlabnorth.com</a>
          </p>
        </aside>
        <div className="epk-main">
          {studio && editing ? (
            <section className="epk-edit chamfer">
              <p className="kicker">Edit this kit</p>
              <p className="body">
                The map stays — stories, vault lanes, contact. Change the kicker and lede
                on the gate cards, add extra paragraphs after Our Story, save. Captions
                live on the still when you open it.
              </p>
              <label htmlFor="epk-kicker">Kicker</label>
              <input
                id="epk-kicker"
                value={draft.kicker}
                onChange={(e) => setDraft({ ...draft, kicker: e.target.value })}
              />
              <label htmlFor="epk-lede">Lede</label>
              <textarea
                id="epk-lede"
                rows={3}
                value={draft.lede}
                onChange={(e) => setDraft({ ...draft, lede: e.target.value })}
              />
              <label htmlFor="epk-overview">Overview (gate card)</label>
              <textarea
                id="epk-overview"
                rows={6}
                value={draft.overview.join("\n\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    overview: e.target.value.split(/\n\s*\n/).map((s) => s.trim()),
                  })
                }
              />
              <label htmlFor="epk-quotes">Quotations (gate card)</label>
              <textarea
                id="epk-quotes"
                rows={4}
                value={draft.quotes.join("\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    quotes: e.target.value.split("\n").map((s) => s.trim()),
                  })
                }
              />
              <label htmlFor="epk-extra">Extra — after Our Story</label>
              <textarea
                id="epk-extra"
                rows={4}
                value={draft.extra.join("\n\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    extra: e.target.value.split(/\n\s*\n/).map((s) => s.trim()),
                  })
                }
              />
              <p className="epk-edit__acts">
                <button type="button" disabled={saving} onClick={saveCopy}>
                  {saving ? "…" : "Save"}
                </button>
                <button type="button" className="assets-text-btn" disabled={saving} onClick={resetCopy}>
                  Reset to base
                </button>
              </p>
              {note ? <p className="status">{note}</p> : null}
              {data?.bespoke ? <p className="status">This kit has been bespoke from the base.</p> : null}
            </section>
          ) : null}
          {error ? <p className="body">{error}</p> : null}
          <EpkDocView doc={doc} items={items} extra={data?.extra} onPick={setPicked} />
          {picked ? (
            <div className="assets-inspect" id="picked">
              {isImageHref(picked.href) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="chamfer" src={picked.href} alt="" />
              ) : (
                <div className="assets-plate chamfer is-file">
                  <span className="assets-file">
                    <span className="kicker">File</span>
                    <strong>{picked.title}</strong>
                  </span>
                </div>
              )}
              <div>
                {studio ? (
                  <>
                    <label htmlFor="epk-cap-title">Title</label>
                    <input
                      id="epk-cap-title"
                      value={capTitle}
                      onChange={(e) => setCapTitle(e.target.value)}
                      onBlur={saveCaption}
                    />
                    <label htmlFor="epk-cap-note">Caption</label>
                    <textarea
                      id="epk-cap-note"
                      rows={4}
                      value={capNote}
                      onChange={(e) => setCapNote(e.target.value)}
                      onBlur={saveCaption}
                    />
                  </>
                ) : (
                  <>
                    <h2>{picked.title}</h2>
                    {picked.note ? <p className="epk-inspect-note">{picked.note}</p> : null}
                  </>
                )}
                <p>
                  <a href={picked.href} download>
                    Download
                  </a>
                </p>
                <p>
                  <button type="button" className="assets-text-btn" onClick={() => setPicked(null)}>
                    Close
                  </button>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
