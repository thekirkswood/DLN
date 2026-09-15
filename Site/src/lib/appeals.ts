import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "appeals.json");
const MAX = 300;

export type BlockAppeal = {
  id: string;
  t: string;
  ip: string;
  host: string;
  ua: string;
  why: string;
  status: "new" | "ignored" | "replied" | "cleared";
  reply?: string;
};

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

export async function listAppeals(): Promise<BlockAppeal[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as BlockAppeal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addAppeal(input: {
  ip: string;
  host: string;
  ua: string;
  why: string;
}): Promise<BlockAppeal> {
  const why = input.why.trim().slice(0, 1200);
  if (!why) throw new Error("empty");
  const row: BlockAppeal = {
    id: randomUUID(),
    t: nowIso(),
    ip: (input.ip || "unknown").slice(0, 64),
    host: input.host.slice(0, 120),
    ua: input.ua.slice(0, 300),
    why,
    status: "new",
  };
  const rows = await listAppeals();
  rows.unshift(row);
  await fs.writeFile(FILE, `${JSON.stringify(rows.slice(0, MAX), null, 2)}\n`, "utf8");
  return row;
}
