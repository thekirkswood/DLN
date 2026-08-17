import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { voidInvoice } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.toString() || "";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const inv = await voidInvoice(user, id);
    return NextResponse.json({ ok: true, id: inv.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
