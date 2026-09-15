import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { sessionFromRequest } from "@/lib/session";
import {
  issueSwarmHandoff,
  safeSwarmPath,
  swarmBuildingUrl,
  swarmCallbackUrl,
} from "@/lib/swarm-handoff";

export const dynamic = "force-dynamic";

/** Studio-only bounce: copy DLN session onto swarmfund.com (Ewan / Dave). */
export async function GET(req: NextRequest) {
  const next = safeSwarmPath(req.nextUrl.searchParams.get("next"));
  const building = swarmBuildingUrl();
  try {
    const hit = await sessionFromRequest();
    if (!hit || !isStudio(hit.user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueSwarmHandoff(hit.token);
    return NextResponse.redirect(swarmCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
