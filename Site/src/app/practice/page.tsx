import { CLIENTS } from "@/data/practice";
import { EnquireForm, OfferJump } from "@/components/HomeOffer";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <article className="practice wrap">
      <p className="kicker">Practice</p>
      <h1>A design hub for brands that need a proper next step.</h1>
      <p className="lede">
        Identities, marketing principles, redesigns, facelifts, and the
        websites that have to carry them. We make the work here, grow it in the
        greenhouse, then move it onto a home of its own.
      </p>

      <div className="practice-pair">
        <div>
          <h2>Dave Kirkwood</h2>
          <p className="body">
            Dave Kirkwood Studio — a multi-award-winning designer for branding
            and marketing, and a former lecturer of branding. The practice is a
            nominated brand and marketing advisor to Lancashire County Council,
            and consults with businesses across the region. Work has been spoken
            in public, hosted, printed, and put on screen.
          </p>
        </div>
        <div>
          <h2>Ewan Kirkwood</h2>
          <p className="body">
            Builder. Developments that belong to the business: integrated
            systems — mapping, delivery and stock — through to AI models for
            the operation, for social, and for brand development. And the
            sites that have to carry them.
          </p>
        </div>
      </div>

      <h2>What we do</h2>
      <p>
        Brands and identities. Marketing principles that still hold when the
        campaign is over. Redesigns and facelifts for sites that have drifted.
        New websites, hosted while they grow, then migrated when they are ready
        to stand alone. Design, Strategy, and Build sit together — come in at
        the one you need. Various Titles is a place for ideas about marketing
        and branding, written so people can learn.
      </p>
      <OfferJump />

      <h2>Selected clients</h2>
      <ul className="client-index">
        {CLIENTS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <h2>The work</h2>
      <p className="body">
        For the last ten years that work has sat directly with businesses,
        organisations, and multi-nationals — and with their agencies, under NDA
        — on brand strategy and how the brand behaves online. Further detail
        can be given under NDA.
      </p>

      <h2 id="enquiries">Enquiries</h2>
      <p className="body">
        Tell us who you are and what you need. We’ll write back, and make you
        an account if that’s the next step.
      </p>
      <EnquireForm />
    </article>
  );
}
