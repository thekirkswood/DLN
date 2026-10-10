import { NextResponse } from "next/server";
import { addUploadedAsset, patchAsset } from "@/lib/assets";
import { isStudio } from "@/lib/auth";
import { canEditKit } from "@/lib/epk";
import { vaultKitForPlot } from "@/lib/epk-map";
import { resolveStudioUser, studioCors, studioSpendAllowed } from "@/lib/studio-hub";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 18 * 1024 * 1024;

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: studioCors(request) });
}

export async function POST(request: Request) {
  const cors = studioCors(request);
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false }, { status: 400, headers: cors });
  }
  const ticket = String(form.get("ticket") || "");
  const plotSlug = String(form.get("plotSlug") || "").trim();
  const title = String(form.get("title") || "").trim();
  const user = await resolveStudioUser(ticket);
  if (!user || !plotSlug) {
    return NextResponse.json({ ok: false }, { status: 401, headers: cors });
  }
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: cors });
  }
  const kit = vaultKitForPlot(plotSlug) || plotSlug;
  const flags = {
    ...(form.get("logo") === "1" ? { logo: true } : {}),
    ...(form.get("pack") === "1" ? { pack: true } : {}),
  };
  if (!isStudio(user) && !canEditKit(user, kit)) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 403, headers: cors });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "file" }, { status: 400, headers: cors });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "size" }, { status: 413, headers: cors });
  }
  const item = await addUploadedAsset({
    kit,
    filename: title ? `${title}${extOf(file.name)}` : file.name,
    bytes: Buffer.from(await file.arrayBuffer()),
    flags,
  });
  if (!item) {
    return NextResponse.json({ ok: false, error: "kind" }, { status: 400, headers: cors });
  }
  const named = title ? (await patchAsset({ id: item.id, title })) || item : item;
  return NextResponse.json({ ok: true, item: named }, { headers: cors });
}

function extOf(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  return ext || ".bin";
}
