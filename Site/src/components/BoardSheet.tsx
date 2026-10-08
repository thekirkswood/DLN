"use client";

import { FormEvent, useState, type ReactNode } from "react";
import Link from "next/link";
import { facultyGlyph, type Faculty } from "@/data/faculties";
import { frameworkTopics } from "@/data/framework-play";
import { boardAvenueHref, boardTopicHref } from "@/data/board-map";
import {
  boardSideLine,
  facultySheet,
  topicSheet,
  type BoardSheet,
} from "@/data/board-sheets";
import { emptyLead, withPlot, type BoardLive } from "@/data/board-live";

function snippetLine(live: BoardLive | null, key: string, fallback: string): string {
  const body = live?.snippets[key]?.trim();
  if (!body) return fallback;
  const line = body.split("\n")[0].trim();
  return line.length > 88 ? `${line.slice(0, 87)}…` : line;
}

function SheetBody({
  faculty,
  sheet,
  topicId,
  live,
  extra,
  omitDoors,
}: {
  faculty: Faculty;
  sheet: BoardSheet;
  topicId?: string;
  live: BoardLive | null;
  extra?: ReactNode;
  omitDoors?: boolean;
}) {
  const [held, setHeld] = useState(live?.held || "");
  const [draft, setDraft] = useState(live?.held || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const related = live?.related || [];
  const lead = held.trim()
    ? held.trim()
    : live
      ? emptyLead(live.plotName, sheet.name, related.length > 0)
      : "No plot on this account yet. The cell is ready when a site is on the book.";
  const empty = !held.trim();
  const topics = frameworkTopics(faculty.id);
  const seat = live?.seat;
  const plot = live?.plot;

  async function hold(e: FormEvent) {
    e.preventDefault();
    if (!live) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          live.bitId
            ? { plot: live.plot, bitId: live.bitId, body: draft }
            : { plot: live.plot, cellKey: live.cellKey, body: draft }
        ),
      });
      if (!res.ok) throw new Error("no");
      setHeld(draft.trim());
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <article className="board-room is-sheet">
      <header className="board-room-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={facultyGlyph(faculty.id)} alt="" />
        <div>
          <p className="kicker">
            {omitDoors
              ? "00 Plot · Identity"
              : `${faculty.n} ${faculty.name}${topicId ? "" : " · Avenue"}`}
            {seat ? ` · Seat ${seat}` : ""}
          </p>
          <h1>{sheet.name}</h1>
          <p className="lede">{sheet.lede}</p>
        </div>
      </header>
      <p className="board-side">{boardSideLine(sheet.side)}</p>
      {live ? (
        <p className="board-plot-line">
          Reading {live.plotName}
          {live.hostUrl ? (
            <>
              {" · "}
              <a href={live.hostUrl} target="_blank" rel="noreferrer">
                {live.hostUrl.replace(/^https?:\/\//, "")}
              </a>
            </>
          ) : null}
          <span> · {live.status}</span>
        </p>
      ) : null}

      <section className={empty ? "board-now is-empty" : "board-now"}>
        <p className="kicker">{empty ? "Not on this plot yet" : "On this plot"}</p>
        {lead.split("\n").map((p, i) => (
          <p key={`${i}-${p.slice(0, 24)}`} className="body">
            {p}
          </p>
        ))}
      </section>

      {related.length ? (
        <>
          <h2>From the rest of the plot</h2>
          <ul className="board-related">
            {related.map((row) => {
              const inner = (
                <>
                  <strong>{row.label}</strong>
                  <span>{row.body}</span>
                </>
              );
              return (
                <li key={row.href + row.label}>
                  {row.href.startsWith("http") ? (
                    <a href={row.href} target="_blank" rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <Link href={row.href}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {live?.seats ? (
        <>
          <h2>Seats on the table</h2>
          <ol className="board-seats">
            {live.seats.map((c) => (
              <li key={c.n} className={c.n === seat ? "is-on" : undefined}>
                <Link href={c.href}>
                  <span className="apes-n">{c.n}</span>
                  <strong>{c.held ? c.held.split("\n")[0] : `Seat ${c.n}`}</strong>
                  <span>{c.held ? "Named on this plot." : "Not named."}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {live ? (
        <form className="board-add" onSubmit={hold}>
          <label>
            {seat ? `More on seat ${seat}` : "More on this cell"}
            <textarea
              rows={7}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What belongs here, in their words. Empty is allowed. Do not invent a line."
            />
          </label>
          <button type="submit" className="house-add" disabled={pending}>
            Hold
          </button>
          {error ? <p className="board-infer">{error}</p> : null}
        </form>
      ) : null}

      <details className="board-holds">
        <summary>What this cell holds</summary>
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
      </details>

      {extra}

      {omitDoors ? null : (
        <>
          <h2>{topicId ? "Neighbours on this avenue" : "Rooms on this avenue"}</h2>
          <ul className="board-topic-doors">
            {topics.map((t) => {
              const key = `${faculty.id}:${t.id}`;
              return (
                <li key={t.id}>
                  <Link
                    href={withPlot(boardTopicHref(faculty.id, t.id), plot)}
                    aria-current={t.id === topicId ? "page" : undefined}
                  >
                    <strong>{t.name}</strong>
                    <span>{snippetLine(live, key, t.body)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {topicId ? (
            <p className="actions">
              <Link className="act act-line" href={withPlot(boardAvenueHref(faculty.id), plot)}>
                Back to {faculty.name}
              </Link>
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}

export function BoardAvenue({
  faculty,
  live,
}: {
  faculty: Faculty;
  live: BoardLive | null;
}) {
  const sheet = facultySheet(faculty.id);
  if (!sheet) return null;
  return (
    <SheetBody
      key={live?.cellKey || sheet.key}
      faculty={faculty}
      sheet={sheet}
      live={live}
    />
  );
}

export function BoardTopic({
  faculty,
  topicId,
  live,
  extra,
}: {
  faculty: Faculty;
  topicId: string;
  live: BoardLive | null;
  extra?: ReactNode;
}) {
  const sheet = topicSheet(faculty.id, topicId);
  if (!sheet) return null;
  return (
    <SheetBody
      key={live?.cellKey || sheet.key}
      faculty={faculty}
      sheet={sheet}
      topicId={topicId}
      live={live}
      extra={extra}
    />
  );
}

