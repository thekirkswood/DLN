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
  rollsForUser,
  getOnlineRail,
} from "@/lib/billing";
import { formatGbp } from "@/data/catalogue";
import { ProfileHead } from "@/components/AccountBilling";
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

function Tile({
  href,
  label,
  hint,
  on,
  bubble,
}: {
  href: string;
  label: string;
  hint: string;
  on: boolean;
  bubble?: number;
}) {
  return (
    <li>
      <Link href={href} aria-current={on ? "page" : undefined}>
        <strong>{label}</strong>
        <span>{hint}</span>
        {bubble ? <em className="tile-bubble">{bubble}</em> : null}
      </Link>
    </li>
  );
}

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
  const rolls = studio ? await listRolls() : await rollsForUser(user);
  const view = searchParams?.view || "";
  const desk = searchParams?.desk || "";
  const kitIds = kitsForUser(user);
  const kitTiles = kitIds.map((id) => {
    const copy = kitCopy(id);
    return { id, name: copy.name, kicker: copy.kicker, lede: copy.lede };
  });
  const locked =
    searchParams?.kit && kitIds.includes(searchParams.kit) ? searchParams.kit : kitIds[0];
  const mine = studio ? invoices.filter((i) => i.userId === user.id) : invoices;
  const due = mine.filter((i) => i.status === "due");
  const openNotes = comments.filter((c) => !c.planId);
  const shipped = plans.filter((p) => p.status === "shipped");
  const noticeCount = due.length + openNotes.length + shipped.length + ships.length;

  const studioBook = studio
    ? {
        people: await listClients(),
        plots: await allPlots(),
        enquiries: await listEnquiries(),
        catalogue: await liveCatalogue(),
        rolls,
        online: await getOnlineRail(),
        notices: await listNotices(),
        traps: await listOpenInstances(),
        blocked: await listBlocks(),
        trapWeb: await absorbTrapWeb().then(() => listTrapWeb()),
        appeals: await listAppeals(),
      }
    : null;

  const studioUnread = studioBook
    ? studioBook.notices.filter((n) => !n.read).length +
      invoices.filter((i) => i.status === "due").length
    : 0;
  const studioDue = invoices.filter((i) => i.status === "due").length;

  return (
    <article className="account wrap">
      <p className="kicker">Account</p>
      <ProfileHead
        displayName={user.displayName}
        userId={user.id}
        hasAvatar={Boolean(user.avatar)}
      />

      <ul className="epk-tiles account-tiles">
        {studio ? (
          <>
            <Tile
              href="/account?desk=houses"
              label="Sites"
              hint={String(sites.length)}
              on={desk === "houses"}
            />
            <Tile
              href="/account?desk=epk"
              label="Press kits"
              hint={String(kitTiles.length)}
              on={desk === "epk"}
            />
            <Tile
              href="/account?desk=assets"
              label="Assets"
              hint="Files"
              on={desk === "assets"}
            />
            <Tile
              href="/account?desk=pay"
              label="Payments"
              hint="Subs and invoices"
              on={desk === "pay"}
              bubble={studioDue}
            />
            <Tile
              href="/account?desk=notifications"
              label="Notifications"
              hint="Updates"
              on={desk === "notifications"}
              bubble={studioUnread}
            />
          </>
        ) : (
          <>
            <Tile href="/account" label="Sites" hint={String(sites.length)} on={!view} />
            <Tile
              href="/account?view=epks"
              label="Press kits"
              hint={String(kitTiles.length)}
              on={view === "epks"}
            />
            <Tile
              href="/account?view=assets"
              label="Assets"
              hint="Files"
              on={view === "assets" || view === "press"}
            />
            <Tile
              href="/account?view=pay"
              label="Payments"
              hint="Subs and invoices"
              on={view === "pay"}
              bubble={due.length}
            />
            <Tile
              href="/account?view=notices"
              label="Notifications"
              hint="Updates"
              on={view === "notices"}
              bubble={noticeCount}
            />
          </>
        )}
      </ul>

      {studio && studioBook ? (
        <section className="campus-book">
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
          {view === "assets" ? (
            <AssetHub
              lockedKit={
                searchParams?.kit && kitIds.includes(searchParams.kit)
                  ? searchParams.kit
                  : undefined
              }
            />
          ) : view === "press" && locked ? (
            <AssetsDesk lockedKit={locked} />
          ) : view === "epks" ? (
            kitTiles.length ? (
              <EpkChooser kits={kitTiles} />
            ) : (
              <p className="body">No press kit on this account yet.</p>
            )
          ) : view === "pay" ? (
            <PaymentsPanel
              titles={titles}
              sittings={sittings}
              receipts={receipts}
              invoices={invoices}
              rolls={rolls}
              claims={claims}
              railReady={railIsReady(rail)}
              graceDays={settings.graceDays}
            />
          ) : view === "notices" ? (
            <NoticesPanel
              due={due}
              notes={openNotes}
              shipped={shipped}
              ships={ships}
            />
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
                              <Link href={`/account?view=assets&kit=${kit}`}>Assets</Link>
                            ) : null}
                            {kit ? (
                              <Link href={`/account?view=press&kit=${kit}`}>Edit kit</Link>
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

          {view === "notices" ? (
            <CommentBox plotSlug={sites[0]?.slug || ""} plotOptions={sites} />
          ) : null}
        </>
      ) : null}

      <p className="account-out">
        <Link href="/logout">Sign out</Link>
      </p>
    </article>
  );
}

function PaymentsPanel({
  titles,
  sittings,
  receipts,
  invoices,
  rolls,
  claims,
  railReady,
  graceDays,
}: {
  titles: Awaited<ReturnType<typeof titlesAccessFor>> | null;
  sittings: Awaited<ReturnType<typeof bookingsForUser>>;
  receipts: Awaited<ReturnType<typeof receiptsVisibleTo>>;
  invoices: Awaited<ReturnType<typeof invoicesVisibleTo>>;
  rolls: Awaited<ReturnType<typeof rollsForUser>>;
  claims: Awaited<ReturnType<typeof paymentByInvoice>>;
  railReady: boolean;
  graceDays: number;
}) {
  const active = rolls.filter((r) => r.status === "active");
  return (
    <>
      <h2>Payments</h2>
      <p className="body bill-note">
        {railReady
          ? "Pay by bank transfer on the invoice. Use the invoice number as the reference."
          : `Open an invoice for the amount due. Unpaid after ${graceDays} days shuts a bound site.`}
      </p>

      <h3>Subscriptions</h3>
      {active.length === 0 ? (
        <p className="body">No active rolls on this account.</p>
      ) : (
        <ul className="note-list">
          {active.map((row) => (
            <li key={row.id}>
              <span className="status">
                {row.cadence} · {formatGbp(row.amountGbp)}
              </span>
              <p>
                {row.description}
                {row.waived ? " · waived" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h3>Invoices</h3>
      <InvoiceList invoices={invoices} studio={false} claims={claims} graceDays={graceDays} />

      <h3>Receipts</h3>
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

      <h3>Sittings</h3>
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

      <h3>Various Titles</h3>
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
        <p className="body bill-note">Nothing unlocked on Various Titles yet.</p>
      )}
    </>
  );
}

function NoticesPanel({
  due,
  notes,
  shipped,
  ships,
}: {
  due: Awaited<ReturnType<typeof invoicesVisibleTo>>;
  notes: Awaited<ReturnType<typeof commentsFor>>;
  shipped: Awaited<ReturnType<typeof plansFor>>;
  ships: Awaited<ReturnType<typeof listShipNotes>>;
}) {
  const empty = !due.length && !notes.length && !shipped.length && !ships.length;
  return (
    <>
      <h2>Notifications</h2>
      {empty ? <p className="body">Nothing waiting.</p> : null}

      {due.length ? (
        <>
          <h3>Payments due</h3>
          <ul className="note-list">
            {due.map((inv) => (
              <li key={inv.id}>
                <span className="status">{inv.dueAt?.slice(0, 10) || "Due"}</span>
                <p>
                  Invoice {inv.number} needs paying.{" "}
                  <Link href={`/account/invoices/${inv.id}`}>Open invoice</Link>
                  {" · "}
                  <Link href="/account?view=pay">Payments</Link>
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {notes.length ? (
        <>
          <h3>Notes</h3>
          <ul className="note-list">
            {notes.map((c) => (
              <li key={c.id}>
                <span className="status">{c.createdAt.slice(0, 10)}</span>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {shipped.length || ships.length ? (
        <>
          <h3>What’s new</h3>
          {shipped.map((p) => (
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
    </>
  );
}
