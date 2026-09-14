import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { answerAsk, buildEstate } from "@/lib/clock-estate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = cookies().get(COOKIE)?.value || "";
  const user = await userFromSession(token);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { q?: string } | null;
  const estate = await buildEstate({
    token,
    hostHeader: headers().get("host"),
  });
  return NextResponse.json(answerAsk(String(body?.q || ""), estate));
}
