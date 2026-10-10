import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { addCapture, listCaptures } from "@/lib/captures";
import { grantDueTokens } from "@/lib/tokens";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const plot = req.nextUrl.searchParams.get("plot") || undefined;
  const rows = await listCaptures(user, plot);
  return NextResponse.json({
    ok: true,
    captures: rows.map((row) => ({
      id: row.id,
      t: row.t,
      plotSlug: row.plotSlug,
      kind: row.kind,
      text: row.text.slice(0, 400),
      files: row.files.map((f) => ({ name: f.name, type: f.type, bytes: f.bytes })),
      pace: row.pace,
      status: row.status,
      tokensSpent: row.tokensSpent,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await grantDueTokens();
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false }, { status: 400 });
  const plotSlug = String(form.get("plotSlug") || "");
  const text = String(form.get("text") || "");
  const page = String(form.get("page") || "").trim();
  const pace = form.get("pace") === "now" ? "now" : "sweep";
  const blobs = form.getAll("files");
  const files: { name: string; type: string; buf: Buffer }[] = [];
  for (const item of blobs) {
    if (typeof item === "string") continue;
    const buf = Buffer.from(await item.arrayBuffer());
    files.push({ name: item.name || "file", type: item.type || "", buf });
  }
  try {
    const row = await addCapture(user, {
      plotSlug,
      text,
      pace,
      files,
      page: page || undefined,
    });
    return NextResponse.json({ ok: true, id: row.id, tokensSpent: row.tokensSpent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status =
      msg === "forbidden" ? 403 : msg === "balance" ? 402 : msg === "shut" ? 402 : 400;
    return NextResponse.json({ ok: false, error: msg || "invalid" }, { status });
  }
}
