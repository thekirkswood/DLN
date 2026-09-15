export type TrapDoor = {
  path: string;
  attempts: number;
  first: string;
  last: string;
  ips: { ip: string; n: number }[];
};

export type TrapWeb = {
  started: string;
  attempts: number;
  backfilled: boolean;
  doors: TrapDoor[];
  recent: string[];
};

export function slashCount(path: string): number {
  return path
    .split("?")[0]
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean).length;
}

export type TrapVisitor = {
  ip: string;
  attempts: number;
  first: string;
  last: string;
  depths: Record<number, number>;
  paths: { path: string; n: number }[];
};

export function visitorsFromWeb(web: TrapWeb): TrapVisitor[] {
  const map = new Map<string, TrapVisitor>();
  for (const door of web.doors) {
    const depth = slashCount(door.path);
    for (const hit of door.ips) {
      let row = map.get(hit.ip);
      if (!row) {
        row = {
          ip: hit.ip,
          attempts: 0,
          first: door.first,
          last: door.last,
          depths: {},
          paths: [],
        };
        map.set(hit.ip, row);
      }
      row.attempts += hit.n;
      row.depths[depth] = (row.depths[depth] || 0) + hit.n;
      row.paths.push({ path: door.path, n: hit.n });
      if (door.first < row.first) row.first = door.first;
      if (door.last > row.last) row.last = door.last;
    }
  }
  for (const row of map.values()) {
    row.paths.sort((a, b) => b.n - a.n);
  }
  return [...map.values()].sort((a, b) => (a.last < b.last ? 1 : -1));
}

export type { TrapDoor, TrapWeb };
