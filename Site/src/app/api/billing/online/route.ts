import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { saveOnlineRail, type OnlineRail } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<OnlineRail> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const rail = await saveOnlineRail(user, body);
    return NextResponse.json({ ok: true, rail });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
