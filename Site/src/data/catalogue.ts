export type Stage = "design" | "strategy" | "build";
export type Cadence = "once" | "weekly" | "monthly";
export type TitlesGrant = "section" | "full";

export type CatalogueItem = {
  id: string;
  stage: Stage;
  name: string;
  blurb: string;
  /** Standing amount for this entry. Desk overlay in `_meta/billing/prices.json`. Empty / 0 is £0, not a global default. */
  amountGbp: number;
  cadence: Cadence;
  plotBound?: boolean;
  titlesGrant?: TitlesGrant;
  /** One-off named charge, unique to a situation. Lives in `_meta/billing/extras.json`. */
  custom?: boolean;
  /** A sitting that must be paid before a calendar slot is taken. */
  bookable?: boolean;
  host?: "dave" | "ewan";
  durationMinutes?: number;
};

export const STAGES: { id: Stage; name: string }[] = [
  { id: "design", name: "Design" },
  { id: "strategy", name: "Strategy" },
  { id: "build", name: "Build" },
];

/** Names and cadence. Standing GBP until the desk overlay changes them. */
export const CATALOGUE: CatalogueItem[] = [
  {
    id: "identity-ground",
    stage: "design",
    name: "Identity from the ground",
    blurb: "Name, mark, and the system around it.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "identity-refresh",
    stage: "design",
    name: "Identity refresh",
    blurb: "Fresh ideas for an identity that already exists.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "naming",
    stage: "design",
    name: "Naming",
    blurb: "A name that can carry the work.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "logo",
    stage: "design",
    name: "Logo",
    blurb: "The mark.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "identity-systems",
    stage: "design",
    name: "Identity systems",
    blurb: "How the identity behaves in use.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "session-design",
    stage: "design",
    name: "Sitting · Design",
    blurb: "Paid time with Dave. Pay, then pick a slot.",
    amountGbp: 125,
    cadence: "once",
    bookable: true,
    host: "dave",
    durationMinutes: 60,
  },
  {
    id: "consultation",
    stage: "strategy",
    name: "Initial consultation",
    blurb: "Sit down. Design Lab North.",
    amountGbp: 125,
    cadence: "once",
    bookable: true,
    host: "dave",
    durationMinutes: 60,
  },
  {
    id: "brand-strategy",
    stage: "strategy",
    name: "Brand strategy",
    blurb: "How the identity carries forward.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "marketing-strategy",
    stage: "strategy",
    name: "Marketing strategy",
    blurb: "How the brand finds people.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "plan-one-year",
    stage: "strategy",
    name: "One-year plan",
    blurb: "Twelve months the work can follow.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "plan-three-year",
    stage: "strategy",
    name: "Three-year plan",
    blurb: "Longer development the identity can enable.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "titles-section",
    stage: "strategy",
    name: "Various Titles — section",
    blurb: "Unlock the resources that meeting covered.",
    amountGbp: 0,
    cadence: "once",
    titlesGrant: "section",
  },
  {
    id: "titles-full",
    stage: "strategy",
    name: "Various Titles — full resource",
    blurb: "The whole resource centre. Upsell from a section.",
    amountGbp: 0,
    cadence: "once",
    titlesGrant: "full",
  },
  {
    id: "site-ground",
    stage: "build",
    name: "Initial build",
    blurb: "A new site that has to carry the identity.",
    amountGbp: 250,
    cadence: "once",
  },
  {
    id: "session-build",
    stage: "build",
    name: "Sitting · Build",
    blurb: "Paid time with Ewan. Pay, then pick a slot.",
    amountGbp: 125,
    cadence: "once",
    bookable: true,
    host: "ewan",
    durationMinutes: 60,
  },
  {
    id: "site-rebuild",
    stage: "build",
    name: "Site rebuild",
    blurb: "They like the name and mark. The site needs to catch up.",
    amountGbp: 0,
    cadence: "once",
  },
  {
    id: "host-weekly",
    stage: "build",
    name: "Live host — weekly",
    blurb: "A growing copy on our host. They leave notes. We come in.",
    amountGbp: 75,
    cadence: "weekly",
    plotBound: true,
  },
  {
    id: "host-monthly",
    stage: "build",
    name: "Live host — monthly",
    blurb: "Staging subdomain on our host, billed by the month.",
    amountGbp: 0,
    cadence: "monthly",
    plotBound: true,
  },
  {
    id: "site-launch",
    stage: "build",
    name: "Launch on their domain",
    blurb:
      "The site leaves our subdomain onto a domain of their own. First on servers we rent; later our own host.",
    amountGbp: 0,
    cadence: "once",
    plotBound: true,
  },
];

export function catalogueById(id: string): CatalogueItem | undefined {
  return CATALOGUE.find((c) => c.id === id);
}

export function bookableForFacet(facet: Stage): CatalogueItem | undefined {
  return CATALOGUE.find((c) => c.bookable && c.stage === facet);
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function chargedGbp(amount: number): number {
  return amount > 0 ? amount : 0;
}

export function priceLabel(amount: number): string {
  if (amount > 0) return formatGbp(amount);
  return "—";
}
