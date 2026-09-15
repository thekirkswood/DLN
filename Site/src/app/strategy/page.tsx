import { EnquireForm } from "@/components/HomeOffer";
import { linesFor } from "@/data/worklines";

export const metadata = { title: "Consultancy and Strategy" };

export default function StrategyPage() {
  const lines = linesFor("strategy");
  return (
    <article className="stage-page wrap">
      <p className="kicker">Strategy</p>
      <h1 className="page-title">Consultancy and Strategy</h1>
      <p className="body">
        Who you are, who it is for, and where you want to be — written so the
        rest of the work has somewhere to sit. A working session, an audit, or
        a plan you can run.
      </p>
      <ul className="strategy-through">
        {lines.map((line) => (
          <li key={line.id}>
            <strong>{line.name}</strong>
            {" — "}
            {line.lead}
          </li>
        ))}
      </ul>
      <h2 className="section-head">You do not need a finished brief.</h2>
      <p className="body">
        Write to us. We will say what the work is, and what it is not.
      </p>
      <EnquireForm facet="strategy" open />
    </article>
  );
}
