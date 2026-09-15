import { ipv4Net, uaFamily } from "@/lib/client-ip";
import type { WatchInstance } from "@/lib/watch-types";

export type LinkTarget = {
  ips: string[];
  nets: string[];
  uaFamily: string;
  doors: string[];
};

export function doorsOf(paths: { path: string; trap?: boolean }[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const hit of paths) {
    if (!hit.trap) continue;
    const p = hit.path.toLowerCase();
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(hit.path);
  }
  return out;
}

function jaccard(a: string[], b: string[]): number {
  const left = new Set(a.map((p) => p.toLowerCase()));
  const right = new Set(b.map((p) => p.toLowerCase()));
  if (!left.size || !right.size) return 0;
  let hit = 0;
  Array.from(left).forEach((p) => {
    if (right.has(p)) hit += 1;
  });
  return hit / (left.size + right.size - hit);
}

export function linkWhy(
  a: { ip: string; ua: string; doors: string[] },
  b: LinkTarget,
): string | null {
  if (b.ips.includes(a.ip)) return "same address";
  const family = uaFamily(a.ua);
  const net = ipv4Net(a.ip);
  const overlap = jaccard(a.doors, b.doors);
  if (overlap >= 0.4 && a.doors.length + b.doors.length >= 2) {
    return "same doors";
  }
  if (family && family.length > 12 && family === b.uaFamily) return "same client";
  if (net && b.nets.includes(net)) return "same street";
  return null;
}

export function linksFor(
  inst: WatchInstance,
  others: WatchInstance[],
  blocked: LinkTarget[],
): string[] {
  const probe = { ip: inst.ip, ua: inst.ua, doors: doorsOf(inst.paths) };
  const out: string[] = [];
  for (const row of others) {
    if (row.id === inst.id) continue;
    const why = linkWhy(probe, {
      ips: [row.ip],
      nets: ipv4Net(row.ip) ? [ipv4Net(row.ip)] : [],
      uaFamily: uaFamily(row.ua),
      doors: doorsOf(row.paths),
    });
    if (why) out.push(`${row.ip} · ${why}`);
  }
  for (const row of blocked) {
    const why = linkWhy(probe, row);
    if (why) out.push(`${row.ips[0] || "blocked"} · ${why}`);
  }
  return out.slice(0, 6);
}
