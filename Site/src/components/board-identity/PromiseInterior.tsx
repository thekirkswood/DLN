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
import styles from "./PromiseInterior.module.css";

export function PromiseInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onPatch,
  onSubmit,
}: BitInteriorProps) {
  const will = fields.will || "";
  const know = fields.know || fields.check || "";
  const unfinished = Boolean(will.trim()) && !know.trim();
  const opinion = snip(live, "mapping:opinion");
  const standards = snip(live, "plot:standards");
  const mission = snip(live, "plot:mission");

  function setKnow(value: string) {
    onPatch({ know: value, check: value });
  }

  return (
    <form className={`board-id-promise ${styles.root}`} onSubmit={onSubmit}>
      <ol className="board-id-promise-holds">
        <li className={will.trim() ? "is-held" : undefined}>
          <label htmlFor={`bit-${bit}-will`}>
            <span className="kicker">01 · What we will do</span>
            <textarea
              id={`bit-${bit}-will`}
              rows={3}
              value={will}
              onChange={(e) => onField("will", e.target.value)}
            />
          </label>
        </li>
        <li className={know.trim() ? "is-held" : "is-hole"}>
          <label htmlFor={`bit-${bit}-know`}>
            <span className="kicker">02 · How they would know we kept it</span>
            <textarea
              id={`bit-${bit}-know`}
              rows={3}
              value={know}
              onChange={(e) => setKnow(e.target.value)}
            />
          </label>
          {unfinished ? (
            <p className="board-id-promise-unfinished">
              Without a way to know it was kept, this does not count as held.
            </p>
          ) : null}
        </li>
        <li className={(fields.break || "").trim() ? "is-held" : undefined}>
          <label htmlFor={`bit-${bit}-break`}>
            <span className="kicker">03 · What would break it</span>
            <textarea
              id={`bit-${bit}-break`}
              rows={3}
              value={fields.break || ""}
              onChange={(e) => onField("break", e.target.value)}
            />
          </label>
        </li>
      </ol>

      {unfinished ? <p className="board-id-promise-warn">{teaching}</p> : null}

      <p className="board-id-promise-door">
        <Link href={withPlot("/board/mapping/opinion", live?.plot)}>
          <strong>Public opinion</strong>
          <span>{opinion || "Empty. The room already reading this promise is not on the table yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/standards", live?.plot)}>
          <strong>Standards</strong>
          <span>{standards || "No bar to check against yet."}</span>
        </Link>
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
