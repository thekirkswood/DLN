import Link from "next/link";
import { EnquireForm, OfferJump } from "@/components/HomeOffer";
import { enterUrlFor, plotBySlug } from "@/lib/plots";
import { labHostFromHeaders, labStationPath } from "@/lib/lab";

export const metadata = { title: "Strategy" };

export default async function StrategyPage() {
  const titles = await plotBySlug("various-titles");
  const lab = labHostFromHeaders();
  const here =
    lab && titles?.lab?.housePath ? labStationPath("various-titles") : null;
  const live = titles ? enterUrlFor(titles) : null;

  return (
    <article className="stage-page wrap">
      <p className="kicker">Strategy</p>
      <h1 className="page-title">How the identity carries forward.</h1>
      <p className="lede">
        Brand strategy and marketing strategy. A one-year plan, a three-year
        plan. Sit down about growth. Come in here if this is what you need
        now — Design and Build sit beside it.
      </p>
      <OfferJump current="strategy" />
      <h2>Various Titles</h2>
      <p className="body">
        A place for ideas: marketing and branding, written plainly. Sit down,
        and take the pages that belong with that conversation. Enter when you
        want them.
      </p>
      <p className="body">
        {here ? (
          <Link href={here}>Enter Various Titles</Link>
        ) : live ? (
          <a href={live}>Enter Various Titles</a>
        ) : null}
        {here || live ? " · " : null}
        <Link href="/greenhouse/various-titles">The greenhouse story</Link>.
      </p>
      <EnquireForm facet="strategy" />
    </article>
  );
}
