import type { NextRequest } from "next/server";

const DEAD_HOST = /^(0\.0\.0\.0|\[::\]|\[::1\])$/i;

function hostnameOf(value: string): string | null {
  const raw = value.split(",")[0]?.trim();
  if (!raw) return null;
  try {
    const url = raw.includes("://") ? new URL(raw) : new URL(`http://${raw}`);
    if (DEAD_HOST.test(url.hostname)) return null;
    return url.host;
  } catch {
    return null;
  }
}

function protoOf(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (xf === "https" || xf === "http") return xf;
  if (req.nextUrl.protocol === "https:") return "https";
  return "http";
}

function isHubHostname(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return (
    h === "designlabnorth.com" ||
    h === "www.designlabnorth.com" ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
}

/** Public origin for redirects. Never the Docker bind `0.0.0.0:3000`. */
export function publicOrigin(
  req: NextRequest,
  envName = "DLN_PUBLIC_URL",
  fallback = "https://designlabnorth.com",
): string {
  const forwarded = hostnameOf(req.headers.get("x-forwarded-host") || "");
  if (forwarded) return `${protoOf(req)}://${forwarded}`;

  const host = hostnameOf(req.headers.get("host") || "");
  if (host) return `${protoOf(req)}://${host}`;

  const env = process.env[envName]?.trim().replace(/\/$/, "");
  if (env && hostnameOf(env)) return env;

  return fallback.replace(/\/$/, "");
}

/**
 * Login / gate redirects always land on the hub book, never on a plot host.
 * Caddy forward_auth sends the plot Host; using that caused a loop on
 * swarmfund.designlabnorth.com/login.
 */
export function hubOrigin(req: NextRequest): string {
  const env = process.env.DLN_PUBLIC_URL?.trim().replace(/\/$/, "");
  const raw =
    hostnameOf(req.headers.get("x-forwarded-host") || "") ||
    hostnameOf(req.headers.get("host") || "") ||
    "";
  if (raw && isHubHostname(raw)) return `${protoOf(req)}://${raw}`;
  if (env && hostnameOf(env)) return env;
  return "https://designlabnorth.com";
}

export function publicUrl(
  req: NextRequest,
  path = "/",
  envName = "DLN_PUBLIC_URL",
  fallback = "https://designlabnorth.com",
): URL {
  const origin = publicOrigin(req, envName, fallback);
  return new URL(path, `${origin}/`);
}
