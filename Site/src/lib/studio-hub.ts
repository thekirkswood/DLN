import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { isStudio, type PublicUser } from "@/lib/auth";
import { hostnameOf, isLabHost } from "@/lib/lab-host";
import { getSessionUser } from "@/lib/session";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "picture-tickets.json");
const TTL_MS = 4 * 60 * 60 * 1000;

type Ticket = {
  code: string;
  user: PublicUser;
  exp: number;
};

type Book = { tickets: Ticket[] };

async function readBook(): Promise<Book> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Book;
    if (parsed && Array.isArray(parsed.tickets)) return parsed;
  } catch {
    /* empty */
  }
  return { tickets: [] };
}

async function writeBook(book: Book) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(book, null, 2)}\n`, "utf8");
}

function prune(book: Book) {
  const now = Date.now();
  book.tickets = book.tickets.filter((row) => row.exp > now);
}

export function studioOrigin(reqHost?: string | null) {
  const env = process.env.STUDIO_ORIGIN?.trim().replace(/\/$/, "");
  if (env) {
    try {
      const url = new URL(env);
      if (isLabHost(reqHost)) {
        const host = hostnameOf(reqHost);
        if (host) url.hostname = host;
      }
      return url.origin;
    } catch {
      return env;
    }
  }
  if (isLabHost(reqHost)) {
    const host = hostnameOf(reqHost) || "127.0.0.1";
    if (host === "localhost" || host === "dln.local") return `http://${host}:3060`;
    if (host === "127.0.0.1" || host === "0.0.0.0") return "http://127.0.0.1:3060";
    return `http://${host}:3060`;
  }
  return process.env.DLN_PUBLIC_URL?.replace(/\/$/, "") || "https://designlabnorth.com";
}

export function studioBasePath() {
  return (process.env.STUDIO_BASE_PATH || "").replace(/\/$/, "");
}

export function studioEngineHref(path: string, reqHost?: string | null) {
  const tail = path.startsWith("/") ? path : `/${path}`;
  const internal = process.env.STUDIO_INTERNAL?.trim().replace(/\/$/, "");
  if (internal) return `${internal}${studioBasePath()}${tail}`;
  return `${studioOrigin(reqHost)}${studioBasePath()}${tail}`;
}

export async function issuePictureTicket(user: PublicUser) {
  const book = await readBook();
  prune(book);
  const code = randomBytes(24).toString("hex");
  book.tickets.push({ code, user, exp: Date.now() + TTL_MS });
  await writeBook(book);
  return code;
}

export async function userFromPictureTicket(code: string): Promise<PublicUser | null> {
  if (!code.trim()) return null;
  const book = await readBook();
  prune(book);
  return book.tickets.find((item) => item.code === code)?.user || null;
}

export async function resolveStudioUser(ticket?: string | null): Promise<PublicUser | null> {
  const session = await getSessionUser();
  if (session) return session;
  return userFromPictureTicket(String(ticket || ""));
}

export function canUseStudio(user: PublicUser) {
  return Boolean(user);
}

export function studioSpendAllowed(user: PublicUser, plotSlug: string) {
  if (isStudio(user) || user.plots.includes("*") || user.plots.includes(plotSlug)) return true;
  return false;
}

export function studioCors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const ok =
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|dln\.local|([a-z0-9-]+\.)?designlabnorth\.com)(:\d+)?$/i.test(
      origin,
    );
  return {
    "Access-Control-Allow-Origin": ok ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}
