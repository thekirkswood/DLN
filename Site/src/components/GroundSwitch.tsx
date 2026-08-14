"use client";

import { useEffect, useRef, useState } from "react";

type Ground = "paper" | "ink";

export function GroundSwitch() {
  const [ground, setGround] = useState<Ground>("paper");
  const wipe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = document.documentElement.getAttribute("data-ground");
    if (g === "ink" || g === "paper") setGround(g);
  }, []);

  async function flip() {
    const next: Ground = ground === "paper" ? "ink" : "paper";
    const el = wipe.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el && !reduce) {
      el.dataset.to = next;
      el.classList.remove("is-off");
      el.classList.add("is-on");
      await new Promise((r) => setTimeout(r, 480));
      document.documentElement.setAttribute("data-ground", next);
      localStorage.setItem("dln-ground", next);
      setGround(next);
      el.classList.remove("is-on");
      el.classList.add("is-off");
      await new Promise((r) => setTimeout(r, 480));
      el.classList.remove("is-off");
    } else {
      document.documentElement.setAttribute("data-ground", next);
      localStorage.setItem("dln-ground", next);
      setGround(next);
    }
  }

  return (
    <>
      <button
        type="button"
        className="ground-switch"
        onClick={flip}
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
