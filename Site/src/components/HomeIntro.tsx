"use client";

import { useState } from "react";

const STEPS = [
  {
    word: "Design",
    rest: " is how we work.",
    body: (
      <>
        To us, design is a verb as much as it is a noun. It is the intentional
        architecture of a business. As award-winning designers and marketeers,
        we shape the overarching business <strong>strategy</strong>, craft
        tactile <strong>packaging</strong>, and create seamless user
        experiences across <strong>print and screen</strong>. We don’t just
        make things look beautiful—we engineer cohesive systems that work from
        first thought to final code and beyond.
      </>
    ),
  },
  {
    word: "Lab",
    rest: " is how we think.",
    body: (
      <>
        We approach our work with strict academic rigour, breaking down complex
        digital and marketing challenges into specialist areas to achieve
        absolute excellence in each. We are a small outfit, but through
        inclusive collaboration with our peers in your businesses and
        organisations, we experiment, test, and innovate to ensure your brand
        is delivering value and future-proofed.
      </>
    ),
  },
  {
    word: "North",
    rest: " is how we execute.",
    body: (
      <>
        Physically rooted on the border between England and Scotland, we embody
        a fiercely independent, remote-community attitude. We don’t suffer from
        corporate group-think. We get on with the job with grit, resilience,
        and an unwavering determination to execute.
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
        Our name isn’t a corporate buzzword; it is the exact methodology we
        bring to every strategy, digital build, and creative execution.
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
