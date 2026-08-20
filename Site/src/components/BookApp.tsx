"use client";

import { useState } from "react";
import Link from "next/link";
import { StudioDiary } from "@/components/StudioDiary";
import { BookClock } from "@/components/BookClock";
import {
  IssueButton,
  PayButton,
  VoidButton,
} from "@/components/AccountBilling";
import { formatGbp } from "@/data/catalogue";
import type { Invoice, Payment, Roll } from "@/lib/billing";
import {
  formatLondonDate,
  payByIso,
} from "@/lib/clock";
import { enterUrlFor, hostUrlFor, type Plot } from "@/lib/plot-urls";
import { labStationPath } from "@/lib/lab-host";
import type { PublicUser } from "@/lib/auth";

function totalOf(inv: Invoice): number {
  return inv.lines.reduce((sum, l) => sum + (l.waived ? 0 : l.amountGbp), 0);
}

function whenLine(inv: Invoice, graceDays = 7): string {
  if (inv.status === "draft") return "Draft. Issue stamps today’s date.";
  const issued = inv.issuedAt ? formatLondonDate(inv.issuedAt) : "";
  const pay = payByIso(inv.dueAt, inv.issuedAt, graceDays);
  const payLabel = pay ? formatLondonDate(pay) : "";
  if (inv.status === "paid") {
    return inv.paidAt
      ? `Issued ${issued} · paid ${formatLondonDate(inv.paidAt)}`
      : `Issued ${issued} · paid`;
  }
  if (inv.status === "void") return issued ? `Issued ${issued} · void` : "Void";
  return `Issued ${issued} · pay by ${payLabel}`;
}

export function InvoiceBoard({
  invoices,
  studio,
  claims = {},
  people = [],
  graceDays = 7,
}: {
  invoices: Invoice[];
  studio: boolean;
  claims?: Record<string, Payment>;
  people?: PublicUser[];
  graceDays?: number;
}) {
  if (invoices.length === 0) {
    return <p className="body">No invoices yet.</p>;
  }
  return (
    <div className="book-grid">
      {invoices.map((inv) => {
        const claim = claims[inv.id];
        const waiting = inv.status === "due" && claim?.status === "claimed";
        const who = people.find((p) => p.id === inv.userId);
        return (
          <div key={inv.id} className="lift-plate">
            <div className={`lift-plate-face book-card is-${inv.status}`}>
              <div className="book-card-top">
                <Link href={`/account/invoices/${inv.id}`}>
                  <strong>{inv.number}</strong>
                </Link>
                <span className={`book-chip is-${inv.status}`}>
                  {waiting ? "sent" : inv.status}
                </span>
              </div>
              {who ? <p className="book-who">{who.displayName}</p> : null}
              <p className="book-when">{whenLine(inv, graceDays)}</p>
              <p className="book-amt">{formatGbp(totalOf(inv))}</p>
              <div className="book-acts">
                {inv.status === "due" ? (
                  <PayButton
                    invoiceId={inv.id}
                    studio={studio}
                    claimed={claim?.status === "claimed"}
                  />
                ) : null}
                {studio && inv.status === "draft" ? <IssueButton invoiceId={inv.id} /> : null}
                {studio && (inv.status === "draft" || inv.status === "due") ? (
                  <VoidButton invoiceId={inv.id} />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BuildTiles({ plots, lab = false }: { plots: Plot[]; lab?: boolean }) {
  const rows = plots.filter(
    (p) => hostUrlFor(p) || enterUrlFor(p) || p.localPreview || p.lab?.housePath,
  );
  if (!rows.length) return <p className="body">No builds to open yet.</p>;
  return (
    <div className="book-grid">
      {rows.map((plot) => {
        const pub = enterUrlFor(plot);
        const host = hostUrlFor(plot);
        const same = pub && host && pub.replace(/\/$/, "") === host.replace(/\/$/, "");
        return (
          <div key={plot.slug} className="lift-plate">
            <div className="lift-plate-face book-card">
              <div className="book-card-top">
                <strong>{plot.name}</strong>
                <span className="book-chip">{plot.party === "studio" ? "ours" : "client"}</span>
              </div>
              <p className="book-when">{plot.status}</p>
              <div className="book-acts">
                {lab && plot.lab?.housePath && plot.lab.localPort ? (
                  <Link href={labStationPath(plot.slug)}>Open here</Link>
                ) : lab && plot.lab?.housePath ? (
                  <span className="status">Folder on disk. Open in Cursor.</span>
                ) : null}
                {pub && !same ? (
                  <a href={pub} target="_blank" rel="noreferrer">
                    Public
                  </a>
                ) : null}
                {host ? (
                  <a href={host} target="_blank" rel="noreferrer">
                    {same ? "Open" : "Our host"}
                  </a>
                ) : pub ? (
                  <a href={pub} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  <Link href={plot.localPreview}>Story</Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BookApp({
  invoices,
  people,
  plots,
  claims,
  rolls,
  lab = false,
  graceDays = 7,
}: {
  invoices: Invoice[];
  people: PublicUser[];
  plots: Plot[];
  claims: Record<string, Payment>;
  rolls: Roll[];
  lab?: boolean;
  graceDays?: number;
}) {
  const due = invoices.filter((i) => i.status === "due");
  const drafts = invoices.filter((i) => i.status === "draft");
  const rolling = rolls.filter((r) => r.status === "active");
  const [lane, setLane] = useState<"due" | "rolling" | "drafts">("due");

  return (
    <div className="book-app">
      <BookClock />
      <p className="body bill-note">
        Calendars are ours. Set hours, hold a slot, see what is on. Hosting
        rolls collect themselves when online pay is live. Receipts write when
        money clears.
      </p>
      <StudioDiary people={people} />
      <div className="book-kpis" role="tablist">
        {(
          [
            ["due", "Due", due.length],
            ["rolling", "Rolling", rolling.length],
            ["drafts", "Drafts", drafts.length],
          ] as const
        ).map(([id, label, n], index) => (
          <div
            key={id}
            className="lift-plate"
            style={{ ["--d" as string]: String(index) }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={lane === id}
              className={`lift-plate-face book-kpi diary-ctrl${lane === id ? " is-on" : ""}`}
              onClick={() => setLane(id)}
            >
              <span className="book-kpi-n">{n}</span>
              {label}
            </button>
          </div>
        ))}
      </div>

      {lane === "due" ? (
        <InvoiceBoard invoices={due} studio claims={claims} people={people} graceDays={graceDays} />
      ) : null}
      {lane === "drafts" ? (
        <InvoiceBoard invoices={drafts} studio claims={claims} people={people} graceDays={graceDays} />
      ) : null}
      {lane === "rolling" ? (
        rolling.length === 0 ? (
          <p className="body">No rolling hosts yet. Issue a weekly or monthly line on the person.</p>
        ) : (
          <div className="book-grid">
            {rolling.map((roll) => {
              const who = people.find((p) => p.id === roll.userId);
              return (
                <div key={roll.id} className="lift-plate">
                  <div className="lift-plate-face book-card">
                    <div className="book-card-top">
                      <strong>{roll.description}</strong>
                      <span className="book-chip">{roll.cadence}</span>
                    </div>
                    {who ? <p className="book-who">{who.displayName}</p> : null}
                    {roll.plotSlug ? <p className="book-when">{roll.plotSlug}</p> : null}
                    <p className="book-when">
                      This period {formatLondonDate(roll.currentPeriodStart)} to{" "}
                      {formatLondonDate(roll.currentPeriodEnd)}. Next invoice
                      writes itself when that end is reached.
                    </p>
                    <p className="book-amt">{formatGbp(roll.waived ? 0 : roll.amountGbp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : null}

      <h3 className="book-section">Builds</h3>
      <BuildTiles plots={plots} lab={lab} />
    </div>
  );
}
