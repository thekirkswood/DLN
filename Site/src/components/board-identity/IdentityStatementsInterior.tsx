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
import "./IdentityStatementsInterior.css";

const MAX_SAID = 12;

function readSaid(fields: Record<string, string>): string[] {
  const raw = (fields.lines || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const rows = parsed.map((s) => String(s ?? ""));
        return rows.length ? rows : [""];
      }
    } catch {
      /* fall through to one / two / three */
    }
  }
  const fromKeys = [fields.one || "", fields.two || "", fields.three || ""];
  if (fromKeys.some((s) => s.trim())) {
    let end = fromKeys.length;
    while (end > 1 && !fromKeys[end - 1].trim()) end -= 1;
    return fromKeys.slice(0, end);
  }
  return [""];
}

function patchSaid(
  lines: string[],
  not: string,
  onPatch: (patch: Record<string, string>) => void
) {
  onPatch({
    one: lines[0] || "",
    two: lines[1] || "",
    three: lines[2] || "",
    not,
    lines: JSON.stringify(lines),
  });
}

export function IdentityStatementsInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onPatch,
  onSubmit,
}: BitInteriorProps) {
  const said = readSaid(fields);
  const refused = fields.not || "";
  const unfinished = said.some((s) => s.trim()) && !refused.trim();
  const mission = snip(live, "plot:mission");
  const personality = snip(live, "plot:personality");
  const brandType = snip(live, "plot:brand-type");

  function setLine(i: number, value: string) {
    patchSaid(
      said.map((s, n) => (n === i ? value : s)),
      refused,
      onPatch
    );
  }

  function addLine() {
    if (said.length >= MAX_SAID) return;
    patchSaid([...said, ""], refused, onPatch);
  }

  function dropLine(i: number) {
    const next = said.filter((_, n) => n !== i);
    patchSaid(next.length ? next : [""], refused, onPatch);
  }

  return (
    <form className="board-id-identity" onSubmit={onSubmit}>
      <p className="kicker">Sentences they would actually say</p>
      <ol className="board-id-identity-stack">
        {said.map((line, i) => (
          <li key={i}>
            <span className="board-id-identity-n" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <label htmlFor={`bit-${bit}-said-${i}`}>
              <span className="kicker">Statement {i + 1}</span>
              <textarea
                id={`bit-${bit}-said-${i}`}
                rows={2}
                value={line}
                onChange={(e) => setLine(i, e.target.value)}
                spellCheck
              />
            </label>
            {said.length > 1 ? (
              <button type="button" className="board-id-identity-drop" onClick={() => dropLine(i)}>
                Remove
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
      </ol>
      {said.length < MAX_SAID ? (
        <p className="board-id-identity-add">
          <button type="button" onClick={addLine}>
            Add a sentence
          </button>
        </p>
      ) : null}

      <label
        className={refused.trim() ? "board-id-identity-refuse is-held" : "board-id-identity-refuse is-empty"}
        htmlFor={`bit-${bit}-not`}
      >
        <span className="kicker">A sentence they would refuse to print</span>
        <textarea
          id={`bit-${bit}-not`}
          rows={2}
          value={refused}
          onChange={(e) => patchSaid(said, e.target.value, onPatch)}
        />
      </label>

      {unfinished ? <p className="board-id-identity-warn">{teaching}</p> : null}

      <div className="board-id-identity-holes">
        <Link href={withPlot("/board/plot/mission", live?.plot)}>
          <strong>Mission</strong>
          <span>{mission || "The job of work is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/personality", live?.plot)}>
          <strong>Personality</strong>
          <span>{personality || "How it speaks is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/brand-type", live?.plot)}>
          <strong>Brand type</strong>
          <span>{brandType || "What it is allowed to be is not on this plot yet."}</span>
        </Link>
      </div>

      <p className="board-id-identity-stills">Stills of these sentences later, from Assets. Not a generated about-us.</p>
      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
