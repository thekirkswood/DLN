"use client";

import { useEffect, useRef, useState } from "react";

type Ground = "paper" | "ink";

function readGround(): Ground {
  if (typeof document === "undefined") return "paper";
  const g = document.documentElement.getAttribute("data-ground");
  return g === "ink" ? "ink" : "paper";
}

function applyGround(next: Ground) {
  document.documentElement.setAttribute("data-ground", next);
  try {
    localStorage.setItem("dln-ground", next);
  } catch {
    /* ignore */
  }
}

export function GroundSwitch() {
  const [ground, setGround] = useState<Ground>("paper");
  const [busy, setBusy] = useState(false);
  const wipe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGround(readGround());
  }, []);

  async function flip() {
    if (busy) return;
    const next: Ground = ground === "paper" ? "ink" : "paper";
    const el = wipe.current;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    applyGround(next);
    setGround(next);

    if (!el || reduce) return;

    setBusy(true);
    el.dataset.to = next;
    el.classList.remove("is-off");
    el.classList.add("is-on");
    await new Promise((r) => setTimeout(r, 280));
    el.offsetWidth;
    el.classList.remove("is-on");
    el.classList.add("is-off");
    await new Promise((r) => setTimeout(r, 280));
    el.classList.remove("is-off");
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        className="ground-switch"
        onClick={flip}
        aria-pressed={ground === "ink"}
        aria-label={ground === "paper" ? "Switch to ink" : "Switch to paper"}
      >
        <span className={ground === "paper" ? "on" : ""}>Paper</span>
        <i className="gs-cut" aria-hidden="true" />
        <span className={ground === "ink" ? "on" : ""}>Ink</span>
      </button>
      <div className="ground-wipe" ref={wipe} aria-hidden="true" />
    </>
  );
}
