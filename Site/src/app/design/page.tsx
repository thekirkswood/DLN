import { EnquireForm, OfferJump } from "@/components/HomeOffer";

export const metadata = { title: "Design" };

export default function DesignPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Design</p>
      <h1 className="page-title">An identity that can carry the work.</h1>
      <p className="lede">
        Naming, logo, identity systems. Design Lab North are the people who sit
        down and make that with you. Come in here if this is what you need now
        — Strategy and Build sit beside it, not after it.
      </p>
      <OfferJump current="design" />
      <EnquireForm />
    </article>
  );
}
