import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { sessionFromRequest } from "@/lib/session";
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
    const hit = await sessionFromRequest();
    if (!hit || !isStudio(hit.user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueDksHandoff(hit.token);
    return NextResponse.redirect(dksCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
