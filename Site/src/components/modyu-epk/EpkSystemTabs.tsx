"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PressPhaseExplorer } from "@/components/modyu-epk/PressPhaseExplorer";
import { bottles } from "@/lib/modyu-epk/bottles";
import { ht4System } from "@/lib/modyu-epk/content";
import { assetById, formatGbp, pressRrp } from "@/lib/modyu-epk/assets";
import { modyuAsset } from "@/lib/modyu-epk/asset-origin";

type Tab = "about" | "shop";

function tabFromHash(): Tab {
  if (typeof window === "undefined") return "about";
  const h = window.location.hash.replace(/^#/, "");
  if (h === "shop" || h === "prices" || bottles.some((b) => b.id === h)) {
    return "shop";
  }
  return "about";
}

export function EpkSystemTabs() {
  const [tab, setTab] = useState<Tab>("about");

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function go(next: Tab) {
    setTab(next);
    const hash = next === "shop" ? "shop" : "about";
    if (window.location.hash.replace(/^#/, "") !== hash) {
      window.history.replaceState(null, "", `#${hash}`);
    }
  }

  return (
    <div className="epk-stack">
      <div className="epk-system-tabs" role="tablist" aria-label="HT4 sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "about"}
          className={tab === "about" ? "is-active" : undefined}
          onClick={() => go("about")}
        >
          About
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "shop"}
          className={tab === "shop" ? "is-active" : undefined}
          onClick={() => go("shop")}
        >
          Shop
        </button>
      </div>

      {tab === "about" ? (
        <div role="tabpanel" className="epk-system-about">
          <section className="epk-panel epk-panel--white">
            <p className="epk-kicker">The system</p>
            <p>{ht4System.intro}</p>
            <p className="epk-note" style={{ marginTop: "0.75rem" }}>
              Same phase colours as the main site, open a bubble for that stage.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <Link href="/epk/modyu/description" className="epk-btn epk-btn--ghost">
                Full description (copy)
              </Link>
            </p>
          </section>
          <div className="epk-phase-embed">
            <PressPhaseExplorer variant="press" />
          </div>
          <p className="epk-note">{ht4System.closer}</p>
        </div>
      ) : (
        <div role="tabpanel" className="epk-system-shop">
          <section id="prices" className="epk-panel epk-panel--white">
            <p className="epk-kicker">Press RRP</p>
            <h2>Prices</h2>
            <p className="epk-note" style={{ marginBottom: "1rem" }}>
              Patient-facing RRP (Aug 2026). Assets and bottle cards link back
              here.
            </p>
            <div className="epk-price-grid">
              {pressRrp.parts.map((p) => (
                <Link key={p.id} href={p.href} className="epk-price-row">
                  <span>{p.label}</span>
                  <strong>{formatGbp(p.price)}</strong>
                </Link>
              ))}
            </div>
            <p className="epk-note" style={{ margin: "0.75rem 0" }}>
              Parts total {formatGbp(pressRrp.partsTotal)}
            </p>
            <div className="epk-price-grid epk-price-grid--kits">
              {pressRrp.kits.map((k) => (
                <Link key={k.id} href={k.href} className="epk-price-row">
                  <span>
                    {k.label}
                    {k.note ? (
                      <span className="epk-note"> · {k.note}</span>
                    ) : null}
                  </span>
                  <strong>{formatGbp(k.price)}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="epk-asset-section__head">
              <div>
                <p className="epk-kicker">Bottles &amp; packs</p>
                <p className="epk-note">
                  Labelled assets, open or drag to save.{" "}
                  <Link href="/epk/modyu/assets#bottles">Full vault</Link>
                </p>
              </div>
            </div>
            <div className="epk-bottle-grid">
              {bottles.map((b) => {
                const asset = assetById(b.id);
                const src = modyuAsset(asset?.src || b.image);
                return (
                  <article key={b.id} id={b.id} className="epk-bottle-card">
                    <a
                      href={src}
                      className="epk-bottle-card__media"
                      target="_blank"
                      rel="noreferrer"
                      download
                      title="Open or save"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={asset?.alt || b.name} draggable />
                    </a>
                    <div className="epk-bottle-card__body">
                      <p className="epk-kicker">
                        {b.code} · {b.timing}
                      </p>
                      <h3>{b.name}</h3>
                      <p>{b.summary}</p>
                      <p className="epk-bottle-card__meta">
                        {asset?.rrp != null ? (
                          <strong>{formatGbp(asset.rrp)}</strong>
                        ) : null}
                        <Link href={`/epk/modyu/assets#${b.id}`}>Asset</Link>
                        <a href="#prices">RRP</a>
                        <a href={src} download>
                          Save
                        </a>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
