import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const dksDoc: EpkDoc = {
  kit: "dks",
  product: "Dave Kirkwood",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Founding designer · Design Lab North",
  coverNote: "We’ll supply interviews and stills we share for Dave’s house. We do not invent a mark.",
  coverLabels: ["Our story", "The work", "Asset vault"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Work" },
    { id: "founder", label: "Dave" },
    { id: "campaigns", label: "Stills" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#founder", label: "Dave Kirkwood" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault" },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "Dave Kirkwood is a multi-award-winning designer for branding and marketing. He is a former lecturer, a brand and marketing advisor to Lancashire County Council, a consultant across the region, a public speaker and host, with work featured in publications, on television and radio.",
      "He is founding designer at Design Lab North, equal with Ewan Kirkwood. This pack holds the stills we share for his house. We do not invent a mark.",
    ],
  },
  pitches: [
    {
      id: "designer",
      kicker: "Studio",
      title: "Founding designer at Design Lab North.",
      story: [
        "Dave Kirkwood is a multi-award-winning designer for branding and marketing. This pack is the stills Design Lab North share — not a second logo we invented for the house.",
      ],
      bestFor: "Design, regional and profile desks.",
      ask: "design@designlabnorth.com",
    },
  ],
  founder: {
    kicker: "Designer",
    title: "Dave Kirkwood",
    paras: [
      "Multi-award-winning designer for branding and marketing. Former lecturer. Brand and marketing advisor to Lancashire County Council. Consultant across the region. Public speaker and host. Work featured in publications, on television and radio.",
      "Founding designer at Design Lab North, equal with Ewan Kirkwood.",
    ],
  },
  quoteBank: [
    {
      heading: "From Design Lab North",
      quotes: [
        { text: "Dave Kirkwood is a multi-award-winning designer for branding and marketing.", cite: "Design Lab North" },
        { text: "Founding designer at Design Lab North.", cite: "Design Lab North" },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Name", value: "Dave Kirkwood" },
      { label: "Role", value: "Founding designer, Design Lab North" },
      { label: "This pack", value: "Stills we share. No invented mark." },
      { label: "Press", value: "design@designlabnorth.com" },
    ],
  },
  faqs: [
    {
      q: "Where is the logo?",
      a: "We do not invent a Dave Kirkwood Studio mark. This pack is the stills we have to share.",
    },
  ],
  contact: {
    name: "Design Lab North",
    role: "Press",
    email: "design@designlabnorth.com",
    web: "https://designlabnorth.com",
    available: ["Stills from this vault", "Interview with Dave"],
    disclaimer: PRESS_DISCLAIMER,
  },
};
