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
import "./VisionInterior.css";

function sceneOf(fields: Record<string, string>) {
  const see = fields.see || "";
  const hear = fields.hear || "";
  const hold = fields.hold || "";
  if (see.trim() || hear.trim() || hold.trim()) return { see, hear, hold };
  return { see: fields.arrive || "", hear: "", hold: "" };
}

function arriveFrom(see: string, hear: string, hold: string) {
  return [
    see.trim() && `See: ${see.trim()}`,
    hear.trim() && `Hear: ${hear.trim()}`,
    hold.trim() && `Hold: ${hold.trim()}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function VisionInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onPatch,
  onSubmit,
}: BitInteriorProps) {
  const scene = sceneOf(fields);
  const when = fields.when || "";
  const not = fields.not || "";
  const vagueWhen = Boolean(when.trim()) && /^(soon|someday|one day|eventually|the future|asap|tbd)$/i.test(when.trim());
  const mission = snip(live, "plot:mission");
  const purpose = snip(live, "plot:purpose");
  const bigIdea = snip(live, "plot:big-idea");

  function patch(next: { see?: string; hear?: string; hold?: string; when?: string; not?: string }) {
    const see = next.see ?? scene.see;
    const hear = next.hear ?? scene.hear;
    const hold = next.hold ?? scene.hold;
    onPatch({
      arrive: arriveFrom(see, hear, hold),
      when: next.when ?? when,
      not: next.not ?? not,
      see,
      hear,
      hold,
    });
  }

  return (
    <form className="board-id-vision" onSubmit={onSubmit}>
      <div className="board-id-vision-stamp">
        <label htmlFor={`bit-${bit}-when`}>
          <span className="kicker">By when, if that is honest</span>
          <input
            id={`bit-${bit}-when`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={when}
            onChange={(e) => patch({ when: e.target.value })}
          />
        </label>
        {vagueWhen ? <p className="board-id-vision-warn">{teaching}</p> : null}
      </div>

      <div className="board-id-vision-scene">
        <p className="kicker">If we arrived</p>
        <div className="board-id-vision-senses">
          <label htmlFor={`bit-${bit}-see`}>
            <span className="kicker">See</span>
            <textarea
              id={`bit-${bit}-see`}
              rows={4}
              value={scene.see}
              onChange={(e) => patch({ see: e.target.value })}
            />
          </label>
          <label htmlFor={`bit-${bit}-hear`}>
            <span className="kicker">Hear</span>
            <textarea
              id={`bit-${bit}-hear`}
              rows={4}
              value={scene.hear}
              onChange={(e) => patch({ hear: e.target.value })}
            />
          </label>
          <label htmlFor={`bit-${bit}-hold`}>
            <span className="kicker">Hold</span>
            <textarea
              id={`bit-${bit}-hold`}
              rows={4}
              value={scene.hold}
              onChange={(e) => patch({ hold: e.target.value })}
            />
          </label>
        </div>
      </div>

      <label className="board-id-vision-not" htmlFor={`bit-${bit}-not`}>
        <span className="kicker">What this future is not</span>
        <textarea
          id={`bit-${bit}-not`}
          rows={2}
          value={not}
          onChange={(e) => patch({ not: e.target.value })}
        />
      </label>

      <div className="board-id-vision-holes">
        <Link href={withPlot("/board/plot/mission", live?.plot)}>
          <strong>Mission</strong>
          <span>{mission || "The job of work is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/purpose", live?.plot)}>
          <strong>Purpose</strong>
          <span>{purpose || "Why it exists in a quiet month is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/big-idea", live?.plot)}>
          <strong>Big idea</strong>
          <span>{bigIdea || "The one idea is not on this plot yet."}</span>
        </Link>
      </div>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
