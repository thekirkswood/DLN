import { promises as fs } from "fs";
import path from "path";
import {
  indexExistingAsset,
  listAssets,
  pressPack,
  type AssetFlags,
  type AssetItem,
} from "@/lib/assets";
import { isImageHref, isShared } from "@/lib/assets-view";
import type { EpkAsset, EpkAssetCategory } from "@/lib/modyu-epk/assets";

const PUBLIC = path.join(process.cwd(), "..", "Site", "public");
const MODYU_PUBLIC = "/home/main/ModYu/Site/public";

/** Vault flags → press kit section. Untagged shared files sit in Other. */
export function epkCategoryFromFlags(flags: AssetFlags): EpkAssetCategory {
  if (flags.logo) return "logos";
  if (flags.people) return "founder";
  if (flags.pack) return "kits";
  if (flags.banner || flags.promo || flags.post) return "campaigns";
  return "other";
}

export function flagsFromEpkCategory(category: EpkAssetCategory): AssetFlags {
  if (category === "logos") return { share: true, logo: true };
  if (category === "founder") return { share: true, people: true };
  if (category === "bottles" || category === "kits") return { share: true, pack: true };
  if (category === "campaigns") return { share: true, promo: true, people: true };
  if (category === "lifestyle") return { share: true, promo: true };
  return { share: true };
}

export function vaultItemToEpkAsset(item: AssetItem): EpkAsset {
  const category = epkCategoryFromFlags(item.flags);
  return {
    id: `vault-${item.id}`,
    category,
    label: item.title || "Untitled",
    src: item.href,
    alt: item.title || item.note || "Press still",
    tags: [category],
    note: item.note,
  };
}

function sameSrc(a: string, b: string) {
  return a.replace(/\?.*$/, "") === b.replace(/\?.*$/, "");
}

function fileName(href: string) {
  return (href.split("/").pop() || href).toLowerCase();
}

async function fileOnDisk(href: string): Promise<boolean> {
  try {
    await fs.access(path.join(PUBLIC, href.replace(/^\//, "")));
    return true;
  } catch {
    return false;
  }
}

async function copyPlotToVault(kit: string, src: string): Promise<string | null> {
  const rel = src.replace(/^\//, "");
  const fromPlot = path.join(MODYU_PUBLIC, rel);
  const destRel = path.posix.join("press", kit, "epk", path.basename(rel));
  const dest = path.join(PUBLIC, destRel);
  try {
    await fs.access(dest);
    return `/${destRel}`;
  } catch {
    /* copy */
  }
  try {
    await fs.access(fromPlot);
  } catch {
    return null;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    await fs.copyFile(fromPlot, dest);
  } catch {
    return null;
  }
  return `/${destRel}`;
}

async function kitStills(kit: string): Promise<string[]> {
  const dir = path.join(PUBLIC, "kit-stills", kit);
  const out: string[] = [];
  async function walk(here: string, rel: string, depth: number) {
    if (depth > 6) return;
    let entries;
    try {
      entries = await fs.readdir(here, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(here, entry.name);
      const next = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) {
        await walk(full, next, depth + 1);
      } else {
        out.push(`/${next}`);
      }
    }
  }
  await walk(dir, `kit-stills/${kit}`, 0);
  return out;
}

function categoryForHref(href: string, hinted?: EpkAssetCategory): EpkAssetCategory {
  if (hinted) return hinted;
  const n = href.toLowerCase();
  if (/logo|wordmark|lockup/.test(n)) return "logos";
  if (/amb\.png|ann-marie|founder/.test(n)) return "founder";
  if (/people|panel-|campaign/.test(n)) return "campaigns";
  if (/bottle|product|pack|kit|ht4|phase|balance|cleanse|hydrate|bathe|comfort|protect|nourish/.test(n)) {
    return "kits";
  }
  return "other";
}

/** Put every still the EPK shows onto the vault. Do not take anything off the kit. */
export async function ensureEpkOnVault(kit: string, base: EpkAsset[]): Promise<void> {
  const stills = kit === "modyu" ? await kitStills(kit) : [];
  const rows = [
    ...base.map((row) => ({
      src: row.src,
      label: row.label,
      category: row.category,
    })),
    ...stills.map((src) => ({
      src,
      label: undefined as string | undefined,
      category: categoryForHref(src),
    })),
  ];
  const seen = new Set<string>();
  for (const row of rows) {
    const src = row.src.replace(/\?.*$/, "");
    if (!src.startsWith("/") || seen.has(src)) continue;
    seen.add(src);
    const flags = flagsFromEpkCategory(categoryForHref(src, row.category));
    const title = row.label;
    if (await fileOnDisk(src)) {
      await indexExistingAsset({ kit, href: src, title, flags });
      continue;
    }
    const copied = kit === "modyu" ? await copyPlotToVault(kit, src) : null;
    if (copied) {
      await indexExistingAsset({ kit, href: copied, title, flags });
      continue;
    }
    const index = await listAssets();
    const twin = index.items.find(
      (item) => item.kit === kit && fileName(item.href) === fileName(src),
    );
    if (twin) {
      await indexExistingAsset({ kit, href: twin.href, title, flags });
    }
  }
}

/** Dave’s curated stills plus whatever is ticked onto the press kit in the vault. */
export async function liveEpkAssets(kit: string, base: EpkAsset[]): Promise<EpkAsset[]> {
  await ensureEpkOnVault(kit, base);
  const index = await listAssets();
  const kitItems = index.items.filter((item) => item.kit === kit);
  const out: EpkAsset[] = [];
  const seen = new Set<string>();
  for (const row of base) {
    const href = row.src.replace(/\?.*$/, "");
    const name = fileName(href);
    const exact = kitItems.find((item) => item.href === href);
    const twins = kitItems.filter((item) => fileName(item.href) === name);
    const onVault = Boolean(exact || twins.length);
    const shared = exact
      ? isShared(exact)
      : twins.some(isShared);
    if (onVault && !shared) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(row);
  }
  const pack = pressPack(index, kit);
  for (const item of pack) {
    if (!isImageHref(item.href) && item.kind !== "image") continue;
    const name = fileName(item.href);
    if (seen.has(name) || base.some((row) => sameSrc(row.src, item.href))) continue;
    seen.add(name);
    out.push(vaultItemToEpkAsset(item));
  }
  return out;
}
