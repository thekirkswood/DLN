"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HOME_COLUMNS, offerById, type Facet } from "@/data/needs";
import { CommandStrip } from "@/components/CommandStrip";
import { pathForFacet } from "@/lib/plate";

const STEPS = [
  {
    word: "Design",
    rest: " is how we work.",
    facet: "design" as Facet,
    body: (
      <>
        To us, design is a verb as much as it is a noun. It is the intentional
        architecture of a business. As award-winning designers and marketeers,
        we shape the overarching business{" "}
        <button type="button" className="plate-word" data-facet="strategy">
          strategy
        </button>
        , craft tactile{" "}
        <button type="button" className="plate-word" data-facet="design">
          packaging
        </button>
        , and create seamless user experiences across{" "}
        <button type="button" className="plate-word" data-facet="design">
          print and screen
        </button>
        . We don’t just make things look beautiful—we engineer cohesive systems
        that work from first thought to final code and beyond.
      </>
    ),
  },
  {
    word: "Lab",
    rest: " is how we think.",
    facet: "strategy" as Facet,
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
    facet: "build" as Facet,
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

function readOpen(): boolean {
  try {
    return sessionStorage.getItem("dln-plate-open") === "1";
  } catch {
    return false;
  }
}

function writeOpen(open: boolean) {
  try {
    sessionStorage.setItem("dln-plate-open", open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function HomeEngine({ facet = null }: { facet?: Facet | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(() => Boolean(facet) || false);
  const [armed, setArmed] = useState<Facet | null>(facet);
  const [concertina, setConcertina] = useState([false, false, false]);
  const [desk, setDesk] = useState(false);
  const [houses, setHouses] = useState(false);
  const [sessionOn, setSessionOn] = useState(false);

  useEffect(() => {
    const fromUrl = facet;
    const stored = readOpen();
    const start = Boolean(fromUrl) || stored;
    setOpen(start);
    setArmed(fromUrl);
    if (fromUrl === "design") setConcertina([true, false, false]);
    else if (fromUrl === "strategy") setConcertina([false, true, false]);
    else if (fromUrl === "build") setConcertina([false, false, true]);
    if (fromUrl) writeOpen(true);
    try {
      if (!sessionStorage.getItem("dln-plate-chip")) {
        sessionStorage.setItem("dln-plate-chip", crypto.randomUUID());
      }
    } catch {
      /* ignore */
    }
    setSessionOn(true);
  }, [facet]);

  useEffect(() => {
    router.prefetch("/practice");
    router.prefetch("/work");
    router.prefetch("/greenhouse");
    router.prefetch("/design");
    router.prefetch("/strategy");
    router.prefetch("/build");
    fetch("/api/plate/signal", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { houses?: boolean }) => setHouses(Boolean(data.houses)))
      .catch(() => undefined);
  }, [router]);

  const unfold = useCallback(() => {
    setOpen(true);
    writeOpen(true);
    setSessionOn(true);
  }, []);

  const fold = useCallback(() => {
    setOpen(false);
    writeOpen(false);
    setArmed(null);
    setConcertina([false, false, false]);
    router.push("/");
  }, [router]);

  useEffect(() => {
    function onFold() {
      fold();
    }
    window.addEventListener("dln-plate-fold", onFold);
    return () => window.removeEventListener("dln-plate-fold", onFold);
  }, [fold]);

  useEffect(() => {
    function wake() {
      unfold();
    }
    window.addEventListener("pointerdown", wake, { once: true });
    window.addEventListener("keydown", wake, { once: true });
    return () => {
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [unfold]);

  function arm(next: Facet) {
    unfold();
    setArmed(next);
    if (next === "build") {
      setConcertina((prev) => [prev[0], prev[1], true]);
    }
    if (next === "design") {
      setConcertina((prev) => [true, prev[1], prev[2]]);
    }
    if (next === "strategy") {
      setConcertina((prev) => [prev[0], true, prev[2]]);
    }
    try {
      if (!sessionStorage.getItem("dln-ink-offered")) {
        sessionStorage.setItem("dln-ink-offered", "1");
        window.dispatchEvent(new CustomEvent("dln-pick-ground", { detail: "ink" }));
      }
    } catch {
      /* ignore */
    }
    const href = pathForFacet(next);
    if (window.location.pathname !== href) router.push(href);
  }

  function toggleStep(i: number) {
    setConcertina((prev) => prev.map((on, j) => (j === i ? !on : on)));
    const step = STEPS[i];
    if (!concertina[i]) arm(step.facet);
  }

  function onWord(e: MouseEvent<HTMLElement>) {
    const btn = (e.target as HTMLElement).closest("[data-facet]") as HTMLElement | null;
    if (!btn) return;
    const next = btn.dataset.facet as Facet;
    if (next) arm(next);
  }

  const lamps = {
    design: armed === "design",
    strategy: armed === "strategy",
    build: armed === "build",
    houses,
    session: sessionOn,
    desk,
  };

  const homeOffers = HOME_COLUMNS.map((id) => offerById(id)!);

  return (
    <div className={open ? "home-plate is-open" : "home-plate"}>
      <div className="plate-lamps" aria-hidden="true">
        <i className={lamps.design ? "is-on is-design" : "is-design"} />
        <i className={lamps.strategy ? "is-on is-strategy" : "is-strategy"} />
        <i className={lamps.build ? "is-on is-build" : "is-build"} />
        <i className={lamps.houses ? "is-on is-houses" : "is-houses"} />
        <i className={lamps.session ? "is-on is-session" : "is-session"} />
        <i className={lamps.desk ? "is-on is-desk" : "is-desk"} />
      </div>
      <section className="home-chamber is-d">
        <p className="kicker home-kicker">Design Lab North</p>
        <h1>
          We build, scale, and secure resilient brand identity presences on
          screen and in print.
        </h1>
        <p className="home-intro-sub">
          Our name isn’t a corporate buzzword; it is the exact methodology we
          bring to every strategy, digital build, and creative execution.
        </p>
      </section>

      {open ? (
        <>
          <section
            className={armed ? `home-chamber is-l is-armed-${armed}` : "home-chamber is-l"}
            aria-label="Strategy, Design, Build"
          >
            <div className="offer-track is-nested">
              {homeOffers.map((offer) => {
                const title = offer.homeName || offer.name;
                const on = armed === offer.id;
                return (
                  <div
                    key={offer.id}
                    className={on ? "offer-col is-armed" : "offer-col"}
                  >
                    <h2>
                      <button
                        type="button"
                        className="plate-valve"
                        aria-pressed={on}
                        onClick={() => arm(offer.id)}
                      >
                        {title}
                      </button>
                    </h2>
                    {offer.points?.length ? (
                      <ul className="offer-list">
                        {offer.points.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="offer-copy">{offer.copy}</p>
                    )}
                    <p className="offer-cta">
                      <Link href={offer.href} onClick={() => arm(offer.id)}>
                        {offer.homeCta || `Contact ${title}`}
                      </Link>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="home-chamber is-n" aria-label="Design, Lab, North">
            <div className="home-concertina" onClick={onWord}>
              {STEPS.map((step, i) => (
                <div
                  key={step.word}
                  className={
                    concertina[i]
                      ? "home-concertina-step is-open"
                      : "home-concertina-step"
                  }
                >
                  <button
                    type="button"
                    className="home-concertina-head"
                    aria-expanded={concertina[i]}
                    onClick={() => toggleStep(i)}
                  >
                    <h2>
                      <span className="home-name-word">{step.word}</span>
                      <span className="home-name-rest">{step.rest}</span>
                    </h2>
                    <span className="home-concertina-arrow" aria-hidden="true" />
                  </button>
                  {concertina[i] ? <p>{step.body}</p> : null}
                </div>
              ))}
            </div>
            {armed ? (
              <CommandStrip facet={armed} onHeld={setDesk} />
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
