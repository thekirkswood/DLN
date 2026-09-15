import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { boardView, plotForUser, saveBit, addInferenceBit, runBoardPrompt } from "@/lib/board";
import { boardApiStatus, hostOf } from "@/lib/board-gate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  const gate = boardApiStatus(user, hostOf(req));
  if (gate !== "ok" || !user) return NextResponse.json({ ok: false }, { status: gate === "ok" ? 401 : gate });
  const want = req.nextUrl.searchParams.get("plot") || "";
  const plot = await plotForUser(user, want);
  if (!plot) return NextResponse.json({ ok: false, board: null }, { status: 404 });
  const board = await boardView(user, plot);
  return NextResponse.json({ ok: true, board });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  const gate = boardApiStatus(user, hostOf(req));
  if (gate !== "ok" || !user) return NextResponse.json({ ok: false }, { status: gate === "ok" ? 401 : gate });
  const body = (await req.json().catch(() => null)) as {
    plot?: string;
    bitId?: string;
    body?: string;
    addLabel?: string;
    prompt?: string;
  } | null;
  const plot = await plotForUser(user, body?.plot || "");
  if (!plot) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (body?.addLabel) {
    const saved = await addInferenceBit(user, plot, body.addLabel);
    if (!saved) return NextResponse.json({ ok: false }, { status: 400 });
  } else if (body?.prompt) {
    const row = await runBoardPrompt(user, plot, body.prompt);
    if (!row) return NextResponse.json({ ok: false }, { status: 400 });
  } else if (body?.bitId) {
    const saved = await saveBit(user, plot, body.bitId, body.body || "");
    if (!saved) return NextResponse.json({ ok: false }, { status: 400 });
  } else {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const board = await boardView(user, plot);
  return NextResponse.json({ ok: true, board });
}
