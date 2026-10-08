"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LANDSCAPE_TOKENS } from "@/data/board-map";
import { withPlot } from "@/data/board-live";
import {
  NeighbourWords,
  SaveBar,
  SocketRow,
  seatsFromLive,
  snip,
  type BitInteriorProps,
} from "./shared";
import styles from "./PositioningInterior.module.css";

const UNKNOWN = "we do not know yet";

const FIELD_PLATES = [
  { key: "mapping:landscape", label: "Landscape", href: "/board/mapping/landscape" },
  ...LANDSCAPE_TOKENS.map((t) => ({
    key: `mapping:${t.id}`,
    label: t.label,
    href: t.href,
  })),
];

export function PositioningInterior({
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
  const namedSeats = seats.filter((s) => s.held);
  const landscape = snip(live, "mapping:landscape");
  const advocates = snip(live, "mapping:advocates");
  const advocateNames = advocates
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const kind = fields.kind || "";
  const next = (fields.next || "").trim();
  const named =
    Boolean(next) &&
    (kind === "unknown" || kind === "advocate" || kind === "market" || next.toLowerCase() === UNKNOWN);
  const pose = !landscape;

  function pickAdvocate(name: string) {
    onPatch({ kind: "advocate", next: name });
  }

  function pickMarket(n: string, label: string) {
    onPatch({ kind: "market", next: label, seat: n });
  }

  function pickUnknown() {
    onPatch({ kind: "unknown", next: UNKNOWN });
  }

  return (
    <form className={`board-id-positioning ${styles.root}`} onSubmit={onSubmit}>
      {pose ? (
        <section className="board-id-positioning-hole">
          <p className="kicker">The landscape is a hole</p>
          <p>{teaching}</p>
          <p>
            <Link href={withPlot("/board/mapping/landscape", live?.plot)}>Landscape</Link>
          </p>
        </section>
      ) : null}

      <div className="board-id-positioning-field">
        <p className="kicker">Next to the landscape</p>
        <ul className="board-id-positioning-plates">
          {FIELD_PLATES.map((p) => {
            const words = snip(live, p.key);
            const empty = !words;
            return (
              <li key={p.key} className={empty ? "is-hole" : "is-held"}>
                <Link href={withPlot(p.href, live?.plot)}>
                  <span className="kicker">{p.label}</span>
                  <strong>{empty ? "Hole" : words}</strong>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <label className="board-id-positioning-where" htmlFor={`bit-${bit}-where`}>
        <span className="kicker">Where we stand</span>
        <textarea
          id={`bit-${bit}-where`}
          rows={2}
          value={fields.where || ""}
          onChange={(e) => onField("where", e.target.value)}
        />
      </label>

      <div className="board-id-positioning-next">
        <p className="kicker">Next to whom — a named neighbour</p>
        <div className="board-id-positioning-kinds" role="radiogroup" aria-label="Kind of neighbour">
          <button
            type="button"
            className={kind === "advocate" ? "is-on" : undefined}
            aria-pressed={kind === "advocate"}
            onClick={() =>
              onPatch({
                kind: "advocate",
                next: kind === "advocate" && next ? next : advocateNames[0] || "",
              })
            }
          >
            Advocate
          </button>
          <button
            type="button"
            className={kind === "market" ? "is-on" : undefined}
            aria-pressed={kind === "market"}
            onClick={() =>
              onPatch({
                kind: "market",
                next: kind === "market" && next ? next : namedSeats[0]?.label || "",
                seat: kind === "market" && fields.seat ? fields.seat : namedSeats[0]?.n || "",
              })
            }
          >
            Market
          </button>
          <button
            type="button"
            className={kind === "unknown" ? "is-on" : undefined}
            aria-pressed={kind === "unknown"}
            onClick={pickUnknown}
          >
            We do not know yet
          </button>
        </div>

        {kind === "advocate" ? (
          advocateNames.length ? (
            <ul className="board-id-positioning-names">
              {advocateNames.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    className={next === name ? "is-on" : undefined}
                    aria-pressed={next === name}
                    onClick={() => pickAdvocate(name)}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="board-id-positioning-missing">
              Advocates is a hole.{" "}
              <Link href={withPlot("/board/mapping/advocates", live?.plot)}>Name someone who speaks for the work.</Link>
            </p>
          )
        ) : null}

        {kind === "market" ? (
          namedSeats.length ? (
            <ul className="board-id-positioning-names">
              {namedSeats.map((s) => (
                <li key={s.n}>
                  <button
                    type="button"
                    className={fields.seat === s.n ? "is-on" : undefined}
                    aria-pressed={fields.seat === s.n}
                    onClick={() => pickMarket(s.n, s.label)}
                  >
                    Seat {s.n} · {s.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="board-id-positioning-missing">
              No market is named on the right.{" "}
              <Link href={withPlot("/board/mapping/audience", live?.plot)}>Customer seats</Link>
            </p>
          )
        ) : null}

        <label htmlFor={`bit-${bit}-next`}>
          <span className="kicker">The neighbour, named</span>
          <input
            id={`bit-${bit}-next`}
            type="text"
            value={fields.next || ""}
            onChange={(e) => onField("next", e.target.value)}
          />
        </label>
        {(fields.where || "").trim() && !named ? (
          <p className="board-id-positioning-warn">A named neighbour is required — an advocate, a market, or we do not know yet.</p>
        ) : null}
      </div>

      <label className="board-id-positioning-not" htmlFor={`bit-${bit}-not`}>
        <span className="kicker">Where we will not stand</span>
        <textarea
          id={`bit-${bit}-not`}
          rows={2}
          value={fields.not || ""}
          onChange={(e) => onField("not", e.target.value)}
        />
      </label>

      <p className="board-id-positioning-door">
        <Link href={withPlot("/board/mapping/landscape", live?.plot)}>
          <strong>Landscape</strong>
          <span>{landscape || "Empty. Without this cell, standing here is a pose."}</span>
        </Link>
        <Link href={withPlot("/board/plot/differentiation", live?.plot)}>
          <strong>Differentiation</strong>
          <span>{snip(live, "plot:differentiation") || "Nothing they can point at yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
