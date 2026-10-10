import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { vaultKitForPlot } from "@/lib/epk-map";
import {
  steerPicture,
  type PictureAttach,
  type PictureExtras,
  type ShotAvenue,
  type SteerMode,
} from "@/lib/picture-steer";
import { bytesFromHref, depositStudioFile, ensureProjectSpace } from "@/lib/studio-engine";
import { appendStudioStill, getStudioProject } from "@/lib/studio-projects";
import { resolveStudioUser, studioEngineHref, studioSpendAllowed } from "@/lib/studio-hub";
import { adjustTokens, spendTokens, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const body = (await request.json().catch(() => ({}))) as {
    ticket?: string;
    projectId?: string;
    plotSlug?: string;
    plotName?: string;
    prompt?: string;
    mode?: SteerMode;
    extras?: PictureExtras;
    attaches?: PictureAttach[];
    avenue?: ShotAvenue;
  };
  const user = await resolveStudioUser(body.ticket);
  const projectId = String(body.projectId || "").trim();
  const project = projectId ? await getStudioProject(projectId) : null;
  const plotSlug = String(body.plotSlug || project?.plotSlug || "").trim();
  const line = String(body.prompt || "").trim();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!plotSlug) return NextResponse.json({ ok: false, error: "Pick a site" }, { status: 400 });
  if (!line) return NextResponse.json({ ok: false, error: "Type a prompt" }, { status: 400 });
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const extras: PictureExtras = {
    ...(body.extras || {}),
    plotName: body.extras?.plotName || body.plotName || plotSlug,
  };
  if (body.avenue && !extras.avenue) extras.avenue = body.avenue;
  const steered = steerPicture(line, {
    mode: body.mode,
    extras,
    attaches: body.attaches,
  });

  const costs = await tokenCosts();
  const spent = await spendTokens({
    user,
    plotSlug,
    n: costs.genCost,
    k: "gen",
    reason: `studio still · ${plotSlug} · ${line.slice(0, 80)}`,
  });
  if (!spent.ok) {
    return NextResponse.json(
      { ok: false, error: spent.error === "balance" ? "Not enough Instant updates this month." : "Could not take tokens." },
      { status: 402 },
    );
  }

  try {
    let sandboxId = "";
    if (project) {
      const space = await ensureProjectSpace({
        projectId: project.id,
        plotName: extras.plotName,
        host,
      });
      sandboxId = space.sandboxId;
    } else {
      const engine = studioEngineHref("", host).replace(/\/$/, "");
      const spaceRes = await fetch(`${engine}/api/spaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plotSlug,
          brandTokens: { product: extras.plotName || plotSlug, tone: "quiet, tactile, cinematic" },
        }),
      });
      const space = (await spaceRes.json().catch(() => ({}))) as { sandbox?: { id?: string } };
      sandboxId = space.sandbox?.id || "";
      if (!spaceRes.ok || !sandboxId) throw new Error("Studio gen is not running on this seat.");
    }

    const stillRes = await fetch(studioEngineHref("/api/generate/still", host), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sandboxId,
        prompt: line,
        mode: body.mode,
        extras,
        attaches: body.attaches,
        avenue: extras.avenue,
        housePaid: true,
      }),
    });
    const still = (await stillRes.json().catch(() => ({}))) as {
      error?: string;
      node?: { id?: string; stillPath?: string };
      steered?: { prompt?: string };
      provider?: string;
    };
    if (!stillRes.ok || !still.node?.stillPath) {
      throw new Error(still.error || "Still failed");
    }

    const media = still.node.stillPath;
    const bytes = await bytesFromHref(media, host);
    const title = line.slice(0, 80) || "Studio still";
    const kit = vaultKitForPlot(plotSlug) || plotSlug;
    let href = media.startsWith("http") ? media : media.startsWith("/") ? media : `/${media}`;
    if (bytes) {
      const asset = await depositStudioFile({
        plotSlug,
        filename: `${kit}-still.png`,
        bytes,
        title,
        note: project ? `Studio · ${project.title}` : `Studio · ${plotSlug}`,
      });
      if (asset?.href) href = asset.href;
    }
    if (project) {
      await appendStudioStill(project.id, {
        id: randomUUID(),
        href,
        title,
        nodeId: still.node.id,
        createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({
      ok: true,
      href,
      steered,
      provider: still.provider,
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
        reason: "studio still refund — gen missed",
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Still failed",
        balance: spent.balance,
      },
      { status: 502 },
    );
  }
}
