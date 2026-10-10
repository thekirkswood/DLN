export type WatchHit = {
  t: string;
  path: string;
  host: string;
  trap: boolean;
  from?: string;
};

export type WatchAttempt = {
  id: string;
  t: string;
  ip: string;
  host: string;
  ua: string;
  email: string;
  ok: boolean;
  reason?: string;
  plot?: string;
};

export type WatchInstance = {
  id: string;
  t: string;
  last: string;
  ip: string;
  ua: string;
  host: string;
  plot?: string;
  userId?: string;
  email?: string;
  role?: string;
  displayName?: string;
  paths: WatchHit[];
  retro?: boolean;
  /** Studio cleared this poke off Open. Trap web still holds the count. */
  cleared?: boolean;
};

export type VisitKind = "browse" | "snoop" | "scrape" | "probe";

export function visitKind(row: WatchInstance): VisitKind {
  if (row.paths.some((p) => p.trap)) return "probe";
  const ua = row.ua.toLowerCase();
  if (/(?:bot|crawl|spider|scrapy|python-requests|curl\/|wget|httpclient|go-http)/i.test(ua)) {
    return "scrape";
  }
  const span = Date.parse(row.last) - Date.parse(row.t);
  const distinct = new Set(row.paths.map((p) => p.path)).size;
  if (row.paths.length >= 12 && span > 0 && span < 2 * 60 * 1000) return "scrape";
  if (distinct >= 8 && span >= 2 * 60 * 1000) return "snoop";
  return "browse";
}
