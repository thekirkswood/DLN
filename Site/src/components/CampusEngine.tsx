"use client";

import { useState } from "react";
import { ENGINE_STAGES } from "@/data/faculties";

export function CampusEngine() {
  const [open, setOpen] = useState(() => ENGINE_STAGES.map(() => false));

  function toggle(i: number) {
    setOpen((prev) => prev.map((on, j) => (j === i ? !on : on)));
  }

  return (
    <section className="campus-engine">
      <div className="home-concertina">
        {ENGINE_STAGES.map((step, i) => (
          <div
            key={step.name}
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
                Stage {i + 1}: {step.name}
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
