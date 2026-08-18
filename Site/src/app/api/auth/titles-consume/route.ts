import { NextRequest, NextResponse } from "next/server";
import { consumeHandoff } from "@/lib/titles-handoff";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim() || "";
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });
  const token = await consumeHandoff(code);
  if (!token) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, token });
}
