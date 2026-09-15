import type { AssetItem } from "@/lib/assets";
import { isPdfHref } from "@/lib/assets-view";
import { vaultLane } from "@/lib/epk-doc";

export type EpkSection = "logos" | "banners" | "people" | "files";

export function assetInSection(item: AssetItem, section: EpkSection): boolean {
  if (section === "logos") return Boolean(item.flags.logo) || vaultLane(item.href, item.flags) === "logos";
  if (section === "banners") return Boolean(item.flags.banner);
  if (section === "people") {
    return Boolean(item.flags.people) || vaultLane(item.href, item.flags) === "founder";
  }
  return isPdfHref(item.href) || item.kind === "pdf" || item.kind === "brief" || item.kind === "text";
}

export function sectionItems(items: AssetItem[], section: EpkSection): AssetItem[] {
  if (section === "logos") return items.filter((item) => Boolean(item.flags.logo));
  if (section === "banners") return items.filter((item) => Boolean(item.flags.banner));
  if (section === "people") return items.filter((item) => Boolean(item.flags.people));
  return items.filter((item) => assetInSection(item, section));
}

export const SECTION_LABEL: Record<EpkSection, string> = {
  logos: "Logos",
  banners: "Banners",
  people: "People",
  files: "Files",
};
