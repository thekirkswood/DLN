import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * Caddy forward_auth before the VPS proxies /lab to home.
 * 200 only for a studio ticket or session. Clients stay off the desk.
 */
export async function GET(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) {
    return NextResponse.redirect(publicUrl(req, "/login?next=/lab"), 302);
  }
  if (!isStudio(user)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 200 });
}
