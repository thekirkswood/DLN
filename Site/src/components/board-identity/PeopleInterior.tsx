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
import "./PeopleInterior.css";

const MAX_NAMES = 16;

function namesOf(raw: string): string[] {
  const lines = (raw || "").split("\n");
  return lines.length ? lines : [""];
}

export function PeopleInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const names = namesOf(fields.named || "");
  const trueFor = fields.true || "";
  const seats = useMemo(() => seatsFromLive(live), [live]);
  const founder = snip(live, "plot:founder");
  const location = snip(live, "plot:location");
  const advocates = snip(live, "plot:advocates") || snip(live, "mapping:advocates");
  const unfinished = Boolean(trueFor.trim()) && !names.some((n) => n.trim());

  function setNames(next: string[]) {
    onField("named", next.join("\n"));
  }

  return (
    <form className="board-id-people" onSubmit={onSubmit}>
      <div className="board-id-people-ledger">
        <div className="board-id-people-names">
          <p className="kicker">Named people</p>
          <ol>
            {names.map((name, i) => (
              <li key={i}>
                <label htmlFor={`bit-${bit}-named-${i}`}>
                  <span className="kicker">Name {i + 1}</span>
                  <input
                    id={`bit-${bit}-named-${i}`}
                    type="text"
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setNames(names.map((n, x) => (x === i ? e.target.value : n)))}
                  />
                </label>
                {names.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = names.filter((_, x) => x !== i);
                      setNames(next.length ? next : [""]);
                    }}
                  >
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
          {names.length < MAX_NAMES ? (
            <p className="board-id-people-add">
              <button type="button" onClick={() => setNames([...names, ""])}>
                Add a name
              </button>
            </p>
          ) : null}
        </div>

        <aside className="board-id-people-seats">
          <p className="kicker">Seats the work has to face</p>
          <ol>
            {seats.map((s) => (
              <li key={s.n}>
                <span aria-hidden="true">{s.n}</span>
                <Link href={s.href}>{s.held ? s.label : "Empty"}</Link>
              </li>
            ))}
          </ol>
          <p>
            <Link href={withPlot("/board/mapping/audience", live?.plot)}>Customer seats</Link>
          </p>
        </aside>
      </div>

      <label className="board-id-people-true" htmlFor={`bit-${bit}-true`}>
        <span className="kicker">Who the work has to be true for</span>
        <textarea
          id={`bit-${bit}-true`}
          rows={3}
          value={trueFor}
          onChange={(e) => onField("true", e.target.value)}
        />
      </label>

      {unfinished ? <p className="board-id-people-warn">{teaching}</p> : null}

      <div className="board-id-people-doors">
        <Link href={withPlot("/board/plot/founder", live?.plot)}>
          <strong>Founder</strong>
          <span>{founder || "No founder story on this plot yet. Do not invent one here."}</span>
        </Link>
        <Link href={withPlot("/board/plot/location", live?.plot)}>
          <strong>Location</strong>
          <span>{location || "Where this lives is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/mapping/advocates", live?.plot)}>
          <strong>Advocates</strong>
          <span>{advocates || "Advocates are not named on this plot yet."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
