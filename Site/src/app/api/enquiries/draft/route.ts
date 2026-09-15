import { NextRequest, NextResponse } from "next/server";
import { sendDraft, upsertDraft } from "@/lib/enquiries";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    needId?: string;
    message?: string;
    send?: boolean;
  } | null;
  try {
    if (body?.send && body.id) {
      const row = await sendDraft(body.id);
      return NextResponse.json({ ok: true, id: row.id, held: true });
    }
    const row = await upsertDraft(body || {});
    return NextResponse.json({ ok: true, id: row.id, held: false });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
