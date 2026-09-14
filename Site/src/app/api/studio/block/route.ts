import { NextRequest, NextResponse } from "next/server";
import { requireStudioApi } from "@/lib/lab-guard";
import { banInstance } from "@/lib/block";
import { clearWatchInstance, listInstances } from "@/lib/watch";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as {
    instanceId?: string;
    clear?: boolean;
  } | null;
  const id = body?.instanceId?.toString() || "";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  if (body?.clear) {
    const row = await clearWatchInstance(id);
    if (!row) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, cleared: true, id: row.id });
  }
  const inst = (await listInstances()).find((row) => row.id === id);
  if (!inst) return NextResponse.json({ ok: false }, { status: 404 });
  const row = await banInstance(inst, "studio");
  return NextResponse.json({ ok: true, id: row.id, ips: row.ips });
}
