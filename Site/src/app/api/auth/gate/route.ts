import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, canAccessPlot, userFromSession } from "@/lib/auth";
import { plotBySlug } from "@/lib/plots";

function publicBase(req: NextRequest): string {
  return (process.env.DLN_PUBLIC_URL || req.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("plot") || "";
  const plot = slug ? await plotBySlug(slug) : undefined;
  const dest = `${publicBase(req)}/greenhouse/${slug || ""}`;
  if (!plot) {
    return NextResponse.redirect(dest, 302);
  }
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !canAccessPlot(user, plot.slug)) {
    return NextResponse.redirect(dest, 302);
  }
  return new NextResponse(null, { status: 200 });
}
