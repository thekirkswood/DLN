import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "..", "_meta", "cut");
const FILE = path.join(ROOT, "best.json");

export const MIN_MS = 1500;
export const MAX_MS = 600_000;

export type CutBest = {
  ms: number;
  at: string;
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
}

export async function readBest(): Promise<CutBest | null> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as CutBest;
    if (!parsed || !Number.isFinite(parsed.ms) || parsed.ms <= 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

let lock = Promise.resolve();

export function recordBest(ms: number): Promise<CutBest | null> {
  const run = lock.then(() => recordInner(ms));
  lock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function recordInner(ms: number): Promise<CutBest | null> {
  if (!Number.isFinite(ms) || ms < MIN_MS || ms > MAX_MS) {
    return readBest();
  }
  const current = await readBest();
  if (current && ms >= current.ms) return current;
  const next: CutBest = { ms: Math.round(ms), at: new Date().toISOString() };
  const tmp = `${FILE}.${process.pid}.tmp`;
  await ensure();
  await fs.writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await fs.rename(tmp, FILE);
  return next;
}
