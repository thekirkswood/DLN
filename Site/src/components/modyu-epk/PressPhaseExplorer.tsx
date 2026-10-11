"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { phases } from "@/lib/modyu-epk/phases";
import { bottlesForPhase } from "@/lib/modyu-epk/bottles";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";

export function PressPhaseExplorer({
  variant = "shop",
  ingredientsLead = false,
}: {
  /** shop = full /ht4 experience; press = bubbles + phase info only (no buy / voices) */
  variant?: "shop" | "press";
  /** Ingredients-first mock: lead sheet copy with actives */
  ingredientsLead?: boolean;
} = {}) {
  const press = variant === "press";
  const [openPhase, setOpenPhase] = useState<string | null>("p1");
  const [activeBottle, setActiveBottle] = useState<string>("balance");

  const open = useMemo(
    () => phases.find((p) => p.id === openPhase) ?? null,
    [openPhase]
  );

  const phaseBottles = useMemo(
    () => (openPhase ? bottlesForPhase(openPhase) : []),
    [openPhase]
  );

  const selected =
    phaseBottles.find((b) => b.id === activeBottle) || phaseBottles[0];

  function togglePhase(id: string) {
    setOpenPhase((prev) => (prev === id ? null : id));
    const first = bottlesForPhase(id)[0];
    if (first) setActiveBottle(first.id);
  }

  return (
    <div className="phase-bubbles">
      <div
        className="phase-bubbles__rail"
        role="tablist"
        aria-label={ingredientsLead ? "HT4 formulas by stage" : "HT4 phases"}
      >
        {phases.map((phase) => {
          const isOpen = openPhase === phase.id;
          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={isOpen}
              className={`phase-bubble${isOpen ? " is-open" : ""}`}
              style={
                {
                  ["--phase-color" as string]: phase.color,
                } as CSSProperties
              }
              onClick={() => togglePhase(phase.id)}
            >
              <span className="phase-bubble__code">{phase.code}</span>
              <span className="phase-bubble__name">{phase.name}</span>
              {ingredientsLead ? (
                <span className="phase-bubble__timing">{phase.productLine}</span>
              ) : (
                <span className="phase-bubble__timing">{phase.timing}</span>
              )}
            </button>
          );
        })}
      </div>

      {open && selected ? (
        <div
          className="phase-sheet"
          style={{ ["--phase-color" as string]: open.color } as CSSProperties}
          role="tabpanel"
        >
          <div className="phase-sheet__top">
            {ingredientsLead ? (
              <p className="phase-sheet__journey">Key actives in this stage</p>
            ) : (
              <p className="phase-sheet__journey">
                {open.journey}
                <span aria-hidden> →</span>
              </p>
            )}
            <div className="phase-sheet__title-row">
              <div>
                <p className="phase-sheet__code">
                  {open.code}
                  <span>{ingredientsLead ? open.productLine : open.timing}</span>
                </p>
                <h2>
                  {open.name}
                  <small>
                    {ingredientsLead ? open.timing : open.productLine}
                  </small>
                </h2>
              </div>
              {press ? null : (
                <Link className="btn" href={open.shopHref}>
                  Buy now
                </Link>
              )}
            </div>
            <div className="phase-sheet__copy">
              {ingredientsLead ? (
                <>
                  <p>
                    Formulas in this stage use the actives below. Timing is a
                    guide, the ingredients are what make each step distinct.
                  </p>
                  <ul>
                    {phaseBottles.flatMap((b) =>
                      b.ingredients.slice(0, 2).map((ing) => (
                        <li key={`${b.id}-${ing.name}`}>
                          <strong>{ing.name}</strong>, {ing.benefit}
                        </li>
                      ))
                    )}
                  </ul>
                </>
              ) : (
                <>
                  {open.panelCopy.map((para) => (
                    <p key={para.slice(0, 48)}>{para}</p>
                  ))}
                  <ul>
                    {open.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
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
                    style={
                      {
                        ["--bottle-accent" as string]: bottle.color,
                      } as CSSProperties
                    }
                    onClick={() => setActiveBottle(bottle.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={modyuAsset(bottle.image)} alt="" />
                    <span>{bottle.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="phase-detail">
            <div
              className={`phase-detail__bottle${
                /\.(jpe?g|webp)$/i.test(selected.image)
                  ? " phase-detail__bottle--photo"
                  : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modyuAsset(selected.image)} alt={selected.name} />
            </div>
            <div className="phase-detail__info">
              <p className="phase-card__code">
                {selected.code} · {selected.timing}
              </p>
              <h3>{selected.name}</h3>
              <p className="phase-detail__lead">{selected.summary}</p>
              <p>{selected.purpose}</p>

              <div
                className={`phase-detail__grid${
                  ingredientsLead ? " phase-detail__grid--ingredients-first" : ""
                }`}
              >
                <div>
                  <h4>Ingredients</h4>
                  <ul>
                    {selected.ingredients.map((ing) => (
                      <li key={ing.name}>
                        <strong>{ing.name}</strong>, {ing.benefit}
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

              <p className="phase-detail__know">
                {selected.goodToKnow.join(" · ")}
              </p>
            </div>
          </div>

          {null}
        </div>
      ) : null}
    </div>
  );
}
