"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { OFFERS, HOME_MODULES, type Facet, type Need } from "@/data/needs";

export function HomeOffer() {
  const [slide, setSlide] = useState(0);
  const [paper, setPaper] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function sync() {
      const track = trackRef.current;
      if (!track) return;
      const w = track.clientWidth;
      if (!w) return;
      const i = Math.round(track.scrollLeft / w);
      setSlide(Math.max(0, Math.min(OFFERS.length - 1, i)));
    }

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

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

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    setSlide(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  function goPaper(i: number) {
    const track = paperRef.current;
    const card = track?.querySelector(".home-paper");
    if (!track || !(card instanceof HTMLElement)) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 14;
    setPaper(i);
    track.scrollTo({ left: i * (card.offsetWidth + gap), behavior: "smooth" });
  }

  return (
    <section className="home-offer">
      <h1 className="kicker home-kicker wrap">Design Lab North</h1>
      <div
        className="home-papers"
        ref={paperRef}
        data-mode={paperMode || "scroll"}
        aria-label="RUUN Framework"
      >
        {HOME_MODULES.map((mod) => (
          <figure key={mod.file} className="home-paper">
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
      <div className="offer-track" ref={trackRef}>
        {OFFERS.map((offer) => (
          <div key={offer.id} className="offer-col">
            <h2>
              <Link href={offer.href}>{offer.name}</Link>
            </h2>
            <p className="offer-copy">{offer.copy}</p>
            <p className="offer-cta">
              <Link href={offer.href}>Come in on {offer.name}</Link>
            </p>
          </div>
        ))}
      </div>
      <div className="offer-dots wrap" role="tablist" aria-label="Design, Strategy, Build">
        {OFFERS.map((offer, i) => (
          <button
            key={offer.id}
            type="button"
            role="tab"
            aria-selected={slide === i}
            aria-label={offer.name}
            className={slide === i ? "is-on" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}

export function OfferJump({ current }: { current?: Facet }) {
  return (
    <p className="offer-jump">
      {OFFERS.map((offer, i) => (
        <span key={offer.id}>
          {i > 0 ? " · " : null}
          {offer.id === current ? (
            offer.name
          ) : (
            <Link href={offer.href}>{offer.name}</Link>
          )}
        </span>
      ))}
    </p>
  );
}

export function EnquireForm({
  need,
  facet,
  onClear,
}: {
  need?: Need;
  facet?: Facet;
  onClear?: () => void;
}) {
  const pool = useMemo(() => {
    if (need) return [need];
    if (facet) return OFFERS.find((o) => o.id === facet)?.needs || OFFERS[0].needs;
    return OFFERS.flatMap((o) => o.needs);
  }, [need, facet]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [needId, setNeedId] = useState(need?.id || pool[0].id);
  const active = useMemo(() => {
    for (const offer of OFFERS) {
      const found = offer.needs.find((n) => n.id === needId);
      if (found) return found;
    }
    return OFFERS[0].needs[0];
  }, [needId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    setPending(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        needId: active.id,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That didn’t send. Try again, or write to build@designlabnorth.com.");
      return;
    }
    setOk(true);
    e.currentTarget.reset();
  }

  if (ok) {
    return (
      <div className="enquire" id="enquire">
        <p className="body">
          We have it. We’ll write back about the work, and make you an account
          if that’s the next step.
        </p>
        {onClear ? (
          <button type="button" className="act-quiet" onClick={onClear}>
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <details className="enquire-fold" id="enquire">
      <summary>Tell us</summary>
      <form className="enquire" onSubmit={onSubmit}>
        <p className="body bill-note">{active.label}</p>
        {!need ? (
          <>
            <label htmlFor="need">What you need</label>
            <select
              id="need"
              value={needId}
              onChange={(e) => setNeedId(e.target.value)}
            >
              {facet ? (
                pool.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))
              ) : (
                OFFERS.map((offer) => (
                  <optgroup key={offer.id} label={offer.name}>
                    {offer.needs.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          </>
        ) : null}
        <p className="enquire-who">
          <label className="visually-hidden" htmlFor="en-name">
            Name
          </label>
          I’m{" "}
          <input
            id="en-name"
            className="en-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="name"
          />
          .{" "}
          <label className="visually-hidden" htmlFor="en-email">
            Email
          </label>
          <input
            id="en-email"
            className="en-mail"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="email"
          />
          <span className="enquire-who-join" aria-hidden="true">
            ·
          </span>
          <label className="visually-hidden" htmlFor="en-phone">
            Phone
          </label>
          <input
            id="en-phone"
            className="en-tel"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="phone"
          />
        </p>
        <label htmlFor="en-msg">A little more</label>
        <textarea id="en-msg" name="message" rows={4} />
        <div className="actions">
          <button type="submit" disabled={pending}>
            {pending ? "…" : "Send"}
          </button>
          {onClear ? (
            <button type="button" className="act-quiet" onClick={onClear}>
              Cancel
            </button>
          ) : null}
        </div>
        {error ? <p className="err">{error}</p> : null}
      </form>
    </details>
  );
}
