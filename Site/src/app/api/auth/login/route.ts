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
import { clientIpFrom } from "@/lib/client-ip";
import { markLoginAttempt } from "@/lib/watch";

function reqHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") || req.headers.get("host");
}

function reqProto(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-proto");
}

function setSession(res: NextResponse, token: string, req: NextRequest) {
  appendSessionCookies(res.headers, token, reqHost(req), reqProto(req));
}

function noteLogin(
  req: NextRequest,
  email: string,
  ok: boolean,
  reason?: string,
) {
  void markLoginAttempt({
    ip: clientIpFrom(req.headers),
    host: reqHost(req) || "",
    ua: req.headers.get("user-agent") || "",
    email,
    ok,
    reason,
  });
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
      noteLogin(req, email, false, "miss");
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const puppet = Boolean(user.puppet) || isPuppetEmail(user.email);
    noteLogin(req, email, false, puppet ? "campus_only" : "hub_locked");
    return NextResponse.json(
      {
        ok: false,
        reason: puppet ? "campus_only" : "hub_locked",
      },
      { status: 403 },
    );
  }

  let homeDown = false;
  if (user && isStudio(user) && !lab && homeOrigin()) {
    const home = await issueStudioTicketFromHome(email, password);
    if (home && "token" in home) {
      void emitClock({
        house: "dln",
        host: "live",
        plane: "studio",
        kind: "studio.login.ok",
        actor: home.user?.email || email,
        summary: `${home.user?.displayName || email} signed in via home ticket`,
      });
      noteLogin(req, home.user?.email || email, true, "home");
      const res = NextResponse.json({ ok: true, user: home.user });
      setSession(res, home.token, req);
      return res;
    }
    if (home && "error" in home) {
      if (home.error === "home_unreachable") {
        homeDown = true;
      } else {
        void emitClock({
          house: "dln",
          plane: "studio",
          kind: "studio.login.fail",
          actor: email,
          summary: "Sign-in failed",
        });
        noteLogin(req, email, false, "miss");
        return NextResponse.json({ ok: false }, { status: 401 });
      }
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
    if (homeDown) {
      noteLogin(req, email, false, "home_unreachable");
      return NextResponse.json(
        { ok: false, reason: "home_unreachable" },
        { status: 503 },
      );
    }
    noteLogin(req, email, false, "miss");
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  noteLogin(req, result.user.email || email, true);
  const res = NextResponse.json({ ok: true, user: result.user });
  setSession(res, result.token, req);
  return res;
}
