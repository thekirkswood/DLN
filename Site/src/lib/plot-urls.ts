import type { Plot } from "@/lib/plot-types";

export type { Plot } from "@/lib/plot-types";

export function enterUrlFor(plot: Plot): string | null {
  if (plot.enterUrl) return plot.enterUrl;
  return hostUrlFor(plot);
}

/** The plot on our host — studio jumps in here to check the growing copy. */
export function hostUrlFor(plot: Plot): string | null {
  const host = plot.hosts[0];
  if (!host) return null;
  if (host.startsWith("http://") || host.startsWith("https://")) return host;
  return `https://${host}`;
}

export function statusLabel(plot: Plot): string {
  if (plot.badge) return `${plot.status} - ${plot.badge}`;
  return plot.status;
}
