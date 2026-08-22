export type Facet = "design" | "strategy" | "build";

export type Need = {
  id: string;
  facet: Facet;
  label: string;
};

export type FacetOffer = {
  id: Facet;
  name: string;
  blurb: string;
  /** Live column body. Trial copy (Ewan, 2026-08-19) until locked. */
  copy: string;
  /** Home column as a list. When set, the home plate shows these lines, not `copy`. */
  points?: string[];
  /** Heading on the home columns only. Offer pages keep `name`. */
  homeName?: string;
  /** Home column link. Defaults to Contact {homeName || name}. */
  homeCta?: string;
  /** Dave’s institute paragraphs. Cached; not shown while the trial is up. */
  daveCopy: string;
  href: string;
  needs: Need[];
};

/** Home left-to-right. Offer ids stay design / strategy / build. */
export const HOME_COLUMNS: Facet[] = ["strategy", "design", "build"];

/** Three offers. Walk in at any of them. */
export const OFFERS: FacetOffer[] = [
  {
    id: "design",
    name: "Design",
    blurb: "Naming, logo, identity systems.",
    copy: "We formulate high-value brand systems you can actually work with. A name, a logo, and the identity around it, from a first idea or a refresh of what you already have. Before anything is deployed, conceptual marks go into the Sandbox, a controlled simulation where we stress-test the design so it holds for a small business and still holds as you grow. You leave with a durable system, not a look that dates. Come in on Design and we start.",
    points: [
      "Logos",
      "Brand Identity Systems",
      "UI",
      "Design for Print",
      "Packaging",
    ],
    daveCopy: "We formulate high-value brand systems by balancing rigorous aesthetic discipline with systemic logic, tailoring our frameworks to the precise maturity stage of the enterprise. Prior to technical deployment, conceptual marks and identity components are introduced to The Sandbox — a controlled simulation environment. Within this architecture, we analyse behavioural patterns and stress-test the design against potential systemic friction, ensuring the visual asset scales naturally as a business matures from its initial launch to a complex corporate structure. This calculated approach ensures the visual asset functions not as a transient aesthetic exercise, but as a durable, highly efficient system that inherently respects human attention and eliminates structural resource waste.",
    href: "/design",
    needs: [
      {
        id: "design-assets-logo",
        facet: "design",
        label:
          "I need individual assets or a new core logo mark engineered for our brand.",
      },
      {
        id: "design-print",
        facet: "design",
        label:
          "We need comprehensive design for print (stationery, literature, or signage layouts).",
      },
      {
        id: "design-packaging",
        facet: "design",
        label:
          "We require high-end, three-dimensional packaging and tactile unboxing design.",
      },
      {
        id: "design-multi-platform",
        facet: "design",
        label:
          "Our brand requires a scalable multi-platform design system to bridge print and screen.",
      },
      {
        id: "design-guidelines",
        facet: "design",
        label:
          "We need an audit or update of our existing master identity guidelines and brand protocols.",
      },
      {
        id: "design-none-above",
        facet: "design",
        label:
          "None of the above (Tell us your specific design challenge in the box below).",
      },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    blurb: "Plans, counsel, and resources to learn from.",
    copy: "We initiate the advisory process at once through lectures, workshops, and intensive lab sessions, and write a strategic blueprint you can run. Brand strategy, marketing strategy, a year or three years out. The same evidence, logic, and rigour whether you are starting, changing course, or protecting a long-standing organisation. If you want to learn as you go, Various Titles is there. Come in on Strategy and we map it with you.",
    points: [
      "Brand Strategy",
      "Marketing Strategy",
      "Online Strategy",
      "Start-up Strategy",
      "Brand Audits",
      "Over-arching Strategic Consultancy",
    ],
    daveCopy: "We initiate our advisory process immediately through structured lectures, workshops, and intensive lab sessions designed to isolate core brand identity variables across a business’s entire lifecycle. Whether calibrating the foundational hypothesis of a pre-start venture, managing a mid-market transformation, or protecting the legacy of a multi-generational organisation, our method relies on empirical evidence, logic, and data analysis to formulate a resilient strategic blueprint. We systematically evaluate every brand architecture through a triple filter to ensure it optimises commercial capital, supports user wellbeing by reducing cognitive load, and establishes a clear, sustainable foundation for future institutional growth.",
    href: "/strategy",
    homeCta: "Contact our consultants",
    needs: [
      {
        id: "consultancy-session",
        facet: "strategy",
        label:
          "I need a Consultancy Session (one-to-one or group session for brainstorming, research analytics, critiquing, or planning).",
      },
      {
        id: "startup-blueprint",
        facet: "strategy",
        label:
          "I am a startup needing a complete brand identity and strategy blueprint.",
      },
      {
        id: "identity-outdated",
        facet: "strategy",
        label:
          "We are established, but our visual identity and logo look outdated.",
      },
      {
        id: "print-packaging-scale",
        facet: "strategy",
        label:
          "Our print and packaging layouts do not match our digital scale.",
      },
      {
        id: "ecommerce-outgrown",
        facet: "strategy",
        label:
          "We are outgrowing our e-commerce engine and need a robust shopping site.",
      },
      {
        id: "business-site-dashboard",
        facet: "strategy",
        label:
          "We need a high-performance business website with a clean backend dashboard.",
      },
      {
        id: "infra-audit",
        facet: "strategy",
        label:
          "Our global digital infrastructure requires an audit for security and hosting.",
      },
      {
        id: "workshop-review",
        facet: "strategy",
        label:
          "We need an independent review or strategy workshop for our team.",
      },
      {
        id: "none-above",
        facet: "strategy",
        label:
          "None of the above (Tell us your specific challenge in the box below).",
      },
    ],
  },
  {
    id: "build",
    name: "Build",
    blurb: "New sites, rebuilds, facelifts.",
    copy: "We construct the site that has to carry it. New, rebuild, or facelift, through an 8-Phase Process in the Greenhouse, a live-hosted environment where you watch and co-author as it grows. You leave notes. We come in. The site changes. When it is ready it can move onto a domain of your own, still tethered to campus so we can re-enter without breaking live work. The method is the same at every scale. Come in on Build if the site is what you need now.",
    daveCopy: "We construct enduring digital infrastructure, translating strategic hypotheses into integrated web platforms and commerce channels built to survive generational shifts. Managed via a proprietary 8-Phase Process, developments are incubated within The Greenhouse, a live-hosted environment where business stakeholders — from early-stage founders to enterprise boards — can observe and co-author technical iterations in real time. This methodology is entirely scale-agnostic and lifecycle-agnostic, applying identical analytical precision to early-stage startups and multi-generational global corporations alike. Following deployment, platforms remain tethered to our campus through a continuous diagnostic loop, permitting immediate re-entry for hot-swapping features and structural problem-solving without interrupting live operations.",
    href: "/build",
    homeName: "Websites",
    homeCta: "Contact the web team",
    points: [
      "Website Builds",
      "Website Modelling",
      "New sites",
      "Rebuilds",
      "Facelifts",
      "Live hosts",
    ],
    needs: [
      {
        id: "web-ecommerce",
        facet: "build",
        label:
          "We need a high-performance e-commerce shopping website engineered for our brand.",
      },
      {
        id: "web-corporate",
        facet: "build",
        label:
          "We require a robust corporate business website with a clean backend dashboard.",
      },
      {
        id: "web-portfolio",
        facet: "build",
        label:
          "We want a premium portfolio website built to showcase our creative projects.",
      },
      {
        id: "web-infra-audit",
        facet: "build",
        label:
          "Our existing digital infrastructure requires an audit for technical security or hosting updates.",
      },
      {
        id: "web-api-dashboard",
        facet: "build",
        label:
          "We have a complex API or custom data dashboard integration problem that needs resolving.",
      },
      {
        id: "web-none-above",
        facet: "build",
        label:
          "None of the above (Tell us your specific technical challenge in the box below).",
      },
    ],
  },
];

/** Seven RUUN papers. Cropped from Dave’s strip. */
export const HOME_MODULES = [
  { file: "01.png", name: "Comms" },
  { file: "02.png", name: "System Mapping" },
  { file: "03.png", name: "8 Process" },
  { file: "04.png", name: "Workbench" },
  { file: "05.png", name: "A.P.E.S." },
  { file: "06.png", name: "Identity systems toolkits" },
  { file: "07.png", name: "Solport Sessions" },
] as const;

export function needById(id: string): Need | undefined {
  for (const offer of OFFERS) {
    const need = offer.needs.find((n) => n.id === id);
    if (need) return need;
  }
  return undefined;
}

export function offerById(id: string): FacetOffer | undefined {
  return OFFERS.find((o) => o.id === id);
}
