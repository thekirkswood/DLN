import { EnquireForm } from "@/components/HomeOffer";
import { linesFor } from "@/data/worklines";
import { labHostFromHeaders } from "@/lib/lab";

export const metadata = { title: "Design" };

export default function DesignPage() {
  const lines = linesFor("design");
  const lab = labHostFromHeaders();
  return (
    <article className="stage-page wrap">
      <p className="kicker">Design</p>
      <h1 className="page-title">Design</h1>
      <p className="body">
        A logo that still holds as you grow. One identity on the card, the
        phone, and the laptop. Print you can send. Packs people open. Screens
        they can use.
      </p>
      <EnquireForm facet="design" open lab={lab} />
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
