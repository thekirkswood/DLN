import { bottles } from "@/lib/modyu-epk/bottles";
import { bundles, rrp, rrpPartsTotal } from "@/lib/modyu-epk/rrp";

export type EpkAssetCategory =
  | "logos"
  | "founder"
  | "bottles"
  | "kits"
  | "campaigns"
  | "lifestyle";

export type EpkAsset = {
  id: string;
  category: EpkAssetCategory;
  label: string;
  src: string;
  alt: string;
  tags: string[];
  /** Optional note under the label */
  note?: string;
  /** Bottle / kit RRP in GBP when press-relevant */
  rrp?: number;
  /** Deep link on HT4 system page */
  systemHref?: string;
};

export const assetCategories: {
  id: EpkAssetCategory;
  title: string;
  blurb: string;
}[] = [
  {
    id: "logos",
    title: "Logos",
    blurb: "Wordmarks and lockups for print and web.",
  },
  {
    id: "founder",
    title: "Founder",
    blurb: "Ann-Marie stills, portraits for features and interviews.",
  },
  {
    id: "bottles",
    title: "Bottles",
    blurb: "Each HT4 product, labelled. Open or drag; prices live on the system page.",
  },
  {
    id: "kits",
    title: "Kits & packs",
    blurb: "Full system, recovery, continuous care, clinic pack.",
  },
  {
    id: "campaigns",
    title: "Campaigns",
    blurb: "People and campaign frames for lifestyle desks.",
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    blurb: "Wider brand and Follicle Files atmosphere.",
  },
];

/** Clean cutouts (white bg stripped) for press download */
const bottleSrc: Record<string, string> = {
  balance: "/kit-stills/modyu/ht4/p1-balance-sheet.jpg",
  cleanse: "/kit-stills/modyu/ht4/p2-cleanse-sheet.jpg",
  hydrate: "/kit-stills/modyu/ht4/p3-hydrate-sheet.jpg",
  bathe: "/kit-stills/modyu/ht4/p3-bathe-sheet.jpg",
  comfort: "/kit-stills/modyu/ht4/p3-comfort-sheet.jpg",
  protect: "/kit-stills/modyu/ht4/p4-protect-sheet.jpg",
  nourish: "/kit-stills/modyu/ht4/p4-nourish-sheet.jpg",
};

const bottleRrp: Record<string, number> = {
  balance: rrp.balance,
  cleanse: rrp.cleanse,
  hydrate: rrp.hydrate,
  bathe: rrp.bathe,
  comfort: rrp.comfort,
  protect: rrp.protect,
  nourish: rrp.nourish,
};

const bottleTags: Record<string, string[]> = {
  balance: ["balance", "prepare", "shampoo", "pre-care"],
  cleanse: ["cleanse", "surgery", "saline", "protect", "wound"],
  hydrate: ["hydrate", "recovery", "moisture"],
  bathe: ["bathe", "recovery", "wash"],
  comfort: ["comfort", "recovery", "itch", "overnight"],
  protect: ["protect", "continue", "shampoo"],
  nourish: ["nourish", "continue", "conditioner"],
};

const bottleAssets: EpkAsset[] = bottles.map((b) => ({
  id: b.id,
  category: "bottles" as const,
  label: `${b.code} ${b.name}`,
  src: bottleSrc[b.id] || b.image,
  alt: `HT4 ${b.name}`,
  tags: bottleTags[b.id] || [b.id],
  note: b.timing,
  rrp: bottleRrp[b.id],
  systemHref: `/epk/modyu/system#${b.id}`,
}));

export const epkAssets: EpkAsset[] = [
  {
    id: "logo-modyu",
    category: "logos",
    label: "ModYu wordmark",
    src: "/assets/brand/modyu-logo.png",
    alt: "ModYu logo",
    tags: ["logo", "brand"],
  },
  {
    id: "logo-modyu-white",
    category: "logos",
    label: "ModYu wordmark (white)",
    src: "/assets/brand/modyu-logo-white.svg",
    alt: "ModYu logo white",
    tags: ["logo", "brand"],
  },
  {
    id: "logo-modyu-file",
    category: "logos",
    label: "ModYu logo",
    src: "/kit-stills/modyu/Modyu-logo.png",
    alt: "ModYu logo",
    tags: ["logo", "brand"],
  },
  {
    id: "logo-ht4-banner",
    category: "kits",
    label: "HT4 system banner",
    src: "/assets/brand/ht4-system-banner.png",
    alt: "HT4 system banner graphic",
    tags: ["logo", "ht4", "system"],
  },
  {
    id: "founder-amb",
    category: "founder",
    label: "Ann-Marie portrait",
    src: "/kit-stills/modyu/AMB.png",
    alt: "Ann-Marie Barlow, founder of ModYu",
    tags: ["founder", "portrait", "ann-marie"],
  },
  {
    id: "founder-follicle",
    category: "founder",
    label: "Ann-Marie, Follicle Files still",
    src: "/assets/lifestyle/about-follicle-files.png",
    alt: "Ann-Marie Barlow for The Follicle Files",
    tags: ["founder", "follicle-files", "ann-marie", "interview"],
  },
  {
    id: "founder-before-after",
    category: "campaigns",
    label: "Patient journey still (before / after)",
    src: "/assets/lifestyle/founder-headshot.png",
    alt: "Hair transplant before and after comparison",
    tags: ["surgery", "before-after", "patient", "journey"],
  },
  ...bottleAssets,
  {
    id: "kit-full-system",
    category: "kits",
    label: "HT4 full system",
    src: "/assets/products/ht4-box-open.png",
    alt: "HT4 system box open with seven bottles",
    tags: ["kit", "system", "full-system", "ht4"],
    note: "Seven bottles · one connected journey",
    rrp: bundles.fullSystem,
    systemHref: "/epk/modyu/system#prices",
  },
  {
    id: "kit-full-closed",
    category: "kits",
    label: "HT4 box closed",
    src: "/assets/products/ht4-box-closed.png",
    alt: "HT4 system box closed",
    tags: ["kit", "system", "packaging"],
    rrp: bundles.fullSystem,
    systemHref: "/epk/modyu/system#prices",
  },
  {
    id: "kit-recovery",
    category: "kits",
    label: "Recovery kit (P3)",
    src: "/assets/phases/p3-group-main.jpg",
    alt: "HT4 Recovery kit, Hydrate, Bathe, Comfort",
    tags: ["kit", "recovery", "hydrate", "bathe", "comfort"],
    note: "Hydrate + Bathe + Comfort",
    rrp: bundles.recoveryKit,
    systemHref: "/epk/modyu/system#prices",
  },
  {
    id: "kit-continuous",
    category: "kits",
    label: "Continuous Care (P4)",
    src: "/assets/phases/p4-group-main.jpg",
    alt: "HT4 Continuous Care, Protect and Nourish",
    tags: ["kit", "continue", "protect", "nourish"],
    note: "Protect + Nourish",
    rrp: bundles.continuousCare,
    systemHref: "/epk/modyu/system#prices",
  },
  {
    id: "kit-clinic",
    category: "kits",
    label: "Clinic pack (B2B)",
    src: "/assets/products/clinic-pack-open.jpg",
    alt: "ModYu Clinic pack",
    tags: ["kit", "clinic", "b2b"],
    note: "Cleanse + Hydrate + Bathe + Comfort",
    rrp: bundles.clinicPack,
    systemHref: "/epk/modyu/system#prices",
  },
  {
    id: "campaign-people-hero",
    category: "campaigns",
    label: "HT4 people, hero",
    src: "/assets/people/ht4-people-hero.jpg",
    alt: "People holding HT4 products",
    tags: ["campaign", "people", "lifestyle"],
  },
  {
    id: "campaign-people-banner",
    category: "campaigns",
    label: "HT4 people, banner",
    src: "/assets/people/ht4-people-banner.png",
    alt: "HT4 people banner",
    tags: ["campaign", "people"],
  },
  {
    id: "campaign-panel-01",
    category: "campaigns",
    label: "People panel 01",
    src: "/assets/people/panel-01.png",
    alt: "Campaign portrait panel",
    tags: ["campaign", "people", "portrait"],
  },
  {
    id: "campaign-panel-03",
    category: "campaigns",
    label: "People panel 03",
    src: "/assets/people/panel-03.png",
    alt: "Campaign portrait panel",
    tags: ["campaign", "people", "portrait", "surgery"],
  },
  {
    id: "campaign-panel-07",
    category: "campaigns",
    label: "People panel 07",
    src: "/assets/people/panel-07.png",
    alt: "Campaign portrait panel",
    tags: ["campaign", "people", "recovery"],
  },
  {
    id: "lifestyle-product",
    category: "lifestyle",
    label: "Product atmosphere",
    src: "/assets/lifestyle/product-photo.png",
    alt: "Product lifestyle still",
    tags: ["lifestyle", "product"],
  },
  {
    id: "lifestyle-lineup",
    category: "lifestyle",
    label: "Bottle lineup",
    src: "/assets/products/bottles-lineup.png",
    alt: "HT4 bottles in a lineup",
    tags: ["lifestyle", "bottles", "system"],
  },
];

export function assetsByCategory(category: EpkAssetCategory): EpkAsset[] {
  return epkAssets.filter((a) => a.category === category);
}

export function assetById(id: string): EpkAsset | undefined {
  return epkAssets.find((a) => a.id === id);
}

/** Stills whose tags intersect the given list (max `limit`). */
export function assetsForTags(tags: string[], limit = 4): EpkAsset[] {
  const want = new Set(tags.map((t) => t.toLowerCase()));
  const scored = epkAssets
    .map((a) => ({
      a,
      score: a.tags.filter((t) => want.has(t.toLowerCase())).length,
    }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.a.label.localeCompare(y.a.label));
  const out: EpkAsset[] = [];
  const seen = new Set<string>();
  for (const { a } of scored) {
    if (seen.has(a.src)) continue;
    seen.add(a.src);
    out.push(a);
    if (out.length >= limit) break;
  }
  return out;
}

export function formatGbp(n: number): string {
  return n % 1 === 0
    ? `£${n}`
    : `£${n.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
}

/** Press RRP sheet, single source via products.ts */
export const pressRrp = {
  parts: bottles.map((b) => ({
    id: b.id,
    label: `${b.code} ${b.name}`,
    price: bottleRrp[b.id] ?? 0,
    href: `/epk/modyu/assets#${b.id}`,
  })),
  partsTotal: rrpPartsTotal,
  kits: [
    {
      id: "full-system",
      label: "Full HT4 system",
      price: bundles.fullSystem,
      note: `Save ${formatGbp(rrpPartsTotal - bundles.fullSystem)} vs parts`,
      href: "/epk/modyu/assets#kit-full-system",
    },
    {
      id: "recovery",
      label: "Recovery kit",
      price: bundles.recoveryKit,
      note: "Hydrate + Bathe + Comfort",
      href: "/epk/modyu/assets#kit-recovery",
    },
    {
      id: "continuous",
      label: "Continuous Care",
      price: bundles.continuousCare,
      note: "Protect + Nourish",
      href: "/epk/modyu/assets#kit-continuous",
    },
    {
      id: "clinic",
      label: "Clinic pack (B2B)",
      price: bundles.clinicPack,
      note: "Cleanse + Hydrate + Bathe + Comfort",
      href: "/epk/modyu/assets#kit-clinic",
    },
  ],
};

/** Hub vault chips, category jump links */
export const assetVaultNav = assetCategories.map((c) => ({
  id: c.id,
  title: c.title,
  href: `/epk/modyu/assets#${c.id}`,
  note: c.blurb,
}));
