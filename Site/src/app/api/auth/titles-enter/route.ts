import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
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
    const user = await userFromSession(cookies().get(COOKIE)?.value);
    const token = cookies().get(COOKIE)?.value;
    if (!user || !token || !isStudio(user)) {
      return NextResponse.redirect(building, 302);
    }
    const code = await issueHandoff(token);
    return NextResponse.redirect(titlesCallbackUrl(code, next), 302);
  } catch {
    return NextResponse.redirect(building, 302);
  }
}
