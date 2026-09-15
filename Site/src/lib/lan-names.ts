/** Named LAN hosts Dave can bookmark. Served by Debian Caddy :80. Not public DNS. */

export const LAN_IP = "192.168.0.223";
export const PARENT_NAME = "dln.local";

export type LanHouse = {
  id: string;
  name: string;
  host: string;
  port: number;
};

export const LAN_HOUSES: LanHouse[] = [
  { id: "dln", name: "Design Lab North", host: "dln.local", port: 3010 },
  { id: "builder", name: "Lab", host: "builder.dln.local", port: 3100 },
  { id: "modyu", name: "ModYu", host: "modyu.dln.local", port: 3000 },
  { id: "various-titles", name: "Various Titles", host: "titles.dln.local", port: 3020 },
  { id: "swarm-web", name: "Swarm Fund", host: "swarm.dln.local", port: 5173 },
  { id: "pfp", name: "Paul Fosbury Portraits", host: "pfp.dln.local", port: 3030 },
  { id: "dks", name: "Dave Kirkwood", host: "dks.dln.local", port: 3040 },
  { id: "daa", name: "DAA", host: "daa.dln.local", port: 3050 },
];

export const HOUSE_LIVE: Record<string, string> = {
  dln: "https://designlabnorth.com",
  modyu: "https://modyu.designlabnorth.com",
  "various-titles": "https://varioustitles.com",
  "swarm-web": "https://swarmfund.com",
  pfp: "https://paulfosburyportraits.com",
  dks: "https://davekirkwood.com",
  daa: "https://daa.designlabnorth.com",
};

export function pressKitId(houseId: string): string | null {
  if (!houseId || houseId === "builder" || houseId === "choozlist") return null;
  if (houseId === "various-titles") return "titles";
  if (houseId === "swarm-web" || houseId === "swarm") return "swarm";
  return houseId;
}

export function lanPortForPlot(slug: string): number | null {
  if (slug === "swarm" || slug === "swarm-web") {
    return LAN_HOUSES.find((h) => h.id === "swarm-web")?.port ?? null;
  }
  return LAN_HOUSES.find((h) => h.id === slug)?.port ?? null;
}

export function namedOrigin(id: string): string | null {
  const row = LAN_HOUSES.find((h) => h.id === id);
  return row ? `http://${row.host}` : null;
}

/** Named LAN origin for a greenhouse / lab plot slug. */
export function lanOriginForPlot(slug: string): string | null {
  if (slug === "swarm" || slug === "swarm-web") return namedOrigin("swarm-web");
  return namedOrigin(slug);
}

export function backupOrigin(port: number): string {
  return `http://${LAN_IP}:${port}`;
}

export function isDlnLocalHost(host?: string | null): boolean {
  const h = (host || "").split(":")[0].toLowerCase().replace(/^\[|\]$/g, "");
  return h === PARENT_NAME || h.endsWith(`.${PARENT_NAME}`);
}

export const BUILDER_NAMED = "http://builder.dln.local";
export const BUILDER_BACKUP = `http://${LAN_IP}:3100`;

/** Builder sits downstairs. Do not send the tower to localhost:3100. */
export function builderOrigin(viewerHost?: string | null): string {
  const h = (viewerHost || "").split(":")[0].toLowerCase().replace(/^\[|\]$/g, "");
  if (!h || h === "0.0.0.0" || h === "::" || h === "localhost" || h === "127.0.0.1") {
    return BUILDER_BACKUP;
  }
  if (h === "builder.dln.local" || isDlnLocalHost(h)) return BUILDER_NAMED;
  return BUILDER_BACKUP;
}

export function builderHref(slug?: string | null, viewerHost?: string | null): string {
  const origin = builderOrigin(viewerHost).replace(/\/$/, "");
  const s = (slug || "").replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!s || s === "admin" || s === "builder") return origin;
  return `${origin}/${s}`;
}

/**
 * Only the hub and the lab can consume a DLN home ticket.
 * House sites (ModYu, DAA, …) have no /api/auth/lan-consume — posting there is their 404 page.
 */
export function canCarryStudioSession(dest: URL): boolean {
  const host = dest.hostname.toLowerCase();
  const port = dest.port || (dest.protocol === "https:" ? "443" : "80");
  if (host === "builder.dln.local" || host === PARENT_NAME) return true;
  if (host === "designlabnorth.com" || host === "www.designlabnorth.com") return true;
  if (
    (host === LAN_IP || host === "127.0.0.1" || host === "localhost") &&
    (port === "3010" || port === "3100" || port === "80")
  ) {
    return true;
  }
  return false;
}

export function daveHostsLine(): string {
  const names = LAN_HOUSES.map((h) => h.host).join(" ");
  return `${LAN_IP} ${names}`;
}
