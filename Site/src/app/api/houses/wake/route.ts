import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { isLabHost } from "@/lib/lab-host";
import { buildUrlFor, plotBySlug } from "@/lib/plots";
import { getRequestSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const execFileP = promisify(execFile);
const SCRIPT = path.join(process.cwd(), "..", "ops", "wake-house.sh");
const SKIP = new Set(["dln", "builder", "choozlist"]);

type WakeOut = { up?: boolean; called?: boolean; hint?: string };

function parseOut(text: string): WakeOut {
  const line = text.trim().split("\n").filter(Boolean).pop() || "{}";
  try {
    return JSON.parse(line) as WakeOut;
  } catch {
    return { up: false, called: false };
  }
}

function allowedPlot(user: { plots: string[] }, studio: boolean, slug: string): boolean {
  if (studio) return true;
  return user.plots.includes("*") || user.plots.includes(slug);
}

async function wake(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!isLabHost(host)) {
    return NextResponse.json({ ok: false, error: "campus only" }, { status: 404 });
  }
  const hit = await getRequestSession(req);
  if (!hit) {
    return NextResponse.json({ ok: false, error: "sign in" }, { status: 401 });
  }
  const slug = (req.nextUrl.searchParams.get("plot") || "").trim();
  if (!slug || SKIP.has(slug)) {
    return NextResponse.json({ ok: false, error: "plot" }, { status: 400 });
  }
  if (!allowedPlot(hit.user, isStudio(hit.user), slug)) {
    return NextResponse.json({ ok: false, error: "not yours" }, { status: 403 });
  }
  const plot = await plotBySlug(slug);
  if (!plot) {
    return NextResponse.json({ ok: false, error: "plot" }, { status: 404 });
  }
  const url = buildUrlFor(plot, host);
  let out: WakeOut = { up: false, called: false };
  try {
    const ran = await execFileP("bash", [SCRIPT, slug], { timeout: 22000 });
    out = parseOut(String(ran.stdout || ""));
  } catch (err) {
    const stdout = err && typeof err === "object" && "stdout" in err ? String(err.stdout || "") : "";
    out = parseOut(stdout);
    if (!out.hint) out.hint = "port quiet";
  }
  return NextResponse.json({
    ok: Boolean(out.up),
    called: Boolean(out.called),
    url,
    port: plot.lab?.localPort ?? null,
    hint: out.hint || "",
  });
}

export async function GET(req: NextRequest) {
  return wake(req);
}

export async function POST(req: NextRequest) {
  return wake(req);
}
