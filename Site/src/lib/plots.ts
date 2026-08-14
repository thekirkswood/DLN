import { promises as fs } from "fs";
import path from "path";

export type Plot = {
  slug: string;
  name: string;
  status: "growing" | "resting" | "migrated";
  kind: "rebuild" | "new" | "brand";
  hosts: string[];
  localPreview: string;
  public: boolean;
  voice: string;
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
