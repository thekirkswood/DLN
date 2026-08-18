import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const FILE = path.join(ROOT, "titles-handoff.json");
const TTL_MS = 60_000;

type Handoff = {
  code: string;
  token: string;
  exp: number;
};

function titlesPublicUrl(): string {
  return (process.env.TITLES_PUBLIC_URL || "http://localhost:3020").replace(
    /\/$/,
    "",
  );
}

function isVtHost(hostname: string, port: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "varioustitles.com" || host === "www.varioustitles.com") {
    return true;
  }
  if (host === "localhost" && (port === "3020" || port === "")) return true;
  try {
    const configured = new URL(titlesPublicUrl());
    return host === configured.hostname.toLowerCase();
  } catch {
    return false;
  }
}

/** Path on the VT host only. */
export function safeVtPath(raw: string | null): string {
  if (!raw) return "/";
  const value = raw.trim();
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.startsWith("/api") || value.startsWith("/enter")) return "/";
    return value;
  }
  try {
    const u = new URL(value);
    if (!isVtHost(u.hostname, u.port)) return "/";
    const pathAndQuery = `${u.pathname}${u.search}`;
    if (pathAndQuery.startsWith("/api") || pathAndQuery.startsWith("/enter")) {
      return "/";
    }
    return pathAndQuery || "/";
  } catch {
    return "/";
  }
}

export function titlesCallbackUrl(code: string, next: string): string {
  const path = safeVtPath(next);
  const url = new URL("/api/auth/callback", `${titlesPublicUrl()}/`);
  url.searchParams.set("code", code);
  if (path !== "/") url.searchParams.set("next", path);
  return url.toString();
}

export function titlesBuildingUrl(): string {
  return `${titlesPublicUrl()}/?gate=public`;
}

async function readAll(): Promise<Handoff[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Handoff[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: Handoff[]) {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export async function issueHandoff(token: string): Promise<string> {
  const now = Date.now();
  const rows = (await readAll()).filter((r) => r.exp > now);
  const code = randomBytes(24).toString("base64url");
  rows.push({ code, token, exp: now + TTL_MS });
  await writeAll(rows);
  return code;
}

export async function consumeHandoff(code: string): Promise<string | null> {
  const now = Date.now();
  const rows = await readAll();
  const hit = rows.find((r) => r.code === code && r.exp > now);
  await writeAll(rows.filter((r) => r.exp > now && r.code !== code));
  return hit?.token || null;
}
