import { NextRequest, NextResponse } from "next/server";
import { requireLabStudioApi } from "@/lib/lab-guard";
import { readLabUpload } from "@/lib/lab-inbox";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const plot = req.nextUrl.searchParams.get("plot") || "";
  const name = req.nextUrl.searchParams.get("name") || "";
  const file = await readLabUpload(plot, name);
  if (!file) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(file.buf), {
    headers: {
      "content-type": file.type,
      "cache-control": "private, max-age=3600",
    },
  });
}
