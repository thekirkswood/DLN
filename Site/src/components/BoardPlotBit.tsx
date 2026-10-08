"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type Faculty } from "@/data/faculties";
import { CUSTOMER_SEATS, IDENTITY_BITS } from "@/data/board-map";
import {
  bitRoom,
  missionCouldSitAnywhere,
  personalityLooksLikeAdjectives,
  uniqueBitInterior,
  type BitField,
  type BitRoom,
} from "@/data/board-identity";
import { plotBitSheet } from "@/data/board-sheets";
import { withPlot, type BoardLive } from "@/data/board-live";
import { BoardAssetsStrip } from "@/components/BoardAssetsStrip";
import {
  packSummary,
  readIdentityEvents,
  readPack,
  writeIdentityEvents,
  writePack,
  type IdentityEvent,
  type IdentityPack,
} from "@/lib/board-pack";
import type { BitInteriorProps } from "@/components/board-identity/shared";
import { PropositionInterior } from "@/components/board-identity/PropositionInterior";
import { BigIdeaInterior } from "@/components/board-identity/BigIdeaInterior";
import { PositioningInterior } from "@/components/board-identity/PositioningInterior";
import { DifferentiationInterior } from "@/components/board-identity/DifferentiationInterior";
import { ValueInterior } from "@/components/board-identity/ValueInterior";
import { BrandTypeInterior } from "@/components/board-identity/BrandTypeInterior";
import { PromiseInterior } from "@/components/board-identity/PromiseInterior";
import { FeaturesInterior } from "@/components/board-identity/FeaturesInterior";
import { BenefitInterior } from "@/components/board-identity/BenefitInterior";
import { IdentityStatementsInterior } from "@/components/board-identity/IdentityStatementsInterior";
import { VisionInterior } from "@/components/board-identity/VisionInterior";
import { PurposeInterior } from "@/components/board-identity/PurposeInterior";
import { PeopleInterior } from "@/components/board-identity/PeopleInterior";
import { LocationInterior } from "@/components/board-identity/LocationInterior";
import { StandardsInterior } from "@/components/board-identity/StandardsInterior";
import { EthicsInterior } from "@/components/board-identity/EthicsInterior";
import { PhilosophyInterior } from "@/components/board-identity/PhilosophyInterior";

const BIT_INTERIORS: Partial<Record<string, (props: BitInteriorProps) => JSX.Element>> = {
  proposition: PropositionInterior,
  "big-idea": BigIdeaInterior,
  positioning: PositioningInterior,
  differentiation: DifferentiationInterior,
  value: ValueInterior,
  "brand-type": BrandTypeInterior,
  promise: PromiseInterior,
  features: FeaturesInterior,
  benefit: BenefitInterior,
  identity: IdentityStatementsInterior,
  vision: VisionInterior,
  purpose: PurposeInterior,
  people: PeopleInterior,
  location: LocationInterior,
  standards: StandardsInterior,
  ethics: EthicsInterior,
  philosophy: PhilosophyInterior,
};

function seedFields(room: BitRoom, held: string): Record<string, string> {
  const empty: Record<string, string> = {};
  for (const field of room.fields) empty[field.key] = "";
  const pack = readPack(held);
  if (pack?.kind === "identity" && pack.bit === room.id) {
    return { ...empty, ...pack.fields };
  }
  const prose = held.trim();
  if (prose && !prose.startsWith("{")) {
    if (room.id === "founder") {
      empty.story = prose;
    } else if (room.id === "mission") {
      empty.job = prose;
    } else if (room.id === "personality") {
      empty.behaves = prose;
    } else {
      empty[room.fields[0].key] = prose;
    }
  }
  return empty;
}

function fieldsForSave(bit: string, fields: Record<string, string>): Record<string, string> {
  if (bit === "founder") {
    const has = (fields.has || "").trim();
    if (has === "no" || has === "later") return { has };
    if (has === "yes") {
      return {
        has,
        events: writeIdentityEvents(readIdentityEvents(fields.events)),
        without: (fields.without || "").trim(),
      };
    }
    return { has };
  }
  if (bit === "mission") {
    return {
      job: fields.job || "",
      for: fields.for || "",
      lie: fields.lie || "",
      seat: fields.seat || "",
    };
  }
  if (bit === "personality") {
    return { behaves: fields.behaves || "", never: fields.never || "" };
  }
  return fields;
}

async function holdBit(plot: string, bitId: string, body: string): Promise<void> {
  const res = await fetch("/api/board", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plot, bitId, body }),
  });
  if (!res.ok) throw new Error("no");
}

function Field({
  bit,
  field,
  value,
  onChange,
}: {
  bit: string;
  field: BitField;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `bit-${bit}-${field.key}`;
  if (field.choice) {
    return (
      <fieldset className="board-field">
        <legend>{field.label}</legend>
        <div className="fw-scales" role="radiogroup" aria-label={field.label}>
          {field.choice.map((c) => (
            <button
              key={c.id}
              type="button"
              className={value === c.id ? "is-on" : undefined}
              aria-pressed={value === c.id}
              onClick={() => onChange(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {field.hint ? <em>{field.hint}</em> : null}
      </fieldset>
    );
  }
  return (
    <label className="board-field" htmlFor={id}>
      <span>{field.label}</span>
      <textarea
        id={id}
        rows={field.rows || 4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.hint ? <em>{field.hint}</em> : null}
    </label>
  );
}

function SaveBar({
  live,
  pending,
  error,
}: {
  live: BoardLive | null;
  pending: boolean;
  error: string;
}) {
  if (!live?.bitId) return null;
  return (
    <p className="board-save">
      <button type="submit" className="house-add" disabled={pending}>
        {pending ? "Holding…" : "Hold this room"}
      </button>
      {error ? <span className="board-infer">{error}</span> : null}
    </p>
  );
}

function seatsFromLive(live: BoardLive | null) {
  return CUSTOMER_SEATS.map((c) => {
    const fromSeats = (live?.seats || []).find((s) => s.n === c.n)?.held || "";
    const fromSnip = live?.snippets[`mapping:audience:${c.n}`] || "";
    const held = (fromSeats || fromSnip).trim();
    const name = held ? packSummary(held).split(" · ")[0] || `Seat ${c.n}` : "";
    return {
      n: c.n,
      href: withPlot(c.href, live?.plot),
      label: name || `Seat ${c.n}`,
      held,
    };
  });
}

function MissionInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onPatch,
  onSubmit,
}: {
  bit: string;
  fields: Record<string, string>;
  live: BoardLive | null;
  pending: boolean;
  error: string;
  teaching: string;
  onField: (key: string, value: string) => void;
  onPatch: (patch: Record<string, string>) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const seats = useMemo(() => seatsFromLive(live), [live]);
  const named = seats.filter((s) => s.held);
  const generic = missionCouldSitAnywhere(fields.job || "");
  const pointed = fields.seat || "";

  function pointSeat(n: string, label: string) {
    if (pointed === n) {
      onPatch({ seat: "", for: fields.for === label ? "" : fields.for });
      return;
    }
    onPatch({ seat: n, for: label });
  }

  return (
    <form className="board-id-mission" onSubmit={onSubmit}>
      <label className="board-id-mission-stand" htmlFor={`bit-${bit}-job`}>
        <span className="kicker">The job</span>
        <textarea
          id={`bit-${bit}-job`}
          rows={2}
          value={fields.job || ""}
          onChange={(e) => onField("job", e.target.value)}
          spellCheck
          placeholder="A line they can stand in."
        />
      </label>
      <div className="board-id-mission-whom">
        <p className="kicker">For whom</p>
        <ul className="board-id-mission-seats">
          {seats.map((s) => (
            <li key={s.n}>
              {s.held ? (
                <button
                  type="button"
                  className={
                    pointed === s.n
                      ? "board-id-mission-seat is-on"
                      : "board-id-mission-seat"
                  }
                  aria-pressed={pointed === s.n}
                  onClick={() => pointSeat(s.n, s.label)}
                >
                  <span className="kicker">Seat {s.n}</span>
                  <strong>{s.label}</strong>
                </button>
              ) : (
                <Link className="board-id-mission-seat is-empty" href={s.href}>
                  <span className="kicker">Seat {s.n}</span>
                  <strong>—</strong>
                </Link>
              )}
            </li>
          ))}
        </ul>
        {!named.length ? (
          <p className="board-id-mission-hole">
            <Link href={withPlot("/board/mapping/audience", live?.plot)}>Name seats</Link>
          </p>
        ) : null}
      </div>
      {generic ? <p className="board-id-mission-warn">{teaching}</p> : null}
      <details className="board-id-mission-more">
        <summary>Lie / a group off a seat</summary>
        <label htmlFor={`bit-${bit}-for`}>
          <span className="kicker">A group not yet on a seat</span>
          <input
            id={`bit-${bit}-for`}
            type="text"
            value={fields.for || ""}
            onChange={(e) => onField("for", e.target.value)}
          />
        </label>
        <label className="board-id-mission-lie" htmlFor={`bit-${bit}-lie`}>
          <span className="kicker">When this would be a lie</span>
          <textarea
            id={`bit-${bit}-lie`}
            rows={2}
            value={fields.lie || ""}
            onChange={(e) => onField("lie", e.target.value)}
          />
        </label>
      </details>
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}

function FounderInterior({
  bit,
  fields,
  live,
  pending,
  error,
  onPatch,
  onSubmit,
}: {
  bit: string;
  fields: Record<string, string>;
  live: BoardLive | null;
  pending: boolean;
  error: string;
  onPatch: (patch: Record<string, string>) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const has = fields.has || "";
  const [rows, setRows] = useState<IdentityEvent[]>(() => {
    const e = readIdentityEvents(fields.events);
    return e.length ? e : [{ year: "", what: "" }];
  });

  function choose(id: string) {
    const patch: Record<string, string> = { has: id };
    if (id === "yes") {
      const existing = readIdentityEvents(fields.events);
      if (existing.length) {
        setRows(existing);
      } else if (rows.some((r) => r.year.trim() || r.what.trim())) {
        patch.events = writeIdentityEvents(rows);
      } else if (fields.story?.trim()) {
        const seeded = [{ year: "", what: fields.story.trim() }];
        setRows(seeded);
        patch.events = writeIdentityEvents(seeded);
      } else {
        setRows([{ year: "", what: "" }]);
      }
    }
    if (id === "no" || id === "later") {
      patch.events = "";
      patch.without = "";
    }
    onPatch(patch);
  }

  function changeRow(i: number, key: "year" | "what", value: string) {
    const next = rows.map((r, n) => (n === i ? { ...r, [key]: value } : r));
    setRows(next);
    onPatch({ events: writeIdentityEvents(next) });
  }

  function addRow() {
    if (rows.length >= 6) return;
    setRows([...rows, { year: "", what: "" }]);
  }

  function dropRow(i: number) {
    const next = rows.filter((_, n) => n !== i);
    const kept = next.length ? next : [{ year: "", what: "" }];
    setRows(kept);
    onPatch({ events: writeIdentityEvents(kept) });
  }

  return (
    <form className="board-id-founder" onSubmit={onSubmit}>
      <p className="kicker">First: is there a founder story?</p>
      <div className="board-id-founder-acts" role="radiogroup" aria-label="Is there a founder story?">
        {(
          [
            { id: "yes", label: "Yes, and it is true" },
            { id: "no", label: "No — leave this empty" },
            { id: "later", label: "Not yet, do not invent" },
          ] as const
        ).map((c) => (
          <button
            key={c.id}
            type="button"
            className={has === c.id ? "board-id-founder-act is-on" : "board-id-founder-act"}
            aria-pressed={has === c.id}
            onClick={() => choose(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {has === "no" ? (
        <section className="board-id-founder-done">
          <p className="kicker">This cell is complete</p>
          <p>There is no founder story. That is the whole room. Do not invent one.</p>
        </section>
      ) : null}
      {has === "later" ? (
        <section className="board-id-founder-done is-wait">
          <p className="kicker">Waiting</p>
          <p>Not yet. This room stays empty on purpose. Do not invent one while we wait.</p>
        </section>
      ) : null}
      {has === "yes" ? (
        <>
          <ol className="board-id-founder-spine">
            {rows.map((row, i) => (
              <li key={i} className="board-id-founder-event">
                <label>
                  <span className="kicker">Year</span>
                  <input
                    className="board-id-founder-year"
                    type="text"
                    autoComplete="off"
                    value={row.year}
                    onChange={(e) => changeRow(i, "year", e.target.value)}
                  />
                </label>
                <label>
                  <span className="kicker">What happened</span>
                  <textarea
                    className="board-id-founder-what"
                    rows={2}
                    value={row.what}
                    onChange={(e) => changeRow(i, "what", e.target.value)}
                  />
                </label>
                {rows.length > 1 ? (
                  <button type="button" className="board-id-founder-drop" onClick={() => dropRow(i)}>
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
          {rows.length < 6 ? (
            <p className="board-id-founder-add">
              <button type="button" onClick={addRow}>
                Add an event
              </button>
            </p>
          ) : null}
          <label className="board-id-founder-without" htmlFor={`bit-${bit}-without`}>
            <span className="kicker">What we will not add</span>
            <textarea
              id={`bit-${bit}-without`}
              rows={2}
              value={fields.without || ""}
              onChange={(e) => onPatch({ without: e.target.value })}
            />
          </label>
        </>
      ) : null}
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}

function PersonalityInterior({
  bit,
  fields,
  live,
  pending,
  error,
  teaching,
  onField,
  onSubmit,
}: {
  bit: string;
  fields: Record<string, string>;
  live: BoardLive | null;
  pending: boolean;
  error: string;
  teaching: string;
  onField: (key: string, value: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  const cloud =
    personalityLooksLikeAdjectives(fields.behaves || "") ||
    personalityLooksLikeAdjectives(fields.never || "");
  return (
    <form className="board-id-personality" onSubmit={onSubmit}>
      <label className="board-id-personality-hear" htmlFor={`bit-${bit}-behaves`}>
        <span className="kicker">Hearable across a room</span>
        <textarea
          id={`bit-${bit}-behaves`}
          rows={2}
          value={fields.behaves || ""}
          onChange={(e) => onField("behaves", e.target.value)}
        />
      </label>
      <label className="board-id-personality-never" htmlFor={`bit-${bit}-never`}>
        <span className="kicker">How it never behaves</span>
        <textarea
          id={`bit-${bit}-never`}
          rows={2}
          value={fields.never || ""}
          onChange={(e) => onField("never", e.target.value)}
        />
      </label>
      {cloud ? <p className="board-id-personality-warn">{teaching}</p> : null}
      <p className="board-id-personality-door">
        <Link href={withPlot("/board/comms/message", live?.plot)}>
          <strong>Message</strong>
          <span>The line this behaviour has to hold.</span>
        </Link>
      </p>
      <div className="board-id-personality-stills">
        <BoardAssetsStrip plot={live?.plot} />
        <p>Type specimens from the library when a still is ticked. Not stock adjectives.</p>
      </div>
      <SaveBar live={live} pending={pending} error={error} />
    </form>
  );
}

export function BoardPlotBit({
  faculty,
  bit,
  live,
}: {
  faculty: Faculty;
  bit: string;
  live: BoardLive | null;
}) {
  const sheet = plotBitSheet(bit);
  const room = bitRoom(bit);
  const plot = live?.plot;
  const related = live?.related || [];
  const start = useMemo(() => (room ? seedFields(room, live?.held || "") : {}), [room, live?.held]);
  const [fields, setFields] = useState<Record<string, string>>(start);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const unique = uniqueBitInterior(bit);
  const Offer = unique ? BIT_INTERIORS[unique] : undefined;

  useEffect(() => {
    setFields(start);
    setError("");
  }, [start, live?.held]);

  if (!sheet || !room) return null;
  const interior = room;
  const teaching = sheet.meaning[0] || interior.stand;

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function patchFields(patch: Record<string, string>) {
    setFields((prev) => ({ ...prev, ...patch }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!live?.bitId) return;
    setPending(true);
    setError("");
    const pack: IdentityPack = {
      v: 1,
      kind: "identity",
      bit: interior.id,
      shape: interior.kind,
      fields: fieldsForSave(interior.id, fields),
    };
    try {
      await holdBit(live.plot, live.bitId, writePack(pack));
    } catch {
      setError("That did not hold.");
    }
    setPending(false);
  }

  return (
    <article className={`board-room is-sheet is-id is-${interior.kind}`}>
      <header className="board-id-mast">
        <p className="kicker">
          {sheet.name}
          {live ? ` · ${live.plotName}` : ""}
        </p>
        <h1 className="visually-hidden">{sheet.name}</h1>
      </header>

      {unique === "mission" ? (
        <MissionInterior
          bit={bit}
          fields={fields}
          live={live}
          pending={pending}
          error={error}
          teaching={teaching}
          onField={setField}
          onPatch={patchFields}
          onSubmit={onSubmit}
        />
      ) : unique === "founder" ? (
        <FounderInterior
          bit={bit}
          fields={fields}
          live={live}
          pending={pending}
          error={error}
          onPatch={patchFields}
          onSubmit={onSubmit}
        />
      ) : unique === "personality" ? (
        <PersonalityInterior
          bit={bit}
          fields={fields}
          live={live}
          pending={pending}
          error={error}
          teaching={teaching}
          onField={setField}
          onSubmit={onSubmit}
        />
      ) : Offer ? (
        <Offer
          bit={bit}
          fields={fields}
          live={live}
          pending={pending}
          error={error}
          teaching={teaching}
          onField={setField}
          onPatch={patchFields}
          onSubmit={onSubmit}
        />
      ) : (
        <form className={`board-pack board-id-pack is-${interior.kind}`} onSubmit={onSubmit}>
          {interior.fields.map((field) => (
            <Field
              key={field.key}
              bit={bit}
              field={field}
              value={fields[field.key] || ""}
              onChange={(v) => setField(field.key, v)}
            />
          ))}
          <SaveBar live={live} pending={pending} error={error} />
        </form>
      )}

      <details className="board-holds">
        <summary>Behind this room</summary>
        {sheet.meaning.map((p) => (
          <p key={p} className="body">
            {p}
          </p>
        ))}
        {interior.crosses.length ? (
          <ul className="board-related">
            {interior.crosses.map((row) => (
              <li key={row.href}>
                <Link href={withPlot(row.href, plot)}>{row.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
        {related.length ? (
          <ul className="board-related">
            {related.map((row) => (
              <li key={row.href + row.label}>
                {row.href.startsWith("http") ? (
                  <a href={row.href} target="_blank" rel="noreferrer">
                    {row.label}
                  </a>
                ) : (
                  <Link href={row.href}>{row.label}</Link>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="board-id-rail">
          {IDENTITY_BITS.map((b) => (
            <li key={b.id}>
              <Link
                href={withPlot(b.href, plot)}
                aria-current={b.id === bit ? "page" : undefined}
              >
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="board-gen">Generate later. Stills from Assets when ticked.</p>
      </details>
    </article>
  );
}
