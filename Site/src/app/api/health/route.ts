import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function homeShip(): Promise<{ iteration: number | null; tag: string | null }> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "..", "memory", "ITERATION"),
      "utf8",
    );
    const n = Number.parseInt(raw.trim(), 10);
    if (!Number.isFinite(n) || n < 1) return { iteration: null, tag: null };
    return { iteration: n, tag: `dln-${n}` };
  } catch {
    return { iteration: null, tag: null };
  }
}

export async function GET() {
  const ship = await homeShip();
  return NextResponse.json({
    ok: true,
    house: "dln",
    iteration: ship.iteration,
    tag: ship.tag,
  });
}
