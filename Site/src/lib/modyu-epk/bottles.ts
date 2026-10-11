export type Bottle = {
  id: string;
  phaseId: string;
  code: string;
  name: string;
  timing: string;
  color: string;
  image: string;
  summary: string;
  purpose: string;
  ingredients: { name: string; benefit: string }[];
  howToUse: string[];
  goodToKnow: string[];
};

/** Bottle-level detail from live /ht4 selector panels. */
export const bottles: Bottle[] = [
  {
    id: "balance",
    phaseId: "p1",
    code: "P1",
    name: "Balance Shampoo",
    timing: "Day −30 to Day 0",
    color: "#cde9f8",
    image: "/assets/phases/p1-balance-sheet.jpg",
    summary:
      "Reset your scalp. Surgery-ready skin begins here, a 30-day cleanse before transplant.",
    purpose:
      "Experience the calming effects of Balancing Shampoo formulated to cleanse without disrupting the scalp’s natural microbiome. It soothes flaky scalp, refreshes, and helps maintain comfort and hydration ahead of your procedure.",
    ingredients: [
      {
        name: "Tea Tree Oil",
        benefit: "Helps keep the scalp clean and comfortable.",
      },
      {
        name: "Peppermint & Eucalyptus",
        benefit: "Refresh and calm surface comfort and balance.",
      },
      {
        name: "Juniper Berry Oil",
        benefit: "Antioxidant-rich support for everyday scalp stress.",
      },
      {
        name: "Piroctone Olamine",
        benefit: "Supports microbial balance and comfort.",
      },
    ],
    howToUse: [
      "Wet hair and scalp with warm water.",
      "Apply a small amount to the palms.",
      "Massage gently into the scalp in circular motions.",
      "Leave for 3 minutes, then rinse thoroughly.",
      "Use daily for the 30 days leading up to your procedure.",
    ],
    goodToKnow: [
      "Scientifically formulated",
      "Fragrance from essential oils, no synthetic perfume",
      "Vegan & cruelty-free · Made in the UK",
    ],
  },
  {
    id: "cleanse",
    phaseId: "p2",
    code: "P2",
    name: "Cleanse Spray",
    timing: "Day 1 to Day 3",
    color: "#e19226",
    image: "/assets/phases/p2-cleanse-sheet.jpg",
    summary:
      "Gentle. Sterile. Engineered for precision graft-area cleansing.",
    purpose:
      "Sterile saline spray designed to clean debris from skin wounds. For external irrigation and cleansing, sterile from first to last spray. A medical-device approach for the fragile first days after transplant.",
    ingredients: [
      {
        name: "0.9% Medical Grade Sodium Chloride",
        benefit: "Isotonic sterile saline solution.",
      },
    ],
    howToUse: [
      "Hold 10cm away from scalp.",
      "Spray directly over graft and donor areas.",
      "Use every 2 hours during Days 1–3 post-procedure.",
      "Do not wipe or touch, allow to air dry.",
    ],
    goodToKnow: [
      "CE-marked medical device",
      "No preservatives or additives",
      "Suitable for sensitive, healing skin · Made in Sweden",
    ],
  },
  {
    id: "hydrate",
    phaseId: "p3",
    code: "P3",
    name: "Hydrate Spray",
    timing: "Day 3 to Day 21",
    color: "#e0e0e0",
    image: "/assets/phases/p3-hydrate-sheet.jpg",
    summary:
      "Targeted hydration and comfort for recovering scalp, without disturbing grafts.",
    purpose:
      "A specialised mist with zinc PCA for freshness, betaine and panthenol for moisture balance, Manuka honey for antioxidant protection, and aloe vera for hydration. Clinically proven hypoallergenic in independent testing.",
    ingredients: [
      {
        name: "Zinc PCA",
        benefit: "Regulates excess oil while leaving the scalp comfortable.",
      },
      {
        name: "Betaine",
        benefit: "Natural moisturiser that locks in hydration.",
      },
      {
        name: "Panthenol",
        benefit: "Deeply hydrates and soothes scalp skin.",
      },
      {
        name: "Manuka Honey & Aloe Vera",
        benefit: "Antioxidant protection with cooling hydration.",
      },
    ],
    howToUse: [
      "Hold 5–10 inches from the scalp.",
      "Mist gently over recipient and donor areas.",
      "Let air dry, do not rub or pat.",
      "Use every 2–3 hours from Day 3 to Day 10.",
    ],
    goodToKnow: [
      "Dermatologically tested · Fragrance-free · Alcohol-free",
      "Vegan and cruelty-free · Made in the UK",
    ],
  },
  {
    id: "bathe",
    phaseId: "p3",
    code: "P3",
    name: "Bathe Foam Shampoo",
    timing: "Day 3 to Day 21",
    color: "#e8e8e8",
    image: "/assets/phases/p3-bathe-sheet.jpg",
    summary:
      "Ultra-light foam cleansing for sensitive post-transplant scalp.",
    purpose:
      "A light formula that cleanses without stripping moisture. Instant-foam technology minimises surfactant content, suited to delicate grafts and daily sensitive-scalp care. Clinically proven hypoallergenic.",
    ingredients: [
      {
        name: "Panthenol (Pro-vitamin B5)",
        benefit: "Hydrates, soothes and strengthens post-procedure scalp and hair.",
      },
    ],
    howToUse: [
      "From Day 3: apply foam gently to the donor area.",
      "For recipient area, use the cup method with tepid water and foam.",
      "Rinse carefully, do not rub or disturb grafts.",
    ],
    goodToKnow: [
      "Dermatologically tested · Sulphate free",
      "Free from artificial fragrance · Made in the UK",
    ],
  },
  {
    id: "comfort",
    phaseId: "p3",
    code: "P3",
    name: "Comfort Night Serum",
    timing: "From day 7",
    color: "#dcdcdc",
    image: "/assets/phases/p3-comfort-sheet.jpg",
    summary:
      "Overnight nourishment that soothes itch, tightness and discomfort.",
    purpose:
      "Rich leave-on serum with shea-derived emollients, castor oil and andiroba seed oil. Menthyl lactate adds a cooling calm. Clinically proven non-comedogenic, safe on healing, post-transplant scalps.",
    ingredients: [
      {
        name: "Andiroba Seed Oil",
        benefit: "Nourishes while calming irritation.",
      },
      {
        name: "Castor Oil & Shea Esters",
        benefit: "Deep moisturisation without heaviness.",
      },
      {
        name: "Menthyl Lactate",
        benefit: "Mild cooling sensation for comfort.",
      },
    ],
    howToUse: [
      "From Day 7 evenings, apply a thin layer over the scalp.",
      "Do not rinse, leave overnight.",
      "Cleanse in the morning with Bathe foam.",
    ],
    goodToKnow: [
      "Non-comedogenic · Fragrance-free",
      "95% reported softer scalp skin in clinical use testing",
    ],
  },
  {
    id: "protect",
    phaseId: "p4",
    code: "P4",
    name: "Protect Shampoo",
    timing: "Day 21+",
    color: "#008ab0",
    image: "/assets/phases/p4-protect-sheet.jpg",
    summary:
      "Rebuild, strengthen and stimulate once the scalp has healed.",
    purpose:
      "Specialist shampoo for ongoing scalp and hair support after healing. Caffeine supports circulation; vitamins and hydrolysed wheat protein nourish fibres as growth continues.",
    ingredients: [
      {
        name: "Caffeine",
        benefit: "Supports circulation and follicle vitality.",
      },
      {
        name: "Vitamins C & E",
        benefit: "Antioxidant support against everyday stressors.",
      },
      {
        name: "Hydrolysed Wheat Protein",
        benefit: "Soothes scalp and nourishes hair fibres.",
      },
    ],
    howToUse: [
      "From Day 21, use as your regular shampoo.",
      "Massage into scalp, leave 3 minutes, rinse.",
      "Use daily or as advised by your clinic.",
    ],
    goodToKnow: [
      "Scientifically formulated · Made in the UK",
      "Vegan & cruelty-free",
    ],
  },
  {
    id: "nourish",
    phaseId: "p4",
    code: "P4",
    name: "Nourish Conditioner",
    timing: "Day 21+",
    color: "#007a9c",
    image: "/assets/phases/p4-nourish-sheet.jpg",
    summary:
      "Deep hydration and softness for hair and scalp after recovery.",
    purpose:
      "Blends argan, castor, apricot, jojoba, amla and baobab oils with betaine and panthenol for extra moisture, so hair feels soft and manageable as you settle into long-term care.",
    ingredients: [
      {
        name: "Botanical oil blend",
        benefit: "Argan, castor, apricot, jojoba, amla, baobab.",
      },
      {
        name: "Betaine & Panthenol",
        benefit: "Extra moisture and conditioning.",
      },
    ],
    howToUse: [
      "After Protect shampoo, apply through mid-lengths and ends.",
      "Leave briefly, then rinse.",
      "Use as part of your ongoing Phase 4 routine.",
    ],
    goodToKnow: [
      "Designed for fine and thinning hair",
      "Pairs with Protect shampoo in the Phase 4 pack",
    ],
  },
];

export function bottlesForPhase(phaseId: string) {
  return bottles.filter((b) => b.phaseId === phaseId);
}
