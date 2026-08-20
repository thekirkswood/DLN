/** Studio time. Dates on the book are Europe/London, never left to the browser locale. */

export const ZONE = "Europe/London";

export function nowIso(at = new Date()): string {
  return at.toISOString();
}

function wall(at: Date) {
  const bag: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

function fromLondon(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  second = 0,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const got = wall(new Date(guess));
  const wanted = Date.UTC(year, month - 1, day, hour, minute, second);
  const asGot = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute, got.second);
  return new Date(guess + (wanted - asGot));
}

export function londonWall(at = new Date()) {
  return wall(at);
}

export function londonAt(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): string {
  return fromLondon(year, month, day, hour, minute, second).toISOString();
}

export function londonStartOfDay(at = new Date()): string {
  const w = wall(at);
  return fromLondon(w.year, w.month, w.day, 0, 0, 0).toISOString();
}

export function formatLondonTime(iso: string): string {
  const w = wall(new Date(iso));
  return `${String(w.hour).padStart(2, "0")}:${String(w.minute).padStart(2, "0")}`;
}

export function formatLondonSlot(startIso: string, endIso: string): string {
  return `${formatLondonDate(startIso)} · ${formatLondonTime(startIso)}–${formatLondonTime(endIso)}`;
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function ymdLondon(iso: string): string {
  const w = wall(new Date(iso));
  return `${w.year}-${String(w.month).padStart(2, "0")}-${String(w.day).padStart(2, "0")}`;
}

export function isoFromYmd(ymd: string, hour = 12, minute = 0): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return londonAt(year, month, day, hour, minute);
}

export function weekdayIndexLondon(iso: string): number {
  const name = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
  }).format(new Date(iso));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export function formatLondonDayHead(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}


export function londonYear(at = new Date()): number {
  return wall(at).year;
}

export function formatLondonDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function londonNowLabel(at = new Date()): string {
  const w = wall(at);
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    weekday: "long",
  }).format(at);
  const month = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    month: "long",
  }).format(at);
  const hh = String(w.hour).padStart(2, "0");
  const mm = String(w.minute).padStart(2, "0");
  return `${weekday} ${w.day} ${month} ${w.year} · ${hh}:${mm}`;
}

export function addCalendarDays(iso: string, days: number): string {
  const w = wall(new Date(iso));
  return fromLondon(w.year, w.month, w.day + days, w.hour, w.minute, w.second).toISOString();
}

export function addCalendarMonths(iso: string, months: number): string {
  const w = wall(new Date(iso));
  return fromLondon(w.year, w.month + months, w.day, w.hour, w.minute, w.second).toISOString();
}

export function periodEnd(startIso: string, cadence: "weekly" | "monthly"): string {
  return cadence === "weekly" ? addCalendarDays(startIso, 7) : addCalendarMonths(startIso, 1);
}

/** Days after due before a bound site shuts. Matches `_meta` billing grace. */
export const GRACE_DAYS = 7;

export function payByIso(dueAt?: string, issuedAt?: string, days = GRACE_DAYS): string | null {
  const start = dueAt || issuedAt;
  if (!start) return null;
  const n = Number.isFinite(days) && days >= 1 ? days : GRACE_DAYS;
  return addCalendarDays(start, n);
}
