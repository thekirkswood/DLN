"use client";

import { InvoiceComposer } from "@/components/InvoiceDesk";
import { InvoiceBoard } from "@/components/BookApp";
import type { CatalogueItem } from "@/data/catalogue";
import type { Invoice, Payment } from "@/lib/billing";
import type { Plot } from "@/lib/plot-urls";
import type { PublicUser } from "@/lib/auth";

export function PayDesk({
  catalogue,
  people,
  plots,
  invoices,
  claims,
  graceDays,
  servingId,
}: {
  catalogue: CatalogueItem[];
  people: PublicUser[];
  plots: Plot[];
  invoices: Invoice[];
  claims: Record<string, Payment>;
  graceDays: number;
  servingId: string;
}) {
  const serving = people.find((p) => p.id === servingId) || null;
  const plotOpts = plots
    .filter((p) => p.party === "client")
    .map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <div className="pay-desk">
      {serving ? (
        <>
          <p className="body bill-note">
            Tap the work to put it on {serving.displayName}’s invoice. Amounts
            are the Settings defaults. Ping sends them to pay online — they
            enter their details in that system, not here.
          </p>
          <InvoiceComposer
            people={people}
            plots={plotOpts}
            fixedUserId={serving.id}
            catalogue={catalogue}
            graceDays={graceDays}
          />
          <h2>On the book</h2>
          <InvoiceBoard
            invoices={invoices}
            studio
            claims={claims}
            people={people}
            graceDays={graceDays}
          />
        </>
      ) : (
        <p className="body bill-note">
          Choose who you are serving, then tap the lines. Defaults live in
          Settings.
        </p>
      )}
    </div>
  );
}
