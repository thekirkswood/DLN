import { kitCopy, PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export function genericDoc(id: string): EpkDoc {
  const copy = kitCopy(id);
  return {
    kit: id,
    product: copy.name,
    kitTitle: "Electronic Press Kit",
    peopleLine: copy.kicker,
    coverNote: "We’ll supply interviews, imagery and stills from this house.",
    coverLabels: ["Our story", "Quote bank", "Asset vault"],
    lanes: [
      { id: "logos", label: "Logos" },
      { id: "product", label: "Product" },
      { id: "founder", label: "Founder" },
      { id: "campaigns", label: "Campaigns" },
    ],
    nav: [
      { href: "#stories", label: "Stories ready to run" },
      { href: "#quotes", label: "Quote bank" },
      { href: "#facts", label: "Fast facts" },
      { href: "#assets", label: "Asset Vault", sub: ["Logos", "Founder", "Products", "Campaigns"] },
      { href: "#contact", label: "Contact" },
    ],
    story: {
      title: "Our Story",
      paras: copy.overview,
    },
    pitches: [],
    quoteBank: [
      {
        heading: "From Design Lab North",
        quotes: copy.quotes.map((text) => ({ text, cite: "Design Lab North" })),
      },
    ],
    facts: {
      heading: "Fast facts",
      rows: [
        { label: "House", value: copy.name },
        { label: "Hosted by", value: "Design Lab North" },
      ],
    },
    faqs: [],
    contact: {
      name: "Design Lab North",
      role: "Press",
      email: "design@designlabnorth.com",
      web: "https://designlabnorth.com",
      available: ["Imagery and stills from this pack", "Bespoke quotes on request"],
      disclaimer: PRESS_DISCLAIMER,
    },
  };
}
