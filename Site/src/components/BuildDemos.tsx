"use client";

import { useEffect, useRef, useState } from "react";

export const WORK_FLOW = [
  { id: "in", name: "User input" },
  { id: "dln", name: "DLN process" },
  { id: "out", name: "Task output" },
  { id: "alloc", name: "Allocated" },
  { id: "done", name: "Completed" },
  { id: "talk", name: "Commented" },
  { id: "mem", name: "Logged to memory" },
] as const;

const JOBS = [
  { id: "note", name: "A note on the live wall" },
  { id: "session", name: "A session to book" },
  { id: "stills", name: "A pack of stills to check" },
] as const;

type JobId = (typeof JOBS)[number]["id"];

function laneOf(step: number): 0 | 1 | 2 {
  if (step <= 1) return 0;
  if (step <= 4) return 1;
  return 2;
}

export function WorkFlowStrip({
  step,
  onPick,
}: {
  step: number;
  onPick?: (i: number) => void;
}) {
  return (
    <ol className="bench-flow is-ticks" aria-label="How work moves">
      {WORK_FLOW.map((row, i) => (
        <li key={row.id} className={i === step ? "is-on" : i < step ? "is-did" : undefined}>
          <button
            type="button"
            onClick={() => onPick?.(i)}
            aria-current={i === step ? "step" : undefined}
            aria-label={row.name}
            title={row.name}
          >
            <span>{i + 1}</span>
            {i === step ? <em>{row.name}</em> : null}
          </button>
        </li>
      ))}
    </ol>
  );
}

function DeskGlyph({ job }: { job: JobId }) {
  if (job === "note") {
    return (
      <i className="bench-desk-glyph is-note" aria-hidden>
        <b />
        <b />
        <b />
      </i>
    );
  }
  if (job === "session") {
    return (
      <i className="bench-desk-glyph is-session" aria-hidden>
        <b />
      </i>
    );
  }
  return (
    <i className="bench-desk-glyph is-stills" aria-hidden>
      <b />
      <b />
      <b />
    </i>
  );
}

function DeskPlay({ job, step }: { job: JobId; step: number }) {
  const filled = Math.min(6, step <= 1 ? 1 : step === 2 ? 3 : step === 3 ? 4 : 6);
  const slot = 2;
  return (
    <div className={`bench-desk-play is-${job} is-s${step}`} aria-hidden>
      {job === "note" ? (
        <div className="bench-play-wall">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <b
              key={n}
              className={
                n < filled
                  ? n === filled - 1
                    ? "is-on is-in"
                    : "is-on"
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
      {job === "session" ? (
        <div className="bench-play-week">
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <i
              key={n}
              className={n === slot && step >= 2 ? "is-on" : n < slot && step >= 4 ? "is-did" : undefined}
            />
          ))}
          {step >= 3 ? <em /> : null}
        </div>
      ) : null}
      {job === "stills" ? (
        <div className="bench-play-stills">
          <b />
          <b />
          <b />
        </div>
      ) : null}
    </div>
  );
}

export function WorkspaceDemo() {
  const field = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 42, y: 28 });
  const [coarse, setCoarse] = useState(false);
  const [job, setJob] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 860px)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const fieldEl = field.current;
    if (!fieldEl) return;
    const node: HTMLDivElement = fieldEl;
    function move(e: PointerEvent) {
      const box = node.getBoundingClientRect();
      setPointer({
        x: ((e.clientX - box.left) / box.width) * 100,
        y: ((e.clientY - box.top) / box.height) * 100,
      });
    }
    node.addEventListener("pointermove", move);
    return () => node.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const t = window.setInterval(() => {
      setStep((n) => (n + 1) % WORK_FLOW.length);
    }, 1700);
    return () => window.clearInterval(t);
  }, [job]);

  function run() {
    setStep((n) => (n + 1) % WORK_FLOW.length);
  }

  const lane = laneOf(step);
  const held = JOBS[job];
  const col = lane === 0 ? "in" : lane === 1 ? "work" : "done";

  return (
    <div className="bench-workspace">
      <div
        ref={field}
        className="bench-workspace-field is-desk"
        style={{
          ["--mx" as string]: `${pointer.x}%`,
          ["--my" as string]: `${pointer.y}%`,
        }}
      >
        <header className="bench-desk-bar">
          <span>Your space</span>
          <b>{held.name}</b>
        </header>
        <div className={`bench-desk-cols is-${col}`}>
          <section className={col === "in" ? "is-on" : undefined}>
            <h3>Incoming</h3>
            {JOBS.map((row, i) => (
              <button
                key={row.id}
                type="button"
                className={job === i ? "is-on" : undefined}
                onClick={() => {
                  setJob(i);
                  setStep(0);
                }}
              >
                <DeskGlyph job={row.id} />
                {row.name}
              </button>
            ))}
          </section>
          <section className={col === "work" ? "is-on" : undefined}>
            <h3>In work</h3>
            <DeskPlay job={held.id} step={step} />
          </section>
          <section className={col === "done" ? "is-on" : undefined}>
            <h3>Done</h3>
            <div className={`bench-desk-land${step >= 5 ? " is-in" : ""}`}>
              <DeskPlay job={held.id} step={step >= 5 ? 6 : 0} />
              {step >= 5 ? <i className="bench-desk-stamp" /> : null}
            </div>
          </section>
        </div>
        <div className="bench-workspace-spot" aria-hidden />
      </div>
      <WorkFlowStrip step={step} onPick={setStep} />
      <p>
        <button type="button" className="bench-cta" onClick={run}>
          Next action
        </button>
      </p>
      {coarse ? (
        <p className="bench-phone-note">
          On a phone this follows a tap. Same desk. Next action moves the job.
        </p>
      ) : null}
    </div>
  );
}

const APP_LAYOUTS = ["side", "flip", "top", "bottom", "dock"] as const;
type AppLayout = (typeof APP_LAYOUTS)[number];

export function AppSketch() {
  const [layout, setLayout] = useState<AppLayout>("side");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t = window.setInterval(() => {
      setLayout((now) => {
        const i = APP_LAYOUTS.indexOf(now);
        return APP_LAYOUTS[(i + 1) % APP_LAYOUTS.length];
      });
    }, 2400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className={`bench-app-sketch is-${layout}`} aria-hidden>
      <div className="bench-app-chrome">
        <div className="bench-app-dots">
          <i />
          <i />
          <i />
        </div>
        <span>App</span>
      </div>
      <aside>
        <b />
        <b />
        <b />
      </aside>
      <div className="bench-app-main">
        <em />
        <em />
        <em />
      </div>
    </div>
  );
}

export function SimpleFormats() {
  const [shot, setShot] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t = window.setInterval(() => setShot((n) => (n + 1) % 3), 2200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="bench-site-row is-four">
      <article className="bench-site-card is-gallery">
        <div className="bench-site-bar">
          <i />
          <i />
          <i />
          <span>A portrait wall</span>
        </div>
        <div className="bench-site-body is-graphic">
          <div className="bench-gallery-grid">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <b key={n} className={n % 3 === shot ? "is-on" : undefined} />
            ))}
          </div>
          <div className="bench-gallery-dots">
            {[0, 1, 2].map((n) => (
              <i key={n} className={n === shot ? "is-on" : undefined} />
            ))}
          </div>
          <p>A simple gallery</p>
        </div>
      </article>
      <article className="bench-site-card is-shop">
        <div className="bench-site-bar">
          <i />
          <i />
          <i />
          <span>A shop window</span>
        </div>
        <div className="bench-site-body is-graphic">
          <div className="bench-shop-row">
            <figure>
              <b />
              <span>£</span>
            </figure>
            <figure>
              <b />
              <span>£</span>
            </figure>
          </div>
          <p>A simple shop front</p>
        </div>
      </article>
      <article className="bench-site-card is-page">
        <div className="bench-site-bar">
          <i />
          <i />
          <i />
          <span>A page</span>
        </div>
        <div className="bench-site-body is-graphic">
          <div className="bench-page-lines">
            <b />
            <b />
            <b />
          </div>
          <p>A simple page</p>
        </div>
      </article>
      <article className="bench-site-card is-diary">
        <div className="bench-site-bar">
          <i />
          <i />
          <i />
          <span>A diary</span>
        </div>
        <div className="bench-site-body is-graphic">
          <div className="bench-diary-slots">
            <b />
            <b />
            <b />
          </div>
          <p>A simple diary</p>
        </div>
      </article>
    </div>
  );
}

function ModernSkin({
  flush,
  tint,
}: {
  flush: boolean;
  tint?: boolean;
}) {
  return (
    <div
      className={[
        "bench-modern-skin",
        flush ? "is-flush" : "is-clunky",
        tint ? "is-tint" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <i />
      <i />
      <i />
    </div>
  );
}

const PATCHES = [
  { n: ".1", text: "Change the title." },
  { n: ".2", text: "Sit the body in a different colour." },
] as const;

export function ModernizeDemo() {
  const [notes, setNotes] = useState(0);
  const [sandboxOn, setSandboxOn] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (notes !== 2 || sandboxOn || liveOn) return;
    setBusy(true);
    const t = window.setTimeout(() => {
      setSandboxOn(true);
      setBusy(false);
    }, 520);
    return () => window.clearTimeout(t);
  }, [notes, sandboxOn, liveOn]);

  function go() {
    if (busy) return;
    if (liveOn) {
      setNotes(0);
      setSandboxOn(false);
      setLiveOn(false);
      return;
    }
    if (sandboxOn) {
      setLiveOn(true);
      return;
    }
    if (notes < 2) setNotes(notes + 1);
  }

  const label = liveOn
    ? "Again"
    : sandboxOn
      ? "Push"
      : "Leave the note";

  return (
    <div
      className={`bench-modern is-n${notes}${sandboxOn ? " is-sandbox-on" : ""}${liveOn ? " is-live-on" : ""}`}
    >
      <div className="bench-modern-pair">
        <article>
          <h2>The live site</h2>
          <ModernSkin flush={liveOn} tint={liveOn} />
        </article>
        <article className="is-sandbox">
          <h2>Private preview</h2>
          <ModernSkin flush={sandboxOn} tint={sandboxOn} />
          <p
            className={`bench-modern-quote${notes >= 1 ? " is-shift" : ""}`}
          >
            “{PATCHES[Math.min(notes, PATCHES.length - 1)].text}”
          </p>
          {notes > 0 ? (
            <ol className="bench-modern-log">
              {PATCHES.slice(0, notes).map((row) => (
                <li key={row.n}>
                  <span>{row.n}</span>
                  {row.text}
                </li>
              ))}
            </ol>
          ) : null}
        </article>
      </div>
      <button
        type="button"
        className="bench-cta"
        onClick={go}
        disabled={busy}
      >
        {label}
      </button>
    </div>
  );
}

export function SystemsSketch() {
  return (
    <ul className="bench-systems">
      <li>
        <strong>API</strong>
        <span>
          Add the ability — mail, pay, stock, maps, whatever the work needs. If
          you already run something, we can join that too.
        </span>
      </li>
      <li>
        <strong>Data</strong>
        <span>One record. The desk tells the truth, whoever is looking.</span>
      </li>
      <li>
        <strong>Host</strong>
        <span>
          Live site, and a private preview beside it. Reopen the preview
          whenever you want to edit again.
        </span>
      </li>
      <li>
        <strong>Sign-in</strong>
        <span>Accounts, roles, who can see what. The door into the work.</span>
      </li>
      <li>
        <strong>The rest</strong>
        <span>
          Back-office systems the public never sees. Built from the start, or
          grown onto what you have.
        </span>
      </li>
    </ul>
  );
}
