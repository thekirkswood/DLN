import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { allPlots, clientPlots, enterUrlFor, statusLabel } from "@/lib/plots";
import { canAccessPlot, isStudio, listClients } from "@/lib/auth";
import { invoicesVisibleTo, rollDueInvoices, titlesAccessFor } from "@/lib/billing";
import { ProfileForm } from "@/components/AccountBilling";
import { CommentBox, InvoiceList, StudioDesk } from "@/components/StudioDesk";
import { isLocalHandle } from "@/lib/handles";
import { listEnquiries } from "@/lib/enquiries";
import { commentsFor, plansFor } from "@/lib/plans";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  await rollDueInvoices();
  const studio = isStudio(user);
  const plots = await allPlots();
  const allClientPlots = await clientPlots();
  const sites = allClientPlots.filter((p) => canAccessPlot(user, p.slug));
  const invoices = await invoicesVisibleTo(user);
  const people = studio ? await listClients() : [];
  const titles = studio ? null : await titlesAccessFor(user);
  const enquiries = studio ? await listEnquiries() : [];
  const comments = await commentsFor(user);
  const plans = await plansFor(user);

  return (
    <article className="account wrap">
      <p className="kicker">{studio ? "Desk" : "Account"}</p>
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

      {studio ? (
        <StudioDesk
          people={people}
          plots={plots}
          enquiries={enquiries}
          invoices={invoices}
          comments={comments}
          plans={plans}
        />
      ) : (
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
              Paying customer — {titles.grant === "full" ? "full resource" : "section"}.
              This Design Lab North login is the one that will open Various Titles.
            </p>
          ) : titles?.pendingInvoiceId ? (
            <p className="body bill-note">
              A Various Titles line is due.{" "}
              <Link href={`/account/invoices/${titles.pendingInvoiceId}`}>Open invoice</Link>.
            </p>
          ) : (
            <p className="body bill-note">
              Various Titles is billed here. Once a line is paid, this same login
              opens the resources.
            </p>
          )}

          <h2>Invoices</h2>
          <p className="body bill-note">Pay records in the account book. Card checkout comes next.</p>
          <InvoiceList invoices={invoices} studio={false} />
        </>
      )}

      <p className="account-out">
        <Link href="/logout">Sign out</Link>
      </p>
    </article>
  );
}
