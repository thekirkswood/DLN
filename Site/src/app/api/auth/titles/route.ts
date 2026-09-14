import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { titlesAccessFor } from "@/lib/billing";

export async function GET(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const header = req.headers.get("x-dln-session")?.trim();
  const token = cookies().get(COOKIE)?.value || bearer || header || "";
  const user = await userFromSession(token);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const access = await titlesAccessFor(user);
  return NextResponse.json({
    ok: true,
    email: user.email,
    displayName: user.displayName,
    grant: access.grant,
    paying: access.paying,
    pendingInvoiceId: access.pendingInvoiceId || null,
    studio: isStudio(user),
  });
}
