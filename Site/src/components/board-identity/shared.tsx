"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { CUSTOMER_SEATS } from "@/data/board-map";
import type { BitField } from "@/data/board-identity";
import { withPlot, type BoardLive } from "@/data/board-live";
import { packSummary } from "@/lib/board-pack";

export type BitInteriorProps = {
  bit: string;
  fields: Record<string, string>;
  live: BoardLive | null;
  pending: boolean;
  error: string;
  teaching: string;
  onField: (key: string, value: string) => void;
  onPatch: (patch: Record<string, string>) => void;
  onSubmit: (e: FormEvent) => void;
};

export function SaveBar({
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

export function BitFieldControl({
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

export function NeighbourWords({ live }: { live: BoardLive | null }) {
  const related = live?.related || [];
  if (!related.length) return null;
  return (
    <aside className="board-id-neighbours">
      <p className="kicker">Already on this plot</p>
      <ul className="board-related">
        {related.map((row) => (
          <li key={row.href + row.label}>
            {row.href.startsWith("http") ? (
              <a href={row.href} target="_blank" rel="noreferrer">
                <strong>{row.label}</strong>
                <span>{row.body}</span>
              </a>
            ) : (
              <Link href={row.href}>
                <strong>{row.label}</strong>
                <span>{row.body}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function SocketRow() {
  return (
    <div className="board-id-sockets">
      <p className="board-gen">
        <button type="button" disabled>
          Generate from this brand
        </button>
        <span>Studio key later. This cell plus the plot book plus stills — not a blank model.</span>
      </p>
      <p className="board-gen">
        <button type="button" disabled>
          Attach a still from Assets
        </button>
        <span>The library hook waits. Do not fake a picture.</span>
      </p>
    </div>
  );
}

export function seatsFromLive(live: BoardLive | null) {
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

export function snip(live: BoardLive | null, key: string): string {
  const body = live?.snippets[key]?.trim() || "";
  if (!body) return "";
  const line = packSummary(body) || body.split("\n")[0].trim();
  return line.length > 120 ? `${line.slice(0, 119)}…` : line;
}
