"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OFFERS, type Facet } from "@/data/needs";

export function CommandStrip({
  facet,
  onHeld,
}: {
  facet: Facet;
  onHeld: (held: boolean) => void;
}) {
  const offer = OFFERS.find((o) => o.id === facet) || OFFERS[0];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [needId, setNeedId] = useState(offer.needs[0]?.id || "");
  const [draftId, setDraftId] = useState("");
  const [onBook, setOnBook] = useState(false);
  const [pending, setPending] = useState(false);
  const [held, setHeld] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setNeedId(offer.needs[0]?.id || "");
    setHeld(false);
    onHeld(false);
  }, [facet]);

  const ready = Boolean(name.trim() && email.includes("@") && needId && !onBook);

  useEffect(() => {
    if (held || onBook) return;
    if (timer.current) window.clearTimeout(timer.current);
    if (!name && !email && !message && !phone) return;
    timer.current = window.setTimeout(() => {
      fetch("/api/enquiries/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftId || undefined,
          name,
          email,
          phone,
          needId,
          message,
        }),
      })
        .then(async (res) => {
          const data = (await res.json()) as { ok?: boolean; id?: string };
          if (data.id) setDraftId(data.id);
          if (data.id) onHeld(true);
        })
        .catch(() => undefined);
    }, 700);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [name, email, phone, message, needId, draftId, held, onBook, onHeld]);

  async function checkBook() {
    const value = email.trim();
    if (!value.includes("@")) {
      setOnBook(false);
      return;
    }
    const res = await fetch("/api/enquiries/on-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });
    const data = (await res.json()) as { onBook?: boolean };
    setOnBook(Boolean(data.onBook));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    setError("");
    setPending(true);
    const saved = await fetch("/api/enquiries/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draftId || undefined,
        name,
        email,
        phone,
        needId,
        message,
      }),
    });
    const made = (await saved.json().catch(() => ({}))) as { ok?: boolean; id?: string };
    if (!saved.ok || !made.id) {
      setPending(false);
      setError("That didn’t send. Try again, or write to build@designlabnorth.com.");
      return;
    }
    setDraftId(made.id);
    const sent = await fetch("/api/enquiries/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: made.id, send: true }),
    });
    setPending(false);
    if (!sent.ok) {
      setError("That didn’t send. Try again, or write to build@designlabnorth.com.");
      return;
    }
    setHeld(true);
    onHeld(true);
  }

  if (held) {
    return (
      <div className="command-strip is-held">
        <p>We have it.</p>
      </div>
    );
  }

  if (onBook) {
    return (
      <div className="command-strip is-held">
        <p>
          You’re already with us.{" "}
          <Link href="/login?next=/account">Sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <form className="command-strip" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor="plate-need">
        What you need
      </label>
      <select
        id="plate-need"
        value={needId}
        onChange={(e) => setNeedId(e.target.value)}
      >
        {offer.needs.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <p className="enquire-who">
        <label className="visually-hidden" htmlFor="plate-name">
          Name
        </label>
        I’m{" "}
        <input
          id="plate-name"
          className="en-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        .{" "}
        <label className="visually-hidden" htmlFor="plate-email">
          Email
        </label>
        <input
          id="plate-email"
          className="en-mail"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => void checkBook()}
        />
        <span className="enquire-who-join" aria-hidden="true">
          ·
        </span>
        <label className="visually-hidden" htmlFor="plate-phone">
          Phone
        </label>
        <input
          id="plate-phone"
          className="en-tel"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </p>
      <label htmlFor="plate-msg">A little more</label>
      <textarea
        id="plate-msg"
        name="message"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="actions">
        <button type="submit" disabled={!ready || pending} className="chamfer">
          {pending ? "…" : "Send"}
        </button>
      </div>
      {error ? <p className="err">{error}</p> : null}
    </form>
  );
}
