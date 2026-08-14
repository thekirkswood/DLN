import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, logout, sessionCookieOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = cookies().get(COOKIE)?.value;
  await logout(token);
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(sessionCookieOptions("", 0));
  return res;
}
