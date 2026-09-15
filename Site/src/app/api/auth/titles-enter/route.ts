import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { sessionFromRequest } from "@/lib/session";
import {
  issueHandoff,
  safeVtPath,
  titlesBuildingUrl,
  titlesCallbackUrl,
} from "@/lib/titles-handoff";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const next = safeVtPath(req.nextUrl.searchParams.get("next"));
  const building = titlesBuildingUrl();
  try {
    const hit = await sessionFromRequest();
    if (!hit || !isStudio(hit.user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueHandoff(hit.token);
    return NextResponse.redirect(titlesCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
