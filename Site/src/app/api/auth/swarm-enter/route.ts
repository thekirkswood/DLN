import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
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
    const token = cookies().get(COOKIE)?.value;
    const user = await userFromSession(token);
    if (!user || !token || !isStudio(user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueSwarmHandoff(token);
    return NextResponse.redirect(swarmCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
