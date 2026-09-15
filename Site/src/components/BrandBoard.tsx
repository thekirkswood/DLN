"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { FrameworkBoard } from "@/components/FrameworkBoard";
import type { BoardView } from "@/lib/board";
import { writeLastPlot } from "@/data/campus";

export function BrandBoard({
  initial,
  plots,
  studio,
}: {
  initial: BoardView;
  plots: { slug: string; name: string }[];
  studio: boolean;
}) {
  const [view, setView] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [prompt, setPrompt] = useState("");
  const [newBit, setNewBit] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const active = useMemo(() => {
    return view.plans.find((p) => p.status === "ready") || view.plans[0] || null;
  }, [view.plans]);

  async function reload(plot = view.plot) {
    const res = await fetch(`/api/board?plot=${encodeURIComponent(plot)}`, {
      cache: "no-store",
    });
    const data = (await res.json()) as { board?: BoardView };
    if (data.board) setView(data.board);
  }

  const filled = view.bitsLeft.filter((b) => b.body).length;

  async function saveBit(id: string) {
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plot: view.plot, bitId: id, body: draft }),
      });
      if (!res.ok) throw new Error("no");
      setEditing(null);
      await reload();
    } catch {
      setError("That bit did not hold.");
    }
    setPending(false);
  }

  async function sendFeedback(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/board/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plot: view.plot, text: feedback }),
      });
      if (!res.ok) throw new Error("no");
      setFeedback("");
      await reload();
    } catch {
      setError("The funnel did not take that.");
    }
    setPending(false);
  }

  async function addBit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plot: view.plot, addLabel: newBit }),
      });
      if (!res.ok) throw new Error("no");
      setNewBit("");
      await reload();
    } catch {
      setError("That line did not hold.");
    }
    setPending(false);
  }

  async function runPrompt(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plot: view.plot, prompt }),
      });
      if (!res.ok) throw new Error("no");
      setPrompt("");
      await reload();
    } catch {
      setError("The prompt did not hold.");
    }
    setPending(false);
  }

  function openBit(id: string, body: string) {
    setEditing(id);
    setDraft(body);
  }

  return (
    <div className="board">
      <aside className="board-left">
        <p className="house-rail-kicker">Branded profile</p>
        <p className="board-infer">
          These lines contextualise prompts you run through this plot. Fill them
          as the work grows. Empty is allowed.
        </p>
        {view.bitsLeft.map((bit) => (
          <button
            key={bit.id}
            type="button"
            className={bit.body ? "board-bit has-body" : "board-bit"}
            onClick={() => openBit(bit.id, bit.body)}
          >
            <span>{bit.label}</span>
            {bit.body ? <small>{bit.body}</small> : null}
          </button>
        ))}
        <form className="board-add-bit" onSubmit={addBit}>
          <label>
            Add a line
            <input
              value={newBit}
              onChange={(e) => setNewBit(e.target.value)}
              placeholder="A depth this plot needs"
              required
            />
          </label>
          <button type="submit" className="house-add" disabled={pending}>
            Hold
          </button>
        </form>
      </aside>
      <div className="board-main">
        <div className="board-top">
          {plots.length > 1 ? (
            <label className="board-plot">
              Plot
              <select
                value={view.plot}
                onChange={(e) => {
                  writeLastPlot(e.target.value);
                  reload(e.target.value);
                }}
              >
                {plots.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="house-word">{view.plotName}</p>
          )}
          {view.seat ? (
            <p className="board-seat" style={{ color: view.seat.colour }}>
              {view.seat.label}
            </p>
          ) : (
            <p className="board-seat">Design Lab North</p>
          )}
          {view.bitsTop.map((bit) => (
            <button
              key={bit.id}
              type="button"
              className={bit.body ? "board-chip has-body" : "board-chip"}
              onClick={() => openBit(bit.id, bit.body)}
            >
              {bit.label}
            </button>
          ))}
        </div>
        <div className="board-play">
          {editing ? (
            <form
              className="board-edit"
              onSubmit={(e) => {
                e.preventDefault();
                saveBit(editing);
              }}
            >
              <p className="house-rail-kicker">{editing}</p>
              <textarea
                rows={8}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Empty is allowed. Do not invent a line."
              />
              <div className="board-edit-row">
                <button type="submit" className="house-add" disabled={pending}>
                  Hold
                </button>
                <button
                  type="button"
                  className="house-add"
                  onClick={() => setEditing(null)}
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <>
              <FrameworkBoard plotName={view.plotName} />
              <p className="house-rail-kicker">Active</p>
              {view.hostUrl ? (
                <p>
                  Live host:{" "}
                  <a href={view.hostUrl} target="_blank" rel="noreferrer">
                    {view.hostUrl.replace(/^https?:\/\//, "")}
                  </a>
                  <span> · {view.status}</span>
                </p>
              ) : (
                <p>No live host on this plot yet.</p>
              )}
              <p className="board-infer">
                {filled
                  ? `${filled} profile ${filled === 1 ? "line" : "lines"} filled. Prompts pick that depth up.`
                  : "Profile empty. Write a line on the left, then run a prompt through it."}
              </p>
              <form className="board-prompt" onSubmit={runPrompt}>
                <label>
                  Prompt through this profile
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="The filled lines sit behind this. Empty profile is still honest."
                    required
                  />
                </label>
                <button type="submit" className="house-add" disabled={pending}>
                  Run on this plot
                </button>
              </form>
              {active ? (
                <div className="board-active">
                  <h2>{active.title}</h2>
                  <p>{active.status}</p>
                  {active.patchNotes ? <p>{active.patchNotes}</p> : null}
                </div>
              ) : (
                <p>Nothing in flight on the book. Empty is honest.</p>
              )}
              {view.notes.length ? (
                <ul className="board-notes">
                  {view.notes.slice(0, 5).map((n) => (
                    <li key={n.id}>{n.body}</li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
        <div className="board-funnel">
          <p className="house-rail-kicker">Done</p>
          {view.mailbox?.address ? (
            <p className="board-mail">Host mailbox: {view.mailbox.address}</p>
          ) : (
            <p className="board-mail">
              Feedback is this form until Host issues a Design Lab North mailbox
              for the plot. We do not read a private inbox.
              {studio ? (
                <>
                  {" "}
                  <button
                    type="button"
                    className="house-add"
                    disabled={pending}
                    onClick={async () => {
                      setPending(true);
                      await fetch("/api/board/mailbox", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ plot: view.plot }),
                      });
                      await reload();
                      setPending(false);
                    }}
                  >
                    Issue mailbox
                  </button>
                </>
              ) : null}
            </p>
          )}
          <form className="board-feedback" onSubmit={sendFeedback}>
            <label>
              Feedback
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="house-add" disabled={pending}>
              Put on the board
            </button>
          </form>
          {error ? <p className="house-error">{error}</p> : null}
          <ul className="board-funnel-list">
            {view.funnel.map((row) => (
              <li key={row.id}>
                <i style={{ background: row.colour }} aria-hidden />
                <div>
                  <strong>{row.title}</strong>
                  <span>
                    {row.actorName} · {row.how}
                  </span>
                  {row.context ? <small>{row.context}</small> : null}
                </div>
              </li>
            ))}
          </ul>
          {studio ? (
            <p className="board-mail">
              Studio desk stays on <Link href="/account">account</Link>. This board is
              the communal book.
            </p>
          ) : (
            <p className="board-mail">
              Profile and invoices also live on <Link href="/account">account</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
