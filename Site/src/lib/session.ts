import { cookies, headers } from "next/headers";
import { userFromSession, COOKIE, type PublicUser } from "@/lib/auth";
import { sessionTokensFromHeader } from "@/lib/cookie-opts";

/** Raw Cookie header, not cookies().get — Next collapses duplicate names to one value. */
export function sessionTokensOnRequest(): string[] {
  const fromHeader = sessionTokensFromHeader(headers().get("cookie"));
  if (fromHeader.length) return fromHeader;
  const seen = new Set<string>();
  for (const row of cookies().getAll()) {
    if (row.name === COOKIE && row.value) seen.add(row.value);
  }
  return Array.from(seen);
}

export async function sessionFromTokens(
  tokens: string[],
): Promise<{ user: PublicUser; token: string } | null> {
  for (const token of tokens) {
    if (!token) continue;
    const user = await userFromSession(token);
    if (user) return { user, token };
  }
  return null;
}

export async function sessionFromRequest(): Promise<{
  user: PublicUser;
  token: string;
} | null> {
  return sessionFromTokens(sessionTokensOnRequest());
}

export async function getRequestSession(req: {
  headers: { get(name: string): string | null };
}): Promise<{ user: PublicUser; token: string } | null> {
  return sessionFromTokens(sessionTokensFromHeader(req.headers.get("cookie")));
}

export async function getRequestUser(req: {
  headers: { get(name: string): string | null };
}): Promise<PublicUser | null> {
  return (await getRequestSession(req))?.user || null;
}

export async function sessionFromRequestOrBearer(req: {
  headers: { get(name: string): string | null };
}): Promise<{ user: PublicUser; token: string } | null> {
  const hit = await getRequestSession(req);
  if (hit) return hit;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const header = req.headers.get("x-dln-session")?.trim();
  return sessionFromTokens([bearer || "", header || ""].filter(Boolean));
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const hit = await sessionFromRequest();
  return hit?.user || null;
}
