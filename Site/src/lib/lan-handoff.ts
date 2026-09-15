import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { LAN_HOUSES, LAN_IP, isDlnLocalHost } from "@/lib/lan-names";
import { safeLoginNext } from "@/lib/login-next";

const ROOT = path.join(process.cwd(), "..", "_meta", "accounts");
const FILE = path.join(ROOT, "lan-handoff.json");
/** Long enough to sign in and land. The session itself is ninety days. */
const TTL_MS = 30 * 60 * 1000;

type Handoff = {
  code: string;
  token: string;
  exp: number;
};

const LAN_PORTS = new Set(["80", "443", ...LAN_HOUSES.map((h) => String(h.port))]);

export type LanTarget = { origin: string; path: string };

function isLiveHub(host: string): boolean {
  return host === "designlabnorth.com" || host === "www.designlabnorth.com";
}

function allowedOrigin(u: URL): boolean {
  const host = u.hostname.toLowerCase();
  const port = u.port || (u.protocol === "https:" ? "443" : "80");
  if (u.protocol === "https:" && isLiveHub(host) && (port === "443" || !u.port)) return true;
  if (u.protocol !== "http:") return false;
  if (isDlnLocalHost(host) && (port === "80" || LAN_PORTS.has(port))) return true;
  if (host === LAN_IP && LAN_PORTS.has(port)) return true;
  if ((host === "localhost" || host === "127.0.0.1") && LAN_PORTS.has(port)) return true;
  return false;
}

export function parseLanTarget(raw: string | null): LanTarget | null {
  const dest = safeLoginNext(raw || "", "");
  if (!dest || dest.startsWith("/")) return null;
  try {
    const u = new URL(dest);
    if (!allowedOrigin(u)) return null;
    let pathAndQuery = `${u.pathname}${u.search}` || "/";
    if (pathAndQuery.startsWith("/api/auth")) pathAndQuery = "/";
    return { origin: u.origin, path: pathAndQuery };
  } catch {
    return null;
  }
}

export function lanConsumeUrl(target: LanTarget, code: string): string {
  const url = new URL("/api/auth/lan-consume", `${target.origin}/`);
  url.searchParams.set("code", code);
  if (target.path !== "/") url.searchParams.set("next", target.path);
  return url.toString();
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
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.rename(tmp, FILE);
}

export async function issueLanHandoff(token: string): Promise<string> {
  const now = Date.now();
  const rows = (await readAll()).filter((r) => r.exp > now);
  const code = randomBytes(24).toString("base64url");
  rows.push({ code, token, exp: now + TTL_MS });
  await writeAll(rows);
  return code;
}

export async function consumeLanHandoff(code: string): Promise<string | null> {
  const now = Date.now();
  const rows = await readAll();
  const hit = rows.find((r) => r.code === code && r.exp > now);
  await writeAll(rows.filter((r) => r.exp > now && r.code !== code));
  return hit?.token || null;
}
