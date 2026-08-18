import { NextRequest, NextResponse } from "next/server";
import { proxyLab } from "@/lib/lab-proxy";
import { isLabHost } from "@/lib/lab-host";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: { slug: string; path?: string[] } };

async function handle(req: NextRequest, ctx: Ctx) {
  if (!isLabHost(req.headers.get("host"))) {
    return new NextResponse(null, { status: 404 });
  }
  return proxyLab(req, ctx.params.slug, ctx.params.path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
