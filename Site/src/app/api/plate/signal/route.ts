import { NextResponse } from "next/server";
import { greenhousePlots } from "@/lib/plots";

export async function GET() {
  const houses = await greenhousePlots();
  const live = houses.some((p) => Boolean(p.enterUrl || p.hosts.length));
  return NextResponse.json({ ok: true, houses: live });
}
