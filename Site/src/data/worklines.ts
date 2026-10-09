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
  | "avenue"
  | "pack-loop";

export type LineExample = {
  src: string;
  name: string;
  note?: string;
};

export const STRATEGY_OPEN =
  "Sit down with branding expert Dave Kirkwood to discuss";

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
  marks?: string[];
  buzz?: string[];
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
    hide: true,
  },
  {
    id: "identity",
    facet: "design",
    name: "Brand Identity Systems",
    title: "Brand identity systems",
    lead: "One system, in the places people actually meet you: on the desk, and in the hand.",
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
        src: `${BRIEF}/Portfolio/Modyu.png`,
        name: "On the laptop",
        note: "On the desk",
      },
      {
        src: `${BRIEF}/Portfolio/Deti.png`,
        name: "On the phone",
        note: "In the hand",
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
    lead: "The look of a screen — from a board down to the hand. Same identity as the print, not a later coat of paint.",
    body: "How the work sits on a surface: a wall, a window, a laptop, a phone. No mock product screens. The graphic side of the build morph.",
    stills: [],
    widget: "ui-kit",
    examples: [],
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
    widget: "pack-loop",
    examples: [],
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
        text: "The sequence someone actually meets when they open it.",
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
    lead: "The brand to the core: who you are, who it is for and where you want to be.",
    body: "",
    stills: [],
    widget: "avenue",
    marks: ["who you are", "who it is for", "where you want to be"],
    folds: [
      {
        name: "Who you are",
        text: "The people behind the name, until the words are true.",
      },
      {
        name: "Who it is for",
        text: "Who you want to appeal to, and who you will not be.",
      },
      {
        name: "Where you want to be",
        text: "A line the business can run from.",
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
    lead: "Talk about how the brand goes out.",
    body: "",
    stills: [],
    widget: "avenue",
    marks: ["how the brand goes out"],
    folds: [
      {
        name: "How it goes out",
        text: "Print, pack, the street, the inbox.",
      },
      {
        name: "How people receive it",
        text: "Structured communication, not a pile of posts.",
      },
      {
        name: "What you learn",
        text: "The next time is from what actually happened.",
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
    lead: "You have an idea you want to pull the trigger on.",
    body: "You have an idea you want to pull the trigger on.",
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
    widget: "avenue",
    needId: "startup-blueprint",
    cta: "Contact our consultants",
  },
  {
    id: "audits",
    facet: "strategy",
    name: "Brand Audits",
    title: "Brand audits",
    lead: "Something's not working. Let's fix it together.",
    body: "Something's not working. Let's fix it together.",
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
    widget: "avenue",
    needId: "identity-outdated",
    cta: "Contact our consultants",
  },
  {
    id: "counsel",
    facet: "strategy",
    name: "Over-arching Strategic Consultancy",
    title: "Over-arching counsel",
    lead: "You have a business, but you're lost with the identity.",
    body: "You have a business, but you're lost with the identity.",
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
    widget: "avenue",
    needId: "consultancy-session",
    cta: "Contact our consultants",
  },
  {
    id: "simple",
    facet: "build",
    name: "Simple sites",
    title: "Simple sites",
    lead: "Website development — brochure, catalogue, shop front, booking — with the same care as the heavier work.",
    body: "From the ground, a rebuild, or a facelift. UI/UX for the pages people actually use. When it is ready it can move onto a domain of your own, and we still host it while it grows.",
    stills: [],
    widget: "avenue",
    examples: [],
    folds: [
      {
        name: "Website development",
        text: "Build the space for the brand to grow.",
      },
      {
        name: "UI/UX of the page",
        text: "How the public interact with the brand.",
      },
      {
        name: "Then we host it",
        text: "A dynamic workspace. Push to the live site whenever you want.",
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
    lead: "A space your customers and your team work inside together — the interface is the system.",
    body: "Not a brochure that pretends to move. Roles, records, and the work itself, in one environment built around the brand.",
    stills: [],
    widget: "avenue",
    folds: [
      {
        name: "A shared environment",
        text: "Customers and team, in the same system.",
      },
      {
        name: "The system is the room",
        text: "Workflow, records, the operational desk.",
      },
      {
        name: "Built around the brand",
        text: "How it looks is yours. What behaves is your choice.",
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
    lead: "Web and mobile app development — software people use, not a brochure with a cart bolted on.",
    body: "Dashboards, commerce, the operational desk. Front, the transaction, and the data in one application.",
    stills: [],
    widget: "avenue",
    folds: [
      {
        name: "Web application development",
        text: "Browser software that is the product — accounts, the transaction, the desk.",
      },
      {
        name: "Mobile",
        text: "The same system in the hand, not a squeezed website.",
      },
      {
        name: "Commerce and the desk",
        text: "Orders, catalogues, front and back as one application.",
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
    lead: "The live platform stays up. The next one is built beside it.",
    body: "A facelift or a rebuild — said plainly, without a slight to who built what is up now.",
    stills: [],
    widget: "avenue",
    folds: [
      {
        name: "Live beside the next",
        text: "The public site stays up. The next platform is built beside it.",
      },
      {
        name: "Interfaces and data",
        text: "UI/UX, records, and the joins — moved, not dumped.",
      },
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
    lead: "Database systems, authentication, APIs, and the operational layer the public never sees.",
    body: "From the ground, or grown onto what you already run. Mapping, delivery, stock, the desk.",
    stills: [],
    widget: "avenue",
    folds: [
      {
        name: "Database systems",
        text: "One record. The desk tells the truth.",
      },
      {
        name: "APIs and joins",
        text: "Mail, pay, stock, maps. If you already run something, we join it.",
      },
      {
        name: "Neural-network-influenced systems",
        text: "Models inside the operation — the work the public never sees.",
      },
      {
        name: "Host",
        text: "Live and private preview as one.",
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
