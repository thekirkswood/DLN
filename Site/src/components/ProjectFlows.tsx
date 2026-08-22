"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const WALK = 1400;
const TAP_HOLD = 2800;

const ENGINE = [
  "The Project",
  "The People",
  "Research Analytics Discovery",
  "Initial Ideas",
  "The Concept",
  "The Build",
  "The Implementation",
  "The Guardianship",
] as const;

type Span = {
  label: string;
  from: number;
  to: number;
  out?: string;
  muted?: boolean;
  tip?: "end" | "down";
};

type Flow = {
  id: string;
  title: string;
  sub: string;
  lead?: string;
  rows: Span[][];
  marks: { at: number; label: string }[];
};

const FLOWS: Flow[] = [
  {
    id: "consultancy",
    title: "Consultancy",
    sub: "Addresses the whole, the part and or the sum of the parts",
    rows: [
      [{ label: "Full project", from: 0, to: 7, out: "Scope Audit", tip: "end" }],
      [
        {
          label: "Project Strategy",
          from: 0,
          to: 3,
          out: "Strategy",
          tip: "end",
        },
      ],
    ],
    marks: [
      { at: 0, label: "Understand the project" },
      { at: 1, label: "Alignment" },
      { at: 2, label: "Plan" },
      { at: 3, label: "Concepts" },
      { at: 4, label: "Choosing" },
      { at: 5, label: "Oversight" },
      { at: 6, label: "Oversight" },
      { at: 7, label: "Audit" },
    ],
  },
  {
    id: "design",
    title: "Design",
    sub: "For print or screen",
    rows: [
      [
        {
          label: "Full project",
          from: 0,
          to: 7,
          out: "Design for Print and Screen",
          tip: "end",
        },
      ],
      [{ label: "Concepts", from: 0, to: 3, out: "Concepts", tip: "down" }],
      [{ label: "Sharpening", from: 4, to: 4, out: "Sharpening", tip: "down" }],
    ],
    marks: [],
  },
  {
    id: "websites",
    title: "Websites",
    sub: "Addresses the whole, the part and or the sum of the parts",
    lead: "Full project for start-ups and businesses needing a refresh or rebuild",
    rows: [
      [{ label: "Full project", from: 0, to: 7, out: "Website", tip: "end" }],
      [
        { label: "Briefing", from: 0, to: 3, muted: true },
        { label: "", from: 4, to: 7, out: "Hosting", tip: "down" },
      ],
      [
        { label: "Briefing", from: 0, to: 4, muted: true },
        { label: "", from: 5, to: 7, out: "Hosting", tip: "down" },
      ],
    ],
    marks: [],
  },
];

function col(i: number) {
  return Math.floor(i / 2) * 3 + (i % 2) + 1;
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

function FlowChart({ flow }: { flow: Flow }) {
  const reduce = usePrefersReducedMotion();
  const canHover = useCanHover();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState<number | null>(null);
  const tap = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLSpanElement>(null);
  const stopRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => () => window.clearTimeout(tap.current), []);

  useEffect(() => {
    if (held !== null || reduce) return;
    const t = window.setTimeout(
      () => setI((n) => (n + 1) % ENGINE.length),
      WALK,
    );
    return () => window.clearTimeout(t);
  }, [held, reduce, i]);

  const on = held ?? i;

  useLayoutEffect(() => {
    const board = boardRef.current;
    const rider = riderRef.current;
    const stop = stopRefs.current[on];
    if (!board || !rider || !stop) return;
    const place = () => {
      const b = board.getBoundingClientRect();
      const s = stop.getBoundingClientRect();
      rider.style.left = `${s.left - b.left + s.width / 2}px`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [on]);

  function grab(n: number) {
    setHeld(n);
    setI(n);
    window.clearTimeout(tap.current);
    if (!canHover) tap.current = window.setTimeout(() => setHeld(null), TAP_HOLD);
  }

  return (
    <div
      className={`flow-chart is-${flow.id}`}
      onMouseLeave={() => {
        window.clearTimeout(tap.current);
        setHeld(null);
      }}
    >
      <p className="flow-sub">{flow.sub}</p>
      {flow.lead ? <p className="flow-lead">{flow.lead}</p> : null}
      <div className="flow-board" ref={boardRef}>
        <div className="flow-scopes">
          {flow.rows.map((row, n) => (
            <div key={`${flow.id}-row-${n}`} className="flow-scope-row">
              {row.map((span) => (
                <div
                  key={`${span.label}-${span.from}-${span.to}`}
                  className={span.muted ? "flow-scope is-mute" : "flow-scope"}
                  style={{
                    gridColumn: `${col(span.from)} / ${col(span.to) + 1}`,
                  }}
                >
                  {span.label ? (
                    <span className="flow-scope-label">{span.label}</span>
                  ) : null}
                  <span className="flow-scope-line" aria-hidden />
                  {span.out ? (
                    <span
                      className={
                        on >= span.to
                          ? `flow-out is-${span.tip ?? "end"} is-on`
                          : `flow-out is-${span.tip ?? "end"}`
                      }
                    >
                      <i aria-hidden />
                      {span.out}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flow-track" aria-hidden>
          <span className="flow-rider" ref={riderRef} />
        </div>
        <div className="flow-stages">
          {ENGINE.map((name, n) => (
            <button
              key={name}
              type="button"
              ref={(el) => {
                stopRefs.current[n] = el;
              }}
              className={n === on ? "flow-stop is-on" : "flow-stop"}
              style={{ gridColumn: col(n) }}
              aria-pressed={n === on}
              aria-label={name}
              onClick={() => grab(n)}
              onMouseEnter={() => canHover && grab(n)}
            >
              <span>{name}</span>
            </button>
          ))}
        </div>
        {flow.marks.length ? (
          <div className="flow-marks">
            {flow.marks.map((mark) => (
              <span
                key={`${mark.at}-${mark.label}`}
                className={on >= mark.at ? "flow-mark is-on" : "flow-mark"}
                style={{ gridColumn: col(mark.at) }}
              >
                <i aria-hidden />
                {mark.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectFlows() {
  const [open, setOpen] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const active = FLOWS.find((flow) => flow.id === open) ?? null;

  function pick(id: string) {
    setOpen((cur) => (cur === id ? null : id));
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="project-flows" ref={box}>
      <div className="flow-words">
        {FLOWS.map((flow) => (
          <h3
            key={flow.id}
            className={open === flow.id ? "is-open" : undefined}
          >
            <button
              type="button"
              className="flow-word"
              aria-expanded={open === flow.id}
              onClick={() => pick(flow.id)}
            >
              {flow.title}
            </button>
          </h3>
        ))}
      </div>
      {active ? <FlowChart key={active.id} flow={active} /> : null}
    </div>
  );
}
