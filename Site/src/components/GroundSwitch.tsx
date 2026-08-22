"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const GROUNDS = [
  { id: "paper", hex: "#ffffff", label: "White" },
  { id: "ink", hex: "#353c44", label: "Charcoal" },
  { id: "grey", hex: "#e5e5e5", label: "Grey" },
  { id: "mint", hex: "#e9f5eb", label: "Mint" },
  { id: "mist", hex: "#eaedee", label: "Mist" },
  { id: "cream", hex: "#f9f8eb", label: "Cream" },
  { id: "blush", hex: "#f8f2f6", label: "Blush" },
] as const;

type Ground = (typeof GROUNDS)[number]["id"];

const GROUND_IDS: Ground[] = GROUNDS.map((g) => g.id);

function isGround(value: string | null): value is Ground {
  return Boolean(value && (GROUND_IDS as string[]).includes(value));
}

function readGround(): Ground {
  if (typeof document === "undefined") return "paper";
  const now = document.documentElement.getAttribute("data-ground");
  return isGround(now) ? now : "paper";
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

  function pick(next: Ground) {
    if (next === ground) return;
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
        el.classList.remove("is-on");
        anim.current = null;
      }, 280);
    }, 280);
  }

  return (
    <>
      <div className="ground-switch" role="group" aria-label="Site background">
        <span className="ground-bknd" aria-hidden="true">
          BKND
        </span>
        {GROUNDS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={ground === g.id ? "ground-dot is-on" : "ground-dot"}
            style={{ "--dot": g.hex } as CSSProperties}
            onClick={() => pick(g.id)}
            aria-pressed={ground === g.id}
            aria-label={g.label}
            title={g.label}
          />
        ))}
      </div>
      <div className="ground-wipe" ref={wipe} aria-hidden="true" />
    </>
  );
}
