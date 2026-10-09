import { NextRequest, NextResponse } from "next/server";
import { canAccessPlot } from "@/lib/auth";
import { sessionFromRequest } from "@/lib/session";
import { readSiteLog } from "@/lib/site-log";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const hit = await sessionFromRequest();
  if (!hit?.user) {
    return NextResponse.json({ lines: [] }, { status: 401 });
  }
  const slug = (req.nextUrl.searchParams.get("plot") || "").trim();
  if (!slug) return NextResponse.json({ lines: [] }, { status: 400 });
  if (!canAccessPlot(hit.user, slug)) {
    return NextResponse.json({ lines: [] }, { status: 403 });
  }
  return NextResponse.json({ lines: await readSiteLog(slug) });
}
