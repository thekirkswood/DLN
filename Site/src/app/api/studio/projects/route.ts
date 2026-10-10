import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createStudioProject,
  listStudioProjects,
  projectSlug,
} from "@/lib/studio-projects";
import { getSessionUser } from "@/lib/session";
import { studioEngineHref, studioSpendAllowed } from "@/lib/studio-hub";

export const dynamic = "force-dynamic";

type SpaceReply = {
  workspace?: { slug?: string };
  sandbox?: { slug?: string };
};

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const plotSlug = new URL(request.url).searchParams.get("plot")?.trim() || "";
  if (!plotSlug) return NextResponse.json({ ok: false, error: "Pick a site" }, { status: 400 });
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  return NextResponse.json({ ok: true, projects: await listStudioProjects(plotSlug) });
}

export async function POST(request: Request) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    plotSlug?: string;
    plotName?: string;
    title?: string;
  };
  const plotSlug = String(body.plotSlug || "").trim();
  const title = String(body.title || "").trim();
  if (!plotSlug || !title) {
    return NextResponse.json({ ok: false, error: "Name the project" }, { status: 400 });
  }
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const name = projectSlug(plotSlug, title);
  try {
    const res = await fetch(studioEngineHref("/api/spaces", host), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        brandTokens: {
          product: body.plotName || plotSlug,
          tone: "quiet, tactile, cinematic",
        },
      }),
    });
    const space = (await res.json().catch(() => ({}))) as SpaceReply;
    const workspaceSlug = space.workspace?.slug;
    const sandboxSlug = space.sandbox?.slug;
    if (!res.ok || !workspaceSlug || !sandboxSlug) {
      return NextResponse.json({ ok: false, error: "Studio gen is not running on this seat." }, { status: 502 });
    }
    const project = await createStudioProject({
      title,
      plotSlug,
      workspaceSlug,
      sandboxSlug,
    });
    return NextResponse.json({ ok: true, project });
  } catch {
    return NextResponse.json({ ok: false, error: "Studio gen is not running on this seat." }, { status: 502 });
  }
}
