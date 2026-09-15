import { NextRequest, NextResponse } from "next/server";
import { consumeDksHandoff } from "@/lib/dks-handoff";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim() || "";
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });
  const token = await consumeDksHandoff(code);
  if (!token) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, token });
}
