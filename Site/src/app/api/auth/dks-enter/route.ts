import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import {
  dksBuildingUrl,
  dksCallbackUrl,
  issueDksHandoff,
  safeDksPath,
} from "@/lib/dks-handoff";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const next = safeDksPath(req.nextUrl.searchParams.get("next"));
  const building = dksBuildingUrl();
  try {
    const user = await userFromSession(cookies().get(COOKIE)?.value);
    const token = cookies().get(COOKIE)?.value;
    if (!user || !token || !isStudio(user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueDksHandoff(token);
    return NextResponse.redirect(dksCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
