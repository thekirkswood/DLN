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
import "./PhilosophyInterior.css";

export function PhilosophyInterior({
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
  const empty = fields.empty || fields.emptyOnPurpose || "";
  const why = fields.why || "";
  const promise = snip(live, "plot:promise");
  const purpose = snip(live, "plot:purpose");
  const ethics = snip(live, "plot:ethics");
  const unfinished = empty === "no" && !why.trim();

  function choose(id: string) {
    const patch: Record<string, string> = { empty: id, emptyOnPurpose: id };
    if (id === "yes") patch.why = "";
    onPatch(patch);
  }

  return (
    <form className="board-id-philosophy" onSubmit={onSubmit}>
      <p className="kicker">Is this empty on purpose?</p>
      <div className="board-id-philosophy-acts" role="radiogroup" aria-label="Is this empty on purpose?">
        <button
          type="button"
          className={empty === "yes" ? "board-id-philosophy-act is-on" : "board-id-philosophy-act"}
          aria-pressed={empty === "yes"}
          onClick={() => choose("yes")}
        >
          <span className="kicker">Quiet</span>
          Yes — leave this empty
        </button>
        <button
          type="button"
          className={empty === "no" ? "board-id-philosophy-act is-on" : "board-id-philosophy-act"}
          aria-pressed={empty === "no"}
          onClick={() => choose("no")}
        >
          <span className="kicker">Write it</span>
          No — there is a longer why
        </button>
      </div>

      {empty === "yes" ? (
        <section className="board-id-philosophy-done">
          <p className="kicker">This cell is complete</p>
          <p>Philosophy stays quiet on purpose. That is the whole room.</p>
        </section>
      ) : null}

      {empty === "no" ? (
        <>
          <aside className={promise ? "board-id-philosophy-promise is-held" : "board-id-philosophy-promise is-hole"}>
            <p className="kicker">The promise it must not contradict</p>
            {promise ? (
              <p>{promise}</p>
            ) : (
              <p>The promise is not on this plot yet. Write the longer why so it could still sit beside one.</p>
            )}
            <p>
              <Link href={withPlot("/board/plot/promise", live?.plot)}>Promise</Link>
            </p>
          </aside>

          <label className="board-id-philosophy-page" htmlFor={`bit-${bit}-why`}>
            <span className="kicker">The longer why</span>
            <textarea
              id={`bit-${bit}-why`}
              rows={10}
              value={why}
              onChange={(e) => onField("why", e.target.value)}
            />
          </label>
          {unfinished ? <p className="board-id-philosophy-warn">{teaching}</p> : null}
        </>
      ) : null}

      {!empty ? <p className="board-id-philosophy-wait">{teaching}</p> : null}

      <div className="board-id-philosophy-holes">
        <Link href={withPlot("/board/plot/purpose", live?.plot)}>
          <strong>Purpose</strong>
          <span>{purpose || "Why it exists when nobody is watching is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/ethics", live?.plot)}>
          <strong>Ethics</strong>
          <span>{ethics || "What they will not do for a win is not on this plot yet."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
