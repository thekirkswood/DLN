import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { saveDraft } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    userId?: string;
    notes?: string;
    lines?: {
      id?: string;
      description?: string;
      amountGbp?: number;
      waived?: boolean;
      presetId?: string;
      cadence?: string;
      plotSlug?: string;
      titlesGrant?: string;
    }[];
  } | null;
  if (!body?.userId || !Array.isArray(body.lines)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const inv = await saveDraft(user, {
      id: body.id,
      userId: body.userId,
      notes: body.notes,
      lines: body.lines,
    });
    return NextResponse.json({ ok: true, id: inv.id, number: inv.number });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : msg === "missing" ? 404 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
