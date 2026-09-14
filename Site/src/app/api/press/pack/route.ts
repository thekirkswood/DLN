import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import { listAssets, pressPack, publicHref } from "@/lib/assets";
import { EPK_COOKIE, canViewKit, isKitId, kitFromCookieValue } from "@/lib/epk";
import { kitCopyDraft, resolvedKitCopy } from "@/lib/epk-copy-store";

export const dynamic = "force-dynamic";

/** Press pack for one kit. Studio, tagged client, or a matching EPK cookie. */
export async function GET(req: NextRequest) {
  const user = await userFromSession(req.cookies.get(COOKIE)?.value);
  const cookieKit = kitFromCookieValue(req.cookies.get(EPK_COOKIE)?.value);
  const asked = (req.nextUrl.searchParams.get("kit") || "").trim().toLowerCase();
  const kit = isKitId(asked) ? asked : cookieKit;
  if (!kit) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 401 });
  }
  const studio = Boolean(user && isStudio(user));
  if (!canViewKit(user, kit) && cookieKit !== kit) {
    return NextResponse.json({ ok: false, error: "kit" }, { status: 401 });
  }
  const index = await listAssets();
  const profile = await resolvedKitCopy(kit);
  const draft = studio ? await kitCopyDraft(kit) : null;
  const items = pressPack(index, kit)
    .map((item) => {
      const href = publicHref(item);
      if (!href) return null;
      return {
        id: item.id,
        title: item.title,
        href,
        kind: item.kind,
        flags: item.flags,
        kit: item.kit,
        note: item.note || "",
      };
    })
    .filter(Boolean);
  return NextResponse.json({
    ok: true,
    house: "dln",
    kit,
    name: profile.name,
    kicker: profile.kicker,
    lede: profile.lede,
    overview: profile.overview,
    quotes: profile.quotes,
    extra: profile.extra,
    bespoke: studio ? profile.bespoke : undefined,
    draft,
    source: "Design Lab North",
    items,
  });
}
