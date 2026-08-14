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
        Marks and identities. Marketing principles that still hold when the
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
      <p>
        Multi-award-winning for branding and marketing. Nominated brand and
        marketing advisor for Lancashire County Council, consulting with
        businesses across the region. Public speaker and host. Work has
        appeared in print and on screen. A qualified teacher who has lectured
        at universities and design colleges.
      </p>
      <p>
        For the last ten years the practice has sat directly with businesses,
        organisations, and multi-nationals — and with their agencies under NDA
        — to develop brand strategy and online brand engagement. Further detail
        can be given under NDA.
      </p>

      <h2 id="enquiries">Enquiries</h2>
      <p>
        If you have a site, a mark, a facelift, or a brand that needs to be
        made properly — start with the greenhouse if you want to see how we
        work, or write when the domain mail is live.
      </p>
    </article>
  );
}
