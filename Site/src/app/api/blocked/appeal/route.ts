import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom } from "@/lib/client-ip";
import { addAppeal } from "@/lib/appeals";
import { addNotice } from "@/lib/notices";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { why?: string } | null;
  const why = body?.why?.toString() || "";
  try {
    const row = await addAppeal({
      ip: clientIpFrom(req.headers),
      host: req.headers.get("x-forwarded-host") || req.headers.get("host") || "",
      ua: req.headers.get("user-agent") || "",
      why,
    });
    await addNotice({
      kind: "appeal",
      title: `Unblock ask from ${row.ip}`,
      body: row.why,
      ip: row.ip,
      important: false,
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
