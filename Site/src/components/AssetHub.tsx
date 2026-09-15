"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AssetFlags, AssetItem } from "@/lib/assets";
import {
  canDeleteHref,
  isImageHref,
  isPdfHref,
  isShared,
  kindBucket,
  kindLabel,
  type AssetKindFilter,
} from "@/lib/assets-view";

type KitRow = { id: string; name: string };

function applyPatch(item: AssetItem, body: Record<string, unknown>): AssetItem {
  const next = { ...item, flags: { ...item.flags } };
  if (typeof body.title === "string") next.title = body.title;
  if (typeof body.note === "string") next.note = body.note;
  if (body.flags && typeof body.flags === "object") {
    next.flags = { ...next.flags, ...(body.flags as AssetFlags) };
  }
  return next;
}

function FileFace({ href, title, kind }: { href: string; title: string; kind: string }) {
  if (isImageHref(href)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={href} alt="" />
    );
  }
  return (
    <span className="assets-file">
      <span className="kicker">{kindLabel(kind) || (isPdfHref(href) ? "PDF" : "File")}</span>
      <strong>{title}</strong>
    </span>
  );
}

function downloadName(href: string): string {
  return decodeURIComponent(href.split("/").pop() || "file");
}

export function AssetHub({ lockedKit }: { lockedKit?: string }) {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [kits, setKits] = useState<KitRow[]>([]);
  const [error, setError] = useState("");
  const [house, setHouse] = useState(lockedKit || "");
  const [kind, setKind] = useState<AssetKindFilter>("all");
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [writing, setWriting] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [comment, setComment] = useState("");
  const [textBody, setTextBody] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/assets?seed=1", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setError("Sign in to open assets.");
        return;
      }
      const data = (await res.json()) as { items?: AssetItem[]; kits?: KitRow[] };
      setItems(data.items || []);
      setKits(data.kits || []);
      setError("");
      const list = data.kits || [];
      setHouse((prev) => {
        if (lockedKit) return lockedKit;
        if (prev && list.some((k) => k.id === prev)) return prev;
        return list[0]?.id || prev;
      });
    } catch {
      setError("Assets could not load.");
    }
  }, [lockedKit]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = items.find((item) => item.id === picked) || null;

  useEffect(() => {
    if (!selected || selected.kind !== "text" || !selected.href.startsWith("/")) {
      setTextBody("");
      return;
    }
    let alive = true;
    fetch(selected.href, { cache: "no-store" })
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (alive) setTextBody(text);
      })
      .catch(() => {
        if (alive) setTextBody("");
      });
    return () => {
      alive = false;
    };
  }, [selected]);

  const shown = useMemo(() => {
    return items
      .filter((item) => (house ? item.kit === house : true))
      .filter((item) => (kind === "all" ? true : kindBucket(item.kind) === kind))
      .slice()
      .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));
  }, [items, house, kind]);

  const sharedCount = shown.filter(isShared).length;
  const houseName = kits.find((k) => k.id === house)?.name || house || "House";

  async function patch(id: string, body: Record<string, unknown>) {
    setItems((prev) => prev.map((i) => (i.id === id ? applyPatch(i, body) : i)));
    const res = await fetch("/api/assets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) await load();
  }

  async function upload(files: FileList | File[]) {
    if (!house) {
      setError("Choose a house first.");
      return;
    }
    setBusy(true);
    setError("");
    const list = Array.from(files);
    for (const file of list) {
      const form = new FormData();
      form.set("kit", house);
      form.set("file", file);
      const res = await fetch("/api/assets", { method: "POST", credentials: "include", body: form });
      if (!res.ok) {
        setError(res.status === 413 ? "That file is too large (18 MB)." : "Could not add that file.");
        break;
      }
    }
    setBusy(false);
    await load();
  }

  async function writeNote(e: FormEvent) {
    e.preventDefault();
    if (!house || !noteTitle.trim()) return;
    setBusy(true);
    const res = await fetch("/api/assets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "text", kit: house, title: noteTitle, body: noteBody }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not save that note.");
      return;
    }
    const data = (await res.json().catch(() => null)) as { item?: AssetItem } | null;
    setNoteTitle("");
    setNoteBody("");
    setWriting(false);
    await load();
    if (data?.item?.id) setPicked(data.item.id);
  }

  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!selected || !comment.trim()) return;
    setBusy(true);
    const res = await fetch("/api/assets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", id: selected.id, body: comment }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not add that note.");
      return;
    }
    setComment("");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this file from the hub? Harvested brand files stay.")) return;
    setBusy(true);
    const res = await fetch("/api/assets", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("That file belongs to the house library, so it stays.");
      return;
    }
    setPicked(null);
    await load();
  }

  const kitHref = house ? `/account?desk=epk&view=press&kit=${encodeURIComponent(house)}` : "/account?desk=epk";

  return (
    <div className="asset-hub">
      <header className="asset-hub__head">
        <div>
          <p className="kicker">Asset hub</p>
          <h2>{houseName}</h2>
          <p className="lede">
            Upload, drop, write, comment. Tick a file onto the press kit when it is ready to share.
          </p>
        </div>
        <p className="asset-hub__jump">
          <a href={kitHref}>Press kit</a>
          <span>
            {shown.length} file{shown.length === 1 ? "" : "s"}
            {shown.length ? ` · ${sharedCount} on the kit` : ""}
          </span>
        </p>
      </header>

      <div className="asset-hub__bar">
        {kits.length > 1 && !lockedKit ? (
          <label>
            House
            <select
              className="chamfer"
              value={house}
              onChange={(e) => {
                setHouse(e.target.value);
                setPicked(null);
              }}
            >
              {kits.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Type
          <select className="chamfer" value={kind} onChange={(e) => setKind(e.target.value as AssetKindFilter)}>
            <option value="all">All files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="text">Text</option>
          </select>
        </label>
        <label className="assets-upload">
          Upload
          <input
            type="file"
            multiple
            disabled={busy || !house}
            accept="image/*,.pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <button type="button" className="assets-text-btn" onClick={() => setWriting((v) => !v)}>
          {writing ? "Close note" : "Write a note"}
        </button>
      </div>

      {error ? <p className="err">{error}</p> : null}

      {writing ? (
        <form className="asset-hub__write chamfer" onSubmit={writeNote}>
          <label htmlFor="hub-note-title">Title</label>
          <input
            id="hub-note-title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />
          <label htmlFor="hub-note-body">Text</label>
          <textarea id="hub-note-body" rows={8} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} />
          <button type="submit" className="chamfer" disabled={busy || !noteTitle.trim()}>
            Save note
          </button>
        </form>
      ) : null}

      <div
        className={`asset-hub__drop chamfer${over ? " is-over" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
        }}
      >
        {busy ? "Adding…" : "Drop files here — images, PDFs, or text."}
      </div>

      {shown.length ? (
        <ul className="asset-hub__grid">
          {shown.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`assets-plate chamfer${picked === item.id ? " is-on" : ""}${isShared(item) ? " is-flagged" : ""}`}
                onClick={() => setPicked(picked === item.id ? null : item.id)}
              >
                <FileFace href={item.href} title={item.title} kind={item.kind} />
              </button>
              <span className="assets-caption">
                {item.title}
                {isShared(item) ? <em>On the kit</em> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body">Nothing in this house yet. Drop a file or write a note.</p>
      )}

      {selected ? (
        <div className="asset-hub__inspect">
          <div className="asset-hub__preview chamfer">
            <FileFace href={selected.href} title={selected.title} kind={selected.kind} />
          </div>
          <div className="asset-hub__meta">
            <p className="kicker">{kindLabel(selected.kind)}</p>
            <label htmlFor="hub-title">Title</label>
            <input
              id="hub-title"
              key={`${selected.id}-title`}
              defaultValue={selected.title}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== selected.title) patch(selected.id, { title: v });
              }}
            />
            <label htmlFor="hub-about">About this file</label>
            <textarea
              id="hub-about"
              key={`${selected.id}-note`}
              rows={4}
              defaultValue={selected.note || ""}
              onBlur={(e) => {
                const v = e.target.value;
                if (v !== (selected.note || "")) patch(selected.id, { note: v });
              }}
            />
            {selected.kind === "text" && textBody ? (
              <pre className="asset-hub__body">{textBody}</pre>
            ) : null}
            <p className="asset-hub__acts">
              <button
                type="button"
                className={`epk-onoff chamfer${isShared(selected) ? " is-on" : ""}`}
                onClick={() => patch(selected.id, { flags: { share: !isShared(selected) } })}
              >
                {isShared(selected) ? "On the press kit" : "Off the press kit"}
              </button>
              <a href={selected.href} download={downloadName(selected.href)}>
                Download
              </a>
              {canDeleteHref(selected.href) ? (
                <button type="button" className="assets-text-btn" disabled={busy} onClick={() => remove(selected.id)}>
                  Delete
                </button>
              ) : (
                <span className="status">House library — stays</span>
              )}
            </p>
            <p className="kicker">Comments</p>
            <ul className="asset-hub__comments">
              {(selected.comments || []).length ? (
                (selected.comments || []).map((row) => (
                  <li key={row.id}>
                    <span className="status">
                      {row.at.slice(0, 16).replace("T", " ")} · {row.by}
                    </span>
                    <p>{row.body}</p>
                  </li>
                ))
              ) : (
                <li>
                  <p>No comments yet.</p>
                </li>
              )}
            </ul>
            <form className="asset-hub__comment" onSubmit={postComment}>
              <label htmlFor="hub-comment">Add a comment</label>
              <textarea
                id="hub-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="chamfer" disabled={busy || !comment.trim()}>
                Post
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
