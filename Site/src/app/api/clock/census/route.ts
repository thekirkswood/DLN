import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { localCensusPack } from "@/lib/clock-estate";
import { overlaySource } from "@/lib/clock-faces";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const header = req.headers.get("x-dln-session")?.trim();
  const token = cookies().get(COOKIE)?.value || bearer || header || "";
  const user = await userFromSession(token);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { rows, recent } = await localCensusPack();
  const host = req.headers.get("host");
  return NextResponse.json({
    ok: true,
    house: "dln",
    source: overlaySource(host),
    at: new Date().toISOString(),
    rows,
    recent,
  });
}
