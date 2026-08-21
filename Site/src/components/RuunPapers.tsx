"use client";

import { useEffect, useRef, useState } from "react";
import { HOME_MODULES } from "@/data/needs";

/** Seven RUUN papers. Lived on home; now the head of Methodology. */
export function RuunPapers() {
  const [paper, setPaper] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);
  const [paperMode, setPaperMode] = useState<"scroll" | "fit" | null>(null);

  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    let drag: { x: number; left: number } | null = null;

    function measure() {
      const track = paperRef.current;
      if (!track) return;
      const overflow = track.scrollWidth > track.clientWidth + 4;
      setPaperMode(overflow ? "scroll" : "fit");
      const card = track.querySelector(".home-paper");
      if (!(card instanceof HTMLElement)) return;
      const gap =
        parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14;
      const step = card.offsetWidth + gap;
      if (!step) return;
      const i = Math.round(track.scrollLeft / step);
      setPaper(Math.max(0, Math.min(HOME_MODULES.length - 1, i)));
    }

    function onWheel(e: WheelEvent) {
      const track = paperRef.current;
      if (!track || track.scrollWidth <= track.clientWidth + 4) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }

    function onPointerDown(e: PointerEvent) {
      const track = paperRef.current;
      if (!track || track.scrollWidth <= track.clientWidth + 4) return;
      if (e.pointerType === "touch") return;
      drag = { x: e.clientX, left: track.scrollLeft };
      track.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      const track = paperRef.current;
      if (!track || !drag) return;
      track.scrollLeft = drag.left - (e.clientX - drag.x);
    }

    function onPointerUp() {
      drag = null;
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", measure);
    };
  }, []);

  function goPaper(i: number) {
    const track = paperRef.current;
    const card = track?.querySelector(".home-paper");
    if (!track || !(card instanceof HTMLElement)) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14;
    setPaper(i);
    track.scrollTo({ left: i * (card.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <div className="ruun-papers">
      <div
        className="home-papers"
        ref={paperRef}
        data-mode={paperMode || "scroll"}
        aria-label="RUUN Framework"
      >
        {HOME_MODULES.map((mod) => (
          <figure key={mod.file} className="home-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/home/modules/${mod.file}`} alt={mod.name} />
          </figure>
        ))}
      </div>
      {paperMode === "scroll" ? (
        <div className="home-paper-dots wrap" role="tablist" aria-label="Framework papers">
          {HOME_MODULES.map((mod, i) => (
            <button
              key={mod.file}
              type="button"
              role="tab"
              aria-selected={paper === i}
              aria-label={mod.name}
              className={paper === i ? "is-on" : ""}
              onClick={() => goPaper(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
