import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { savePayRail, type PayRail } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<PayRail> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const rail = await savePayRail(user, body);
    return NextResponse.json({ ok: true, rail });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
