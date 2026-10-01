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
}: {
  params: { kit: string; path?: string[] };
}) {
  const id = params.kit.toLowerCase();
  if (!isKitId(id)) notFound();
  const trail = (params.path || []).map((p) => decodeURIComponent(p));
  const access = await kitAccess(id);
  if (!access.allowed) {
    return <EpkGate wanted={id} next={epkHref(id, trail.join("/"))} />;
  }

  // Bespoke plot kit takes over the generated hub shell for journalists.
  // Studio can still open ?hub=1 to edit the generated base on the hub.
  if (kitExternalOrigin(id) && !access.studio) {
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
