import { NextRequest, NextResponse } from "next/server";
import { requireStudioApi } from "@/lib/lab-guard";
import { listAssets, patchAsset, seedAssets } from "@/lib/assets";
import { listKitsPublic, listUnlocks } from "@/lib/epk";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const seed = req.nextUrl.searchParams.get("seed") === "1";
  const index = seed ? await seedAssets() : await listAssets();
  const kits = await listKitsPublic();
  const unlocks = await listUnlocks();
  return NextResponse.json({ ok: true, items: index.items, kits, unlocks });
}

export async function POST(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    flags?: { logo?: boolean; banner?: boolean; post?: boolean; pack?: boolean };
    star?: boolean;
    note?: string;
    title?: string;
    kit?: string | null;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ ok: false, error: "id" }, { status: 400 });
  }
  const item = await patchAsset({
    id: body.id,
    flags: body.flags,
    star: body.star,
    note: body.note,
    title: body.title,
    kit: body.kit,
  });
  if (!item) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}
