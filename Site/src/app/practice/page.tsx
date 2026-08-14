import { CLIENTS } from "@/data/practice";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <article className="practice wrap">
      <p className="kicker">Practice</p>
      <h1>A design hub, not a factory.</h1>
      <p className="lede">
        Design Lab North is where brand, marketing, and the website meet.
        Identities, principles, redesigns, facelifts, and new builds — made
        here, shown in the greenhouse, then moved onto a home of their own.
      </p>

      <h2>What we do</h2>
      <p>
        Brands and identities. Marketing principles that still hold when the
        campaign is over. Redesigns and facelifts for sites that have drifted.
        New websites, hosted while they grow, then migrated when they are
        ready to stand alone.
      </p>

      <h2>Selected clients</h2>
      <ul className="client-index">
        {CLIENTS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <h2>The work</h2>
      <p className="body">
        The work is identities, marketing principles, redesigns, facelifts, and
        the websites that have to carry them. Dave Kirkwood — Dave Kirkwood
        Studio, formerly Walsh Simmons — is a multi-award-winning designer for
        branding and marketing, and a former lecturer of branding. The practice
        is a nominated brand and marketing advisor to Lancashire County
        Council, and consults with businesses across the region. Work has been
        spoken in public, hosted, printed, and put on screen.
      </p>
      <p className="body">
        For the last ten years that work has sat directly with businesses,
        organisations, and multi-nationals — and with their agencies, under NDA
        — on brand strategy and how the brand behaves online. Further detail
        can be given under NDA.
      </p>

      <h2 id="enquiries">Enquiries</h2>
      <p className="body">
        A site, a brand, a facelift that needs to be made properly — write to{" "}
        <a className="mail" href="mailto:build@designlabnorth.com">
          build@designlabnorth.com
        </a>
        . Look at the greenhouse if you want to see how we work first.
      </p>
    </article>
  );
}
