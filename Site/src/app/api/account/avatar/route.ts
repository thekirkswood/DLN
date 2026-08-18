import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  AVATARS,
  COOKIE,
  findUserById,
  isStudio,
  setAvatar,
  userFromSession,
} from "@/lib/auth";

const MAX = 8_000_000;
const EXTS = ["jpg", "jpeg", "png", "webp"] as const;

function sniff(buf: Buffer, declared: string): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  if (
    buf.length >= 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return byType[declared] || null;
}

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const blob = form?.get("file");
  if (!(blob instanceof Blob) || !blob.size) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (blob.size > MAX) return NextResponse.json({ ok: false }, { status: 400 });

  const asked = String(form?.get("userId") || "").trim();
  let targetId = user.id;
  if (asked && asked !== user.id) {
    if (!isStudio(user)) return NextResponse.json({ ok: false }, { status: 403 });
    const person = await findUserById(asked);
    if (!person) return NextResponse.json({ ok: false }, { status: 404 });
    targetId = person.id;
  }

  const buf = Buffer.from(await blob.arrayBuffer());
  const ext = sniff(buf, blob.type);
  if (!ext) return NextResponse.json({ ok: false }, { status: 400 });

  await fs.mkdir(AVATARS, { recursive: true });
  const filename = `${targetId}.${ext}`;
  await fs.writeFile(path.join(AVATARS, filename), buf);
  for (const other of EXTS) {
    if (other === ext) continue;
    await fs.unlink(path.join(AVATARS, `${targetId}.${other}`)).catch(() => {});
  }
  await setAvatar(targetId, filename);
  return NextResponse.json({ ok: true });
}
