import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { hashPassword, isStudio, verifyPassword, type PublicUser } from "@/lib/auth";
import { EPK_COOKIE, EPK_MAX_AGE, epkCookieFields } from "@/lib/cookie-opts";
import { KIT_COPY } from "@/lib/epk-copy";
import { isKitId, plotsForKit, pressKitForPlot } from "@/lib/epk-map";

export { isKitId, kitName, plotsForKit, pressKitForPlot, epkHref, safeEpkNext } from "@/lib/epk-map";
export { EPK_COOKIE };

const ROOT = path.join(process.cwd(), "..", "_meta", "epk");
const KITS = path.join(ROOT, "kits.json");
const ATTEMPTS = path.join(ROOT, "attempts.json");
const UNLOCKS = path.join(ROOT, "unlocks.jsonl");
const SEED = path.join(ROOT, "SEED.txt");

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const ATTEMPT_MAX = 8;

export type EpkKit = {
  id: string;
  name: string;
  codeHash: string;
  createdAt: string;
  rotatedAt?: string;
};

type KitFile = { kits: EpkKit[] };
type AttemptMap = Record<string, { n: number; resetAt: number }>;

const STARTER: { id: string; name: string }[] = KIT_COPY.map((k) => ({
  id: k.id,
  name: k.name,
}));

export function publicKits(): { id: string; name: string }[] {
  return STARTER.map((k) => ({ ...k }));
}

/** Studio, or a client tagged to the plot that kit belongs to. Not every signed-in user. */
export function canViewKit(user: PublicUser | null | undefined, kit: string): boolean {
  if (!user || !isKitId(kit)) return false;
  if (isStudio(user)) return true;
  if (user.plots.includes("*")) return true;
  return plotsForKit(kit).some((slug) => user.plots.includes(slug));
}

export function canEditKit(user: PublicUser | null | undefined, kit: string): boolean {
  return canViewKit(user, kit);
}

/** Kits flagged on this account. Studio sees every house. */
export function kitsForUser(user: PublicUser | null | undefined): string[] {
  if (!user) return [];
  if (isStudio(user)) return KIT_COPY.map((k) => k.id);
  const ids = new Set<string>();
  for (const slug of user.plots) {
    if (slug === "*") {
      KIT_COPY.forEach((k) => ids.add(k.id));
      break;
    }
    const kit = pressKitForPlot(slug);
    if (kit) ids.add(kit);
  }
  return KIT_COPY.map((k) => k.id).filter((id) => ids.has(id));
}

export function normalizeCode(raw: string): string {
  return raw.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function generateEpkCode(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

async function readKits(): Promise<EpkKit[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(KITS, "utf8")) as KitFile;
    return Array.isArray(parsed.kits) ? parsed.kits : [];
  } catch {
    return [];
  }
}

async function writeKits(kits: EpkKit[]): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(KITS, `${JSON.stringify({ kits }, null, 2)}\n`, "utf8");
}

async function appendSeed(lines: string[]): Promise<void> {
  if (!lines.length) return;
  await fs.mkdir(ROOT, { recursive: true });
  let existing = "";
  try {
    existing = await fs.readFile(SEED, "utf8");
  } catch {
    existing = "# First press codes. Rotate from Assets after this. Do not commit.\n";
  }
  await fs.writeFile(SEED, `${existing.trimEnd()}\n${lines.join("\n")}\n`, "utf8");
}

export async function ensureKits(): Promise<EpkKit[]> {
  const kits = await readKits();
  const now = new Date().toISOString();
  const seeded: string[] = [];
  let dirty = false;
  for (const row of STARTER) {
    const existing = kits.find((k) => k.id === row.id);
    if (existing) {
      if (existing.name !== row.name) {
        existing.name = row.name;
        dirty = true;
      }
      continue;
    }
    const code = generateEpkCode();
    kits.push({
      id: row.id,
      name: row.name,
      codeHash: hashPassword(code),
      createdAt: now,
    });
    seeded.push(`${row.id} ${code}`);
    dirty = true;
  }
  if (dirty) {
    await writeKits(kits);
    await appendSeed(seeded);
  }
  return kits;
}

export async function listKitsPublic(): Promise<
  { id: string; name: string; createdAt: string; rotatedAt?: string }[]
> {
  const kits = await ensureKits();
  return kits.map((k) => ({
    id: k.id,
    name: k.name,
    createdAt: k.createdAt,
    rotatedAt: k.rotatedAt,
  }));
}

export async function rotateKitCode(id: string): Promise<string | null> {
  const kits = await ensureKits();
  const kit = kits.find((k) => k.id === id);
  if (!kit) return null;
  const code = generateEpkCode();
  kit.codeHash = hashPassword(code);
  kit.rotatedAt = new Date().toISOString();
  await writeKits(kits);
  return code;
}

export async function resolveKitByCode(code: string): Promise<EpkKit | null> {
  const normalized = normalizeCode(code);
  if (normalized.length < 6 || normalized.length > 12) return null;
  const kits = await ensureKits();
  for (const kit of kits) {
    if (verifyPassword(normalized, kit.codeHash)) return kit;
  }
  return null;
}

async function readAttempts(): Promise<AttemptMap> {
  try {
    return JSON.parse(await fs.readFile(ATTEMPTS, "utf8")) as AttemptMap;
  } catch {
    return {};
  }
}

export async function takeEpkAttempt(
  ip: string,
): Promise<{ ok: true } | { ok: false; waitMs: number }> {
  const key = (ip || "unknown").slice(0, 64);
  const now = Date.now();
  const map = await readAttempts();
  const cur = map[key];
  if (!cur || cur.resetAt <= now) {
    map[key] = { n: 1, resetAt: now + ATTEMPT_WINDOW_MS };
    await fs.mkdir(ROOT, { recursive: true });
    await fs.writeFile(ATTEMPTS, `${JSON.stringify(map)}\n`, "utf8");
    return { ok: true };
  }
  if (cur.n >= ATTEMPT_MAX) {
    return { ok: false, waitMs: cur.resetAt - now };
  }
  cur.n += 1;
  await fs.writeFile(ATTEMPTS, `${JSON.stringify(map)}\n`, "utf8");
  return { ok: true };
}

export function epkCookieOptions(kitId: string, host?: string | null, proto?: string | null) {
  let resolved = host;
  let resolvedProto = proto;
  if (resolved === undefined || resolvedProto === undefined) {
    try {
      const h = headers();
      if (resolved === undefined) {
        resolved = h.get("x-forwarded-host") || h.get("host");
      }
      if (resolvedProto === undefined) {
        resolvedProto = h.get("x-forwarded-proto");
      }
    } catch {
      resolved = resolved ?? null;
      resolvedProto = resolvedProto ?? null;
    }
  }
  return epkCookieFields(kitId, resolved, resolvedProto, EPK_MAX_AGE);
}

export function epkClearCookieOptions(host?: string | null, proto?: string | null) {
  return { ...epkCookieOptions("", host, proto), value: "", maxAge: 0, expires: new Date(0) };
}

export function kitFromCookieValue(raw?: string | null): string | null {
  const id = (raw || "").trim().toLowerCase();
  return isKitId(id) ? id : null;
}

export async function getEpkKit(): Promise<string | null> {
  return kitFromCookieValue(cookies().get(EPK_COOKIE)?.value);
}

export type EpkUnlock = { at: string; kit: string; ip: string };

export async function recordUnlock(kit: string, ip: string): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
  const line = JSON.stringify({
    at: new Date().toISOString(),
    kit,
    ip: (ip || "unknown").slice(0, 64),
  });
  await fs.appendFile(UNLOCKS, `${line}\n`, "utf8");
}

export async function listUnlocks(limit = 40): Promise<EpkUnlock[]> {
  try {
    const raw = await fs.readFile(UNLOCKS, "utf8");
    const rows = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as EpkUnlock);
    return rows.slice(-limit).reverse();
  } catch {
    return [];
  }
}
