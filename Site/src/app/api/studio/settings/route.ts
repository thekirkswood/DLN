import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { getSettings, saveSettings, type StudioSettings } from "@/lib/settings";

export async function GET() {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, settings: await getSettings() });
}

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Partial<StudioSettings> | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const settings = await saveSettings(user, body);
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
