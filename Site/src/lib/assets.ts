import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  autoPackHref,
  harvestPress,
  kitFromPressHref,
  shouldKeepHref,
} from "@/lib/press-harvest";
import { canDeleteHref, isShared } from "@/lib/assets-view";

const ROOT = path.join(process.cwd(), "..");
const FILE = path.join(ROOT, "_meta", "assets", "index.json");
const PUBLIC = path.join(ROOT, "Site", "public");

export type AssetKind = "image" | "pdf" | "text" | "blueprint" | "brief";

export type AssetFlags = {
  logo?: boolean;
  banner?: boolean;
  people?: boolean;
  post?: boolean;
  pack?: boolean;
  share?: boolean;
};

export type AssetComment = {
  id: string;
  body: string;
  by: string;
  at: string;
};

export type AssetItem = {
  id: string;
  href: string;
  title: string;
  kind: AssetKind;
  flags: AssetFlags;
  kit?: string;
  star?: boolean;
  note?: string;
  comments?: AssetComment[];
  addedAt: string;
};

export type AssetIndex = {
  items: AssetItem[];
};

const EMPTY: AssetIndex = { items: [] };
const SKIP_DIRS = new Set(["Screenshots", "archive", "motion"]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

async function readIndex(): Promise<AssetIndex> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as AssetIndex;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { ...EMPTY, items: [] };
  }
}

async function writeIndex(index: AssetIndex): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

function extKind(file: string): AssetKind | null {
  const ext = path.extname(file).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  if ([".md", ".txt"].includes(ext)) return "text";
  return null;
}

async function walk(dir: string, rel: string, out: string[], depth: number): Promise<void> {
  if (depth > 6) return;
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    const next = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(full, next, out, depth + 1);
    } else if (extKind(e.name)) {
      out.push(`/${next}`);
    }
  }
}

function defaultNote(href: string): string | undefined {
  const h = href.toLowerCase();
  if (h.includes("dln-mute")) return "Design Lab North mark on Paper.";
  if (h.includes("dln-white")) return "Design Lab North mark on Ink.";
  if (h.includes("dln-ink")) return "Design Lab North mark, ink extract.";
  if (h.includes("/press/modyu/") && /logo/.test(h) && /white/.test(h)) {
    return "ModYu mark on a dark ground.";
  }
  if (h.includes("/press/modyu/") && /logo/.test(h)) return "ModYu mark.";
  if (h.includes("people-hero")) return "People still from the ModYu house.";
  if (h.includes("ht4-system-banner") || h.includes("ht4-system.png") || h.includes("ht4-system-main")) {
    return "HT4 system still.";
  }
  if (h.includes("bottles-lineup")) return "ModYu lineup.";
  if (h.endsWith("/clinic-pack.png")) return "Clinic pack.";
  if (h.includes("paulfosbury")) return "Paul Fosbury Portraits plate.";
  if (h.includes("swarm-fund-mark") || h.endsWith("/swarm.svg")) return "Swarm Fund hive mark.";
  if (h.includes("swarm-fund-logo")) return "Swarm Fund wordmark.";
  if (h.includes("various-titles-white") || h.includes("vt-white") || h.includes("vt-logo-02")) {
    return "Various Titles mark on Ink.";
  }
  if (h.includes("various-titles") || h.includes("vt-mute") || h.includes("vt-logo-01")) {
    return "Various Titles mark on Paper.";
  }
  if (/field-(mist|gold|sand|teal|navy|ink|gap)\./.test(h)) return "DAA colour field.";
  if (h.includes("mark-barlow") && !h.includes("live")) return "Mark Barlow, Digital Adoption Advisor.";
  if (h.includes("greisy-flores")) return "Greisy Flores — DAA Sessions.";
  if (h.includes("/people/council")) return "DAA Council still.";
  if (h.includes("mark-as-shipped") || h.includes("daa-logo") || h.endsWith("/daa.png")) {
    return "DAA mark.";
  }
  if (h.includes("framework/01-comms")) return "Design Lab North framework plate — Comms.";
  if (h.endsWith("/dave.png")) return "Dave Kirkwood.";
  return undefined;
}

function titleFromHref(href: string): string {
  const base = href.split("/").pop() || href;
  return base.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
}

export function guessKit(href: string): string | undefined {
  const fromPress = kitFromPressHref(href);
  if (fromPress) return fromPress;
  const h = href.toLowerCase();
  if (h.startsWith("/brand/") || h.startsWith("/brief/frameworks/") || h.startsWith("/press/dln/")) {
    return "dln";
  }
  if (h.includes("modyu") || h.includes("follicle") || h.includes("ht4")) return "modyu";
  if (h.includes("fosbury") || h.includes("logos-07") || h.includes("/pfp")) return "pfp";
  if (h.includes("/daa") || h.includes("logos-15")) return "daa";
  if (h.includes("swarm")) return "swarm";
  if (h.includes("various-titles") || h.includes("vt-logo") || h.startsWith("/press/titles/")) {
    return "titles";
  }
  if (h.includes("/dks") || h.endsWith("/dave.png")) return "dks";
  if (h.startsWith("/plots/modyu")) return "modyu";
  if (h.startsWith("/plots/swarm")) return "swarm";
  if (h.startsWith("/plots/various")) return "titles";
  return undefined;
}

function defaultFlags(href: string): AssetFlags {
  if (autoPackHref(href)) {
    const people = /mark-barlow|greisy-flores|\/people\/council|founder-headshot|ht4-people-hero|people-lead/.test(
      href.toLowerCase(),
    );
    const logo =
      /logo|mark-as-shipped|swarm-fund-mark|dln-(mute|white|ink)|\/daa\.png|daa-logo/i.test(href) &&
      !/mark-barlow/.test(href.toLowerCase());
    return { pack: true, share: true, ...(logo ? { logo: true } : {}), ...(people ? { people: true } : {}) };
  }
  return {};
}

export { isImageHref, isShared } from "@/lib/assets-view";

export async function seedAssets(): Promise<AssetIndex> {
  await harvestPress();
  const index = await readIndex();
  const seen = new Set(index.items.map((i) => i.href));
  const hrefs: string[] = [];
  await walk(path.join(PUBLIC, "press"), "press", hrefs, 0);
  await walk(path.join(PUBLIC, "brand"), "brand", hrefs, 0);
  await walk(path.join(PUBLIC, "brief", "Frameworks"), "brief/Frameworks", hrefs, 0);
  const now = new Date().toISOString();
  let dirty = false;
  const kept: AssetItem[] = [];
  for (const item of index.items) {
    if (!shouldKeepHref(item.href) && !item.href.startsWith("/press/")) {
      dirty = true;
      continue;
    }
    if (item.href.startsWith("/") && !item.href.startsWith("memory://")) {
      const stray = /\/press\/(?!dln\/)[^/]+\/.*dln[-.]/i.test(item.href);
      if (stray) {
        dirty = true;
        continue;
      }
    }
    if (!item.kit) {
      const guessed = guessKit(item.href);
      if (guessed) {
        item.kit = guessed;
        dirty = true;
      }
    }
    if (autoPackHref(item.href) && !inPack(item)) {
      item.flags = { ...item.flags, ...defaultFlags(item.href) };
      dirty = true;
    }
    if (!item.note) {
      const note = defaultNote(item.href);
      if (note) {
        item.note = note;
        dirty = true;
      }
    }
    kept.push(item);
  }
  if (kept.length !== index.items.length) {
    index.items = kept;
    dirty = true;
  }
  for (const href of hrefs) {
    if (seen.has(href)) continue;
    if (/\/press\/(?!dln\/)[^/]+\/.*dln[-.]/i.test(href)) continue;
    const kind = extKind(href) || "brief";
    index.items.push({
      id: randomUUID(),
      href,
      title: titleFromHref(href),
      kind,
      flags: defaultFlags(href),
      kit: guessKit(href),
      note: defaultNote(href),
      addedAt: now,
    });
    seen.add(href);
    dirty = true;
  }
  if (dirty) await writeIndex(index);
  return index;
}

export async function peekAssets(): Promise<AssetIndex> {
  return readIndex();
}

export async function listAssets(): Promise<AssetIndex> {
  return seedAssets();
}

export async function patchAsset(input: {
  id: string;
  flags?: AssetFlags;
  star?: boolean;
  note?: string;
  title?: string;
  kit?: string | null;
}): Promise<AssetItem | null> {
  let index = await readIndex();
  if (!index.items.length) index = await seedAssets();
  const item = index.items.find((i) => i.id === input.id);
  if (!item) return null;
  if (input.flags) item.flags = { ...item.flags, ...input.flags };
  if (input.star !== undefined) item.star = input.star;
  if (input.note !== undefined) item.note = input.note;
  if (input.title !== undefined) item.title = input.title;
  if (input.kit !== undefined) {
    const kit = (input.kit || "").trim().toLowerCase();
    if (kit) item.kit = kit;
    else delete item.kit;
  }
  await writeIndex(index);
  return item;
}

export function inPack(item: AssetItem): boolean {
  return Boolean(item.flags.pack || item.flags.logo || item.flags.banner || item.flags.people || item.flags.post);
}

export function pressPack(index: AssetIndex, kit?: string): AssetItem[] {
  return index.items.filter((i) => {
    if (!isShared(i)) return false;
    if (kit && i.kit !== kit) return false;
    return true;
  });
}

export function publicHref(item: AssetItem): string | null {
  if (item.href.startsWith("memory://")) return null;
  if (item.href.startsWith("/")) return item.href;
  return null;
}

function safeUploadName(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return base.slice(0, 80) || "file";
}

export async function addUploadedAsset(input: {
  kit: string;
  filename: string;
  bytes: Buffer;
  flags?: AssetFlags;
}): Promise<AssetItem | null> {
  const ext = path.extname(input.filename).toLowerCase();
  const kind = extKind(`x${ext}`);
  if (!kind) return null;
  const kit = input.kit.trim().toLowerCase();
  const name = `${randomUUID().slice(0, 8)}-${safeUploadName(input.filename)}`;
  const rel = path.posix.join("press", kit, "uploads", name);
  const dest = path.join(PUBLIC, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, input.bytes);
  const href = `/${rel}`;
  const index = await readIndex();
  const item: AssetItem = {
    id: randomUUID(),
    href,
    title: titleFromHref(href),
    kind: kind === "pdf" ? "pdf" : kind,
    flags: { ...(input.flags || {}) },
    kit,
    addedAt: new Date().toISOString(),
  };
  index.items.push(item);
  await writeIndex(index);
  return item;
}

export async function addTextAsset(input: {
  kit: string;
  title: string;
  body: string;
  flags?: AssetFlags;
}): Promise<AssetItem | null> {
  const kit = input.kit.trim().toLowerCase();
  if (!kit) return null;
  const title = input.title.trim() || "Note";
  const slug = safeUploadName(title).replace(/\.(txt|md)$/i, "") || "note";
  const name = `${randomUUID().slice(0, 8)}-${slug}.txt`;
  const rel = path.posix.join("press", kit, "docs", name);
  const dest = path.join(PUBLIC, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, input.body.replace(/\r\n/g, "\n"), "utf8");
  const href = `/${rel}`;
  const index = await readIndex();
  const item: AssetItem = {
    id: randomUUID(),
    href,
    title,
    kind: "text",
    flags: { ...(input.flags || {}) },
    kit,
    addedAt: new Date().toISOString(),
  };
  index.items.push(item);
  await writeIndex(index);
  return item;
}

function pressPath(href: string): string | null {
  if (!canDeleteHref(href)) return null;
  const rel = href.replace(/^\//, "");
  const dest = path.resolve(PUBLIC, rel);
  const root = path.resolve(PUBLIC, "press") + path.sep;
  if (!dest.startsWith(root)) return null;
  return dest;
}

export async function deleteAsset(id: string): Promise<boolean> {
  const index = await readIndex();
  const item = index.items.find((row) => row.id === id);
  if (!item) return false;
  const dest = pressPath(item.href);
  if (!dest) return false;
  try {
    await fs.unlink(dest);
  } catch {
    /* missing file still drops the index row */
  }
  index.items = index.items.filter((row) => row.id !== id);
  await writeIndex(index);
  return true;
}

export async function addAssetComment(input: {
  id: string;
  body: string;
  by: string;
}): Promise<AssetItem | null> {
  const text = input.body.trim();
  if (!text) return null;
  const index = await readIndex();
  const item = index.items.find((row) => row.id === input.id);
  if (!item) return null;
  const row: AssetComment = {
    id: randomUUID(),
    body: text.slice(0, 4000),
    by: input.by.trim() || "Studio",
    at: new Date().toISOString(),
  };
  item.comments = [...(item.comments || []), row];
  await writeIndex(index);
  return item;
}

export function assetsForKit(index: AssetIndex, kit: string): AssetItem[] {
  return index.items.filter((i) => i.kit === kit);
}
