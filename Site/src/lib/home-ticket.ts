import { createPrivateKey, createPublicKey, sign, verify } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const PREFIX = "dln1.";

export type HomeTicketClaims = {
  v: 1;
  email: string;
  role: "owner" | "studio";
  iat: number;
  exp: number;
};

function secretsDir(): string {
  return path.join(process.cwd(), "..", "_meta", "secrets");
}

async function readOptional(file: string): Promise<string> {
  try {
    return (await fs.readFile(file, "utf8")).trim();
  } catch {
    return "";
  }
}

async function privatePem(): Promise<string> {
  const env = process.env.HOME_TICKET_PRIV?.trim();
  if (env) return env.replace(/\\n/g, "\n");
  const file =
    process.env.HOME_TICKET_PRIV_FILE?.trim() ||
    path.join(secretsDir(), "home-ticket.pem");
  return readOptional(file);
}

async function publicPem(): Promise<string> {
  const env = process.env.HOME_TICKET_PUB?.trim();
  if (env) return env.replace(/\\n/g, "\n");
  const file =
    process.env.HOME_TICKET_PUB_FILE?.trim() ||
    path.join(secretsDir(), "home-ticket.pub");
  return readOptional(file);
}

export function isHomeTicket(token: string | undefined): boolean {
  return Boolean(token && token.startsWith(PREFIX));
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export async function signHomeTicket(input: {
  email: string;
  role: "owner" | "studio";
  days?: number;
}): Promise<string | null> {
  const pem = await privatePem();
  if (!pem) return null;
  const now = Math.floor(Date.now() / 1000);
  const claims: HomeTicketClaims = {
    v: 1,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    iat: now,
    exp: now + (input.days ?? 90) * 86400,
  };
  const body = Buffer.from(JSON.stringify(claims), "utf8");
  const key = createPrivateKey(pem);
  const sig = sign(null, body, key);
  return `${PREFIX}${b64url(body)}.${b64url(sig)}`;
}

export async function verifyHomeTicket(
  token: string | undefined,
): Promise<HomeTicketClaims | null> {
  if (!isHomeTicket(token) || !token) return null;
  const pem = await publicPem();
  if (!pem) return null;
  const raw = token.slice(PREFIX.length);
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const body = fromB64url(raw.slice(0, dot));
  const sig = fromB64url(raw.slice(dot + 1));
  try {
    const key = createPublicKey(pem);
    if (!verify(null, body, key, sig)) return null;
    const claims = JSON.parse(body.toString("utf8")) as HomeTicketClaims;
    if (claims.v !== 1) return null;
    if (claims.role !== "owner" && claims.role !== "studio") return null;
    if (!claims.email || claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export function homeDialSecret(): string {
  return process.env.DLN_HOME_DIAL_SECRET?.trim() || "";
}

export function homeOrigin(): string {
  return (process.env.DLN_HOME_ORIGIN || "").trim().replace(/\/$/, "");
}
