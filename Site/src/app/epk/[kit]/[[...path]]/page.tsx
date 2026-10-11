import { notFound } from "next/navigation";
import { EpkGate } from "@/components/EpkGate";
import { EpkKitApp } from "@/components/EpkKitApp";
import { ModyuBespokeKit } from "@/components/modyu-epk/ModyuBespokeKit";
import { assetsForKit, listAssets } from "@/lib/assets";
import { kitAccess } from "@/lib/epk-access";
import { loadKitContent } from "@/lib/epk-content";
import { epkDoc } from "@/lib/epk-doc";
import { isKitId, kitName } from "@/lib/epk";
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
  searchParams?: { hub?: string; plot?: string };
}) {
  const id = params.kit.toLowerCase();
  if (!isKitId(id)) notFound();
  const trail = (params.path || []).map((p) => decodeURIComponent(p));
  const access = await kitAccess(id);
  if (!access.allowed) {
    return <EpkGate wanted={id} next={epkHref(id, trail.join("/"))} />;
  }

  // ModYu: bespoke kit lives on the hub like every other house.
  if (id === "modyu") {
    return <ModyuBespokeKit path={trail} />;
  }

  const index = await listAssets();
  const items = assetsForKit(index, id);
  const content = await loadKitContent(id);
  return (
    <EpkKitApp
      doc={epkDoc(id)}
      items={items}
      content={content}
      path={trail}
      studio={access.studio}
      tagged={access.tagged}
    />
  );
}
