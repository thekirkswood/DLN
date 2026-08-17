import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { sweepToPlan } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    userId?: string;
    plotSlug?: string;
  } | null;
  try {
    const plan = await sweepToPlan(user, body || {});
    return NextResponse.json({ ok: true, id: plan.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "empty" ? 400 : msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
