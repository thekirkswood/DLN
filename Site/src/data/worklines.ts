import { type Facet } from "@/data/needs";
import { BRIEF } from "@/data/bench";

export type LineId =
  | "logos"
  | "identity"
  | "ui"
  | "print"
  | "packaging"
  | "brand"
  | "marketing"
  | "online"
  | "startup"
  | "audits"
  | "counsel"
  | "simple"
  | "workspaces"
  | "apps"
  | "modernize"
  | "api"
  | "infra"
  | "platform";

export type LineWidget =
  | "plates"
  | "gallery"
  | "examples"
  | "solport"
  | "solport-short"
  | "filters"
  | "hostpeek"
  | "engine"
  | "brands"
  | "workspace"
  | "checkout"
  | "joins"
  | "modernize"
  | "identity-kit"
  | "ui-kit"
  | "brand-kit"
  | "market-kit"
  | "audit-path"
  | "sitting"
  | "startup-talk";

export type LineExample = {
  src: string;
  name: string;
  note?: string;
};

export type WorkLine = {
  id: LineId;
  facet: Facet;
  name: string;
  title: string;
  lead: string;
  body: string;
  stills: string[];
  examples?: LineExample[];
  folds: { name: string; text: string }[];
  widget: LineWidget;
  needId: string;
  cta: string;
  hide?: boolean;
};

export const WORK_LINES: WorkLine[] = [
  {
    id: "logos",
    facet: "design",
    name: "Logos",
    title: "Logos",
    lead: "A logo that still holds as you grow — from a first idea, or a refresh of what you already run.",
    body: "You leave with type, assets, and a logo built to last, not a look that dates. Come in with what you have, or start with a name and a first drawing.",
    stills: [],
    folds: [
      {
        name: "Individual assets",
        text: "Type, standalone graphics, and the logo — built to endure, not to trend.",
      },
      {
        name: "Built to scale",
        text: "We test the work so it holds for a small business and still holds as you grow.",
      },
      {
        name: "Refresh or from the ground",
        text: "Bring what you have, or start from a name. We start from there.",
      },
    ],
    widget: "brands",
    needId: "design-assets-logo",
    cta: "Contact Design",
  },
  {
    id: "identity",
    facet: "design",
    name: "Brand Identity Systems",
    title: "Brand identity systems",
    lead: "One system, in the places people actually meet you: card, phone, laptop.",
    body: "A name, a logo, and the identity around it — rules you can actually work with, so the work does not drift. Print, pack, and screen as one, not a logo parked on a template.",
    stills: [],
    folds: [
      {
        name: "Master guidelines",
        text: "Type, colour, space, and how the logo sits. An audit or an update of what you already run.",
      },
      {
        name: "Print and screen as one",
        text: "Stationery, packaging, and the interface from the same system.",
      },
      {
        name: "A toolkit you can run",
        text: "Principles you can print or buy — so anyone on the work can hold the line.",
      },
    ],
    widget: "identity-kit",
    examples: [
      {
        src: `${BRIEF}/Frameworks/DLNFrameworks-03.png`,
        name: "System",
        note: "The identity card",
      },
      {
        src: `${BRIEF}/Portfolio/Deti.png`,
        name: "On the phone",
        note: "In the hand",
      },
      {
        src: `${BRIEF}/Portfolio/Modyu.png`,
        name: "On the laptop",
        note: "On the desk",
      },
    ],
    needId: "design-guidelines",
    cta: "Contact Design",
  },
  {
    id: "ui",
    facet: "design",
    name: "UI",
    title: "UI",
    lead: "Screens people can use — the same identity as the print, not a later coat of paint.",
    body: "Buttons, type, and spacing that hold across a simple site and a heavier application. People can find the work, buy, book, or read.",
    stills: [],
    widget: "ui-kit",
    examples: [
      {
        src: `${BRIEF}/Portfolio/FollicleFiles.png`,
        name: "Follicle Files",
        note: "The identity, on a screen you can use",
      },
      {
        src: `${BRIEF}/Portfolio/ATTW.png`,
        name: "ATTW",
        note: "A screen system",
      },
      {
        src: `${BRIEF}/Portfolio/applearn.png`,
        name: "Applearn",
        note: "Play and structure",
      },
    ],
    folds: [
      {
        name: "Component libraries",
        text: "The same buttons, type, and spacing on a simple site and a heavier application.",
      },
      {
        name: "Screen from the identity",
        text: "Drawn from the same system as the print. No orphaned digital look.",
      },
      {
        name: "Use, not decoration",
        text: "Layouts so people can find the work, buy, book, or read.",
      },
    ],
    needId: "design-multi-platform",
    cta: "Contact Design",
  },
  {
    id: "print",
    facet: "design",
    name: "Design for Print",
    title: "Design for print",
    lead: "Print you can send, hold, and put on the street — stationery, books, boards.",
    body: "The same identity you see on screen, cut for paper, board, and the street. Letterheads, literature, signage, and longer printed work.",
    stills: [],
    widget: "examples",
    examples: [
      {
        src: `${BRIEF}/Portfolio/wilson.png`,
        name: "Wilson Indeed",
        note: "A book",
      },
      {
        src: `${BRIEF}/PNGs/merz5.png`,
        name: "Merz Barn",
        note: "A book",
      },
      {
        src: `${BRIEF}/Portfolio/ahum.png`,
        name: "AH UM",
        note: "Editorial print",
      },
      {
        src: `${BRIEF}/PNGs/ah9.png`,
        name: "Hajime",
        note: "Hajime Yoshizawa",
      },
      {
        src: `${BRIEF}/Portfolio/Combo1.png`,
        name: "Selected print",
        note: "Stationery and literature",
      },
    ],
    folds: [
      {
        name: "Stationery and literature",
        text: "Letterheads, documents, and the printed pieces you actually send.",
      },
      {
        name: "Signage and the street",
        text: "Layouts that hold at a distance — boards, vinyl, the identity in a real place.",
      },
      {
        name: "Editorial",
        text: "Publications and longer printed work, set in the same system.",
      },
    ],
    needId: "design-print",
    cta: "Contact Design",
  },
  {
    id: "packaging",
    facet: "design",
    name: "Packaging",
    title: "Packaging",
    lead: "The pack is the brand: box, label, and the moment they open it.",
    body: "The identity is in the object, not stuck on afterwards. How it sits, stacks, ships — and the sequence someone actually meets.",
    stills: [],
    widget: "examples",
    examples: [
      {
        src: `${BRIEF}/Portfolio/HT4.png`,
        name: "ModYu HT4",
        note: "The bottles",
      },
      {
        src: `${BRIEF}/Portfolio/L_homme.png`,
        name: "Selected pack",
        note: "The bag",
      },
    ],
    folds: [
      {
        name: "Structure",
        text: "The box, the sleeve, the pack — how it sits, stacks, and ships.",
      },
      {
        name: "Label and finish",
        text: "Print, foil, board, and the small decisions that make a pack feel like the brand.",
      },
      {
        name: "Unboxing",
        text: "The sequence someone actually meets — not a render of a closed carton.",
      },
    ],
    needId: "design-packaging",
    cta: "Contact Design",
  },
  {
    id: "brand",
    facet: "strategy",
    name: "Brand Strategy",
    title: "Brand strategy",
    lead: "Who you are, who it is for, and where you want to be — written so the rest of the work has somewhere to sit.",
    body: "The core brand, before it becomes a campaign: phone, a window, a letter. A document you can actually run.",
    stills: [],
    widget: "brand-kit",
    folds: [
      {
        name: "Who you are",
        text: "We sit with the people behind the name until the words are true — not a mood board with a slogan.",
      },
      {
        name: "Who it is for",
        text: "Who you want to appeal to, and who you will not be. That is the architecture before a logo is drawn.",
      },
      {
        name: "Where you want to be",
        text: "A line the business can run from. Come in on Strategy and we map it with you.",
      },
    ],
    needId: "consultancy-session",
    cta: "Contact our consultants",
  },
  {
    id: "marketing",
    facet: "strategy",
    name: "Marketing Strategy",
    title: "Marketing strategy",
    lead: "How the brand goes out — books, bottles, boards — and what you learn so the next time is better.",
    body: "Brand strategy is the core. Marketing is how people receive it, online included. The next time is from what actually happened, not a guess.",
    stills: [],
    widget: "market-kit",
    folds: [
      {
        name: "How it goes out",
        text: "Print, pack, the street, the inbox. The same identity, in the world.",
      },
      {
        name: "How people receive it",
        text: "Structured communication, not a pile of posts. Workshops with the people who have to live the plan.",
      },
      {
        name: "What you learn",
        text: "The next time you put something out, it is from what actually happened.",
      },
    ],
    needId: "workshop-review",
    cta: "Contact our consultants",
  },
  {
    id: "online",
    facet: "strategy",
    name: "Online Strategy",
    title: "Online strategy",
    lead: "One-to-one counsel on the tools, channels, and content you actually use.",
    body: "Sessions you can run with, not a talk about process. Two hours, a half day, or a full day.",
    stills: [
      `${BRIEF}/stills/solport.png`,
      `${BRIEF}/Frameworks/DLNFrameworks-02.png`,
      `${BRIEF}/PNGs/Lab.png`,
    ],
    folds: [
      {
        name: "Two hours",
        text: "Overview, problem solving, and creative brainstorming. Enough to unblock a live question.",
      },
      {
        name: "Half day",
        text: "Brand, marketing, and online strategy in one working session — audits included when that is the work.",
      },
      {
        name: "Full day",
        text: "Over-arching counsel. The whole picture, with time to write the next move.",
      },
    ],
    widget: "solport",
    hide: true,
    needId: "consultancy-session",
    cta: "Contact our consultants",
  },
  {
    id: "startup",
    facet: "strategy",
    name: "Start-up Strategy",
    title: "Start-up strategy",
    lead: "Two hours. Who you want to be, who you will be, how you say it, who it is for.",
    body: "We talk until you have something you can build from — not a pitch-deck look. Same evidence we use later, with less of it.",
    stills: [],
    folds: [
      {
        name: "Who you want to be",
        text: "The name, the stance, and what must be true before you spend on a logo or a site.",
      },
      {
        name: "How you show it",
        text: "How you describe yourself and display yourself — so Design and Build have a brief, not a guess.",
      },
      {
        name: "Who you are going after",
        text: "The people it is for. Two hours is often enough to isolate the variables.",
      },
    ],
    widget: "startup-talk",
    needId: "startup-blueprint",
    cta: "Contact our consultants",
  },
  {
    id: "audits",
    facet: "strategy",
    name: "Brand Audits",
    title: "Brand audits",
    lead: "What you run now. We come in. A clearer brand on the other side.",
    body: "We look at what you already have — visual, verbal, technical — and walk it to something held together. You leave with what to keep and what to change.",
    stills: [],
    folds: [
      {
        name: "What you run now",
        text: "Does the identity still match the business. Where it has drifted. What to keep.",
      },
      {
        name: "We come in",
        text: "Print, pack, site, and the spaces in between — where they fail to meet.",
      },
      {
        name: "A clearer brand",
        text: "The same name, held together. A document you can run.",
      },
    ],
    widget: "audit-path",
    needId: "identity-outdated",
    cta: "Contact our consultants",
  },
  {
    id: "counsel",
    facet: "strategy",
    name: "Over-arching Strategic Consultancy",
    title: "Over-arching counsel",
    lead: "The same working session as start-up, with more in the room — brand, marketing, and a plan you can run.",
    body: "One-to-one or group. Online is inside that work, not a separate offer. Two hours, a half day, or a full day.",
    stills: [],
    folds: [
      {
        name: "The working session",
        text: "Two hours, a half day, or a full day. Same talk. Different depth.",
      },
      {
        name: "More in the room",
        text: "Who you are, who it is for, how you show it — held together for a business that already runs.",
      },
      {
        name: "A way back in",
        text: "Understanding, planning, and a way back in as the work moves.",
      },
    ],
    widget: "sitting",
    needId: "consultancy-session",
    cta: "Contact our consultants",
  },
  {
    id: "simple",
    facet: "build",
    name: "Simple sites",
    title: "Simple sites",
    lead: "A gallery, a shop, a page, a diary — a simple site, done properly.",
    body: "New, a rebuild, or a facelift. You leave a note. We come in. When it is ready it can move onto a domain of your own, and we still host it while it grows.",
    stills: [],
    widget: "examples",
    examples: [
      {
        src: `${BRIEF}/Portfolio/paulfosbury.png`,
        name: "Paul Fosbury Portraits",
        note: "A simple gallery",
      },
      {
        src: `${BRIEF}/Portfolio/FollicleFiles.png`,
        name: "Follicle Files",
        note: "A simple page",
      },
      {
        src: `${BRIEF}/PNGs/website.png`,
        name: "A simple wall",
        note: "A simple shop front",
      },
    ],
    folds: [
      {
        name: "Done properly",
        text: "Type, identity, hosting, and a way for you to leave a note.",
      },
      {
        name: "Then we host it",
        text: "The live site stays up. A private preview can reopen whenever you want to edit again — you pay for the preview while it is open.",
      },
    ],
    needId: "web-simple-site",
    cta: "Contact the web team",
  },
  {
    id: "workspaces",
    facet: "build",
    name: "Interactive Workspaces",
    title: "Interactive workspaces",
    lead: "Your brand. Your home. A space people actually work in.",
    body: "Incoming, in work, done. How it looks is yours. The live site stays up; a private preview can reopen when you want to edit again.",
    stills: [],
    widget: "workspace",
    folds: [
      {
        name: "A room with a job",
        text: "The space people work in, built around the brand — not a brochure that pretends to move.",
      },
    ],
    needId: "web-corporate",
    cta: "Contact the web team",
  },
  {
    id: "apps",
    facet: "build",
    name: "Custom Web Applications",
    title: "Custom web applications",
    lead: "Software people use in the browser — not a brochure with a cart bolted on.",
    body: "Dashboards, commerce, the desk behind the brand. The live site stays up; a private preview can reopen when you want to edit again.",
    stills: [],
    widget: "checkout",
    folds: [
      {
        name: "The product is the presence",
        text: "Front, the transaction, and the desk in one system.",
      },
    ],
    needId: "web-ecommerce",
    cta: "Contact the web team",
  },
  {
    id: "modernize",
    facet: "build",
    name: "System Modernization",
    title: "System modernization",
    lead: "Your live site stays up. The next one is built beside it. You watch, then it goes live.",
    body: "A facelift or a rebuild — said plainly, without a slight to who built what is up now. A private preview can reopen later; the live site stays.",
    stills: [],
    widget: "modernize",
    folds: [
      {
        name: "Sit with, not over",
        text: "A rebuild sits with the people who built the live site.",
      },
    ],
    needId: "web-infra-audit",
    cta: "Contact the web team",
  },
  {
    id: "api",
    facet: "build",
    name: "Systems",
    title: "Systems",
    lead: "Sign-in, data, the desk behind the site — the work the public never sees.",
    body: "From the ground up, or as you grow. If you already run something, we can join that too. We build it, we host it, we keep it.",
    stills: [],
    widget: "joins",
    folds: [
      {
        name: "We host it",
        text: "Live site, or a private preview, or both. Reopen the preview whenever you want to edit again.",
      },
    ],
    needId: "web-api-dashboard",
    cta: "Contact the web team",
  },
];

const STRATEGY_ORDER: LineId[] = [
  "startup",
  "brand",
  "marketing",
  "audits",
  "counsel",
];

export function linesFor(facet: Facet): WorkLine[] {
  const rows = WORK_LINES.filter((row) => row.facet === facet && !row.hide);
  if (facet !== "strategy") return rows;
  return STRATEGY_ORDER.map((id) => rows.find((row) => row.id === id)).filter(
    (row): row is WorkLine => Boolean(row),
  );
}

export function lineById(id: string): WorkLine | undefined {
  return WORK_LINES.find((row) => row.id === id);
}

export function firstLine(facet: Facet): WorkLine {
  return linesFor(facet)[0];
}
