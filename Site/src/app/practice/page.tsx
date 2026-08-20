import { CLIENTS } from "@/data/practice";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <article className="practice wrap">
      <p className="kicker">Practice</p>
      <h1>Designing High-Value Brand Ecosystems</h1>
      <p className="lede">
        DLN creates Identities, marketing strategies, brand redesigns and
        facelifts, websites and design for print.
      </p>

      <div className="practice-pair">
        <div>
          <h2>Dave Kirkwood</h2>
          <p className="body">
            Dave Kirkwood is a multi-award-winning designer for branding and
            marketing, and a former lecturer. A brand and marketing advisor to
            Lancashire County Council, and consultant to businesses across the
            region. Public speaker, host, and work featured in multiple
            publications on TV and radio.
          </p>
        </div>
        <div>
          <h2>Ewan Kirkwood</h2>
          <p className="body">
            Builder. Developments that belong to the business: integrated
            systems — mapping, delivery and stock — through to AI models for
            the operation, for social, and for brand development. The sites
            are built here, and they are built well.
          </p>
        </div>
      </div>

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
    </article>
  );
}
