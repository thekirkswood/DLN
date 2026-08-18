import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Blanket studio check for plot hosts.
 * Owner and studio (Ewan, Dave) only — not client logins on this book.
 */
export async function GET() {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    studio: isStudio(user),
  });
}
