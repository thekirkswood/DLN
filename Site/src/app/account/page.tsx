import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { plotsOnAccount, enterUrlFor, hostUrlFor, allPlots } from "@/lib/plots";
import { isStudio, listClients } from "@/lib/auth";
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
import { ACCOUNT_FAQ } from "@/data/account-faq";
import { formatLondonSlot } from "@/lib/clock";
import { bookingsForUser } from "@/lib/diary";
import { receiptsVisibleTo } from "@/lib/receipts";
import { HOSTS } from "@/lib/hosts";
import { getSettings } from "@/lib/settings";
import { listEnquiries } from "@/lib/enquiries";
import { listNotices } from "@/lib/notices";
import { listOpenInstances, listVisits } from "@/lib/watch";
import { listCaptures } from "@/lib/captures";
import { CaptureWell } from "@/components/CaptureWell";
import { grantDueTokens, ledgersVisibleTo, tokenCosts } from "@/lib/tokens";
import { listBlocks } from "@/lib/block";
import { absorbTrapWeb, listTrapWeb } from "@/lib/trap-web";
import { listAppeals } from "@/lib/appeals";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
      <a href={href} aria-current={on ? "page" : undefined}>
        <strong>{label}</strong>
        <span>{hint}</span>
        {bubble ? <em className="tile-bubble">{bubble}</em> : null}
      </a>
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
  await grantDueTokens();
  const costs = await tokenCosts();
  const ledgers = await ledgersVisibleTo(user);
  const studio = isStudio(user);
  const sites = plotsOnAccount(user, await allPlots());
  const invoices = await invoicesVisibleTo(user);
  const titles = studio ? null : await titlesAccessFor(user);
  const comments = await commentsFor(user);
  const captures = await listCaptures(user);
  const plans = await plansFor(user);
  const claims = await paymentByInvoice();
  const rail = await getPayRail();
  const sittings = studio ? [] : await bookingsForUser(user.id);
  const receipts = studio ? [] : await receiptsVisibleTo(user);
  const settings = await getSettings();
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
  const noticeCount =
    due.length +
    comments.filter((c) => c.kind === "news" || c.kind === "query").length;

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
        visits: await listVisits(),
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
            {kitTiles.length ? (
              <Tile
                href="/account?view=epks"
                label="Press kits"
                hint={String(kitTiles.length)}
                on={view === "epks"}
              />
            ) : null}
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

      {studio ? (
        <section className="token-well">
          <h2>Tokens</h2>
          <p className="body bill-note">
            Leave a note is free. Send now spends {costs.pingCost} tokens to
            push immediate edits. Generated packs will spend {costs.genCost}.
            Grants: {costs.grants[1]} / {costs.grants[2]} / {costs.grants[3]} on
            stacks 1 / 2 / 3.
          </p>
          {ledgers.length ? (
            <ul className="note-list">
              {ledgers.map((row) => (
                <li key={row.id}>
                  <span className="status">
                    {row.plotSlug} · stack {row.stack}
                  </span>
                  <p>
                    {row.balance} of {row.grantedThisPeriod} left this month.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="body">Wells open when a site is on a monthly stack.</p>
          )}
        </section>
      ) : null}

      {studio && captures.length ? (
        <section className="capture-log">
          <h2>Captures</h2>
          <ul className="note-list">
            {captures.slice(0, 40).map((row) => (
              <li key={row.id}>
                <span className="status">
                  {row.t.slice(0, 10)} · {row.plotSlug} · {row.pace} · {row.status}
                </span>
                <p>
                  <strong>{row.kind}.</strong> {row.text || row.files.map((f) => f.name).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
            visits={studioBook.visits}
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
              ledgers={ledgers}
              sites={sites}
            />
          ) : view === "notices" ? (
            <NoticesPanel
              due={due}
              news={comments.filter((c) => c.kind === "news")}
              queries={comments.filter((c) => c.kind === "query")}
              sites={sites}
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
                    const host = hostUrlFor(plot);
                    return (
                      <div key={plot.slug} className="site-row">
                        <div className="site-copy">
                          <h3>{plot.name}</h3>
                          <p className="site-acts">
                            {live ? <a href={live}>Live site</a> : null}
                            {host && host !== live ? (
                              <a href={host}>On our host</a>
                            ) : null}
                            <a href={`/?site=${encodeURIComponent(plot.slug)}`}>Sandbox</a>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <CaptureWell
                plotSlug={sites[0]?.slug || ""}
                plotOptions={sites}
              />
              <CommentBox
                plotSlug={sites[0]?.slug || ""}
                plotOptions={sites}
                kind="hotfix"
                rows={4}
                hint="Something is wrong right now. We try to audit this within the hour."
                label="Hotfix"
                cta="Send hotfix"
              />
              <section className="account-faq">
                <h2>FAQ</h2>
                {ACCOUNT_FAQ.map((row) => (
                  <details key={row.q}>
                    <summary>{row.q}</summary>
                    <p>{row.a}</p>
                  </details>
                ))}
              </section>
            </>
          )}
        </>
      ) : null}

      <p className="account-out">
        <a href="/logout">Sign out</a>
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
  ledgers,
  sites,
}: {
  titles: Awaited<ReturnType<typeof titlesAccessFor>> | null;
  sittings: Awaited<ReturnType<typeof bookingsForUser>>;
  receipts: Awaited<ReturnType<typeof receiptsVisibleTo>>;
  invoices: Awaited<ReturnType<typeof invoicesVisibleTo>>;
  rolls: Awaited<ReturnType<typeof rollsForUser>>;
  claims: Awaited<ReturnType<typeof paymentByInvoice>>;
  railReady: boolean;
  graceDays: number;
  ledgers: Awaited<ReturnType<typeof ledgersVisibleTo>>;
  sites: Awaited<ReturnType<typeof plotsOnAccount>>;
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

      <h3>Tokens</h3>
      <p className="body bill-note">
        Tokens are the currency on this account. Send now spends them to push
        immediate edits. Generated pictures, clips, and packs will spend the
        same tokens. Grant is 40 / 100 / 250 a month on BoomStack 1 / 2 / 3.
      </p>
      {ledgers.length ? (
        <ul className="note-list">
          {ledgers.map((row) => {
            const site = sites.find((p) => p.slug === row.plotSlug);
            return (
              <li key={row.id}>
                <span className="status">
                  Stack {row.stack} · {row.balance} tokens
                </span>
                <p>
                  {site?.name || row.plotSlug}: {row.balance} of{" "}
                  {row.grantedThisPeriod} this month.
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="body">Tokens land here when a site is on a monthly stack.</p>
      )}

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
                  <a href={`/account/receipts/${row.id}`}>
                    <strong>{row.number}</strong>
                  </a>
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
          <a href={`/account/invoices/${titles.pendingInvoiceId}`}>Open invoice</a>.
        </p>
      ) : (
        <p className="body bill-note">Nothing unlocked on Various Titles yet.</p>
      )}
    </>
  );
}

function NoticesPanel({
  due,
  news,
  queries,
  sites,
}: {
  due: Awaited<ReturnType<typeof invoicesVisibleTo>>;
  news: Awaited<ReturnType<typeof commentsFor>>;
  queries: Awaited<ReturnType<typeof commentsFor>>;
  sites: Awaited<ReturnType<typeof plotsOnAccount>>;
}) {
  return (
    <>
      <h2>Notifications — news from DLN</h2>
      {due.length || news.length ? (
        <ul className="note-list">
          {due.map((inv) => (
            <li key={inv.id}>
              <span className="status">{inv.dueAt?.slice(0, 10) || "Due"}</span>
              <p>
                Invoice {inv.number} needs paying.{" "}
                <a href={`/account/invoices/${inv.id}`}>Open invoice</a>
                {" · "}
                <a href="/account?view=pay">Payments</a>
              </p>
            </li>
          ))}
          {news.map((c) => (
            <li key={c.id}>
              <span className="status">{c.createdAt.slice(0, 10)}</span>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body">Nothing from us yet.</p>
      )}

      <h2>Query — ask DLN</h2>
      <p className="body bill-note">
        Write to us here. We write back in this same list.
      </p>
      {queries.length ? (
        <ul className="note-list">
          {queries.map((c) => (
            <li key={c.id}>
              <span className="status">
                {c.createdAt.slice(0, 10)}
                {c.source === "studio" ? " · DLN" : ""}
              </span>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="body">No queries yet.</p>
      )}
      <CommentBox
        plotSlug={sites[0]?.slug || ""}
        plotOptions={sites}
        kind="query"
        rows={5}
        label="Ask DLN"
        cta="Send"
      />
    </>
  );
}
