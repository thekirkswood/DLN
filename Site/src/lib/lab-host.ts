/** Hostname from a Host header or window.location.host (may include a port). */
export function hostnameOf(host?: string | null): string {
  const raw = (host || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.startsWith("[")) {
    const end = raw.indexOf("]");
    return end >= 0 ? raw.slice(1, end) : raw;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(raw)) return raw.split(":")[0];
  const colon = raw.lastIndexOf(":");
  if (colon > -1 && !raw.slice(0, colon).includes(":")) return raw.slice(0, colon);
  return raw;
}

function ipv4Private(h: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return false;
  const [a, b] = h.split(".").map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function ipv6LoopbackOrPrivate(h: string): boolean {
  if (!h.includes(":")) return false;
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;
  const head = h.split(":")[0];
  return head === "fe80" || head.startsWith("fc") || head.startsWith("fd");
}

/**
 * The offline lab is this PC — loopback or the LAN address Dave uses from his machine.
 * Public hosts (designlabnorth.com and the plot names) stay 404 for /lab.
 */
export function isLabHost(host?: string | null): boolean {
  const h = hostnameOf(host);
  if (!h) return false;
  if (h === "localhost" || h === "0.0.0.0") return true;
  if (h.endsWith(".local")) return true;
  if (ipv4Private(h)) return true;
  if (ipv6LoopbackOrPrivate(h)) return true;
  return false;
}

export function labStationPath(slug: string): string {
  return slug === "dln" ? "/admin" : `/lab/${slug}`;
}
