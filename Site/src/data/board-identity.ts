/** Left column they populate. Each bit is its own room. Copy from Binder3 + board-sheets. */

export type BitKind =
  | "statements"
  | "job"
  | "future"
  | "offer"
  | "quiet"
  | "one-idea"
  | "stand"
  | "point"
  | "trade"
  | "type"
  | "hold-us"
  | "count"
  | "feel"
  | "place"
  | "named"
  | "story"
  | "behave"
  | "bar"
  | "line"
  | "why";

export type BitChoice = { id: string; label: string };

export type BitField = {
  key: string;
  label: string;
  hint: string;
  rows?: number;
  choice?: BitChoice[];
};

export type BitRoom = {
  id: string;
  kind: BitKind;
  stand: string;
  fields: BitField[];
  crosses: { href: string; label: string }[];
};

const YES_NO: BitChoice[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

export const BIT_ROOMS: BitRoom[] = [
  {
    id: "identity",
    kind: "statements",
    stand: "Sentences they would actually say. Not an about-us paragraph.",
    fields: [
      { key: "one", label: "First statement", hint: "In their words. One sentence.", rows: 3 },
      { key: "two", label: "Second", hint: "Leave blank if there is only one.", rows: 3 },
      { key: "three", label: "Third", hint: "If everything is a statement, none of them are.", rows: 3 },
      { key: "not", label: "What this is not", hint: "A sentence they would refuse to print.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/mission", label: "Mission" },
      { href: "/board/plot/personality", label: "Personality" },
      { href: "/board/identity/systems", label: "Identity systems" },
    ],
  },
  {
    id: "mission",
    kind: "job",
    stand: "Mission is a job of work. If it could sit on any site, it is empty.",
    fields: [
      { key: "job", label: "The job", hint: "What this plot is for, in motion. One line they can stand in.", rows: 3 },
      { key: "for", label: "For whom", hint: "A real group on the right of the table, not ‘everyone’.", rows: 3 },
      { key: "lie", label: "When this would be a lie", hint: "A Tuesday this mission would not survive.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/purpose", label: "Purpose" },
      { href: "/board/plot/promise", label: "Promise" },
      { href: "/board/mapping/audience", label: "Customer seats" },
    ],
  },
  {
    id: "vision",
    kind: "future",
    stand: "A future you could recognise. Not a mood.",
    fields: [
      { key: "arrive", label: "If we arrived", hint: "What would we see, hear, or hold?", rows: 4 },
      { key: "when", label: "By when, if that is honest", hint: "A year is allowed. ‘Soon’ is not.", rows: 2 },
      { key: "not", label: "What this future is not", hint: "The neighbour’s vision, or a slogan you will not keep.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/mission", label: "Mission" },
      { href: "/board/plot/big-idea", label: "Big idea" },
    ],
  },
  {
    id: "proposition",
    kind: "offer",
    stand: "If they cannot say yes or no, it is not a proposition.",
    fields: [
      { key: "offer", label: "What is being offered", hint: "The thing, not the feeling of the thing.", rows: 3 },
      { key: "whom", label: "To whom", hint: "Point at a seat on the right.", rows: 3 },
      { key: "answer", label: "The yes or the no", hint: "What would make someone take it, or walk.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/value", label: "Value" },
      { href: "/board/plot/benefit", label: "Benefit" },
      { href: "/board/mapping/audience", label: "Customer seats" },
    ],
  },
  {
    id: "purpose",
    kind: "quiet",
    stand: "Why this exists when nobody is watching. It has to survive a quiet month.",
    fields: [
      { key: "why", label: "When it is not launching", hint: "A purpose that only works in a campaign is a campaign.", rows: 4 },
      { key: "without", label: "Without an audience", hint: "What still has to be true.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/mission", label: "Mission" },
      { href: "/board/plot/philosophy", label: "Philosophy" },
    ],
  },
  {
    id: "big-idea",
    kind: "one-idea",
    stand: "The idea the rest of the table has to serve. If everything is the big idea, nothing is.",
    fields: [
      { key: "idea", label: "The one idea", hint: "Short enough to hold in the centre of the table.", rows: 3 },
      { key: "serves", label: "What on this table it must serve", hint: "A cell that would break if this idea were wrong.", rows: 3 },
      { key: "not", label: "Ideas that are not this", hint: "Name the ones you will stop treating as the idea.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/mission", label: "Mission" },
      { href: "/board/plot/positioning", label: "Positioning" },
      { href: "/board/workbench/ideas", label: "Ideas through" },
    ],
  },
  {
    id: "positioning",
    kind: "stand",
    stand: "Where this stands, next to the landscape. Without that cell it is a pose.",
    fields: [
      { key: "where", label: "Where we stand", hint: "Relative to the world along the top of the table.", rows: 3 },
      { key: "next", label: "Next to whom", hint: "A named neighbour, advocate, or market — not ‘the competition’.", rows: 3 },
      { key: "not", label: "Where we will not stand", hint: "A place that would make the brand a second identity.", rows: 3 },
    ],
    crosses: [
      { href: "/board/mapping/landscape", label: "Landscape" },
      { href: "/board/plot/differentiation", label: "Differentiation" },
      { href: "/board/plot/brand-type", label: "Brand type" },
    ],
  },
  {
    id: "differentiation",
    kind: "point",
    stand: "A difference a customer could point at. Not a comparative adjective.",
    fields: [
      { key: "point", label: "What they can point at", hint: "In use. In the hand, on the screen, in the room.", rows: 4 },
      { key: "neighbour", label: "That the neighbour cannot", hint: "Name the neighbour, or say you do not know yet.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/features", label: "Features" },
      { href: "/board/plot/value", label: "Value" },
      { href: "/board/plot/positioning", label: "Positioning" },
    ],
  },
  {
    id: "value",
    kind: "trade",
    stand: "What they get that costs them something real. ‘Quality’ is not a value proposition.",
    fields: [
      { key: "get", label: "What they get", hint: "The exchange, said so a person could hear it.", rows: 3 },
      { key: "cost", label: "What it costs them", hint: "Money, time, reputation, a habit they drop.", rows: 3 },
      { key: "fair", label: "Why that trade is fair", hint: "If it is not fair, this cell is a lie.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/benefit", label: "Benefit" },
      { href: "/board/plot/proposition", label: "Proposition" },
      { href: "/board/mapping/audience", label: "Customer seats" },
    ],
  },
  {
    id: "brand-type",
    kind: "type",
    stand: "Type constrains the toolkit. A house cannot pretend to be a rebel every Tuesday.",
    fields: [
      { key: "is", label: "What kind of brand this is allowed to be", hint: "A type you can keep, not a costume.", rows: 4 },
      { key: "not", label: "What type it must not play at", hint: "The one that would split the identity.", rows: 4 },
    ],
    crosses: [
      { href: "/board/plot/personality", label: "Personality" },
      { href: "/board/plot/positioning", label: "Positioning" },
      { href: "/board/identity/toolkit", label: "Toolkit" },
    ],
  },
  {
    id: "promise",
    kind: "hold-us",
    stand: "What we will do that they can hold us to. A promise you cannot keep is a future complaint.",
    fields: [
      { key: "will", label: "What we promise", hint: "A doing, not a feeling.", rows: 3 },
      { key: "know", label: "How they would know we kept it", hint: "Something they could check without us in the room.", rows: 3 },
      { key: "break", label: "What would break it", hint: "Name the failure, not a mood.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/mission", label: "Mission" },
      { href: "/board/plot/standards", label: "Standards" },
      { href: "/board/mapping/opinion", label: "Public opinion" },
    ],
  },
  {
    id: "features",
    kind: "count",
    stand: "What it has, in fact. Features are not benefits. Keep them honest and countable.",
    fields: [
      { key: "has", label: "What it actually has", hint: "One feature per line. Countable.", rows: 8 },
      { key: "not", label: "What it does not have, that people assume", hint: "Honesty here saves a later complaint.", rows: 4 },
    ],
    crosses: [
      { href: "/board/plot/benefit", label: "Benefit" },
      { href: "/board/plot/differentiation", label: "Differentiation" },
    ],
  },
  {
    id: "benefit",
    kind: "feel",
    stand: "What a person gets that they could feel. If it needs a paragraph, it is still a feature.",
    fields: [
      { key: "feel", label: "What they feel or can do", hint: "After the feature, in their life.", rows: 4 },
      { key: "who", label: "Which seat this is for", hint: "Point at a customer on the right. Not all eight.", rows: 2 },
    ],
    crosses: [
      { href: "/board/plot/features", label: "Features" },
      { href: "/board/plot/value", label: "Value" },
      { href: "/board/mapping/audience", label: "Customer seats" },
    ],
  },
  {
    id: "location",
    kind: "place",
    stand: "Where this lives. Online-only still has a where. Do not leave it blank.",
    fields: [
      { key: "geo", label: "Geography, or a named place", hint: "A town, a region, a clearly named room in the world.", rows: 3 },
      { key: "online", label: "Where it lives online", hint: "The host, the shop, the inbox — named.", rows: 3 },
    ],
    crosses: [
      { href: "/board/workbench/host", label: "The live host" },
      { href: "/board/plot/people", label: "People" },
      { href: "/board/mapping/landscape", label: "Landscape" },
    ],
  },
  {
    id: "people",
    kind: "named",
    stand: "Who this is, as humans. Not a team photo. The people the work has to be true for.",
    fields: [
      { key: "named", label: "Named people", hint: "Names. Roles only if the name is not yet allowed.", rows: 5 },
      { key: "true", label: "Who the work has to be true for", hint: "Including the seats on the right.", rows: 4 },
    ],
    crosses: [
      { href: "/board/plot/founder", label: "Founder" },
      { href: "/board/mapping/audience", label: "Customer seats" },
      { href: "/board/mapping/advocates", label: "Advocates" },
    ],
  },
  {
    id: "founder",
    kind: "story",
    stand: "The founder story if there is one, told without myth. If there is none, say so. Do not invent one.",
    fields: [
      {
        key: "has",
        label: "Is there a founder story?",
        hint: "No is a complete answer. Not yet is also complete. Do not invent one.",
        choice: [
          { id: "yes", label: "Yes, and it is true" },
          { id: "no", label: "No — leave this empty" },
          { id: "later", label: "Not yet, do not invent" },
        ],
      },
      {
        key: "without",
        label: "What we will not add",
        hint: "The origin myth you are refusing. Only asked when the story is true.",
        rows: 3,
      },
    ],
    crosses: [
      { href: "/board/plot/people", label: "People" },
      { href: "/board/plot/purpose", label: "Purpose" },
    ],
  },
  {
    id: "personality",
    kind: "behave",
    stand: "How it behaves when it speaks. Not a list of adjectives from a workshop.",
    fields: [
      { key: "behaves", label: "How this behaves, in a sentence", hint: "A way of speaking you could hear across a room.", rows: 4 },
      { key: "never", label: "How it never behaves", hint: "The register that would be a costume.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/promise", label: "Promise" },
      { href: "/board/comms/message", label: "Message" },
      { href: "/board/mapping/commentators", label: "Commentators" },
    ],
  },
  {
    id: "standards",
    kind: "bar",
    stand: "The bar we will not drop. If it cannot be checked, it is a wish.",
    fields: [
      { key: "bar", label: "The standard", hint: "Operational. Someone could audit this.", rows: 4 },
      { key: "check", label: "How we check it", hint: "A date, a proof, a person who looks.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/ethics", label: "Ethics" },
      { href: "/board/plot/promise", label: "Promise" },
      { href: "/board/identity/principles", label: "Principles" },
    ],
  },
  {
    id: "ethics",
    kind: "line",
    stand: "What they will not do for a win. This is their filled cell, not the faculty ethics room.",
    fields: [
      { key: "not", label: "What we will not do for a win", hint: "A concrete refusal.", rows: 4 },
      { key: "if", label: "If someone asked us to", hint: "The sentence we would say.", rows: 3 },
    ],
    crosses: [
      { href: "/board/plot/standards", label: "Standards" },
      { href: "/board/plot/philosophy", label: "Philosophy" },
      { href: "/board/identity/ethics", label: "Ethics (faculty)" },
    ],
  },
  {
    id: "philosophy",
    kind: "why",
    stand: "The longer why, if they have one. It can stay quiet. It must not contradict the promise.",
    fields: [
      {
        key: "empty",
        label: "Is this empty on purpose?",
        hint: "Quiet is allowed.",
        choice: YES_NO,
      },
      { key: "why", label: "The longer why, if it is not empty", hint: "Must not contradict the promise.", rows: 6 },
    ],
    crosses: [
      { href: "/board/plot/purpose", label: "Purpose" },
      { href: "/board/plot/ethics", label: "Ethics" },
      { href: "/board/plot/promise", label: "Promise" },
    ],
  },
];

export function bitRoom(id: string): BitRoom | undefined {
  return BIT_ROOMS.find((r) => r.id === id);
}

export type UniqueBitId =
  | "mission"
  | "founder"
  | "personality"
  | "proposition"
  | "big-idea"
  | "positioning"
  | "differentiation"
  | "value"
  | "brand-type"
  | "promise"
  | "features"
  | "benefit"
  | "identity"
  | "vision"
  | "purpose"
  | "people"
  | "location"
  | "standards"
  | "ethics"
  | "philosophy";

const UNIQUE_BITS: UniqueBitId[] = [
  "mission",
  "founder",
  "personality",
  "proposition",
  "big-idea",
  "positioning",
  "differentiation",
  "value",
  "brand-type",
  "promise",
  "features",
  "benefit",
  "identity",
  "vision",
  "purpose",
  "people",
  "location",
  "standards",
  "ethics",
  "philosophy",
];

export function uniqueBitInterior(id: string): UniqueBitId | null {
  return UNIQUE_BITS.includes(id as UniqueBitId) ? (id as UniqueBitId) : null;
}

const SLOGAN_SHAPES = [
  /\bworld[- ]class\b/i,
  /\bbest in class\b/i,
  /\bdeliver(ing)? (excellence|quality|results)\b/i,
  /\binnovative solutions?\b/i,
  /\bempower(ing)?\b/i,
  /\bpassion for\b/i,
  /\bmaking a difference\b/i,
  /\bto be the (leading|number one|go-?to)\b/i,
  /\bexcellence in\b/i,
  /\bwe strive to\b/i,
  /\bwe aim to be\b/i,
  /\binspire(ing)? (people|customers|the world)\b/i,
  /\btransform(ing)? (lives|businesses)\b/i,
  /\bpremium (quality|experience)\b/i,
];

/** Quiet teaching, never a save block. Honour BIT_COPY: if it could sit on any site, it is empty. */
export function missionCouldSitAnywhere(job: string): boolean {
  const line = job.trim();
  if (line.length < 12) return false;
  if (SLOGAN_SHAPES.some((r) => r.test(line))) return true;
  const named = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/.test(line) || /\d/.test(line);
  if (named) return false;
  return /^(to |we |our )?(provide|deliver|create|offer|help|enable|support|connect)\b/i.test(line);
}

/** Workshop clouds: three or more short comma/slash items. Not a blocker. */
export function personalityLooksLikeAdjectives(text: string): boolean {
  const parts = text
    .split(/[,/;•]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 3) return false;
  return parts.every((p) => p.split(/\s+/).length <= 2);
}
