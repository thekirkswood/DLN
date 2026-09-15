import { EnquireForm } from "@/components/HomeOffer";
import { linesFor } from "@/data/worklines";

export const metadata = { title: "Design" };

export default function DesignPage() {
  const lines = linesFor("design");
  return (
    <article className="stage-page wrap">
      <p className="kicker">Design</p>
      <h1 className="page-title">Design</h1>
      <p className="body">
        A logo that still holds as you grow. One identity on the card, the
        phone, and the laptop. Print you can send. Packs people open. Screens
        they can use.
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
      <EnquireForm facet="design" open />
    </article>
  );
}
