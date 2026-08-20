import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { findUserById, isStudio } from "@/lib/auth";
import { Mark } from "@/components/Mark";
import {
  canSeeInvoice,
  getPayRail,
  invoiceById,
  invoiceTotal,
  lineTotal,
  paymentsFor,
  railIsReady,
} from "@/lib/billing";
import { formatGbp } from "@/data/catalogue";
import { formatLondonDate, payByIso } from "@/lib/clock";
import { getSettings } from "@/lib/settings";
import { receiptForInvoice } from "@/lib/receipts";
import { IssueButton, PayButton, PrintButton, VoidButton } from "@/components/AccountBilling";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

function formatSortCode(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 6) return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
  return raw;
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const inv = await invoiceById(params.id);
  if (!inv || !canSeeInvoice(user, inv)) notFound();
  const billed = await findUserById(inv.userId);
  const studio = isStudio(user);
  const issued = inv.issuedAt ? formatLondonDate(inv.issuedAt) : "Draft";
  const payBy = payByIso(inv.dueAt, inv.issuedAt, (await getSettings()).graceDays);
  const total = invoiceTotal(inv);
  const rail = await getPayRail();
  const payments = await paymentsFor(inv.id);
  const claim = payments.find((p) => p.status === "claimed");
  const cleared = payments.find((p) => p.status === "cleared");
  const receipt = await receiptForInvoice(inv.id);

  return (
    <article className="invoice-sheet wrap">
      <div className="invoice-head">
        <Mark size="nav" />
        <div className="invoice-meta">
          <p className="kicker">Invoice</p>
          <h1>{inv.number}</h1>
          <p className="status">
            {issued}
            {inv.status === "due" && payBy ? ` · pay by ${formatLondonDate(payBy)}` : ""}
            {" · "}
            {inv.status}
            {claim && inv.status === "due" ? " · payment sent" : ""}
          </p>
        </div>
      </div>
      <p className="body">
        {billed ? `${billed.displayName} · ${billed.email}` : inv.userId}
      </p>
      <table className="invoice-lines">
        <thead>
          <tr>
            <th>Description</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((line) => (
            <tr key={line.id} className={line.waived ? "is-waived" : undefined}>
              <td>
                <span className={line.waived ? "strike" : undefined}>{line.description}</span>
                {line.plotSlug ? <span className="status"> {line.plotSlug}</span> : null}
              </td>
              <td className="cost">
                {line.waived ? (
                  <>
                    <span className="strike">{formatGbp(line.amountGbp)}</span>
                    <span> waived</span>
                  </>
                ) : (
                  formatGbp(lineTotal(line))
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th className="cost">{formatGbp(total)}</th>
          </tr>
        </tfoot>
      </table>
      {inv.notes ? <p className="body">{inv.notes}</p> : null}

      {inv.status === "due" && total > 0 ? (
        <section className="pay-how">
          <h2>Pay</h2>
          {railIsReady(rail) ? (
            <>
              <p className="body">
                Bank transfer. Use the invoice number as the payment reference.
              </p>
              <dl className="pay-rail">
                <div>
                  <dt>Amount</dt>
                  <dd>{formatGbp(total)}</dd>
                </div>
                <div>
                  <dt>Account name</dt>
                  <dd>{rail.accountName}</dd>
                </div>
                {rail.bankName ? (
                  <div>
                    <dt>Bank</dt>
                    <dd>{rail.bankName}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Sort code</dt>
                  <dd>{formatSortCode(rail.sortCode)}</dd>
                </div>
                <div>
                  <dt>Account number</dt>
                  <dd>{rail.accountNumber}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd>{inv.number}</dd>
                </div>
              </dl>
              {rail.extra ? <p className="body">{rail.extra}</p> : null}
            </>
          ) : (
            <p className="body">
              {studio
                ? "Bank details later. This invoice still stands. How to pay will sit here once the account is on the book."
                : "Design Lab North will confirm how to pay this invoice."}
            </p>
          )}
          {claim ? (
            <p className="note">
              Marked as sent
              {claim.claimedAt
                ? ` ${formatLondonDate(claim.claimedAt)}`
                : ""}
              . Studio marks it paid when it lands.
            </p>
          ) : null}
        </section>
      ) : null}

      {inv.status === "paid" ? (
        <p className="note">
          Paid
          {inv.paidAt ? ` ${formatLondonDate(inv.paidAt)}` : ""}
          {cleared?.method === "bank" ? " by bank transfer" : ""}
          {cleared?.method === "online" ? " online" : ""}
          {cleared?.method === "studio" ? " on the book" : ""}.
        </p>
      ) : null}

      {receipt ? (
        <p className="body">
          <Link href={`/account/receipts/${receipt.id}`}>Receipt {receipt.number}</Link>
        </p>
      ) : null}

      <div className="actions no-print">
        {inv.status === "due" && total > 0 ? (
          <PayButton
            invoiceId={inv.id}
            studio={studio}
            claimed={Boolean(claim)}
          />
        ) : null}
        {studio && inv.status === "draft" ? <IssueButton invoiceId={inv.id} /> : null}
        {studio && (inv.status === "draft" || inv.status === "due") ? (
          <VoidButton invoiceId={inv.id} />
        ) : null}
        <PrintButton />
        <Link href="/account">Account</Link>
      </div>
      <p className="note no-print">
        Formats as A4. Unpaid after seven days shuts a bound site for the client.
      </p>
    </article>
  );
}
