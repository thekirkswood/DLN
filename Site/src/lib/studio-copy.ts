import type { AssetLane } from "@/lib/assets-view";

export type TextKind = "press" | "social" | "slides";

export type TextExtras = {
  audience?: string;
  offer?: string;
  cta?: string;
  mustKeep?: string;
  plotName?: string;
};

export type TextAttach = {
  id: string;
  href?: string;
  title?: string;
  lane?: AssetLane | string;
  note?: string;
  kind?: string;
};

export type TextSteer = {
  kind: TextKind;
  title: string;
  cleaned: string;
  setting: string;
  missing: string[];
  system: string;
  user: string;
};

const KINDS: TextKind[] = ["press", "social", "slides"];

export function asTextKind(value?: string): TextKind {
  const next = String(value || "").trim().toLowerCase();
  return KINDS.includes(next as TextKind) ? (next as TextKind) : "press";
}

function tidy(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function attachLines(attaches?: TextAttach[]) {
  if (!attaches?.length) return "No files attached from the vault.";
  return attaches
    .map((item, i) => {
      const bit = [item.title || item.id, item.lane, item.note].filter(Boolean).join(" — ");
      return `${i + 1}. ${bit}`;
    })
    .join("\n");
}

function missingOf(kind: TextKind, extras?: TextExtras, attaches?: TextAttach[]) {
  const missing: string[] = [];
  if (!tidy(extras?.audience || "") && kind !== "slides") missing.push("who this is for");
  if (!tidy(extras?.offer || "") && !tidy(extras?.cta || "")) missing.push("the offer or the call to action");
  if (!attaches?.length && kind !== "social") missing.push("a still from the vault if the page should carry pictures");
  return missing;
}

export function steerText(
  line: string,
  opts?: {
    kind?: TextKind;
    title?: string;
    extras?: TextExtras;
    attaches?: TextAttach[];
  },
): TextSteer {
  const kind = opts?.kind || "press";
  const extras = opts?.extras || {};
  const attaches = opts?.attaches || [];
  const brand = tidy(extras.plotName || "") || "this house";
  const cleaned = tidy(line);
  const audience = tidy(extras.audience || "") || "the people who already care about this brand";
  const offer = tidy(extras.offer || "");
  const cta = tidy(extras.cta || "");
  const mustKeep = tidy(extras.mustKeep || "");
  const title =
    tidy(opts?.title || "") ||
    (kind === "social" ? `${brand} · social` : kind === "slides" ? `${brand} · slides` : `${brand} · press`);

  const setting =
    kind === "social"
      ? "A social caption: one voice, one offer, one ask."
      : kind === "slides"
        ? "A short deck for a room — title, idea, proof, next step."
        : "A press or promoter one-pager they can send as a PDF.";

  const houseVoice = [
    "Write as Design Lab North writing for the brand named below.",
    "UK English. Plain, clean, modern. No agency-speak, no hype, no invented facts.",
    "Use only what the brief and the attached vault files give you. If a fact is missing, leave it out.",
    "Do not mention Design Lab North, Instant updates, tokens, or the studio software.",
    "Return JSON only. No markdown fences.",
  ].join(" ");

  const schema =
    kind === "social"
      ? '{"title":"","caption":"","cta":"","hashtags":[]}'
      : kind === "slides"
        ? '{"title":"","deck":[{"title":"","lines":[""]}]}'
        : '{"title":"","headline":"","standfirst":"","body":"","cta":"","contact":""}';

  const job =
    kind === "social"
      ? "Write the caption for a social post. Steer it to the named audience. Put the call to action in cta. Hashtags only if they are useful, never a dump."
      : kind === "slides"
        ? "Write a meeting deck. Five to eight slides. Each slide: a short title and two to five lines. First slide is the idea. Last slide is the ask."
        : "Write a press or promoter document. Headline, standfirst, body (two or three short paragraphs), a clear call to action, and a contact line if one was given.";

  const system = `${houseVoice} ${job} Schema: ${schema}`;

  const user = [
    `Brand: ${brand}`,
    `Job: ${kind}`,
    `Title: ${title}`,
    `Audience: ${audience}`,
    offer ? `Offer: ${offer}` : "",
    cta ? `Call to action: ${cta}` : "",
    mustKeep ? `Must stay true: ${mustKeep}` : "",
    `Brief: ${cleaned}`,
    "Vault files (use these; do not invent other pictures):",
    attachLines(attaches),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    kind,
    title,
    cleaned,
    setting,
    missing: missingOf(kind, extras, attaches),
    system,
    user,
  };
}

export type PressCopy = {
  title: string;
  headline: string;
  standfirst: string;
  body: string;
  cta: string;
  contact: string;
};

export type SocialCopy = {
  title: string;
  caption: string;
  cta: string;
  hashtags: string[];
};

export type SlidesCopy = {
  title: string;
  deck: { title: string; lines: string[] }[];
};

function asRecord(raw: string): Record<string, unknown> {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function parsePressCopy(raw: string, fallbackTitle: string): PressCopy {
  const data = asRecord(raw);
  const body = str(data.body) || raw.trim();
  return {
    title: str(data.title, fallbackTitle),
    headline: str(data.headline, fallbackTitle),
    standfirst: str(data.standfirst),
    body,
    cta: str(data.cta),
    contact: str(data.contact),
  };
}

export function parseSocialCopy(raw: string, fallbackTitle: string): SocialCopy {
  const data = asRecord(raw);
  const tags = Array.isArray(data.hashtags)
    ? data.hashtags.filter((item): item is string => typeof item === "string")
    : [];
  return {
    title: str(data.title, fallbackTitle),
    caption: str(data.caption) || raw.trim(),
    cta: str(data.cta),
    hashtags: tags,
  };
}

export function parseSlidesCopy(raw: string, fallbackTitle: string): SlidesCopy {
  const data = asRecord(raw);
  const deck = Array.isArray(data.deck)
    ? data.deck
        .map((slide) => {
          if (!slide || typeof slide !== "object") return null;
          const row = slide as { title?: unknown; lines?: unknown };
          const lines = Array.isArray(row.lines)
            ? row.lines.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
            : [];
          return { title: str(row.title), lines };
        })
        .filter((slide): slide is { title: string; lines: string[] } => Boolean(slide && (slide.title || slide.lines.length)))
    : [];
  if (!deck.length) {
    return {
      title: fallbackTitle,
      deck: [
        { title: fallbackTitle, lines: raw.trim() ? [raw.trim()] : ["The deck is empty — write a clearer brief."] },
      ],
    };
  }
  return { title: str(data.title, fallbackTitle), deck };
}

export function socialPlain(copy: SocialCopy) {
  const tags = copy.hashtags.length ? `\n\n${copy.hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")}` : "";
  const ask = copy.cta ? `\n\n${copy.cta}` : "";
  return `${copy.caption}${ask}${tags}`.trim();
}
