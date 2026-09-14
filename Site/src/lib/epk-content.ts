import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { generateEpkCode, normalizeCode, resolveKitByCode } from "@/lib/epk";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { epkDoc } from "@/lib/epk-doc";
import { isKitId, kitName, safeEpkNext } from "@/lib/epk-map";
import { KIT_COPY } from "@/lib/epk-copy";
import type { EpkPromo, EpkStory, KitContent, KitCover, KitShown } from "@/lib/epk-content-model";

export type { EpkPromo, EpkStory, KitContent, KitCover, KitShown } from "@/lib/epk-content-model";
export { isShown, livePromos, liveStories, promoById, storyById } from "@/lib/epk-content-model";

const DIR = path.join(process.cwd(), "..", "_meta", "epk", "content");
const MAX_BODY = 12000;
const MAX_TITLE = 160;

function clip(raw: string, max: number): string {
  return raw.replace(/\r\n/g, "\n").trim().slice(0, max);
}

function slugId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || randomUUID().slice(0, 8);
}

function fileFor(kit: string): string {
  return path.join(DIR, `${kit}.json`);
}

function empty(kit: string): KitContent {
  return { kit, overview: [], stories: [], promos: [], cover: {}, shown: {} };
}

function seedFromDoc(kit: string): KitContent {
  const doc = epkDoc(kit);
  const overview = [...(doc.story?.paras || [])].filter(Boolean).slice(0, 8);
  const stories: EpkStory[] = (doc.pitches || []).map((pitch) => ({
    id: slugId(pitch.id || pitch.title),
    title: pitch.title,
    body: [pitch.question, ...(pitch.story || []), pitch.whyNow, pitch.evidence]
      .filter(Boolean)
      .join("\n\n"),
    createdAt: new Date().toISOString(),
    seeded: true,
  }));
  if (doc.founder?.paras?.length) {
    stories.push({
      id: slugId(doc.founder.title || "people"),
      title: doc.founder.title,
      body: [doc.founder.pull, ...(doc.founder.paras || [])].filter(Boolean).join("\n\n"),
      createdAt: new Date().toISOString(),
      seeded: true,
    });
  }
  return { kit, overview, stories, promos: [], cover: {}, shown: {} };
}

async function readFile(kit: string): Promise<KitContent | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(fileFor(kit), "utf8")) as KitContent;
    if (!parsed || parsed.kit !== kit) return null;
    return {
      kit,
      overview: Array.isArray(parsed.overview) ? parsed.overview.map((p) => clip(String(p), 2400)) : [],
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
      promos: Array.isArray(parsed.promos) ? parsed.promos : [],
      cover: parsed.cover && typeof parsed.cover === "object" ? parsed.cover : {},
      shown: parsed.shown && typeof parsed.shown === "object" ? parsed.shown : {},
    };
  } catch {
    return null;
  }
}

async function writeFile(content: KitContent): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(fileFor(content.kit), `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

export async function loadKitContent(kit: string): Promise<KitContent> {
  if (!isKitId(kit)) return empty(kit);
  const existing = await readFile(kit);
  if (existing) return existing;
  const seeded = seedFromDoc(kit);
  await writeFile(seeded);
  return seeded;
}

export async function saveKitOverview(kit: string, overview: string[]): Promise<KitContent> {
  const cur = await loadKitContent(kit);
  cur.overview = overview.map((p) => clip(p, 2400)).filter(Boolean).slice(0, 12);
  await writeFile(cur);
  return cur;
}

export async function saveKitFrame(
  kit: string,
  input: { cover?: KitCover; shown?: KitShown },
): Promise<KitContent> {
  const cur = await loadKitContent(kit);
  if (input.cover) cur.cover = { ...cur.cover, ...input.cover };
  if (input.shown) cur.shown = { ...cur.shown, ...input.shown };
  await writeFile(cur);
  return cur;
}

export async function setPieceLive(
  kit: string,
  kind: "story" | "promo",
  id: string,
  live: boolean,
): Promise<boolean> {
  const cur = await loadKitContent(kit);
  const row = kind === "story" ? cur.stories.find((s) => s.id === id) : cur.promos.find((p) => p.id === id);
  if (!row) return false;
  row.live = live;
  row.updatedAt = new Date().toISOString();
  await writeFile(cur);
  return true;
}

export async function upsertStory(
  kit: string,
  input: { id?: string; title: string; body: string; imageHref?: string },
): Promise<EpkStory> {
  const cur = await loadKitContent(kit);
  const title = clip(input.title, MAX_TITLE) || "Story";
  const body = clip(input.body, MAX_BODY);
  const now = new Date().toISOString();
  const existing = input.id ? cur.stories.find((s) => s.id === input.id) : undefined;
  if (existing) {
    existing.title = title;
    existing.body = body;
    existing.imageHref = input.imageHref || undefined;
    existing.updatedAt = now;
    existing.seeded = false;
    await writeFile(cur);
    return existing;
  }
  let id = slugId(title);
  if (cur.stories.some((s) => s.id === id) || cur.promos.some((p) => p.id === id)) {
    id = `${id}-${randomUUID().slice(0, 4)}`;
  }
  const story: EpkStory = {
    id,
    title,
    body,
    imageHref: input.imageHref || undefined,
    createdAt: now,
    live: true,
  };
  cur.stories.push(story);
  await writeFile(cur);
  return story;
}

export async function deleteStory(kit: string, id: string): Promise<boolean> {
  const cur = await loadKitContent(kit);
  const next = cur.stories.filter((s) => s.id !== id);
  if (next.length === cur.stories.length) return false;
  cur.stories = next;
  await writeFile(cur);
  return true;
}

export async function upsertPromo(
  kit: string,
  input: { id?: string; title: string; body: string; imageHref?: string; freshCode?: boolean },
): Promise<{ promo: EpkPromo; code?: string }> {
  const cur = await loadKitContent(kit);
  const title = clip(input.title, MAX_TITLE) || "Promotion";
  const body = clip(input.body, MAX_BODY);
  const now = new Date().toISOString();
  const existing = input.id ? cur.promos.find((p) => p.id === input.id) : undefined;
  let code: string | undefined;
  if (existing) {
    existing.title = title;
    existing.body = body;
    existing.imageHref = input.imageHref || undefined;
    existing.updatedAt = now;
    if (input.freshCode) {
      code = generateEpkCode();
      existing.codeHash = hashPassword(code);
    }
    await writeFile(cur);
    return { promo: existing, code };
  }
  let id = slugId(title);
  if (cur.promos.some((p) => p.id === id) || cur.stories.some((s) => s.id === id)) {
    id = `${id}-${randomUUID().slice(0, 4)}`;
  }
  if (input.freshCode !== false) {
    code = generateEpkCode();
  }
  const promo: EpkPromo = {
    id,
    title,
    body,
    imageHref: input.imageHref || undefined,
    createdAt: now,
    live: true,
    codeHash: code ? hashPassword(code) : undefined,
  };
  cur.promos.push(promo);
  await writeFile(cur);
  return { promo, code };
}

export async function deletePromo(kit: string, id: string): Promise<boolean> {
  const cur = await loadKitContent(kit);
  const next = cur.promos.filter((p) => p.id !== id);
  if (next.length === cur.promos.length) return false;
  cur.promos = next;
  await writeFile(cur);
  return true;
}

export async function rotatePromoCode(kit: string, id: string): Promise<string | null> {
  const cur = await loadKitContent(kit);
  const promo = cur.promos.find((p) => p.id === id);
  if (!promo) return null;
  const code = generateEpkCode();
  promo.codeHash = hashPassword(code);
  promo.updatedAt = new Date().toISOString();
  await writeFile(cur);
  return code;
}

export type PressEntry = { kit: string; next: string };

export async function resolvePressEntry(code: string): Promise<PressEntry | null> {
  const kit = await resolveKitByCode(code);
  if (kit) return { kit: kit.id, next: safeEpkNext(kit.id) };
  const normalized = normalizeCode(code);
  if (normalized.length < 6) return null;
  for (const row of KIT_COPY) {
    const content = await readFile(row.id);
    if (!content) continue;
    for (const promo of content.promos) {
      if (promo.codeHash && verifyPassword(normalized, promo.codeHash)) {
        return { kit: row.id, next: safeEpkNext(row.id, `/epk/${row.id}/promos/${promo.id}`) };
      }
    }
  }
  return null;
}

export { kitName };
