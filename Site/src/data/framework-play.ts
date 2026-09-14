import { ENGINE_STAGES, FACULTIES, type FacultyId } from "@/data/faculties";
import type { ScaleId } from "@/data/campus";

export type FrameworkMove = {
  action: string;
  effect: string;
};

export type FrameworkTopic = {
  id: string;
  name: string;
  body: string;
};

const TOPICS: Record<FacultyId, FrameworkTopic[]> = {
  comms: [
    { id: "message", name: "Message", body: "What is actually being said, in one line." },
    { id: "channel", name: "Channel", body: "Where that line has to hold — screen, print, a room." },
    { id: "audience", name: "Audience", body: "Who it is for, and who it is not for." },
    { id: "spotlight", name: "Spotlight", body: "The moments that must be clear." },
  ],
  mapping: [
    { id: "landscape", name: "Landscape", body: "The brand in its actual context, not a blank page." },
    { id: "relations", name: "Relationships", body: "Who touches whom: people, products, places." },
    { id: "evidence", name: "Evidence", body: "Research, analytics, and discovery before a line is drawn." },
    { id: "scale", name: "Scale", body: "Sole trader, bigger business, corporation — the map changes." },
  ],
  process: ENGINE_STAGES.map((s) => ({
    id: `stage-${s.n}`,
    name: s.name,
    body: s.body,
  })),
  workbench: [
    { id: "tools", name: "Tools", body: "The coal face: artwork, production, code, printers, servers." },
    { id: "ideas", name: "Ideas through", body: "Taking a great idea through the process, not around it." },
    { id: "board", name: "The board", body: "An interactive space. Zoom a topic. Watch the effect." },
    { id: "host", name: "Host", body: "The live plot they can sit with while the work grows." },
  ],
  apes: [
    { id: "creative", name: "Creative", body: "Unfiltered thinking, then a choice you can stand behind." },
    { id: "critical", name: "Critical", body: "Analysis against the map, not taste alone." },
    { id: "decision", name: "Decision", body: "Objective decision-making. Not guesswork." },
    { id: "full", name: "360", body: "Full-turn thinking: make, test, keep, or let go." },
  ],
  identity: [
    { id: "principles", name: "Principles", body: "What the system will not break." },
    { id: "ethics", name: "Ethics", body: "Protocols that hold as the work grows." },
    { id: "toolkit", name: "Toolkit", body: "Tools to print or buy — for humans only." },
    { id: "systems", name: "Systems", body: "Understanding, breaking, and fixing identity systems." },
  ],
  solport: [
    { id: "sitting", name: "Sitting", body: "One-to-one, online, on the actual work." },
    { id: "tools-in-use", name: "Tools in use", body: "The tools they already have in their hands." },
    { id: "channels", name: "Channels", body: "Where the brand has to live this week." },
    { id: "content", name: "Content", body: "What goes out, and what it does when it does." },
  ],
};

const MOVES: Record<FacultyId, Record<ScaleId, FrameworkMove[]>> = {
  comms: {
    "sole-trader": [
      { action: "Write the one line you say", effect: "Print, site, and a conversation match." },
      { action: "Cut a second voice", effect: "People meet you, not a committee." },
    ],
    "bigger-business": [
      { action: "Name who speaks for each door", effect: "Design, strategy, and build stop talking over each other." },
      { action: "Hold a spotlight script", effect: "Launches and sittings use the same intent." },
    ],
    corporation: [
      { action: "Lock a source line for every seat", effect: "Divisions can write without inventing a second brand." },
      { action: "Audit the public line against the map", effect: "A campaign cannot wander off the landscape." },
    ],
  },
  mapping: {
    "sole-trader": [
      { action: "Put the founder on the map", effect: "The work has a person, not a template." },
      { action: "Mark the one live host", effect: "Sandbox and live are not the same plot." },
    ],
    "bigger-business": [
      { action: "Map seats as colours on the board", effect: "You can see who moved, and what it did." },
      { action: "Draw the landscape they actually trade in", effect: "Strategy stops guessing the neighbourhood." },
    ],
    corporation: [
      { action: "Map every division onto one board", effect: "HR, marketing, and design share one picture." },
      { action: "Show an action and its effect", effect: "A change is visible, not a rumour in a deck." },
    ],
  },
  process: {
    "sole-trader": [
      { action: "Name the project in one sitting", effect: "The eight stages have somewhere to start." },
      { action: "Keep guardianship on the host", effect: "The site does not go quiet after launch." },
    ],
    "bigger-business": [
      { action: "Brief each stage with a sign-off", effect: "Work cannot skip a phase by accident." },
      { action: "Budget the people on the work", effect: "The process has a diary, not a wish." },
    ],
    corporation: [
      { action: "Run the eight stages as governance", effect: "A programme can be audited, not only designed." },
      { action: "Hold implementation to the concept", effect: "A live host cannot invent a second brand." },
    ],
  },
  workbench: {
    "sole-trader": [
      { action: "Put the idea on the board", effect: "You can see it, move it, and send it through." },
      { action: "Open the sandbox beside the live host", effect: "Trying a thing does not break the public site." },
    ],
    "bigger-business": [
      { action: "Zoom a topic until the work is the page", effect: "The board is a space, not a slide." },
      { action: "Pass artwork through production on this desk", effect: "Printers and servers see the same file." },
    ],
    corporation: [
      { action: "Seat each division on the same workbench", effect: "A change in one cell shows in the others." },
      { action: "Keep campus and live host as two rooms", effect: "Studio can work without overwriting the public plot." },
    ],
  },
  apes: {
    "sole-trader": [
      { action: "Make three directions, keep one", effect: "A choice you can stand behind, not a mood." },
      { action: "Test the line on a real sitting", effect: "Critical thought meets a person, not a wall." },
    ],
    "bigger-business": [
      { action: "Run creative and critical as a pair", effect: "A campaign cannot ship on taste alone." },
      { action: "Record the decision on the board", effect: "Later work can see why, not only what." },
    ],
    corporation: [
      { action: "Turn 360 thinking into a gate", effect: "A programme cannot skip evaluation." },
      { action: "Hold objective criteria next to the map", effect: "A board vote has evidence, not volume." },
    ],
  },
  identity: {
    "sole-trader": [
      { action: "Fix the mark and the one toolkit", effect: "You stop re-drawing yourself every job." },
      { action: "Print a rule you can hold", effect: "A flyer cannot invent a second identity." },
    ],
    "bigger-business": [
      { action: "Break the system, then write the protocol", effect: "Growth does not mean a new logo each year." },
      { action: "Issue tools for humans, not a portal", effect: "People can make on-brand work without a CMS." },
    ],
    corporation: [
      { action: "Give every seat the same toolkit", effect: "Procurement and design are not two brands." },
      { action: "Audit ethics against the public line", effect: "A campaign cannot contradict the system." },
    ],
  },
  solport: {
    "sole-trader": [
      { action: "Sit once on the tools you already use", effect: "Strategy is a week of work, not a deck." },
      { action: "Leave with the next thing to publish", effect: "The sitting has an effect the same day." },
    ],
    "bigger-business": [
      { action: "Sit the people who actually write", effect: "A channel plan survives the meeting." },
      { action: "Map content to the landscape", effect: "What goes out matches where you trade." },
    ],
    corporation: [
      { action: "Run Solport as counsel, not a town hall", effect: "A programme gets a decision, not a workshop photo." },
      { action: "Feed the sitting back onto the board", effect: "The session is on the plot, not in someone’s notes." },
    ],
  },
};

export function frameworkTopics(id: FacultyId): FrameworkTopic[] {
  return TOPICS[id] || [];
}

export function frameworkMoves(id: FacultyId, scale: ScaleId): FrameworkMove[] {
  return MOVES[id]?.[scale] || [];
}

export function frameworkList() {
  return FACULTIES.map((f) => ({
    id: f.id,
    n: f.n,
    name: f.name,
    caption: f.caption,
    glyph: `/brand/framework/${f.n}-${f.id}.png`,
    plate: f.plate,
    foundation: f.foundation,
    approach: f.approach,
    goal: f.goal,
  }));
}
