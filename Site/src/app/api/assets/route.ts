import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { getRequestUser } from "@/lib/session";
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
import { KIT_COPY } from "@/lib/epk-copy";
import { canEditKit, kitsForUser, listKitsPublic, listUnlocks } from "@/lib/epk";
import { vaultKitForPlot } from "@/lib/epk-map";
import { ensureEpkOnVault } from "@/lib/epk-vault";
import { epkAssets } from "@/lib/modyu-epk/assets";

type UploadBlob = {
  filename: string;
  mime: string;
  size: number;
  bytes: () => Promise<Buffer>;
};

/** Node 18 on the LAN campus has Blob, not File. Do not write `instanceof File`. */
function asUpload(value: FormDataEntryValue | null): UploadBlob | null {
  if (!value || typeof value === "string") return null;
  const blob = value as {
    name?: unknown;
    type?: unknown;
    size?: unknown;
    arrayBuffer?: unknown;
  };
  if (typeof blob.arrayBuffer !== "function") return null;
  return {
    filename: typeof blob.name === "string" && blob.name ? blob.name : "upload",
    mime: typeof blob.type === "string" ? blob.type : "",
    size: typeof blob.size === "number" ? blob.size : 0,
    bytes: async () => Buffer.from(await (blob.arrayBuffer as () => Promise<ArrayBuffer>)()),
  };
}

function namedUpload(name: string, mime: string): string {
  const raw = (name || "").trim() || "upload";
  if (path.extname(raw)) return raw;
  const ext =
    mime === "image/png"
      ? ".png"
      : mime === "image/jpeg" || mime === "image/jpg"
        ? ".jpg"
        : mime === "image/webp"
          ? ".webp"
          : mime === "image/gif"
            ? ".gif"
            : mime === "image/svg+xml"
              ? ".svg"
              : mime === "application/pdf"
                ? ".pdf"
                : mime === "text/plain"
                  ? ".txt"
                  : mime === "text/markdown"
                    ? ".md"
                    : "";
  return `${raw}${ext}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 18 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  const seed = req.nextUrl.searchParams.get("seed") === "1" && isStudio(user);
  try {
    await ensureEpkOnVault("modyu", epkAssets);
  } catch {
    /* listing still works */
  }
  const index = seed ? await seedAssets() : await listAssets();
  const allowed = new Set(kitsForUser(user));
  const askedRaw = (req.nextUrl.searchParams.get("kit") || "").trim().toLowerCase();
  const asked = askedRaw ? vaultKitForPlot(askedRaw) || askedRaw : "";
  const items = index.items.filter((item) => {
    if (!item.kit) return false;
    if (asked) {
      if (item.kit !== asked) return false;
      return isStudio(user) || allowed.has(asked);
    }
    return isStudio(user) || allowed.has(item.kit);
  });
  let kits = (await listKitsPublic()).filter((k) => allowed.has(k.id));
  if (!kits.length && allowed.size) {
    kits = KIT_COPY.filter((k) => allowed.has(k.id)).map((k) => ({
      id: k.id,
      name: k.name,
      createdAt: "",
    }));
  }
  const unlocks = isStudio(user) ? await listUnlocks() : [];
  const kitOk = Boolean(asked && (allowed.has(asked) || isStudio(user)));
  return NextResponse.json({
    ok: true,
    items,
    kits,
    unlocks,
    kit: kitOk ? asked : undefined,
    studio: isStudio(user),
    you: user.displayName || user.email,
  });
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    const kit = String(form.get("kit") || "").trim().toLowerCase();
    if (!canEditKit(user, kit)) {
      return NextResponse.json({ ok: false, error: "kit" }, { status: 403 });
    }
    const file = asUpload(form.get("file"));
    if (!file) {
      return NextResponse.json({ ok: false, error: "file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "size" }, { status: 413 });
    }
    const filename = namedUpload(file.filename, file.mime);
    const bytes = await file.bytes();
    const share = String(form.get("share") || "") === "1";
    const logo = String(form.get("logo") || "") === "1";
    const pack = String(form.get("pack") || "") === "1";
    const people = String(form.get("people") || "") === "1";
    const promo = String(form.get("promo") || "") === "1";
    const banner = String(form.get("banner") || "") === "1";
    const flags: AssetFlags = {
      ...(share || logo || pack || people || promo || banner ? { share: true } : {}),
      ...(logo ? { logo: true } : {}),
      ...(pack ? { pack: true } : {}),
      ...(people ? { people: true } : {}),
      ...(promo ? { promo: true } : {}),
      ...(banner ? { banner: true } : {}),
    };
    const item = await addUploadedAsset({
      kit,
      filename,
      bytes,
      flags,
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
