"use client";

import { useMemo } from "react";
import Link from "next/link";
import { withPlot } from "@/data/board-live";
import {
  NeighbourWords,
  SaveBar,
  SocketRow,
  seatsFromLive,
  snip,
  type BitInteriorProps,
} from "./shared";
import styles from "./ValueInterior.module.css";

function isOnlyQuality(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[.!]/g, "");
  if (!t) return false;
  return /^(high[- ]?)?(quality|premium|excellence)(\s+(quality|product|service|experience|brand))?$/.test(t);
}

export function ValueInterior({
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
  const seats = useMemo(() => seatsFromLive(live), [live]);
  const named = seats.filter((s) => s.held);
  const pointed = fields.seat || "";
  const quality =
    isOnlyQuality(fields.get || "") ||
    isOnlyQuality(fields.cost || "") ||
    isOnlyQuality(fields.fair || "");

  function pointSeat(n: string, label: string) {
    if (pointed === n) {
      onPatch({ seat: "" });
      return;
    }
    onPatch({ seat: n });
  }

  return (
    <form className={`board-id-value ${styles.root}`} onSubmit={onSubmit}>
      <div className="board-id-value-ledger">
        <label htmlFor={`bit-${bit}-get`}>
          <span className="kicker">What they get</span>
          <textarea
            id={`bit-${bit}-get`}
            rows={4}
            value={fields.get || ""}
            onChange={(e) => onField("get", e.target.value)}
          />
        </label>
        <p className="board-id-value-for" aria-hidden="true">
          for
        </p>
        <label htmlFor={`bit-${bit}-cost`}>
          <span className="kicker">What it costs them</span>
          <textarea
            id={`bit-${bit}-cost`}
            rows={4}
            value={fields.cost || ""}
            onChange={(e) => onField("cost", e.target.value)}
          />
        </label>
        <p className="board-id-value-for" aria-hidden="true">
          because
        </p>
        <label htmlFor={`bit-${bit}-fair`}>
          <span className="kicker">Why that trade is fair</span>
          <textarea
            id={`bit-${bit}-fair`}
            rows={4}
            value={fields.fair || ""}
            onChange={(e) => onField("fair", e.target.value)}
          />
        </label>
      </div>

      {quality ? <p className="board-id-value-warn">{teaching}</p> : null}

      <div className="board-id-value-whom">
        <p className="kicker">Whose trade this is</p>
        <ul className="board-id-value-seats">
          {seats.map((s) => (
            <li key={s.n}>
              {s.held ? (
                <button
                  type="button"
                  className={pointed === s.n ? "board-id-value-seat is-on" : "board-id-value-seat"}
                  aria-pressed={pointed === s.n}
                  onClick={() => pointSeat(s.n, s.label)}
                >
                  <span className="kicker">Seat {s.n}</span>
                  <strong>{s.label}</strong>
                </button>
              ) : (
                <Link className="board-id-value-seat is-empty" href={s.href}>
                  <span className="kicker">Seat {s.n}</span>
                  <strong>Empty</strong>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="board-id-value-door">
        <Link href={withPlot("/board/mapping/audience", live?.plot)}>
          <strong>Customer seats</strong>
          <span>
            {named.length
              ? named.map((s) => s.label).join(" · ")
              : "Empty on the right. A trade needs a person."}
          </span>
        </Link>
        <Link href={withPlot("/board/plot/benefit", live?.plot)}>
          <strong>Benefit</strong>
          <span>{snip(live, "plot:benefit") || "What they feel after the feature is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/proposition", live?.plot)}>
          <strong>Proposition</strong>
          <span>{snip(live, "plot:proposition") || "The offer has not been answered yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
