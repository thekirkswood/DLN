import { formatGbp } from "@/data/catalogue";
import { ACCOUNT_FAQ } from "@/data/account-faq";
import { plotShowsPressKit } from "@/data/boomstack";
import { AssetHub } from "@/components/AssetHub";
import { AssetsDesk } from "@/components/AssetsDesk";
import { CommentBox } from "@/components/CommentBox";
import { EpkChooser } from "@/components/EpkChooser";
import { InvoiceBoard } from "@/components/BookApp";
import { PlotLog } from "@/components/PlotLog";
import { hostUrlFor, liveUrlFor, type Plot } from "@/lib/plots";
import { epkHref, pressKitForPlot } from "@/lib/epk-map";
import { formatLondonSlot } from "@/lib/clock";
import { HOSTS } from "@/lib/hosts";
import { stackForPlot } from "@/lib/tokens";
import type { Invoice, Payment, Roll } from "@/lib/billing";
import type { TokenLedger } from "@/lib/tokens";
import type { SiteComment } from "@/lib/plans";
import type { Receipt } from "@/lib/receipts";
import type { Booking } from "@/lib/diary";

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

export function ClientAccount({
  view,
  kit,
  look,
  lookHref,
  sites,
  invoices,
  claims,
  rolls,
  receipts,
  sittings,
  ledgers,
  news,
  queries,
  kitTiles,
  lockedKit,
  railReady,
  graceDays,
}: {
  view: string;
  kit?: string;
  look?: boolean;
  lookHref?: string;
  sites: Plot[];
  invoices: Invoice[];
  claims: Record<string, Payment>;
  rolls: Roll[];
  receipts: Receipt[];
  sittings: Booking[];
  ledgers: TokenLedger[];
  news: SiteComment[];
  queries: SiteComment[];
  kitTiles: { id: string; name: string; kicker: string; lede: string }[];
  lockedKit?: string;
  railReady: boolean;
  graceDays: number;
}) {
  const due = invoices.filter((i) => i.status === "due");
  const q = lookHref || "/account";
  const join = q.includes("?") ? "&" : "?";
  return (
    <>
      <ul className="epk-tiles account-tiles">
        <Tile href={q} label="Sites" hint={String(sites.length)} on={!view} />
        {kitTiles.length ? (
          <Tile
            href={`${q}${join}view=epks`}
            label="Press kits"
            hint={String(kitTiles.length)}
            on={view === "epks" || view === "press"}
          />
        ) : null}
        <Tile
          href={`${q}${join}view=assets`}
          label="Assets"
          hint="Files"
          on={view === "assets"}
        />
        <Tile
          href={`${q}${join}view=pay`}
          label="Payments"
          hint="Subs and invoices"
          on={view === "pay"}
          bubble={due.length}
        />
        <Tile
          href={`${q}${join}view=notices`}
          label="Notifications"
          hint="Updates"
          on={view === "notices"}
          bubble={
            due.length + news.length + queries.length
          }
        />
      </ul>

      {view === "assets" ? (
        kitTiles.length ? (
          <AssetHub
            lockedKit={
              kit && kitTiles.some((row) => row.id === kit) ? kit : kitTiles[0]?.id
            }
            onlyKits={kitTiles.map((row) => row.id)}
          />
        ) : (
          <p className="body">No files on this account yet.</p>
        )
      ) : view === "press" && lockedKit ? (
        <AssetsDesk lockedKit={lockedKit} />
      ) : view === "epks" ? (
        kitTiles.length ? (
          <EpkChooser kits={kitTiles} />
        ) : (
          <p className="body">No press kit on this account yet.</p>
        )
      ) : view === "pay" ? (
        <PaymentsPanel
          sittings={sittings}
          receipts={receipts}
          invoices={invoices}
          rolls={rolls}
          claims={claims}
          railReady={railReady}
          graceDays={graceDays}
          ledgers={ledgers}
          sites={sites}
          look={look}
        />
      ) : view === "notices" ? (
        <NoticesPanel
          due={due}
          news={news}
          queries={queries}
          sites={sites}
          look={look}
          payHref={`${q}${join}view=pay`}
        />
      ) : (
        <>
          <h2>Sites</h2>
          {sites.length === 0 ? (
            <p className="body">No sites on this account yet.</p>
          ) : (
            <div className="site-ledger">
              {sites.map((plot) => {
                const live = liveUrlFor(plot);
                const host = hostUrlFor(plot);
                const kitId = pressKitForPlot(plot.slug);
                const showPress = plotShowsPressKit(
                  stackForPlot(rolls, plot.slug),
                  kitId,
                );
                return (
                  <div key={plot.slug} className="site-row">
                    <div className="site-copy">
                      <h3>{plot.name}</h3>
                      <p className="site-acts">
                        {live ? (
                          <a href={live}>Live site</a>
                        ) : (
                          <span className="site-act-off">Live site</span>
                        )}
                        {host && host !== live ? (
                          <a href={host}>On our host</a>
                        ) : null}
                        <a href={`/?site=${encodeURIComponent(plot.slug)}`}>Sandbox</a>
                        {showPress && kitId ? (
                          <a href={epkHref(kitId)}>Press kit</a>
                        ) : null}
                      </p>
                    </div>
                    <PlotLog slug={plot.slug} />
                  </div>
                );
              })}
            </div>
          )}
          <p className="body bill-note">
            Talk to a site from its tab on the home — live view, Instant
            update, hotfix, and patch notes sit under that window.
          </p>
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
  );
}

function PaymentsPanel({
  sittings,
  receipts,
  invoices,
  rolls,
  claims,
  railReady,
  graceDays,
  ledgers,
  sites,
  look,
}: {
  sittings: Booking[];
  receipts: Receipt[];
  invoices: Invoice[];
  rolls: Roll[];
  claims: Record<string, Payment>;
  railReady: boolean;
  graceDays: number;
  ledgers: TokenLedger[];
  sites: Plot[];
  look?: boolean;
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
        Tokens are the currency on this account. Instant update spends them to
        push immediate edits. Generated pictures, clips, and packs will spend the
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
      <InvoiceBoard
        invoices={invoices}
        studio={false}
        claims={claims}
        graceDays={graceDays}
        look={look}
      />

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
    </>
  );
}

function NoticesPanel({
  due,
  news,
  queries,
  sites,
  look,
  payHref,
}: {
  due: Invoice[];
  news: SiteComment[];
  queries: SiteComment[];
  sites: Plot[];
  look?: boolean;
  payHref: string;
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
                {look ? null : (
                  <>
                    {" · "}
                    <a href={payHref}>Payments</a>
                  </>
                )}
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
      {look ? (
        <p className="body bill-note">They write here. We write back in this same list.</p>
      ) : (
        <p className="body bill-note">
          Write to us here. We write back in this same list.
        </p>
      )}
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
      {look ? null : (
        <CommentBox
          plotSlug={sites[0]?.slug || ""}
          plotOptions={sites}
          kind="query"
          rows={5}
          label="Ask DLN"
          cta="Send"
        />
      )}
    </>
  );
}
