import { NextRequest, NextResponse } from "next/server";
import { consumeLanHandoff } from "@/lib/lan-handoff";
import { appendSessionCookies } from "@/lib/cookie-opts";
import { safeLoginNext } from "@/lib/login-next";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/** Hub may copy a session onto itself (rare). Lab has its own consume. */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim() || "";
  const next = safeLoginNext(req.nextUrl.searchParams.get("next") || "/", "/");
  const path = next.startsWith("/") ? next : "/";
  if (!code) {
    return NextResponse.redirect(publicUrl(req, "/login"), 302);
  }
  const token = await consumeLanHandoff(code);
  if (!token) {
    return NextResponse.redirect(publicUrl(req, "/login"), 302);
  }
  const res = NextResponse.redirect(publicUrl(req, path), 302);
  appendSessionCookies(
    res.headers,
    token,
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
  );
  return res;
}
