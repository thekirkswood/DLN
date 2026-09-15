export function isImageHref(href: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(href.split("/").pop() || href);
}

export function isPdfHref(href: string): boolean {
  return /\.pdf(\?.*)?$/i.test(href.split("/").pop() || href);
}

export function canDeleteHref(href: string): boolean {
  return /^\/press\/[^/]+\/(uploads|docs)\//.test(href);
}

export type ShareFlags = {
  share?: boolean;
  pack?: boolean;
  logo?: boolean;
  banner?: boolean;
  people?: boolean;
  post?: boolean;
};

/** Press kit only takes files ticked to share. Older pack flags still count until turned off. */
export function isShared(item: { flags: ShareFlags }): boolean {
  if (item.flags.share === false) return false;
  if (item.flags.share === true) return true;
  return Boolean(
    item.flags.pack || item.flags.logo || item.flags.banner || item.flags.people || item.flags.post,
  );
}

export type AssetKindFilter = "all" | "image" | "document" | "text";

export function kindBucket(kind: string): Exclude<AssetKindFilter, "all"> {
  if (kind === "image") return "image";
  if (kind === "text") return "text";
  return "document";
}

export function kindLabel(kind: string): string {
  if (kind === "image") return "Image";
  if (kind === "pdf") return "PDF";
  if (kind === "text") return "Text";
  if (kind === "blueprint") return "Blueprint";
  return "File";
}

export function folderOfHref(href: string): string {
  const n = href.replace(/\\/g, "/").toLowerCase();
  if (n.includes("/play/")) return "play";
  if (n.includes("/fields/")) return "fields";
  const press = n.match(/^\/press\/[^/]+\/([^/]+)/);
  if (press) {
    if (press[1].includes(".")) return "other";
    return press[1];
  }
  if (n.startsWith("/brand/")) return "brand";
  if (n.startsWith("/brief/frameworks/")) return "frameworks";
  if (n.startsWith("/plots/")) return "mark";
  return "other";
}

export function folderLabel(id: string): string {
  const labels: Record<string, string> = {
    all: "All",
    brand: "Brand",
    people: "People",
    guide: "Guide",
    products: "Products",
    journey: "Journey",
    lifestyle: "Lifestyle",
    phases: "Phases",
    social: "Social",
    voices: "Voices",
    mark: "Mark",
    fields: "Fields",
    play: "Play",
    media: "Media",
    plates: "Plates",
    icons: "Icons",
    frameworks: "Frameworks",
    other: "Other",
    docs: "Documents",
    uploads: "Uploads",
    office: "Office",
  };
  return labels[id] || id;
}
