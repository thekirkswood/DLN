import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { steerPicture, type PictureAttach, type PictureExtras, type ShotAvenue, type SteerMode } from "@/lib/picture-steer";
import { resolveStudioUser, studioOrigin, studioSpendAllowed } from "@/lib/studio-hub";
import { adjustTokens, spendTokens, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

type SpaceReply = { sandbox?: { id?: string } };

export async function POST(request: Request) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const body = (await request.json().catch(() => ({}))) as {
    ticket?: string;
    plotSlug?: string;
    plotName?: string;
    prompt?: string;
    mode?: SteerMode;
    extras?: PictureExtras;
    attaches?: PictureAttach[];
    avenue?: ShotAvenue;
  };
  const user = await resolveStudioUser(body.ticket);
  const plotSlug = String(body.plotSlug || "").trim();
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

  const origin = studioOrigin(host);
  try {
    const spaceRes = await fetch(`${origin}/api/spaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: plotSlug,
        brandTokens: { product: extras.plotName || plotSlug, tone: "quiet, tactile, cinematic" },
      }),
    });
    const space = (await spaceRes.json().catch(() => ({}))) as SpaceReply;
    const sandboxId = space.sandbox?.id;
    if (!spaceRes.ok || !sandboxId) {
      throw new Error("Studio gen is not running on this seat.");
    }
    const stillRes = await fetch(`${origin}/api/generate/still`, {
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
      node?: { stillPath?: string };
      steered?: { prompt?: string };
      provider?: string;
    };
    if (!stillRes.ok || !still.node?.stillPath) {
      throw new Error(still.error || "Still failed");
    }
    const path = still.node.stillPath;
    const href = path.startsWith("http") ? path : `${origin}${path}`;
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
