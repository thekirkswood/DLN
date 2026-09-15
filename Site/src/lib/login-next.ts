import { LAN_HOUSES, LAN_IP, canCarryStudioSession, isDlnLocalHost } from "@/lib/lan-names";

const LAN_PORTS = new Set(["80", "443", ...LAN_HOUSES.map((h) => String(h.port))]);

function isPrivateIpv4(host: string): boolean {
  if (host === LAN_IP) return true;
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("127.")) {
    return true;
  }
  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

/** Where Sign in may send them. Lab names and LAN ports included. */
export function safeLoginNext(value: string, fallback = "/account"): string {
  const raw = (value || "").trim();
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const port = u.port || (u.protocol === "https:" ? "443" : "80");
    if (u.protocol !== "http:" && u.protocol !== "https:") return fallback;
    if (host === "designlabnorth.com" || host.endsWith(".designlabnorth.com")) {
      return raw;
    }
    if (isDlnLocalHost(host) && u.protocol === "http:") return raw;
    const loop = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (u.protocol === "http:" && (loop || isPrivateIpv4(host)) && LAN_PORTS.has(port)) {
      return raw;
    }
  } catch {
    /* fall through */
  }
  return fallback;
}

/** Same host → path. Other LAN host → copy the session onto that host. */
export function continueAfterLogin(next: string, hereOrigin?: string): string {
  const dest = safeLoginNext(next);
  if (dest.startsWith("/")) return dest;
  try {
    const u = new URL(dest);
    if (hereOrigin) {
      const here = new URL(hereOrigin);
      if (u.origin === here.origin) {
        return `${u.pathname}${u.search}${u.hash}` || "/account";
      }
    }
    if (canCarryStudioSession(u)) {
      return `/api/auth/lan-enter?next=${encodeURIComponent(dest)}`;
    }
  } catch {
    /* fall through */
  }
  return dest;
}
