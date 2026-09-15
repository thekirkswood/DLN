export function clientIpFrom(headers: Headers): string {
  const stamped = headers.get("x-dln-watch-ip")?.trim();
  if (stamped) return stamped.slice(0, 64);
  const xf = headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

/** Loopback, LAN, link-local. Never shut these at the edge. */
export function isPrivateIp(ip: string): boolean {
  const v = (ip || "").trim().toLowerCase();
  if (!v || v === "unknown") return true;
  if (v === "::1" || v === "localhost") return true;
  if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
  if (v.startsWith("127.")) return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("169.254.")) return true;
  if (v.startsWith("172.")) {
    const n = Number(v.split(".")[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  return false;
}

export function ipv4Net(ip: string): string {
  const m = ip.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  return m ? `${m[1]}.0/24` : "";
}

export function uaFamily(ua: string): string {
  return ua
    .toLowerCase()
    .replace(/[\d.]+/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

