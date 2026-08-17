import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, userFromSession } from "@/lib/auth";
import { addComment } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    plotSlug?: string;
    body?: string;
    page?: string;
    clientId?: string;
  } | null;
  try {
    const row = await addComment(user, body || {});
    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
