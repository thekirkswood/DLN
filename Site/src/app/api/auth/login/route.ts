import { NextRequest, NextResponse } from "next/server";
import {
  canHubLogin,
  findUserByEmail,
  isPuppetEmail,
  isStudio,
  login,
  verifyPassword,
} from "@/lib/auth";
import { appendSessionCookies } from "@/lib/cookie-opts";
import { emitClock } from "@/lib/clock-store";
import { issueStudioTicketFromHome } from "@/lib/home-dial";
import { homeOrigin } from "@/lib/home-ticket";
import { isLabHost } from "@/lib/lab-host";

function reqHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") || req.headers.get("host");
}

function reqProto(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-proto");
}

function setSession(res: NextResponse, token: string, req: NextRequest) {
  appendSessionCookies(res.headers, token, reqHost(req), reqProto(req));
}

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

  const lab = isLabHost(reqHost(req));
  const user = await findUserByEmail(email);
  if (
    user &&
    !canHubLogin(user, lab) &&
    (user.puppet || isPuppetEmail(user.email) || user.hubLogin === false)
  ) {
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      void emitClock({
        house: "dln",
        plane: "studio",
        kind: "studio.login.fail",
        actor: email,
        summary: "Sign-in failed",
      });
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
      void emitClock({
        house: "dln",
        plane: "studio",
        kind: "studio.login.fail",
        actor: email,
        summary: "Sign-in failed",
      });
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (home && "token" in home) {
      void emitClock({
        house: "dln",
        host: "live",
        plane: "studio",
        kind: "studio.login.ok",
        actor: home.user?.email || email,
        summary: `${home.user?.displayName || email} signed in via home ticket`,
      });
      const res = NextResponse.json({ ok: true, user: home.user });
      setSession(res, home.token, req);
      return res;
    }
  }

  const result = await login(email, password);
  if (!result) {
    void emitClock({
      house: "dln",
      plane: "studio",
      kind: "studio.login.fail",
      actor: email,
      summary: "Sign-in failed",
    });
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, user: result.user });
  setSession(res, result.token, req);
  return res;
}
