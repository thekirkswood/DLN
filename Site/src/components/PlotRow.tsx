import Link from "next/link";
import type { Plot } from "@/lib/plots";
import { statusLabel } from "@/lib/plots";

export function PlotRow({
  plot,
  compact = false,
  href = null,
}: {
  plot: Plot;
  compact?: boolean;
  href?: string | null;
}) {
  const status = statusLabel(plot);
  const className = compact ? "plot-card plot-card-home" : "plot-card";
  const inner = (
    <>
      <span className="plot-mark-well">
        {plot.logoPaper ? (
          <>
            <img className="plot-mark plot-mark-paper" src={plot.logoPaper} alt="" />
            <img
              className="plot-mark plot-mark-ink"
              src={plot.logoInk || plot.logoPaper}
              alt=""
            />
          </>
        ) : (
          <span className="plot-wordmark">{plot.name}</span>
        )}
      </span>
      <div className="plot-copy">
        <h3>{plot.name}</h3>
        {compact ? <div className="status">{status}</div> : <p>{plot.voice}</p>}
      </div>
      {compact ? null : <div className="status">{status}</div>}
    </>
  );

  if (!href) {
    return <div className={`${className} plot-card-inert`}>{inner}</div>;
  }
  return (
    <Link className={className} href={href}>
      {inner}
    </Link>
  );
}
