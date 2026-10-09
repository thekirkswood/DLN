import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { grantDueTokens, ledgersVisibleTo, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await grantDueTokens();
  const [ledgers, costs] = await Promise.all([ledgersVisibleTo(user), tokenCosts()]);
  return NextResponse.json({
    ok: true,
    pingCost: costs.pingCost,
    genCost: costs.genCost,
    grants: costs.grants,
    ledgers: ledgers.map((row) => ({
      plotSlug: row.plotSlug,
      stack: row.stack,
      balance: row.balance,
      period: row.period,
      grantedThisPeriod: row.grantedThisPeriod,
    })),
  });
}
