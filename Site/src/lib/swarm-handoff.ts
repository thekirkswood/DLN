import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const FILE = path.join(ROOT, "swarm-handoff.json");
const TTL_MS = 60_000;

type Handoff = {
  code: string;
  token: string;
  exp: number;
};

function swarmPublicUrl(): string {
  return (process.env.SWARM_PUBLIC_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
}

function isSwarmHost(hostname: string, port: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "swarmfund.com" || host === "www.swarmfund.com") return true;
  if (host === "localhost" && (port === "5173" || port === "8787" || port === "")) {
    return true;
  }
  try {
    const configured = new URL(swarmPublicUrl());
    return host === configured.hostname.toLowerCase();
  } catch {
    return false;
  }
}

/** Path on the Swarm Fund host only. */
export function safeSwarmPath(raw: string | null): string {
  if (!raw) return "/";
  const value = raw.trim();
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.startsWith("/api") || value.startsWith("/enter")) return "/";
    return value;
  }
  try {
    const u = new URL(value);
    if (!isSwarmHost(u.hostname, u.port)) return "/";
    const pathAndQuery = `${u.pathname}${u.search}`;
    if (pathAndQuery.startsWith("/api") || pathAndQuery.startsWith("/enter")) {
      return "/";
    }
    return pathAndQuery || "/";
  } catch {
    return "/";
  }
}

export function swarmCallbackUrl(code: string, next: string): string {
  const pathNext = safeSwarmPath(next);
  const url = new URL("/api/studio/callback", `${swarmPublicUrl()}/`);
  url.searchParams.set("code", code);
  if (pathNext !== "/") url.searchParams.set("next", pathNext);
  return url.toString();
}

export function swarmBuildingUrl(): string {
  return `${swarmPublicUrl()}/?gate=public`;
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

export async function issueSwarmHandoff(token: string): Promise<string> {
  const now = Date.now();
  const rows = (await readAll()).filter((r) => r.exp > now);
  const code = randomBytes(24).toString("base64url");
  rows.push({ code, token, exp: now + TTL_MS });
  await writeAll(rows);
  return code;
}

export async function consumeSwarmHandoff(code: string): Promise<string | null> {
  const now = Date.now();
  const rows = await readAll();
  const hit = rows.find((r) => r.code === code && r.exp > now);
  await writeAll(rows.filter((r) => r.exp > now && r.code !== code));
  return hit?.token || null;
}
