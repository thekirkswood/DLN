import type { AssetLane } from "@/lib/assets-view";

export type ShotAvenue = "brand" | "social" | "editorial";
export type SteerMode = "naked" | "plus";

export type PictureExtras = {
  who?: string;
  where?: string;
  product?: string;
  mustKeep?: string;
  avenue?: ShotAvenue;
  promo?: string;
  plotName?: string;
};

export type PictureAttach = {
  id: string;
  note: string;
  href?: string;
  lane?: AssetLane;
  title?: string;
};

export type PictureSteer = {
  prompt: string;
  cleaned: string;
  avenue: ShotAvenue;
  setting: string;
  missing: string[];
  provider: "heuristic";
};

const TYPOS: Array<[RegExp, string]> = [
  [/\brecieved\b/gi, "received"],
  [/\bseperate\b/gi, "separate"],
  [/\bdefinately\b/gi, "definitely"],
  [/\boccured\b/gi, "occurred"],
  [/\blightening\b/gi, "lighting"],
  [/\bbeacuse\b/gi, "because"],
  [/\bwierd\b/gi, "weird"],
  [/\bpicutre\b/gi, "picture"],
  [/\bshes\b/gi, "She's"],
  [/\bdont\b/gi, "don't"],
  [/\bcant\b/gi, "can't"],
  [/\bwont\b/gi, "won't"],
];

const SETTINGS: Array<{ test: RegExp; name: string; recipe: string }> = [
  {
    test: /\b(bathroom|shower|wet room|en.?suite|basin|tiles)\b/i,
    name: "bathroom",
    recipe:
      "Wet-room set. Porcelain and stone, cool north daylight from a high window, slight clean steam, no yellow tungsten. 35mm, chest height. Grade: desaturated teal-grey, whites stay white.",
  },
  {
    test: /\b(kitchen|counter|sink|hob|stove)\b/i,
    name: "kitchen",
    recipe:
      "Working kitchen, one clean surface. Soft window key from camera left, bounce fill. 50mm. Grade: warm neutrals, no orange street sodium.",
  },
  {
    test: /\b(landscape|mountain|field|horizon|valley|coast|ocean|sky)\b/i,
    name: "landscape",
    recipe:
      "Wide still, deep background, held horizon. Natural weather light only. 35mm or wider. Grade: open shadows, true sky, no heavy teal-orange.",
  },
  {
    test: /\b(street|city|pavement|alley|night)\b/i,
    name: "street",
    recipe: "Public street, one subject. Available light plus a held bounce. 35mm. Grade: city neutrals, no crushed blacks.",
  },
  {
    test: /\b(office|desk|meeting|studio apartment)\b/i,
    name: "interior",
    recipe: "Lived interior, one clear plane behind the subject. Soft practicals, no mixed colour casts. 50mm.",
  },
  {
    test: /\b(studio|cyc|pack shot|lockup|white void|infinite)\b/i,
    name: "pack",
    recipe: "Controlled pack set. Even key, soft edge, infinite or quiet cyc. 80–100mm. No lifestyle clutter.",
  },
];

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tidyLine(line: string, plotName?: string) {
  let next = line.replace(/\s+/g, " ").trim();
  for (const [from, to] of TYPOS) next = next.replace(from, to);
  const brand = (plotName || "").trim();
  if (brand.length >= 3) {
    next = next.replace(new RegExp(`\\b${escapeReg(brand)}\\b`, "ig"), brand);
  }
  if (next && !/[.!?]$/.test(next)) next = `${next}.`;
  return next;
}

export function detectAvenue(line: string, extras?: PictureExtras): ShotAvenue {
  if (extras?.avenue) return extras.avenue;
  const hay = `${line} ${extras?.where || ""}`;
  if (/\b(instagram|tiktok|story|social|casual|selfie|dump)\b/i.test(hay)) return "social";
  if (
    /\b(landscape|nature|editorial|documentary|candid)\b/i.test(hay) &&
    !/\b(bottle|can|pack|logo|product)\b/i.test(hay)
  ) {
    return "editorial";
  }
  return "brand";
}

function sceneOf(line: string, extras?: PictureExtras) {
  const fromWhere = extras?.where ? SETTINGS.find((item) => item.test.test(extras.where || "")) : undefined;
  if (fromWhere) return fromWhere;
  return (
    SETTINGS.find((item) => item.test.test(line)) || {
      name: "set",
      recipe: "Quiet set. One key, one bounce, one background. 50mm, eye level. Grade matches the place, not a preset.",
    }
  );
}

function avenueCopy(avenue: ShotAvenue) {
  if (avenue === "social") {
    return "Living social still. Honest and close, still finished. Phone-adjacent, not sloppy. Product readable.";
  }
  if (avenue === "editorial") {
    return "Editorial still. Unposed light. No product hero unless the line asks for it. No lockup invented.";
  }
  return "Commissioned brand still. Art-directed, not a phone snap. Booked talent. Product is the hero when it is in the shot.";
}

function typeLock(avenue: ShotAvenue) {
  if (avenue === "editorial") return "Do not invent a logo, label, or lettering.";
  return "Copy real type only from attached pack or logo assets. If no pack photo is attached, keep the container plain — no invented words, no fake lockup.";
}

function attachLine(item: PictureAttach) {
  const note = item.note.trim();
  const title = item.title?.trim();
  if (note) return `From the ${item.lane || "picture"} still${title ? ` (${title})` : ""}: ${note}.`;
  if (item.lane === "pack") return "From the pack still: use this exact product — copy type, cap, and finish.";
  if (item.lane === "logo") return "From the logo still: use this mark only if the shot needs it.";
  if (item.lane === "people") return "From this person: keep their look from this still.";
  if (item.lane === "promo") {
    return `From the promotion${title ? ` ${title}` : ""}. Stay in that campaign.`;
  }
  if (item.lane === "banner") return "From this setting still. Keep the place.";
  return "A reference still is attached. Take only what the shot needs.";
}

export function missingAssets(line: string, extras: PictureExtras | undefined, attaches: PictureAttach[]) {
  const missing: string[] = [];
  const hay = `${line} ${extras?.product || ""}`;
  const wantsProduct = /\b(bottle|can|pack|logo|label|product|sku)\b/i.test(hay);
  const hasLogo = attaches.some((item) => item.lane === "logo");
  const hasPack = attaches.some((item) => item.lane === "pack");
  const mentionedPicture = /\b(photo|picture|image|shot of|the one of|like the)\b/i.test(line);
  if (wantsProduct && !hasPack) missing.push("a real pack photo so type is copied, not invented");
  if (wantsProduct && !hasLogo) missing.push("the logo file if the mark must appear");
  if (mentionedPicture && attaches.length === 0) {
    missing.push("the picture you mentioned — open assets and attach it");
  }
  return missing;
}

export function steerPicture(
  line: string,
  input?: { mode?: SteerMode; extras?: PictureExtras; attaches?: PictureAttach[] },
): PictureSteer {
  const extras = input?.extras || {};
  const mode = input?.mode || "naked";
  const attaches = input?.attaches || [];
  const cleaned = tidyLine(line, extras.plotName);
  const avenue = detectAvenue(cleaned, extras);
  const scene = sceneOf(cleaned, extras);
  const missing = missingAssets(cleaned, extras, attaches);
  const used = attaches.map(attachLine).filter(Boolean);
  const house = extras.plotName?.trim();
  const parts = [
    cleaned,
    house ? `This still is for ${house}. Stay true to that account.` : "",
    mode === "plus" && extras.who ? `Subject: ${extras.who}.` : "",
    mode === "plus" && extras.where ? `Place: ${extras.where}.` : "",
    mode === "plus" && extras.product
      ? `Product: ${extras.product}. Use the attached pack. Do not invent a new object.`
      : "",
    mode === "plus" && extras.mustKeep ? `Must stay true: ${extras.mustKeep}.` : "",
    extras.promo ? `This still is for the promotion: ${extras.promo}. Keep that campaign.` : "",
    ...used,
    avenueCopy(avenue),
    scene.recipe,
    typeLock(avenue),
  ].filter(Boolean);

  return {
    prompt: parts.join(" "),
    cleaned,
    avenue,
    setting: scene.name,
    missing,
    provider: "heuristic",
  };
}
