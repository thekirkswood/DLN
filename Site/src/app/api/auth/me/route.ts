import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, sessionCookieOptions, touchSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(COOKIE)?.value;
  const user = await touchSession(token);
  const res = NextResponse.json({ user: user || null });
  if (user && token) {
    res.cookies.set(sessionCookieOptions(token));
  }
  return res;
}
