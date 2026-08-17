import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { findUserById, isStudio } from "@/lib/auth";
import { Mark } from "@/components/Mark";
import {
  canSeeInvoice,
  invoiceById,
  invoiceTotal,
  lineTotal,
} from "@/lib/billing";
import { formatGbp } from "@/data/catalogue";
import { IssueButton, PayButton, PrintButton, VoidButton } from "@/components/AccountBilling";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

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
  const issued = inv.issuedAt
    ? new Date(inv.issuedAt).toLocaleDateString("en-GB")
    : "Draft";

  return (
    <article className="invoice-sheet wrap">
      <div className="invoice-head">
        <Mark size="nav" />
        <div className="invoice-meta">
          <p className="kicker">Invoice</p>
          <h1>{inv.number}</h1>
          <p className="status">
            {issued} · {inv.status}
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
            <th className="cost">{formatGbp(invoiceTotal(inv))}</th>
          </tr>
        </tfoot>
      </table>
      {inv.notes ? <p className="body">{inv.notes}</p> : null}
      <div className="actions no-print">
        {inv.status === "due" ? <PayButton invoiceId={inv.id} /> : null}
        {studio && inv.status === "draft" ? <IssueButton invoiceId={inv.id} /> : null}
        {studio && (inv.status === "draft" || inv.status === "due") ? (
          <VoidButton invoiceId={inv.id} />
        ) : null}
        <PrintButton />
        <Link href="/account">Account</Link>
      </div>
      <p className="note no-print">
        Formats as A4. Pay records in the book. Card checkout comes next.
      </p>
    </article>
  );
}
