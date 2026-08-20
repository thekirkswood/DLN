import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, findUserById, userFromSession } from "@/lib/auth";
import {
  addDossierResource,
  getDossier,
  removeDossierResource,
  saveDossierWho,
  type DossierStage,
} from "@/lib/dossiers";

async function studio() {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!(await studio())) return NextResponse.json({ ok: false }, { status: 401 });
  const userId = req.nextUrl.searchParams.get("userId")?.trim() || "";
  const person = userId ? await findUserById(userId) : null;
  if (!person || person.role === "owner" || person.role === "studio") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const dossier = await getDossier(userId);
  return NextResponse.json({ ok: true, dossier });
}

export async function POST(req: NextRequest) {
  if (!(await studio())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    userId?: string;
    who?: string;
    title?: string;
    stage?: DossierStage;
    url?: string;
    note?: string;
    removeId?: string;
  } | null;
  const userId = body?.userId?.trim() || "";
  const person = userId ? await findUserById(userId) : null;
  if (!person || person.role === "owner" || person.role === "studio") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    if (typeof body?.who === "string" && !body.title && !body.removeId) {
      const dossier = await saveDossierWho(userId, body.who);
      return NextResponse.json({ ok: true, dossier });
    }
    if (body?.removeId) {
      const dossier = await removeDossierResource(userId, body.removeId);
      return NextResponse.json({ ok: true, dossier });
    }
    const dossier = await addDossierResource(userId, {
      stage: body?.stage || "apes",
      title: body?.title || "",
      url: body?.url,
      note: body?.note,
    });
    return NextResponse.json({ ok: true, dossier });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
