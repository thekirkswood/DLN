import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Blanket studio check for plot hosts.
 * Owner and studio (Ewan, Dave) only — not client logins on this book.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    studio: isStudio(user),
  });
}
