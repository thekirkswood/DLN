import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";
import { cookieSecureFromProto, isStudio, userFromSession } from "@/lib/auth";
import type { NextResponse } from "next/server";
import { isMaliciousPath, looksLikeProbe, pathsLookMalicious } from "@/lib/trap-paths";
import type { TrapTrip } from "@/lib/trap-types";
import type { WatchHit, WatchInstance } from "@/lib/watch-types";

export type { WatchHit, WatchInstance } from "@/lib/watch-types";

export const WATCH_COOKIE = "dln_watch";
export const WATCH_COOKIE_MAX_AGE = 2 * 60 * 60;

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "watch.json");
const LEARN = path.join(process.cwd(), "..", "_meta", "studio", "watch-learn.md");
const LEARNED = path.join(process.cwd(), "..", "_meta", "studio", "learned-traps.json");

const HOT_MS = 2 * 60 * 60 * 1000;
const GAP_MS = 30 * 60 * 1000;
const SWEEP_MS = 60 * 60 * 1000;
const MAX_INSTANCES = 200;
const MAX_PATHS = 250;

type WatchBook = {
  instances: WatchInstance[];
  hot: Record<string, string>;
  hotUsers: Record<string, string>;
  lastSweep?: string;
};

function blank(): WatchBook {
  return { instances: [], hot: {}, hotUsers: {} };
}

let chain: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function seedFromTraps(book: WatchBook) {
  if (book.instances.length) return 0;
  const files = [
    path.join(process.cwd(), "..", "_meta", "studio", "traps.json"),
    path.join(process.cwd(), "..", "..", "DAA", "_meta", "studio", "traps.json"),
  ];
  const trips: TrapTrip[] = [];
  const seenId = new Set<string>();
  for (const file of files) {
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8")) as TrapTrip[];
      if (!Array.isArray(parsed)) continue;
      for (const row of parsed) {
        if (!row?.id || seenId.has(row.id)) continue;
        seenId.add(row.id);
        trips.push(row);
      }
    } catch {
      continue;
    }
  }
  const oldestFirst = trips.sort((a, b) => (a.t < b.t ? -1 : 1));
  for (const trip of oldestFirst) {
    applyHit(book, {
      ip: trip.ip,
      host: trip.host,
      path: trip.path,
      ua: trip.ua || "",
      t: trip.t,
      trap: true,
      plot: trip.plot,
      userId: trip.userId,
      email: trip.email,
      role: trip.role,
      displayName: trip.displayName,
      retro: true,
    });
  }
  return oldestFirst.length;
}

async function readBook(): Promise<WatchBook> {
  await ensure();
  let book: WatchBook = blank();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as WatchBook;
    if (parsed && Array.isArray(parsed.instances)) {
      book = {
        instances: parsed.instances,
        hot: parsed.hot && typeof parsed.hot === "object" ? { ...parsed.hot } : {},
        hotUsers:
          parsed.hotUsers && typeof parsed.hotUsers === "object"
            ? { ...parsed.hotUsers }
            : {},
        lastSweep: parsed.lastSweep,
      };
    }
  } catch {
    book = blank();
  }
  const seeded = await seedFromTraps(book);
  if (seeded) await writeBook(book);
  return book;
}

async function writeBook(book: WatchBook) {
  await ensure();
  const now = Date.now();
  const hot: Record<string, string> = {};
  for (const [ip, until] of Object.entries(book.hot)) {
    if (Date.parse(until) > now) hot[ip] = until;
  }
  const hotUsers: Record<string, string> = {};
  for (const [id, until] of Object.entries(book.hotUsers || {})) {
    if (Date.parse(until) > now) hotUsers[id] = until;
  }
  const instances = book.instances
    .sort((a, b) => (a.last < b.last ? 1 : -1))
    .slice(0, MAX_INSTANCES);
  await fs.writeFile(
    FILE,
    `${JSON.stringify({ instances, hot, hotUsers, lastSweep: book.lastSweep }, null, 2)}\n`,
    "utf8",
  );
}

function skipTapPath(pathname: string): boolean {
  const p = pathname.split("?")[0];
  if (!p.startsWith("/") || p.startsWith("//")) return true;
  if (p.startsWith("/_next")) return true;
  if (p === "/api/watch/tap" || p.startsWith("/api/watch/")) return true;
  if (p === "/api/trap" || p.startsWith("/api/trap/")) return true;
  if (p === "/api/health") return true;
  if (p === "/api/studio/hit") return true;
  if (p === "/favicon.ico") return true;
  if (p.startsWith("/brand/")) return true;
  if (/\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|map|css|js)$/i.test(p)) return true;
  return false;
}

export function isWatchTapPath(pathname: string): boolean {
  return !skipTapPath(pathname);
}

function clipPath(raw: string): string {
  const p = raw.split("?")[0].split("#")[0];
  if (!p.startsWith("/") || p.startsWith("//")) return "";
  return p.length > 200 ? p.slice(0, 200) : p;
}

function hotUntil(): string {
  return new Date(Date.now() + HOT_MS).toISOString();
}

function isHotIp(book: WatchBook, ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  const until = book.hot[ip];
  return Boolean(until && Date.parse(until) > Date.now());
}

function isHotUser(book: WatchBook, userId?: string): boolean {
  if (!userId) return false;
  const until = book.hotUsers?.[userId];
  return Boolean(until && Date.parse(until) > Date.now());
}

function sameInstance(
  row: WatchInstance,
  ip: string,
  at: number,
  userId?: string,
): boolean {
  if (at - Date.parse(row.last) > GAP_MS) return false;
  if (userId && row.userId && row.userId === userId) return true;
  return Boolean(ip && ip !== "unknown" && row.ip === ip);
}

function appendHit(row: WatchInstance, hit: WatchHit) {
  const last = row.paths[row.paths.length - 1];
  if (last && last.path === hit.path && last.host === hit.host && !last.trap === !hit.trap) {
    if (Date.parse(hit.t) - Date.parse(last.t) < 2000) return;
  }
  row.paths.push(hit);
  if (row.paths.length > MAX_PATHS) row.paths = row.paths.slice(-MAX_PATHS);
  row.last = hit.t;
}

function applyHit(
  book: WatchBook,
  input: {
    ip: string;
    host: string;
    path: string;
    ua: string;
    t?: string;
    trap: boolean;
    plot?: string;
    userId?: string;
    email?: string;
    role?: string;
    displayName?: string;
    retro?: boolean;
  },
): WatchInstance | null {
  const pathName = clipPath(input.path);
  const ip = input.ip.slice(0, 64) || "unknown";
  if (!pathName) return null;
  if (ip === "unknown" && !input.userId) return null;
  const t = input.t || nowIso();
  const at = Date.parse(t);
  let row = book.instances.find((r) => sameInstance(r, ip, at, input.userId));
  if (!row) {
    row = {
      id: randomUUID(),
      t,
      last: t,
      ip,
      ua: input.ua.slice(0, 300),
      host: input.host.slice(0, 120),
      plot: input.plot?.slice(0, 40),
      userId: input.userId,
      email: input.email,
      role: input.role,
      displayName: input.displayName,
      paths: [],
      retro: input.retro || undefined,
    };
    book.instances.unshift(row);
  }
  appendHit(row, {
    t,
    path: pathName,
    host: (input.host || row.host).slice(0, 120),
    trap: input.trap,
  });
  if (isMaliciousPath(pathName)) row.cleared = undefined;
  if (input.plot && !row.plot) row.plot = input.plot.slice(0, 40);
  if (input.email) {
    row.email = input.email;
    row.userId = input.userId || row.userId;
    row.role = input.role || row.role;
    row.displayName = input.displayName || row.displayName;
  }
  if (ip !== "unknown") book.hot[ip] = hotUntil();
  if (input.userId) {
    if (!book.hotUsers) book.hotUsers = {};
    book.hotUsers[input.userId] = hotUntil();
  }
  return row;
}

export function setWatchCookie(res: NextResponse, proto: string | null) {
  const domain = process.env.DLN_COOKIE_DOMAIN?.trim();
  res.cookies.set(WATCH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WATCH_COOKIE_MAX_AGE,
    secure: cookieSecureFromProto(proto),
    ...(domain ? { domain } : {}),
  });
}

export async function markWatch(input: {
  ip: string;
  host: string;
  path: string;
  ua: string;
  trap: boolean;
  plot?: string;
  token?: string;
}): Promise<WatchInstance | null> {
  const user = await userFromSession(input.token);
  const row = await serial(async () => {
    const book = await readBook();
    const next = applyHit(book, {
      ...input,
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      displayName: user?.displayName,
    });
    await writeBook(book);
    return next;
  });
  void sweepWatchIfDue();
  return row;
}

export async function tapWatch(input: {
  ip: string;
  host: string;
  path: string;
  ua: string;
  cookie?: boolean;
  token?: string;
}): Promise<boolean> {
  if (skipTapPath(input.path)) return false;
  const user = await userFromSession(input.token);
  if (user && isStudio(user) && !looksLikeProbe(input.path)) return false;
  return serial(async () => {
    const book = await readBook();
    const hot =
      isHotIp(book, input.ip) ||
      isHotUser(book, user?.id) ||
      Boolean(input.cookie);
    if (!hot) return false;
    applyHit(book, {
      ...input,
      trap: looksLikeProbe(input.path),
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      displayName: user?.displayName,
    });
    await writeBook(book);
    return true;
  });
}

export async function absorbTrips(trips: TrapTrip[]): Promise<number> {
  if (!trips.length) return 0;
  return serial(async () => {
    const book = await readBook();
    const seen = new Set<string>();
    for (const inst of book.instances) {
      for (const hit of inst.paths) {
        seen.add(`${inst.ip}|${hit.path}|${hit.t}`);
      }
    }
    let added = 0;
    const oldestFirst = [...trips].sort((a, b) => (a.t < b.t ? -1 : 1));
    for (const trip of oldestFirst) {
      const key = `${trip.ip}|${trip.path}|${trip.t}`;
      if (seen.has(key)) continue;
      seen.add(key);
      applyHit(book, {
        ip: trip.ip,
        host: trip.host,
        path: trip.path,
        ua: trip.ua || "",
        t: trip.t,
        trap: true,
        plot: trip.plot,
        userId: trip.userId,
        email: trip.email,
        role: trip.role,
        displayName: trip.displayName,
        retro: true,
      });
      added += 1;
    }
    if (added) await writeBook(book);
    return added;
  });
}

export async function listInstances(): Promise<WatchInstance[]> {
  const book = await readBook();
  return book.instances.sort((a, b) => (a.last < b.last ? 1 : -1));
}

export async function listOpenInstances(): Promise<WatchInstance[]> {
  const { blockedIpSet } = await import("@/lib/block");
  const blocked = await blockedIpSet();
  const now = Date.now();
  return (await listInstances()).filter((row) => {
    if (blocked.has(row.ip)) return false;
    if (row.cleared) return false;
    const malicious = pathsLookMalicious(row.paths);
    const hot = now - Date.parse(row.last) < HOT_MS;
    if (!hot && !malicious) return false;
    return true;
  });
}

export async function clearWatchInstance(id: string): Promise<WatchInstance | null> {
  return serial(async () => {
    const book = await readBook();
    const row = book.instances.find((inst) => inst.id === id);
    if (!row) return null;
    row.cleared = true;
    await writeBook(book);
    return row;
  });
}

function novelPaths(instances: WatchInstance[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const inst of instances) {
    for (const hit of inst.paths) {
      const p = hit.path.toLowerCase();
      if (seen.has(p)) continue;
      seen.add(p);
      if (!looksLikeProbe(p)) continue;
      out.push(hit.path);
    }
  }
  return out.sort();
}

async function writeLearned(paths: string[]) {
  await ensure();
  let prev: string[] = [];
  try {
    const parsed = JSON.parse(await fs.readFile(LEARNED, "utf8")) as { paths?: string[] };
    if (Array.isArray(parsed.paths)) prev = parsed.paths;
  } catch {
    prev = [];
  }
  const set = new Set(prev.map((p) => p.toLowerCase()));
  const fresh: string[] = [];
  for (const p of paths) {
    const k = p.toLowerCase();
    if (set.has(k)) continue;
    set.add(k);
    fresh.push(p);
  }
  const all = [...prev, ...fresh].slice(-400);
  await fs.writeFile(LEARNED, `${JSON.stringify({ t: nowIso(), paths: all }, null, 2)}\n`, "utf8");
  return fresh;
}

async function appendLearn(body: string) {
  await ensure();
  let prev = "";
  try {
    prev = await fs.readFile(LEARN, "utf8");
  } catch {
    prev = "# Watch learn\n\nProbe sessions. Sweep writes here. IPs stay on this book.\n\n";
  }
  await fs.writeFile(LEARN, `${prev}${body}`, "utf8");
}

export async function sweepWatchIfDue(force = false): Promise<{ wrote: boolean; fresh: string[] }> {
  return serial(async () => {
    const book = await readBook();
    const due =
      force ||
      !book.lastSweep ||
      Date.now() - Date.parse(book.lastSweep) >= SWEEP_MS;
    if (!due) return { wrote: false, fresh: [] };
    const hourAgo = Date.now() - SWEEP_MS;
    const window = book.instances.filter((i) => Date.parse(i.last) >= hourAgo);
    const scope = window.length ? window : book.instances.slice(0, 40);
    const probes = novelPaths(scope);
    const fresh = await writeLearned(probes);
    const lines = [
      `## ${nowIso()} sweep`,
      "",
      `- ${book.instances.length} sessions on the book. ${window.length} active in the last hour.`,
      `- ${probes.length} distinct probe paths in this pass.`,
    ];
    if (fresh.length) {
      lines.push(`- New doors to remember: ${fresh.slice(0, 24).join(", ")}${fresh.length > 24 ? "…" : ""}.`);
    } else {
      lines.push("- No new probe shape this pass.");
    }
    const busy = [...scope].sort((a, b) => b.paths.length - a.paths.length).slice(0, 5);
    for (const row of busy) {
      const traps = row.paths.filter((p) => p.trap).length;
      lines.push(
        `- ${row.ip} on ${row.host || "host"} · ${row.paths.length} paths (${traps} doors) · last ${row.last}`,
      );
    }
    lines.push("", "");
    await appendLearn(lines.join("\n"));
    book.lastSweep = nowIso();
    await writeBook(book);
    return { wrote: true, fresh };
  });
}
