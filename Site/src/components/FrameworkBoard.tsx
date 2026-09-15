"use client";

import { useMemo, useState } from "react";
import { SCALES, type ScaleId } from "@/data/campus";
import {
  frameworkList,
  frameworkMoves,
  frameworkTopics,
} from "@/data/framework-play";
import type { FacultyId } from "@/data/faculties";

export function FrameworkBoard({
  plotName,
  scale: scaleIn,
  onScale,
}: {
  plotName: string;
  scale?: ScaleId;
  onScale?: (id: ScaleId) => void;
}) {
  const frames = useMemo(() => frameworkList(), []);
  const [scale, setScale] = useState<ScaleId>(scaleIn || "bigger-business");
  const [open, setOpen] = useState<FacultyId | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const active = frames.find((f) => f.id === open) || null;
  const topics = open ? frameworkTopics(open) : [];
  const topicRow = topics.find((t) => t.id === topic) || null;
  const moves = open ? frameworkMoves(open, scale) : [];

  function pickScale(id: ScaleId) {
    setScale(id);
    onScale?.(id);
  }

  function zoom(id: FacultyId) {
    setOpen(id);
    setTopic(null);
  }

  return (
    <div className={open ? "fw-board is-zoom" : "fw-board"}>
      <div className="fw-board-top">
        <p className="house-rail-kicker">The framework</p>
        <p className="fw-plot">{plotName}</p>
        <div className="fw-scales" role="group" aria-label="Scale of business">
          {SCALES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={scale === s.id ? "is-on" : undefined}
              onClick={() => pickScale(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fw-grid" role="list">
        {frames.map((f) => {
          const on = open === f.id;
          if (open && !on) return null;
          return (
            <button
              key={f.id}
              type="button"
              role="listitem"
              className={on ? "fw-tile is-on" : "fw-tile"}
              onClick={() => (on ? setOpen(null) : zoom(f.id))}
              aria-pressed={on}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.glyph} alt="" />
              <span className="fw-n">{f.n}</span>
              <span className="fw-name">{f.name}</span>
            </button>
          );
        })}
      </div>
      {active ? (
        <div className="fw-zoom">
          <p className="fw-caption">{active.caption}</p>
          <p className="fw-body">{active.approach}</p>
          <p className="fw-goal">{active.goal}</p>
          <div className="fw-topics">
            {topics.map((t) => (
              <button
                key={t.id}
                type="button"
                className={topic === t.id ? "is-on" : undefined}
                onClick={() => setTopic(topic === t.id ? null : t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
          {topicRow ? <p className="fw-topic-body">{topicRow.body}</p> : null}
          <ul className="fw-moves">
            {moves.map((m) => (
              <li key={m.action}>
                <strong>{m.action}</strong>
                <span>{m.effect}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="fw-back" onClick={() => setOpen(null)}>
            Back to the board
          </button>
        </div>
      ) : (
        <p className="fw-hint">
          Zoom a framework. Scale of the business changes the actions and what
          they do.
        </p>
      )}
    </div>
  );
}
