import { NextRequest, NextResponse } from "next/server";

import { getRequestUser } from "@/lib/session";
import { clientIpFrom } from "@/lib/client-ip";
import { ipIsBlocked } from "@/lib/block";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-dln-ip-gate") !== "watch") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const user = await getRequestUser(req);
  if (user) {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  const ip = clientIpFrom(req.headers);
  if (await ipIsBlocked(ip)) {
    return new NextResponse(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
