import Link from "next/link";
import { EnquireForm, OfferJump } from "@/components/HomeOffer";

export const metadata = { title: "Strategy" };

export default function StrategyPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Strategy</p>
      <h1 className="page-title">How the identity carries forward.</h1>
      <p className="lede">
        Brand strategy and marketing strategy. A one-year plan, a three-year
        plan. Sit down about growth — and take the resources that belong with
        that conversation, if you want them. Come in here if this is what you
        need now — Design and Build sit beside it.
      </p>
      <OfferJump current="strategy" />
      <h2>Various Titles</h2>
      <p className="body">
        A resource centre, and a life’s work: marketing fundamentals, a
        branding book, and further facets as they are written. A place for
        people to learn. A consultation can unlock the sections that meeting
        covered; you can then take the full resource if you want it. When we
        sit down on something that is not in the book yet, we write it — and
        the resources grow.
      </p>
      <p className="body">
        <Link href="/greenhouse/various-titles">Various Titles in the greenhouse</Link>.
      </p>
      <EnquireForm />
    </article>
  );
}
