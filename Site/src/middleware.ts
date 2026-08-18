import { NextRequest, NextResponse } from "next/server";
import { isLabHost } from "@/lib/lab-host";
import { LAB_ALIASES } from "@/lib/lab-aliases";

const COOKIE = "dln_session";

function isLabPath(pathname: string): boolean {
  return (
    pathname === "/lab" ||
    pathname.startsWith("/lab/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/go/") ||
    pathname.startsWith("/api/lab")
  );
}

function aliasTarget(pathname: string): string | null {
  for (const slug of LAB_ALIASES) {
    if (pathname === `/${slug}`) return `/lab/${slug}`;
    if (pathname === `/${slug}/admin`) return `/lab/${slug}/admin`;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const alias = aliasTarget(pathname);
  if (alias) {
    if (!isLabHost(req.headers.get("host"))) {
      return new NextResponse(null, { status: 404 });
    }
    const url = req.nextUrl.clone();
    url.pathname = alias;
    return NextResponse.redirect(url);
  }

  if (!isLabPath(pathname)) return NextResponse.next();

  if (!isLabHost(req.headers.get("host"))) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/api/lab")) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lab",
    "/lab/:path*",
    "/admin",
    "/admin/:path*",
    "/go/:path*",
    "/api/lab/:path*",
    "/modyu",
    "/modyu/admin",
    "/various-titles",
    "/various-titles/admin",
    "/swarm",
    "/swarm/admin",
  ],
};
