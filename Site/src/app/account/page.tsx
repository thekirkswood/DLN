import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { plotsOnAccount, allPlots, servicePlots } from "@/lib/plots";
import { isStudio, listClients, type PublicUser } from "@/lib/auth";
import {
  invoicesVisibleTo,
  rollDueInvoices,
  getPayRail,
  paymentByInvoice,
  railIsReady,
  liveCatalogue,
  listRolls,
  rollsForUser,
  getOnlineRail,
} from "@/lib/billing";
import { ProfileHead } from "@/components/AccountBilling";
import { StudioDesk } from "@/components/StudioDesk";
import { ClientAccount } from "@/components/ClientAccount";
import { kitsForUser } from "@/lib/epk";
import { kitCopy } from "@/lib/epk-copy";
import { commentsFor, plansFor } from "@/lib/plans";
import { bookingsForUser } from "@/lib/diary";
import { receiptsVisibleTo } from "@/lib/receipts";
import { getSettings } from "@/lib/settings";
import { listEnquiries } from "@/lib/enquiries";
import { listNotices } from "@/lib/notices";
import { listAttempts, listOpenInstances, listVisits } from "@/lib/watch";
import { listCaptures } from "@/lib/captures";
import { grantDueTokens, ledgersVisibleTo, tokenCosts } from "@/lib/tokens";
import { listBlocks } from "@/lib/block";
import { absorbTrapWeb, listTrapWeb } from "@/lib/trap-web";
import { listAppeals } from "@/lib/appeals";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function kitTilesFor(user: PublicUser) {
  return kitsForUser(user).map((id) => {
    const copy = kitCopy(id);
    return { id, name: copy.name, kicker: copy.kicker, lede: copy.lede };
  });
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: { view?: string; kit?: string; desk?: string; who?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  await rollDueInvoices();
  await grantDueTokens();
  const costs = await tokenCosts();
  const studio = isStudio(user);
  const plots = await allPlots();
  const invoices = await invoicesVisibleTo(user);
  const comments = await commentsFor(user);
  const captures = await listCaptures(user);
  const plans = await plansFor(user);
  const claims = await paymentByInvoice();
  const rail = await getPayRail();
  const settings = await getSettings();
  const view = searchParams?.view || "";
  const desk = searchParams?.desk || "";
  const who = (searchParams?.who || "").trim();

  if (studio && desk === "their") {
    const people = await listClients();
    const subject = people.find((p) => p.id === who);
    if (!subject) redirect("/account?desk=clients");
    const sites = plotsOnAccount(subject, plots);
    const theirInvoices = await invoicesVisibleTo(subject);
    const theirComments = await commentsFor(subject);
    const theirKitTiles = kitTilesFor(subject);
    const kitIds = theirKitTiles.map((row) => row.id);
    const locked =
      searchParams?.kit && kitIds.includes(searchParams.kit)
        ? searchParams.kit
        : kitIds[0];
    const lookHref = `/account?desk=their&who=${encodeURIComponent(subject.id)}`;
    return (
      <article className="account wrap">
        <p className="kicker">Their account</p>
        <ProfileHead
          displayName={subject.displayName}
          userId={subject.id}
          hasAvatar={Boolean(subject.avatar)}
          readOnly
        />
        <p className="body account-look">
          This is the account {subject.displayName} sits in — Sites, patch notes,
          invoices, the rest. You are still signed in as studio.{" "}
          <a href={`/account?desk=clients&who=${encodeURIComponent(subject.id)}`}>
            Close
          </a>
        </p>
        <ClientAccount
          view={view}
          kit={searchParams?.kit}
          look
          lookHref={lookHref}
          sites={sites}
          invoices={theirInvoices}
          claims={claims}
          rolls={await rollsForUser(subject)}
          receipts={await receiptsVisibleTo(subject)}
          sittings={await bookingsForUser(subject.id)}
          ledgers={await ledgersVisibleTo(subject)}
          news={theirComments.filter((c) => c.kind === "news")}
          queries={theirComments.filter((c) => c.kind === "query")}
          kitTiles={theirKitTiles}
          lockedKit={locked}
          railReady={railIsReady(rail)}
          graceDays={settings.graceDays}
        />
        <p className="account-out">
          <a href="/logout">Sign out</a>
        </p>
      </article>
    );
  }

  const ledgers = await ledgersVisibleTo(user);
  const sites = plotsOnAccount(user, plots);
  const sittings = studio ? [] : await bookingsForUser(user.id);
  const receipts = studio ? [] : await receiptsVisibleTo(user);
  const rolls = studio ? await listRolls() : await rollsForUser(user);
  const kitTiles = kitTilesFor(user);
  const kitIds = kitTiles.map((row) => row.id);
  const locked =
    searchParams?.kit && kitIds.includes(searchParams.kit) ? searchParams.kit : kitIds[0];
  const studioDue = invoices.filter((i) => i.status === "due").length;

  const studioBook = studio
    ? {
        people: await listClients(),
        plots: servicePlots(plots),
        enquiries: await listEnquiries(),
        catalogue: await liveCatalogue(),
        rolls,
        online: await getOnlineRail(),
        notices: await listNotices(),
        traps: await listOpenInstances(),
        visits: await listVisits(),
        attempts: await listAttempts(),
        blocked: await listBlocks(),
        trapWeb: await absorbTrapWeb().then(() => listTrapWeb()),
        appeals: await listAppeals(),
      }
    : null;

  const studioUnread = studioBook
    ? studioBook.notices.filter((n) => !n.read).length + studioDue
    : 0;

  return (
    <article className="account wrap">
      <p className="kicker">Account</p>
      <ProfileHead
        displayName={user.displayName}
        userId={user.id}
        hasAvatar={Boolean(user.avatar)}
      />

      {studio ? (
        <ul className="epk-tiles account-tiles">
          <li>
            <a href="/account?desk=houses" aria-current={desk === "houses" ? "page" : undefined}>
              <strong>Sites</strong>
              <span>{String(sites.length)}</span>
            </a>
          </li>
          <li>
            <a href="/account?desk=epk" aria-current={desk === "epk" ? "page" : undefined}>
              <strong>Press kits</strong>
              <span>{String(kitTiles.length)}</span>
            </a>
          </li>
          <li>
            <a href="/account?desk=assets" aria-current={desk === "assets" ? "page" : undefined}>
              <strong>Assets</strong>
              <span>Files</span>
            </a>
          </li>
          <li>
            <a href="/account?desk=pay" aria-current={desk === "pay" ? "page" : undefined}>
              <strong>Payments</strong>
              <span>Subs and invoices</span>
              {studioDue ? <em className="tile-bubble">{studioDue}</em> : null}
            </a>
          </li>
          <li>
            <a
              href="/account?desk=notifications"
              aria-current={desk === "notifications" ? "page" : undefined}
            >
              <strong>Notifications</strong>
              <span>Updates</span>
              {studioUnread ? <em className="tile-bubble">{studioUnread}</em> : null}
            </a>
          </li>
        </ul>
      ) : null}

      {studio ? (
        <section className="token-well">
          <h2>Tokens</h2>
          <p className="body bill-note">
            Leave a note is free. Instant update spends {costs.pingCost} tokens to
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
            attempts={studioBook.attempts}
            blocked={studioBook.blocked}
            trapWeb={studioBook.trapWeb}
            appeals={studioBook.appeals}
          />
        </section>
      ) : null}

      {!studio ? (
        <ClientAccount
          view={view}
          kit={searchParams?.kit}
          sites={sites}
          invoices={invoices}
          claims={claims}
          rolls={rolls}
          receipts={receipts}
          sittings={sittings}
          ledgers={ledgers}
          news={comments.filter((c) => c.kind === "news")}
          queries={comments.filter((c) => c.kind === "query")}
          kitTiles={kitTiles}
          lockedKit={locked}
          railReady={railIsReady(rail)}
          graceDays={settings.graceDays}
        />
      ) : null}

      <p className="account-out">
        <a href="/logout">Sign out</a>
      </p>
    </article>
  );
}
