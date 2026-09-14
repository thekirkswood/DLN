import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Studio check for Dave Kirkwood Clock unlock. */
export async function GET(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const header = req.headers.get("x-dln-session")?.trim();
  const token = cookies().get(COOKIE)?.value || bearer || header || "";
  const user = await userFromSession(token);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    studio: isStudio(user),
  });
}
