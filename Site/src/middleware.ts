import { NextRequest, NextResponse } from "next/server";
import { isLabHost } from "@/lib/lab-host";

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

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const path = req.nextUrl.pathname;
  if (
    !isLabHost(host) &&
    (path === "/board" || path.startsWith("/board/") || path.startsWith("/api/board"))
  ) {
    return withPath(req, new NextResponse("Not Found", { status: 404 }));
  }
  return nextWithPath(req);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|brief/|plots/).*)",
  ],
};
