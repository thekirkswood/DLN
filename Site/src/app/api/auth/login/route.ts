import { NextRequest, NextResponse } from "next/server";
import { login, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.toString() ?? "";
  const password = body?.password?.toString() ?? "";
  if (!email || !password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const result = await login(email, password);
  if (!result) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, user: result.user });
  const cookie = sessionCookieOptions(result.token);
  res.cookies.set(cookie);
  return res;
}
