import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom } from "@/lib/client-ip";
import { appendEpkCookies } from "@/lib/cookie-opts";
import { isKitId, recordUnlock, takeEpkAttempt } from "@/lib/epk";
import { resolvePressEntry } from "@/lib/epk-content";
import { safeEpkNext } from "@/lib/epk-map";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    code?: string;
    wanted?: string;
    next?: string;
  } | null;
  const code = body?.code?.toString() || "";
  const wanted = body?.wanted?.toString().toLowerCase() || "";
  const ip = clientIpFrom(req.headers);
  const attempt = await takeEpkAttempt(ip);
  if (!attempt.ok) {
    return NextResponse.json({ ok: false, error: "wait" }, { status: 429 });
  }
  const entry = await resolvePressEntry(code);
  if (!entry) {
    return NextResponse.json({ ok: false, error: "code" }, { status: 401 });
  }
  if (wanted && isKitId(wanted) && entry.kit !== wanted) {
    return NextResponse.json({ ok: false, error: "house", kit: entry.kit }, { status: 409 });
  }
  await recordUnlock(entry.kit, ip);
  const next = safeEpkNext(entry.kit, body?.next || entry.next);
  const res = NextResponse.json({ ok: true, kit: entry.kit, next });
  appendEpkCookies(
    res.headers,
    entry.kit,
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
  );
  return res;
}
