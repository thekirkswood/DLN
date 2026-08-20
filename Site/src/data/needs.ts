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
  /** Dave’s institute paragraphs. Cached; not shown while the trial is up. */
  daveCopy: string;
  href: string;
  needs: Need[];
};

/** Three offers. Walk in at any of them. */
export const OFFERS: FacetOffer[] = [
  {
    id: "design",
    name: "Design",
    blurb: "Naming, logo, identity systems.",
    copy: "We formulate high-value brand systems you can actually work with. A name, a logo, and the identity around it, from a first idea or a refresh of what you already have. Before anything is deployed, conceptual marks go into the Sandbox, a controlled simulation where we stress-test the design so it holds for a small business and still holds as you grow. You leave with a durable system, not a look that dates. Come in on Design and we start.",
    daveCopy: "We formulate high-value brand systems by balancing rigorous aesthetic discipline with systemic logic, tailoring our frameworks to the precise maturity stage of the enterprise. Prior to technical deployment, conceptual marks and identity components are introduced to The Sandbox — a controlled simulation environment. Within this architecture, we analyse behavioural patterns and stress-test the design against potential systemic friction, ensuring the visual asset scales naturally as a business matures from its initial launch to a complex corporate structure. This calculated approach ensures the visual asset functions not as a transient aesthetic exercise, but as a durable, highly efficient system that inherently respects human attention and eliminates structural resource waste.",
    href: "/design",
    needs: [
      {
        id: "identity-ground",
        facet: "design",
        label:
          "I have an idea. I need an identity from the ground. Name, mark, and the system around it.",
      },
      {
        id: "identity-refresh",
        facet: "design",
        label:
          "I have something already. I need it refreshed. Fresh ideas for the identity, without throwing away what still holds.",
      },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    blurb: "Plans, counsel, and resources to learn from.",
    copy: "We initiate the advisory process at once through lectures, workshops, and intensive lab sessions, and write a strategic blueprint you can run. Brand strategy, marketing strategy, a year or three years out. The same evidence, logic, and rigour whether you are starting, changing course, or protecting a long-standing organisation. If you want to learn as you go, Various Titles is there. Come in on Strategy and we map it with you.",
    daveCopy: "We initiate our advisory process immediately through structured lectures, workshops, and intensive lab sessions designed to isolate core brand identity variables across a business’s entire lifecycle. Whether calibrating the foundational hypothesis of a pre-start venture, managing a mid-market transformation, or protecting the legacy of a multi-generational organisation, our method relies on empirical evidence, logic, and data analysis to formulate a resilient strategic blueprint. We systematically evaluate every brand architecture through a triple filter to ensure it optimises commercial capital, supports user wellbeing by reducing cognitive load, and establishes a clear, sustainable foundation for future institutional growth.",
    href: "/strategy",
    needs: [
      {
        id: "counsel-growth",
        facet: "strategy",
        label:
          "I need to sit down about bringing in more business. Brand strategy, marketing strategy.",
      },
      {
        id: "long-plan",
        facet: "strategy",
        label:
          "I have an identity. I need it carried into a one-year or three-year plan the work can follow.",
      },
      {
        id: "titles-learn",
        facet: "strategy",
        label:
          "I want to learn. Marketing fundamentals and branding, through Various Titles.",
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
    needs: [
      {
        id: "site-ground",
        facet: "build",
        label:
          "I have an idea. I need it built from the ground through to a working site.",
      },
      {
        id: "site-rebuild",
        facet: "build",
        label:
          "I like the name and the mark. I need the site rebuilt so it can carry them.",
      },
      {
        id: "live-host",
        facet: "build",
        label:
          "I need a live host while we build. I leave notes, you come in, the site changes.",
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
