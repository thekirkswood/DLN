import { NextRequest, NextResponse } from "next/server";
import { canAccessPlot } from "@/lib/auth";
import { shippedPatchNotes } from "@/lib/plans";
import { sessionFromRequest } from "@/lib/session";
import { readSiteLog, SITE_LOG_KEEP } from "@/lib/site-log";

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
  const fromFile = await readSiteLog(slug);
  const fromPlans = await shippedPatchNotes(slug);
  const seen = new Set<string>();
  const lines = [...fromFile, ...fromPlans]
    .filter((row) => {
      const key = `${row.t}|${row.s}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (a.t < b.t ? 1 : a.t > b.t ? -1 : 0))
    .slice(0, SITE_LOG_KEEP);
  return NextResponse.json({ lines });
}
