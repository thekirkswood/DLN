import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ensureProjectSpace } from "@/lib/studio-engine";
import {
  createStudioProject,
  getStudioProject,
  listStudioProjects,
} from "@/lib/studio-projects";
import { getSessionUser } from "@/lib/session";
import { studioSpendAllowed } from "@/lib/studio-hub";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() || "";
  if (id) {
    const project = await getStudioProject(id);
    if (!project) return NextResponse.json({ ok: false }, { status: 404 });
    if (!studioSpendAllowed(user, project.plotSlug)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    return NextResponse.json({ ok: true, project });
  }
  const plotSlug = url.searchParams.get("plot")?.trim() || "";
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
  const project = await createStudioProject({ title, plotSlug });
  if (!project) {
    return NextResponse.json({ ok: false, error: "Name the project" }, { status: 400 });
  }
  try {
    await ensureProjectSpace({
      projectId: project.id,
      plotName: body.plotName || plotSlug,
      host,
    });
  } catch {
    /* Book first. Engine space is made on the first gen. */
  }
  const fresh = (await getStudioProject(project.id)) || project;
  return NextResponse.json({ ok: true, project: fresh });
}
