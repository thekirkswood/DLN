import { notFound, redirect } from "next/navigation";
import { EpkGate } from "@/components/EpkGate";
import { EpkKitApp } from "@/components/EpkKitApp";
import { ModyuKitApp } from "@/components/ModyuKitApp";
import { assetsForKit, listAssets } from "@/lib/assets";
import { kitAccess } from "@/lib/epk-access";
import { loadKitContent } from "@/lib/epk-content";
import { epkDoc } from "@/lib/epk-doc";
import { isKitId, kitName } from "@/lib/epk";
import { kitHandoffHref, kitExternalOrigin } from "@/lib/epk-handoff";
import { epkHref } from "@/lib/epk-map";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { kit: string } }) {
  const id = params.kit.toLowerCase();
  return { title: isKitId(id) ? `${kitName(id)} press kit` : "Press kit" };
}

export default async function EpkKitPage({
  params,
  searchParams,
}: {
  params: { kit: string; path?: string[] };
  searchParams?: { hub?: string; plot?: string };
}) {
  const id = params.kit.toLowerCase();
  if (!isKitId(id)) notFound();
  const trail = (params.path || []).map((p) => decodeURIComponent(p));
  const access = await kitAccess(id);
  if (!access.allowed) {
    return <EpkGate wanted={id} next={epkHref(id, trail.join("/"))} />;
  }

  // Plot books (ModYu) have their own login. Ann-Marie and journalists go
  // there. Studio stays on this hub so a walk of Press packs does not dump
  // them onto someone else’s sign-in. `?plot=1` still hands off.
  const handOff = kitExternalOrigin(id) && !access.studio;
  const studioWantsPlot = access.studio && searchParams?.plot === "1";
  if ((handOff || studioWantsPlot) && kitExternalOrigin(id)) {
    const handoff = await kitHandoffHref(id, "/epk");
    if (handoff) redirect(handoff);
  }

  const index = await listAssets();
  const items = assetsForKit(index, id);
  const content = await loadKitContent(id);
  const KitApp = id === "modyu" ? ModyuKitApp : EpkKitApp;
  return (
    <KitApp
      doc={epkDoc(id)}
      items={items}
      content={content}
      path={trail}
      studio={access.studio}
      tagged={access.tagged}
    />
  );
}
