import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { createEnquiry, updateEnquiry } from "@/lib/enquiries";

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

export async function PATCH(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  } | null;
  const id = body?.id?.trim() || "";
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const row = await updateEnquiry(id, {
      name: body?.name,
      email: body?.email,
      phone: body?.phone,
      message: body?.message,
    });
    return NextResponse.json({ ok: true, enquiry: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
