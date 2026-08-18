import { NextRequest, NextResponse } from "next/server";
import { requireLabStudioApi } from "@/lib/lab-guard";
import {
  armIdleSweep,
  ensureHouse,
  holdHouse,
  houseRunStatus,
  listHouseRuns,
  occupancyOf,
  releaseHouse,
} from "@/lib/lab-runner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  armIdleSweep();
  const houses = await listHouseRuns();
  return NextResponse.json({ ok: true, houses });
}

export async function POST(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  armIdleSweep();
  const ctype = req.headers.get("content-type") || "";
  let slug = "";
  let lease = "";
  let hold: boolean | undefined;
  let start: boolean | undefined;
  if (ctype.includes("form")) {
    const form = await req.formData();
    slug = String(form.get("slug") || "").trim();
    lease = String(form.get("lease") || "").trim();
    const h = form.get("hold");
    const s = form.get("start");
    if (h === "false" || h === "0") hold = false;
    else if (h === "true" || h === "1") hold = true;
    if (s === "false" || s === "0") start = false;
    else if (s === "true" || s === "1") start = true;
  } else {
    const body = (await req.json().catch(() => null)) as {
      slug?: string;
      lease?: string;
      hold?: boolean;
      start?: boolean;
    } | null;
    slug = body?.slug?.trim() || "";
    lease = body?.lease?.trim() || "";
    hold = body?.hold;
    start = body?.start;
  }
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  if (hold === false && lease) {
    const occupancy = releaseHouse(slug, lease);
    const house = await houseRunStatus(slug);
    return NextResponse.json({ ok: true, house, occupancy });
  }

  if (lease) holdHouse(slug, lease);

  const shouldStart = start !== false;
  const occ = occupancyOf(slug);
  const house =
    occ > 0 || shouldStart ? await ensureHouse(slug) : await houseRunStatus(slug);
  return NextResponse.json({
    ok: house.status === "ready" || (!shouldStart && occ === 0),
    house,
    occupancy: occupancyOf(slug),
  });
}
