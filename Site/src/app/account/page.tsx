import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { clientPlots, enterUrlFor, statusLabel } from "@/lib/plots";
import { canAccessPlot, isStudio } from "@/lib/auth";
import { invoicesVisibleTo, rollDueInvoices, titlesAccessFor, getPayRail, paymentByInvoice, railIsReady } from "@/lib/billing";
import { ProfileForm } from "@/components/AccountBilling";
import { CommentBox, InvoiceList } from "@/components/StudioDesk";
import { isLocalHandle } from "@/lib/handles";
import { commentsFor, plansFor } from "@/lib/plans";
import { labHostFromHeaders } from "@/lib/lab";
import { bookingsForUser } from "@/lib/diary";
import { receiptsVisibleTo } from "@/lib/receipts";
import { HOSTS } from "@/lib/hosts";
import { formatLondonSlot } from "@/lib/clock";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  await rollDueInvoices();
  const studio = isStudio(user);
  const lab = labHostFromHeaders();
  const allClientPlots = await clientPlots();
  const sites = allClientPlots.filter((p) => canAccessPlot(user, p.slug));
  const invoices = await invoicesVisibleTo(user);
  const titles = studio ? null : await titlesAccessFor(user);
  const comments = await commentsFor(user);
  const plans = await plansFor(user);
  const claims = await paymentByInvoice();
  const rail = await getPayRail();
  const sittings = studio ? [] : await bookingsForUser(user.id);
  const receipts = studio ? [] : await receiptsVisibleTo(user);
  const settings = await getSettings();

  return (
    <article className="account wrap">
      <p className="kicker">Account</p>
      <h1>{user.displayName}</h1>
      <p className="lede">
        {user.email}
        {isLocalHandle(user.email) ? " · internal login" : ""}
        {studio ? " · Ewan and Dave" : " · client"}
      </p>

      <h2>Profile</h2>
      <ProfileForm
        displayName={user.displayName}
        userId={user.id}
        hasAvatar={Boolean(user.avatar)}
      />

      {studio && lab ? (
        <p className="body bill-note">
          Clients, invoices, and how they pay live on{" "}
          <Link href="/lab">campus</Link>. This page is us.
        </p>
      ) : null}

      {studio && !lab ? (
        <p className="body bill-note">
          The studio book lives at home, not on this public host.{" "}
          <Link href="/lab">Open campus</Link> — this host only talks back to
          the house. Client pages stay here.
        </p>
      ) : null}

      {!studio ? (
        <>
          <h2>Your site</h2>
          {sites.length === 0 ? (
            <p className="body">No sites on this account yet.</p>
          ) : (
            <div className="site-ledger">
              {sites.map((plot) => {
                const live = enterUrlFor(plot);
                return (
                  <div key={plot.slug} className="site-row">
                    <div className="site-copy">
                      <h3>{plot.name}</h3>
                      <div className="status">{statusLabel(plot)}</div>
                      {live ? (
                        <Link href={live}>Open site</Link>
                      ) : (
                        <span className="note">No host yet.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2>Notes</h2>
          <p className="body bill-note">
            Leave a note on the live host from here. We read them, turn them
            into one plan, and come back with an update — including patch notes
            for what changed.
          </p>
          {comments.filter((c) => !c.planId).length ? (
            <ul className="note-list">
              {comments
                .filter((c) => !c.planId)
                .map((c) => (
                  <li key={c.id}>
                    <span className="status">{c.createdAt.slice(0, 10)}</span>
                    <p>{c.body}</p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="body">No open notes.</p>
          )}
          <CommentBox plotSlug={sites[0]?.slug || ""} plotOptions={sites} />

          {plans.filter((p) => p.status === "shipped").length ? (
            <>
              <h2>What’s new</h2>
              {plans
                .filter((p) => p.status === "shipped")
                .map((p) => (
                  <div key={p.id} className="plan-card is-shipped">
                    <p className="status">{p.updatedAt.slice(0, 10)}</p>
                    <p className="body">{p.patchNotes || p.title}</p>
                  </div>
                ))}
            </>
          ) : null}

          <h2>Various Titles</h2>
          {titles?.grant ? (
            <p className="body bill-note">
              You have access — {titles.grant === "full" ? "the full resource" : "a section"}.
            </p>
          ) : titles?.pendingInvoiceId ? (
            <p className="body bill-note">
              A Various Titles line is due.{" "}
              <Link href={`/account/invoices/${titles.pendingInvoiceId}`}>Open invoice</Link>.
            </p>
          ) : (
            <p className="body bill-note">
              Nothing unlocked on Various Titles yet.
            </p>
          )}

          <h2>Sittings</h2>
          {sittings.length === 0 ? (
            <p className="body">No sittings booked yet.</p>
          ) : (
            <div className="book-grid">
              {sittings.map((row) => (
                <div key={row.id} className="lift-plate">
                  <div className="lift-plate-face book-card">
                    <div className="book-card-top">
                      <strong>{HOSTS[row.hostId].name.split(" ")[0]}</strong>
                      <span className="book-chip">{row.facet}</span>
                    </div>
                    <p className="book-when">{formatLondonSlot(row.startIso, row.endIso)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2>Receipts</h2>
          {receipts.length === 0 ? (
            <p className="body">Receipts land here when a payment clears. Download any of them.</p>
          ) : (
            <div className="book-grid">
              {receipts.map((row) => (
                <div key={row.id} className="lift-plate">
                  <div className="lift-plate-face book-card">
                    <div className="book-card-top">
                      <Link href={`/account/receipts/${row.id}`}>
                        <strong>{row.number}</strong>
                      </Link>
                      <span className="book-chip">{row.method}</span>
                    </div>
                    <p className="book-when">{row.invoiceNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2>Invoices</h2>
          <p className="body bill-note">
            {railIsReady(rail)
              ? "Pay by bank transfer on the invoice. Use the invoice number as the reference."
              : `Open an invoice for the amount due. Unpaid after ${settings.graceDays} days shuts a bound site.`}
          </p>
          <InvoiceList invoices={invoices} studio={false} claims={claims} graceDays={settings.graceDays} />
        </>
      ) : null}

      <p className="account-out">
        <Link href="/logout">Sign out</Link>
      </p>
    </article>
  );
}
