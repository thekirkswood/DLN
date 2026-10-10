import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { vaultKitForPlot } from "@/lib/epk-map";
import { bytesFromHref, depositStudioFile, ensureProjectSpace } from "@/lib/studio-engine";
import { appendStudioStill, getStudioProject } from "@/lib/studio-projects";
import { getSessionUser } from "@/lib/session";
import { studioEngineHref, studioSpendAllowed } from "@/lib/studio-hub";
import { adjustTokens, spendTokens, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false }, { status: 400 });

  const project = await getStudioProject(String(form.get("projectId") || "").trim());
  const plotSlug = String(form.get("plotSlug") || project?.plotSlug || "").trim();
  const line = String(form.get("prompt") || "").trim();
  const sourceHref = String(form.get("sourceHref") || "").trim();
  const mask = form.get("mask");
  if (!project) return NextResponse.json({ ok: false, error: "Open a project" }, { status: 400 });
  if (!plotSlug) return NextResponse.json({ ok: false, error: "Pick a site" }, { status: 400 });
  if (!line) return NextResponse.json({ ok: false, error: "Say what to change" }, { status: 400 });
  if (!sourceHref) return NextResponse.json({ ok: false, error: "Pick a still" }, { status: 400 });
  if (!(mask instanceof Blob) || mask.size === 0) {
    return NextResponse.json({ ok: false, error: "Paint a hole first" }, { status: 400 });
  }
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const costs = await tokenCosts();
  const spent = await spendTokens({
    user,
    plotSlug,
    n: costs.genCost,
    k: "gen",
    reason: `studio inpaint · ${plotSlug} · ${line.slice(0, 80)}`,
  });
  if (!spent.ok) {
    return NextResponse.json(
      { ok: false, error: spent.error === "balance" ? "Not enough Instant updates this month." : "Could not take tokens." },
      { status: 402 },
    );
  }

  try {
    const stillBytes = await bytesFromHref(sourceHref, host);
    if (!stillBytes) throw new Error("Could not read that still.");
    const space = await ensureProjectSpace({
      projectId: project.id,
      plotName: String(form.get("plotName") || plotSlug),
      host,
    });
    const nodeForm = new FormData();
    nodeForm.set("sandboxId", space.sandboxId);
    nodeForm.set("name", line.slice(0, 48) || "Inpaint");
    nodeForm.set("prompt", line);
    nodeForm.set(
      "image",
      new Blob([new Uint8Array(stillBytes)], { type: "image/png" }),
      "still.png",
    );
    const nodeRes = await fetch(studioEngineHref("/api/nodes", host), {
      method: "POST",
      body: nodeForm,
    });
    const nodeBody = (await nodeRes.json().catch(() => ({}))) as { node?: { id?: string }; error?: string };
    const nodeId = nodeBody.node?.id;
    if (!nodeRes.ok || !nodeId) throw new Error(nodeBody.error || "Could not hold that still.");

    const paint = new FormData();
    paint.set("prompt", line);
    paint.set("generate", "1");
    paint.set("housePaid", "1");
    paint.set("mask", mask, "mask.png");
    const paintRes = await fetch(studioEngineHref(`/api/nodes/${nodeId}/inpaint`, host), {
      method: "POST",
      body: paint,
    });
    const painted = (await paintRes.json().catch(() => ({}))) as {
      error?: string;
      node?: { stillPath?: string };
    };
    if (!paintRes.ok || !painted.node?.stillPath) {
      throw new Error(painted.error || "Fill failed");
    }
    const media = painted.node.stillPath;
    const bytes = await bytesFromHref(media, host);
    const title = line.slice(0, 80) || "Inpaint";
    const kit = vaultKitForPlot(plotSlug) || plotSlug;
    let href = media.startsWith("http") ? media : media;
    if (bytes) {
      const asset = await depositStudioFile({
        plotSlug,
        filename: `${kit}-inpaint.png`,
        bytes,
        title,
        note: `Studio · ${project.title}`,
      });
      if (asset?.href) href = asset.href;
    }
    await appendStudioStill(project.id, {
      id: randomUUID(),
      href,
      title,
      nodeId,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      ok: true,
      href,
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
        reason: "studio inpaint refund — gen missed",
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Fill failed",
        balance: spent.balance,
      },
      { status: 502 },
    );
  }
}
