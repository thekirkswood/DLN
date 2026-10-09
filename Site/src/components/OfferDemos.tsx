"use client";

import { useState } from "react";
import { type LineExample } from "@/data/worklines";
import { LoopWell } from "@/components/loops/LoopWell";

export function IdentityKit({ shots }: { shots: LineExample[] }) {
  const [on, setOn] = useState(0);
  const laptop = shots[0];
  const phone = shots[1] || shots[0];
  const rows = [
    { id: "laptop" as const, pick: laptop, title: "On the desk" },
    { id: "phone" as const, pick: phone, title: "In the hand" },
  ];
  const held = rows[on];
  if (!held?.pick) return null;
  return (
    <div className="bench-idkit is-desk">
      {rows.map((row, i) => (
        <button
          key={row.id}
          type="button"
          className={`is-${row.id}${on === i ? " is-on" : ""}`}
          onClick={() => setOn(i)}
        >
          <span>{row.title}</span>
          <div className={`id-device is-${row.id}`}>
            {row.id === "phone" ? <i className="id-notch" /> : null}
            <div className="id-screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.pick.src} alt="" />
            </div>
            {row.id === "laptop" ? <i className="id-base" /> : null}
          </div>
        </button>
      ))}
    </div>
  );
}

export function PackLoop() {
  return (
    <LoopWell
      src="/brief/social-loop/pack.html"
      className="bench-pack-loop"
      freezeBeat="on3"
    />
  );
}

export function UiKit() {
  return (
    <LoopWell
      src="/brief/social-loop/ui.html"
      className="bench-ui-loop"
      freezeBeat="phone"
    />
  );
}

function findMark(hay: string, mark: string, from: number) {
  const lower = hay.toLowerCase();
  const needle = mark.toLowerCase();
  if (mark.includes(" ")) return lower.indexOf(needle, from);
  const slice = lower.slice(from);
  const hit = slice.match(new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`));
  return hit && hit.index != null ? from + hit.index : -1;
}

function markLine(lead: string, marks: string[]) {
  const ordered = [...marks].sort((a, b) => b.length - a.length);
  type Bit = { t: string; m?: boolean };
  let bits: Bit[] = [{ t: lead }];
  for (const mark of ordered) {
    const next: Bit[] = [];
    for (const bit of bits) {
      if (bit.m) {
        next.push(bit);
        continue;
      }
      let from = 0;
      let at = findMark(bit.t, mark, from);
      if (at < 0) {
        next.push(bit);
        continue;
      }
      while (at >= 0) {
        if (at > from) next.push({ t: bit.t.slice(from, at) });
        next.push({ t: bit.t.slice(at, at + mark.length), m: true });
        from = at + mark.length;
        at = findMark(bit.t, mark, from);
      }
      if (from < bit.t.length) next.push({ t: bit.t.slice(from) });
    }
    bits = next;
  }
  return bits.map((bit, i) =>
    bit.m ? <i key={`${bit.t}-${i}`}>{bit.t}</i> : bit.t,
  );
}

export function AvenueRead({
  lead,
  folds,
  marks = [],
}: {
  lead: string;
  folds: { name: string; text: string }[];
  marks?: string[];
}) {
  const points = folds.filter((fold) => fold.text);
  return (
    <div className="bench-avenue">
      {lead ? (
        <p className="bench-avenue-line">{markLine(lead, marks)}</p>
      ) : null}
      {points.length ? (
        <ul className="bench-avenue-points">
          {points.map((fold) => (
            <li key={fold.name}>
              <b>{fold.name}</b>
              <p>{fold.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CounselLevels({
  rows,
  focusId,
}: {
  rows: { id: string; title: string; lead: string; body: string }[];
  focusId?: string | null;
}) {
  return (
    <div className="bench-levels-block">
      <header className="bench-line-head">
        <h2>Working sessions</h2>
      </header>
      <div className="bench-levels">
        {rows.map((row) => (
          <article
            key={row.id}
            id={`line-${row.id}`}
            className={focusId === row.id ? "is-on" : undefined}
          >
            <h3>{row.title}</h3>
            <p>{row.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
