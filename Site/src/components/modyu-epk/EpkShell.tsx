"use client";

import Link from "next/link";
import { EpkNav } from "./EpkNav";
import { ht4Menu } from "@/lib/modyu-epk/content";

export function EpkShell({
  children,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
}) {
  return (
    <div className="epk">
      <header className="epk-top">
        <div className="epk-top__inner">
          <div className="epk-top__brand">
            <details className="epk-ht4">
              <summary>
                HT4 <span className="visually-hidden">menu</span>
              </summary>
              <ul>
                {ht4Menu.map((row) => (
                  <li key={row.href}>
                    <Link href={row.href}>{row.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
            <Link className="epk-top__kit" href="/epk/modyu">
              Electronic Press Kit
            </Link>
          </div>
          <nav className="epk-top__links" aria-label="EPK utility">
            <Link href="/epk/modyu/assets">Asset vault</Link>
            <Link href="/epk/modyu/contact">Contact</Link>
          </nav>
        </div>
      </header>
      <div className="epk-frame">
        <EpkNav />
        <div className="epk-main">
          {(eyebrow || title) && (
            <header className="epk-pagehead">
              {eyebrow ? <p className="epk-kicker">{eyebrow}</p> : null}
              {title ? <h1>{title}</h1> : null}
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
