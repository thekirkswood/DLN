/** Sibling houses that are not a Design Lab North service. Stay on disk / VPS. */
export const OFF_SERVICE_SLUGS = new Set(["various-titles"]);

export function isServicePlot(plot: { slug: string }): boolean {
  return !OFF_SERVICE_SLUGS.has(plot.slug);
}

export function servicePlots<T extends { slug: string }>(plots: T[]): T[] {
  return plots.filter(isServicePlot);
}
