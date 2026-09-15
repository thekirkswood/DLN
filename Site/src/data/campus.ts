import { OFFERS, type Facet } from "@/data/needs";

export const DAVE_SENTENCE =
  "We build, scale, and secure resilient brand identity presences on screen and in print.";

export const SCALES = [
  { id: "sole-trader", label: "Sole trader" },
  { id: "bigger-business", label: "Bigger business" },
  { id: "corporation", label: "Corporation" },
] as const;

export type ScaleId = (typeof SCALES)[number]["id"];

export const DIVISIONS = [
  { id: "design", label: "Design", colour: "#db328a" },
  { id: "marketing", label: "Marketing", colour: "#f26822" },
  { id: "hr", label: "HR", colour: "#00aeef" },
] as const;

export type DivisionId = (typeof DIVISIONS)[number]["id"];

export const CAMPUS_NEUTRAL = "#414141";

/** Inference book for a plot board. Not public Strategy copy. Growing — extra bits live on the plot file. */
export const BRAND_BITS_LEFT = [
  { id: "identity", label: "Identity statements" },
  { id: "mission", label: "Mission" },
  { id: "vision", label: "Vision" },
  { id: "proposition", label: "Proposition" },
  { id: "purpose", label: "Purpose" },
  { id: "big-idea", label: "Big idea" },
  { id: "positioning", label: "Positioning" },
  { id: "differentiation", label: "Differentiation" },
  { id: "value", label: "Value proposition" },
  { id: "brand-type", label: "Brand type" },
  { id: "promise", label: "Promise" },
  { id: "features", label: "Features" },
  { id: "benefit", label: "Benefit" },
  { id: "location", label: "Location" },
  { id: "people", label: "People" },
  { id: "founder", label: "Founder story" },
  { id: "personality", label: "Personality" },
  { id: "standards", label: "Standards" },
  { id: "ethics", label: "Ethics" },
  { id: "philosophy", label: "Philosophy" },
] as const;

export const BRAND_BITS_TOP = [
  { id: "prep", label: "Prep and Plan" },
  { id: "sandbox", label: "Sandbox" },
  { id: "greenhouse", label: "Greenhouse Workstation" },
  { id: "diagnostic", label: "Diagnostic Loop" },
] as const;

export const PIPELINE_STAGES = [
  "The Project",
  "The People",
  "Research, Analytics and Discovery",
  "Initial Ideas",
  "The Concept",
  "The Build",
  "The Implementation",
  "The Guardianship",
] as const;

export const QUALIFY_KEY = "dln-qualify";
export const LAST_PLOT_KEY = "dln-last-plot";

export function readLastPlot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_PLOT_KEY);
  } catch {
    return null;
  }
}

export function writeLastPlot(slug: string) {
  try {
    window.localStorage.setItem(LAST_PLOT_KEY, slug);
  } catch {
    /* */
  }
}

export function scaleById(id: string): (typeof SCALES)[number] | undefined {
  return SCALES.find((s) => s.id === id);
}

export function divisionById(id: string): (typeof DIVISIONS)[number] | undefined {
  return DIVISIONS.find((d) => d.id === id);
}

export function pointsForScale(facet: Facet, scale: ScaleId | null): string[] {
  const all = OFFERS.find((o) => o.id === facet)?.points || [];
  if (!scale || scale === "bigger-business" || scale === "corporation") {
    return all;
  }
  if (facet === "build") return ["Simple sites", "Interactive Workspaces"];
  if (facet === "design") return ["Logos", "Brand Identity Systems"];
  return ["How we work", "Start-up Strategy", "Brand Strategy"];
}

export function pipelineForScale(scale: ScaleId | null): string[] {
  if (scale === "sole-trader") return ["Prep and Plan", "Live host"];
  if (scale === "corporation") return [...PIPELINE_STAGES];
  if (scale === "bigger-business") {
    return [
      "Prep and Plan",
      "Private preview",
      "The Build",
      "The Implementation",
      "Live host",
    ];
  }
  return [...PIPELINE_STAGES];
}

export function lineForScale(scale: ScaleId): string {
  if (scale === "sole-trader") {
    return "You are a sole trader. We start with a simple site, done properly, and a space people can actually work in.";
  }
  if (scale === "bigger-business") {
    return "You are a bigger business. Design, Strategy, and Build sit at full depth, with a private preview beside the live site, and more of the eight stages.";
  }
  return "You are a corporation. Design, marketing, and HR each have a colour. Design Lab North are one studio.";
}

export function defaultNeedForScale(scale: ScaleId): string {
  if (scale === "sole-trader") return "web-simple-site";
  if (scale === "corporation") return "web-corporate";
  return "startup-blueprint";
}

export const HERE_FOR = [
  {
    id: "design" as const,
    label: "Design",
    line: "Identity, print, packaging, the look of the thing.",
  },
  {
    id: "strategy" as const,
    label: "Strategy",
    line: "Brand, marketing, audits, counsel, how we work.",
  },
  {
    id: "build" as const,
    label: "Build",
    line: "Sites, workspaces, apps — we host it while it grows.",
  },
] as const;

export const ACCESS = [
  {
    id: "new-work",
    label: "New work",
    line: "Start Design, Strategy, or Build with us.",
  },
  {
    id: "plot",
    label: "A live site with us",
    line: "We host it while it grows — notes in, we come in.",
  },
  {
    id: "client",
    label: "I already have a site",
    line: "Sign in to your sites and your invoices.",
  },
  {
    id: "board",
    label: "The brand board",
    line: "The people on the work, in one view.",
  },
  {
    id: "learn",
    label: "To learn",
    line: "How we work, and Various Titles.",
  },
  {
    id: "supplier",
    label: "Approved Supplier",
    line: "Social work in the region. We stay on Design, Strategy, and Build.",
  },
] as const;

export type AccessId = (typeof ACCESS)[number]["id"];

export type Qualify = {
  name: string;
  email: string;
  phone?: string;
  scale: ScaleId;
  hereFor: Facet[];
  lines: string[];
  access: AccessId;
  needId: string;
  message?: string;
};

export type PlotOpen =
  | { kind: "login"; next: "/account" | "/board" }
  | { kind: "room"; room: "host" | "engine" | "supplier" }
  | { kind: "line"; id: string }
  | { kind: "door"; id: Facet };

export function accessById(id: string): (typeof ACCESS)[number] | undefined {
  return ACCESS.find((a) => a.id === id);
}

export function needIdFromQualify(
  scale: ScaleId,
  hereFor: Facet[],
  firstNeedId?: string,
  access?: AccessId,
): string {
  if (access === "supplier") return "social-supplier";
  if (firstNeedId) return firstNeedId;
  if (hereFor.includes("build")) return defaultNeedForScale(scale);
  if (hereFor.includes("design")) return "design-assets-logo";
  if (hereFor.includes("strategy")) return "consultancy-session";
  return defaultNeedForScale(scale);
}

export function bookMessage(row: {
  scale: ScaleId;
  hereFor: Facet[];
  lineNames: string[];
  access: AccessId;
  message?: string;
}): string {
  const doors = HERE_FOR.filter((h) => row.hereFor.includes(h.id)).map(
    (h) => h.label,
  );
  const access = accessById(row.access);
  return [
    `Scale: ${scaleById(row.scale)?.label || row.scale}`,
    `Here for: ${doors.join(", ") || "—"}`,
    row.lineNames.length ? `Specifically: ${row.lineNames.join(", ")}` : "",
    access ? `Access: ${access.label}` : "",
    row.message || "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function plotOpen(row: Qualify): PlotOpen {
  if (row.access === "client") return { kind: "login", next: "/account" };
  if (row.access === "board") return { kind: "login", next: "/account" };
  if (row.access === "supplier") return { kind: "room", room: "supplier" };
  if (row.access === "learn") return { kind: "room", room: "engine" };
  if (row.access === "plot") return { kind: "room", room: "host" };
  if (row.lines[0]) return { kind: "line", id: row.lines[0] };
  return { kind: "door", id: row.hereFor[0] || "design" };
}

function asHereFor(value: unknown): Facet[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (id): id is Facet =>
      id === "design" || id === "strategy" || id === "build",
  );
}

function asLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((id) => String(id)).filter(Boolean);
}

function asAccess(value: unknown): AccessId {
  return ACCESS.some((a) => a.id === value) ? (value as AccessId) : "new-work";
}

export function readQualify(): Qualify | null {
  try {
    const raw = sessionStorage.getItem(QUALIFY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Qualify;
    if (!parsed?.scale || !parsed?.name) return null;
    return {
      ...parsed,
      hereFor: asHereFor(parsed.hereFor),
      lines: asLines(parsed.lines),
      access: asAccess(parsed.access),
    };
  } catch {
    return null;
  }
}

export function writeQualify(row: Qualify) {
  try {
    sessionStorage.setItem(QUALIFY_KEY, JSON.stringify(row));
  } catch {
    /* ignore */
  }
}
