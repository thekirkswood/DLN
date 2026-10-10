import { NextResponse } from "next/server";
import { steerPicture, type PictureAttach, type PictureExtras, type SteerMode } from "@/lib/picture-steer";
import { resolveStudioUser } from "@/lib/studio-hub";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    ticket?: string;
    prompt?: string;
    mode?: SteerMode;
    extras?: PictureExtras;
    attaches?: PictureAttach[];
  };
  const user = await resolveStudioUser(body.ticket);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const line = String(body.prompt || "").trim();
  if (!line) return NextResponse.json({ ok: false, error: "Type a prompt" }, { status: 400 });
  return NextResponse.json({
    ok: true,
    steered: steerPicture(line, {
      mode: body.mode,
      extras: body.extras,
      attaches: body.attaches,
    }),
  });
}
