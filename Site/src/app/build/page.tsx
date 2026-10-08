import { EnquireForm } from "@/components/HomeOffer";
import { linesFor } from "@/data/worklines";
import { labHostFromHeaders } from "@/lib/lab";

export const metadata = { title: "Website Builds and hosting" };

export default function BuildPage() {
  const lines = linesFor("build");
  const lab = labHostFromHeaders();
  return (
    <article className="stage-page wrap">
      <p className="kicker">Build</p>
      <h1 className="page-title">Website Builds and hosting</h1>
      <p className="body">
        A gallery, a shop, a page, a diary — a simple site, done properly.
        Software people use. Your live site stays up while the next one is
        built beside it. We host it while it grows.
      </p>
      <EnquireForm facet="build" open lab={lab} />
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
