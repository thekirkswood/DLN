import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { liveCatalogue, savePrices, saveExtras, type ExtraCharge, type PriceBook } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    prices?: PriceBook;
    extras?: ExtraCharge[];
  } | null;
  const hasPrices = Boolean(body?.prices && typeof body.prices === "object");
  const hasExtras = Array.isArray(body?.extras);
  if (!hasPrices && !hasExtras) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    if (hasExtras) {
      await saveExtras(user, body!.extras!);
    }
    if (hasPrices) {
      await savePrices(user, body!.prices!);
    }
    const catalogue = await liveCatalogue();
    return NextResponse.json({ ok: true, catalogue });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
