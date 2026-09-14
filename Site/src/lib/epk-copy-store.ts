import { promises as fs } from "fs";
import path from "path";
import { kitCopy, type KitCopy } from "@/lib/epk-copy";

export type KitCopyOverlay = {
  kicker?: string;
  lede?: string;
  overview?: string[];
  quotes?: string[];
  extra?: string[];
  editedAt?: string;
  editedBy?: string;
};

export type KitCopyResolved = KitCopy & {
  extra: string[];
  bespoke: boolean;
  editedAt?: string;
  editedBy?: string;
};

export type KitCopyDraft = {
  kicker: string;
  lede: string;
  overview: string[];
  quotes: string[];
  extra: string[];
};

type CopyFile = { kits: Record<string, KitCopyOverlay> };

const COPY_FILE = path.join(process.cwd(), "..", "_meta", "epk", "copy.json");
const MAX_PARA = 2400;
const MAX_LIST = 16;

function clip(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_PARA);
}

function clipList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((line) => clip(String(line || "")))
    .filter(Boolean)
    .slice(0, MAX_LIST);
}

async function readOverlays(): Promise<Record<string, KitCopyOverlay>> {
  try {
    const parsed = JSON.parse(await fs.readFile(COPY_FILE, "utf8")) as CopyFile;
    return parsed?.kits && typeof parsed.kits === "object" ? parsed.kits : {};
  } catch {
    return {};
  }
}

async function writeOverlays(kits: Record<string, KitCopyOverlay>): Promise<void> {
  await fs.mkdir(path.dirname(COPY_FILE), { recursive: true });
  await fs.writeFile(COPY_FILE, `${JSON.stringify({ kits }, null, 2)}\n`, "utf8");
}

export async function resolvedKitCopy(id: string): Promise<KitCopyResolved> {
  const base = kitCopy(id);
  const over = (await readOverlays())[id] || {};
  const extra = clipList(over.extra);
  const overviewCore = over.overview?.length ? clipList(over.overview) : base.overview;
  const quotes = over.quotes?.length ? clipList(over.quotes) : base.quotes;
  const bespoke = Boolean(
    over.kicker || over.lede || over.overview?.length || over.quotes?.length || extra.length,
  );
  return {
    ...base,
    kicker: over.kicker ? clip(over.kicker) : base.kicker,
    lede: over.lede ? clip(over.lede) : base.lede,
    overview: [...overviewCore, ...extra],
    quotes,
    extra,
    bespoke,
    editedAt: over.editedAt,
    editedBy: over.editedBy,
  };
}

export async function kitCopyDraft(id: string): Promise<KitCopyDraft> {
  const base = kitCopy(id);
  const over = (await readOverlays())[id] || {};
  return {
    kicker: over.kicker ? clip(over.kicker) : base.kicker,
    lede: over.lede ? clip(over.lede) : base.lede,
    overview: over.overview?.length ? clipList(over.overview) : base.overview,
    quotes: over.quotes?.length ? clipList(over.quotes) : base.quotes,
    extra: clipList(over.extra),
  };
}

export async function saveKitCopy(
  id: string,
  draft: KitCopyDraft,
  editor: string,
): Promise<KitCopyResolved> {
  const base = kitCopy(id);
  const kicker = clip(draft.kicker);
  const lede = clip(draft.lede);
  const overview = clipList(draft.overview);
  const quotes = clipList(draft.quotes);
  const extra = clipList(draft.extra);
  const overlay: KitCopyOverlay = {};
  if (kicker && kicker !== base.kicker) overlay.kicker = kicker;
  if (lede !== base.lede) overlay.lede = lede;
  if (overview.join("\n") !== base.overview.join("\n")) overlay.overview = overview;
  if (quotes.join("\n") !== base.quotes.join("\n")) overlay.quotes = quotes;
  if (extra.length) overlay.extra = extra;
  const kits = await readOverlays();
  if (!Object.keys(overlay).length) {
    delete kits[id];
  } else {
    overlay.editedAt = new Date().toISOString();
    overlay.editedBy = editor.slice(0, 80);
    kits[id] = overlay;
  }
  await writeOverlays(kits);
  return resolvedKitCopy(id);
}

export async function resetKitCopy(id: string): Promise<KitCopyResolved> {
  const kits = await readOverlays();
  delete kits[id];
  await writeOverlays(kits);
  return resolvedKitCopy(id);
}
