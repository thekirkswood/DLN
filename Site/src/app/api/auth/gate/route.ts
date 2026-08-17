import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, canAccessPlot, isStudio, userFromSession } from "@/lib/auth";
import { enterUrlFor, plotBySlug } from "@/lib/plots";
import { plotShutFor } from "@/lib/billing";

function publicBase(req: NextRequest): string {
  return (process.env.DLN_PUBLIC_URL || req.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("plot") || "";
  const plot = slug ? await plotBySlug(slug) : undefined;
  const base = publicBase(req);
  if (!plot) {
    return NextResponse.redirect(`${base}/`, 302);
  }
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) {
    const live = enterUrlFor(plot);
    const next = live || `${base}/greenhouse/${plot.slug}`;
    return NextResponse.redirect(
      `${base}/login?next=${encodeURIComponent(next)}`,
      302,
    );
  }
  if (!canAccessPlot(user, plot.slug)) {
    return NextResponse.redirect(`${base}/not-yours`, 302);
  }
  if (!isStudio(user) && (await plotShutFor(plot.slug))) {
    return NextResponse.redirect(`${base}/not-yours`, 302);
  }
  return new NextResponse(null, { status: 200 });
}
