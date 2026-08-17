import { EnquireForm, OfferJump } from "@/components/HomeOffer";

export const metadata = { title: "Build" };

export default function BuildPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Build</p>
      <h1 className="page-title">The site that has to carry it.</h1>
      <p className="lede">
        New sites, rebuilds, facelifts. Come in here if the site is what you
        need now — Design and Strategy sit beside it, not in front of it.
      </p>
      <OfferJump current="build" />
      <p className="body">
        While a site grows it lives on a Design Lab North host. You leave notes
        on the live copy. We come in, the site changes, and you see it. When
        the work is a proper step, it moves onto a home of its own — your
        domain, your server — and we keep coming in the same way from our
        desk.
      </p>
      <p className="body">
        An initial sit-down, an initial build, then the live host while it
        grows. Branding and marketing sit with the practice and are charged
        for that work. We do not publish a price list here — tell us what you
        need.
      </p>
      <EnquireForm />
    </article>
  );
}
