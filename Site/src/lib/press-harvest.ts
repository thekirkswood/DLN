import { promises as fs } from "fs";
import path from "path";

const PUBLIC = path.join(process.cwd(), "..", "Site", "public");
const HOME = "/home/main";

const IMAGE = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const KEEP = new Set([...Array.from(IMAGE), ".pdf"]);

function skipName(name: string): boolean {
  if (name.startsWith(".")) return true;
  if (/^screenshot/i.test(name)) return true;
  if (/\.(ai|psd|pages|prproj|mp4|webm|mov)$/i.test(name)) return true;
  return false;
}

const SKIP_DIRS = new Set([
  "Screenshots",
  "archive",
  "motion",
  "node_modules",
  ".next",
  "cleanse-spin",
  "spin",
]);

async function copyOne(src: string, destRel: string): Promise<string | null> {
  const dest = path.join(PUBLIC, destRel);
  try {
    await fs.access(src);
  } catch {
    return null;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    await fs.access(dest);
    return `/${destRel.split(path.sep).join("/")}`;
  } catch {
    /* copy */
  }
  try {
    await fs.copyFile(src, dest);
  } catch {
    return null;
  }
  return `/${destRel.split(path.sep).join("/")}`;
}

async function harvestTree(
  srcDir: string,
  destPrefix: string,
  depth: number,
  out: string[],
): Promise<void> {
  if (depth > 5) return;
  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(srcDir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await harvestTree(full, path.posix.join(destPrefix, e.name), depth + 1, out);
      continue;
    }
    if (skipName(e.name)) continue;
    if (!destPrefix.startsWith("press/dln") && /^dln[-.]/i.test(e.name)) continue;
    if (!KEEP.has(path.extname(e.name).toLowerCase())) continue;
    const rel = path.posix.join(destPrefix, e.name);
    const href = await copyOne(full, rel);
    if (href) out.push(href);
  }
}

async function harvestFlat(
  srcDir: string,
  destPrefix: string,
  out: string[],
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (!e.isFile() || skipName(e.name)) continue;
    if (!destPrefix.startsWith("press/dln") && /^dln[-.]/i.test(e.name)) continue;
    if (!KEEP.has(path.extname(e.name).toLowerCase())) continue;
    const href = await copyOne(path.join(srcDir, e.name), path.posix.join(destPrefix, e.name));
    if (href) out.push(href);
  }
}

const SINGLES: { kit: string; src: string; dest: string }[] = [
  { kit: "modyu", src: `${HOME}/DLN/Site/public/plots/modyu.svg`, dest: "press/modyu/modyu.svg" },
  { kit: "modyu", src: `${HOME}/DLN/Site/public/plots/modyu-white.svg`, dest: "press/modyu/modyu-white.svg" },
  { kit: "modyu", src: `${HOME}/DLN/Site/public/brief/PNGs/logos-13.png`, dest: "press/modyu/logos-13.png" },
  { kit: "modyu", src: `${HOME}/DLN/Site/public/brief/Portfolio/Modyu.png`, dest: "press/modyu/Modyu.png" },
  { kit: "modyu", src: `${HOME}/DLN/Site/public/brief/Portfolio/FollicleFiles.png`, dest: "press/modyu/FollicleFiles.png" },
  { kit: "modyu", src: `${HOME}/DLN/Site/public/brief/Portfolio/HT4.png`, dest: "press/modyu/HT4.png" },
  { kit: "pfp", src: `${HOME}/DLN/Site/public/brief/PNGs/logos-07.png`, dest: "press/pfp/logos-07.png" },
  { kit: "pfp", src: `${HOME}/DLN/Site/public/brief/Portfolio/paulfosbury.png`, dest: "press/pfp/paulfosbury.png" },
  { kit: "daa", src: `${HOME}/DLN/Site/public/brief/PNGs/logos-15.png`, dest: "press/daa/logos-15.png" },
  { kit: "daa", src: `${HOME}/DLN/Site/public/brief/Portfolio/DAA.png`, dest: "press/daa/DAA.png" },
  { kit: "swarm", src: `${HOME}/DLN/Site/public/plots/swarm.svg`, dest: "press/swarm/swarm.svg" },
  { kit: "swarm", src: `${HOME}/SwarmFund/apps/web/public/brand/swarm-fund-mark.svg`, dest: "press/swarm/swarm-fund-mark.svg" },
  { kit: "swarm", src: `${HOME}/SwarmFund/apps/web/public/brand/swarm-fund-logo.png`, dest: "press/swarm/swarm-fund-logo.png" },
  { kit: "swarm", src: `${HOME}/SwarmFund/apps/web/public/brand/swarm-fund-mark.png`, dest: "press/swarm/swarm-fund-mark.png" },
  { kit: "titles", src: `${HOME}/DLN/Site/public/plots/various-titles.png`, dest: "press/titles/various-titles.png" },
  { kit: "titles", src: `${HOME}/DLN/Site/public/plots/various-titles-white.png`, dest: "press/titles/various-titles-white.png" },
  { kit: "titles", src: `${HOME}/DLN/Site/public/brief/PNGs/VT-logo-01.png`, dest: "press/titles/VT-logo-01.png" },
  { kit: "titles", src: `${HOME}/DLN/Site/public/brief/PNGs/VT-logo-02.png`, dest: "press/titles/VT-logo-02.png" },
  { kit: "titles", src: `${HOME}/VariousTitles/Site/public/brand/vt-mute.png`, dest: "press/titles/vt-mute.png" },
  { kit: "titles", src: `${HOME}/VariousTitles/Site/public/brand/vt-white.png`, dest: "press/titles/vt-white.png" },
  { kit: "dks", src: `${HOME}/DLN/Site/public/brief/PNGs/Dave.png`, dest: "press/dks/Dave.png" },
  { kit: "dln", src: `${HOME}/DLN/Site/public/brief/PNGs/logos-14.png`, dest: "press/dln/logos-14.png" },
  { kit: "dln", src: `${HOME}/DLN/Site/public/brief/PNGs/DLN.png`, dest: "press/dln/DLN.png" },
  { kit: "dln", src: `${HOME}/DLN/Site/public/brief/PNGs/DLNWhite.png`, dest: "press/dln/DLNWhite.png" },
  { kit: "dln", src: `${HOME}/DLN/Site/public/brief/PNGs/DLNLOGO.png`, dest: "press/dln/DLNLOGO.png" },
];

export async function harvestPress(): Promise<string[]> {
  const out: string[] = [];
  await harvestTree(`${HOME}/ModYu/Site/public/assets/brand`, "press/modyu/brand", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/people`, "press/modyu/people", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/guide`, "press/modyu/guide", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/journey`, "press/modyu/journey", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/lifestyle`, "press/modyu/lifestyle", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/phases`, "press/modyu/phases", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/social`, "press/modyu/social", 0, out);
  await harvestTree(`${HOME}/ModYu/Site/public/assets/voices`, "press/modyu/voices", 0, out);
  await harvestFlat(`${HOME}/ModYu/Site/public/assets/products`, "press/modyu/products", out);
  await harvestTree(`${HOME}/DAA/Site/public/brand`, "press/daa/brand", 0, out);
  await harvestTree(`${HOME}/DAA/Site/public/media`, "press/daa/media", 0, out);
  await harvestTree(`${HOME}/DAA/assets/logo-tests`, "press/daa/mark", 0, out);
  await harvestFlat(`${HOME}/DAA/_meta/assets`, "press/daa/docs", out);
  await harvestTree(`${HOME}/DAA/Site/public/docs`, "press/daa/docs", 0, out);
  await harvestTree(`${HOME}/PFP/Site/public/plates`, "press/pfp/plates", 0, out);
  await harvestTree(`${HOME}/SwarmFund/apps/web/public/brand`, "press/swarm/brand", 0, out);
  for (const row of SINGLES) {
    const href = await copyOne(row.src, row.dest);
    if (href) out.push(href);
  }
  return out;
}

export function kitFromPressHref(href: string): string | undefined {
  const m = href.match(/^\/press\/([^/]+)\//);
  return m ? m[1] : undefined;
}

export function shouldKeepHref(href: string): boolean {
  if (href.startsWith("/press/")) return true;
  if (href.startsWith("/brand/")) return true;
  if (href.startsWith("/brief/Frameworks/")) return true;
  if (href.startsWith("/plots/modyu")) return true;
  if (href.startsWith("/plots/swarm")) return true;
  if (href.startsWith("/plots/various-titles")) return true;
  return false;
}

export function autoPackHref(href: string): boolean {
  const n = href.toLowerCase();
  if (n.includes("/play/")) return false;
  if (n.includes("/icons/")) return false;
  if (n.includes("/voices/")) return false;
  if (n.includes("/journey/")) return false;
  if (n.includes("/press/daa/mark/") && !n.includes("mark-as-shipped")) return false;
  if (n.includes("/media/insights/") || n.includes("/media/hypertrack/") || n.includes("/media/decoders/")) {
    return false;
  }
  if (n.includes("/guide/") && !/what-is-ht4|evidence-you-can-trust|why-aftercare-is-inconsistent/.test(n)) {
    return false;
  }
  if (n.includes("/people/panel")) return false;
  if (
    n.includes("/products/") &&
    !/lineup|ht4-system|clinic-pack\.png|ht4-box/.test(n)
  ) {
    return false;
  }
  if (n.includes("/lifestyle/") && !/founder-headshot|about-follicle-files|product-photo/.test(n)) {
    return false;
  }
  if (
    n.includes("/phases/") &&
    !/p1-balance\.|p2-cleanse\.|p3-hydrate\.|p3-comfort\.|p3-bathe\.|p4-nourish\.|p4-protect\./.test(n)
  ) {
    return false;
  }
  if (n.includes("/social/") && !/still-bottles|ig-home-1/.test(n)) return false;
  if (n.includes("/media/office/") && !/office-0[1-4]\.jpg/.test(n)) return false;
  if (n.includes("mark-barlow-live")) return false;

  if (n.includes("logo")) return true;
  if (n.includes("mark-as-shipped") || n.includes("swarm-fund-mark")) return true;
  if (/dln-(mute|white|ink)\./.test(n)) return true;
  if (n.includes("people-hero") || n.includes("ht4-people-banner") || n.includes("founder-headshot")) return true;
  if (n.includes("ht4-system-banner") || n.includes("ht4-system.png") || n.includes("ht4-system-main")) return true;
  if (n.includes("bottles-lineup")) return true;
  if (n.endsWith("/clinic-pack.png") || n.includes("ht4-box")) return true;
  if (/field-(mist|gold|sand|teal|navy|ink|gap)\./.test(n)) return true;
  if (/\/media\/people\/(mark-barlow|greisy-flores|council)\./.test(n)) return true;
  if (n.includes("/media/plates/")) return true;
  if (/\/media\/office\/office-0[1-4]\.jpg/.test(n)) return true;
  if (n.includes("about-follicle-files") || n.includes("follicle-files-mid") || n.includes("folliclefiles")) {
    return true;
  }
  if (/\/phases\/(p1-balance|p2-cleanse|p3-hydrate|p3-comfort|p3-bathe|p4-nourish|p4-protect)\./.test(n)) {
    return true;
  }
  if (n.includes("/social/still-bottles") || n.includes("/social/ig-home-1")) return true;
  if (n.includes("/lifestyle/product-photo") || n.includes("/lifestyle/founder-headshot")) return true;
  if (n.includes("paulfosbury")) return true;
  if (n.includes("logos-07") || n.includes("logos-13") || n.includes("logos-14") || n.includes("logos-15")) {
    return true;
  }
  if (n.endsWith("/swarm.svg") || n.includes("swarm-fund-logo")) return true;
  if (n.includes("various-titles") || n.includes("vt-logo") || n.includes("vt-mute") || n.includes("vt-white")) {
    return true;
  }
  if (n.includes("/daa.png") || n.includes("daa-logo")) return true;
  if (n.includes("framework/01-comms")) return true;
  if (n.endsWith("/dave.png")) return true;
  return false;
}
