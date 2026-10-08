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
import styles from "./BigIdeaInterior.module.css";

function firstIdeaOnly(value: string): string {
  const parts = value
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (parts[0] || value.replace(/\n/g, " ")).trim();
}

function looksLikeMany(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\n/.test(t)) return true;
  if (/^\s*[-*•\d]+[.)]\s/m.test(t)) return true;
  const clauses = t.split(/\s+and\s+|;\s+/).map((s) => s.trim()).filter((s) => s.length > 18);
  if (clauses.length > 1) return true;
  const sentences = t.split(/[.?!]+/).map((s) => s.trim()).filter((s) => s.length > 16);
  return sentences.length > 1;
}

export function BigIdeaInterior({
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
  const idea = fields.idea || "";
  const crowded = looksLikeMany(idea);
  const related = live?.related || [];
  const workbench = snip(live, "workbench:ideas");
  const mission = snip(live, "plot:mission");

  function setIdea(value: string) {
    const one = firstIdeaOnly(value);
    const extras = value
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(1);
    if (extras.length) {
      const refused = [fields.not || "", ...extras].filter(Boolean).join("\n");
      onPatch({ idea: one, not: refused });
      return;
    }
    onField("idea", one);
  }

  function serveCell(label: string, body: string) {
    const line = body.trim() ? `${label} — ${body}` : label;
    onField("serves", fields.serves === line ? "" : line);
  }

  return (
    <form className={`board-id-big-idea ${styles.root}`} onSubmit={onSubmit}>
      <label className="board-id-big-idea-pedestal" htmlFor={`bit-${bit}-idea`}>
        <span className="kicker">The one idea</span>
        <input
          id={`bit-${bit}-idea`}
          type="text"
          autoComplete="off"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
      </label>

      {crowded ? <p className="board-id-big-idea-warn">{teaching}</p> : null}

      <div className="board-id-big-idea-serves">
        <p className="kicker">What on this table it must serve</p>
        {related.length ? (
          <ul className="board-id-big-idea-chips">
            {related.map((row) => {
              const line = row.body.trim() ? `${row.label} — ${row.body}` : row.label;
              const on = (fields.serves || "") === line;
              return (
                <li key={row.href + row.label}>
                  <button
                    type="button"
                    className={on ? "is-on" : undefined}
                    aria-pressed={on}
                    onClick={() => serveCell(row.label, row.body)}
                  >
                    <strong>{row.label}</strong>
                    <span>{row.body || "Empty"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="board-id-big-idea-empty">
            The rest of the table is still quiet. Name the cell this idea would break if it were wrong.
          </p>
        )}
        <label htmlFor={`bit-${bit}-serves`}>
          <span className="kicker">Or name the cell</span>
          <input
            id={`bit-${bit}-serves`}
            type="text"
            value={fields.serves || ""}
            onChange={(e) => onField("serves", e.target.value)}
          />
        </label>
      </div>

      <label className="board-id-big-idea-not" htmlFor={`bit-${bit}-not`}>
        <span className="kicker">Ideas that are not this</span>
        <textarea
          id={`bit-${bit}-not`}
          rows={3}
          value={fields.not || ""}
          onChange={(e) => onField("not", e.target.value)}
        />
      </label>

      <p className="board-id-big-idea-door">
        <Link href={withPlot("/board/workbench/ideas", live?.plot)}>
          <strong>Ideas through</strong>
          <span>{workbench || "Empty on the workbench. This idea has to survive that room."}</span>
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
