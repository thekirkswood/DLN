import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { buildEstate } from "@/lib/clock-estate";
import { emitClock } from "@/lib/clock-store";
import { sessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const hit = await sessionFromRequest();
  if (!hit || !isStudio(hit.user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await emitClock({
    house: "dln",
    host: "lab",
    plane: "studio",
    kind: "studio.clock.open",
    actor: hit.user.email,
    summary: `${hit.user.displayName} opened the overlay`,
  });
  const estate = await buildEstate({
    token: hit.token,
    hostHeader: headers().get("host"),
  });
  return NextResponse.json(estate);
}
