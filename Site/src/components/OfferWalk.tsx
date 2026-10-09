"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { FacetStage } from "@/components/WorkLine";
import { type Facet } from "@/data/needs";
import { type LineId } from "@/data/worklines";

const DOORS: Facet[] = ["design", "strategy", "build"];
const LOCK = 110;
const FLICK = 70;
const SNAP_MS = 240;
const IDLE_MS = 280;
const MAIN = new Set(["design", "strategy", "build"]);

export type WalkDoor = Facet | "host";

export function OfferWalk({
  door,
  at,
  focusId,
  onSeen,
  onContact,
  onHost,
  onEngine,
  host,
}: {
  door: WalkDoor;
  at: number;
  focusId?: LineId | null;
  onSeen: (id: WalkDoor) => void;
  onContact: (needId: string) => void;
  onHost?: () => void;
  onEngine?: () => void;
  host?: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const born = useRef(at);
  const acc = useRef(0);
  const last = useRef(0);
  const snapping = useRef(false);
  const spyOff = useRef(false);
  const seen = useRef<WalkDoor>(door);
  const onSeenRef = useRef(onSeen);
  onSeenRef.current = onSeen;

  function doors() {
    const root = scroller.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>("[data-offer-door]")];
  }

  function place(id: WalkDoor, line: LineId | null | undefined, behavior: ScrollBehavior) {
    const root = scroller.current;
    if (!root) return;
    const target = line
      ? root.querySelector(`#line-${line}`)
      : root.querySelector(`[data-offer-door="${id}"]`);
    if (!target) return;
    spyOff.current = true;
    snapping.current = true;
    target.scrollIntoView({ block: "start", behavior });
    window.setTimeout(
      () => {
        spyOff.current = false;
        snapping.current = false;
      },
      behavior === "smooth" ? 360 : 80,
    );
  }

  useLayoutEffect(() => {
    seen.current = door;
    place(door, focusId, "auto");
    // first paint only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (at === born.current) return;
    born.current = at;
    seen.current = door;
    place(door, null, "smooth");
  }, [at, door]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;

    function which(): WalkDoor {
      const list = doors();
      const y = root.scrollTop + Math.max(80, root.clientHeight * 0.32);
      let id: WalkDoor = "design";
      for (const node of list) {
        const key = node.dataset.offerDoor as WalkDoor | undefined;
        if (key && node.offsetTop <= y) id = key;
      }
      return id;
    }

    function onScroll() {
      if (spyOff.current) return;
      const id = which();
      if (id === seen.current) return;
      seen.current = id;
      onSeenRef.current(id);
    }

    function indexOf(list: HTMLElement[]) {
      const y = root.scrollTop + 6;
      let i = 0;
      for (let n = 0; n < list.length; n++) {
        if (list[n].offsetTop <= y) i = n;
      }
      return i;
    }

    function atBound(down: boolean) {
      const list = doors();
      if (!list.length) return false;
      const i = indexOf(list);
      const cur = list[i];
      const next = list[i + (down ? 1 : -1)];
      if (!cur || !next) return false;
      const a = cur.dataset.offerDoor || "";
      const b = next.dataset.offerDoor || "";
      if (!MAIN.has(a) || !MAIN.has(b)) return false;
      const y = root.scrollTop;
      const h = root.clientHeight;
      if (down) return y + h >= cur.offsetTop + cur.offsetHeight - 12;
      return y <= cur.offsetTop + 12;
    }

    function restY(el: HTMLElement, edge: "top" | "bottom") {
      const h = root.clientHeight;
      if (edge === "top") return el.offsetTop;
      return Math.max(el.offsetTop, el.offsetTop + el.offsetHeight - h);
    }

    let anim = 0;
    function goY(top: number) {
      const from = root.scrollTop;
      const to = Math.max(0, top);
      window.cancelAnimationFrame(anim);
      snapping.current = true;
      spyOff.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / SNAP_MS);
        const e = 1 - (1 - u) * (1 - u) * (1 - u);
        root.scrollTop = from + (to - from) * e;
        if (u < 1) {
          anim = window.requestAnimationFrame(tick);
          return;
        }
        snapping.current = false;
        spyOff.current = false;
        const id = which();
        if (id !== seen.current) {
          seen.current = id;
          onSeenRef.current(id);
        }
      };
      anim = window.requestAnimationFrame(tick);
    }

    function settle() {
      if (snapping.current) return;
      const list = doors();
      const y = root.scrollTop;
      const h = root.clientHeight;
      for (let i = 0; i < list.length - 1; i++) {
        const a = list[i];
        const b = list[i + 1];
        const bottomA = Math.max(a.offsetTop, a.offsetTop + a.offsetHeight - h);
        const topB = b.offsetTop;
        if (y > bottomA + 4 && y < topB - 4) {
          goY(y - bottomA <= topB - y ? bottomA : topB);
          return;
        }
      }
    }

    function onWheel(e: WheelEvent) {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (!dy) return;
      if (snapping.current) {
        e.preventDefault();
        return;
      }
      const now = performance.now();
      if (now - last.current > IDLE_MS) acc.current = 0;
      last.current = now;
      const down = dy > 0;
      if (!atBound(down)) {
        acc.current = 0;
        return;
      }
      e.preventDefault();
      acc.current += dy;
      const punch = Math.abs(dy) >= FLICK || Math.abs(acc.current) >= LOCK;
      if (!punch) return;
      acc.current = 0;
      const list = doors();
      const i = indexOf(list);
      const next = list[i + (down ? 1 : -1)];
      if (!next) return;
      goY(restY(next, down ? "top" : "bottom"));
    }

    let touchY = 0;
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0]?.clientY || 0;
    }
    function onTouchMove(e: TouchEvent) {
      if (snapping.current) {
        e.preventDefault();
        return;
      }
      const y = e.touches[0]?.clientY || 0;
      const dy = touchY - y;
      if (!dy) return;
      if (!atBound(dy > 0)) return;
      e.preventDefault();
      acc.current += dy;
      if (Math.abs(acc.current) < LOCK) return;
      acc.current = 0;
      const list = doors();
      const i = indexOf(list);
      const next = list[i + (dy > 0 ? 1 : -1)];
      if (!next) return;
      goY(restY(next, dy > 0 ? "top" : "bottom"));
    }

    let settleT = 0;
    function onScrollSettle() {
      onScroll();
      window.clearTimeout(settleT);
      settleT = window.setTimeout(settle, 120);
    }

    root.addEventListener("scroll", onScrollSettle, { passive: true });
    root.addEventListener("scrollend", settle);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.cancelAnimationFrame(anim);
      window.clearTimeout(settleT);
      root.removeEventListener("scroll", onScrollSettle);
      root.removeEventListener("scrollend", settle);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="bench-offer-walk" ref={scroller}>
      {DOORS.map((id, i) => (
        <div key={id}>
          <div
            id={`offer-${id}`}
            data-offer-door={id}
            className="bench-offer-door"
          >
            <FacetStage
              facet={id}
              focusId={focusId}
              onContact={onContact}
              onHost={onHost}
              onEngine={onEngine}
            />
          </div>
          {i < DOORS.length - 1 || host ? (
            <div className="bench-offer-gap" aria-hidden />
          ) : null}
        </div>
      ))}
      {host}
    </div>
  );
}
