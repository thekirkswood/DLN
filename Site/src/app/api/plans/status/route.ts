import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { setPlanStatus, type BuildPlan } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    status?: BuildPlan["status"];
  } | null;
  try {
    const plan = await setPlanStatus(user, body || {});
    return NextResponse.json({ ok: true, id: plan.id, status: plan.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
