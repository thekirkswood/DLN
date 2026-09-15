import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { boardView, issueMailbox, plotForUser } from "@/lib/board";
import { boardApiStatus, hostOf } from "@/lib/board-gate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  const gate = boardApiStatus(user, hostOf(req));
  if (gate !== "ok" || !user) {
    return NextResponse.json({ ok: false }, { status: gate === "ok" ? 401 : gate });
  }
  const body = (await req.json().catch(() => null)) as { plot?: string } | null;
  const plot = await plotForUser(user, body?.plot || "");
  if (!plot) return NextResponse.json({ ok: false }, { status: 400 });
  const mailbox = await issueMailbox(user, plot);
  if (!mailbox) return NextResponse.json({ ok: false }, { status: 400 });
  const board = await boardView(user, plot);
  return NextResponse.json({ ok: true, board });
}
