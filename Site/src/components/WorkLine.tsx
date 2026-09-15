"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SOLPORT } from "@/data/bench";
import { FILTERS } from "@/data/faculties";
import {
  brandsForLine,
  brandsForRoom,
  type BrandRoom,
} from "@/data/plates";
import {
  type LineExample,
  type LineId,
  type WorkLine,
} from "@/data/worklines";
import {
  AppSketch,
  ModernizeDemo,
  SimpleFormats,
  SystemsSketch,
  WorkspaceDemo,
} from "@/components/BuildDemos";
import {
  AuditPath,
  BrandKit,
  IdentityKit,
  MarketKit,
  SittingRing,
  StartupTalk,
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
    <ul className="bench-brands">
      {rows.map((brand) => (
        <li key={brand.id}>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.file} alt="" />
            <figcaption>
              <strong>{brand.name}</strong>
              <span>{brand.use}</span>
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
        <p className="campus-lead">{line.body}</p>
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
}: {
  line: WorkLine;
  extra?: ReactNode;
  onContact: (needId: string) => void;
  onHost?: () => void;
  onEngine?: () => void;
}) {
  if (line.facet === "build") {
    return <BuildStage line={line} onContact={onContact} onHost={onHost} />;
  }
  return (
    <OfferStage
      line={line}
      extra={extra}
      onContact={onContact}
    />
  );
}

function OfferStage({
  line,
  extra,
  onContact,
}: {
  line: WorkLine;
  extra?: ReactNode;
  onContact: (needId: string) => void;
}) {
  const [fold, setFold] = useState(-1);
  const [about, setAbout] = useState(false);
  const examples = examplesOf(line);
  const showExamples =
    line.widget === "examples" ||
    line.widget === "brands" ||
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
    <div className={`bench-room bench-line bench-app is-${line.id}`}>
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

      <div className="bench-app-stage">
        {line.widget === "identity-kit" ? (
          <IdentityKit shots={examples} />
        ) : null}
        {line.widget === "ui-kit" ? <UiKit shots={examples} /> : null}
        {line.widget === "brand-kit" ? <BrandKit /> : null}
        {line.widget === "market-kit" ? <MarketKit /> : null}
        {line.widget === "audit-path" ? <AuditPath /> : null}
        {line.widget === "sitting" ? <SittingRing layers={3} /> : null}
        {line.widget === "startup-talk" ? <StartupTalk /> : null}

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
}: {
  line: WorkLine;
  onContact: (needId: string) => void;
  onHost?: () => void;
}) {
  const examples = examplesOf(line);

  return (
    <div
      className={`bench-room bench-line bench-app is-${line.id}`}
      data-facet="build"
    >
      <header className="bench-app-bar">
        <div>
          <p className="bench-kicker">Build</p>
          <h1>{line.title}</h1>
        </div>
        <div className="bench-app-acts">
          {line.id === "api" && onHost ? (
            <button type="button" className="bench-word" onClick={onHost}>
              Host
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
      <div className="bench-app-stage">
        <div className="bench-pee">
          <p className="bench-pee-point">{line.lead}</p>
          <div className="bench-pee-evidence">
            {line.widget === "examples" ? (
              <>
                <SimpleFormats />
                {examples.length ? (
                  <ExamplesBoard title={line.title} rows={examples} compact />
                ) : null}
              </>
            ) : null}
            {line.widget === "workspace" ? <WorkspaceDemo /> : null}
            {line.widget === "checkout" ? <AppSketch /> : null}
            {line.widget === "modernize" ? <ModernizeDemo /> : null}
            {line.widget === "joins" ? <SystemsSketch /> : null}
          </div>
          <p className="bench-pee-explain">{line.body}</p>
        </div>
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
