import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { clientPlots, enterUrlFor, allPlots } from "@/lib/plots";
import { pressKitForPlot, epkHref } from "@/lib/epk-map";
import { canAccessPlot, isStudio, listClients } from "@/lib/auth";
import {
  invoicesVisibleTo,
  rollDueInvoices,
  titlesAccessFor,
  getPayRail,
  paymentByInvoice,
  railIsReady,
  liveCatalogue,
  listRolls,
  getOnlineRail,
} from "@/lib/billing";
import { ProfileForm } from "@/components/AccountBilling";
import { CommentBox, InvoiceList, StudioDesk } from "@/components/StudioDesk";
import { AssetsDesk } from "@/components/AssetsDesk";
import { AssetHub } from "@/components/AssetHub";
import { EpkChooser } from "@/components/EpkChooser";
import { kitsForUser } from "@/lib/epk";
import { kitCopy } from "@/lib/epk-copy";
import { commentsFor, plansFor } from "@/lib/plans";
import { formatLondonSlot } from "@/lib/clock";
import { bookingsForUser } from "@/lib/diary";
import { receiptsVisibleTo } from "@/lib/receipts";
import { HOSTS } from "@/lib/hosts";
import { getSettings } from "@/lib/settings";
import { listEnquiries } from "@/lib/enquiries";
import { listNotices } from "@/lib/notices";
import { listOpenInstances } from "@/lib/watch";
import { listBlocks } from "@/lib/block";
import { absorbTrapWeb, listTrapWeb } from "@/lib/trap-web";
import { listAppeals } from "@/lib/appeals";
import { listShipNotes } from "@/lib/ship-notes";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { view?: string; kit?: string; desk?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  await rollDueInvoices();
  const studio = isStudio(user);
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
  const ships = await listShipNotes();

  const studioBook = studio
    ? {
        people: await listClients(),
        plots: await allPlots(),
        enquiries: await listEnquiries(),
        catalogue: await liveCatalogue(),
        rolls: await listRolls(),
        online: await getOnlineRail(),
        notices: await listNotices(),
        traps: await listOpenInstances(),
        blocked: await listBlocks(),
        trapWeb: await absorbTrapWeb().then(() => listTrapWeb()),
        appeals: await listAppeals(),
      }
    : null;

  return (
    <article className="account wrap">
      <p className="kicker">Account</p>
      <h1>{user.displayName}</h1>
      <p className="lede">
        {user.email}
        {studio ? " · Ewan and Dave" : ""}
      </p>

      <h2>Profile</h2>
      <ProfileForm
        displayName={user.displayName}
        userId={user.id}
        hasAvatar={Boolean(user.avatar)}
      />

      {studio && studioBook ? (
        <section className="campus-book">
          <h2>Book</h2>
          <p className="body bill-note">
            Who we serve, what we charge, the diaries.
          </p>
          <StudioDesk
            people={studioBook.people}
            plots={studioBook.plots}
            enquiries={studioBook.enquiries}
            invoices={invoices}
            comments={comments}
            plans={plans}
            catalogue={studioBook.catalogue}
            rail={rail}
            claims={claims}
            rolls={studioBook.rolls}
            online={studioBook.online}
            settings={settings}
            notices={studioBook.notices}
            traps={studioBook.traps}
            blocked={studioBook.blocked}
            trapWeb={studioBook.trapWeb}
            appeals={studioBook.appeals}
          />
        </section>
      ) : null}

      {!studio ? (
        <>
          {(() => {
            const view = searchParams?.view || "";
            const kitIds = kitsForUser(user);
            const kitTiles = kitIds.map((id) => {
              const copy = kitCopy(id);
              return { id, name: copy.name, kicker: copy.kicker, lede: copy.lede };
            });
            const locked = searchParams?.kit && kitIds.includes(searchParams.kit)
              ? searchParams.kit
              : kitIds[0];
            return (
              <>
                <ul className="epk-tiles account-tiles">
                  <li>
                    <a href="/account">
                      <strong>Sites</strong>
                      <span>{sites.length}</span>
                    </a>
                  </li>
                  <li>
                    <a href="/account?view=epks">
                      <strong>Press kits</strong>
                      <span>{kitTiles.length}</span>
                    </a>
                  </li>
                  <li>
                    <a href="/account?view=assets">
                      <strong>Assets</strong>
                      <span>Files</span>
                    </a>
                  </li>
                </ul>
                {view === "assets" ? (
                  <AssetHub lockedKit={searchParams?.kit && kitIds.includes(searchParams.kit) ? searchParams.kit : undefined} />
                ) : view === "press" && locked ? (
                  <AssetsDesk lockedKit={locked} />
                ) : view === "epks" ? (
                  kitTiles.length ? (
                    <EpkChooser kits={kitTiles} />
                  ) : (
                    <p className="body">No press kit on this account yet.</p>
                  )
                ) : (
                  <>
                    <h2>Sites</h2>
                    {sites.length === 0 ? (
                      <p className="body">No sites on this account yet.</p>
                    ) : (
                      <div className="site-ledger">
                        {sites.map((plot) => {
                          const live = enterUrlFor(plot);
                          const kit = pressKitForPlot(plot.slug);
                          return (
                            <div key={plot.slug} className="site-row">
                              <div className="site-copy">
                                <h3>{plot.name}</h3>
                                <p className="site-acts">
                                  {live ? <a href={live}>Visit site</a> : null}
                                  {kit ? <a href={epkHref(kit)}>Press kit</a> : null}
                                  {kit ? (
                                    <a href={`/account?view=assets&kit=${kit}`}>Assets</a>
                                  ) : null}
                                  {kit ? (
                                    <a href={`/account?view=press&kit=${kit}`}>Edit kit</a>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            );
          })()}

          <h2>Notes</h2>
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

          {plans.filter((p) => p.status === "shipped").length || ships.length ? (
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
              {ships
                .slice()
                .reverse()
                .map((s) => (
                  <div key={s.tag} className="plan-card is-shipped">
                    <p className="status">
                      {s.t.slice(0, 10)} · {s.tag}
                    </p>
                    <p className="body">{s.s}</p>
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
