import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { canEditKit, canViewKit, isKitId } from "@/lib/epk";
import {
  deletePromo,
  deleteStory,
  loadKitContent,
  rotatePromoCode,
  saveKitFrame,
  saveKitOverview,
  setPieceLive,
  upsertPromo,
  upsertStory,
  type KitCover,
  type KitShown,
} from "@/lib/epk-content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  const kit = (req.nextUrl.searchParams.get("kit") || "").trim().toLowerCase();
  if (!isKitId(kit)) return NextResponse.json({ ok: false, error: "kit" }, { status: 400 });
  const cookieKit = req.cookies.get("dln_epk")?.value;
  if (!canViewKit(user, kit) && cookieKit !== kit) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 401 });
  }
  const content = await loadKitContent(kit);
  const studio = Boolean(user && isStudio(user));
  const promos = content.promos.map((p) => ({
    ...p,
    codeHash: undefined,
    hasCode: Boolean(p.codeHash),
  }));
  return NextResponse.json({ ok: true, content: { ...content, promos }, canEdit: canEditKit(user, kit), studio });
}

export async function POST(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    kit?: string;
    action?: string;
    id?: string;
    title?: string;
    body?: string;
    imageHref?: string;
    overview?: string[];
    freshCode?: boolean;
    cover?: KitCover;
    shown?: KitShown;
    live?: boolean;
    kind?: "story" | "promo";
  } | null;
  const kit = (body?.kit || "").trim().toLowerCase();
  if (!canEditKit(user, kit)) return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
  const action = (body?.action || "").trim();
  if (action === "overview") {
    const content = await saveKitOverview(kit, body?.overview || []);
    return NextResponse.json({ ok: true, content });
  }
  if (action === "frame") {
    const content = await saveKitFrame(kit, { cover: body?.cover, shown: body?.shown });
    return NextResponse.json({ ok: true, content });
  }
  if (action === "live") {
    const kind = body?.kind === "promo" ? "promo" : "story";
    const ok = await setPieceLive(kit, kind, String(body?.id || ""), Boolean(body?.live));
    return NextResponse.json({ ok });
  }
  if (action === "story") {
    const story = await upsertStory(kit, {
      id: body?.id,
      title: String(body?.title || ""),
      body: String(body?.body || ""),
      imageHref: body?.imageHref,
    });
    return NextResponse.json({ ok: true, story });
  }
  if (action === "delete-story") {
    const ok = await deleteStory(kit, String(body?.id || ""));
    return NextResponse.json({ ok });
  }
  if (action === "promo") {
    const { promo, code } = await upsertPromo(kit, {
      id: body?.id,
      title: String(body?.title || ""),
      body: String(body?.body || ""),
      imageHref: body?.imageHref,
      freshCode: body?.freshCode,
    });
    return NextResponse.json({ ok: true, promo: { ...promo, codeHash: undefined, hasCode: Boolean(promo.codeHash) }, code });
  }
  if (action === "delete-promo") {
    const ok = await deletePromo(kit, String(body?.id || ""));
    return NextResponse.json({ ok });
  }
  if (action === "rotate-promo") {
    const code = await rotatePromoCode(kit, String(body?.id || ""));
    if (!code) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, code });
  }
  return NextResponse.json({ ok: false, error: "action" }, { status: 400 });
}
