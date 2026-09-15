import { hostnameOf } from "@/lib/lab-host";
import { backupOrigin, lanPortForPlot } from "@/lib/lan-names";
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

/** Campus / lab bind — IP and port. Never a public subdomain. */
export function buildUrlFor(plot: Plot, requestHost?: string | null): string | null {
  const port = plot.lab?.localPort ?? lanPortForPlot(plot.slug);
  if (!port) return null;
  const h = hostnameOf(requestHost);
  if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0") {
    return backupOrigin(port);
  }
  return backupOrigin(port);
}

/** Same window: campus = ports, live = domains. Branch on isLabHost so a ship cannot mix them. */
export function previewUrlFor(
  plot: Plot,
  lab: boolean,
  requestHost?: string | null,
): string | null {
  return lab ? buildUrlFor(plot, requestHost) : hostUrlFor(plot);
}

export function statusLabel(plot: Plot): string {
  if (plot.badge) return `${plot.status} - ${plot.badge}`;
  return plot.status;
}
