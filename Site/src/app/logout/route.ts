import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";
import { appendSessionCookies, sessionTokensFromHeader } from "@/lib/cookie-opts";
import { publicUrl } from "@/lib/public-url";

export async function GET(req: NextRequest) {
  for (const token of sessionTokensFromHeader(req.headers.get("cookie"))) {
    await logout(token);
  }
  const res = NextResponse.redirect(publicUrl(req, "/"), 302);
  appendSessionCookies(
    res.headers,
    "",
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
    0,
  );
  return res;
}
