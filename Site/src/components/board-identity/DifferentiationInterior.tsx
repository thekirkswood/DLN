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
import styles from "./DifferentiationInterior.module.css";

const ADJECTIVE = /^(better|best|unique|premium|innovative|faster|cheaper|smarter|quality|superior|leading|exclusive|authentic|bespoke|luxury|modern|fresh|different|special|original|nicer|cleaner|easier|simpler|stronger|bolder|newer|greater|higher)$/i;

function isOnlyAdjective(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const words = t.replace(/[.!?,]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 3) return false;
  return words.every(
    (w) => ADJECTIVE.test(w) || (/er$|est$|ive$|ous$|ful$/i.test(w) && w.length < 14)
  );
}

export function DifferentiationInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const point = fields.point || "";
  const adjective = isOnlyAdjective(point);
  const features = snip(live, "plot:features");
  const landscape = snip(live, "mapping:landscape");
  const positioning = snip(live, "plot:positioning");

  return (
    <form className={`board-id-differentiation ${styles.root}`} onSubmit={onSubmit}>
      <label className="board-id-differentiation-hand" htmlFor={`bit-${bit}-point`}>
        <span className="kicker">In use — they could point at this</span>
        <textarea
          id={`bit-${bit}-point`}
          rows={3}
          value={point}
          onChange={(e) => onField("point", e.target.value)}
        />
      </label>

      {adjective ? <p className="board-id-differentiation-warn">{teaching}</p> : null}

      <label className="board-id-differentiation-neighbour" htmlFor={`bit-${bit}-neighbour`}>
        <span className="kicker">That the neighbour cannot</span>
        <textarea
          id={`bit-${bit}-neighbour`}
          rows={2}
          value={fields.neighbour || ""}
          onChange={(e) => onField("neighbour", e.target.value)}
        />
        <em>Name the neighbour, or write we do not know yet.</em>
      </label>

      <p className="board-id-differentiation-door">
        <Link href={withPlot("/board/plot/features", live?.plot)}>
          <strong>Features</strong>
          <span>{features || "Nothing countable yet. Difference has to live in what it actually has."}</span>
        </Link>
        <Link href={withPlot("/board/plot/positioning", live?.plot)}>
          <strong>Positioning</strong>
          <span>{positioning || landscape || "Where we stand is not on this plot yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
