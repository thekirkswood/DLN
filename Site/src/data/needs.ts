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
  href: string;
  needs: Need[];
};

/** Three offers. Walk in at any of them. */
export const OFFERS: FacetOffer[] = [
  {
    id: "design",
    name: "Design",
    blurb: "Naming, logo, identity systems.",
    href: "/design",
    needs: [
      {
        id: "identity-ground",
        facet: "design",
        label:
          "I have an idea. I need an identity from the ground — name, mark, and the system around it.",
      },
      {
        id: "identity-refresh",
        facet: "design",
        label:
          "I have something already. I need it refreshed — fresh ideas for the identity, without throwing away what still holds.",
      },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    blurb: "Plans, counsel, and resources to learn from.",
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
          "I want to learn — marketing fundamentals and branding, through Various Titles.",
      },
    ],
  },
  {
    id: "build",
    name: "Build",
    blurb: "New sites, rebuilds, facelifts.",
    href: "/build",
    needs: [
      {
        id: "site-ground",
        facet: "build",
        label:
          "I have an idea. I need it built from the ground — through to a working site.",
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
          "I need a live host while we build — I leave notes, you come in, the site changes.",
      },
    ],
  },
];

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
