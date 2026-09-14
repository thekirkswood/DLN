import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { EPK_COOKIE, kitFromCookieValue } from "@/lib/epk";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  const kit = kitFromCookieValue(req.cookies.get(EPK_COOKIE)?.value);
  return NextResponse.json({
    ok: true,
    kit,
    studio: Boolean(user && isStudio(user)),
  });
}
