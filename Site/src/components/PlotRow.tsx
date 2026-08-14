import Link from "next/link";
import type { Plot } from "@/lib/plots";
import { statusLabel } from "@/lib/plots";

export function PlotRow({
  plot,
  compact = false,
}: {
  plot: Plot;
  compact?: boolean;
}) {
  const status = statusLabel(plot);
  return (
    <Link
      className={compact ? "plot-card plot-card-home" : "plot-card"}
      href={`/greenhouse/${plot.slug}`}
    >
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
        ) : null}
      </span>
      <div className="plot-copy">
        <h3>{plot.name}</h3>
        {compact ? <div className="status">{status}</div> : <p>{plot.voice}</p>}
      </div>
      {compact ? null : <div className="status">{status}</div>}
    </Link>
  );
}
