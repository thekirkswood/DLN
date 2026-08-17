export type Stage = "design" | "strategy" | "build";
export type Cadence = "once" | "weekly" | "monthly";
export type TitlesGrant = "section" | "full";

export type CatalogueItem = {
  id: string;
  stage: Stage;
  name: string;
  blurb: string;
  /** 0 means set when the invoice is composed. Ewan fills this file. */
  amountGbp: number;
  cadence: Cadence;
  plotBound?: boolean;
  titlesGrant?: TitlesGrant;
};

export const STAGES: { id: Stage; name: string }[] = [
  { id: "design", name: "Design" },
  { id: "strategy", name: "Strategy" },
  { id: "build", name: "Build" },
];

/** Ewan sets GBP. Hosting figures stand until he changes them. */
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
    id: "consultation",
    stage: "strategy",
    name: "Initial consultation",
    blurb: "Sit down. Design Lab North.",
    amountGbp: 125,
    cadence: "once",
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
    blurb: "The same live host, billed by the month.",
    amountGbp: 0,
    cadence: "monthly",
    plotBound: true,
  },
];

export function catalogueById(id: string): CatalogueItem | undefined {
  return CATALOGUE.find((c) => c.id === id);
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function priceLabel(amount: number): string {
  return amount > 0 ? formatGbp(amount) : "set when issued";
}
