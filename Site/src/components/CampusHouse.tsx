"use client";

/** Parked off tester home. Do not iterate — the campus workbench is `/`. */

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HOME_COLUMNS,
  OFFERS,
  offerById,
  type Facet,
} from "@/data/needs";
import {
  DAVE_SENTENCE,
  SCALES,
  defaultNeedForScale,
  lineForScale,
  pipelineForScale,
  pointsForScale,
  readQualify,
  writeQualify,
  type Qualify,
  type ScaleId,
} from "@/data/campus";

const CONCERTINA = [
  {
    word: "Design",
    rest: " is how we work.",
    facet: "design" as Facet,
    body: "To us, design is a verb as much as it is a noun. It is the intentional architecture of a business. We shape the overarching business strategy, craft tactile packaging, and create seamless user experiences across print and screen.",
  },
  {
    word: "Lab",
    rest: " is how we think.",
    facet: "strategy" as Facet,
    body: "We approach our work with strict academic rigour, breaking down complex digital and marketing challenges into specialist areas. We experiment, test, and innovate so the brand holds.",
  },
  {
    word: "North",
    rest: " is how we execute.",
    facet: "build" as Facet,
    body: "Physically rooted on the border between England and Scotland, we get on with the job with grit, resilience, and an unwavering determination to execute.",
  },
] as const;

export function CampusHouse({
  door,
  host = false,
  startAdd = false,
}: {
  door?: Facet | null;
  host?: boolean;
  startAdd?: boolean;
}) {
  const [qualify, setQualify] = useState<Qualify | null>(null);
  const [adding, setAdding] = useState(startAdd);
  const [openFold, setOpenFold] = useState<number | null>(null);

  useEffect(() => {
    setQualify(readQualify());
  }, []);

  const scale = qualify?.scale || null;
  const columns = (door ? [door] : HOME_COLUMNS).map((id) => offerById(id)!);

  return (
    <div className="house">
      <aside className="house-rail" aria-label="What we do">
        {OFFERS.map((offer) => (
          <div key={offer.id} className="house-rail-block">
            <p className="house-rail-kicker">{offer.name}</p>
            <ul>
              {(offer.points || []).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <Link href={offer.href}>{offer.homeCta || `Contact ${offer.name}`}</Link>
          </div>
        ))}
      </aside>
      <div className="house-stage">
        <div className="house-kicker-row">
          <p className="house-word">Campus</p>
          <button type="button" className="house-add" onClick={() => setAdding(true)}>
            Add
          </button>
        </div>
        {host ? (
          <HostRoom />
        ) : (
          <>
            <h1>{DAVE_SENTENCE}</h1>
            {qualify ? <p className="house-line">{lineForScale(qualify.scale)}</p> : null}
            <div className={columns.length === 1 ? "house-offer is-one" : "house-offer"}>
              {columns.map((offer) => (
                <div key={offer.id} className="house-offer-col">
                  <h2>{offer.homeName || offer.name}</h2>
                  <ul>
                    {pointsForScale(offer.id, scale).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <Link href={offer.href}>{offer.homeCta || `Contact ${offer.name}`}</Link>
                </div>
              ))}
            </div>
            <ul className="house-pipe">
              {pipelineForScale(scale).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <div className="house-concertina">
              {CONCERTINA.map((step, i) => (
                <div
                  key={step.word}
                  className={openFold === i ? "house-fold is-open" : "house-fold"}
                >
                  <button
                    type="button"
                    className="house-fold-head"
                    aria-expanded={openFold === i}
                    onClick={() => setOpenFold(openFold === i ? null : i)}
                  >
                    <span className="house-name-word">{step.word}</span>
                    <span className="house-name-rest">{step.rest}</span>
                  </button>
                  {openFold === i ? <p>{step.body}</p> : null}
                </div>
              ))}
            </div>
          </>
        )}
        {adding ? (
          <AddOverlay
            onClose={() => setAdding(false)}
            onSaved={(row) => {
              setQualify(row);
              setAdding(false);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function HostRoom() {
  return (
    <div className="house-host">
      <h1>Hosting</h1>
      <p className="house-line">
        The live host sits with Design Lab North while the brand grows. Tester
        campus only — this priced room is not on the public VPS yet.
      </p>
      <h2>Pricing</h2>
      <ul className="house-host-list">
        <li>
          <span>Basic</span>
          <span>£50 pm</span>
          <Link href="/?add=1">Contact</Link>
        </li>
        <li>
          <span>Heavy traffic</span>
          <span>Negotiable</span>
          <Link href="/?add=1">Contact</Link>
        </li>
        <li>
          <span>Build costs</span>
          <span>On the book</span>
          <Link href="/build">Contact</Link>
        </li>
      </ul>
    </div>
  );
}

function AddOverlay({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (row: Qualify) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [scale, setScale] = useState<ScaleId | null>(null);
  const [needId, setNeedId] = useState(defaultNeedForScale("sole-trader"));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const needs = useMemo(() => {
    if (!scale) return OFFERS.flatMap((o) => o.needs);
    if (scale === "sole-trader") {
      return OFFERS.flatMap((o) => o.needs).filter((n) =>
        ["web-simple-site", "design-assets-logo", "startup-blueprint"].includes(n.id),
      );
    }
    return OFFERS.flatMap((o) => o.needs);
  }, [scale]);

  useEffect(() => {
    if (scale) setNeedId(defaultNeedForScale(scale));
  }, [scale]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!scale) return;
    setPending(true);
    setError("");
    const row: Qualify = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      scale,
      hereFor: ["build"],
      lines: [],
      access: "plot",
      needId,
      message: message.trim() || undefined,
    };
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error("no");
      writeQualify(row);
      onSaved(row);
    } catch {
      setError("That did not take. Check the name, email, and what you want.");
      setPending(false);
    }
  }

  return (
    <div className="house-add-layer" role="dialog" aria-label="Add">
      <div className="house-add-sheet">
        <div className="house-kicker-row">
          <p className="house-word">Add</p>
          <button type="button" className="house-add" onClick={onClose}>
            Close
          </button>
        </div>
        {step === 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && email.trim()) setStep(1);
            }}
          >
            <p className="house-line">Who you are.</p>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <button type="submit" className="house-add">
              Next
            </button>
          </form>
        ) : null}
        {step === 1 ? (
          <div>
            <p className="house-line">How big is the work around you.</p>
            <div className="house-scales">
              {SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={scale === s.id ? "house-scale is-on" : "house-scale"}
                  onClick={() => {
                    setScale(s.id);
                    setStep(2);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {step === 2 && scale ? (
          <form onSubmit={send}>
            <p className="house-line">{lineForScale(scale)}</p>
            <label>
              What you want
              <select value={needId} onChange={(e) => setNeedId(e.target.value)}>
                {needs.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              A line more
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            {error ? <p className="house-error">{error}</p> : null}
            <button type="submit" className="house-add" disabled={pending}>
              {pending ? "Holding" : "Hold this"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
