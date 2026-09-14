export type KitCopy = {
  id: string;
  name: string;
  kicker: string;
  lede: string;
  overview: string[];
  quotes: string[];
};

/** Small line with contact. Not in the overview. */
export const PRESS_DISCLAIMER =
  "This pack is the stills and files Design Lab North keep for press. It does not replace their own site.";

export const KIT_COPY: KitCopy[] = [
  {
    id: "dln",
    name: "Design Lab North",
    kicker: "Studio",
    lede: "Identities, strategy, sites, and print.",
    overview: [
      "Design Lab North are a design hub. People come for identities, marketing strategies, brand redesigns and facelifts, websites, and design for print.",
      "The work sits as Design, Strategy, and Build. Walk in at the one you need. Dave Kirkwood and Ewan Kirkwood run the house together — designer and builder, equal.",
    ],
    quotes: [
      "Design Lab North are a design hub: identities, marketing strategies, brand redesigns and facelifts, websites, and design for print.",
      "People come for Design, Strategy, and Build. Walk in at the one you need.",
    ],
  },
  {
    id: "modyu",
    name: "ModYu",
    kicker: "HT4™",
    lede: "Electronic Press Kit — Ann-Marie, HT4, The Follicle Files.",
    overview: [
      "We are ModYu, a small British company behind HT4 — a clinic-led, four-phase aftercare system designed specifically for people having hair transplant surgery.",
      "The reason to look is a gap almost nobody is talking about: the surgery became an artform. The aftercare never did.",
    ],
    quotes: [
      "The surgery became an artform. The aftercare never did.",
      "We can’t make your hair grow. We can take scalp care seriously.",
      "A transplant is one day. Looking after your scalp is for life.",
    ],
  },
  {
    id: "pfp",
    name: "Paul Fosbury Portraits",
    kicker: "Portraits",
    lede: "Portrait practice. Mark, print, and stills from the work.",
    overview: [
      "Paul Fosbury Portraits is a portrait practice. The pack holds the mark and the stills Design Lab North share from that work.",
    ],
    quotes: [
      "Paul Fosbury Portraits is a portrait practice.",
      "This pack is the mark and stills Design Lab North share from the work.",
    ],
  },
  {
    id: "dks",
    name: "Dave Kirkwood",
    kicker: "Studio",
    lede: "Founding designer at Design Lab North.",
    overview: [
      "Dave Kirkwood is a multi-award-winning designer for branding and marketing. He is a former lecturer, a brand and marketing advisor to Lancashire County Council, a consultant across the region, a public speaker and host, with work featured in publications, on television and radio.",
      "He is founding designer at Design Lab North, equal with Ewan Kirkwood. This pack holds the stills we share for his house. We do not invent a mark.",
    ],
    quotes: [
      "Dave Kirkwood is a multi-award-winning designer for branding and marketing.",
      "Founding designer at Design Lab North.",
    ],
  },
  {
    id: "swarm",
    name: "Swarm Fund",
    kicker: "Hive",
    lede: "A hive for cultural discovery and collective backing.",
    overview: [
      "Swarm Fund is a hive for cultural discovery and collective backing. A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm.",
      "Backing follows belief, not a feed and not an ads marketplace. This pack is the hive mark and the stills Design Lab North share.",
    ],
    quotes: [
      "Swarm Fund is a hive for cultural discovery and collective backing.",
      "A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm.",
      "Backing follows belief, not a feed and not an ads marketplace.",
    ],
  },
  {
    id: "daa",
    name: "DAA",
    kicker: "Digital Adoption Advisor",
    lede: "Business value after go-live. Mark Barlow. HyperTrack™.",
    overview: [
      "Digital Adoption Advisor provides specialist Digital Adoption and value services for organisations navigating the point where technology-enabled change has to become operating reality.",
      "Technology can go live. Transformation can finish. Value still has to survive.",
    ],
    quotes: [
      "Technology can go live. Transformation can finish. Value still has to survive.",
      "DAA works in that gap. We help organisations understand what is actually happening, distinguish evidence from assumption, make value and operating conditions visible, and choose proportionate actions.",
    ],
  },
  {
    id: "titles",
    name: "Various Titles",
    kicker: "Resource",
    lede: "Ideas about marketing and branding, written so people can learn.",
    overview: [
      "Various Titles is a place for ideas about marketing and branding, written so people can learn.",
      "It is the Proprietary Engine Room: a repository of operational design methodology, identity blueprints, and communication frameworks. This pack is the geometric VT mark and the stills Design Lab North share.",
    ],
    quotes: [
      "Various Titles is a place for ideas about marketing and branding, written so people can learn.",
      "The Proprietary Engine Room: operational design methodology, identity blueprints, and communication frameworks.",
    ],
  },
];

export function kitCopy(id: string): KitCopy {
  return KIT_COPY.find((k) => k.id === id) || KIT_COPY[0];
}
