import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getRequestUser } from "@/lib/session";
import { EPK_COOKIE, kitFromCookieValue } from "@/lib/epk";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  const kit = kitFromCookieValue(req.cookies.get(EPK_COOKIE)?.value);
  return NextResponse.json({
    ok: true,
    kit,
    studio: Boolean(user && isStudio(user)),
  });
}
