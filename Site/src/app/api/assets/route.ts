import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import {
  addAssetComment,
  addTextAsset,
  addUploadedAsset,
  deleteAsset,
  listAssets,
  patchAsset,
  seedAssets,
  type AssetFlags,
} from "@/lib/assets";
import { canDeleteHref } from "@/lib/assets-view";
import { canEditKit, isKitId, kitsForUser, listKitsPublic, listUnlocks } from "@/lib/epk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 18 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  const seed = req.nextUrl.searchParams.get("seed") === "1" && isStudio(user);
  const index = seed ? await seedAssets() : await listAssets();
  const allowed = new Set(kitsForUser(user));
  const asked = (req.nextUrl.searchParams.get("kit") || "").trim().toLowerCase();
  const items = index.items.filter((item) => item.kit && allowed.has(item.kit));
  const kits = (await listKitsPublic()).filter((k) => allowed.has(k.id));
  const unlocks = isStudio(user) ? await listUnlocks() : [];
  return NextResponse.json({
    ok: true,
    items: asked && isKitId(asked) ? items.filter((i) => i.kit === asked) : items,
    kits,
    unlocks,
    kit: asked && allowed.has(asked) ? asked : undefined,
    studio: isStudio(user),
    you: user.displayName || user.email,
  });
}

export async function POST(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    const kit = String(form.get("kit") || "").trim().toLowerCase();
    if (!canEditKit(user, kit)) {
      return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "size" }, { status: 413 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const share = String(form.get("share") || "") === "1";
    const item = await addUploadedAsset({
      kit,
      filename: file.name,
      bytes,
      flags: share ? { share: true } : {},
    });
    if (!item) return NextResponse.json({ ok: false, error: "kind" }, { status: 400 });
    return NextResponse.json({ ok: true, item });
  }
  const body = (await req.json().catch(() => null)) as {
    action?: string;
    id?: string;
    flags?: AssetFlags;
    star?: boolean;
    note?: string;
    title?: string;
    kit?: string | null;
    body?: string;
  } | null;
  if (!body) return NextResponse.json({ ok: false, error: "body" }, { status: 400 });

  if (body.action === "text") {
    const kit = String(body.kit || "").trim().toLowerCase();
    if (!canEditKit(user, kit)) {
      return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
    }
    const item = await addTextAsset({
      kit,
      title: String(body.title || "").trim() || "Note",
      body: String(body.body || ""),
    });
    if (!item) return NextResponse.json({ ok: false, error: "text" }, { status: 400 });
    return NextResponse.json({ ok: true, item });
  }

  if (!body.id) return NextResponse.json({ ok: false, error: "id" }, { status: 400 });
  const index = await listAssets();
  const current = index.items.find((i) => i.id === body.id);
  if (!current?.kit || !canEditKit(user, current.kit)) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
  }

  if (body.action === "delete") {
    if (!canDeleteHref(current.href)) {
      return NextResponse.json({ ok: false, error: "library" }, { status: 403 });
    }
    const ok = await deleteAsset(current.id);
    if (!ok) return NextResponse.json({ ok: false }, { status: 400 });
    return NextResponse.json({ ok: true, id: current.id });
  }

  if (body.action === "comment") {
    const item = await addAssetComment({
      id: current.id,
      body: String(body.body || ""),
      by: user.displayName || user.email,
    });
    if (!item) return NextResponse.json({ ok: false, error: "comment" }, { status: 400 });
    return NextResponse.json({ ok: true, item });
  }

  const nextKit = body.kit === undefined ? current.kit : body.kit;
  if (nextKit && !canEditKit(user, nextKit) && !isStudio(user)) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
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
