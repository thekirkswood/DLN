import { NextRequest, NextResponse } from "next/server";
import { addLiveSuggestion } from "@/lib/plans";
import { allPlots } from "@/lib/plots";

const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function tooMany(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const prev = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (prev.length >= 8) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  return false;
}

async function allowOrigin(origin: string | null): Promise<string | null> {
  if (!origin) return null;
  try {
    const host = new URL(origin).host.toLowerCase();
    if (
      host === "designlabnorth.com" ||
      host === "www.designlabnorth.com" ||
      host === "localhost:3010" ||
      host === "localhost:3000" ||
      host === "127.0.0.1:3010" ||
      host === "192.168.0.223:3010"
    ) {
      return origin;
    }
    const plots = await allPlots();
    if (
      plots.some((p) =>
        p.hosts.some((h) => h.replace(/^https?:\/\//, "").split("/")[0].toLowerCase() === host),
      )
    ) {
      return origin;
    }
  } catch {
    return null;
  }
  return null;
}

async function cors(req: NextRequest, res: NextResponse) {
  const origin = await allowOrigin(req.headers.get("origin"));
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Vary", "Origin");
  }
  return res;
}

export async function OPTIONS(req: NextRequest) {
  return cors(req, new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  if (tooMany(clientIp(req))) {
    return cors(req, NextResponse.json({ ok: false }, { status: 429 }));
  }
  const body = (await req.json().catch(() => null)) as {
    plotSlug?: string;
    body?: string;
    page?: string;
    fromName?: string;
    company?: string;
  } | null;
  if (body?.company) {
    return cors(req, NextResponse.json({ ok: true }));
  }
  try {
    const row = await addLiveSuggestion(body || {});
    return cors(req, NextResponse.json({ ok: true, id: row.id }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "forbidden" || msg === "missing" ? 403 : 400;
    return cors(req, NextResponse.json({ ok: false }, { status }));
  }
}
