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
import styles from "./BenefitInterior.module.css";

const EVERYONE = /everyone|all eight|all (the )?customers|all seats|anybody|the public/i;

export function BenefitInterior({
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
  const who = fields.who || "";
  const tooWide = EVERYONE.test(who);
  const features = snip(live, "plot:features");
  const value = snip(live, "plot:value");

  function pointSeat(n: string, label: string) {
    if (pointed === n) {
      onPatch({ seat: "", who: who === label ? "" : who });
      return;
    }
    onPatch({ seat: n, who: label });
  }

  return (
    <form className={`board-id-benefit ${styles.root}`} onSubmit={onSubmit}>
      <p className="board-id-benefit-after">
        <Link href={withPlot("/board/plot/features", live?.plot)}>
          <span className="kicker">After the feature</span>
          <strong>{features || "No feature held yet. The feeling has to follow a fact."}</strong>
        </Link>
      </p>

      <label className="board-id-benefit-feel" htmlFor={`bit-${bit}-feel`}>
        <span className="kicker">What they feel, or can do</span>
        <textarea
          id={`bit-${bit}-feel`}
          rows={2}
          value={fields.feel || ""}
          onChange={(e) => onField("feel", e.target.value)}
        />
      </label>

      <div className="board-id-benefit-whom">
        <p className="kicker">Which seat this is for — not all eight</p>
        {named.length ? (
          <ul className="board-id-benefit-seats">
            {seats.map((s) => {
              const on = pointed === s.n;
              if (!s.held) {
                return (
                  <li key={s.n} className="is-quiet">
                    <Link className="board-id-benefit-seat is-empty" href={s.href}>
                      <span className="kicker">Seat {s.n}</span>
                      <strong>Empty</strong>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={s.n} className={on ? "is-picked" : undefined}>
                  <button
                    type="button"
                    className={on ? "board-id-benefit-seat is-on" : "board-id-benefit-seat"}
                    aria-pressed={on}
                    onClick={() => pointSeat(s.n, s.label)}
                  >
                    <span className="kicker">Seat {s.n}</span>
                    <strong>{s.label}</strong>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="board-id-benefit-hole">
            <p>None of the eight seats are named yet. A benefit for everyone is still a feature.</p>
            <ul className="board-id-benefit-seats">
              {seats.map((s) => (
                <li key={s.n} className="is-quiet">
                  <Link className="board-id-benefit-seat is-empty" href={s.href}>
                    <span className="kicker">Seat {s.n}</span>
                    <strong>Empty</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <label htmlFor={`bit-${bit}-who`}>
          <span className="kicker">The seat, named</span>
          <input
            id={`bit-${bit}-who`}
            type="text"
            value={who}
            onChange={(e) => onField("who", e.target.value)}
          />
        </label>
        {tooWide ? <p className="board-id-benefit-warn">{teaching}</p> : null}
      </div>

      <p className="board-id-benefit-door">
        <Link href={withPlot("/board/plot/features", live?.plot)}>
          <strong>Features</strong>
          <span>{features || "Countable facts are not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/value", live?.plot)}>
          <strong>Value</strong>
          <span>{value || "The trade is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/mapping/audience", live?.plot)}>
          <strong>Customer seats</strong>
          <span>
            {named.length
              ? named.map((s) => s.label).join(" · ")
              : "Empty on the right. Point at one seat."}
          </span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
