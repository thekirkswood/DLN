import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const FILE = path.join(ROOT, "dks-handoff.json");
const TTL_MS = 60_000;

type Handoff = {
  code: string;
  token: string;
  exp: number;
};

function dksPublicUrl(): string {
  return (process.env.DKS_PUBLIC_URL || "http://localhost:3040").replace(
    /\/$/,
    "",
  );
}

function isDksHost(hostname: string, port: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "davekirkwood.com" || host === "www.davekirkwood.com") {
    return true;
  }
  if (host === "localhost" && (port === "3040" || port === "")) return true;
  try {
    const configured = new URL(dksPublicUrl());
    return host === configured.hostname.toLowerCase();
  } catch {
    return false;
  }
}

export function safeDksPath(raw: string | null): string {
  if (!raw) return "/clock";
  const value = raw.trim();
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.startsWith("/api") || value.startsWith("/enter")) return "/clock";
    return value;
  }
  try {
    const u = new URL(value);
    if (!isDksHost(u.hostname, u.port)) return "/clock";
    const pathAndQuery = `${u.pathname}${u.search}`;
    if (pathAndQuery.startsWith("/api") || pathAndQuery.startsWith("/enter")) {
      return "/clock";
    }
    return pathAndQuery || "/clock";
  } catch {
    return "/clock";
  }
}

export function dksCallbackUrl(code: string, next: string): string {
  const pathNext = safeDksPath(next);
  const url = new URL("/api/auth/callback", `${dksPublicUrl()}/`);
  url.searchParams.set("code", code);
  if (pathNext !== "/clock") url.searchParams.set("next", pathNext);
  return url.toString();
}

export function dksBuildingUrl(): string {
  return `${dksPublicUrl()}/?gate=public`;
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

export async function issueDksHandoff(token: string): Promise<string> {
  const now = Date.now();
  const rows = (await readAll()).filter((r) => r.exp > now);
  const code = randomBytes(24).toString("base64url");
  rows.push({ code, token, exp: now + TTL_MS });
  await writeAll(rows);
  return code;
}

export async function consumeDksHandoff(code: string): Promise<string | null> {
  const now = Date.now();
  const rows = await readAll();
  const hit = rows.find((r) => r.code === code && r.exp > now);
  await writeAll(rows.filter((r) => r.exp > now && r.code !== code));
  return hit?.token || null;
}
