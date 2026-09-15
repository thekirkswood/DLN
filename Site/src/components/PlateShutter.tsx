"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** 45° cut between public views — Paper never blanks. */
export function PlateShutter() {
  const path = usePathname() || "/";
  const first = useRef(true);
  const el = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const node = el.current;
    if (!node) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    if (timer.current) window.clearTimeout(timer.current);
    const ground =
      document.documentElement.getAttribute("data-ground") || "paper";
    node.dataset.to = ground;
    node.classList.remove("is-off");
    node.classList.add("is-on");
    timer.current = window.setTimeout(() => {
      node.classList.remove("is-on");
      node.classList.add("is-off");
      timer.current = window.setTimeout(() => {
        node.classList.remove("is-off");
        node.classList.remove("is-on");
        timer.current = null;
      }, 280);
    }, 280);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [path]);

  return <div className="plate-shutter" ref={el} aria-hidden="true" />;
}
