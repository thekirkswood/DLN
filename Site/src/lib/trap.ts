import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { nowIso } from "@/lib/clock";
import {
  isStudio,
  userFromSession,
  userFromSessionFingerprint,
  type PublicUser,
} from "@/lib/auth";
import { clientIpFrom, isPrivateIp } from "@/lib/client-ip";
import { ipIsBlocked, noteBlockedHit, banInstance } from "@/lib/block";
import { isMaliciousPath } from "@/lib/trap-paths";
import type { TrapTrip } from "@/lib/trap-types";
import { markWatch } from "@/lib/watch";

export type { TrapTrip } from "@/lib/trap-types";
export { clientIpFrom } from "@/lib/client-ip";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "traps.json");
const MAX = 500;

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function readBook(file: string): Promise<TrapTrip[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as TrapTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBook(rows: TrapTrip[]) {
  await ensure();
  await fs.writeFile(FILE, `${JSON.stringify(rows.slice(0, MAX), null, 2)}\n`, "utf8");
}

function extraBooks(): string[] {
  const fromEnv = (process.env.DLN_TRAP_BOOKS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  return [path.join(process.cwd(), "..", "..", "DAA", "_meta", "studio", "traps.json")];
}

export function clipTrip(input: {
  ip: string;
  host: string;
  path: string;
  ua: string;
  plot?: string;
  user?: PublicUser | null;
  sessionFp?: string;
}): TrapTrip {
  const user = input.user;
  return {
    id: randomUUID(),
    t: nowIso(),
    ip: input.ip.slice(0, 64) || "unknown",
    host: input.host.slice(0, 120),
    path: input.path.slice(0, 200),
    ua: input.ua.slice(0, 300),
    plot: input.plot?.slice(0, 40) || undefined,
    userId: user?.id,
    email: user?.email,
    role: user?.role,
    displayName: user?.displayName,
    sessionFp: input.sessionFp,
  };
}

export async function recordTrip(input: {
  ip: string;
  host: string;
  path: string;
  ua: string;
  plot?: string;
  token?: string;
  sessionFp?: string;
}): Promise<TrapTrip> {
  const user = await userFromSession(input.token);
  const trip = clipTrip({ ...input, user });
  const rows = await readBook(FILE);
  rows.unshift(trip);
  await writeBook(rows);

  const studio = user && isStudio(user);
  if (user && !studio) {
    const { addNotice } = await import("@/lib/notices");
    await addNotice({
      kind: "probe",
      title: `${user.displayName} tried ${trip.path}`,
      body: `Signed in as ${user.email} from ${trip.ip}. Not blocked.`,
      ip: trip.ip,
      path: trip.path,
      email: user.email,
    });
  }
  if (!studio && (await ipIsBlocked(trip.ip))) {
    await noteBlockedHit({
      ip: trip.ip,
      host: trip.host,
      path: trip.path,
      ua: trip.ua,
      trap: true,
    });
    return trip;
  }
  if (!studio) {
    const { tapTrapWeb } = await import("@/lib/trap-web");
    await tapTrapWeb({ ip: trip.ip, path: trip.path, t: trip.t });
  }
  await markWatch({
    ip: trip.ip,
    host: trip.host,
    path: trip.path,
    ua: trip.ua,
    trap: true,
    plot: input.plot,
    token: input.token,
  });
  if (!studio && !user && !isPrivateIp(trip.ip) && isMaliciousPath(trip.path)) {
    const { listInstances } = await import("@/lib/watch");
    const inst = (await listInstances()).find((row) => row.ip === trip.ip);
    if (inst) await banInstance(inst, "trap");
  }

  return trip;
}

async function enrich(row: TrapTrip): Promise<TrapTrip> {
  if (row.email || row.userId || !row.sessionFp) return row;
  const user = await userFromSessionFingerprint(row.sessionFp);
  if (!user) return row;
  return {
    ...row,
    userId: user.id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
  };
}

export async function listTrips(): Promise<TrapTrip[]> {
  const books = [FILE, ...extraBooks()];
  const seen = new Set<string>();
  const all: TrapTrip[] = [];
  for (const file of books) {
    for (const row of await readBook(file)) {
      if (!row?.id || seen.has(row.id)) continue;
      seen.add(row.id);
      all.push(await enrich(row));
    }
  }
  return all.sort((a, b) => (a.t < b.t ? 1 : -1)).slice(0, 200);
}
