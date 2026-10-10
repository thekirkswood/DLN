import { NextResponse } from "next/server";
import { spendTokens, tokenCosts } from "@/lib/tokens";
import { studioCors, studioSpendAllowed, userFromPictureTicket } from "@/lib/studio-hub";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: studioCors(request) });
}

export async function POST(request: Request) {
  const cors = studioCors(request);
  const body = (await request.json().catch(() => ({}))) as {
    ticket?: string;
    plotSlug?: string;
    reason?: string;
  };
  const user = await userFromPictureTicket(String(body.ticket || ""));
  const plotSlug = String(body.plotSlug || "").trim();
  if (!user || !plotSlug) {
    return NextResponse.json({ ok: false, error: "ticket" }, { status: 401, headers: cors });
  }
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403, headers: cors });
  }
  const costs = await tokenCosts();
  const spent = await spendTokens({
    user,
    plotSlug,
    n: costs.genCost,
    k: "gen",
    reason: String(body.reason || "Studio still").slice(0, 160),
  });
  if (!spent.ok) {
    return NextResponse.json({ ok: false, error: spent.error }, { status: 402, headers: cors });
  }
  return NextResponse.json(
    { ok: true, balance: spent.balance, spent: costs.genCost },
    { headers: cors },
  );
}
