import { hostnameOf } from "@/lib/lab-host";
import { isDlnLocalHost } from "@/lib/lan-names";

export const SESSION_COOKIE = "dln_session";
export const SESSION_MAX_AGE = 90 * 24 * 60 * 60;
export const EPK_COOKIE = "dln_epk";
export const EPK_MAX_AGE = 30 * 24 * 60 * 60;

const EPOCH = new Date(0);

export type CookieInit = {
  name: string;
  value: string;
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
  expires: Date;
  secure: boolean;
  domain?: string;
};

/** First host when Caddy sends a list. */
export function firstHostHeader(host?: string | null): string {
  return (host || "").split(",")[0].trim();
}

export function cookieSecure(proto?: string | null): boolean {
  if (process.env.DLN_COOKIE_SECURE === "true") return true;
  if (process.env.DLN_COOKIE_SECURE === "false") return false;
  return firstHostHeader(proto).toLowerCase() === "https";
}

/**
 * Domain attribute, or none.
 * `.local` is a special-use TLD — `Domain=.dln.local` is often rejected, and a
 * host-only twin then fights it. Named LAN stays host-only; `/api/auth/lan-enter`
 * copies the session onto the next name. Live uses `DLN_COOKIE_DOMAIN`.
 */
export function sessionCookieDomain(host?: string | null): string | undefined {
  const h = hostnameOf(firstHostHeader(host));
  if (isDlnLocalHost(h)) return undefined;
  const d = process.env.DLN_COOKIE_DOMAIN?.trim();
  return d || undefined;
}

function cookieInit(
  name: string,
  value: string,
  maxAge: number,
  host?: string | null,
  proto?: string | null,
  withDomain = true,
): CookieInit {
  const expires =
    maxAge <= 0 ? EPOCH : new Date(Date.now() + Math.max(0, maxAge) * 1000);
  const domain = withDomain ? sessionCookieDomain(host) : undefined;
  return {
    name,
    value,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    expires,
    secure: cookieSecure(proto),
    ...(domain ? { domain } : {}),
  };
}

export function sessionCookieFields(
  token: string,
  maxAge = SESSION_MAX_AGE,
  host?: string | null,
  proto?: string | null,
  withDomain = true,
): CookieInit {
  return cookieInit(SESSION_COOKIE, token, maxAge, host, proto, withDomain);
}

export function epkCookieFields(
  kitId: string,
  host?: string | null,
  proto?: string | null,
  maxAge = EPK_MAX_AGE,
  withDomain = true,
): CookieInit {
  return cookieInit(EPK_COOKIE, kitId, maxAge, host, proto, withDomain);
}

export function cookieHeader(c: CookieInit): string {
  const parts = [
    `${c.name}=${c.value}`,
    "Path=/",
    `Max-Age=${Math.max(0, c.maxAge)}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (c.secure) parts.push("Secure");
  if (c.domain) parts.push(`Domain=${c.domain}`);
  if (c.maxAge <= 0) parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  return parts.join("; ");
}

function deadTwin(named: CookieInit, domain?: string): CookieInit {
  return {
    ...named,
    value: "",
    maxAge: 0,
    expires: EPOCH,
    ...(domain ? { domain } : { domain: undefined }),
  };
}

/**
 * One live cookie. Expire the leftover twin so two `dln_session` values cannot
 * fight (Next collapses duplicate names; browsers send both).
 */
function appendLive(
  headers: Headers,
  named: CookieInit,
  host?: string | null,
) {
  headers.append("Set-Cookie", cookieHeader(named));
  if (named.domain) {
    headers.append("Set-Cookie", cookieHeader(deadTwin(named)));
    return;
  }
  if (isDlnLocalHost(hostnameOf(firstHostHeader(host)))) {
    headers.append("Set-Cookie", cookieHeader(deadTwin(named, ".dln.local")));
  }
}

export function appendSessionCookies(
  headers: Headers,
  token: string,
  host?: string | null,
  proto?: string | null,
  maxAge = SESSION_MAX_AGE,
) {
  appendLive(headers, sessionCookieFields(token, maxAge, host, proto), host);
}

export function appendEpkCookies(
  headers: Headers,
  kitId: string,
  host?: string | null,
  proto?: string | null,
  maxAge = EPK_MAX_AGE,
) {
  appendLive(headers, epkCookieFields(kitId, host, proto, maxAge), host);
}

/** Every dln_session value on the request. Leftover twins may still arrive until they expire. */
export function sessionTokensFromHeader(cookieHeader?: string | null): string[] {
  const seen = new Set<string>();
  for (const part of (cookieHeader || "").split(";")) {
    const cut = part.trim();
    if (!cut) continue;
    const eq = cut.indexOf("=");
    if (eq < 1) continue;
    const name = cut.slice(0, eq).trim();
    const value = cut.slice(eq + 1).trim();
    if (name === SESSION_COOKIE && value) seen.add(value);
  }
  return Array.from(seen);
}
