"use client";

import { useEffect, useState } from "react";
import { type LineExample } from "@/data/worklines";

const CORE = [
  { src: "/plots/modyu.svg", name: "ModYu" },
  { src: "/brand/dln-mute.png", name: "Design Lab North" },
  { src: "/plots/swarm.svg", name: "Swarm Fund" },
] as const;

function MarkDot({ src, name }: { src: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" title={name} />
  );
}

export function IdentityKit({ shots }: { shots: LineExample[] }) {
  const [on, setOn] = useState(0);
  const laptop = shots[0];
  const phone = shots[1] || shots[0];
  const rows = [
    { id: "laptop" as const, pick: laptop, title: "On the desk" },
    { id: "phone" as const, pick: phone, title: "In the hand" },
  ];
  const held = rows[on];
  if (!held?.pick) return null;
  return (
    <div className="bench-idkit is-desk">
      {rows.map((row, i) => (
        <button
          key={row.id}
          type="button"
          className={`is-${row.id}${on === i ? " is-on" : ""}`}
          onClick={() => setOn(i)}
        >
          <span>{row.title}</span>
          <div className={`id-device is-${row.id}`}>
            {row.id === "phone" ? <i className="id-notch" /> : null}
            <div className="id-screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.pick.src} alt="" />
            </div>
            {row.id === "laptop" ? <i className="id-base" /> : null}
          </div>
        </button>
      ))}
    </div>
  );
}

const UI_FRAMES = ["board", "screen", "hand"] as const;
type UiFrame = (typeof UI_FRAMES)[number];

export function UiKit() {
  const [frame, setFrame] = useState<UiFrame>("board");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t = window.setInterval(() => {
      setFrame((now) => {
        const i = UI_FRAMES.indexOf(now);
        return UI_FRAMES[(i + 1) % UI_FRAMES.length];
      });
    }, 2400);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className={`bench-ui-morph is-${frame}`} aria-hidden>
      <div className="ui-frame">
        <div className="ui-chrome">
          <i />
          <i />
          <i />
        </div>
        <div className="ui-glass">
          <b />
          <b />
          <em />
        </div>
      </div>
    </div>
  );
}

const BRAND_BEATS = [
  {
    title: "Who you are",
    phone: "Your name on the lock screen.",
    social: "How you speak in a feed.",
    mail: "The first letter from the brand.",
  },
  {
    title: "Who it is for",
    phone: "A person you actually know.",
    social: "The people who would share it.",
    mail: "Written to someone, not to everyone.",
  },
  {
    title: "Where you want to be",
    phone: "The same identity, a year out.",
    social: "A post you can still stand behind.",
    mail: "A line you can run the business from.",
  },
] as const;

export function BrandKit() {
  const [beat, setBeat] = useState(0);
  const [n, setN] = useState(0);
  const mark = CORE[n];
  const now = BRAND_BEATS[beat];
  return (
    <div className="bench-brandkit">
      <div className="bench-kit-beats">
        {BRAND_BEATS.map((row, i) => (
          <button
            key={row.title}
            type="button"
            className={beat === i ? "is-on" : undefined}
            onClick={() => setBeat(i)}
          >
            {row.title}
          </button>
        ))}
      </div>
      <div className="bench-brandkit-row">
        <article className="is-phone">
          <span>Phone</span>
          <div className="kit-phone">
            <i className="kit-notch" />
            <button
              type="button"
              className="bench-kit-mark"
              onClick={() => setN((i) => (i + 1) % CORE.length)}
              aria-label="Next mark"
            >
              <MarkDot src={mark.src} name={mark.name} />
            </button>
            <p>{now.phone}</p>
          </div>
        </article>
        <article className="is-social">
          <span>A window</span>
          <div className="kit-window">
            <div className="kit-window-bar" aria-hidden>
              <i />
              <i />
              <i />
            </div>
            <MarkDot src={mark.src} name={mark.name} />
            <p>{now.social}</p>
            <b />
            <b />
          </div>
        </article>
        <article className="is-mail">
          <span>Mail</span>
          <div className="kit-letter">
            <em>To · a person</em>
            <p>{now.mail}</p>
          </div>
        </article>
      </div>
      <p>
        <strong>{now.title}.</strong> Core brand, before it becomes a campaign.
        Tap a surface. The logo can change.
      </p>
    </div>
  );
}

const MARKET_BEATS = [
  {
    title: "How it goes out",
    book: "A book you can hold.",
    bottle: "A pack on a shelf.",
    board: "A board on the street.",
  },
  {
    title: "How people receive it",
    book: "Opened, not displayed.",
    bottle: "Picked up in the hand.",
    board: "Seen at a distance.",
  },
  {
    title: "What you learn",
    book: "What they kept.",
    bottle: "What they came back for.",
    board: "What they remembered.",
  },
] as const;

export function MarketKit() {
  const [beat, setBeat] = useState(0);
  const [n, setN] = useState(0);
  const mark = CORE[n];
  const now = MARKET_BEATS[beat];
  return (
    <div className="bench-marketkit">
      <div className="bench-kit-beats">
        {MARKET_BEATS.map((row, i) => (
          <button
            key={row.title}
            type="button"
            className={beat === i ? "is-on" : undefined}
            onClick={() => setBeat(i)}
          >
            {row.title}
          </button>
        ))}
      </div>
      <div className="bench-brandkit-row">
        <article className="is-book">
          <span>Book</span>
          <div className="kit-book">
            <i />
            <div>
              <MarkDot src={mark.src} name={mark.name} />
              <p>{now.book}</p>
            </div>
          </div>
        </article>
        <article className="is-bottle">
          <span>Bottle</span>
          <div className="kit-bottle">
            <i />
            <button
              type="button"
              className="bench-kit-mark"
              onClick={() => setN((i) => (i + 1) % CORE.length)}
              aria-label="Next mark"
            >
              <MarkDot src={mark.src} name={mark.name} />
            </button>
            <p>{now.bottle}</p>
          </div>
        </article>
        <article className="is-board">
          <span>Board</span>
          <div className="kit-board">
            <MarkDot src={mark.src} name={mark.name} />
            <p>{now.board}</p>
          </div>
        </article>
      </div>
      <p>
        <strong>{now.title}.</strong> Brand strategy is the core. This is how it
        travels, and how the next time is better.
      </p>
    </div>
  );
}

const AUDIT_STEPS = [
  {
    name: "Look",
    text: "What you run now — visual, verbal, technical. Where it still matches, where it has drifted.",
  },
  {
    name: "Sit",
    text: "We come in. Print, pack, site, and the spaces in between — where they fail to meet.",
  },
  {
    name: "Write",
    text: "A clearer brand on the other side. What to keep, what to change, a document you can run.",
  },
] as const;

export function AuditPath() {
  const [step, setStep] = useState(0);
  return (
    <div className="bench-audit">
      <article className={step === 0 ? "is-on" : undefined}>
        <h3>What you run now</h3>
        <div className="bench-audit-skin is-old" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      </article>
      <div className="bench-audit-arrow">
        <span>We come in</span>
        <ol>
          {AUDIT_STEPS.map((row, i) => (
            <li key={row.name} className={step === i ? "is-on" : undefined}>
              <button type="button" onClick={() => setStep(i)}>
                {row.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <article className={step === 2 ? "is-on" : undefined}>
        <h3>A clearer brand</h3>
        <div className="bench-audit-skin is-new" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      </article>
      <p>
        <strong>{AUDIT_STEPS[step].name}.</strong> {AUDIT_STEPS[step].text}
      </p>
    </div>
  );
}

const SIT = [
  {
    name: "Who you are",
    fill: 0.34,
    why: "The name, the stance, and what must be true.",
  },
  {
    name: "Who it is for",
    fill: 0.62,
    why: "The people it has to reach — and who it will not be.",
  },
  {
    name: "How you show it",
    fill: 1,
    why: "The words, the look, the first system. More than start-up, same talk.",
  },
] as const;

export function SittingRing({ layers = 1 }: { layers?: number }) {
  const [on, setOn] = useState(0);
  const rings = Math.max(1, Math.min(layers, 3));
  return (
    <div className="bench-sitting">
      <div className="bench-sitting-rings" aria-hidden>
        {Array.from({ length: rings }, (_, i) => (
          <i
            key={i}
            className={i === rings - 1 ? "is-live" : undefined}
            style={{
              ["--sit" as string]: `${SIT[on].fill * 100}%`,
              ["--ring" as string]: String(1 - i * 0.18),
            }}
          />
        ))}
      </div>
      <div>
        <ul>
          {SIT.map((row, i) => (
            <li key={row.name}>
              <button
                type="button"
                className={on === i ? "is-on" : undefined}
                onClick={() => setOn(i)}
              >
                {row.name}
              </button>
            </li>
          ))}
        </ul>
        <p>
          <strong>{SIT[on].name}.</strong> {SIT[on].why}
        </p>
      </div>
    </div>
  );
}

const START_BEATS = [
  {
    name: "Who you want to be",
    mins: 30,
    why: "The name and the stance. What must be true before you spend on a logo or a site.",
  },
  {
    name: "Who you will be",
    mins: 60,
    why: "Something you can actually build from — not a pitch-deck look.",
  },
  {
    name: "How you describe yourself",
    mins: 90,
    why: "The words and the first look, so Design and Build have a brief, not a guess.",
  },
  {
    name: "Who you are going after",
    mins: 120,
    why: "The people it is for, and who it is not. Then the session is a plan.",
  },
] as const;

export function StartupTalk() {
  const [on, setOn] = useState(0);
  const beat = START_BEATS[on];
  const fill = (beat.mins / 120) * 100;
  function clockOf(mins: number) {
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
  }
  return (
    <div className="bench-startup">
      <div className="bench-startup-clock" aria-hidden>
        <i className="is-live" style={{ ["--sit" as string]: `${fill}%` }} />
        <span>
          {clockOf(beat.mins)}
          <em>of 2:00</em>
        </span>
      </div>
      <div>
        <p className="bench-kicker">A two-hour working session</p>
        <p>Four half-hours. Same evidence we use later, with less of it.</p>
        <ol className="bench-startup-talk">
          {START_BEATS.map((row, i) => (
            <li key={row.name} className={on === i ? "is-on" : undefined}>
              <button type="button" onClick={() => setOn(i)}>
                <span>{clockOf(row.mins)}</span>
                {row.name}
              </button>
            </li>
          ))}
        </ol>
        <p>
          <strong>{beat.name}.</strong> {beat.why}
        </p>
      </div>
    </div>
  );
}
