"use client";

import Link from "next/link";
import { SCALE_FLAG_READ, readScaleId } from "@/data/campus";
import { type Faculty } from "@/data/faculties";
import { actionSlug, frameworkMoves, frameworkTopics } from "@/data/framework-play";
import { boardTopicHref } from "@/data/board-map";
import { APES_MINDSETS, APES_TASK_TYPES, TASKEX_LOOP } from "@/data/apes-play";
import { withPlot, type BoardLive } from "@/data/board-live";
import { packSummary } from "@/lib/board-pack";
import "./BoardApes.css";

const PLAY_IDS = ["combinations", "cycle", "cards", "interrogation"] as const;

function snip(live: BoardLive | null | undefined, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > 88 ? `${line.slice(0, 87)}…` : line;
}

export function BoardApes({
  faculty,
  initialScale,
  live,
}: {
  faculty: Faculty;
  initialScale?: string;
  live?: BoardLive | null;
}) {
  const scale = readScaleId(live?.snippets["mapping:scale"] || initialScale);
  const moves = scale ? frameworkMoves(faculty.id, scale) : [];
  const plot = live?.plot;
  const play = frameworkTopics(faculty.id).filter((t) =>
    PLAY_IDS.includes(t.id as (typeof PLAY_IDS)[number])
  );
  const cultural = snip(live, "mapping:cultural");

  return (
    <article className="board-room is-apes">
      <header className="board-id-mast">
        <p className="kicker">
          {faculty.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{faculty.name}</h1>
      </header>
      <ul className="apes-clover">
        {APES_MINDSETS.map((m) => (
          <li key={m.id}>
            <Link href={withPlot(boardTopicHref("apes", m.id), plot)} className="apes-mind chamfer">
              <span className="apes-letter">{m.letter}</span>
              <strong>{m.name}</strong>
              <span>{m.ask}</span>
            </Link>
          </li>
        ))}
      </ul>

      <ul className="apes-task-doors">
        {APES_TASK_TYPES.map((t) => (
          <li key={t.id}>
            <Link href={withPlot(boardTopicHref("apes", t.id), plot)} className="chamfer">
              <strong>{t.name}</strong>
            </Link>
          </li>
        ))}
      </ul>

      <ul className="apes-play-doors">
        {play.map((t) => (
          <li key={t.id}>
            <Link href={withPlot(boardTopicHref("apes", t.id), plot)} className="chamfer">
              <strong>{t.name}</strong>
              <span>{t.body}</span>
            </Link>
          </li>
        ))}
      </ul>

      <ol className="apes-cycle is-taskex">
        {TASKEX_LOOP.map((s) => (
          <li key={s.id} id={`taskex-${s.id}`} className="chamfer">
            <span className="apes-n">{s.n}</span>
            <strong>{s.name}</strong>
            <span>{s.job}</span>
          </li>
        ))}
      </ol>

      <aside className={cultural ? "apes-engine chamfer" : "apes-engine chamfer is-unlit"}>
        <p className="kicker">Social engine</p>
        <Link href={withPlot("/board/mapping/cultural", plot)}>Cultural / Social</Link>
        {cultural ? <p>{cultural}</p> : <p>Unlit</p>}
      </aside>

      <details className="board-holds">
        <summary>Behind this room</summary>
        <p className="body">
          Four lenses, not people. Never label a person as an Analytical thinker. {faculty.foundation}{" "}
          {faculty.approach} <strong>{faculty.goal}</strong>
        </p>
        {moves.length ? (
          <ul className="fw-moves">
            {moves.map((m) => (
              <li key={m.action} id={actionSlug(m.action)}>
                <strong>{m.action}</strong>
                <span>{m.effect}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="body">
            {scale ? SCALE_FLAG_READ[scale] : "Hold the scale flag first."}
          </p>
        )}
      </details>
    </article>
  );
}
