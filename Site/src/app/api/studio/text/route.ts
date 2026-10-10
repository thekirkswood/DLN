import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { vaultKitForPlot } from "@/lib/epk-map";
import { bytesFromHref, depositStudioFile, ensureProjectSpace } from "@/lib/studio-engine";
import { getStudioProject } from "@/lib/studio-projects";
import { getSessionUser } from "@/lib/session";
import { studioEngineHref, studioSpendAllowed } from "@/lib/studio-hub";
import { adjustTokens, spendTokens, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    plotSlug?: string;
    plotName?: string;
    title?: string;
    prompt?: string;
  };
  const project = body.projectId ? await getStudioProject(String(body.projectId)) : null;
  const plotSlug = String(body.plotSlug || project?.plotSlug || "").trim();
  const line = String(body.prompt || "").trim();
  const title = String(body.title || "").trim() || line.slice(0, 48) || "Studio document";
  if (!plotSlug) return NextResponse.json({ ok: false, error: "Pick a site" }, { status: 400 });
  if (!line) return NextResponse.json({ ok: false, error: "Type what the document should be" }, { status: 400 });
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  if (!project) return NextResponse.json({ ok: false, error: "Open a project" }, { status: 400 });

  const costs = await tokenCosts();
  const spent = await spendTokens({
    user,
    plotSlug,
    n: costs.genCost,
    k: "gen",
    reason: `studio text · ${plotSlug} · ${title.slice(0, 80)}`,
  });
  if (!spent.ok) {
    return NextResponse.json(
      { ok: false, error: spent.error === "balance" ? "Not enough Instant updates this month." : "Could not take tokens." },
      { status: 402 },
    );
  }

  try {
    const space = await ensureProjectSpace({
      projectId: project.id,
      plotName: body.plotName || plotSlug,
      host,
    });
    const res = await fetch(studioEngineHref("/api/generate/text", host), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sandboxId: space.sandboxId,
        title,
        prompt: line,
        housePaid: true,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      path?: string;
      body?: string;
      title?: string;
    };
    if (!res.ok || !data.path) {
      throw new Error(data.error || "Text failed");
    }
    const bytes = await bytesFromHref(data.path, host);
    const kit = vaultKitForPlot(plotSlug) || plotSlug;
    let href = data.path.startsWith("http") ? data.path : data.path;
    if (bytes) {
      const asset = await depositStudioFile({
        plotSlug,
        filename: `${kit}-${title.replace(/[^\w]+/g, "-").slice(0, 40) || "document"}.pdf`,
        bytes,
        title,
        note: `Studio · ${project.title}`,
      });
      if (asset?.href) href = asset.href;
    }
    return NextResponse.json({
      ok: true,
      href,
      title: data.title || title,
      body: data.body || "",
      balance: spent.balance,
      spent: costs.genCost,
    });
  } catch (error) {
    if (isStudio(user)) {
      await adjustTokens({
        actor: user,
        userId: user.id,
        plotSlug,
        n: costs.genCost,
        reason: "studio text refund — gen missed",
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Text failed",
        balance: spent.balance,
      },
      { status: 502 },
    );
  }
}
