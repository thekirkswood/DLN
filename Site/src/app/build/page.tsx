import { EnquireForm } from "@/components/HomeOffer";

export const metadata = { title: "Website Builds and hosting" };

const THROUGH = [
  {
    name: "E-Commerce & Shopping Sites",
    text: "High-performance, secure digital transaction engines meticulously engineered for fast conversion rates and smooth user flows.",
  },
  {
    name: "Business & Corporate Websites",
    text: "Dynamic, functional corporate web presences structured to establish authoritative positioning and drive conversion.",
  },
  {
    name: "Portfolio Websites",
    text: "Immersive, premium visual environments specifically designed to showcase creative work, architectural portfolios, or case studies.",
  },
  {
    name: "Secure Backend Dashboards",
    text: "High-utility, bespoke administrative panels built for clear control, effortless updates, and total data transparency.",
  },
  {
    name: "Ironclad Hosting & Infrastructure",
    text: "Advanced server deployment, ongoing security management, API integrations, and proactive vulnerability protection playbooks.",
  },
] as const;

export default function BuildPage() {
  return (
    <article className="stage-page wrap">
      <p className="kicker">Websites</p>
      <h1 className="page-title">Website Builds and hosting</h1>
      <p className="body">
        We build across digital environments, engineering cohesive systems
        where functional front-end interfaces, custom e-commerce engines, and
        high-utility backend dashboards work in total alignment.
      </p>
      <p className="body">
        Whether you need a holistic technical rebuild or targeted
        infrastructure development for an isolated project, we work flexibly
        across both the whole and the constituent parts of your online
        presence. We can diagnose, structure, and advance your project through:
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
        complete ground-up site engineering overhaul or a rapid, specialist
        technical intervention.
      </p>
      <EnquireForm facet="build" open />
    </article>
  );
}
