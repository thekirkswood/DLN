"use client";

import { useEffect, useRef, useState } from "react";

type Ground = "paper" | "ink";

function readGround(): Ground {
  if (typeof document === "undefined") return "paper";
  return document.documentElement.getAttribute("data-ground") === "ink"
    ? "ink"
    : "paper";
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
  const wipe = useRef<HTMLDivElement>(null);
  const anim = useRef<number | null>(null);

  useEffect(() => {
    setGround(readGround());
  }, []);

  function flip() {
    const next: Ground = ground === "paper" ? "ink" : "paper";
    applyGround(next);
    setGround(next);

    const el = wipe.current;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce) return;

    if (anim.current) window.clearTimeout(anim.current);
    el.dataset.to = next;
    el.classList.remove("is-off");
    el.classList.add("is-on");
    anim.current = window.setTimeout(() => {
      el.classList.remove("is-on");
      el.classList.add("is-off");
      anim.current = window.setTimeout(() => {
        el.classList.remove("is-off");
        anim.current = null;
      }, 280);
    }, 280);
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
