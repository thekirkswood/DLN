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
import "./PurposeInterior.css";

export function PurposeInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const why = fields.why || "";
  const without = fields.without || "";
  const unfinished = Boolean(why.trim()) && !without.trim();
  const philosophy = snip(live, "plot:philosophy");
  const mission = snip(live, "plot:mission");

  return (
    <form className="board-id-purpose" onSubmit={onSubmit}>
      <p className="board-id-purpose-quiet">When nobody is watching</p>

      <label htmlFor={`bit-${bit}-why`}>
        <span className="kicker">When it is not launching</span>
        <textarea
          id={`bit-${bit}-why`}
          rows={5}
          value={why}
          onChange={(e) => onField("why", e.target.value)}
        />
      </label>

      <label htmlFor={`bit-${bit}-without`}>
        <span className="kicker">Without an audience</span>
        <textarea
          id={`bit-${bit}-without`}
          rows={4}
          value={without}
          onChange={(e) => onField("without", e.target.value)}
        />
      </label>

      {unfinished ? <p className="board-id-purpose-warn">{teaching}</p> : null}

      <aside className={philosophy ? "board-id-purpose-philosophy is-held" : "board-id-purpose-philosophy is-hole"}>
        <p className="kicker">Philosophy on this plot</p>
        {philosophy ? (
          <p>{philosophy}</p>
        ) : (
          <p>Quiet here too, until they write it — or leave it empty on purpose.</p>
        )}
        <p>
          <Link href={withPlot("/board/plot/philosophy", live?.plot)}>Philosophy</Link>
        </p>
      </aside>

      <p className="board-id-purpose-mission">
        <Link href={withPlot("/board/plot/mission", live?.plot)}>
          <strong>Mission</strong>
          <span>{mission || "The job of work is not on this plot yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
