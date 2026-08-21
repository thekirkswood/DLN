import { NextRequest, NextResponse } from "next/server";
import {
  canHubLogin,
  findUserByEmail,
  isPuppetEmail,
  isStudio,
  login,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { issueStudioTicketFromHome } from "@/lib/home-dial";
import { homeOrigin } from "@/lib/home-ticket";
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

  const lab = isLabHost(req.headers.get("host"));
  const user = await findUserByEmail(email);
  if (
    user &&
    !canHubLogin(user, lab) &&
    (user.puppet || isPuppetEmail(user.email) || user.hubLogin === false)
  ) {
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const puppet = Boolean(user.puppet) || isPuppetEmail(user.email);
    return NextResponse.json(
      {
        ok: false,
        reason: puppet ? "campus_only" : "hub_locked",
      },
      { status: 403 },
    );
  }

  if (user && isStudio(user) && !lab && homeOrigin()) {
    const home = await issueStudioTicketFromHome(email, password);
    if (home && "error" in home) {
      if (home.error === "home_unreachable") {
        return NextResponse.json(
          { ok: false, reason: "home_unreachable" },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (home && "token" in home) {
      const res = NextResponse.json({ ok: true, user: home.user });
      res.cookies.set(sessionCookieOptions(home.token));
      return res;
    }
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
