import { NextRequest, NextResponse } from "next/server";
import { isLabHost } from "@/lib/lab-host";
import {
  EPK_COOKIE,
  SESSION_COOKIE,
  appendEpkCookies,
  appendSessionCookies,
} from "@/lib/cookie-opts";

function withPath(req: NextRequest, res: NextResponse) {
  res.headers.set("x-dln-path", req.nextUrl.pathname);
  return res;
}

function nextWithPath(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-dln-path", req.nextUrl.pathname);
  const res = withPath(
    req,
    NextResponse.next({ request: { headers: requestHeaders } }),
  );
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (isLabHost(host)) {
    res.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self' http://builder.dln.local http://dln.local http://localhost:3100 http://127.0.0.1:3100 http://192.168.0.223:3100",
    );
  } else {
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
  }
  return res;
}

function shouldRefresh(pathname: string): boolean {
  if (pathname === "/logout") return false;
  if (pathname.startsWith("/api/auth/login")) return false;
  if (pathname.startsWith("/api/auth/lan-consume")) return false;
  if (pathname.startsWith("/api/epk/enter")) return false;
  if (pathname.startsWith("/api/epk/leave")) return false;
  if (pathname.startsWith("/api/epk/stamp")) return false;
  return true;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const path = req.nextUrl.pathname;
  if (
    !isLabHost(host) &&
    (path === "/board" || path.startsWith("/board/") || path.startsWith("/api/board"))
  ) {
    return withPath(req, new NextResponse("Not Found", { status: 404 }));
  }
  const res = nextWithPath(req);
  if (!shouldRefresh(req.nextUrl.pathname)) return res;
  const proto = req.headers.get("x-forwarded-proto");
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session) {
    appendSessionCookies(res.headers, session, host, proto);
  }
  const epk = req.cookies.get(EPK_COOKIE)?.value;
  if (epk) {
    appendEpkCookies(res.headers, epk, host, proto);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|brief/|plots/).*)",
  ],
};
