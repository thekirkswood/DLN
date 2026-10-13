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
    test: /\b(pack shot|cyc|white void|infinite backdrop|lockup shot)\b/i,
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
  if (/\b(landscape|nature|editorial|documentary|candid)\b/i.test(hay)) return "editorial";
  return "brand";
}

function sceneOf(line: string, extras?: PictureExtras) {
  const fromWhere = extras?.where ? SETTINGS.find((item) => item.test.test(extras.where || "")) : undefined;
  if (fromWhere) return fromWhere;
  return SETTINGS.find((item) => item.test.test(line)) || null;
}

function avenueCopy(avenue: ShotAvenue) {
  if (avenue === "social") return "Finish as a living social still: close, honest, not sloppy.";
  if (avenue === "editorial") return "Finish as an editorial still: unposed light, no invented lockup.";
  return "Finish as a commissioned still: held and art-directed, true to the line. Do not add a product, a pack, or people the line did not ask for.";
}

function typeLock(attaches: PictureAttach[]) {
  const hasType = attaches.some((item) => item.lane === "logo" || item.lane === "pack");
  if (hasType) {
    return "Attached stills are pixel references, not mood. Copy type and marks only from those pictures. Do not invent, redraw, or restyle a logo, label, or lettering.";
  }
  return "Do not invent a logo, label, or lettering.";
}

function anatomyLock() {
  return "Hands and fingers anatomically correct: five digits, right way round, no extra limbs, no mirrored palms. Do not default to glossy photoreal, CGI skin, or beauty retouch unless the line asks for a photograph.";
}

function attachLine(item: PictureAttach) {
  const note = item.note.trim();
  const title = item.title?.trim();
  const named = title ? `"${title}"` : "attached still";
  let role = `The ${named} is a pixel reference. Take only what the prompt asks from it.`;
  if (item.lane === "logo") {
    role = `The ${named} is the brand mark, sent as a picture. Place that exact lockup where the line says. Do not redraw, restyle, or invent a substitute.`;
  } else if (item.lane === "pack") {
    role = `The ${named} is the real pack. Copy shape, type, and finish. Do not invent a product.`;
  } else if (item.lane === "people") {
    role = `The ${named} is the person. Keep likeness.`;
  } else if (item.lane === "promo" || item.lane === "banner") {
    role = `The ${named} is campaign art. Keep its marks and layout cues.`;
  }
  if (note) return `${role} Use: ${note}.`;
  return role;
}

export function missingAssets(line: string, extras: PictureExtras | undefined, attaches: PictureAttach[]) {
  const missing: string[] = [];
  const hay = `${line} ${extras?.product || ""}`;
  const wantsMark = /\b(logo|wordmark|lockup|the mark)\b/i.test(hay);
  const wantsPack = /\b(pack shot|the pack|the bottle|the can|the label)\b/i.test(hay);
  const hasLogo = attaches.some((item) => item.lane === "logo");
  const hasPack = attaches.some((item) => item.lane === "pack");
  const mentionedPicture = /\b(photo|picture|image|shot of|the one of|like the)\b/i.test(line);
  if (wantsPack && !hasPack) missing.push("the pack still you mean — open assets and attach it");
  if (wantsMark && !hasLogo) missing.push("the mark if it must appear");
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
  const used = attaches.map(attachLine);
  const house = extras.plotName?.trim();
  const parts = [
    cleaned,
    house ? `This still is for ${house}.` : "",
    mode === "plus" && extras.who ? `Subject: ${extras.who}.` : "",
    mode === "plus" && extras.where ? `Place: ${extras.where}.` : "",
    mode === "plus" && extras.product ? `Product: ${extras.product}. Use an attached still if that is the object. Do not invent a new one.` : "",
    mode === "plus" && extras.mustKeep ? `Must stay true: ${extras.mustKeep}.` : "",
    extras.promo ? `This still is for the promotion: ${extras.promo}.` : "",
    ...used,
    avenueCopy(avenue),
    scene?.recipe || "",
    typeLock(attaches),
    anatomyLock(),
  ].filter(Boolean);

  return {
    prompt: parts.join(" "),
    cleaned,
    avenue,
    setting: scene?.name || "set",
    missing,
    provider: "heuristic",
  };
}
