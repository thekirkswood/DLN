import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { grantDueTokens, ledgerFor, ledgersVisibleTo, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await grantDueTokens();
  const plot = (req.nextUrl.searchParams.get("plot") || "").trim();
  const [all, costs] = await Promise.all([ledgersVisibleTo(user), tokenCosts()]);
  const wallet = plot ? await ledgerFor(user, plot) : null;
  const ledgers = wallet ? [wallet] : all;
  return NextResponse.json({
    ok: true,
    pingCost: costs.pingCost,
    genCost: costs.genCost,
    textCost: costs.textCost,
    grants: costs.grants,
    ledgers: ledgers.map((row) => ({
      plotSlug: plot || row.plotSlug,
      stack: row.stack,
      balance: row.balance,
      period: row.period,
      grantedThisPeriod: row.grantedThisPeriod,
    })),
  });
}
