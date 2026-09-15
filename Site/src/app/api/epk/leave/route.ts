import { NextRequest, NextResponse } from "next/server";
import { appendEpkCookies } from "@/lib/cookie-opts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  appendEpkCookies(
    res.headers,
    "",
    req.headers.get("x-forwarded-host") || req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
    0,
  );
  return res;
}
