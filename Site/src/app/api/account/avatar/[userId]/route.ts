import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  AVATARS,
  COOKIE,
  findUserById,
  isStudio,
  userFromSession,
} from "@/lib/auth";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  const viewer = await userFromSession(cookies().get(COOKIE)?.value);
  if (!viewer) return new NextResponse(null, { status: 401 });
  if (viewer.id !== params.userId && !isStudio(viewer)) {
    return new NextResponse(null, { status: 403 });
  }
  const person = await findUserById(params.userId);
  if (!person?.avatar) return new NextResponse(null, { status: 404 });
  const ext = person.avatar.split(".").pop()?.toLowerCase() || "jpg";
  try {
    const buf = await fs.readFile(path.join(AVATARS, person.avatar));
    return new NextResponse(buf, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
