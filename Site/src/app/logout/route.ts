import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, logout, sessionCookieOptions } from "@/lib/auth";
import { publicUrl } from "@/lib/public-url";
import { releaseStudioPresence } from "@/lib/studio-presence";

export async function GET(req: NextRequest) {
  const token = cookies().get(COOKIE)?.value;
  await releaseStudioPresence(token);
  await logout(token);
  const res = NextResponse.redirect(publicUrl(req, "/"), 302);
  res.cookies.set(sessionCookieOptions("", 0));
  return res;
}
