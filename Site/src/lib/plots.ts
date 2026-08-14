import { promises as fs } from "fs";
import path from "path";

export type Plot = {
  slug: string;
  name: string;
  status: "growing" | "resting" | "migrated";
  kind: "rebuild" | "new" | "brand";
  /** Who the plot belongs to. Studio plots may be listed without a host. */
  party: "client" | "studio";
  hosts: string[];
  /** Full URL for “Enter the plot”. Prefer this over hosts[0] while DNS catches up. */
  enterUrl?: string;
  localPreview: string;
  public: boolean;
  voice: string;
  logoPaper?: string;
  logoInk?: string;
  /** Extra status beside growing, e.g. “beta test”. Choozlist only for now. */
  badge?: string;
  /** Shown on the plot story, not the homepage. */
  betaContact?: string;
};

const FILE = path.join(process.cwd(), "..", "greenhouse", "plots.json");

export async function allPlots(): Promise<Plot[]> {
  const raw = await fs.readFile(FILE, "utf8");
  const parsed = JSON.parse(raw) as Plot[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function publicPlots(): Promise<Plot[]> {
  return (await allPlots()).filter((p) => p.public);
}

export async function plotBySlug(slug: string): Promise<Plot | undefined> {
  return (await allPlots()).find((p) => p.slug === slug);
}

export function enterUrlFor(plot: Plot): string | null {
  if (plot.enterUrl) return plot.enterUrl;
  if (plot.hosts[0]) return `https://${plot.hosts[0]}`;
  return null;
}

export function statusLabel(plot: Plot): string {
  if (plot.badge) return `${plot.status} - ${plot.badge}`;
  return plot.status;
}
