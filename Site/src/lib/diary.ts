import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Stage } from "@/data/catalogue";
import { bookableForFacet } from "@/data/catalogue";
import {
  addCalendarDays,
  addMinutes,
  londonAt,
  londonStartOfDay,
  londonWall,
  nowIso,
  weekdayIndexLondon,
  ymdLondon,
} from "@/lib/clock";
import { invoiceById, invoiceTotal, listInvoices, type Invoice } from "@/lib/billing";
import { isStudio, type PublicUser } from "@/lib/auth";
import {
  HOSTS,
  hostForFacet,
  type Booking,
  type HostId,
  type Hours,
  type HoursBook,
  type Slot,
  type SlotState,
} from "@/lib/hosts";

export { HOSTS, hostForFacet };
export type { Booking, HostId, Hours, HoursBook, Slot, SlotState };

const ROOT = path.join(process.cwd(), "..", "_meta", "billing");
const BOOKINGS = path.join(ROOT, "bookings.json");
const HOURS = path.join(ROOT, "hours.json");

const DEFAULT_HOURS: Hours = {
  days: [1, 2, 3, 4, 5],
  start: "10:00",
  end: "16:00",
  slotMinutes: 60,
  closedDates: [],
  openDates: [],
  blocked: [],
};

function defaultHours(): HoursBook {
  return {
    dave: { ...DEFAULT_HOURS, days: [...DEFAULT_HOURS.days], closedDates: [], openDates: [], blocked: [] },
    ewan: { ...DEFAULT_HOURS, days: [...DEFAULT_HOURS.days], closedDates: [], openDates: [], blocked: [] },
  };
}

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs)).sort();
}

function readHours(raw?: Partial<Hours> | null): Hours {
  const days = Array.isArray(raw?.days)
    ? Array.from(new Set(raw.days.filter((n) => n >= 0 && n <= 6))).sort()
    : [...DEFAULT_HOURS.days];
  return {
    days,
    start: parseHm(raw?.start || "") ? (raw?.start || "").trim() : DEFAULT_HOURS.start,
    end: parseHm(raw?.end || "") ? (raw?.end || "").trim() : DEFAULT_HOURS.end,
    slotMinutes:
      raw?.slotMinutes && raw.slotMinutes >= 15 && raw.slotMinutes <= 180
        ? raw.slotMinutes
        : DEFAULT_HOURS.slotMinutes,
    closedDates: Array.isArray(raw?.closedDates) ? uniq(raw.closedDates) : [],
    openDates: Array.isArray(raw?.openDates) ? uniq(raw.openDates) : [],
    blocked: Array.isArray(raw?.blocked) ? uniq(raw.blocked) : [],
  };
}

function pruneHours(h: Hours): Hours {
  const keep = ymdLondon(addCalendarDays(londonStartOfDay(), -2));
  return {
    ...h,
    closedDates: h.closedDates.filter((d) => d >= keep),
    openDates: h.openDates.filter((d) => d >= keep),
    blocked: h.blocked.filter((iso) => ymdLondon(iso) >= keep),
  };
}

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  try {
    await fs.access(BOOKINGS);
  } catch {
    await fs.writeFile(BOOKINGS, "[]\n", "utf8");
  }
  try {
    await fs.access(HOURS);
  } catch {
    await fs.writeFile(HOURS, `${JSON.stringify(defaultHours(), null, 2)}\n`, "utf8");
  }
}

function parseHm(raw: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function dayIsOpen(hours: Hours, dayIso: string): boolean {
  const ymd = ymdLondon(dayIso);
  if (hours.openDates.includes(ymd)) return true;
  if (hours.closedDates.includes(ymd)) return false;
  return hours.days.includes(weekdayIndexLondon(dayIso));
}

export function slotIsOffered(hours: Hours, startIso: string, endIso: string): boolean {
  if (!dayIsOpen(hours, startIso)) return false;
  if (hours.blocked.includes(startIso)) return false;
  const startHm = parseHm(hours.start);
  const endHm = parseHm(hours.end);
  if (!startHm || !endHm) return false;
  const w = londonWall(new Date(startIso));
  const dayStart = londonAt(w.year, w.month, w.day, startHm.hour, startHm.minute);
  const dayEnd = londonAt(w.year, w.month, w.day, endHm.hour, endHm.minute);
  return startIso >= dayStart && endIso <= dayEnd && startIso < dayEnd;
}

export async function getHours(): Promise<HoursBook> {
  await ensure();
  try {
    const raw = JSON.parse(await fs.readFile(HOURS, "utf8")) as Partial<HoursBook>;
    return {
      dave: pruneHours(readHours(raw.dave)),
      ewan: pruneHours(readHours(raw.ewan)),
    };
  } catch {
    return defaultHours();
  }
}

export async function saveHours(actor: PublicUser, next: Partial<HoursBook>): Promise<HoursBook> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const cur = await getHours();
  const book: HoursBook = {
    dave: pruneHours(readHours({ ...cur.dave, ...(next.dave || {}) })),
    ewan: pruneHours(readHours({ ...cur.ewan, ...(next.ewan || {}) })),
  };
  for (const host of ["dave", "ewan"] as const) {
    const start = parseHm(book[host].start);
    const end = parseHm(book[host].end);
    if (!start || !end) throw new Error("hours");
    if (start.hour * 60 + start.minute >= end.hour * 60 + end.minute) throw new Error("hours");
  }
  await fs.writeFile(HOURS, `${JSON.stringify(book, null, 2)}\n`, "utf8");
  return book;
}

export async function listBookings(): Promise<Booking[]> {
  await ensure();
  try {
    const rows = JSON.parse(await fs.readFile(BOOKINGS, "utf8")) as Booking[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function saveBookings(rows: Booking[]) {
  await ensure();
  await fs.writeFile(BOOKINGS, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export async function bookingsInRange(fromIso: string, toIso: string): Promise<Booking[]> {
  const rows = await listBookings();
  return rows.filter(
    (b) => b.status !== "cancelled" && b.startIso < toIso && b.endIso > fromIso,
  );
}

export async function bookingsForUser(userId: string): Promise<Booking[]> {
  const rows = await listBookings();
  return rows
    .filter((b) => b.userId === userId && b.status !== "cancelled")
    .sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export async function bookingByInvoice(invoiceId: string): Promise<Booking | undefined> {
  return (await listBookings()).find(
    (b) => b.invoiceId === invoiceId && b.status !== "cancelled",
  );
}

function slotsForDay(
  hostId: HostId,
  hours: Hours,
  dayIso: string,
  taken: Booking[],
  board: boolean,
): Slot[] {
  const startHm = parseHm(hours.start);
  const endHm = parseHm(hours.end);
  if (!startHm || !endHm) return [];
  const w = londonWall(new Date(dayIso));
  const dayStart = londonAt(w.year, w.month, w.day, startHm.hour, startHm.minute);
  const dayEnd = londonAt(w.year, w.month, w.day, endHm.hour, endHm.minute);
  const openDay = dayIsOpen(hours, dayIso);
  if (!board && !openDay) return [];
  const out: Slot[] = [];
  let cursor = dayStart;
  while (cursor < dayEnd) {
    const end = addMinutes(cursor, hours.slotMinutes);
    if (end > dayEnd) break;
    const hit = taken.find(
      (b) => b.hostId === hostId && overlaps(cursor, end, b.startIso, b.endIso),
    );
    const blocked = hours.blocked.includes(cursor);
    let state: SlotState = "open";
    if (hit) state = hit.status === "hold" ? "held" : "taken";
    else if (!openDay) state = "off";
    else if (blocked) state = "blocked";
    else if (cursor <= nowIso()) state = "past";
    if (!board && state !== "open" && state !== "taken" && state !== "held") {
      cursor = end;
      continue;
    }
    out.push({
      startIso: cursor,
      endIso: end,
      hostId,
      open: state === "open",
      state,
      bookingId: hit?.id,
    });
    cursor = end;
  }
  return out;
}

export async function slotsForHost(
  hostId: HostId,
  fromIso: string,
  days = 14,
  board = false,
): Promise<Slot[]> {
  const hours = (await getHours())[hostId];
  const start = londonStartOfDay(new Date(fromIso));
  const end = addCalendarDays(start, days);
  const taken = await bookingsInRange(start, end);
  const out: Slot[] = [];
  for (let i = 0; i < days; i++) {
    const day = addCalendarDays(start, i);
    out.push(...slotsForDay(hostId, hours, day, taken, board));
  }
  return out;
}

export async function weekGrid(
  fromIso: string,
  board = false,
): Promise<{
  days: string[];
  hosts: Record<HostId, Slot[]>;
  bookings: Booking[];
}> {
  const start = londonStartOfDay(new Date(fromIso));
  const days = Array.from({ length: 7 }, (_, i) => ymdLondon(addCalendarDays(start, i)));
  const end = addCalendarDays(start, 7);
  const bookings = await bookingsInRange(start, end);
  return {
    days,
    hosts: {
      dave: await slotsForHost("dave", start, 7, board),
      ewan: await slotsForHost("ewan", start, 7, board),
    },
    bookings,
  };
}

export function sessionFitsInvoice(inv: Invoice, facet: Stage): boolean {
  if (inv.status !== "paid") return false;
  if (invoiceTotal(inv) <= 0) return false;
  const want = bookableForFacet(facet);
  if (!want) return false;
  return inv.lines.some((l) => l.presetId === want.id && !l.waived);
}

export async function unusedSessionInvoice(
  userId: string,
  facet: Stage,
): Promise<Invoice | undefined> {
  const rows = await listInvoices();
  const booked = await listBookings();
  const used = new Set(
    booked.filter((b) => b.status !== "cancelled" && b.invoiceId).map((b) => b.invoiceId),
  );
  return rows.find(
    (inv) => inv.userId === userId && !used.has(inv.id) && sessionFitsInvoice(inv, facet),
  );
}

export async function placeBooking(
  actor: PublicUser,
  body: {
    startIso: string;
    facet: Stage;
    invoiceId?: string;
    hostId?: HostId;
    userId?: string;
    hold?: boolean;
    note?: string;
  },
): Promise<Booking> {
  const facet = body.facet;
  if (facet !== "design" && facet !== "strategy" && facet !== "build") {
    throw new Error("facet");
  }
  const hostId = hostForFacet(facet, body.hostId);
  const hours = (await getHours())[hostId];
  const start = body.startIso;
  const end = addMinutes(start, hours.slotMinutes);
  if (start <= nowIso()) throw new Error("past");
  if (!slotIsOffered(hours, start, end)) throw new Error("shut");
  const taken = await bookingsInRange(start, end);
  if (taken.some((b) => b.hostId === hostId && overlaps(start, end, b.startIso, b.endIso))) {
    throw new Error("taken");
  }

  if (body.hold) {
    if (!isStudio(actor)) throw new Error("forbidden");
    const row: Booking = {
      id: randomUUID(),
      hostId,
      facet,
      startIso: start,
      endIso: end,
      userId: null,
      invoiceId: null,
      status: "hold",
      createdAt: nowIso(),
      note: body.note?.trim() || "Held",
    };
    const rows = await listBookings();
    rows.push(row);
    await saveBookings(rows);
    return row;
  }

  const clientId = isStudio(actor) && body.userId ? body.userId : actor.id;
  if (!isStudio(actor) && clientId !== actor.id) throw new Error("forbidden");
  const invoiceId = body.invoiceId?.trim() || "";
  if (!invoiceId) throw new Error("pay");
  const inv = await invoiceById(invoiceId);
  if (!inv) throw new Error("missing");
  if (inv.userId !== clientId && !isStudio(actor)) throw new Error("forbidden");
  if (!sessionFitsInvoice(inv, facet)) throw new Error("pay");
  const already = await bookingByInvoice(invoiceId);
  if (already) throw new Error("used");

  const row: Booking = {
    id: randomUUID(),
    hostId,
    facet,
    startIso: start,
    endIso: end,
    userId: clientId,
    invoiceId,
    status: "booked",
    createdAt: nowIso(),
    note: body.note?.trim() || undefined,
  };
  const rows = await listBookings();
  rows.push(row);
  await saveBookings(rows);
  return row;
}

export async function cancelBooking(actor: PublicUser, id: string): Promise<Booking> {
  const rows = await listBookings();
  const row = rows.find((b) => b.id === id);
  if (!row) throw new Error("missing");
  const own = row.userId === actor.id;
  if (!isStudio(actor) && !own) throw new Error("forbidden");
  if (row.status === "cancelled") return row;
  if (!isStudio(actor) && row.startIso <= nowIso()) throw new Error("past");
  row.status = "cancelled";
  await saveBookings(rows);
  return row;
}
