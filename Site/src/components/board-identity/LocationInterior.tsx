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
import "./LocationInterior.css";

export function LocationInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const geo = fields.geo || "";
  const online = fields.online || "";
  const missingWhere = !geo.trim();
  const host = snip(live, "workbench:host");
  const people = snip(live, "plot:people");
  const positioning = snip(live, "plot:positioning");
  const hostUrl = live?.hostUrl || "";
  const hostLine = host || (hostUrl ? hostUrl.replace(/^https?:\/\//, "") : "");

  return (
    <form className="board-id-location" onSubmit={onSubmit}>
      <label
        className={geo.trim() ? "board-id-location-geo is-held" : "board-id-location-geo is-hole"}
        htmlFor={`bit-${bit}-geo`}
      >
        <span className="kicker">Geography, or a named place</span>
        <textarea
          id={`bit-${bit}-geo`}
          rows={2}
          value={geo}
          onChange={(e) => onField("geo", e.target.value)}
        />
        {missingWhere ? (
          <em>Online-only still has a where. A town, a region, or a named room in the world.</em>
        ) : null}
      </label>

      <label className="board-id-location-online" htmlFor={`bit-${bit}-online`}>
        <span className="kicker">Where it lives online</span>
        <textarea
          id={`bit-${bit}-online`}
          rows={2}
          value={online}
          onChange={(e) => onField("online", e.target.value)}
        />
      </label>

      {missingWhere && online.trim() ? <p className="board-id-location-warn">{teaching}</p> : null}

      <div className="board-id-location-host">
        <p className="kicker">The live host</p>
        <Link href={withPlot("/board/workbench/host", live?.plot)}>
          <strong>Host</strong>
          <span>{hostLine || "The host room is empty. Name where this lives, even if it is only online."}</span>
        </Link>
        {hostUrl ? (
          <a href={hostUrl} target="_blank" rel="noreferrer">
            <strong>On the host</strong>
            <span>{hostUrl.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : null}
      </div>

      <div className="board-id-location-holes">
        <Link href={withPlot("/board/plot/people", live?.plot)}>
          <strong>People</strong>
          <span>{people || "The named people are not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/positioning", live?.plot)}>
          <strong>Positioning</strong>
          <span>{positioning || "Where we stand next to the landscape is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/mapping/landscape", live?.plot)}>
          <strong>Landscape</strong>
          <span>{snip(live, "mapping:landscape") || "The landscape cell is empty."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
