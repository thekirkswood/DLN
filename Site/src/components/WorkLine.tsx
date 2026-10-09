"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SOLPORT } from "@/data/bench";
import { FILTERS } from "@/data/faculties";
import {
  brandsForLine,
  brandsForRoom,
  type BrandRoom,
} from "@/data/plates";
import { type Facet } from "@/data/needs";
import {
  STRATEGY_OPEN,
  linesFor,
  type LineExample,
  type LineId,
  type WorkLine,
} from "@/data/worklines";
import { ModernWindows, SimpleWindow } from "@/components/BuildDemos";
import {
  AppPair,
  AvenueRead,
  CounselLevels,
  HostLoop,
  IdentityKit,
  PackLoop,
  UiKit,
} from "@/components/OfferDemos";

export function BrandStrip({
  lineId,
  room,
}: {
  lineId?: LineId;
  room?: BrandRoom;
}) {
  const rows = lineId
    ? brandsForLine(lineId)
    : room
      ? brandsForRoom(room)
      : [];
  if (!rows.length) return null;
  return (
    <ul className={`bench-brands${lineId === "logos" ? " is-marks" : ""}`}>
      {rows.map((brand) => (
        <li key={brand.id}>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.file} alt="" />
            <figcaption>
              <strong>{brand.name}</strong>
              {lineId === "logos" ? null : <span>{brand.use}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

function examplesOf(line: WorkLine): LineExample[] {
  if (line.examples?.length) return line.examples;
  if (line.widget === "brands") {
    return brandsForLine(line.id).map((brand) => ({
      src: brand.file,
      name: brand.name,
      note: brand.use,
    }));
  }
  return [];
}

function ExamplesBoard({
  title,
  rows,
  compact = false,
  mark = false,
}: {
  title: string;
  rows: LineExample[];
  compact?: boolean;
  mark?: boolean;
}) {
  const [shot, setShot] = useState(0);
  const pick = rows[shot] || rows[0];
  if (!pick) return null;
  const cls = [
    "bench-work",
    compact ? "is-compact" : "",
    mark ? "is-mark" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls}>
      <figure className="bench-work-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pick.src} alt="" />
        <figcaption>
          <strong>{pick.name}</strong>
          <span>{pick.note || title}</span>
        </figcaption>
      </figure>
      <nav className="bench-film" aria-label="Examples">
        {rows.map((row, i) => (
          <button
            key={`${row.src}-${row.name}`}
            type="button"
            className={shot === i ? "is-on" : undefined}
            onClick={() => setShot(i)}
            aria-label={row.name}
            aria-current={shot === i ? "true" : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.src} alt="" />
          </button>
        ))}
      </nav>
    </div>
  );
}

function LineAbout({
  line,
  fold,
  setFold,
  onClose,
}: {
  line: WorkLine;
  fold: number;
  setFold: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="bench-sheet"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bench-sheet-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`About ${line.title}`}
      >
        <p className="bench-kicker">{line.facet}</p>
        <h1>{line.title}</h1>
        <p className="campus-lead">{line.lead}</p>
        {line.body ? <p className="campus-lead">{line.body}</p> : null}
        <ol className="bench-folds">
          {line.folds.map((item, i) => {
            const open = fold === i;
            return (
              <li key={item.name} className={open ? "is-open" : undefined}>
                <button
                  type="button"
                  className="bench-fold-head"
                  aria-expanded={open}
                  onClick={() => setFold(open ? -1 : i)}
                >
                  <span>{item.name}</span>
                  <span className="home-concertina-arrow" aria-hidden />
                </button>
                {open ? <p>{item.text}</p> : null}
              </li>
            );
          })}
        </ol>
        <p>
          <button type="button" className="bench-word" onClick={onClose}>
            Close
          </button>
        </p>
      </div>
    </div>
  );
}

export function LineStage({
  line,
  extra,
  onContact,
  onHost,
  onEngine: _onEngine,
  embed,
}: {
  line: WorkLine;
  extra?: ReactNode;
  onContact: (needId: string) => void;
  onHost?: () => void;
  onEngine?: () => void;
  embed?: boolean;
}) {
  if (line.facet === "build") {
    return (
      <BuildStage
        line={line}
        onContact={onContact}
        onHost={onHost}
        embed={embed}
      />
    );
  }
  return (
    <OfferStage
      line={line}
      extra={extra}
      onContact={onContact}
      embed={embed}
    />
  );
}

const FACET_NAME: Record<Facet, string> = {
  design: "Design",
  strategy: "Strategy",
  build: "Build",
};

export function FacetStage({
  facet,
  focusId,
  onContact,
  onHost,
  onEngine,
}: {
  facet: Facet;
  focusId?: LineId | null;
  onContact: (needId: string) => void;
  onHost?: () => void;
  onEngine?: () => void;
}) {
  const rows = linesFor(facet);
  const levelIds: LineId[] = ["startup", "audits", "counsel"];
  const main =
    facet === "strategy"
      ? rows.filter((row) => !levelIds.includes(row.id))
      : rows;
  const levels =
    facet === "strategy"
      ? rows.filter((row) => levelIds.includes(row.id))
      : [];

  useEffect(() => {
    if (!focusId) return;
    const node = document.getElementById(`line-${focusId}`);
    node?.scrollIntoView({ block: "start" });
  }, [focusId]);

  return (
    <div className={`bench-facet is-${facet}`}>
      <header className="bench-app-bar">
        <div>
          <p className="bench-kicker">{FACET_NAME[facet]}</p>
          <h1>{FACET_NAME[facet]}</h1>
        </div>
        {facet === "strategy" && onEngine ? (
          <div className="bench-app-acts">
            <button type="button" className="bench-word" onClick={onEngine}>
              How we work
            </button>
          </div>
        ) : facet === "build" && onHost ? (
          <div className="bench-app-acts">
            <button type="button" className="bench-word" onClick={onHost}>
              BoomStack
            </button>
          </div>
        ) : null}
      </header>
      <div className="bench-facet-stack">
        {main.map((row) => (
          <section
            key={row.id}
            id={`line-${row.id}`}
            className={focusId === row.id ? "is-focus" : undefined}
          >
            <LineStage
              line={row}
              embed
              onContact={onContact}
              onHost={onHost}
              onEngine={onEngine}
            />
          </section>
        ))}
        {levels.length ? (
          <section
            className={
              focusId && levelIds.includes(focusId) ? "is-focus" : undefined
            }
          >
            <CounselLevels rows={levels} focusId={focusId} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function OfferStage({
  line,
  extra,
  onContact,
  embed,
}: {
  line: WorkLine;
  extra?: ReactNode;
  onContact: (needId: string) => void;
  embed?: boolean;
}) {
  const [fold, setFold] = useState(-1);
  const [about, setAbout] = useState(false);
  const examples = examplesOf(line);
  const showExamples =
    line.widget === "examples" ||
    (line.widget === "gallery" && examples.length > 0);

  useEffect(() => {
    setAbout(false);
    setFold(-1);
  }, [line.id]);

  function enquire() {
    setAbout(false);
    onContact(line.needId);
  }

  return (
    <div className={`bench-room bench-line bench-app is-${line.id}${embed ? " is-embed" : ""}`}>
      {embed ? (
        <header className="bench-line-head">
          {line.id === "brand" ? (
            <p className="bench-strategy-open">{STRATEGY_OPEN}</p>
          ) : null}
          <h2>{line.title}</h2>
        </header>
      ) : (
        <header className="bench-app-bar">
          <div>
            <p className="bench-kicker">{line.facet}</p>
            <h1>{line.title}</h1>
          </div>
          <div className="bench-app-acts">
            <button type="button" className="bench-word" onClick={() => setAbout(true)}>
              About
            </button>
            <button type="button" className="bench-cta" onClick={enquire}>
              {line.cta}
            </button>
          </div>
        </header>
      )}

      <div className="bench-app-stage">
        {line.widget === "identity-kit" ? (
          <IdentityKit shots={examples} />
        ) : null}
        {line.widget === "ui-kit" ? <UiKit /> : null}
        {line.widget === "pack-loop" ? <PackLoop /> : null}
        {line.widget === "brands" ? <BrandStrip lineId={line.id} /> : null}
        {line.widget === "avenue" ? (
          <AvenueRead
            lead={line.marks?.length ? line.lead : ""}
            folds={line.marks?.length ? [] : line.folds}
            marks={line.marks}
          />
        ) : null}

        {showExamples ? (
          <ExamplesBoard
            title={line.title}
            rows={examples}
            mark={line.widget === "brands"}
          />
        ) : null}

        {line.widget === "solport" || line.widget === "solport-short" ? (
          <SolportMeters
            short={line.widget === "solport-short"}
            onContact={enquire}
          />
        ) : null}

        {line.widget === "filters" ? (
          <ul className="bench-outputs">
            {FILTERS.map((f) => (
              <li key={f.id}>
                <strong>{f.name}.</strong> {f.body}
              </li>
            ))}
          </ul>
        ) : null}

        {extra}
      </div>

      {about ? (
        <LineAbout
          line={line}
          fold={fold}
          setFold={setFold}
          onClose={() => setAbout(false)}
        />
      ) : null}
    </div>
  );
}

function BuildStage({
  line,
  onContact,
  onHost,
  embed,
}: {
  line: WorkLine;
  onContact: (needId: string) => void;
  onHost?: () => void;
  embed?: boolean;
}) {
  return (
    <div
      className={`bench-room bench-line bench-app is-${line.id}${embed ? " is-embed" : ""}`}
      data-facet="build"
    >
      {embed ? (
        <header className="bench-line-head">
          <h2>{line.title}</h2>
        </header>
      ) : (
        <header className="bench-app-bar">
          <div>
            <p className="bench-kicker">Build</p>
            <h1>{line.title}</h1>
          </div>
          <div className="bench-app-acts">
            {line.id === "api" && onHost ? (
              <button type="button" className="bench-word" onClick={onHost}>
                BoomStack
              </button>
            ) : null}
            <button
              type="button"
              className="bench-cta"
              onClick={() => onContact(line.needId)}
            >
              {line.cta}
            </button>
          </div>
        </header>
      )}
      <div className="bench-app-stage">
        {line.id === "simple" ? <SimpleWindow /> : null}
        {line.id === "workspaces" ? <HostLoop /> : null}
        {line.id === "apps" ? <AppPair /> : null}
        {line.id === "modernize" ? <ModernWindows /> : null}
        <AvenueRead lead="" folds={line.folds} />
      </div>
    </div>
  );
}

function SolportMeters({
  short,
  onContact,
}: {
  short?: boolean;
  onContact: () => void;
}) {
  const tiers = short ? SOLPORT.filter((t) => t.id === "2-hour") : SOLPORT;
  return (
    <div className="bench-solport">
      {tiers.map((tier) => (
        <article key={tier.id}>
          <div
            className="bench-meter"
            style={{
              background: `conic-gradient(var(--ink) 0 ${tier.fill}%, color-mix(in srgb, var(--ink) 18%, var(--ground)) ${tier.fill}% 100%)`,
            }}
            aria-hidden
          />
          <h2>{tier.name}</h2>
          <ul>
            {tier.lines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" className="bench-cta" onClick={onContact}>
            Book this session
          </button>
        </article>
      ))}
    </div>
  );
}
