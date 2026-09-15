import { NextRequest, NextResponse } from "next/server";
import { userFromSession } from "@/lib/auth";
import { consumeLanHandoff } from "@/lib/lan-handoff";
import { appendSessionCookies } from "@/lib/cookie-opts";
import { isHomeTicket } from "@/lib/home-ticket";
import { safeLoginNext } from "@/lib/login-next";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

async function tokenFromCode(code: string): Promise<string | null> {
  const raw = code.trim();
  if (!raw) return null;
  if (isHomeTicket(raw)) {
    const user = await userFromSession(raw);
    return user ? raw : null;
  }
  return consumeLanHandoff(raw);
}

function land(req: NextRequest, token: string, path: string): NextResponse {
  const res = NextResponse.redirect(publicUrl(req, path), 302);
  appendSessionCookies(
    res.headers,
    token,
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
  );
  return res;
}

function fail(req: NextRequest): NextResponse {
  return NextResponse.redirect(publicUrl(req, "/login"), 302);
}

function nextPath(raw: string | null): string {
  const next = safeLoginNext(raw || "/", "/");
  return next.startsWith("/") ? next : "/";
}

/** Hub may copy a session onto itself (rare). Lab has its own consume. */
export async function GET(req: NextRequest) {
  const code =
    req.nextUrl.searchParams.get("code")?.trim() ||
    req.nextUrl.searchParams.get("ticket")?.trim() ||
    "";
  const path = nextPath(req.nextUrl.searchParams.get("next"));
  if (!code) return fail(req);
  const token = await tokenFromCode(code);
  if (!token) return fail(req);
  return land(req, token, path);
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let code = "";
  let next = "/";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as {
      ticket?: string;
      code?: string;
      next?: string;
    } | null;
    code = (body?.ticket || body?.code || "").trim();
    next = body?.next || "/";
  } else {
    const form = await req.formData().catch(() => null);
    code = String(form?.get("ticket") || form?.get("code") || "").trim();
    next = String(form?.get("next") || "/");
  }
  const path = nextPath(next);
  if (!code) return fail(req);
  const token = await tokenFromCode(code);
  if (!token) return fail(req);
  return land(req, token, path);
}
