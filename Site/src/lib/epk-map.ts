import { KIT_COPY } from "@/lib/epk-copy";

export function isKitId(id: string): boolean {
  return KIT_COPY.some((k) => k.id === id);
}

export function kitName(id: string): string {
  return KIT_COPY.find((k) => k.id === id)?.name || id;
}

/** Hub kit id for a plot / lab house slug. Lab and Choozlist have none. */
export function pressKitForPlot(slug: string): string | null {
  if (!slug || slug === "builder" || slug === "choozlist") return null;
  if (slug === "various-titles") return "titles";
  if (slug === "swarm-web") return "swarm";
  const kit = slug === "swarm" ? "swarm" : slug;
  return isKitId(kit) ? kit : null;
}

/** Unique hub path for that house’s kit. Never reuse another kit’s URL. */
export function epkHref(kit: string, rest = ""): string {
  const tail = rest.replace(/^\/+/, "");
  return tail ? `/epk/${kit}/${tail}` : `/epk/${kit}`;
}

/** Journalist dest after a code. Must stay on that kit. */
export function safeEpkNext(kit: string, next?: string | null): string {
  const fallback = epkHref(kit);
  const raw = (next || "").trim();
  if (!raw.startsWith("/")) return fallback;
  if (raw === fallback || raw.startsWith(`${fallback}/`)) return raw;
  return fallback;
}

export function plotsForKit(kit: string): string[] {
  if (kit === "titles") return ["various-titles"];
  if (kit === "swarm") return ["swarm", "swarm-web"];
  if (kit === "dln") return [];
  return isKitId(kit) ? [kit] : [];
}
