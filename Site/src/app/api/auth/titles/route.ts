import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, userFromSession } from "@/lib/auth";
import { titlesAccessFor } from "@/lib/billing";

export async function GET() {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const access = await titlesAccessFor(user);
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    grant: access.grant,
    paying: access.paying,
    pendingInvoiceId: access.pendingInvoiceId || null,
  });
}
