import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { assetsPublicDir } from "@/lib/assets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function GET(_req: Request, ctx: { params: { path: string[] } }) {
  const rel = (ctx.params.path || []).join("/");
  if (!rel || rel.includes("..") || rel.includes("\0")) {
    return new NextResponse(null, { status: 404 });
  }
  const root = path.resolve(assetsPublicDir(), "press");
  const disk = path.resolve(root, rel);
  if (disk !== root && !disk.startsWith(`${root}${path.sep}`)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const bytes = await readFile(disk);
    const ext = path.extname(disk).toLowerCase();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=0",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
