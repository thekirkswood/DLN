import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { addComment } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    plotSlug?: string;
    body?: string;
    page?: string;
    clientId?: string;
    kind?: "note" | "hotfix" | "query" | "news";
  } | null;
  try {
    const row = await addComment(user, body || {});
    const hostUp = row.hotfixPing?.some((p) => p.ok) ?? null;
    return NextResponse.json({
      ok: true,
      id: row.id,
      hotfix:
        row.kind === "hotfix"
          ? { actioned: Boolean(row.actioned), hostUp }
          : undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" ? 403 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
