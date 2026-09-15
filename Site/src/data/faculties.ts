/** Seven faculties + VT library. Copy locked from methodology page.pdf and plate captions. */

export const BRIEF = "/brief";

export type FacultyId =
  | "comms"
  | "mapping"
  | "process"
  | "workbench"
  | "apes"
  | "identity"
  | "solport";

export type Faculty = {
  id: FacultyId;
  n: string;
  name: string;
  plate: string;
  caption: string;
  foundation: string;
  approach: string;
  goal: string;
};

export const FACULTIES: Faculty[] = [
  {
    id: "comms",
    n: "01",
    name: "Comms",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-06.png`,
    caption: "Foundational identity system project preparation",
    foundation: "The bedrock of human interaction.",
    approach:
      "Structured communication frameworks and Lasswell’s model to anchor the message.",
    goal: "Clarity and intent across every spotlight moment.",
  },
  {
    id: "mapping",
    n: "02",
    name: "System Mapping",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-05.png`,
    caption: "Your brand mapped in your context. A brand landscape process.",
    foundation: "Project engineering and brand architecture.",
    approach:
      "Planning, research, analysis, and discovery before a line is drawn.",
    goal: "Initial strategies and design directions that hold.",
  },
  {
    id: "process",
    n: "03",
    name: "8 Process",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-04.png`,
    caption: "The comprehensive 8 phase process",
    foundation: "The eight-stage delivery process.",
    approach:
      "Project alignment, budgets, resources, and timeline momentum.",
    goal: "Clear briefing, structured phases, and sign-off checkpoints.",
  },
  {
    id: "workbench",
    n: "04",
    name: "Workbench",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-07.png`,
    caption: "Taking great ideas through the process",
    foundation: "Technical and vocational execution.",
    approach:
      "The coal face of making — artwork, production, code, printers, and servers.",
    goal: "Delivery where execution matches strategy.",
  },
  {
    id: "apes",
    n: "05",
    name: "A.P.E.S.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-08.png`,
    caption: "Full 360 creative and critical thinking and decision making",
    foundation: "Cognitive precision.",
    approach:
      "Creative thinking, critical analysis, and objective decision-making.",
    goal: "Choices you can stand behind, not guesswork.",
  },
  {
    id: "identity",
    n: "06",
    name: "Identity systems toolkits",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-03.png`,
    caption: "Tools to print or buy — for humans only",
    foundation: "Deep-level brand architectures.",
    approach:
      "Understanding, breaking, and fixing identity systems. Principles, ethics, protocols.",
    goal: "Systems that hold as the work grows.",
  },
  {
    id: "solport",
    n: "07",
    name: "Solport Sessions",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-02.png`,
    caption: "One-to-one online strategy sessions",
    foundation: "Collaborative integration.",
    approach:
      "Direct work with clients, peers, and students — the tools, channels, and content we use in the world.",
    goal: "Sessions you can run with, not a talk about process.",
  },
];

/** Eighth plate: greenhouse product, not a campus faculty. */
export const VT_LIBRARY = {
  n: "08",
  name: "Various Titles",
  plate: `${BRIEF}/Frameworks/DLNFrameworks-01.png`,
  line: "The seven frameworks behind the work, as a resource you can learn from in Various Titles.",
  href: "/greenhouse/various-titles",
} as const;

export const ENGINE_STAGES = [
  {
    n: "1",
    name: "The Project",
    body: "You leave knowing what the work is, and what it is not.",
    more: "What we will hold as true before anyone draws.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-01.png`,
  },
  {
    n: "2",
    name: "The People",
    body: "Who is in the room, and who has to live the plan.",
    more: "How we talk so the work stays one thing.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-06.png`,
  },
  {
    n: "3",
    name: "Research, Analytics and Discovery",
    body: "What you already run, who it is for, what the market needs.",
    more: "Evidence before a line is drawn.",
    plate: `${BRIEF}/PNGs/logos-06.png`,
  },
  {
    n: "4",
    name: "Initial Ideas",
    body: "A wide pass. Nothing is the answer yet.",
    more: "The point is to see the range, then we cut.",
    plate: `${BRIEF}/PNGs/logos-01.png`,
  },
  {
    n: "5",
    name: "The Concept",
    body: "One direction you can hold.",
    more: "Naming, positioning, and the first system sit here.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-03.png`,
  },
  {
    n: "6",
    name: "The Build",
    body: "This is where the work is made, not described.",
    more: "Print, screen, or the working session itself.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-04.png`,
  },
  {
    n: "7",
    name: "The Implementation",
    body: "It leaves the desk. Out in the world.",
    more: "The live site, the pack, the notes from the session.",
    plate: `${BRIEF}/Frameworks/DLNFrameworks-02.png`,
  },
  {
    n: "8",
    name: "The Guardianship",
    body: "Looked after, not left.",
    more: "We keep coming in. A private preview can reopen. The live site stays up.",
    plate: `${BRIEF}/PNGs/logos-05.png`,
  },
] as const;

export type PipelineId = "consultancy" | "design" | "websites";

export const PIPELINES: {
  id: PipelineId;
  name: string;
  path: string;
  outputs: string[];
}[] = [
  {
    id: "consultancy",
    name: "Consultancy",
    path: "Understand the work, write the plan, stay with it.",
    outputs: [
      "Business and brand strategy",
      "Scope audits",
      "Market positioning blueprint",
    ],
  },
  {
    id: "design",
    name: "Design",
    path: "Concepts, then print and screen as one system.",
    outputs: [
      "Design for print",
      "Tactile packaging",
      "Multi-platform design systems",
      "Master identity guidelines",
    ],
  },
  {
    id: "websites",
    name: "Websites",
    path: "Brief first. Make it. Host it while it grows.",
    outputs: [
      "High-performance sites and commerce",
      "Backend dashboards",
      "Portfolio sites",
      "Hosting infrastructure",
    ],
  },
];

export const FILTERS = [
  {
    id: "commercial",
    name: "Commercial",
    body: "A measurable return for the investment.",
  },
  {
    id: "human",
    name: "Human",
    body: "Well-being, clarity, and the people who use the work.",
  },
  {
    id: "social",
    name: "Social",
    body: "No bad design, ugly execution, AI slop, marketing bumf, or waste.",
  },
  {
    id: "environmental",
    name: "Environmental",
    body: "A sustainable practice, mirrored by the studio and the border land we are rewilding and conserving.",
  },
] as const;

export const STAGE_FRAMES = [
  `${BRIEF}/motion/frames/film-01.png`,
  `${BRIEF}/motion/frames/film-02.png`,
  `${BRIEF}/motion/frames/film-03.png`,
  `${BRIEF}/motion/frames/film-04.png`,
  `${BRIEF}/motion/frames/film-05.png`,
  `${BRIEF}/motion/frames/film-06.png`,
  `${BRIEF}/motion/frames/film-07.png`,
  `${BRIEF}/motion/frames/film-08.png`,
  `${BRIEF}/motion/frames/film-09.png`,
  `${BRIEF}/motion/frames/film-10.png`,
  `${BRIEF}/motion/frames/film-11.png`,
  `${BRIEF}/motion/frames/film-12.png`,
  `${BRIEF}/motion/frames/film-13.png`,
  `${BRIEF}/motion/frames/film-14.png`,
  `${BRIEF}/motion/frames/film-15.png`,
  `${BRIEF}/motion/frames/film-16.png`,
  `${BRIEF}/motion/frames/film-17.png`,
  `${BRIEF}/motion/frames/film-18.png`,
] as const;

export function facultyById(id: string): Faculty | undefined {
  return FACULTIES.find((f) => f.id === id);
}

export function facultyGlyph(id: string): string {
  const f = facultyById(id);
  if (!f) return "/brand/dln-mute.png";
  return `/brand/framework/${f.n}-${f.id}.png`;
}
