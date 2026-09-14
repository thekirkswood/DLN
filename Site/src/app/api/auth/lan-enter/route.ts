import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { issueLanHandoff, lanConsumeUrl, parseLanTarget } from "@/lib/lan-handoff";
import { safeLoginNext } from "@/lib/login-next";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * Copy a live hub session onto another LAN host (lab, backup IP).
 * If they are not signed in here, send them through Sign in first.
 */
export async function GET(req: NextRequest) {
  const rawNext = req.nextUrl.searchParams.get("next") || "";
  const target = parseLanTarget(rawNext);
  const fallback = publicUrl(req, "/account");
  if (!target) {
    return NextResponse.redirect(fallback, 302);
  }
  const token = req.cookies.get(COOKIE)?.value;
  const user = await userFromSession(token);
  if (!user || !token) {
    const login = new URL(publicUrl(req, "/login"));
    login.searchParams.set("next", safeLoginNext(rawNext));
    return NextResponse.redirect(login, 302);
  }
  if (!isStudio(user)) {
    return NextResponse.redirect(fallback, 302);
  }
  const here = new URL(publicUrl(req, "/"));
  if (here.origin === target.origin) {
    return NextResponse.redirect(new URL(target.path, `${target.origin}/`), 302);
  }
  const code = await issueLanHandoff(token);
  return NextResponse.redirect(lanConsumeUrl(target, code), 302);
}
