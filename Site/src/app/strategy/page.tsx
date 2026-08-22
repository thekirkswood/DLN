import { EnquireForm } from "@/components/HomeOffer";

export const metadata = { title: "Consultancy and Strategy" };

const THROUGH = [
  {
    name: "Consultancy Sessions",
    text: "Structured one-to-one or group sessions addressing critical issues, rapid brainstorming, initial research analytics and discovery, robust reviewing and critiquing, and strategic planning.",
  },
  {
    name: "Audits & Reviews",
    text: "Comprehensive evaluation of existing brand systems, design touchpoints, and technical setups to find operational gaps.",
  },
  {
    name: "Direct Feedback & Planning",
    text: "Clear, straight-talking analysis and structured roadmaps to define project momentum, resources, and budgets.",
  },
  {
    name: "Strategy & Blueprints",
    text: "Building the foundational architecture for your business positioning, market direction, and workflow systems.",
  },
  {
    name: "Workshops & Symposiums",
    text: "Immersive, collaborative sessions designed to educate internal teams, break down complex digital challenges, and spark critical decision-making.",
  },
] as const;

export default function StrategyPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Strategy</p>
      <h1 className="page-title">Consultancy and Strategy</h1>
      <p className="body">
        We consult across your entire brand real estate, engineering cohesive
        systems where every thought, physical asset, and digital deployment
        works in total alignment.
      </p>
      <p className="body">
        Whether you need a holistic transformation or targeted support for an
        isolated challenge, we work flexibly across both the whole and the
        constituent parts of your organisation. We can diagnose, structure, and
        advance your project through:
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
        deep, full-project strategy or a rapid, specialist intervention.
      </p>
      <EnquireForm facet="strategy" open />
    </article>
  );
}
