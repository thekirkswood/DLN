import { promises as fs } from "fs";
import path from "path";
import type { Plot } from "@/lib/plot-types";
import { enterUrlFor, hostUrlFor } from "@/lib/plot-urls";

export type { Plot } from "@/lib/plot-types";
export { enterUrlFor, hostUrlFor, statusLabel } from "@/lib/plot-urls";

const FILE = path.join(process.cwd(), "..", "greenhouse", "plots.json");

export async function allPlots(): Promise<Plot[]> {
  const raw = await fs.readFile(FILE, "utf8");
  const parsed = JSON.parse(raw) as Plot[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function publicPlots(): Promise<Plot[]> {
  return (await allPlots()).filter((p) => p.public);
}

/** Studio products shown on the greenhouse and homepage growing list. */
export async function greenhousePlots(): Promise<Plot[]> {
  const order = ["various-titles", "swarm", "choozlist"];
  const plots = (await publicPlots()).filter((p) => p.party === "studio");
  return plots.sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Client sites — live on the account, not the greenhouse. */
export async function clientPlots(): Promise<Plot[]> {
  return (await allPlots()).filter((p) => p.party === "client");
}

export async function plotBySlug(slug: string): Promise<Plot | undefined> {
  return (await allPlots()).find((p) => p.slug === slug);
}

export async function plotByHost(host: string): Promise<Plot | undefined> {
  const h = host.split(":")[0].toLowerCase();
  return (await allPlots()).find((p) =>
    p.hosts.some((row) => row.replace(/^https?:\/\//, "").split("/")[0].toLowerCase() === h),
  );
}

export async function hostedPlots(): Promise<Plot[]> {
  return (await allPlots()).filter((p) => hostUrlFor(p) || enterUrlFor(p));
}

export async function savePlots(plots: Plot[]): Promise<void> {
  await fs.writeFile(FILE, `${JSON.stringify(plots, null, 2)}\n`, "utf8");
}
