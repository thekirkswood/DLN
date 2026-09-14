import { NextRequest, NextResponse } from "next/server";
import { requireStudioApi } from "@/lib/lab-guard";
import { isKitId, listKitsPublic, listUnlocks, rotateKitCode } from "@/lib/epk";
import {
  kitCopyDraft,
  resetKitCopy,
  resolvedKitCopy,
  saveKitCopy,
  type KitCopyDraft,
} from "@/lib/epk-copy-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const kits = await listKitsPublic();
  const asked = (req.nextUrl.searchParams.get("kit") || "").trim().toLowerCase();
  if (asked && isKitId(asked)) {
    const profile = await resolvedKitCopy(asked);
    const draft = await kitCopyDraft(asked);
    return NextResponse.json({ ok: true, kit: asked, profile, draft });
  }
  const rows = [];
  for (const kit of kits) {
    const profile = await resolvedKitCopy(kit.id);
    rows.push({
      ...kit,
      kicker: profile.kicker,
      lede: profile.lede,
      bespoke: profile.bespoke,
      editedAt: profile.editedAt || null,
    });
  }
  const unlocks = await listUnlocks();
  return NextResponse.json({ ok: true, kits: rows, unlocks });
}

export async function POST(req: NextRequest) {
  const gate = await requireStudioApi(req);
  if (gate.error) return gate.error;
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    action?: string;
    kicker?: string;
    lede?: string;
    overview?: string[];
    quotes?: string[];
    extra?: string[];
  } | null;
  const id = (body?.id || "").trim().toLowerCase();
  if (!isKitId(id)) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 400 });
  }
  const action = (body?.action || "rotate").trim().toLowerCase();
  if (action === "reset") {
    const profile = await resetKitCopy(id);
    const draft = await kitCopyDraft(id);
    return NextResponse.json({ ok: true, id, profile, draft });
  }
  if (action === "save") {
    const draft: KitCopyDraft = {
      kicker: String(body?.kicker || ""),
      lede: String(body?.lede || ""),
      overview: Array.isArray(body?.overview) ? body.overview.map(String) : [],
      quotes: Array.isArray(body?.quotes) ? body.quotes.map(String) : [],
      extra: Array.isArray(body?.extra) ? body.extra.map(String) : [],
    };
    const profile = await saveKitCopy(id, draft, gate.user.displayName || gate.user.email);
    const next = await kitCopyDraft(id);
    return NextResponse.json({ ok: true, id, profile, draft: next });
  }
  const code = await rotateKitCode(id);
  if (!code) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, id, code });
}
