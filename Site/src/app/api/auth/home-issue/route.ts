import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, isStudio, verifyPassword } from "@/lib/auth";
import { homeDialSecret, signHomeTicket } from "@/lib/home-ticket";

export const dynamic = "force-dynamic";

/**
 * Home campus only. The VPS dials this over the house tunnel with a shared
 * secret. Studio passwords are checked against the at-home book, then an
 * Ed25519 ticket is issued. Clients never come through here.
 */
export async function POST(req: NextRequest) {
  const expected = homeDialSecret();
  const got = req.headers.get("x-dln-home-dial") || "";
  if (!expected || got !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
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
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { passwordHash: _, ...pub } = user;
  if (!isStudio(pub) || user.puppet) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const token = await signHomeTicket({
    email: user.email,
    role: user.role === "owner" ? "owner" : "studio",
  });
  if (!token) {
    return NextResponse.json({ ok: false, reason: "no_home_key" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, token, user: pub });
}
