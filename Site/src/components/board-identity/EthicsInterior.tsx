"use client";

import Link from "next/link";
import { withPlot } from "@/data/board-live";
import {
  NeighbourWords,
  SaveBar,
  SocketRow,
  snip,
  type BitInteriorProps,
} from "./shared";
import "./EthicsInterior.css";

export function EthicsInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const not = fields.not || "";
  const asked = fields.if || "";
  const unfinished = Boolean(not.trim()) && !asked.trim();
  const standards = snip(live, "plot:standards");
  const philosophy = snip(live, "plot:philosophy");
  const faculty = snip(live, "identity:ethics");

  return (
    <form className="board-id-ethics" onSubmit={onSubmit}>
      <label className="board-id-ethics-plate" htmlFor={`bit-${bit}-not`}>
        <span className="kicker">What we will not do for a win</span>
        <textarea
          id={`bit-${bit}-not`}
          rows={4}
          value={not}
          onChange={(e) => onField("not", e.target.value)}
        />
      </label>

      <label className="board-id-ethics-said" htmlFor={`bit-${bit}-if`}>
        <span className="kicker">If someone asked us to</span>
        <textarea
          id={`bit-${bit}-if`}
          rows={3}
          value={asked}
          onChange={(e) => onField("if", e.target.value)}
        />
      </label>

      {unfinished ? <p className="board-id-ethics-warn">{teaching}</p> : null}

      <p className="board-id-ethics-faculty">
        <Link href={withPlot("/board/identity/ethics", live?.plot)}>
          <strong>Ethics (faculty)</strong>
          <span>
            {faculty ||
              "Our protocol for the system as the work grows. Different from this cell — they fill this one."}
          </span>
        </Link>
      </p>

      <div className="board-id-ethics-holes">
        <Link href={withPlot("/board/plot/standards", live?.plot)}>
          <strong>Standards</strong>
          <span>{standards || "The bar we can check is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/philosophy", live?.plot)}>
          <strong>Philosophy</strong>
          <span>{philosophy || "The longer why is quiet, or empty on purpose."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
