import { NextRequest, NextResponse } from "next/server";
import { notFound, redirect } from "next/navigation";
import { COOKIE, isStudio, userFromSession, type PublicUser } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export async function requireLabStudioPage(nextPath: string): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isStudio(user)) notFound();
  return user;
}

export async function requireLabStudioApi(req: NextRequest): Promise<
  { user: PublicUser; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
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
