import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { hitsForPlot } from "@/lib/watch";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const slug = (req.nextUrl.searchParams.get("plot") || "").trim();
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  if (!isStudio(user) && !user.plots.includes(slug) && !user.plots.includes("*")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const counts = await hitsForPlot(slug);
  return NextResponse.json({ ok: true, ...counts });
}
