import type { AssetItem } from "@/lib/assets";
import { isImageHref } from "@/lib/assets-view";
import type { KitCover } from "@/lib/epk-content-model";
import { coverItem, type VaultLaneId } from "@/lib/epk-doc";
import { sectionItems } from "@/lib/epk-sections";

export function stillById(items: AssetItem[], id?: string): AssetItem | undefined {
  if (!id) return undefined;
  return items.find((item) => item.id === id);
}

export function laneStill(
  items: AssetItem[],
  cover: KitCover | undefined,
  lane: VaultLaneId,
): AssetItem | undefined {
  const picked = stillById(items, cover?.[lane]);
  if (picked && isImageHref(picked.href)) return picked;
  if (lane === "logos") {
    return sectionItems(items, "logos").find((item) => isImageHref(item.href)) || coverItem(items, "logos");
  }
  if (lane === "founder") {
    const cover = coverItem(items, "founder");
    if (cover && isImageHref(cover.href)) return cover;
    return firstPeople(items);
  }
  if (lane === "product") {
    return (
      sectionItems(items, "banners").find((item) => isImageHref(item.href)) || coverItem(items, "product")
    );
  }
  return coverItem(items, "campaigns");
}

export function firstLogo(items: AssetItem[]): AssetItem | undefined {
  return sectionItems(items, "logos").find((item) => isImageHref(item.href)) || coverItem(items, "logos");
}

export function firstBanner(items: AssetItem[]): AssetItem | undefined {
  return (
    sectionItems(items, "banners").find((item) => isImageHref(item.href)) ||
    coverItem(items, "product") ||
    coverItem(items, "campaigns")
  );
}

export function firstPeople(items: AssetItem[]): AssetItem | undefined {
  const people = sectionItems(items, "people").filter((item) => isImageHref(item.href));
  const named = people.find((item) => /ann-marie|annmarie/i.test(item.href));
  return named || coverItem(items, "founder") || people[0];
}
