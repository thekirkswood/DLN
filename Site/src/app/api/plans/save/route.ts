import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { savePlan } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    title?: string;
    body?: string;
    patchNotes?: string;
  } | null;
  try {
    const plan = await savePlan(user, body || {});
    return NextResponse.json({ ok: true, id: plan.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
