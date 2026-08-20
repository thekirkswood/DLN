import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "..", "_meta", "lab-houses");
const FILE = path.join(ROOT, "studio-presence.json");
const SNIFF = path.join(ROOT, "sniff.flag");

/** Three-minute pings from the open window; ten minutes without a ping is gone. */
export const PRESENCE_TTL_MS = 10 * 60 * 1000;

export type PresenceSeat = {
  userId: string;
  name: string;
  until: number;
  page?: string;
};

export type PresenceFile = {
  seats: Record<string, PresenceSeat>;
};

function seatId(token: string): string {
  return createHash("sha256").update(token).digest("hex").slice(0, 16);
}

async function readFile(): Promise<PresenceFile> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as PresenceFile;
    if (parsed && parsed.seats && typeof parsed.seats === "object") return parsed;
  } catch {
    /* */
  }
  return { seats: {} };
}

async function writeFile(data: PresenceFile) {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.writeFile(SNIFF, `${new Date().toISOString()}\n`, "utf8");
}

function prune(data: PresenceFile, now = Date.now()): PresenceFile {
  const seats: Record<string, PresenceSeat> = {};
  for (const [id, seat] of Object.entries(data.seats)) {
    if (seat && seat.until > now) seats[id] = seat;
  }
  return { seats };
}

export async function studioLoggedIn(): Promise<boolean> {
  const data = prune(await readFile());
  return Object.keys(data.seats).length > 0;
}

export async function holdStudioPresence(input: {
  token: string;
  userId: string;
  name: string;
  page?: string;
}): Promise<{ seats: number; started: boolean }> {
  const id = seatId(input.token);
  const data = prune(await readFile());
  const started = Object.keys(data.seats).length === 0;
  data.seats[id] = {
    userId: input.userId,
    name: input.name,
    until: Date.now() + PRESENCE_TTL_MS,
    page: input.page,
  };
  await writeFile(data);
  return { seats: Object.keys(data.seats).length, started };
}

export async function releaseStudioPresence(token: string | undefined): Promise<number> {
  if (!token) return 0;
  const id = seatId(token);
  const data = prune(await readFile());
  delete data.seats[id];
  const next = prune(data);
  await writeFile(next);
  return Object.keys(next.seats).length;
}
