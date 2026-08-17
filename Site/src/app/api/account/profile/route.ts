import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, updateDisplayName, userFromSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { displayName?: string } | null;
  const displayName = body?.displayName?.toString() || "";
  try {
    const next = await updateDisplayName(user.id, displayName);
    return NextResponse.json({ ok: true, displayName: next.displayName });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
