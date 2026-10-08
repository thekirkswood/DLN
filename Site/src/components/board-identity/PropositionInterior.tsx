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
import styles from "./PropositionInterior.module.css";

function composeAnswer(yes: string, no: string): string {
  const y = yes.trim();
  const n = no.trim();
  if (y && n) return `Yes: ${y} · No: ${n}`;
  return y || n;
}

export function PropositionInterior({
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
  const yes = fields.yes || "";
  const no = fields.no || "";
  const offer = fields.offer || "";
  const canAnswer = Boolean((fields.answer || yes || no).trim());
  const unfinished = Boolean(offer.trim()) && !canAnswer;

  function pointSeat(n: string, label: string) {
    if (pointed === n) {
      onPatch({ seat: "", whom: fields.whom === label ? "" : fields.whom });
      return;
    }
    onPatch({ seat: n, whom: label });
  }

  function setYes(value: string) {
    onPatch({ yes: value, answer: composeAnswer(value, no) });
  }

  function setNo(value: string) {
    onPatch({ no: value, answer: composeAnswer(yes, value) });
  }

  return (
    <form className={`board-id-proposition ${styles.root}`} onSubmit={onSubmit}>
      <label className="board-id-proposition-offer" htmlFor={`bit-${bit}-offer`}>
        <span className="kicker">What is being offered</span>
        <textarea
          id={`bit-${bit}-offer`}
          rows={2}
          value={offer}
          onChange={(e) => onField("offer", e.target.value)}
          spellCheck
        />
      </label>

      <div className="board-id-proposition-whom">
        <p className="kicker">To whom — point at a seat</p>
        {named.length ? (
          <ul className="board-id-proposition-seats">
            {seats.map((s) => (
              <li key={s.n}>
                {s.held ? (
                  <button
                    type="button"
                    className={
                      pointed === s.n
                        ? "board-id-proposition-seat is-on"
                        : "board-id-proposition-seat"
                    }
                    aria-pressed={pointed === s.n}
                    onClick={() => pointSeat(s.n, s.label)}
                  >
                    <span className="kicker">Seat {s.n}</span>
                    <strong>{s.label}</strong>
                  </button>
                ) : (
                  <Link className="board-id-proposition-seat is-empty" href={s.href}>
                    <span className="kicker">Seat {s.n}</span>
                    <strong>Empty</strong>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="board-id-proposition-hole">
            <p>None of the eight seats are named yet. A proposition without a person is a poster.</p>
            <ul className="board-id-proposition-seats">
              {seats.map((s) => (
                <li key={s.n}>
                  <Link className="board-id-proposition-seat is-empty" href={s.href}>
                    <span className="kicker">Seat {s.n}</span>
                    <strong>Empty</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <label htmlFor={`bit-${bit}-whom`}>
          <span className="kicker">Or a group not yet on a seat</span>
          <input
            id={`bit-${bit}-whom`}
            type="text"
            value={fields.whom || ""}
            onChange={(e) => onField("whom", e.target.value)}
          />
        </label>
      </div>

      <div className="board-id-proposition-answer">
        <p className="kicker">The yes or the no</p>
        <div className="board-id-proposition-split">
          <label className={yes.trim() ? "is-held" : "is-hole"} htmlFor={`bit-${bit}-yes`}>
            <span className="kicker">The yes</span>
            <textarea
              id={`bit-${bit}-yes`}
              rows={3}
              value={yes}
              onChange={(e) => setYes(e.target.value)}
            />
          </label>
          <label className={no.trim() ? "is-held" : "is-hole"} htmlFor={`bit-${bit}-no`}>
            <span className="kicker">The no</span>
            <textarea
              id={`bit-${bit}-no`}
              rows={3}
              value={no}
              onChange={(e) => setNo(e.target.value)}
            />
          </label>
        </div>
      </div>

      {unfinished ? (
        <p className="board-id-proposition-warn">{teaching}</p>
      ) : null}

      <p className="board-id-proposition-door">
        <Link href={withPlot("/board/mapping/audience", live?.plot)}>
          <strong>Customer seats</strong>
          <span>
            {named.length
              ? named.map((s) => s.label).join(" · ")
              : "Empty on the right. Point at a named seat."}
          </span>
        </Link>
        <Link href={withPlot("/board/plot/value", live?.plot)}>
          <strong>Value</strong>
          <span>{snip(live, "plot:value") || "The trade is not on this plot yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
