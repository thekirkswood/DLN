import { NextRequest, NextResponse } from "next/server";
import {
  canHubLogin,
  findUserByEmail,
  isPuppetEmail,
  login,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { isLabHost } from "@/lib/lab-host";

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

  const user = await findUserByEmail(email);
  if (
    user &&
    verifyPassword(password, user.passwordHash) &&
    !canHubLogin(user, isLabHost(req.headers.get("host")))
  ) {
    const puppet = Boolean(user.puppet) || isPuppetEmail(user.email);
    return NextResponse.json(
      {
        ok: false,
        reason: puppet ? "campus_only" : "hub_locked",
      },
      { status: 403 },
    );
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
