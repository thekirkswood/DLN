import { NextRequest, NextResponse } from "next/server";
import { createEnquiry } from "@/lib/enquiries";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    phone?: string;
    needId?: string;
    message?: string;
  } | null;
  try {
    const row = await createEnquiry(body || {});
    return NextResponse.json({ ok: true, id: row.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
