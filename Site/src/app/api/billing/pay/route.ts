import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, userFromSession } from "@/lib/auth";
import { payInvoice } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { invoiceId?: string } | null;
  const invoiceId = body?.invoiceId?.toString() || "";
  if (!invoiceId) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const inv = await payInvoice(user, invoiceId);
    return NextResponse.json({ ok: true, id: inv.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
