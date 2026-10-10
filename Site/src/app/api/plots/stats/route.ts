import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { hitsForPlot, mapForPlot } from "@/lib/watch";
import { plotBySlug } from "@/lib/plots";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const slug = (req.nextUrl.searchParams.get("plot") || "").trim();
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  if (!isStudio(user) && !user.plots.includes(slug) && !user.plots.includes("*")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const plot = await plotBySlug(slug);
  const counts = await hitsForPlot(slug);
  const map = await mapForPlot(slug, plot?.pages || []);
  return NextResponse.json({ ok: true, ...counts, pages: map.pages, from: map.from });
}
