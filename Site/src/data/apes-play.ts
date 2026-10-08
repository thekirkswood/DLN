/** A.P.E.S. faculty play. Source: APES2 + Binder3 compass + TaskEx pack. Not the Swarm hive. */

export type ApesMindsetId = "analytical" | "practical" | "emotional" | "social";
export type ApesTaskId = "creative" | "critical" | "decision" | "full";

export type ApesMindset = {
  id: ApesMindsetId;
  letter: "A" | "P" | "E" | "S";
  name: string;
  ask: string;
  body: string;
  looks: string[];
  strong: string[];
  fail: string;
  questions: string[];
};

export type ApesTaskType = {
  id: ApesTaskId;
  name: string;
  body: string;
  move: string;
};

export type ApesCard = {
  id: string;
  name: string;
  ask: string;
  prompts: string[];
};

export type ApesStep = {
  id: string;
  n: string;
  name: string;
  job: string;
};

export const APES_MINDSETS: ApesMindset[] = [
  {
    id: "analytical",
    letter: "A",
    name: "Analytical",
    ask: "Does this make sense? Is it consistent? Can it be explained?",
    body: "Clarity, evidence, structure, coherence. Break it down, compare, and name what actually matters.",
    looks: ["logic", "evidence", "structure", "coherence"],
    strong: [
      "Reduces complexity into parts you can hold.",
      "Compares options against criteria you can say out loud.",
      "Finds contradictions, gaps, and weak reasoning.",
    ],
    fail: "Looks correct on paper and hollow in use. Certainty arrives before the other three have spoken.",
    questions: [
      "What are the known facts?",
      "What do we know for sure?",
      "What evidence do we have?",
      "Where is the contradiction?",
    ],
  },
  {
    id: "practical",
    letter: "P",
    name: "Practical",
    ask: "Can this be done? Who does what, when, and with what?",
    body: "Feasibility, resources, timing, delivery. Will it survive contact with the week, the budget, and the people who have to run it.",
    looks: ["feasibility", "resources", "timing", "execution"],
    strong: [
      "Turns intention into steps and sequences.",
      "Names bottlenecks, ownership, and dependencies.",
      "Works inside constraints instead of wishing them away.",
    ],
    fail: "Activity that looks like progress. Ships cleanly and never quite means anything.",
    questions: [
      "Who does this, and with what?",
      "What will break first — time, money, or people?",
      "Will it survive maintenance, not only launch?",
      "What has to be true next Tuesday?",
    ],
  },
  {
    id: "emotional",
    letter: "E",
    name: "Emotional",
    ask: "How will this be felt? Where is trust, meaning, and the thing left unsaid?",
    body: "Felt experience, motivation, trust, meaning. The work has to be inhabited, not only approved.",
    looks: ["feeling", "motivation", "trust", "meaning"],
    strong: [
      "Hears what the brief will not write down.",
      "Tests whether people will live with the choice.",
      "Keeps conviction next to the argument.",
    ],
    fail: "Persuasion dressed as care. A line that photographs well and no one believes.",
    questions: [
      "How will this be felt in the room?",
      "What does it mean to the people who have to wear it?",
      "Where is trust gained or spent?",
      "What does it leave unsaid?",
    ],
  },
  {
    id: "social",
    letter: "S",
    name: "Social",
    ask: "Who has to live with this, and how will it be read?",
    body: "Relationships, culture, communication, shared understanding. A decision is also how it lands between people.",
    looks: ["relationships", "culture", "communication", "shared meaning"],
    strong: [
      "Sees who speaks and who is silent.",
      "Reads the culture the work is walking into.",
      "Tests whether the group can hold the choice together.",
    ],
    fail: "A private correctness that cannot travel. The room nods and the culture does not.",
    questions: [
      "Who has to live with this?",
      "How will it be interpreted, not only received?",
      "What culture is this landing in?",
      "Who is missing from the table?",
    ],
  },
];

export const APES_TASK_TYPES: ApesTaskType[] = [
  {
    id: "creative",
    name: "Creative",
    body: "Generate range. An idea may start in any mindset. It must still walk the other three.",
    move: "Ask what it does, says, looks like, behaves as — then take each response through Analytical, Practical, Emotional, and Social.",
  },
  {
    id: "critical",
    name: "Critical",
    body: "Reasons for and against, from each mindset in turn. Taste is not the test.",
    move: "For and against, four times. Keep what still stands when all four have spoken.",
  },
  {
    id: "decision",
    name: "Decision",
    body: "What if. Then hold the choice across all four, not the loudest seat.",
    move: "Model the pathways. Rank them. Record why. Later work should see the reason, not only the pick.",
  },
  {
    id: "full",
    name: "360",
    body: "Hold Analytical, Practical, Emotional, and Social at once. Completeness is an illusion until you look.",
    move: "Do not end thought early. If one mindset is missing, the work is not finished.",
  },
];

export const APES_CYCLE: ApesStep[] = [
  { id: "launch", n: "1", name: "Launch", job: "Frame the task. Name the kind of thinking. Set limits. Do not solve it yet." },
  { id: "action", n: "2", name: "Action", job: "Get ideas moving. Range first. An idea that stays in one mindset is unfinished." },
  { id: "turnaround", n: "3", name: "Turnaround", job: "Know when to stop generating. Insight, tension, or a real choice has appeared." },
  { id: "reflect", n: "4", name: "Reflection", job: "Collect what emerged. Notice patterns, gaps, and the connections between mindsets." },
  { id: "land", n: "5", name: "Landing", job: "Return to delivery. Keep only what holds across all four." },
];

/** How the LLM interrogates context — Analyse / Probe / Evaluate / Synthesize. */
export const APES_INTERROGATE: ApesStep[] = [
  { id: "analyse", n: "A", name: "Analyse", job: "What is happening? What matters here?" },
  { id: "probe", n: "P", name: "Probe", job: "What do we need to know? Where is the uncertainty?" },
  { id: "evaluate", n: "E", name: "Evaluate", job: "What are the implications, risks, and trade-offs?" },
  { id: "synthesize", n: "S", name: "Synthesize", job: "What is the most coherent way forward?" },
];

export const APES_CARDS: ApesCard[] = [
  {
    id: "apes",
    name: "What is it",
    ask: "Facts, unknowns, evidence.",
    prompts: ["What are the known facts?", "What do we know for sure?", "What evidence do we have?"],
  },
  {
    id: "context",
    name: "Where / who",
    ask: "Broader context, stakeholders, environment.",
    prompts: ["What is the broader context?", "Who are the stakeholders?", "What is the environment?"],
  },
  {
    id: "drivers",
    name: "Why",
    ask: "Forces, root causes, what is really driving this.",
    prompts: ["What forces are at play?", "What are the root causes?", "What is really driving this?"],
  },
  {
    id: "risks",
    name: "What could go wrong",
    ask: "Risks, change, vulnerabilities.",
    prompts: ["What are the key risks?", "What could change?", "What are the vulnerabilities?"],
  },
  {
    id: "options",
    name: "What could we do",
    ask: "Options, alternatives, resources.",
    prompts: ["What are the possible options?", "What are the alternatives?", "What resources are available?"],
  },
  {
    id: "impact",
    name: "So what",
    ask: "Impacts, who is affected, which outcomes matter.",
    prompts: ["What are the impacts?", "Who will be affected?", "What outcomes matter most?"],
  },
];

/** TaskEx — operational loop of this faculty, not a Swarm product page. */
export const TASKEX_LOOP: ApesStep[] = [
  { id: "decompose", n: "1", name: "Decompose", job: "Clarify intent. Define outcomes. Identify the questions that matter." },
  { id: "plan", n: "2", name: "Plan pathways", job: "Identify options. Sequence tasks. Assign who, and with what." },
  { id: "orchestrate", n: "3", name: "Orchestrate", job: "Execute. Coordinate. Track. Hold the dependencies." },
  { id: "replan", n: "4", name: "Re-plan", job: "Assess context. Review feedback. Adjust plans and priorities." },
  { id: "escalate", n: "5", name: "Escalate / route", job: "Issues, risks, and exceptions go to the right seat — agent, human, or system." },
  { id: "memory", n: "6", name: "Memory", job: "Record decisions, outcomes, and context so the next cycle is not starting blind." },
];

/** APES2 pp. 37–38. Diagnostic of partial attention — not a personality quiz. Not Swarm. */
export type ApesCombo = {
  id: string;
  lenses: string;
  a: string;
  p: string;
  e: string;
  s: string;
  outcome: string;
  line: string;
};

export const APES_COMBINATIONS: ApesCombo[] = [
  {
    id: "a",
    lenses: "A",
    a: "statistically correct, logically sound",
    p: "not practical",
    e: "no emotional connection",
    s: "out of step with culture",
    outcome: "Pricing fair on paper, impossible to explain or use.",
    line: "On paper it makes sense. In real life, nobody wants it.",
  },
  {
    id: "p",
    lenses: "P",
    a: "unexamined assumptions",
    p: "works, ships, functions",
    e: "feels utilitarian",
    s: "no wider resonance",
    outcome: "Internal tool everyone uses, nobody likes.",
    line: "",
  },
  {
    id: "e",
    lenses: "E",
    a: "vague / inconsistent",
    p: "fragile / hard to sustain",
    e: "powerful emotional hit",
    s: "misread or dismissed",
    outcome: "Campaign film that makes people cry but does not connect to behaviour.",
    line: "",
  },
  {
    id: "s",
    lenses: "S",
    a: "thin rationale",
    p: "operationally awkward",
    e: "emotionally neutral",
    s: "on trend, accepted",
    outcome: "Refresh that looks like everything else. Nobody objects. Nobody cares.",
    line: "",
  },
  {
    id: "ap",
    lenses: "A+P",
    a: "correct and optimised",
    p: "efficient and deliverable",
    e: "emotionally flat",
    s: "hard to love or adopt",
    outcome: "Works as specified, no traction.",
    line: "Nothing wrong with it. Just… nothing there.",
  },
  {
    id: "ae",
    lenses: "A+E",
    a: "conceptually coherent",
    p: "difficult to execute",
    e: "deeply engaging",
    s: "misaligned with context",
    outcome: "Compelling idea collapses in production.",
    line: "",
  },
  {
    id: "as",
    lenses: "A+S",
    a: "rationally justified",
    p: "cumbersome",
    e: "lacks warmth",
    s: "politically acceptable",
    outcome: "Committee-approved and lifeless.",
    line: "Everyone agreed. Nobody owns it.",
  },
  {
    id: "pe",
    lenses: "P+E",
    a: "weak evidence",
    p: "works smoothly",
    e: "feels good",
    s: "hard to legitimise",
    outcome: "Users love it; stakeholders cannot defend it.",
    line: "",
  },
  {
    id: "ps",
    lenses: "P+S",
    a: "under-analysed",
    p: "easy to implement",
    e: "emotionally neutral",
    s: "widely accepted",
    outcome: "Safe roll-out, no excitement.",
    line: "It works everywhere. It stands for nothing.",
  },
  {
    id: "es",
    lenses: "E+S",
    a: "conceptually loose",
    p: "operationally fragile",
    e: "emotionally resonant",
    s: "culturally aligned",
    outcome: "Loved for a while, then fades.",
    line: "",
  },
  {
    id: "ape",
    lenses: "A+P+E",
    a: "bang on",
    p: "beautifully made",
    e: "a real keeper",
    s: "socially awkward",
    outcome: "Perfect to you; friends would not get it.",
    line: "",
  },
  {
    id: "aps",
    lenses: "A+P+S",
    a: "well reasoned",
    p: "scales reliably",
    e: "emotionally distant",
    s: "institutionally trusted",
    outcome: "Solid, adopted, not human.",
    line: "",
  },
  {
    id: "aes",
    lenses: "A+E+S",
    a: "intellectually sound",
    p: "hard to maintain",
    e: "emotionally convincing",
    s: "socially meaningful",
    outcome: "People believe; delivery burns out.",
    line: "",
  },
  {
    id: "pes",
    lenses: "P+E+S",
    a: "thin analytical grounding",
    p: "easy to run",
    e: "feels good",
    s: "readily accepted",
    outcome: "Works until hidden costs appear.",
    line: "",
  },
  {
    id: "full",
    lenses: "A+P+E+S",
    a: "coherent and defensible",
    p: "sustainable and executable",
    e: "feels true and engaging",
    s: "lives comfortably in the world",
    outcome: "It holds up. It travels. It lasts.",
    line: "",
  },
];

export function apesMindset(id: string): ApesMindset | undefined {
  return APES_MINDSETS.find((m) => m.id === id);
}

export function apesTaskType(id: string): ApesTaskType | undefined {
  return APES_TASK_TYPES.find((t) => t.id === id);
}

export function isApesMindset(id: string): id is ApesMindsetId {
  return APES_MINDSETS.some((m) => m.id === id);
}
