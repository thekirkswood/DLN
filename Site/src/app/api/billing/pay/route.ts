import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { claimPayment, clearPayment } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    invoiceId?: string;
    action?: string;
    method?: string;
  } | null;
  const invoiceId = body?.invoiceId?.toString() || "";
  const action = body?.action === "clear" ? "clear" : "claim";
  if (!invoiceId) return NextResponse.json({ ok: false }, { status: 400 });
  if (action === "clear" && !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  try {
    if (action === "claim" && body?.method === "online") {
      const { onlineProviderLive } = await import("@/lib/billing");
      if (!onlineProviderLive()) {
        return NextResponse.json({ ok: false, error: "soon" }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: "soon" }, { status: 409 });
    }
    const method =
      body?.method === "online" || body?.method === "bank" ? body.method : undefined;
    const inv =
      action === "clear"
        ? await clearPayment(user, invoiceId, method)
        : await claimPayment(user, invoiceId);
    return NextResponse.json({ ok: true, id: inv.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
