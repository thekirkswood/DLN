import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { issuePictureTicket, studioOrigin } from "@/lib/studio-hub";
import { grantDueTokens, ledgersVisibleTo, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET() {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await grantDueTokens();
  const [ticket, costs, ledgers] = await Promise.all([
    issuePictureTicket(user),
    tokenCosts(),
    ledgersVisibleTo(user),
  ]);
  return NextResponse.json({
    ok: true,
    ticket,
    origin: studioOrigin(host),
    stillCost: costs.genCost,
    ledgers: ledgers.map((row) => ({
      plotSlug: row.plotSlug,
      balance: row.balance,
      grantedThisPeriod: row.grantedThisPeriod,
    })),
  });
}
