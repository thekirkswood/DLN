import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";
import { ipv4Net, isPrivateIp, uaFamily } from "@/lib/client-ip";
import { doorsOf, linkWhy } from "@/lib/ip-pattern";
import { isMaliciousPath, pathsLookMalicious } from "@/lib/trap-paths";
import type { WatchHit, WatchInstance } from "@/lib/watch-types";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "blocked.json");
const MAX = 200;
const MAX_PATHS = 400;
const MAX_IPS = 40;

export type BlockHit = WatchHit;

export type BlockRow = {
  id: string;
  t: string;
  last: string;
  ips: string[];
  nets: string[];
  ua: string;
  uaFamily: string;
  doors: string[];
  paths: BlockHit[];
  instanceIds: string[];
  how: "trap" | "studio";
  enforced: boolean;
};

type BlockBook = { rows: BlockRow[] };

let chain: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function blank(): BlockBook {
  return { rows: [] };
}

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function readBook(): Promise<BlockBook> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as BlockBook;
    if (parsed && Array.isArray(parsed.rows)) return { rows: parsed.rows };
  } catch {
    /* empty */
  }
  return blank();
}

async function writeBook(book: BlockBook) {
  await ensure();
  const rows = book.rows
    .sort((a, b) => (a.last < b.last ? 1 : -1))
    .slice(0, MAX);
  await fs.writeFile(FILE, `${JSON.stringify({ rows }, null, 2)}\n`, "utf8");
}

function appendPath(row: BlockRow, hit: BlockHit) {
  const last = row.paths[row.paths.length - 1];
  if (
    last &&
    last.path === hit.path &&
    last.host === hit.host &&
    Date.parse(hit.t) - Date.parse(last.t) < 2000
  ) {
    return;
  }
  row.paths.push(hit);
  if (row.paths.length > MAX_PATHS) row.paths = row.paths.slice(-MAX_PATHS);
  row.last = hit.t;
  if (hit.trap) {
    const k = hit.path.toLowerCase();
    if (!row.doors.some((d) => d.toLowerCase() === k)) row.doors.push(hit.path);
  }
}

function addIp(row: BlockRow, ip: string) {
  if (!ip || ip === "unknown") return;
  if (!row.ips.includes(ip)) row.ips.push(ip);
  if (row.ips.length > MAX_IPS) row.ips = row.ips.slice(-MAX_IPS);
  const net = ipv4Net(ip);
  if (net && !row.nets.includes(net)) row.nets.push(net);
}

function bestRow(book: BlockBook, probe: {
  ip: string;
  ua: string;
  doors: string[];
}): BlockRow | null {
  let best: BlockRow | null = null;
  let why: string | null = null;
  for (const row of book.rows) {
    const hit = linkWhy(probe, row);
    if (!hit) continue;
    if (!best || hit === "same address") {
      best = row;
      why = hit;
      if (why === "same address") return row;
    }
  }
  return best;
}

function fromInstance(inst: WatchInstance, how: BlockRow["how"]): BlockRow {
  const t = inst.t || nowIso();
  const row: BlockRow = {
    id: randomUUID(),
    t,
    last: inst.last || t,
    ips: [],
    nets: [],
    ua: inst.ua || "",
    uaFamily: uaFamily(inst.ua || ""),
    doors: doorsOf(inst.paths),
    paths: inst.paths.map((p) => ({ ...p })),
    instanceIds: [inst.id],
    how,
    enforced: !isPrivateIp(inst.ip),
  };
  addIp(row, inst.ip);
  return row;
}

function mergeInto(row: BlockRow, inst: WatchInstance, how: BlockRow["how"]) {
  addIp(row, inst.ip);
  if (!row.instanceIds.includes(inst.id)) row.instanceIds.push(inst.id);
  if (!row.ua && inst.ua) {
    row.ua = inst.ua;
    row.uaFamily = uaFamily(inst.ua);
  }
  for (const hit of inst.paths) appendPath(row, hit);
  if (how === "studio") row.how = "studio";
  if (!isPrivateIp(inst.ip)) row.enforced = true;
  if (Date.parse(inst.last) > Date.parse(row.last)) row.last = inst.last;
}

export async function listBlocks(): Promise<BlockRow[]> {
  return (await readBook()).rows.sort((a, b) => (a.last < b.last ? 1 : -1));
}

export async function blockedIpSet(): Promise<Set<string>> {
  const set = new Set<string>();
  for (const row of (await readBook()).rows) {
    if (!row.enforced) continue;
    for (const ip of row.ips) {
      if (!isPrivateIp(ip)) set.add(ip);
    }
  }
  return set;
}

export async function ipIsBlocked(ip: string): Promise<boolean> {
  if (isPrivateIp(ip)) return false;
  return (await blockedIpSet()).has(ip);
}

export async function noteBlockedHit(input: {
  ip: string;
  host: string;
  path: string;
  ua: string;
  trap?: boolean;
}): Promise<BlockRow | null> {
  if (!input.ip || input.ip === "unknown") return null;
  return serial(async () => {
    const book = await readBook();
    const doors = input.trap ? [input.path] : [];
    let row =
      book.rows.find((r) => r.ips.includes(input.ip)) ||
      bestRow(book, { ip: input.ip, ua: input.ua, doors });
    if (!row) {
      row = {
        id: randomUUID(),
        t: nowIso(),
        last: nowIso(),
        ips: [],
        nets: [],
        ua: input.ua.slice(0, 300),
        uaFamily: uaFamily(input.ua),
        doors: [],
        paths: [],
        instanceIds: [],
        how: "trap",
        enforced: !isPrivateIp(input.ip),
      };
      addIp(row, input.ip);
      book.rows.unshift(row);
    }
    appendPath(row, {
      t: nowIso(),
      path: input.path.slice(0, 200),
      host: input.host.slice(0, 120),
      trap: Boolean(input.trap),
    });
    addIp(row, input.ip);
    await writeBook(book);
    const { tapTrapWeb } = await import("@/lib/trap-web");
    await tapTrapWeb({
      ip: input.ip,
      path: input.path,
      t: nowIso(),
    });
    return row;
  });
}

export async function banInstance(
  inst: WatchInstance,
  how: BlockRow["how"] = "studio",
): Promise<BlockRow> {
  return serial(async () => {
    const book = await readBook();
    const probe = {
      ip: inst.ip,
      ua: inst.ua,
      doors: doorsOf(inst.paths),
    };
    const existing =
      book.rows.find((r) => r.ips.includes(inst.ip) || r.instanceIds.includes(inst.id)) ||
      bestRow(book, probe);
    if (existing) {
      mergeInto(existing, inst, how);
      await writeBook(book);
      return existing;
    }
    const row = fromInstance(inst, how);
    book.rows.unshift(row);
    await writeBook(book);
    return row;
  });
}

export async function banPublicTraps(instances: WatchInstance[]): Promise<number> {
  let n = 0;
  for (const inst of instances) {
    if (isPrivateIp(inst.ip)) continue;
    if (inst.email) continue;
    if (!pathsLookMalicious(inst.paths)) continue;
    await banInstance(inst, "trap");
    n += 1;
  }
  return n;
}

/** Auto-bans from curiosity slashes (/admin, /lab, a .map) are listed, not shut. */
export async function relaxCuriosityBlocks(): Promise<number> {
  return serial(async () => {
    const book = await readBook();
    let n = 0;
    for (const row of book.rows) {
      if (!row.enforced) continue;
      if (row.how === "studio") continue;
      const doors = [
        ...row.doors,
        ...row.paths.map((hit) => hit.path),
      ];
      if (doors.some((p) => isMaliciousPath(p))) continue;
      row.enforced = false;
      n += 1;
    }
    if (n) await writeBook(book);
    return n;
  });
}
