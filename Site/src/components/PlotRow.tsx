import Link from "next/link";
import type { Plot } from "@/lib/plots";

export function PlotRow({ plot }: { plot: Plot }) {
  return (
    <Link className="plot-card" href={`/greenhouse/${plot.slug}`}>
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
        <p>{plot.voice}</p>
      </div>
      <div className="status">{plot.status}</div>
    </Link>
  );
}
