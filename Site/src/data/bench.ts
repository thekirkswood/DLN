import { OFFERS, type Facet } from "@/data/needs";
import { PIPELINE_STAGES } from "@/data/campus";

export type Room = "design" | "strategy" | "build" | "host" | "board";

export const BRIEF = "/brief";

export const GROUND = `${BRIEF}/ground.jpg`;
export const SIGNAL = `${BRIEF}/stills/signal-loss-1.jpeg`;
export const VT_PLATE = `${BRIEF}/PNGs/VT-logo-01.png`;
export const FACULTY = {
  design: `${BRIEF}/PNGs/Design1.png`,
  lab: `${BRIEF}/PNGs/Lab.png`,
  north: `${BRIEF}/PNGs/North.png`,
} as const;

export const PRINTS = [
  {
    src: `${BRIEF}/PNGs/ah9.png`,
    title: "Hajime",
    line: "Hajime Yoshizawa",
  },
  {
    src: `${BRIEF}/Portfolio/ahum.png`,
    title: "AH UM",
    line: "Selected portfolio",
  },
  {
    src: `${BRIEF}/Portfolio/Combo1.png`,
    title: "Design for print",
    line: "Selected work",
  },
  {
    src: `${BRIEF}/Portfolio/Combo2.png`,
    title: "Design for print",
    line: "Selected work",
  },
  {
    src: `${BRIEF}/Portfolio/mm.png`,
    title: "AH UM",
    line: "Selected work",
  },
  {
    src: `${BRIEF}/Portfolio/DAA.png`,
    title: "AH UM",
    line: "Selected work",
  },
] as const;

export const PORTFOLIO = [
  `${BRIEF}/Portfolio/ahum.png`,
  `${BRIEF}/PNGs/ah9.png`,
  `${BRIEF}/Portfolio/Combo1.png`,
  `${BRIEF}/Portfolio/Combo2.png`,
  `${BRIEF}/Portfolio/ATTW.png`,
  `${BRIEF}/Portfolio/FollicleFiles.png`,
  `${BRIEF}/Portfolio/Modyu.png`,
  `${BRIEF}/Portfolio/wilson.png`,
] as const;

export const MERZ_RESEARCH = [
  `${BRIEF}/Portfolio/MerzBarn.png`,
  `${BRIEF}/PNGs/merz5.png`,
  `${BRIEF}/PNGs/RED-01.png`,
  `${BRIEF}/PNGs/RED-02.png`,
  `${BRIEF}/PNGs/RED-03.png`,
  `${BRIEF}/PNGs/red1.jpg`,
  `${BRIEF}/PNGs/red2.jpg`,
  `${BRIEF}/PNGs/RED-04.png`,
  `${BRIEF}/Portfolio/wilson.png`,
  `${BRIEF}/Portfolio/307.png`,
  `${BRIEF}/Portfolio/Red.png`,
  `${BRIEF}/PNGs/RED-05.png`,
] as const;

export const FRAMEWORKS = [
  `${BRIEF}/Frameworks/DLNFrameworks-01.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-02.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-03.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-04.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-05.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-06.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-07.png`,
  `${BRIEF}/Frameworks/DLNFrameworks-08.png`,
] as const;


export const SOLPORT = [
  {
    id: "2-hour",
    name: "2 hour",
    fill: 87.5,
    lines: ["Overview", "Problem solving", "Creative brainstorming"],
  },
  {
    id: "half-day",
    name: "Half day",
    fill: 50,
    lines: [
      "Brand Strategy",
      "Marketing Strategy",
      "Start-up Strategy",
      "Brand Audits",
      "Over-arching Strategic Consultancy",
    ],
  },
  {
    id: "full-day",
    name: "Full day",
    fill: 100,
    lines: [
      "Brand Strategy",
      "Marketing Strategy",
      "Start-up Strategy",
      "Brand Audits",
      "Over-arching Strategic Consultancy",
    ],
  },
] as const;

export const HOST_LINES = [
  { id: "basic", name: "Live site or private preview: £50 pm" },
  { id: "both", name: "Both at once: £100 pm" },
  { id: "heavy", name: "Heavy traffic: negotiable" },
  { id: "build", name: "Build costs" },
] as const;

export const MODULES: {
  id: Facet;
  room: Room;
  name: string;
  lines: string[];
  contact: string;
  href: string;
}[] = OFFERS.map((offer) => ({
  id: offer.id,
  room: offer.id as Room,
  name: offer.name,
  lines: offer.points || [],
  contact: offer.homeCta || `Contact ${offer.name}`,
  href: offer.href,
}));

export const PIPELINE = PIPELINE_STAGES;

export function needForContact(facet: Facet | "host" | "supplier"): string {
  if (facet === "host") return "web-infra-audit";
  if (facet === "supplier") return "social-supplier";
  if (facet === "design") return "design-print";
  if (facet === "strategy") return "consultancy-session";
  return "web-simple-site";
}
