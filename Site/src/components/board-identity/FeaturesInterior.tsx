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
import styles from "./FeaturesInterior.module.css";

function linesOf(raw: string): string[] {
  const lines = (raw || "").split("\n");
  return lines.length ? lines : [""];
}

export function FeaturesInterior({
  bit,
  fields,
  live,
  pending,
  error,
  onField,
  onSubmit,
}: BitInteriorProps) {
  const has = linesOf(fields.has || "");
  const missing = linesOf(fields.not || "");
  const count = has.filter((l) => l.trim()).length;
  const benefit = snip(live, "plot:benefit");
  const difference = snip(live, "plot:differentiation");

  function setHas(next: string[]) {
    onField("has", next.join("\n"));
  }

  function setMissing(next: string[]) {
    onField("not", next.join("\n"));
  }

  function changeHas(i: number, value: string) {
    setHas(has.map((line, n) => (n === i ? value : line)));
  }

  function changeMissing(i: number, value: string) {
    setMissing(missing.map((line, n) => (n === i ? value : line)));
  }

  function addHas() {
    if (has.length >= 24) return;
    setHas([...has, ""]);
  }

  function addMissing() {
    if (missing.length >= 12) return;
    setMissing([...missing, ""]);
  }

  function dropHas(i: number) {
    const next = has.filter((_, n) => n !== i);
    setHas(next.length ? next : [""]);
  }

  function dropMissing(i: number) {
    const next = missing.filter((_, n) => n !== i);
    setMissing(next.length ? next : [""]);
  }

  return (
    <form className={`board-id-features ${styles.root}`} onSubmit={onSubmit}>
      <div className="board-id-features-count">
        <p className="kicker">In fact</p>
        <p>
          <strong>{count}</strong>
          <span>{count === 1 ? "feature" : "features"}</span>
        </p>
      </div>

      <div className="board-id-features-cols">
        <section>
          <p className="kicker">What it actually has</p>
          <ol className="board-id-features-list">
            {has.map((line, i) => (
              <li key={`has-${i}`}>
                <label htmlFor={`bit-${bit}-has-${i}`}>
                  <span className="kicker">{String(i + 1).padStart(2, "0")}</span>
                  <input
                    id={`bit-${bit}-has-${i}`}
                    type="text"
                    value={line}
                    onChange={(e) => changeHas(i, e.target.value)}
                  />
                </label>
                {has.length > 1 ? (
                  <button type="button" className="board-id-features-drop" onClick={() => dropHas(i)}>
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
          {has.length < 24 ? (
            <p className="board-id-features-add">
              <button type="button" onClick={addHas}>
                Add a feature
              </button>
            </p>
          ) : null}
        </section>

        <section className="board-id-features-assumed">
          <p className="kicker">What it does not have, that people assume</p>
          <ul className="board-id-features-list is-not">
            {missing.map((line, i) => (
              <li key={`not-${i}`}>
                <label htmlFor={`bit-${bit}-not-${i}`}>
                  <span className="kicker">Assumed</span>
                  <input
                    id={`bit-${bit}-not-${i}`}
                    type="text"
                    value={line}
                    onChange={(e) => changeMissing(i, e.target.value)}
                  />
                </label>
                {missing.length > 1 ? (
                  <button type="button" className="board-id-features-drop" onClick={() => dropMissing(i)}>
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ul>
          {missing.length < 12 ? (
            <p className="board-id-features-add">
              <button type="button" onClick={addMissing}>
                Add an assumption
              </button>
            </p>
          ) : null}
        </section>
      </div>

      <p className="board-id-features-door">
        <Link href={withPlot("/board/plot/benefit", live?.plot)}>
          <strong>Benefit</strong>
          <span>{benefit || "What a person feels after these facts is not on this plot yet."}</span>
        </Link>
        <Link href={withPlot("/board/plot/differentiation", live?.plot)}>
          <strong>Differentiation</strong>
          <span>{difference || "Nothing they can point at yet."}</span>
        </Link>
      </p>

      <NeighbourWords live={live} />
      <SocketRow />
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}
