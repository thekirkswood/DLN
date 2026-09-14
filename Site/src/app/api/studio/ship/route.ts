import { NextRequest, NextResponse } from "next/server";
import { requireStudioApi } from "@/lib/lab-guard";
import { queueShip, SHIP_PHRASE, type ShipKind } from "@/lib/ship-queue";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as {
    kind?: string;
    confirm?: string;
    notes?: string;
  } | null;
  const kind: ShipKind | "" =
    body?.kind === "hotfix" ? "hotfix" : body?.kind === "ship" ? "ship" : "";
  if (!kind) {
    return NextResponse.json({ ok: false, error: "ship or hotfix" }, { status: 400 });
  }
  try {
    const queued = await queueShip({
      kind,
      confirm: body?.confirm || "",
      notes: body?.notes || "",
      author: gate.user.displayName,
      authorId: gate.user.id,
    });
    return NextResponse.json({ ok: true, ...queued, phrase: SHIP_PHRASE[kind] });
  } catch (err) {
    const why = err instanceof Error ? err.message : "queue failed";
    return NextResponse.json({ ok: false, error: why }, { status: 400 });
  }
}
