import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { titlesAccessFor } from "@/lib/billing";
import { sessionFromRequestOrBearer } from "@/lib/session";

export async function GET(req: NextRequest) {
  const hit = await sessionFromRequestOrBearer(req);
  const user = hit?.user;
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
