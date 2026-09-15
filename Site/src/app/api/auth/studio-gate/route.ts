import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

/**
 * Studio session check. Clients stay off studio APIs.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(publicUrl(req, "/login?next=/account"), 302);
  }
  if (!isStudio(user)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 200 });
}
