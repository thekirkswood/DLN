import { NextRequest, NextResponse } from "next/server";
import { requireLabStudioApi } from "@/lib/lab-guard";
import {
  addLabMessage,
  listLabMessages,
  saveLabUploads,
  type LabKind,
} from "@/lib/lab-inbox";
import { resolveHouse } from "@/lib/lab";

export const dynamic = "force-dynamic";

const KINDS = new Set<LabKind>(["change", "plan", "note"]);

export async function GET(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const plot = req.nextUrl.searchParams.get("plot") || "dln";
  if (!(await resolveHouse(plot))) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const messages = await listLabMessages(plot);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: NextRequest) {
  const gate = await requireLabStudioApi(req);
  if (gate.error) return gate.error;
  const user = gate.user;

  const ctype = req.headers.get("content-type") || "";
  let plot = "dln";
  let kind: LabKind = "note";
  let text = "";
  let page = "";
  let origin = "";
  let files: File[] = [];

  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData();
    plot = String(form.get("plot") || "dln");
    kind = String(form.get("kind") || "note") as LabKind;
    text = String(form.get("text") || "");
    page = String(form.get("page") || "");
    origin = String(form.get("origin") || "");
    files = form.getAll("files").filter((f): f is File => f instanceof File);
  } else {
    const body = (await req.json().catch(() => null)) as {
      plot?: string;
      kind?: string;
      text?: string;
      page?: string;
      origin?: string;
    } | null;
    plot = body?.plot || "dln";
    kind = (body?.kind || "note") as LabKind;
    text = body?.text || "";
    page = body?.page || "";
    origin = body?.origin || "";
  }

  if (!KINDS.has(kind)) {
    return NextResponse.json({ ok: false, error: "bad kind" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });
  }
  if (!(await resolveHouse(plot))) {
    return NextResponse.json({ ok: false, error: "unknown house" }, { status: 404 });
  }

  const images = files.length ? await saveLabUploads(plot, files) : [];
  const message = await addLabMessage({
    plot,
    author: user.displayName,
    authorId: user.id,
    kind,
    text,
    page: page || undefined,
    origin: origin || req.headers.get("referer") || `/${plot}`,
    images,
  });
  return NextResponse.json({ ok: true, message });
}
