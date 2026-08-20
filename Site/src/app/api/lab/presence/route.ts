import { NextRequest, NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";
import { requireLabStudioApi } from "@/lib/lab-guard";
import {
  holdStudioPresence,
  releaseStudioPresence,
  studioLoggedIn,
} from "@/lib/studio-presence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  return NextResponse.json({ ok: true, active: await studioLoggedIn() });
}

export async function POST(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  }
  const ctype = req.headers.get("content-type") || "";
  let hold = true;
  let page = "";
  if (ctype.includes("form")) {
    const form = await req.formData();
    const h = form.get("hold");
    if (h === "false" || h === "0") hold = false;
    page = String(form.get("page") || "").trim();
  } else {
    const body = (await req.json().catch(() => null)) as {
      hold?: boolean;
      page?: string;
    } | null;
    if (body?.hold === false) hold = false;
    page = body?.page?.trim() || "";
  }
  if (!hold) {
    const seats = await releaseStudioPresence(token);
    return NextResponse.json({ ok: true, seats, active: seats > 0 });
  }
  const result = await holdStudioPresence({
    token,
    userId: gate.user.id,
    name: gate.user.displayName,
    page: page || undefined,
  });
  return NextResponse.json({
    ok: true,
    seats: result.seats,
    started: result.started,
    active: true,
  });
}
