import { headers } from "next/headers";
import type { Plot } from "@/lib/plot-types";
import { allPlots, plotBySlug } from "@/lib/plots";
import { isLabHost } from "@/lib/lab-host";

export { isLabHost, labStationPath } from "@/lib/lab-host";

export type LabHouse = {
  slug: string;
  name: string;
  housePath: string;
  localPort: number | null;
  github: string;
  inboxRel: string;
};

const DLN_HOUSE: LabHouse = {
  slug: "dln",
  name: "Design Lab North",
  housePath: "/home/main/DLN",
  localPort: 3010,
  github: "thekirkswood/DLN",
  inboxRel: "_meta/lab-inbox",
};

export function labHostFromHeaders(): boolean {
  return isLabHost(headers().get("host"));
}

export function labHouseFromPlot(plot: Plot): LabHouse | undefined {
  if (!plot.lab?.housePath) return undefined;
  return {
    slug: plot.slug,
    name: plot.name,
    housePath: plot.lab.housePath,
    localPort: plot.lab.localPort ?? null,
    github: plot.lab.github || "",
    inboxRel: plot.lab.inboxRel || "_meta/lab-inbox",
  };
}

export async function resolveHouse(slug: string): Promise<LabHouse | undefined> {
  if (slug === "dln") return DLN_HOUSE;
  const plot = await plotBySlug(slug);
  return plot ? labHouseFromPlot(plot) : undefined;
}

export async function allLabHouses(): Promise<LabHouse[]> {
  const plots = await allPlots();
  const houses = plots
    .map(labHouseFromPlot)
    .filter((h): h is LabHouse => Boolean(h));
  return [DLN_HOUSE, ...houses];
}

export function labBasePath(slug: string): string {
  return `/go/${slug}`;
}

export function proxyPath(slug: string, inner = "/"): string {
  const path = inner.startsWith("/") ? inner : `/${inner}`;
  if (slug === "dln") return path;
  if (path === "/") {
    return slug === "swarm" ? `${labBasePath(slug)}/` : labBasePath(slug);
  }
  return `${labBasePath(slug)}${path}`;
}

export function startHint(house: LabHouse): string {
  if (!house.localPort) {
    return "No local server yet. This station is a folder on this PC — talk to the builder from the desk, then we make the site inside it.";
  }
  const base = labBasePath(house.slug);
  if (house.slug === "swarm") {
    return `cd ${house.housePath}/apps/web && VITE_BASE=${base}/ npm run dev`;
  }
  return `cd ${house.housePath}/Site && BASE_PATH=${base} npm run dev`;
}
