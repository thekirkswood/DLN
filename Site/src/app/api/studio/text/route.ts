import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { addTextAsset } from "@/lib/assets";
import { vaultKitForPlot } from "@/lib/epk-map";
import {
  asTextKind,
  parsePressCopy,
  parseSlidesCopy,
  parseSocialCopy,
  steerText,
  type TextAttach,
  type TextExtras,
} from "@/lib/studio-copy";
import { stampPressPdf, stampSlidesPptx, stampSocialText } from "@/lib/studio-docs";
import { noCopyDesk, resolveCopyProvider, writeStudioCopy } from "@/lib/studio-llm";
import { bytesFromHref, depositStudioFile } from "@/lib/studio-engine";
import { getStudioProject } from "@/lib/studio-projects";
import { getSessionUser } from "@/lib/session";
import { studioSpendAllowed } from "@/lib/studio-hub";
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
    kind?: string;
    extras?: TextExtras;
    attaches?: TextAttach[];
    steerOnly?: boolean;
  };
  const project = body.projectId ? await getStudioProject(String(body.projectId)) : null;
  const plotSlug = String(body.plotSlug || project?.plotSlug || "").trim();
  const line = String(body.prompt || "").trim();
  const kind = asTextKind(body.kind);
  const extras: TextExtras = { ...(body.extras || {}), plotName: body.plotName || body.extras?.plotName || plotSlug };
  const attaches = Array.isArray(body.attaches) ? body.attaches : [];
  if (!plotSlug) return NextResponse.json({ ok: false, error: "Pick a site" }, { status: 400 });
  if (!line) return NextResponse.json({ ok: false, error: "Type what this job is" }, { status: 400 });
  if (!studioSpendAllowed(user, plotSlug)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const steered = steerText(line, {
    kind,
    title: body.title,
    extras,
    attaches,
  });

  if (body.steerOnly) {
    return NextResponse.json({
      ok: true,
      steered: {
        kind: steered.kind,
        title: steered.title,
        cleaned: steered.cleaned,
        setting: steered.setting,
        missing: steered.missing,
        prompt: steered.user,
      },
    });
  }

  if (!project) return NextResponse.json({ ok: false, error: "Open a project" }, { status: 400 });

  const provider = await resolveCopyProvider();
  if (!provider) {
    return NextResponse.json({ ok: false, error: noCopyDesk(host) }, { status: 503 });
  }

  const costs = await tokenCosts();
  const spent = await spendTokens({
    user,
    plotSlug,
    n: costs.genCost,
    k: "gen",
    reason: `studio text · ${kind} · ${plotSlug} · ${steered.title.slice(0, 80)}`,
  });
  if (!spent.ok) {
    return NextResponse.json(
      { ok: false, error: spent.error === "balance" ? "Not enough Instant updates this month." : "Could not take tokens." },
      { status: 402 },
    );
  }

  try {
    const written = await writeStudioCopy({
      system: steered.system,
      user: steered.user,
      provider,
    });
    const stills = [];
    for (const item of attaches) {
      if (!item.href) continue;
      const bytes = await bytesFromHref(item.href, host);
      if (bytes) stills.push({ title: item.title || item.note || "", bytes });
    }

    const kit = vaultKitForPlot(plotSlug) || plotSlug;
    const slug = steered.title.replace(/[^\w]+/g, "-").slice(0, 40) || kind;
    let href = "";
    let preview = "";

    if (kind === "social") {
      const copy = parseSocialCopy(written.text, steered.title);
      preview = stampSocialText(copy);
      const asset = await addTextAsset({
        kit,
        title: copy.title,
        body: preview,
      });
      href = asset?.href || "";
    } else if (kind === "slides") {
      const copy = parseSlidesCopy(written.text, steered.title);
      preview = copy.deck.map((slide) => `${slide.title}\n${slide.lines.join("\n")}`).join("\n\n");
      const bytes = await stampSlidesPptx({ copy, brand: extras.plotName || plotSlug, stills });
      const asset = await depositStudioFile({
        plotSlug,
        filename: `${kit}-${slug}.pptx`,
        bytes,
        title: copy.title,
        note: `Studio · ${project.title} · slides`,
      });
      href = asset?.href || "";
    } else {
      const copy = parsePressCopy(written.text, steered.title);
      preview = [copy.headline, copy.standfirst, copy.body, copy.cta, copy.contact].filter(Boolean).join("\n\n");
      const bytes = await stampPressPdf({ copy, brand: extras.plotName || plotSlug, stills });
      const asset = await depositStudioFile({
        plotSlug,
        filename: `${kit}-${slug}.pdf`,
        bytes,
        title: copy.title,
        note: `Studio · ${project.title} · press`,
      });
      href = asset?.href || "";
    }

    if (!href) throw new Error("Could not put that file in the vault.");

    return NextResponse.json({
      ok: true,
      href,
      title: steered.title,
      body: preview,
      kind,
      provider: written.provider,
      steered: {
        kind: steered.kind,
        title: steered.title,
        cleaned: steered.cleaned,
        setting: steered.setting,
        missing: steered.missing,
      },
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
