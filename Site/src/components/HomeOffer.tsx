"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OFFERS, type Facet, type Need } from "@/data/needs";

export function HomeOffer() {
  const [need, setNeed] = useState<Need | null>(null);

  useEffect(() => {
    if (!need) return;
    document.getElementById("enquire")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [need]);

  return (
    <section className="home-offer wrap">
      <h1 className="kicker home-kicker">Design Lab North</h1>
      <div className="offer-track">
        {OFFERS.map((offer) => (
          <div key={offer.id} className="offer-col">
            <h2>
              <Link href={offer.href}>{offer.name}</Link>
            </h2>
            <ul className="need-list">
              {offer.needs.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={need?.id === item.id ? "need-btn is-on" : "need-btn"}
                    onClick={() => setNeed(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {need ? (
        <EnquireForm key={need.id} need={need} onClear={() => setNeed(null)} />
      ) : null}
      <p className="home-quiet">
        <Link href="/practice">The practice</Link>
        {" · "}
        <Link href="/greenhouse">Greenhouse</Link>
      </p>
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
  onClear,
}: {
  need?: Need;
  onClear?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [needId, setNeedId] = useState(need?.id || OFFERS[0].needs[0].id);
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
    <form className="enquire" id="enquire" onSubmit={onSubmit}>
      <p className="kicker">Tell us</p>
      <p className="body bill-note">{active.label}</p>
      {!need ? (
        <>
          <label htmlFor="need">What you need</label>
          <select
            id="need"
            value={needId}
            onChange={(e) => setNeedId(e.target.value)}
          >
            {OFFERS.map((offer) => (
              <optgroup key={offer.id} label={offer.name}>
                {offer.needs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </>
      ) : null}
      <label htmlFor="en-name">Name</label>
      <input id="en-name" name="name" required autoComplete="name" />
      <label htmlFor="en-email">Email</label>
      <input id="en-email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="en-phone">Phone</label>
      <input id="en-phone" name="phone" type="tel" autoComplete="tel" />
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
}
