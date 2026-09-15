import { NextRequest, NextResponse } from "next/server";
import { canHubLogin, findUserByEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.toString().trim().toLowerCase() || "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: true, onBook: false });
  }
  const user = await findUserByEmail(email);
  const onBook = Boolean(user && canHubLogin(user));
  return NextResponse.json({ ok: true, onBook });
}
