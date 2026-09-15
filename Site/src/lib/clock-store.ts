import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";
import type {
  CensusRow,
  ClockEvent,
  ClockPlane,
  HouseSlug,
} from "@/lib/clock-types";

const ROOT = path.join(process.cwd(), "..", "_meta", "clock");
const LEDGER = path.join(ROOT, "ledger.jsonl");
const CENSUS = path.join(ROOT, "census.json");
const PULSE = path.join(ROOT, "pulse.json");
const HOT_CAP = 20_000;
const RECENT = 80;

type CensusFile = {
  house: HouseSlug;
  updatedAt: string;
  rows: CensusRow[];
};

export type PulseBook = Record<string, {
  house: HouseSlug;
  ok: boolean | null;
  misses: number;
  lastOk: string | null;
  lastMiss: string | null;
  lastCheck: string;
  latencyMs: number | null;
}>;

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
  await fs.mkdir(ROOT, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function censusKey(house: HouseSlug, kind: string, entityId?: string): string {
  return entityId ? `${house}:${kind}:${entityId}` : `${house}:${kind}`;
}

export function applyEvent(rows: CensusRow[], ev: ClockEvent): CensusRow[] {
  const key = censusKey(ev.house, ev.kind, ev.entity?.id);
  const hit = rows.find((r) => r.key === key);
  if (!hit) {
    rows.push({
      key,
      house: ev.house,
      kind: ev.kind,
      count: 1,
      firstAt: ev.t,
      lastAt: ev.t,
      firstActor: ev.actor,
      lastActor: ev.actor,
      firstSummary: ev.summary,
      lastSummary: ev.summary,
    });
    return rows;
  }
  hit.count += 1;
  hit.lastAt = ev.t;
  hit.lastActor = ev.actor;
  hit.lastSummary = ev.summary;
  return rows;
}

export function upsertSnapshot(rows: CensusRow[], row: CensusRow): CensusRow[] {
  const i = rows.findIndex((r) => r.key === row.key);
  if (i < 0) {
    rows.push(row);
    return rows;
  }
  rows[i] = row;
  return rows;
}

async function writeCensus(file: CensusFile) {
  await fs.writeFile(CENSUS, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

async function rotateIfNeeded(lines: string[]) {
  if (lines.length < HOT_CAP) {
    await fs.writeFile(LEDGER, `${lines.join("\n")}\n`, "utf8");
    return lines;
  }
  const year = new Date().getUTCFullYear();
  const archive = path.join(ROOT, `ledger-${year}.jsonl`);
  const keep = lines.slice(-Math.floor(HOT_CAP / 4));
  const old = lines.slice(0, lines.length - keep.length);
  await fs.appendFile(archive, old.join("\n") + "\n", "utf8");
  await fs.writeFile(LEDGER, keep.join("\n") + (keep.length ? "\n" : ""), "utf8");
  return keep;
}

export async function emitClock(partial: {
  house: HouseSlug;
  host?: string;
  plane: ClockPlane;
  kind: string;
  actor?: string;
  entity?: ClockEvent["entity"];
  summary: string;
  payload?: Record<string, unknown>;
}): Promise<ClockEvent | null> {
  try {
    return await serial(async () => {
      await ensure();
      const ev: ClockEvent = {
        id: randomUUID(),
        t: nowIso(),
        house: partial.house,
        host: partial.host || "lab",
        plane: partial.plane,
        kind: partial.kind,
        actor: partial.actor || "",
        entity: partial.entity,
        summary: partial.summary,
        payload: partial.payload,
      };
      const raw = await fs.readFile(LEDGER, "utf8").catch(() => "");
      const lines = raw.split("\n").filter(Boolean);
      lines.push(JSON.stringify(ev));
      await rotateIfNeeded(lines);
      const book = await readJson<CensusFile>(CENSUS, {
        house: "dln",
        updatedAt: ev.t,
        rows: [],
      });
      applyEvent(book.rows, ev);
      book.updatedAt = ev.t;
      book.house = "dln";
      await writeCensus(book);
      return ev;
    });
  } catch {
    return null;
  }
}

export async function loadCensus(): Promise<CensusRow[]> {
  await ensure();
  const book = await readJson<CensusFile>(CENSUS, {
    house: "dln",
    updatedAt: nowIso(),
    rows: [],
  });
  return Array.isArray(book.rows) ? book.rows : [];
}

export async function saveCensusRows(rows: CensusRow[]) {
  await ensure();
  await writeCensus({ house: "dln", updatedAt: nowIso(), rows });
}

export async function loadRecent(limit = RECENT): Promise<ClockEvent[]> {
  await ensure();
  try {
    const raw = await fs.readFile(LEDGER, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const slice = lines.slice(-limit);
    const out: ClockEvent[] = [];
    for (const line of slice) {
      try {
        out.push(JSON.parse(line) as ClockEvent);
      } catch {
        /* skip */
      }
    }
    return out.reverse();
  } catch {
    return [];
  }
}

export async function loadPulseBook(): Promise<PulseBook> {
  await ensure();
  return readJson<PulseBook>(PULSE, {});
}

export async function savePulseBook(book: PulseBook) {
  await ensure();
  await fs.writeFile(PULSE, `${JSON.stringify(book, null, 2)}\n`, "utf8");
}
