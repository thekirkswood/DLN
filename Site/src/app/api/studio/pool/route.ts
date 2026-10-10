import { NextResponse } from "next/server";
import { isStudio } from "@/lib/auth";
import { listAssets } from "@/lib/assets";
import { assetLane, isImageHref, laneLabel } from "@/lib/assets-view";
import { kitsForUser } from "@/lib/epk";
import { loadKitContent } from "@/lib/epk-content";
import { pressKitForPlot } from "@/lib/epk-map";
import { resolveStudioUser, studioCors } from "@/lib/studio-hub";
import { ledgersVisibleTo, tokenCosts } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: studioCors(request) });
}

export async function GET(request: Request) {
  const cors = studioCors(request);
  const url = new URL(request.url);
  const user = await resolveStudioUser(url.searchParams.get("ticket"));
  if (!user) return NextResponse.json({ ok: false }, { status: 401, headers: cors });
  const plot = String(url.searchParams.get("plot") || "").trim();
  const kit = pressKitForPlot(plot);
  const allowed = new Set(kitsForUser(user));
  const index = await listAssets();
  const hub = `${url.protocol}//${url.host}`;
  const items = index.items
    .filter((item) => item.kind === "image" || isImageHref(item.href))
    .filter((item) => {
      if (!isStudio(user) && !(item.kit && allowed.has(item.kit))) return false;
      if (kit && item.kit && item.kit !== kit) return false;
      return true;
    })
    .map((item) => {
      const lane = assetLane(item.flags);
      return {
        id: item.id,
        href: item.href.startsWith("http") ? item.href : `${hub}${item.href}`,
        title: item.title,
        kit: item.kit,
        flags: item.flags,
        lane,
        laneLabel: laneLabel(lane),
        note: item.note || "",
      };
    });
  const [ledgers, costs, content] = await Promise.all([
    ledgersVisibleTo(user),
    tokenCosts(),
    kit ? loadKitContent(kit) : Promise.resolve(null),
  ]);
  const promos = (content?.promos || []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body.slice(0, 280),
  }));
  return NextResponse.json(
    {
      ok: true,
      items,
      promos,
      kit,
      stillCost: costs.genCost,
      ledgers: ledgers.map((row) => ({
        plotSlug: row.plotSlug,
        balance: row.balance,
        grantedThisPeriod: row.grantedThisPeriod,
      })),
    },
    { headers: cors },
  );
}
