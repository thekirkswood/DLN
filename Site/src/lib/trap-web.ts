import { promises as fs } from "fs";
import path from "path";
import { nowIso } from "@/lib/clock";
import { cleanWatchPath } from "@/lib/trap-paths";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "trap-web.json");
const TRAPS = path.join(process.cwd(), "..", "_meta", "studio", "traps.json");
const WATCH = path.join(process.cwd(), "..", "_meta", "studio", "watch.json");
const BLOCKED = path.join(process.cwd(), "..", "_meta", "studio", "blocked.json");
const DAA_TRAPS = path.join(process.cwd(), "..", "..", "DAA", "_meta", "studio", "traps.json");

const MAX_DOORS = 2500;
const MAX_IPS = 80;
const MAX_RECENT = 4000;

export type DoorIp = {
  ip: string;
  n: number;
};

export type TrapDoor = {
  path: string;
  attempts: number;
  first: string;
  last: string;
  ips: DoorIp[];
};

export type TrapWeb = {
  started: string;
  attempts: number;
  backfilled: boolean;
  doors: TrapDoor[];
  recent: string[];
};

type WatchHit = { t: string; path: string; trap?: boolean };
type WatchInst = { ip: string; paths?: WatchHit[] };
type BlockHit = { t: string; path: string };
type BlockRow = { ips?: string[]; paths?: BlockHit[] };
type TrapRow = { id?: string; t?: string; ip?: string; path?: string };

let chain: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function blank(): TrapWeb {
  return {
    started: nowIso(),
    attempts: 0,
    backfilled: false,
    doors: [],
    recent: [],
  };
}

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readBook(): Promise<TrapWeb> {
  await ensure();
  const parsed = await readJson<TrapWeb>(FILE);
  if (!parsed || !Array.isArray(parsed.doors)) return blank();
  return {
    started: parsed.started || nowIso(),
    attempts: Number(parsed.attempts) || 0,
    backfilled: Boolean(parsed.backfilled),
    doors: parsed.doors,
    recent: Array.isArray(parsed.recent) ? parsed.recent : [],
  };
}

async function writeBook(book: TrapWeb) {
  await ensure();
  const doors = [...book.doors]
    .sort((a, b) => (a.last < b.last ? 1 : -1))
    .slice(0, MAX_DOORS);
  const recent = book.recent.slice(-MAX_RECENT);
  await fs.writeFile(
    FILE,
    `${JSON.stringify(
      {
        started: book.started,
        attempts: book.attempts,
        backfilled: book.backfilled,
        doors,
        recent,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function hitKey(ip: string, pathName: string, t: string): string {
  return `${ip}|${pathName}|${t.slice(0, 19)}`;
}

function addHit(book: TrapWeb, ip: string, pathName: string, t: string) {
  if (!book.started || t < book.started) book.started = t;
  book.attempts += 1;
  const key = pathName.toLowerCase();
  let door = book.doors.find((d) => d.path.toLowerCase() === key);
  if (!door) {
    door = { path: pathName, attempts: 0, first: t, last: t, ips: [] };
    book.doors.unshift(door);
  }
  door.attempts += 1;
  if (t > door.last) door.last = t;
  if (t < door.first) door.first = t;
  const row = door.ips.find((x) => x.ip === ip);
  if (row) row.n += 1;
  else {
    door.ips.push({ ip, n: 1 });
    if (door.ips.length > MAX_IPS) {
      door.ips.sort((a, b) => b.n - a.n);
      door.ips = door.ips.slice(0, MAX_IPS);
    }
  }
}

export async function tapTrapWeb(input: {
  ip: string;
  path: string;
  t?: string;
}): Promise<void> {
  const pathName = cleanWatchPath(input.path);
  const ip = (input.ip || "").slice(0, 64);
  if (!pathName || !ip || ip === "unknown") return;
  const t = input.t || nowIso();
  const key = hitKey(ip, pathName, t);
  await serial(async () => {
    const book = await readBook();
    if (book.recent.includes(key)) return;
    book.recent.push(key);
    addHit(book, ip, pathName, t);
    await writeBook(book);
  });
}

async function absorbFileHits(
  seen: Set<string>,
  book: TrapWeb,
  hits: { ip: string; path: string; t: string }[],
) {
  for (const hit of hits) {
    const pathName = cleanWatchPath(hit.path);
    const ip = (hit.ip || "").slice(0, 64);
    if (!pathName || !ip || ip === "unknown") continue;
    const t = hit.t || nowIso();
    const key = hitKey(ip, pathName, t);
    if (seen.has(key)) continue;
    seen.add(key);
    book.recent.push(key);
    addHit(book, ip, pathName, t);
  }
}

export async function absorbTrapWeb(): Promise<TrapWeb> {
  return serial(async () => {
    const book = await readBook();
    if (book.backfilled && book.attempts > 0) return book;
    const seen = new Set<string>();
    const next = blank();
    next.started = book.started;

    const trapFiles = [TRAPS, DAA_TRAPS];
    for (const file of trapFiles) {
      const rows = (await readJson<TrapRow[]>(file)) || [];
      if (!Array.isArray(rows)) continue;
      await absorbFileHits(
        seen,
        next,
        rows.map((r) => ({
          ip: r.ip || "",
          path: r.path || "",
          t: r.t || nowIso(),
        })),
      );
    }

    const watch = await readJson<{ instances?: WatchInst[] }>(WATCH);
    if (watch?.instances) {
      for (const inst of watch.instances) {
        for (const hit of inst.paths || []) {
          await absorbFileHits(seen, next, [
            { ip: inst.ip, path: hit.path, t: hit.t },
          ]);
        }
      }
    }

    const blocked = await readJson<{ rows?: BlockRow[] }>(BLOCKED);
    if (blocked?.rows) {
      for (const row of blocked.rows) {
        const ips = row.ips || [];
        for (const hit of row.paths || []) {
          const ip = ips[0] || "";
          await absorbFileHits(seen, next, [
            { ip, path: hit.path, t: hit.t },
          ]);
        }
      }
    }

    next.backfilled = true;
    if (!next.started) next.started = nowIso();
    await writeBook(next);
    return next;
  });
}

export async function listTrapWeb(): Promise<TrapWeb> {
  const book = await readBook();
  return {
    ...book,
    doors: [...book.doors].sort((a, b) => (a.last < b.last ? 1 : -1)),
  };
}

