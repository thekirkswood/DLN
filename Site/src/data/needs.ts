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
    copy: "A name, a logo, and the identity around it — from a first idea, or a refresh of what you already run. You leave with a system that still holds as you grow, not a look that dates. Come in on Design and we start.",
    points: [
      "Logos",
      "Brand Identity Systems",
      "UI",
      "Design for Print",
      "Packaging",
    ],
    daveCopy: "We formulate high-value brand systems by balancing rigorous aesthetic discipline with systemic logic, tailoring our frameworks to the precise maturity stage of the enterprise. Prior to technical deployment, conceptual marks and identity components are introduced to The Sandbox — a controlled simulation environment. Within this architecture, we analyse behavioural patterns and stress-test the design against potential systemic friction, ensuring the visual asset scales naturally as a business matures from its initial launch to a complex corporate structure. This calculated approach ensures the visual asset functions not as a transient aesthetic exercise, but as a durable, highly efficient system that inherently respects human attention and eliminates structural resource waste.",
    href: "/design",
    homeCta: "Contact Design",
    needs: [
      {
        id: "design-assets-logo",
        facet: "design",
        label: "I need a logo that will still hold as we grow.",
      },
      {
        id: "design-print",
        facet: "design",
        label: "I need print — stationery, literature, or signage.",
      },
      {
        id: "design-packaging",
        facet: "design",
        label: "I need packaging: box, label, and the unboxing.",
      },
      {
        id: "design-multi-platform",
        facet: "design",
        label: "I need screens that match the print — one system.",
      },
      {
        id: "design-guidelines",
        facet: "design",
        label: "I need our identity guidelines audited or updated.",
      },
      {
        id: "design-none-above",
        facet: "design",
        label: "None of the above — I’ll write it below.",
      },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    blurb: "Plans, counsel, and resources to learn from.",
    copy: "A working session, a workshop, or a written plan you can run — start-up, a change of course, or a long-standing organisation. Brand, marketing, audits. Come in on Strategy and we map it with you.",
    points: [
      "How we work",
      "Start-up Strategy",
      "Brand Strategy",
      "Marketing Strategy",
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
        label: "I need a working session — one-to-one or with the group.",
      },
      {
        id: "startup-blueprint",
        facet: "strategy",
        label: "I am starting out and need a brand and a plan.",
      },
      {
        id: "identity-outdated",
        facet: "strategy",
        label: "We are established, but the identity looks dated.",
      },
      {
        id: "print-packaging-scale",
        facet: "strategy",
        label: "Our print and pack do not match the site.",
      },
      {
        id: "ecommerce-outgrown",
        facet: "strategy",
        label: "We have outgrown the shop and need a better one.",
      },
      {
        id: "business-site-dashboard",
        facet: "strategy",
        label: "We need a business site with a desk behind it.",
      },
      {
        id: "infra-audit",
        facet: "strategy",
        label: "We need the hosting and security looked at.",
      },
      {
        id: "workshop-review",
        facet: "strategy",
        label: "We need an independent review or a workshop for the team.",
      },
      {
        id: "social-supplier",
        facet: "strategy",
        label: "We are applying to the approved supplier list.",
      },
      {
        id: "none-above",
        facet: "strategy",
        label: "None of the above — I’ll write it below.",
      },
    ],
  },
  {
    id: "build",
    name: "Build",
    blurb: "Simple sites, applications, and the infrastructure they run on.",
    copy: "The site that has to carry it — new, rebuild, or facelift. You leave a note. We come in. The live site stays up. When it is ready it can move onto a domain of your own, and we still host it while it grows. Come in on Build if the site is what you need now.",
    daveCopy: "We construct enduring digital infrastructure, translating strategic hypotheses into integrated web platforms and commerce channels built to survive generational shifts. Managed via a proprietary 8-Phase Process, developments are incubated within The Greenhouse, a live-hosted environment where business stakeholders — from early-stage founders to enterprise boards — can observe and co-author technical iterations in real time. This methodology is entirely scale-agnostic and lifecycle-agnostic, applying identical analytical precision to early-stage startups and multi-generational global corporations alike. Following deployment, platforms remain tethered to our campus through a continuous diagnostic loop, permitting immediate re-entry for hot-swapping features and structural problem-solving without interrupting live operations.",
    href: "/build",
    homeCta: "Contact the web team",
    points: [
      "Simple sites",
      "Interactive Workspaces",
      "Custom Web Applications",
      "System Modernization",
      "Systems",
    ],
    needs: [
      {
        id: "web-simple-site",
        facet: "build",
        label: "We need a simple site, done properly.",
      },
      {
        id: "web-ecommerce",
        facet: "build",
        label: "We need a shop that can take the orders.",
      },
      {
        id: "web-corporate",
        facet: "build",
        label: "We need a business site with a desk behind it.",
      },
      {
        id: "web-portfolio",
        facet: "build",
        label: "We need a site that shows the work.",
      },
      {
        id: "web-infra-audit",
        facet: "build",
        label: "Our live site stays up — we need the next one beside it.",
      },
      {
        id: "web-api-dashboard",
        facet: "build",
        label: "We need sign-in, data, or the desk behind the site.",
      },
      {
        id: "web-none-above",
        facet: "build",
        label: "None of the above — I’ll write it below.",
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
