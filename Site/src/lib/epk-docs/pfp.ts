import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const pfpDoc: EpkDoc = {
  kit: "pfp",
  product: "Paul Fosbury Portraits",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Portraits · print · stills from the work",
  coverNote: "We’ll supply interviews, imagery and stills from this portrait practice.",
  coverLabels: ["Our story", "The work", "Asset vault"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Print" },
    { id: "founder", label: "Plates" },
    { id: "campaigns", label: "Portraits" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#about", label: "The practice" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault", sub: ["Logos", "Plates", "Portraits"] },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "Paul Fosbury Portraits is a portrait practice. This pack is the mark and the stills Design Lab North share from that work.",
    ],
  },
  pitches: [
    {
      id: "practice",
      kicker: "Portraits",
      title: "A portrait practice.",
      story: [
        "The stills in this vault are the mark, the plates, and the portraits Design Lab North share for press.",
      ],
      bestFor: "Local, arts and portrait desks.",
      ask: "Imagery from the vault. Introductions through Design Lab North.",
    },
  ],
  about: {
    title: "The practice",
    kicker: "Paul Fosbury Portraits",
    paras: [
      "Portrait practice. Mark, print, and stills from the work.",
    ],
  },
  quoteBank: [
    {
      heading: "From Design Lab North",
      quotes: [
        { text: "Paul Fosbury Portraits is a portrait practice.", cite: "Design Lab North" },
        { text: "This pack is the mark and stills Design Lab North share from the work.", cite: "Design Lab North" },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Practice", value: "Paul Fosbury Portraits" },
      { label: "This pack", value: "Mark, plates and portrait stills Design Lab North keep for press" },
      { label: "Press", value: "design@designlabnorth.com" },
      { label: "Hosted by", value: "Design Lab North" },
    ],
  },
  faqs: [
    {
      q: "Is this his live public site?",
      a: "No. This pack is the stills and files Design Lab North keep for press. It does not replace their own site.",
    },
  ],
  contact: {
    name: "Design Lab North",
    role: "Press host",
    email: "design@designlabnorth.com",
    web: "https://designlabnorth.com",
    available: ["Mark and portrait stills from this vault", "Introductions for comment"],
    disclaimer: PRESS_DISCLAIMER,
  },
};
