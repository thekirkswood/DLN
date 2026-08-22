"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const FILTER_DWELL = 2200;
const PIPE_WALK = 1850;
const PIPE_ZIP = 500;
const TAP_HOLD = 3200;

const FILTERS = [
  {
    id: "commercial",
    name: "Commercial",
    hint: "One path",
    copy: "Capital goes into performance, speed to market, and a real return. Not agency fluff.",
  },
  {
    id: "human",
    name: "Human",
    hint: "Two journeys",
    copy: "Journeys that respect attention. Less friction, less strain — built for people, not for grabbing them.",
  },
  {
    id: "societal",
    name: "Societal",
    hint: "Light cells",
    copy: "Light infrastructure. Less waste on the wire, on the server, in the air.",
  },
  {
    id: "environmental",
    name: "Environmental",
    hint: "Closed loop",
    copy: "Zero waste, recycling, and respect for the natural world.",
  },
] as const;

const STAGES = [
  {
    id: "lectures",
    name: "Prep and Plan",
    copy: "We start at once. High-intensity workshops that put identity and business logic under pressure.",
  },
  {
    id: "sandbox",
    name: "Sandbox",
    copy: "Strategize and Play",
  },
  {
    id: "greenhouse",
    name: "Greenhouse Workstation",
    copy: "Grown in a live host through our 8-Phase Process, while you watch and write in.",
  },
  {
    id: "loop",
    name: "Diagnostic Loop",
    copy: "Test, Roll-Out and Governance",
  },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];
type StageId = (typeof STAGES)[number]["id"];

export function QualityFilter() {
  const reduce = usePrefersReducedMotion();
  const canHover = useCanHover();
  const { held, grab, release } = useGrab<FilterId>(canHover);
  const [step, setStep] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Partial<Record<FilterId, HTMLButtonElement | null>>>({});
  const prevStep = useRef(0);

  useEffect(() => {
    if (held) {
      const idx = FILTERS.findIndex((row) => row.id === held);
      if (idx >= 0) setStep(idx);
    }
  }, [held]);

  useEffect(() => {
    if (held || reduce) return;
    const t = window.setTimeout(
      () => setStep((s) => (s + 1) % FILTERS.length),
      FILTER_DWELL,
    );
    return () => window.clearTimeout(t);
  }, [held, reduce, step]);

  const on = held ?? FILTERS[step].id;

  useLayoutEffect(() => {
    const token = tokenRef.current;
    const stack = stackRef.current;
    const btn = btnRefs.current[on];
    if (!token || !stack || !btn) return;

    const place = (fromResize = false) => {
      const wrap =
        !fromResize &&
        held === null &&
        prevStep.current === FILTERS.length - 1 &&
        step === 0;
      const s = stack.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const y = b.top - s.top + b.height / 2 - token.offsetHeight / 2;
      if (wrap) {
        token.classList.add("is-reset");
        token.style.top = "0.15rem";
        void token.offsetHeight;
        token.classList.remove("is-reset");
      }
      token.style.top = `${Math.max(0, y)}px`;
      if (!fromResize) prevStep.current = step;
    };

    place();
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [on, step, held]);

  return (
    <div className="method-stage" onMouseLeave={release}>
      <div
        className="method-figure filter-figure"
        role="img"
        aria-label="Work dropping through four value screens: commercial, human, societal, and environmental"
      >
        <p className="filter-cap">The work</p>
        <div className="filter-stack" ref={stackRef}>
          <span className="filter-token" ref={tokenRef} aria-hidden />
          {FILTERS.map((row) => (
            <div key={row.id} className="filter-unit">
              <button
                type="button"
                ref={(el) => {
                  btnRefs.current[row.id] = el;
                }}
                className={`filter-screen is-${row.id}${on === row.id ? " is-on" : ""}`}
                aria-pressed={on === row.id}
                onClick={() => grab(row.id)}
                onMouseEnter={() => canHover && grab(row.id)}
                onFocus={() => canHover && grab(row.id)}
              >
                <Mesh kind={row.id} />
                <span className="filter-meta">
                  <span className="filter-name">{row.name}</span>
                  <span className="filter-hint">{row.hint}</span>
                </span>
              </button>
              <p className={`tile-note${on === row.id ? " is-on" : ""}`}>{row.copy}</p>
            </div>
          ))}
        </div>
        <p className="filter-cap is-out">It holds</p>
      </div>
      <ul className="method-facets is-filters">
        {FILTERS.map((row) => (
          <li
            key={row.id}
            className={on === row.id ? "is-on" : ""}
            onMouseEnter={() => canHover && grab(row.id)}
          >
            <h3>{row.name}</h3>
            <p>{row.copy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Rail = "top" | "right" | "bottom" | "left";
type Play = { rail: Rail; i: number; rot: number };

function nextPlay(cur: Play): Play {
  if (cur.rail === "top") {
    if (cur.i < STAGES.length - 1) return { ...cur, i: cur.i + 1 };
    return { rail: "right", i: STAGES.length - 1, rot: cur.rot + 90 };
  }
  if (cur.rail === "right") {
    return { rail: "bottom", i: STAGES.length - 1, rot: cur.rot + 90 };
  }
  if (cur.rail === "bottom") {
    if (cur.i > 0) return { ...cur, i: cur.i - 1 };
    return { rail: "left", i: 0, rot: cur.rot + 90 };
  }
  return { rail: "top", i: 0, rot: cur.rot + 90 };
}

export function CampusPipeline() {
  const reduce = usePrefersReducedMotion();
  const canHover = useCanHover();
  const { held, grab, release } = useGrab<StageId>(canHover);
  const [play, setPlay] = useState<Play>({ rail: "top", i: 0, rot: 0 });
  const stackRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Partial<Record<StageId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (held) {
      const idx = STAGES.findIndex((row) => row.id === held);
      if (idx >= 0) {
        setPlay((cur) => ({
          rail: "top",
          i: idx,
          rot: Math.round(cur.rot / 360) * 360,
        }));
      }
    }
  }, [held]);

  useEffect(() => {
    if (held || reduce) return;
    const corner = play.rail === "right" || play.rail === "left";
    const ms = corner ? PIPE_ZIP : PIPE_WALK;
    const t = window.setTimeout(() => setPlay(nextPlay), ms);
    return () => window.clearTimeout(t);
  }, [held, reduce, play]);

  const shown = held
    ? Math.max(0, STAGES.findIndex((row) => row.id === held))
    : play.i;
  const on = STAGES[shown].id;
  const rail = held ? "top" : play.rail;
  const rot = held ? Math.round(play.rot / 360) * 360 : play.rot;
  const zip = !held && (play.rail === "right" || play.rail === "left");

  useLayoutEffect(() => {
    const token = tokenRef.current;
    const stack = stackRef.current;
    const btn = btnRefs.current[on];
    if (!token || !stack || !btn) return;

    const place = () => {
      const s = stack.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const y = b.top - s.top + b.height / 2 - token.offsetHeight / 2;
      token.style.top = `${Math.max(0, y)}px`;
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [on]);

  return (
    <div className="method-stage" onMouseLeave={release}>
      <div
        className="method-figure pipe-figure"
        ref={stackRef}
        role="list"
        aria-label="Four campus rooms, then a return into the lab"
      >
        <span className={`pipe-vtoken${zip ? " is-zip" : ""}`} ref={tokenRef} aria-hidden />
        {STAGES.map((row, i) => (
          <div key={row.id} className="pipe-cell" role="listitem">
            {i > 0 ? <span className="pipe-join" aria-hidden /> : null}
            <button
              type="button"
              ref={(el) => {
                btnRefs.current[row.id] = el;
              }}
              className={`pipe-stop is-${row.id}${on === row.id ? " is-on" : ""}`}
              aria-pressed={on === row.id}
              onClick={() => grab(row.id)}
              onMouseEnter={() => canHover && grab(row.id)}
              onFocus={() => canHover && grab(row.id)}
            >
              <StopIcon kind={row.id} />
              <span className="pipe-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="pipe-name">{row.name}</span>
            </button>
            <p className={`tile-note${on === row.id ? " is-on" : ""}`}>{row.copy}</p>
          </div>
        ))}
      </div>
      <div className="pipe-return">
        <LoopTrack rail={rail} index={shown} rot={rot} zip={zip} />
        <p>Back into the lab when it needs us</p>
      </div>
      <ul className="method-facets is-four">
        {STAGES.map((row) => (
          <li
            key={row.id}
            className={on === row.id ? "is-on" : ""}
            onMouseEnter={() => canHover && grab(row.id)}
          >
            <h3>{row.name}</h3>
            <p>{row.copy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoopTrack({
  rail,
  index,
  rot,
  zip,
}: {
  rail: Rail;
  index: number;
  rot: number;
  zip: boolean;
}) {
  const x =
    rail === "right" ? 1 : rail === "left" ? 0 : index / (STAGES.length - 1);
  const y = rail === "top" || rail === "left" ? 0 : 1;

  return (
    <span className={zip ? "pipe-loop is-zip" : "pipe-loop"}>
      <span className="pipe-loop-top" aria-hidden />
      <span className="pipe-loop-right" aria-hidden />
      <span className="pipe-loop-bottom" aria-hidden />
      <span className="pipe-loop-left" aria-hidden />
      <span
        className="pipe-rider"
        style={{
          left: `calc(0.4rem + (100% - 0.8rem) * ${x})`,
          top: y === 0 ? "0.18rem" : "calc(100% - 0.18rem)",
          transform: `translate(-50%, -50%) rotate(${rot}deg)`,
        }}
        aria-hidden
      />
    </span>
  );
}

function useGrab<T>(canHover: boolean) {
  const [held, setHeld] = useState<T | null>(null);
  const tap = useRef(0);

  useEffect(() => () => window.clearTimeout(tap.current), []);

  const grab = (id: T) => {
    setHeld(id);
    window.clearTimeout(tap.current);
    if (!canHover) {
      tap.current = window.setTimeout(() => setHeld(null), TAP_HOLD);
    }
  };

  const release = () => {
    window.clearTimeout(tap.current);
    setHeld(null);
  };

  return { held, grab, release };
}

function useCanHover() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setOk(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return ok;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduce;
}

function Mesh({ kind }: { kind: FilterId }) {
  if (kind === "commercial") {
    return (
      <svg className="filter-mesh" viewBox="0 0 160 36" aria-hidden>
        <path
          d="M10 4h140l6 6v16l-6 6H10l-6-6V10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M18 14h124l4 4-4 4H18l-4-4z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "human") {
    return (
      <svg className="filter-mesh" viewBox="0 0 160 36" aria-hidden>
        <path
          d="M10 4h140l6 6v16l-6 6H10l-6-6V10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M18 14h52l4 4-4 4H18l-4-4zM90 14h52l4 4-4 4H90l-4-4z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "societal") {
    return (
      <svg className="filter-mesh" viewBox="0 0 160 36" aria-hidden>
        <path
          d="M10 4h140l6 6v16l-6 6H10l-6-6V10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={16 + i * 11} y={13} width="7" height="10" fill="currentColor" />
        ))}
      </svg>
    );
  }
  return (
    <svg className="filter-mesh" viewBox="0 0 160 36" aria-hidden>
      <path
        d="M10 4h140l6 6v16l-6 6H10l-6-6V10z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M38 18h28l6-6 10 12 10-12 6 6h28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M28 14l10 4-10 4v-2.4h-8v-3.2h8zM132 22l-10-4 10-4v2.4h8v3.2h-8z" fill="currentColor" />
    </svg>
  );
}

function StopIcon({ kind }: { kind: StageId }) {
  if (kind === "lectures") {
    return (
      <svg className="pipe-icon" viewBox="0 0 48 48" aria-hidden>
        <path d="M8 32h32v8H8z" fill="currentColor" opacity="0.28" />
        <path d="M12 20h24l4 6H8z" fill="currentColor" />
        <path d="M18 8h12l8 12H10z" fill="currentColor" opacity="0.72" />
        <path d="M22 8v-4h4v4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "sandbox") {
    return (
      <svg className="pipe-icon" viewBox="0 0 48 48" aria-hidden>
        <path d="M8 8h32v32H8z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16h16v16H16z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M22 22h4v4h-4z" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "greenhouse") {
    return (
      <svg className="pipe-icon" viewBox="0 0 48 48" aria-hidden>
        <path d="M8 22 L24 8 L40 22" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M10 38h8V22h-8zM20 38h8V16h-8zM30 38h8V24h-8z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className="pipe-icon" viewBox="0 0 48 48" aria-hidden>
      <path
        d="M14 16h16l8 8v8l-8 8H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M20 32l-10 6 10 6v-4h12v-4H20z" fill="currentColor" />
    </svg>
  );
}
