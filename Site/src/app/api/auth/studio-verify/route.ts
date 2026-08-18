import { NextRequest, NextResponse } from "next/server";
import { verifyStudioLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Plot login forms call this server-side.
 * Only Design Lab North owner/studio succeed. Client accounts on this book do not.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.toString() ?? "";
  const password = body?.password?.toString() ?? "";
  if (!email || !password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const user = await verifyStudioLogin(email, password);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    studio: true,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  });
}
