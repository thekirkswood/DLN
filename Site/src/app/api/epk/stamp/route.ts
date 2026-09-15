import { NextRequest, NextResponse } from "next/server";

import { getRequestUser } from "@/lib/session";
import { appendEpkCookies } from "@/lib/cookie-opts";
import { canViewKit, isKitId } from "@/lib/epk";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  const body = (await req.json().catch(() => null)) as { kit?: string } | null;
  const kit = (body?.kit || "").trim().toLowerCase();
  if (!isKitId(kit) || !canViewKit(user, kit)) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, kit });
  appendEpkCookies(
    res.headers,
    kit,
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
  );
  return res;
}
