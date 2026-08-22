import { EnquireForm } from "@/components/HomeOffer";

export const metadata = { title: "Design" };

const THROUGH = [
  {
    name: "Individual Assets & Logos",
    text: "Precision-crafted typography, standalone graphic assets, and core brand marks built to endure.",
  },
  {
    name: "Design for Print",
    text: "High-end stationery, editorial print design, signage layouts, corporate literature, and commercial marketing materials.",
  },
  {
    name: "Tactile Packaging Design",
    text: "Three-dimensional box, label, structural container, and premium commercial unboxing layout engineering.",
  },
  {
    name: "Multi-Platform Design Systems",
    text: "Scalable component libraries, digital asset kits, and typography blueprints that bridge print and screen seamlessly.",
  },
  {
    name: "Master Identity Guidelines",
    text: "Strict operational rules protecting the structural principles, typography rules, ethics, and protocols of your brand.",
  },
] as const;

export default function DesignPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Design</p>
      <h1 className="page-title">Design</h1>
      <p className="body">
        We design across physical and digital dimensions, engineering cohesive
        systems where individual visual assets, tactile packaging, and screen
        layouts work in total alignment.
      </p>
      <p className="body">
        Whether you need a holistic visual system overhaul or targeted design
        execution for an isolated project, we work flexibly across both the
        whole and the constituent parts of your brand identity. We can
        diagnose, structure, and advance your project through:
      </p>
      <ul className="strategy-through">
        {THROUGH.map((item) => (
          <li key={item.name}>
            <strong>{item.name}</strong>
            {" — "}
            {item.text}
          </li>
        ))}
      </ul>
      <h2 className="section-head">Let’s Establish Your Scope</h2>
      <p className="body">
        You do not need to have a finalised project brief to reach out. An
        initial, direct conversation via email is all it takes to map out your
        current situation and establish precisely what you need. From that
        first touchpoint, we will help define whether your business requires a
        deep, full-project design system or a rapid, individual asset
        intervention.
      </p>
      <EnquireForm facet="design" open />
    </article>
  );
}
