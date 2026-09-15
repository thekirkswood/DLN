import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { closeEnquiry } from "@/lib/enquiries";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id?.toString() || "";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await closeEnquiry(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
