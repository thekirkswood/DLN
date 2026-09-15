"use client";

import { useState } from "react";

const STEPS = [
  {
    word: "Design",
    rest: " is how we work.",
    body: (
      <>
        Design is a verb as much as a noun. Strategy, packaging, print and
        screen — the same identity, in the places people meet you.
      </>
    ),
  },
  {
    word: "Lab",
    rest: " is how we think.",
    body: (
      <>
        We break the work down, try it, and keep what holds. Small studio.
        Your people in the room with us.
      </>
    ),
  },
  {
    word: "North",
    rest: " is how we execute.",
    body: (
      <>
        On the border between England and Scotland. Independent. We get on
        with the job.
      </>
    ),
  },
] as const;

export function HomeIntro() {
  const [open, setOpen] = useState([false, false, false]);

  function toggle(i: number) {
    setOpen((prev) => prev.map((on, j) => (j === i ? !on : on)));
  }

  return (
    <section className="home-intro wrap">
      <p className="kicker home-kicker">Design Lab North</p>
      <h1>
        We build, scale, and secure resilient brand identity presences on
        screen and in print.
      </h1>
      <p className="home-intro-sub">
        Three words. How we work, how we think, how we execute.
      </p>
      <div className="home-concertina">
        {STEPS.map((step, i) => (
          <div
            key={step.word}
            className={open[i] ? "home-concertina-step is-open" : "home-concertina-step"}
          >
            <button
              type="button"
              className="home-concertina-head"
              aria-expanded={open[i]}
              onClick={() => toggle(i)}
            >
              <h2>
                <span className="home-name-word">{step.word}</span>
                <span className="home-name-rest">{step.rest}</span>
              </h2>
              <span className="home-concertina-arrow" aria-hidden="true" />
            </button>
            {open[i] ? <p>{step.body}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
