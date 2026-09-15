import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { sessionFromRequestOrBearer } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Studio check for Dave Kirkwood Clock unlock. */
export async function GET(req: NextRequest) {
  const hit = await sessionFromRequestOrBearer(req);
  const user = hit?.user;
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    studio: isStudio(user),
  });
}
