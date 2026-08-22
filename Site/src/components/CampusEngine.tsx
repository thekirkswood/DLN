"use client";

import { useState } from "react";

const STAGES = [
  {
    title: "The Project",
    body: "Defining parameters, parameters, and foundational expectations.",
  },
  {
    title: "The People",
    body: "Achieving team alignment and uniting project stakeholders.",
  },
  {
    title: "Research, Analytics & Discovery",
    body: "Deep-dive analysis, system audits, and market landscape data.",
  },
  {
    title: "Initial Ideas",
    body: "Unfiltered creative thinking and conceptual exploration.",
  },
  {
    title: "The Concept",
    body: "Sharpening, selecting, and formalising the chosen direction.",
  },
  {
    title: "The Build",
    body: "Technical development, physical production, or strategic structuring.",
  },
  {
    title: "The Implementation",
    body: "Deployment, going live, or releasing to market.",
  },
  {
    title: "The Guardianship",
    body: "Long-term management, testing, security, and continuous value auditing.",
  },
] as const;

export function CampusEngine() {
  const [open, setOpen] = useState(() => STAGES.map(() => false));

  function toggle(i: number) {
    setOpen((prev) => prev.map((on, j) => (j === i ? !on : on)));
  }

  return (
    <section className="campus-engine">
      <h2 className="method-block">The 8-Stage Campus Engine</h2>
      <p>
        Every project that enters the campus regardless of scope moves through
        the exact same eight milestones of academic rigour. This ensures
        absolute alignment, complete transparency, and zero operational drift.
      </p>
      <div className="home-concertina">
        {STAGES.map((step, i) => (
          <div
            key={step.title}
            className={
              open[i] ? "home-concertina-step is-open" : "home-concertina-step"
            }
          >
            <button
              type="button"
              className="home-concertina-head"
              aria-expanded={open[i]}
              onClick={() => toggle(i)}
            >
              <h3>
                Stage {i + 1}: {step.title}
              </h3>
              <span className="home-concertina-arrow" aria-hidden="true" />
            </button>
            {open[i] ? <p>{step.body}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
