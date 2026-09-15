import { NextRequest, NextResponse } from "next/server";
import { readBest, recordBest } from "@/lib/cut";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const best = await readBest();
  return NextResponse.json({ ok: true, ms: best?.ms ?? null });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { ms?: number } | null;
  const best = await recordBest(Number(body?.ms));
  return NextResponse.json({ ok: true, ms: best?.ms ?? null });
}
