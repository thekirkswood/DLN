"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssetFlags, AssetItem } from "@/lib/assets";
import { isImageHref, isPdfHref, isShared } from "@/lib/assets-view";
import { EpkStudioStamp } from "@/components/EpkStudioStamp";
import { laneStill } from "@/lib/epk-cover";
import type { KitCover, KitShown } from "@/lib/epk-content-model";
import { epkHref } from "@/lib/epk-map";
import { sectionItems, type EpkSection } from "@/lib/epk-sections";
import type { VaultLaneId } from "@/lib/epk-doc";

type KitRow = { id: string; name: string };
type Tab = "overview" | EpkSection | "stories" | "promos";
type Story = { id: string; title: string; body: string; imageHref?: string; live?: boolean };
type Promo = { id: string; title: string; body: string; imageHref?: string; live?: boolean; hasCode?: boolean };
type Picker = null | "logos" | "banners" | "people" | "files" | VaultLaneId | "story-image" | "promo-image";

function applyPatch(item: AssetItem, body: Record<string, unknown>): AssetItem {
  const next = { ...item, flags: { ...item.flags } };
  if (typeof body.title === "string") next.title = body.title;
  if (typeof body.note === "string") next.note = body.note;
  if (body.flags && typeof body.flags === "object") {
    next.flags = { ...next.flags, ...(body.flags as AssetFlags) };
  }
  return next;
}

function Plate({ href, title }: { href: string; title: string }) {
  if (isImageHref(href)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={href} alt="" />
    );
  }
  return (
    <span className="assets-file">
      <span className="kicker">{isPdfHref(href) ? "PDF" : "File"}</span>
      <strong>{title}</strong>
    </span>
  );
}

export function AssetsDesk({ lockedKit }: { lockedKit?: string }) {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [kits, setKits] = useState<KitRow[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [kitFilter, setKitFilter] = useState(lockedKit || "modyu");
  const [picked, setPicked] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [overview, setOverview] = useState<string[]>([]);
  const [cover, setCover] = useState<KitCover>({});
  const [shown, setShown] = useState<KitShown>({});
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftImage, setDraftImage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [freshCode, setFreshCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [composing, setComposing] = useState<"story" | "promo" | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets?seed=1`, { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setError("Sign in to open assets.");
        return;
      }
      const data = (await res.json()) as { items?: AssetItem[]; kits?: KitRow[] };
      setItems(data.items || []);
      setKits(data.kits || []);
      setError("");
      const kitsList = data.kits || [];
      setKitFilter((prev) => {
        if (lockedKit) return lockedKit;
        if (kitsList.some((k) => k.id === prev)) return prev;
        return kitsList[0]?.id || prev;
      });
    } catch {
      setError("Assets could not load.");
    }
  }, [lockedKit]);

  const loadContent = useCallback(async (kit: string) => {
    const res = await fetch(`/api/epk/content?kit=${encodeURIComponent(kit)}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      content?: {
        overview?: string[];
        stories?: Story[];
        promos?: Promo[];
        cover?: KitCover;
        shown?: KitShown;
      };
    };
    setOverview(data.content?.overview || []);
    setStories(data.content?.stories || []);
    setPromos(data.content?.promos || []);
    setCover(data.content?.cover || {});
    setShown(data.content?.shown || {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (kitFilter) loadContent(kitFilter);
  }, [kitFilter, loadContent]);

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

  async function upload(file: File) {
    const form = new FormData();
    form.set("kit", kitFilter);
    form.set("file", file);
    form.set("share", "1");
    setBusy(true);
    const res = await fetch("/api/assets", { method: "POST", credentials: "include", body: form });
    setBusy(false);
    if (!res.ok) {
      setError("Could not add that file.");
      return;
    }
    await load();
  }

  async function saveOverview() {
    await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: kitFilter, action: "overview", overview }),
    });
  }

  async function saveFrame(next: { cover?: KitCover; shown?: KitShown }) {
    if (next.cover) setCover((prev) => ({ ...prev, ...next.cover }));
    if (next.shown) setShown((prev) => ({ ...prev, ...next.shown }));
    await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: kitFilter, action: "frame", ...next }),
    });
  }

  async function saveArticle(kind: "story" | "promo") {
    setBusy(true);
    const res = await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kit: kitFilter,
        action: kind,
        id: editingId || undefined,
        title: draftTitle,
        body: draftBody,
        imageHref: draftImage || undefined,
        freshCode: kind === "promo" && !editingId,
      }),
    });
    setBusy(false);
    const data = (await res.json().catch(() => null)) as { code?: string } | null;
    if (data?.code) setFreshCode(data.code);
    setDraftTitle("");
    setDraftBody("");
    setDraftImage("");
    setEditingId(null);
    setComposing(null);
    await loadContent(kitFilter);
  }

  async function removeArticle(kind: "story" | "promo", id: string) {
    await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kit: kitFilter,
        action: kind === "story" ? "delete-story" : "delete-promo",
        id,
      }),
    });
    await loadContent(kitFilter);
  }

  async function toggleLive(kind: "story" | "promo", id: string, live: boolean) {
    await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: kitFilter, action: "live", kind, id, live }),
    });
    await loadContent(kitFilter);
  }

  async function rotatePromo(id: string) {
    const res = await fetch("/api/epk/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: kitFilter, action: "rotate-promo", id }),
    });
    const data = (await res.json().catch(() => null)) as { code?: string } | null;
    if (data?.code) setFreshCode(data.code);
  }

  const houseItems = useMemo(
    () => items.filter((item) => item.kit === kitFilter),
    [items, kitFilter],
  );
  const pack = useMemo(() => houseItems.filter(isShared), [houseItems]);
  const logos = sectionItems(pack, "logos");
  const banners = sectionItems(pack, "banners");
  const people = sectionItems(pack, "people");
  const files = sectionItems(pack, "files");
  const images = houseItems.filter((i) => isImageHref(i.href));
  const docs = houseItems.filter((i) => !isImageHref(i.href));
  const selected = houseItems.find((i) => i.id === picked) || null;
  const kitName = kits.find((k) => k.id === kitFilter)?.name || kitFilter;
  const on = (key: keyof KitShown) => shown[key] !== false;

  async function pickInto(target: Picker, item: AssetItem) {
    if (target === "logos" || target === "banners" || target === "people") {
      const flag = target === "people" ? "people" : target === "logos" ? "logo" : "banner";
      await patch(item.id, { flags: { share: true, [flag]: true } });
    } else if (target === "files") {
      await patch(item.id, { flags: { share: true } });
    } else if (target === "founder" || target === "product" || target === "campaigns") {
      if (target === "founder") await patch(item.id, { flags: { share: true, people: true } });
      if (target === "product") await patch(item.id, { flags: { share: true, banner: true } });
      if (target === "campaigns") await patch(item.id, { flags: { share: true } });
      await saveFrame({ cover: { [target]: item.id } });
    } else if (target === "story-image" || target === "promo-image") {
      setDraftImage(item.href);
    }
    setPicker(null);
  }

  const rail: { id: Tab; label: string; group?: string }[] = [
    { id: "overview", label: "The kit" },
    { id: "stories", label: "Stories ready to run", group: "copy" },
    { id: "promos", label: "Promotions", group: "copy" },
    { id: "logos", label: "Logos", group: "vault" },
    { id: "banners", label: "Banners", group: "vault" },
    { id: "people", label: "People", group: "vault" },
    { id: "files", label: "Files", group: "vault" },
  ];

  return (
    <div className="assets-desk epk-board">
      <p className="epk-board__kits">
        <a href={`/account?desk=assets&view=assets${kitFilter ? `&kit=${encodeURIComponent(kitFilter)}` : ""}`}>
          Asset library
        </a>
      </p>
      {kits.length > 1 && !lockedKit ? (
        <p className="epk-board__kits">
          {kits.map((kit) => (
            <button
              key={kit.id}
              type="button"
              className={kitFilter === kit.id ? "is-on chamfer" : "chamfer"}
              onClick={() => {
                setKitFilter(kit.id);
                setPicked(null);
                setFreshCode("");
                setTab("overview");
              }}
            >
              {kit.name}
            </button>
          ))}
        </p>
      ) : null}
      {error ? <p className="body">{error}</p> : null}
      <div className="epk epk-map is-edit">
        <header className="epk-map__bar">
          <p className="epk-map__kit">
            <strong>{kitName}</strong>
            <span>Electronic Press Kit</span>
          </p>
          <EpkStudioStamp />
          <div className="epk-map__marks">
            <a className="epk-contact-btn chamfer" href={epkHref(kitFilter)}>
              See it live
            </a>
          </div>
        </header>
        <div className="epk-map__body">
          <aside className="epk-rail chamfer">
            <p className="epk-rail__group">
              {rail
                .filter((row) => !row.group)
                .map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={tab === row.id ? "is-on" : ""}
                    onClick={() => {
                      setTab(row.id);
                      setPicked(null);
                      setComposing(null);
                    }}
                  >
                    {row.label}
                  </button>
                ))}
            </p>
            <p className="epk-rail__group">
              <span>Stories &amp; promotions</span>
              {rail
                .filter((row) => row.group === "copy")
                .map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={tab === row.id ? "is-on" : ""}
                    onClick={() => {
                      setTab(row.id);
                      setPicked(null);
                      setComposing(null);
                    }}
                  >
                    {row.label}
                  </button>
                ))}
            </p>
            <p className="epk-rail__group">
              <span>Asset vault</span>
              {rail
                .filter((row) => row.group === "vault")
                .map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={tab === row.id ? "is-on" : ""}
                    onClick={() => {
                      setTab(row.id);
                      setPicked(null);
                    }}
                  >
                    {row.label}
                  </button>
                ))}
            </p>
          </aside>
          <div className="epk-map__main">
            {tab === "overview" ? (
              <OverviewEdit
                items={houseItems}
                cover={cover}
                shown={shown}
                overview={overview}
                stories={stories}
                logos={logos}
                banners={banners}
                people={people}
                files={files}
                on={on}
                setOverview={setOverview}
                saveOverview={saveOverview}
                saveFrame={saveFrame}
                setPicker={setPicker}
                openStories={() => setTab("stories")}
              />
            ) : null}
            {tab === "logos" || tab === "banners" || tab === "people" || tab === "files" ? (
              <VaultEdit
                tab={tab}
                items={tab === "logos" ? logos : tab === "banners" ? banners : tab === "people" ? people : files}
                on={on(tab)}
                picked={selected}
                busy={busy}
                onToggleSection={() => saveFrame({ shown: { [tab]: !on(tab) } })}
                onPick={(id) => setPicked(picked === id ? null : id)}
                onAdd={() => setPicker(tab)}
                onPatch={patch}
                onRemoveFlag={
                  tab === "files"
                    ? undefined
                    : (item) =>
                        patch(item.id, {
                          flags: { [tab === "people" ? "people" : tab === "logos" ? "logo" : "banner"]: false },
                        })
                }
              />
            ) : null}
            {tab === "stories" ? (
              <CopyEdit
                kind="story"
                heading="Stories ready to run"
                rows={stories}
                composing={composing === "story"}
                draftTitle={draftTitle}
                draftBody={draftBody}
                draftImage={draftImage}
                images={images}
                busy={busy}
                on={on("stories")}
                onToggleSection={() => saveFrame({ shown: { stories: !on("stories") } })}
                onCompose={() => {
                  setComposing("story");
                  setEditingId(null);
                  setDraftTitle("");
                  setDraftBody("");
                  setDraftImage("");
                }}
                onEdit={(row) => {
                  setComposing("story");
                  setEditingId(row.id);
                  setDraftTitle(row.title);
                  setDraftBody(row.body);
                  setDraftImage(row.imageHref || "");
                }}
                onToggleLive={(id, live) => toggleLive("story", id, live)}
                onRemove={(id) => removeArticle("story", id)}
                onSave={() => saveArticle("story")}
                setDraftTitle={setDraftTitle}
                setDraftBody={setDraftBody}
                setDraftImage={setDraftImage}
                pickImage={() => setPicker("story-image")}
                cancel={() => {
                  setComposing(null);
                  setEditingId(null);
                }}
              />
            ) : null}
            {tab === "promos" ? (
              <CopyEdit
                kind="promo"
                heading="Promotions"
                rows={promos}
                composing={composing === "promo"}
                draftTitle={draftTitle}
                draftBody={draftBody}
                draftImage={draftImage}
                images={images}
                busy={busy}
                freshCode={freshCode}
                kit={kitFilter}
                on={on("promos")}
                onToggleSection={() => saveFrame({ shown: { promos: !on("promos") } })}
                onCompose={() => {
                  setComposing("promo");
                  setEditingId(null);
                  setDraftTitle("");
                  setDraftBody("");
                  setDraftImage("");
                  setFreshCode("");
                }}
                onEdit={(row) => {
                  setComposing("promo");
                  setEditingId(row.id);
                  setDraftTitle(row.title);
                  setDraftBody(row.body);
                  setDraftImage(row.imageHref || "");
                }}
                onToggleLive={(id, live) => toggleLive("promo", id, live)}
                onRemove={(id) => removeArticle("promo", id)}
                onSave={() => saveArticle("promo")}
                onRotate={rotatePromo}
                setDraftTitle={setDraftTitle}
                setDraftBody={setDraftBody}
                setDraftImage={setDraftImage}
                pickImage={() => setPicker("promo-image")}
                cancel={() => {
                  setComposing(null);
                  setEditingId(null);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
      {picker ? (
        <div className="epk-picker">
          <div className="epk-picker__card chamfer">
            <p className="kicker">Library</p>
            <h2>{picker === "files" ? "Choose a file" : "Choose a still"}</h2>
            <ul className="epk-still-grid">
              {(picker === "files" ? docs : images).length ? (
                (picker === "files" ? docs : images).map((item) => (
                  <li key={item.id}>
                    <button type="button" className="epk-still-plate chamfer" onClick={() => pickInto(picker, item)}>
                      <Plate href={item.href} title={item.title} />
                    </button>
                    <span className="assets-caption">{item.title}</span>
                  </li>
                ))
              ) : (
                <li>
                  <p>
                    Nothing here yet.{" "}
                    <a href={`/account?desk=assets&view=assets&kit=${encodeURIComponent(kitFilter)}`}>
                      Open the library
                    </a>
                    .
                  </p>
                </li>
              )}
            </ul>
            <p>
              <label className="assets-upload">
                Upload a new file
                <input
                  type="file"
                  accept="image/*,.pdf,.txt,.md,application/pdf,text/plain"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {" · "}
              <a href={`/account?desk=assets&view=assets&kit=${encodeURIComponent(kitFilter)}`}>Asset library</a>
              {" · "}
              <button type="button" className="assets-text-btn" onClick={() => setPicker(null)}>
                Close
              </button>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OverviewEdit({
  items,
  cover,
  shown,
  overview,
  stories,
  logos,
  banners,
  people,
  files,
  on,
  setOverview,
  saveOverview,
  saveFrame,
  setPicker,
  openStories,
}: {
  items: AssetItem[];
  cover: KitCover;
  shown: KitShown;
  overview: string[];
  stories: Story[];
  logos: AssetItem[];
  banners: AssetItem[];
  people: AssetItem[];
  files: AssetItem[];
  on: (key: keyof KitShown) => boolean;
  setOverview: (v: string[]) => void;
  saveOverview: () => void;
  saveFrame: (next: { cover?: KitCover; shown?: KitShown }) => void;
  setPicker: (p: Picker) => void;
  openStories: () => void;
}) {
  void shown;
  const heroes: VaultLaneId[] = ["founder", "product", "campaigns"];
  const labels: Record<VaultLaneId, string> = {
    logos: "Logos",
    product: "Banners",
    founder: "People",
    campaigns: "Campaigns",
  };
  return (
    <section className="epk-cover-map">
      <div className="epk-heroes">
        {heroes.map((lane) => {
          const item = laneStill(items, cover, lane);
          return (
            <button
              key={lane}
              type="button"
              className={`epk-hero chamfer is-${lane}`}
              onClick={() => setPicker(lane)}
            >
              {item && isImageHref(item.href) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.href} alt="" />
              ) : (
                <span className="epk-hero__empty" />
              )}
              <span>{labels[lane]} · change</span>
            </button>
          );
        })}
      </div>
      <ul className="epk-story-plates">
        {stories.slice(0, 5).map((row, i) => (
          <li key={row.id}>
            <button type="button" onClick={openStories}>
              <span className="epk-plate__still chamfer">
                {row.imageHref && isImageHref(row.imageHref) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.imageHref} alt="" />
                ) : null}
              </span>
              <span className="epk-plate__cap">
                Story {i + 1}
                <strong>{row.title}</strong>
              </span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className="epk-add chamfer" onClick={openStories}>
            <span>New story</span>
          </button>
        </li>
      </ul>
      <div className="epk-vault-strip chamfer">
        <div>
          <p className="kicker">Asset vault</p>
          <p>On the kit, or off. The live pack follows this.</p>
        </div>
        <ul>
          {(
            [
              ["logos", "Logos", logos],
              ["banners", "Banners", banners],
              ["people", "People", people],
              ["files", "Files", files],
            ] as const
          ).map(([key, label, list]) => (
            <li key={key}>
              <button
                type="button"
                className={on(key) ? "is-on" : "is-off"}
                onClick={() => saveFrame({ shown: { [key]: !on(key) } })}
              >
                <span className="epk-plate__still chamfer">
                  {list[0] && isImageHref(list[0].href) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={list[0].href} alt="" />
                  ) : null}
                </span>
                <span className="epk-plate__cap">
                  {label}
                  <em>{on(key) ? "On the kit" : "Off"}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="epk-story-block">
        <p className="kicker">Our story</p>
        <textarea
          rows={8}
          value={overview.join("\n\n")}
          onChange={(e) => setOverview(e.target.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean))}
          onBlur={saveOverview}
        />
      </div>
    </section>
  );
}

function VaultEdit({
  tab,
  items,
  on,
  picked,
  busy,
  onToggleSection,
  onPick,
  onAdd,
  onPatch,
  onRemoveFlag,
}: {
  tab: EpkSection;
  items: AssetItem[];
  on: boolean;
  picked: AssetItem | null;
  busy: boolean;
  onToggleSection: () => void;
  onPick: (id: string) => void;
  onAdd: (() => void) | null;
  onPatch: (id: string, body: Record<string, unknown>) => void;
  onRemoveFlag?: (item: AssetItem) => void;
}) {
  const label = tab[0].toUpperCase() + tab.slice(1);
  return (
    <section>
      <p className="epk-board__head">
        <span className="kicker">{label}</span>
        <button type="button" className={`epk-onoff chamfer${on ? " is-on" : ""}`} onClick={onToggleSection}>
          {on ? "On the kit" : "Off the kit"}
        </button>
      </p>
      <h1>{label}</h1>
      <ul className="epk-still-grid">
        {items.map((item) => (
          <li key={item.id} className="epk-still-cell">
            <button
              type="button"
              className={`epk-still-plate chamfer${picked?.id === item.id ? " is-on" : ""}`}
              onClick={() => onPick(item.id)}
            >
              <Plate href={item.href} title={item.title} />
            </button>
            <span className="assets-caption">{item.title}</span>
            {onRemoveFlag ? (
              <button type="button" className="epk-plate-x chamfer" onClick={() => onRemoveFlag(item)}>
                Remove
              </button>
            ) : null}
          </li>
        ))}
        <li>
          <button type="button" className="epk-add chamfer" disabled={busy} onClick={() => onAdd?.()}>
            <span>Add {label.toLowerCase()}</span>
          </button>
        </li>
      </ul>
      {picked ? (
        <div className="assets-inspect">
          {isImageHref(picked.href) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="chamfer" src={picked.href} alt="" />
          ) : (
            <div className="assets-plate chamfer is-file">
              <Plate href={picked.href} title={picked.title} />
            </div>
          )}
          <div>
            <label htmlFor="asset-title">Title</label>
            <input
              id="asset-title"
              key={`${picked.id}-title`}
              defaultValue={picked.title}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== picked.title) onPatch(picked.id, { title: v });
              }}
            />
            <label htmlFor="asset-note">About this file</label>
            <textarea
              id="asset-note"
              key={`${picked.id}-note`}
              rows={4}
              defaultValue={picked.note || ""}
              onBlur={(e) => {
                const v = e.target.value;
                if (v !== (picked.note || "")) onPatch(picked.id, { note: v });
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CopyEdit({
  kind,
  heading,
  rows,
  composing,
  draftTitle,
  draftBody,
  draftImage,
  images,
  busy,
  freshCode,
  kit,
  on,
  onToggleSection,
  onCompose,
  onEdit,
  onToggleLive,
  onRemove,
  onSave,
  onRotate,
  setDraftTitle,
  setDraftBody,
  setDraftImage,
  pickImage,
  cancel,
}: {
  kind: "story" | "promo";
  heading: string;
  rows: Story[] | Promo[];
  composing: boolean;
  draftTitle: string;
  draftBody: string;
  draftImage: string;
  images: AssetItem[];
  busy: boolean;
  freshCode?: string;
  kit?: string;
  on: boolean;
  onToggleSection: () => void;
  onCompose: () => void;
  onEdit: (row: Story | Promo) => void;
  onToggleLive: (id: string, live: boolean) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  onRotate?: (id: string) => void;
  setDraftTitle: (v: string) => void;
  setDraftBody: (v: string) => void;
  setDraftImage: (v: string) => void;
  pickImage: () => void;
  cancel: () => void;
}) {
  void images;
  return (
    <section>
      <p className="epk-board__head">
        <span className="kicker">{heading}</span>
        <button type="button" className={`epk-onoff chamfer${on ? " is-on" : ""}`} onClick={onToggleSection}>
          {on ? "On the kit" : "Off the kit"}
        </button>
      </p>
      <h1>{heading}</h1>
      {freshCode ? (
        <p className="assets-code">
          Code for this promotion: <strong>{freshCode}</strong>
        </p>
      ) : null}
      <ul className="epk-story-plates is-page">
        {rows.map((row, i) => (
          <li key={row.id}>
            <div className={`epk-edit-card${row.live === false ? " is-off" : ""}`}>
              <span className="epk-plate__still chamfer">
                {row.imageHref && isImageHref(row.imageHref) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.imageHref} alt="" />
                ) : null}
              </span>
              <span className="epk-plate__cap">
                {kind === "story" ? `Story ${i + 1}` : "Promotion"}
                <strong>{row.title}</strong>
              </span>
              {kind === "promo" && kit ? <p className="epk-edit-card__url">{epkHref(kit, `promos/${row.id}`)}</p> : null}
              <p className="epk-plate-acts">
                <button type="button" className="assets-text-btn" onClick={() => onEdit(row)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="assets-text-btn"
                  onClick={() => onToggleLive(row.id, row.live === false)}
                >
                  {row.live === false ? "Put on the kit" : "Take off"}
                </button>
                {onRotate ? (
                  <button type="button" className="assets-text-btn" onClick={() => onRotate(row.id)}>
                    New code
                  </button>
                ) : null}
                <button type="button" className="assets-text-btn" onClick={() => onRemove(row.id)}>
                  Remove
                </button>
              </p>
            </div>
          </li>
        ))}
        <li>
          <button type="button" className="epk-add chamfer" onClick={onCompose}>
            <span>{kind === "story" ? "New story" : "New promotion"}</span>
          </button>
        </li>
      </ul>
      {composing ? (
        <div className="epk-station">
          <h3>{draftTitle ? "Edit" : kind === "story" ? "New story" : "New promotion"}</h3>
          <label>Title</label>
          <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
          <label>Text</label>
          <textarea rows={8} value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
          <p>
            <button type="button" className="assets-text-btn" onClick={pickImage}>
              {draftImage ? "Change picture" : "Add a picture"}
            </button>
          </p>
          {draftImage && isImageHref(draftImage) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="epk-article__img chamfer" src={draftImage} alt="" />
          ) : null}
          <p className="epk-index__acts">
            <button type="button" disabled={busy || !draftTitle.trim()} onClick={onSave}>
              Save
            </button>
            <button type="button" className="assets-text-btn" onClick={cancel}>
              Cancel
            </button>
          </p>
        </div>
      ) : null}
    </section>
  );
}
