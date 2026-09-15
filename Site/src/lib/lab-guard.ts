import { NextRequest, NextResponse } from "next/server";
import { notFound, redirect } from "next/navigation";
import { COOKIE, isStudio, userFromSession, type PublicUser } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { sessionTokensFromHeader } from "@/lib/cookie-opts";

export async function requireLabStudioPage(nextPath: string): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isStudio(user)) notFound();
  return user;
}

export async function requireLabStudioApi(req: NextRequest): Promise<
  { user: PublicUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  let user: PublicUser | null = null;
  const tokens = sessionTokensFromHeader(req.headers.get("cookie"));
  const listed = tokens.length ? tokens : [req.cookies.get(COOKIE)?.value || ""];
  for (const token of listed) {
    if (!token) continue;
    user = await userFromSession(token);
    if (user) break;
  }
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: "sign in" }, { status: 401 }) };
  }
  if (!isStudio(user)) {
    return { error: NextResponse.json({ ok: false, error: "studio only" }, { status: 401 }) };
  }
  return { user };
}

export const requireStudioPage = requireLabStudioPage;
export const requireStudioApi = requireLabStudioApi;
