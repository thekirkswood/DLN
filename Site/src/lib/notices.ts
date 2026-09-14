import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "notices.json");
const MAX = 400;
const DEDUPE_MS = 6 * 60 * 60 * 1000;

export type NoticeKind =
  | "trap"
  | "probe"
  | "appeal"
  | "onboard"
  | "booking"
  | "mail"
  | "ship"
  | "pay"
  | "request"
  | "account";

export type StudioNotice = {
  id: string;
  t: string;
  kind: NoticeKind;
  title: string;
  body: string;
  read: boolean;
  ip?: string;
  path?: string;
  email?: string;
  important?: boolean;
};

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

async function readBook(): Promise<StudioNotice[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as StudioNotice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBook(rows: StudioNotice[]) {
  await ensure();
  await fs.writeFile(
    FILE,
    `${JSON.stringify(rows.slice(0, MAX), null, 2)}\n`,
    "utf8",
  );
}

export async function listNotices(): Promise<StudioNotice[]> {
  return (await readBook()).sort((a, b) => (a.t < b.t ? 1 : -1));
}

export async function addNotice(
  input: Omit<StudioNotice, "id" | "t" | "read"> & { t?: string },
): Promise<StudioNotice | null> {
  return serial(async () => {
    const rows = await readBook();
    const t = input.t || nowIso();
    if (input.kind === "probe" && input.email && input.path) {
      const since = Date.parse(t) - DEDUPE_MS;
      const dup = rows.find(
        (n) =>
          n.kind === "probe" &&
          n.email === input.email &&
          n.path === input.path &&
          Date.parse(n.t) >= since,
      );
      if (dup) return null;
    }
    const row: StudioNotice = {
      id: randomUUID(),
      t,
      kind: input.kind,
      title: input.title.slice(0, 180),
      body: input.body.slice(0, 800),
      read: false,
      ip: input.ip,
      path: input.path,
      email: input.email,
      important: input.important,
    };
    rows.unshift(row);
    await writeBook(rows);
    return row;
  });
}

export async function markNoticeRead(id: string): Promise<StudioNotice | null> {
  return serial(async () => {
    const rows = await readBook();
    const row = rows.find((n) => n.id === id);
    if (!row) return null;
    row.read = true;
    await writeBook(rows);
    return row;
  });
}
