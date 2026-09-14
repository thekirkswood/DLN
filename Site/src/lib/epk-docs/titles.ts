import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const titlesDoc: EpkDoc = {
  kit: "titles",
  product: "Various Titles",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Ideas about marketing and branding",
  coverNote: "We’ll supply interviews, imagery and the geometric VT mark Design Lab North share.",
  coverLabels: ["Our story", "The resource", "Asset vault"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Papers" },
    { id: "founder", label: "Studio" },
    { id: "campaigns", label: "Stills" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#about", label: "Various Titles" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault" },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "Various Titles is a place for ideas about marketing and branding, written so people can learn.",
      "It is the Proprietary Engine Room: a repository of operational design methodology, identity blueprints, and communication frameworks. This pack is the geometric VT mark and the stills Design Lab North share.",
    ],
  },
  pitches: [
    {
      id: "learn",
      kicker: "Resource",
      title: "Ideas about marketing and branding, written so people can learn.",
      story: [
        "Various Titles is a place for ideas about marketing and branding, written so people can learn. This pack is the geometric VT mark and the stills Design Lab North share.",
      ],
      bestFor: "Design education, brand and methodology desks.",
      ask: "design@designlabnorth.com",
    },
  ],
  about: {
    title: "Various Titles",
    kicker: "Resource",
    paras: [
      "A place for ideas about marketing and branding, written so people can learn. This pack does not replace the Various Titles site.",
    ],
  },
  quoteBank: [
    {
      heading: "From Design Lab North",
      quotes: [
        {
          text: "Various Titles is a place for ideas about marketing and branding, written so people can learn.",
          cite: "Design Lab North",
        },
        {
          text: "The Proprietary Engine Room: operational design methodology, identity blueprints, and communication frameworks.",
          cite: "Design Lab North",
        },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Name", value: "Various Titles" },
      { label: "This pack", value: "Geometric VT mark and stills Design Lab North share" },
      { label: "Press", value: "design@designlabnorth.com" },
      { label: "Hosted by", value: "Design Lab North" },
    ],
  },
  faqs: [],
  contact: {
    name: "Design Lab North",
    role: "Press host",
    email: "design@designlabnorth.com",
    web: "https://designlabnorth.com",
    available: ["VT mark and stills from this vault"],
    disclaimer: PRESS_DISCLAIMER,
  },
};
