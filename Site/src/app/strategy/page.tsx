import { EnquireForm } from "@/components/HomeOffer";
import { linesFor } from "@/data/worklines";
import { labHostFromHeaders } from "@/lib/lab";

export const metadata = { title: "Consultancy and Strategy" };

export default function StrategyPage() {
  const lines = linesFor("strategy");
  const lab = labHostFromHeaders();
  return (
    <article className="stage-page wrap">
      <p className="kicker">Strategy</p>
      <h1 className="page-title">Consultancy and Strategy</h1>
      <p className="body">
        Sit down with branding expert Dave Kirkwood to discuss: Brand strategy
        is the brand to the core: who you are, who it is for and where you
        want to be. Marketing is how it goes out. Working sessions at three
        depths.
      </p>
      <EnquireForm facet="strategy" open lab={lab} />
      <ul className="strategy-through">
        {lines.map((line) => (
          <li key={line.id}>
            <strong>{line.name}</strong>
            {" — "}
            {line.lead}
          </li>
        ))}
      </ul>
    </article>
  );
}
