import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { localCensusPack } from "@/lib/clock-estate";
import { overlaySource } from "@/lib/clock-faces";
import { sessionFromRequestOrBearer } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const hit = await sessionFromRequestOrBearer(req);
  const user = hit?.user;
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
