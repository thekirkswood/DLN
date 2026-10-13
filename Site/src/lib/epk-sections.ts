import type { AssetItem } from "@/lib/assets";
import { isPdfHref } from "@/lib/assets-view";
import { vaultLane } from "@/lib/epk-doc";

export type EpkSection = "logos" | "banners" | "people" | "files" | "other";

/** Shared still with no logo / person / banner tag. Files stay in Files. */
export function isOtherShared(item: AssetItem): boolean {
  if (item.flags.logo || item.flags.banner || item.flags.people) return false;
  if (isPdfHref(item.href) || item.kind === "pdf" || item.kind === "brief" || item.kind === "text") {
    return false;
  }
  return true;
}

export function assetInSection(item: AssetItem, section: EpkSection): boolean {
  if (section === "logos") return Boolean(item.flags.logo) || vaultLane(item.href, item.flags) === "logos";
  if (section === "banners") return Boolean(item.flags.banner);
  if (section === "people") {
    return Boolean(item.flags.people) || vaultLane(item.href, item.flags) === "founder";
  }
  if (section === "other") return isOtherShared(item);
  return isPdfHref(item.href) || item.kind === "pdf" || item.kind === "brief" || item.kind === "text";
}

export function sectionItems(items: AssetItem[], section: EpkSection): AssetItem[] {
  if (section === "logos") return items.filter((item) => Boolean(item.flags.logo));
  if (section === "banners") return items.filter((item) => Boolean(item.flags.banner));
  if (section === "people") return items.filter((item) => Boolean(item.flags.people));
  if (section === "other") return items.filter(isOtherShared);
  return items.filter((item) => assetInSection(item, section));
}

export const SECTION_LABEL: Record<EpkSection, string> = {
  logos: "Logos",
  banners: "Banners",
  people: "People",
  files: "Files",
  other: "Other",
};
