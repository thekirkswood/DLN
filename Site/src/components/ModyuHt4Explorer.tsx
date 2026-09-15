"use client";

import { useMemo, useState } from "react";
import { ht4BottlesForPhase, ht4SitePhases } from "@/lib/modyu-ht4";

export function ModyuHt4Explorer() {
  const [openPhase, setOpenPhase] = useState<string | null>("p1");
  const [activeBottle, setActiveBottle] = useState("balance");

  const open = useMemo(
    () => ht4SitePhases.find((p) => p.id === openPhase) ?? null,
    [openPhase],
  );

  const phaseBottles = useMemo(
    () => (openPhase ? ht4BottlesForPhase(openPhase) : []),
    [openPhase],
  );

  const selected = phaseBottles.find((b) => b.id === activeBottle) || phaseBottles[0];

  function togglePhase(id: string) {
    setOpenPhase((prev) => (prev === id ? null : id));
    const first = ht4BottlesForPhase(id)[0];
    if (first) setActiveBottle(first.id);
  }

  return (
    <div className="phase-bubbles">
      <div className="phase-bubbles__rail" role="tablist" aria-label="HT4 phases">
        {ht4SitePhases.map((phase) => {
          const isOpen = openPhase === phase.id;
          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={isOpen}
              className={`phase-bubble${isOpen ? " is-open" : ""}`}
              style={{ ["--phase-color" as string]: phase.color }}
              onClick={() => togglePhase(phase.id)}
            >
              <span className="phase-bubble__code">{phase.code}</span>
              <span className="phase-bubble__name">{phase.name}</span>
              <span className="phase-bubble__timing">{phase.timing}</span>
            </button>
          );
        })}
      </div>

      {open && selected ? (
        <div
          className="phase-sheet"
          style={{ ["--phase-color" as string]: open.color }}
          role="tabpanel"
        >
          <div className="phase-sheet__top">
            <p className="phase-sheet__journey">
              {open.journey}
              <span aria-hidden> →</span>
            </p>
            <div className="phase-sheet__title-row">
              <div>
                <p className="phase-sheet__code">
                  {open.code}
                  <span>{open.timing}</span>
                </p>
                <h2>
                  {open.name}
                  <small>{open.productLine}</small>
                </h2>
              </div>
            </div>
            <div className="phase-sheet__copy">
              {open.panelCopy.map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
              <ul>
                {open.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          {phaseBottles.length > 1 ? (
            <div className="bottle-rail" role="listbox" aria-label={`${open.name} products`}>
              {phaseBottles.map((bottle) => {
                const active = selected.id === bottle.id;
                return (
                  <button
                    key={bottle.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`bottle-chip${active ? " is-active" : ""}`}
                    style={{ ["--bottle-accent" as string]: bottle.color }}
                    onClick={() => setActiveBottle(bottle.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bottle.image} alt="" />
                    <span>{bottle.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="phase-detail">
            <div
              className={`phase-detail__bottle${
                /\.(jpe?g|webp)$/i.test(selected.image) ? " phase-detail__bottle--photo" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.image} alt={selected.name} />
            </div>
            <div className="phase-detail__info">
              <p className="phase-card__code">
                {selected.code} · {selected.timing}
              </p>
              <h3>{selected.name}</h3>
              <p className="phase-detail__lead">{selected.summary}</p>
              <p>{selected.purpose}</p>
              <div className="phase-detail__grid">
                <div>
                  <h4>Ingredients</h4>
                  <ul>
                    {selected.ingredients.map((ing) => (
                      <li key={ing.name}>
                        <strong>{ing.name}</strong> — {ing.benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>How to use</h4>
                  <ol>
                    {selected.howToUse.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <p className="phase-detail__know">{selected.goodToKnow.join(" · ")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
