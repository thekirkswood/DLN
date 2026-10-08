"use client";

import { FormEvent, Fragment, useState } from "react";
import { APES_COMBINATIONS, type ApesCombo } from "@/data/apes-play";
import { emptyLead, type BoardLive } from "@/data/board-live";
import { packSummary, readPack, writePack, type ApesComboPack } from "@/lib/board-pack";
import "./BoardApes.css";

const LETTERS = ["A", "P", "E", "S"] as const;

const GROUPS: { id: string; name: string; line: string; className: string; ids: string[] }[] = [
  {
    id: "one",
    name: "One letter",
    line: "Fluent, and alone. The other three have not spoken.",
    className: "",
    ids: ["a", "p", "e", "s"],
  },
  {
    id: "two",
    name: "Two letters",
    line: "A pair that still leaves two silent.",
    className: "is-pairs",
    ids: ["ap", "ae", "as", "pe", "ps", "es"],
  },
  {
    id: "three",
    name: "Three letters",
    line: "Almost. The missing one is the hole.",
    className: "",
    ids: ["ape", "aps", "aes", "pes"],
  },
  {
    id: "four",
    name: "Full 360",
    line: "All four have spoken. Completeness is still an illusion until you look.",
    className: "is-full",
    ids: ["full"],
  },
];

function axis(combo: ApesCombo, letter: (typeof LETTERS)[number]): string {
  if (letter === "A") return combo.a;
  if (letter === "P") return combo.p;
  if (letter === "E") return combo.e;
  return combo.s;
}

function letterOn(combo: ApesCombo, letter: string): boolean {
  return combo.lenses.split("+").includes(letter);
}

function snip(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > 140 ? `${line.slice(0, 139)}…` : line;
}

async function holdCell(plot: string, cellKey: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, cellKey, body }),
  });
  if (!res.ok) throw new Error("no");
}

export function BoardApesCombinations({ live }: { live: BoardLive | null }) {
  const existing = readPack(live?.held || "");
  const start: ApesComboPack =
    existing?.kind === "apes-combo"
      ? existing
      : { v: 1, kind: "apes-combo", combo: "", why: live?.held?.trim() && !live.held.trim().startsWith("{") ? live.held.trim() : "" };
  const [comboId, setComboId] = useState(start.combo);
  const [why, setWhy] = useState(start.why);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [held, setHeld] = useState(live?.held || "");
  const picked = APES_COMBINATIONS.find((c) => c.id === comboId);
  const work = snip(live, "plot:mission") || snip(live, "plot:purpose");
  const summary = packSummary(held);
  const empty = !summary.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    const pack: ApesComboPack = { v: 1, kind: "apes-combo", combo: comboId, why };
    try {
      await holdCell(live.plot, live.cellKey, writePack(pack));
      setHeld(writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <>
      <section className={empty ? "board-now is-empty" : "board-now"}>
        <p className="kicker">{empty ? "Not pinned yet" : "This work is sitting in"}</p>
        <p className="body">
          {summary.trim() ||
            (live
              ? emptyLead(live.plotName, "Combinations", (live.related || []).length > 0)
              : "Which combo is this work sitting in. Not a personality quiz.")}
        </p>
      </section>
      <p className="apes-note">
        Fifteen combinations from the pamphlet. They diagnose partial attention in the work — never a type of
        person. Full 360 is the last row.
      </p>
      <div className="apes-combo-work">
        <p className="kicker">The work on the table</p>
        {work ? (
          <strong>{work}</strong>
        ) : (
          <p className="apes-note">
            {live ? `${live.plotName} has no mission line yet. Pin the combo anyway, then fill the left of the table.` : "No plot on this account yet."}
          </p>
        )}
      </div>
      <form className="apes-combo-plate" onSubmit={onSubmit}>
        {GROUPS.map((group) => (
          <section key={group.id} className={`apes-combo-group ${group.className}`.trim()}>
            <h3>{group.name}</h3>
            <p className="apes-note">{group.line}</p>
            {group.ids.map((id) => {
              const combo = APES_COMBINATIONS.find((c) => c.id === id);
              if (!combo) return null;
              const on = combo.id === comboId;
              return (
                <button
                  key={combo.id}
                  type="button"
                  className={on ? "apes-combo chamfer is-on" : "apes-combo chamfer"}
                  aria-pressed={on}
                  onClick={() => setComboId(combo.id)}
                >
                  <span className="apes-combo-lenses">
                    <b>{combo.lenses}</b>
                    <span className="apes-combo-marks" aria-hidden>
                      {LETTERS.map((letter) => (
                        <i key={letter} className={letterOn(combo, letter) ? undefined : "is-off"}>
                          {letter}
                        </i>
                      ))}
                    </span>
                  </span>
                  <span className="apes-combo-axes">
                    {LETTERS.map((letter) => (
                      <Fragment key={letter}>
                        <b>{letter}</b>
                        <span className={letterOn(combo, letter) ? undefined : "is-off"}>{axis(combo, letter)}</span>
                      </Fragment>
                    ))}
                  </span>
                  <p className="apes-combo-out">{combo.outcome}</p>
                  {combo.line ? <p className="apes-combo-line">{combo.line}</p> : null}
                </button>
              );
            })}
          </section>
        ))}
        <label className="apes-combo-why" htmlFor="apes-combo-why">
          <span className="kicker">Why this work is sitting here</span>
          <textarea
            id="apes-combo-why"
            rows={4}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="The work, not a person. What is missing for 360?"
          />
          <em>
            {picked
              ? picked.id === "full"
                ? "All four have spoken. Say what still has to be true for it to last."
                : `Silent: ${LETTERS.filter((l) => !letterOn(picked, l)).join(", ") || "none"}. What would change if that letter spoke?`
              : "Pick the row this work is in today."}
          </em>
        </label>
        {live ? (
          <p className="board-save">
            <button type="submit" className="house-add" disabled={pending || !comboId}>
              {pending ? "Holding…" : "Hold this room"}
            </button>
            {error ? <span className="board-infer">{error}</span> : null}
          </p>
        ) : null}
      </form>
    </>
  );
}
