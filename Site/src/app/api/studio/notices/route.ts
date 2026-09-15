import { NextRequest, NextResponse } from "next/server";
import { requireLabStudioApi } from "@/lib/lab-guard";
import { listNotices, markNoticeRead } from "@/lib/notices";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  return NextResponse.json({ notices: await listNotices() });
}

export async function POST(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.toString() || "";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const row = await markNoticeRead(id);
  if (!row) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, id: row.id });
}
