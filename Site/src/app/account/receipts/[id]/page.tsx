import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { findUserById, isStudio } from "@/lib/auth";
import { Mark } from "@/components/Mark";
import { canSeeReceipt, receiptById, receiptCopy } from "@/lib/receipts";
import { formatGbp } from "@/data/catalogue";
import { formatLondonDate } from "@/lib/clock";
import { PrintButton } from "@/components/AccountBilling";

export const metadata = { title: "Receipt" };
export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const row = await receiptById(params.id);
  if (!row || !canSeeReceipt(user, row)) notFound();
  const billed = await findUserById(row.userId);
  const who = billed ? `${billed.displayName} · ${billed.email}` : row.userId;
  const text = receiptCopy(row, who);

  return (
    <article className="invoice-sheet wrap">
      <div className="invoice-head">
        <Mark size="nav" />
        <div className="invoice-meta">
          <p className="kicker">Receipt</p>
          <h1>{row.number}</h1>
          <p className="status">
            {formatLondonDate(row.paidAt)} · {row.method}
          </p>
        </div>
      </div>
      <p className="body">{who}</p>
      <p className="body bill-note">Invoice {row.invoiceNumber}</p>
      <table className="invoice-lines">
        <thead>
          <tr>
            <th>Description</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {row.lines.map((line, i) => (
            <tr key={`${row.id}-${i}`}>
              <td>{line.description}</td>
              <td className="cost">{formatGbp(line.amountGbp)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th className="cost">{formatGbp(row.amountGbp)}</th>
          </tr>
        </tfoot>
      </table>
      <div className="actions no-print">
        <PrintButton />
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
          download={`${row.number}.txt`}
        >
          Download
        </a>
        <Link href={`/account/invoices/${row.invoiceId}`}>Invoice</Link>
        <Link href="/account">Account</Link>
      </div>
    </article>
  );
}
