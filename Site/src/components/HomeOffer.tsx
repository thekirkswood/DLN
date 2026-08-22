"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { OFFERS, HOME_COLUMNS, offerById, type Facet, type Need } from "@/data/needs";

export function HomeOffer() {
  const homeOffers = HOME_COLUMNS.map((id) => offerById(id)!);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function sync() {
      const track = trackRef.current;
      if (!track) return;
      const w = track.clientWidth;
      if (!w) return;
      const i = Math.round(track.scrollLeft / w);
      setSlide(Math.max(0, Math.min(homeOffers.length - 1, i)));
    }

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    setSlide(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="home-offer">
      <div className="offer-track" ref={trackRef}>
        {homeOffers.map((offer) => {
          const title = offer.homeName || offer.name;
          const cta = offer.homeCta || `Contact ${title}`;
          return (
            <div key={offer.id} className="offer-col">
              <h2>{title}</h2>
              {offer.points?.length ? (
                <ul className="offer-list">
                  {offer.points.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="offer-copy">{offer.copy}</p>
              )}
              <p className="offer-cta">
                <Link href={offer.href}>{cta}</Link>
              </p>
            </div>
          );
        })}
      </div>
      <div className="offer-dots wrap" role="tablist" aria-label="Strategy, Design, Websites">
        {homeOffers.map((offer, i) => (
          <button
            key={offer.id}
            type="button"
            role="tab"
            aria-selected={slide === i}
            aria-label={offer.homeName || offer.name}
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
  open,
}: {
  need?: Need;
  facet?: Facet;
  onClear?: () => void;
  /** Skip the Contact fold and the repeating need line. */
  open?: boolean;
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

  const fields = (
      <form className="enquire" onSubmit={onSubmit}>
        {open ? null : (
          <p className="body bill-note">{active.label}</p>
        )}
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
  );

  if (open) {
    return (
      <div className="enquire-open" id="enquire">
        {fields}
      </div>
    );
  }

  return (
    <details className="enquire-fold" id="enquire">
      <summary>Contact</summary>
      {fields}
    </details>
  );
}
