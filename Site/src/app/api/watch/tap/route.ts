import { NextRequest, NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";
import { clientIpFrom } from "@/lib/trap";
import { ipIsBlocked, noteBlockedHit } from "@/lib/block";
import { looksLikeProbe } from "@/lib/trap-paths";
import { WATCH_COOKIE, tapWatch } from "@/lib/watch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const path =
    req.headers.get("x-dln-watch-path") ||
    req.nextUrl.searchParams.get("p") ||
    "";
  const ip = clientIpFrom(req.headers);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const ua = req.headers.get("user-agent") || "";
  if (await ipIsBlocked(ip)) {
    await noteBlockedHit({
      ip,
      host,
      path,
      ua,
      trap: looksLikeProbe(path),
    });
    return new NextResponse(null, { status: 204 });
  }
  await tapWatch({
    ip,
    host,
    path,
    ua,
    cookie: req.cookies.get(WATCH_COOKIE)?.value === "1",
    token: req.cookies.get(COOKIE)?.value,
  });
  return new NextResponse(null, { status: 204 });
}
