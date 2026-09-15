import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { answerAsk, buildEstate } from "@/lib/clock-estate";
import { sessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const hit = await sessionFromRequest();
  if (!hit || !isStudio(hit.user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { q?: string } | null;
  const estate = await buildEstate({
    token: hit.token,
    hostHeader: headers().get("host"),
  });
  return NextResponse.json(answerAsk(String(body?.q || ""), estate));
}
