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
import "./StandardsInterior.css";

export function StandardsInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const bar = fields.bar || "";
  const check = fields.check || "";
  const wish = Boolean(bar.trim()) && !check.trim();
  const ethics = snip(live, "plot:ethics");
  const promise = snip(live, "plot:promise");
  const principles = snip(live, "identity:principles");

  return (
    <form className={wish ? "board-id-standards is-wish" : "board-id-standards"} onSubmit={onSubmit}>
      <p className="kicker">{wish ? "A wish until it can be checked" : "The bar we will not drop"}</p>

      <label className="board-id-standards-bar" htmlFor={`bit-${bit}-bar`}>
        <span className="kicker">The standard</span>
        <textarea
          id={`bit-${bit}-bar`}
          rows={3}
          value={bar}
          onChange={(e) => onField("bar", e.target.value)}
        />
      </label>

      <label
        className={check.trim() ? "board-id-standards-check is-held" : "board-id-standards-check is-open"}
        htmlFor={`bit-${bit}-check`}
      >
        <span className="kicker">How we check it</span>
        <textarea
          id={`bit-${bit}-check`}
          rows={3}
          value={check}
          onChange={(e) => onField("check", e.target.value)}
        />
        {!check.trim() ? (
          <em>A date, a proof, or a person who looks. Without this, the bar does not count as held.</em>
        ) : null}
      </label>

      {wish ? <p className="board-id-standards-warn">{teaching}</p> : null}

      <div className="board-id-standards-holes">
        <Link href={withPlot("/board/plot/ethics", live?.plot)}>
          <strong>Ethics</strong>
          <span>{ethics || "What they will not do for a win is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/promise", live?.plot)}>
          <strong>Promise</strong>
          <span>{promise || "What we will do is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/identity/principles", live?.plot)}>
          <strong>Principles</strong>
          <span>{principles || "The system rule is not written yet."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
