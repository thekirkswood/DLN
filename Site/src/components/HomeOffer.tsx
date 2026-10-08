"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { OFFERS, HOME_COLUMNS, offerById, type Facet, type Need } from "@/data/needs";
import { wayPriceLabel, waysForContact } from "@/data/ways-in";

export function HomeOffer() {
  const homeOffers = HOME_COLUMNS.map((id) => offerById(id)!);

  return (
    <section className="home-offer">
      <div className="offer-track">
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

function ContactRates({
  facet,
  lab,
}: {
  facet: Facet | "host";
  lab?: boolean;
}) {
  const rows = waysForContact(facet);
  const mail =
    facet === "design"
      ? { href: "mailto:design@designlabnorth.com", label: "design@designlabnorth.com" }
      : facet === "build" || facet === "host"
        ? { href: "mailto:build@designlabnorth.com", label: "build@designlabnorth.com" }
        : null;
  if (!rows.length && !mail) return null;
  return (
    <div className="enquire-rates">
      {rows.map((way) => {
        const price = lab ? wayPriceLabel(way) : "";
        return (
          <p key={way.id}>
            <strong>{way.name}</strong>
            {price ? ` — ${price}` : ""}
          </p>
        );
      })}
      {mail ? (
        <p className="enquire-rates-mail">
          <a href={mail.href}>{mail.label}</a>
        </p>
      ) : null}
    </div>
  );
}

export function EnquireForm({
  need,
  facet,
  onClear,
  open,
  lab,
}: {
  need?: Need;
  facet?: Facet;
  onClear?: () => void;
  /** Skip the Contact fold and the repeating need line. */
  open?: boolean;
  /** Standing GBP on the house. Live VPS hides amounts until a numbered ship. */
  lab?: boolean;
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
        {facet ? <ContactRates facet={facet} lab={lab} /> : null}
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
