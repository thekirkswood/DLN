import { NextRequest, NextResponse } from "next/server";
import { sessionTokensFromHeader } from "@/lib/cookie-opts";
import { isTrapPath, looksLikeProbe } from "@/lib/trap-paths";
import { clientIpFrom, recordTrip } from "@/lib/trap";
import { setWatchCookie } from "@/lib/watch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function gone(req: NextRequest) {
  const res = new NextResponse(null, {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
  setWatchCookie(res, req.headers.get("x-forwarded-proto"));
  return res;
}

async function catchTrip(req: NextRequest) {
  const path =
    req.headers.get("x-dln-trap-path") ||
    req.nextUrl.searchParams.get("p") ||
    req.nextUrl.pathname;
  if (!isTrapPath(path) && !looksLikeProbe(path) && !req.headers.get("x-dln-trap-path")) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  await recordTrip({
    ip: clientIpFrom(req.headers),
    host,
    path,
    ua: req.headers.get("user-agent") || "",
    token: sessionTokensFromHeader(req.headers.get("cookie"))[0],
  });
  return gone(req);
}

export async function GET(req: NextRequest) {
  return catchTrip(req);
}

export async function HEAD(req: NextRequest) {
  return catchTrip(req);
}

export async function POST(req: NextRequest) {
  return catchTrip(req);
}
