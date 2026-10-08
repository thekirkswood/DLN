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
import styles from "./BrandTypeInterior.module.css";

export function BrandTypeInterior({
  bit,
  fields,
  live,
  pending,
  error,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const allowed = fields.is || "";
  const refused = fields.not || "";
  const toolkit = snip(live, "identity:toolkit");
  const personality = snip(live, "plot:personality");
  const positioning = snip(live, "plot:positioning");

  return (
    <form className={`board-id-brand-type ${styles.root}`} onSubmit={onSubmit}>
      <div className="board-id-brand-type-plates">
        <label className="board-id-brand-type-is" htmlFor={`bit-${bit}-is`}>
          <span className="kicker">Allowed to be</span>
          <textarea
            id={`bit-${bit}-is`}
            rows={6}
            value={allowed}
            onChange={(e) => onField("is", e.target.value)}
          />
        </label>
        <label className="board-id-brand-type-not" htmlFor={`bit-${bit}-not`}>
          <span className="kicker">Must not play at</span>
          <textarea
            id={`bit-${bit}-not`}
            rows={6}
            value={refused}
            onChange={(e) => onField("not", e.target.value)}
          />
        </label>
      </div>

      <p className="board-id-brand-type-door">
        <Link href={withPlot("/board/identity/toolkit", live?.plot)}>
          <strong>Toolkit</strong>
          <span>
            {toolkit ||
              "Empty. Type constrains what may be printed or bought — a house cannot pretend to be a rebel every Tuesday."}
          </span>
        </Link>
        <Link href={withPlot("/board/plot/personality", live?.plot)}>
          <strong>Personality</strong>
          <span>{personality || "How it behaves when it speaks is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/positioning", live?.plot)}>
          <strong>Positioning</strong>
          <span>{positioning || "Where we stand is not on this plot yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
