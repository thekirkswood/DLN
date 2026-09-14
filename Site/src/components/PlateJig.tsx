"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isPlatePath } from "@/lib/plate";

/** One hairline 45° jig after first move — the plate is dimensioned, not decorated. */
export function PlateJig() {
  const path = usePathname() || "/";
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const gone = useRef(false);

  useEffect(() => {
    if (!isPlatePath(path) || gone.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    function move(e: PointerEvent) {
      if (gone.current) return;
      setPos({ x: e.clientX, y: e.clientY });
      setOn(true);
    }

    window.addEventListener("pointermove", move, { passive: true, once: true });
    const fade = window.setTimeout(() => {
      gone.current = true;
      setOn(false);
    }, 1200);
    return () => {
      window.removeEventListener("pointermove", move);
      window.clearTimeout(fade);
    };
  }, [path]);

  if (!on) return null;
  return (
    <div
      className="plate-jig"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    />
  );
}
