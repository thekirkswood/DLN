import { NextRequest, NextResponse } from "next/server";
import { requireLabStudioApi } from "@/lib/lab-guard";
import { createStation, slugFromName } from "@/lib/stations";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    slug?: string;
    party?: "client" | "studio";
  } | null;
  const name = body?.name?.trim() || "";
  const slug = (body?.slug?.trim() || slugFromName(name)).toLowerCase();
  try {
    const made = await createStation({
      slug,
      name,
      party: body?.party === "studio" ? "studio" : "client",
    });
    return NextResponse.json({
      ok: true,
      slug: made.plot.slug,
      housePath: made.housePath,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "exists" ? 409 : 400;
    return NextResponse.json({ ok: false, error: msg || "failed" }, { status });
  }
}
