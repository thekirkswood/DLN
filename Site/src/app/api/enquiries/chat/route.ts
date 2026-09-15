import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { addEnquiryMessage, enquiryById } from "@/lib/enquiries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    text?: string;
    email?: string;
  } | null;
  const id = body?.id?.trim() || "";
  const text = body?.text?.toString() || "";
  const user = await getSessionUser();
  const studio = Boolean(user && isStudio(user));
  try {
    const row = await addEnquiryMessage({
      id,
      from: studio ? "campus" : "visitor",
      text,
      email: studio ? undefined : body?.email,
    });
    return NextResponse.json({ ok: true, thread: row.thread });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const email = (req.nextUrl.searchParams.get("email") || "").toLowerCase();
  const user = await getSessionUser();
  const row = await enquiryById(id);
  if (!row) return NextResponse.json({ ok: false }, { status: 404 });
  const studio = Boolean(user && isStudio(user));
  if (!studio && row.email.toLowerCase() !== email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, thread: row.thread || [] });
}
