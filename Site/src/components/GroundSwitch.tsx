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

export type Ground = (typeof GROUNDS)[number]["id"];

const GROUND_IDS: Ground[] = GROUNDS.map((g) => g.id);

function isGround(value: string | null): value is Ground {
  return Boolean(value && (GROUND_IDS as string[]).includes(value));
}

function readGround(): Ground {
  if (typeof document === "undefined") return "paper";
  const now = document.documentElement.getAttribute("data-ground");
  return isGround(now) ? now : "paper";
}

export function applyGround(next: Ground) {
  document.documentElement.setAttribute("data-ground", next);
  try {
    localStorage.setItem("dln-ground", next);
  } catch {
    /* ignore */
  }
}

export function PaperInkChips() {
  const [ground, setGround] = useState<Ground>("paper");

  useEffect(() => {
    const now = readGround();
    if (now === "ink") {
      setGround("ink");
      return;
    }
    if (now !== "paper") applyGround("paper");
    setGround("paper");
  }, []);

  function pick(next: "paper" | "ink") {
    applyGround(next);
    setGround(next);
    window.dispatchEvent(new CustomEvent("dln-pick-ground", { detail: next }));
  }

  return (
    <div className="bench-grounds" role="group" aria-label="Paper or Ink">
      <button
        type="button"
        className={
          ground === "paper" ? "bench-chip is-paper is-on" : "bench-chip is-paper"
        }
        aria-pressed={ground === "paper"}
        aria-label="Paper"
        onClick={() => pick("paper")}
      />
      <button
        type="button"
        className={
          ground === "ink" ? "bench-chip is-ink is-on" : "bench-chip is-ink"
        }
        aria-pressed={ground === "ink"}
        aria-label="Ink"
        onClick={() => pick("ink")}
      />
    </div>
  );
}

export function GroundSwitch() {
  const [ground, setGround] = useState<Ground>("paper");
  const wipe = useRef<HTMLDivElement>(null);
  const anim = useRef<number | null>(null);
  const groundRef = useRef<Ground>("paper");

  useEffect(() => {
    const now = readGround();
    setGround(now);
    groundRef.current = now;
  }, []);

  function pick(next: Ground) {
    if (next === groundRef.current) return;
    applyGround(next);
    groundRef.current = next;
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

  useEffect(() => {
    function onPick(e: Event) {
      const id = (e as CustomEvent<string>).detail;
      if (isGround(id)) pick(id);
    }
    window.addEventListener("dln-pick-ground", onPick);
    return () => window.removeEventListener("dln-pick-ground", onPick);
  }, []);

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
