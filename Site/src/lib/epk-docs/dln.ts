import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const dlnDoc: EpkDoc = {
  kit: "dln",
  product: "Design Lab North",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Design · Strategy · Build",
  coverNote: "We’ll supply interviews, imagery and stills from the studio.",
  coverLabels: ["Our story", "The offers", "Asset vault"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Work" },
    { id: "founder", label: "Studio" },
    { id: "campaigns", label: "Frameworks" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#about", label: "The studio" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault", sub: ["Logos", "Studio", "Work", "Frameworks"] },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "Design Lab North are a design hub. People come for identities, marketing strategies, brand redesigns and facelifts, websites, and design for print.",
      "The work sits as Design, Strategy, and Build. Walk in at the one you need. Dave Kirkwood and Ewan Kirkwood run the house together — designer and builder, equal.",
    ],
  },
  pitches: [
    {
      id: "hub",
      kicker: "Studio",
      title: "Identities, strategy, sites, and print.",
      story: [
        "People come for Design, Strategy, and Build. Walk in at the one you need. The work may move between them; we do not number them or gatekeep the journey.",
      ],
      bestFor: "Design, regional business and culture desks.",
      ask: "design@designlabnorth.com",
    },
  ],
  about: {
    title: "The studio",
    kicker: "Design Lab North",
    paras: [
      "Dave Kirkwood is founding designer. Ewan Kirkwood is builder. Equal. This pack is the studio mark and the stills we share — not another house’s identity.",
    ],
  },
  quoteBank: [
    {
      heading: "From Design Lab North",
      quotes: [
        {
          text: "Design Lab North are a design hub: identities, marketing strategies, brand redesigns and facelifts, websites, and design for print.",
          cite: "Design Lab North",
        },
        {
          text: "People come for Design, Strategy, and Build. Walk in at the one you need.",
          cite: "Design Lab North",
        },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Studio", value: "Design Lab North" },
      { label: "People", value: "Dave Kirkwood (designer) and Ewan Kirkwood (builder)" },
      { label: "Offers", value: "Design, Strategy, Build" },
      { label: "Press", value: "design@designlabnorth.com" },
      { label: "Site", value: "designlabnorth.com" },
    ],
  },
  faqs: [],
  contact: {
    name: "Design Lab North",
    role: "Press",
    email: "design@designlabnorth.com",
    web: "https://designlabnorth.com",
    available: ["Studio mark and stills from this vault", "Interviews with Dave or Ewan"],
    disclaimer: PRESS_DISCLAIMER,
  },
};
