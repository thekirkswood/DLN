import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, userFromSession } from "@/lib/auth";

export async function GET() {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
