import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, userFromSession } from "@/lib/auth";
import { buySession } from "@/lib/billing";
import type { Stage } from "@/data/catalogue";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { facet?: string } | null;
  const facet = body?.facet;
  if (facet !== "design" && facet !== "strategy" && facet !== "build") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const inv = await buySession(user, facet as Stage);
    return NextResponse.json({ ok: true, id: inv.id, number: inv.number, status: inv.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "amount" ? 409 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
