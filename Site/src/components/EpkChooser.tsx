"use client";

import Link from "next/link";
import { epkHref } from "@/lib/epk-map";

export type ChooserKit = {
  id: string;
  name: string;
  kicker?: string;
  lede?: string;
};

export function EpkChooser({
  kits,
  title,
}: {
  kits: ChooserKit[];
  title?: string;
}) {
  const many = kits.length > 1;
  return (
    <div className="epk-gate is-signed">
      <div className="epk-gate__card chamfer">
        <p className="kicker">Press kits</p>
        <h1>{title || (many ? "Your press kits" : "Press kit")}</h1>
        {kits.length ? (
          <ul className="epk-index">
            {kits.map((row) => (
              <li key={row.id}>
                <Link className="epk-index__card chamfer" href={epkHref(row.id)}>
                  {row.kicker ? <p className="kicker">{row.kicker}</p> : null}
                  <strong>{row.name}</strong>
                  {row.lede ? <p>{row.lede}</p> : null}
                  <span>Open</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No press kit on this account yet.</p>
        )}
      </div>
    </div>
  );
}
