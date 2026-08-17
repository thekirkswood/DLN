import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { AVATARS, COOKIE, setAvatar, userFromSession } from "@/lib/auth";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false }, { status: 400 });
  if (file.size > 2_000_000) return NextResponse.json({ ok: false }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ ok: false }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(AVATARS, { recursive: true });
  const filename = `${user.id}.${ext}`;
  await fs.writeFile(path.join(AVATARS, filename), buf);
  await setAvatar(user.id, filename);
  return NextResponse.json({ ok: true });
}
