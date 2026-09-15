"use client";

import { FormEvent, useEffect, useState } from "react";
import type { EnquiryMsg } from "@/lib/enquiries";

export function OnboardChat({
  enquiryId,
  email,
  initial = [],
  studio = false,
}: {
  enquiryId: string;
  email: string;
  initial?: EnquiryMsg[];
  studio?: boolean;
}) {
  const [thread, setThread] = useState<EnquiryMsg[]>(initial);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const q = new URLSearchParams({ id: enquiryId, email });
    fetch(`/api/enquiries/chat?${q}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { thread?: EnquiryMsg[] }) => {
        if (alive && data.thread?.length) setThread(data.thread);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enquiryId, email]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    setError("");
    const res = await fetch("/api/enquiries/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: enquiryId, text, email }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That did not hold.");
      return;
    }
    const data = (await res.json()) as { thread?: EnquiryMsg[] };
    if (data.thread) setThread(data.thread);
    setText("");
  }

  return (
    <div className="onboard-chat">
      <p className="house-rail-kicker">Chat</p>
      <ol className="onboard-thread">
        {thread.map((m) => (
          <li key={m.id} className={m.from === "campus" ? "is-campus" : "is-visitor"}>
            <span>{m.from === "campus" ? "Campus" : "You"}</span>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
      <form onSubmit={onSubmit}>
        <label>
          {studio ? "Reply — they get an email" : "A line, if you need to add something"}
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="house-add" disabled={pending}>
          {pending ? "…" : studio ? "Send and mail" : "Send"}
        </button>
        {error ? <p className="status">{error}</p> : null}
      </form>
    </div>
  );
}
