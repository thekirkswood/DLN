import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { buildEstate } from "@/lib/clock-estate";
import { emitClock } from "@/lib/clock-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(COOKIE)?.value || "";
  const user = await userFromSession(token);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await emitClock({
    house: "dln",
    host: "lab",
    plane: "studio",
    kind: "studio.clock.open",
    actor: user.email,
    summary: `${user.displayName} opened the overlay`,
  });
  const estate = await buildEstate({
    token,
    hostHeader: headers().get("host"),
  });
  return NextResponse.json(estate);
}
