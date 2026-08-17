import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { convertToTitles } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    userId?: string;
    grant?: string;
    waived?: boolean;
  } | null;
  const userId = body?.userId?.toString() || "";
  const grant = body?.grant;
  if (!userId || (grant !== "section" && grant !== "full")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const inv = await convertToTitles(user, userId, grant, Boolean(body?.waived));
    return NextResponse.json({ ok: true, id: inv.id, status: inv.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
