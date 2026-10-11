export type Phase = {
  id: string;
  code: string;
  name: string;
  /** Journey label from live HT4 boxes: Pre / During / Recovery / Continuous */
  journey: string;
  timing: string;
  summary: string;
  detail: string;
  products: string[];
  image: string;
  textureImage?: string;
  color: string;
  /** Short product line under name (e.g. Shampoo / Spray) */
  productLine: string;
  panelCopy: string[];
  bullets: string[];
  /** Extra white-area marketing lines (P2 style) */
  spotlight?: { headline: string; body: string; closer: string };
  shopHref: string;
};

export const phases: Phase[] = [
  {
    id: "p1",
    code: "P1",
    name: "Balance",
    journey: "Pre",
    timing: "Day −30 to Day 0",
    summary:
      "Prepare the scalp in the weeks before surgery so you arrive with a calmer, more consistent starting point.",
    detail:
      "Phase 1 runs in the thirty days before your procedure. Balance shampoo cleanses without disrupting the scalp’s natural microbiome.",
    products: ["Balance Shampoo"],
    productLine: "Shampoo",
    image: "/assets/phases/p1-balance-sheet.jpg",
    textureImage: undefined,
    color: "#cde9f8",
    panelCopy: [
      "Experience the calming effects of our Balancing Shampoo formulated to cleanse without disrupting the scalp’s natural microbiome. This gentle yet effective shampoo soothes, alleviates flaky scalp and refreshes while helping to maintain scalp comfort and hydration.",
      "Infused with eucalyptus and peppermint oils for an invigorating sensation and fresh scent, enhanced by the revitalizing benefits of juniper berry and tea tree oil. Together, these botanicals help purify and balance the scalp environment, supporting overall scalp wellbeing and a healthy foundation in preparation for your procedure.",
    ],
    bullets: ["Scientifically Formulated."],
    shopHref: "/products/balance",
  },
  {
    id: "p2",
    code: "P2",
    name: "Cleanse",
    journey: "During",
    timing: "Day 1 to Day 3",
    summary:
      "Sterile saline only — protect fragile new grafts and follow your clinic’s instructions.",
    detail:
      "Phase 2 covers the first three days after surgery. Priority shifts to protecting fragile grafts with sterile saline.",
    products: ["Cleanse sterile saline spray"],
    productLine: "Spray",
    image: "/assets/phases/p2-cleanse-sheet.jpg",
    textureImage: undefined,
    color: "#e19226",
    panelCopy: [
      "Cleanse, Sterile Saline spray is designed to clean debris from skin wounds.",
    ],
    bullets: [
      "For external use in the irrigation and cleansing of wounds.",
      "Sterile from first to last spray.",
    ],
    spotlight: {
      headline: "The Gold Standard in Graft Care Starts Here.",
      body: "Looking for clean, confident healing? This is the only spray trusted by HT4 and designed for the precision needs of hair transplant patients.",
      closer: "HT4 Cleanse is more than just saline, it’s surgical-grade care in a can.",
    },
    shopHref: "/products/cleanse-pack",
  },
  {
    id: "p3",
    code: "P3",
    name: "Recovery",
    journey: "Recovery",
    timing: "Day 3 to Day 21",
    summary:
      "Hydrate, Bathe and Comfort — three products working together as the scalp settles.",
    detail:
      "On the legacy site this stage is three separate bottle entries. Here they are pooled into one Recovery phase: Hydrate mist for moisture without disturbing grafts, Bathe foam for the first gentle washes, and Comfort night serum for overnight itch, tightness and discomfort.",
    products: ["Hydrate spray", "Bathe foam shampoo", "Comfort night serum"],
    productLine: "Hydrate · Bathe · Comfort",
    image: "/assets/phases/p3-hydrate-sheet.jpg",
    textureImage: undefined,
    color: "#d8d8d8",
    panelCopy: [
      "Early recovery asks more than one product can deliver. Hydrate keeps moisture balanced between washes, Bathe introduces a gentler cleanse as grafts settle, and Comfort nourishes overnight when tightness and itch show up.",
      "Phase 3 products are dermatologically tested for sensitive and post-transplant scalps — including Comfort Night Serum, clinically shown non-comedogenic.",
    ],
    bullets: [
      "Three products, one recovery window.",
      "Hypoallergenic Phase 3 formulas (independent testing).",
    ],
    shopHref: "/products/recovery-pack",
  },
  {
    id: "p4",
    code: "P4",
    name: "Continuous Care",
    journey: "Continuous Care",
    timing: "Day 21+",
    summary:
      "Protect and Nourish for long-term scalp and hair care once healing has passed.",
    detail:
      "Legacy site shows Protect and Nourish as two entries. Here they form one Continuous phase: Protect shampoo supports circulation and fibre strength; Nourish conditioner adds softness and manageability for fine or thinning hair.",
    products: ["Protect shampoo", "Nourish conditioner"],
    productLine: "Protect · Nourish",
    image: "/assets/phases/p4-protect-sheet.jpg",
    textureImage: undefined,
    color: "#008ab0",
    panelCopy: [
      "Once the scalp has healed, Continuous care keeps the routine simple: Protect shampoo with caffeine and antioxidants, paired with Nourish conditioner enriched with botanical oils, betaine and panthenol.",
      "Designed for fine and thinning hair in women and men — the ongoing phase after transplant recovery, not a return to generic bathroom products.",
    ],
    bullets: [
      "Two products, one long-term routine.",
      "Supports scalp health well beyond early recovery.",
    ],
    shopHref: "/products/protect-nourish",
  },
];
