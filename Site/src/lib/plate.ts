import type { Facet } from "@/data/needs";

export const PLATE_PATHS = ["/", "/design", "/strategy", "/build"] as const;

export const LAMPS = {
  design: "#db328a",
  strategy: "#f26822",
  build: "#fed402",
  houses: "#d3de29",
  session: "#00aeef",
  desk: "#662d91",
} as const;

export function isPlatePath(path: string): boolean {
  return (PLATE_PATHS as readonly string[]).includes(path);
}

export function facetFromPath(path: string): Facet | null {
  if (path === "/design") return "design";
  if (path === "/strategy") return "strategy";
  if (path === "/build") return "build";
  return null;
}

export function pathForFacet(facet: Facet | null): string {
  if (facet === "design") return "/design";
  if (facet === "strategy") return "/strategy";
  if (facet === "build") return "/build";
  return "/";
}
