import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const swarmDoc: EpkDoc = {
  kit: "swarm",
  product: "Swarm Fund",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Hive · cultural discovery · collective backing",
  coverNote: "We’ll supply interviews, imagery and the hive mark Design Lab North share.",
  coverLabels: ["Our story", "The hive", "Asset vault"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Hive" },
    { id: "founder", label: "Studio" },
    { id: "campaigns", label: "Stills" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#about", label: "Swarm Fund" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault" },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "Swarm Fund is a hive for cultural discovery and collective backing. A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm.",
      "Backing follows belief, not a feed and not an ads marketplace. This pack is the hive mark and the stills Design Lab North share.",
    ],
  },
  pitches: [
    {
      id: "hive",
      kicker: "Hive",
      title: "A hive for cultural discovery and collective backing.",
      story: [
        "A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm. Backing follows belief, not a feed and not an ads marketplace.",
      ],
      bestFor: "Culture, arts funding and technology desks.",
      ask: "design@designlabnorth.com",
    },
  ],
  about: {
    title: "Swarm Fund",
    kicker: "Hive",
    paras: [
      "This pack is the hive mark and the stills Design Lab North share. It does not replace the Swarm Fund site.",
    ],
  },
  quoteBank: [
    {
      heading: "From Design Lab North",
      quotes: [
        { text: "Swarm Fund is a hive for cultural discovery and collective backing.", cite: "Design Lab North" },
        {
          text: "A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm.",
          cite: "Design Lab North",
        },
        { text: "Backing follows belief, not a feed and not an ads marketplace.", cite: "Design Lab North" },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Product", value: "Swarm Fund" },
      { label: "This pack", value: "Hive mark and stills Design Lab North share" },
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
    available: ["Hive mark and stills from this vault"],
    disclaimer: PRESS_DISCLAIMER,
  },
};
