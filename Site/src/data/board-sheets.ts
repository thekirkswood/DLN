import { BRAND_BITS_LEFT } from "@/data/campus";
import { ENGINE_STAGES, FACULTIES, type FacultyId } from "@/data/faculties";

/** Step 1: what this cell means. Later this is model context, not the first view. */
export type BoardSide = "identity" | "landscape" | "object" | "process" | "think" | "work" | "sit";

export type BoardSheet = {
  key: string;
  name: string;
  lede: string;
  meaning: string[];
  looks: string[];
  questions: string[];
  side: BoardSide;
  prompt: string;
};

const SIDE_LINE: Record<BoardSide, string> = {
  identity: "Left of the table — they populate this.",
  landscape: "Top of the table — the world around the work.",
  object: "Centre — the thing itself.",
  process: "The stack — our machine, in our voice.",
  think: "A.P.E.S. — how the work is thought through.",
  work: "Workbench — where it is made.",
  sit: "Solport — a sitting on the actual work.",
};

function s(
  key: string,
  name: string,
  side: BoardSide,
  lede: string,
  meaning: string[],
  looks: string[],
  questions: string[],
  prompt: string
): BoardSheet {
  return { key, name, lede, meaning, looks, questions, side, prompt };
}

const FACULTY_SHEETS: BoardSheet[] = [
  s(
    "comms",
    "Comms",
    "work",
    "Foundational identity system project preparation. The bedrock of human interaction.",
    [
      "Comms is not a content calendar. It is the line, the place it has to hold, who it is for, and the moments that must be clear.",
      "Lasswell still holds: who says what, in which channel, to whom, with what effect. If any of those is missing, the spotlight is theatre.",
      "Narrative and Sensory on the table sit here. One is the words. One is how it is felt before anyone reads.",
    ],
    ["one line", "channel", "who it is for", "spotlight"],
    ["What is actually being said?", "Where does that line have to hold?", "Who is it for, and who is it not?"],
    "Write the one line this plot says, and where it has to hold."
  ),
  s(
    "mapping",
    "System Mapping",
    "landscape",
    "Your brand mapped in your context. A brand landscape process.",
    [
      "Nothing is drawn on a blank page. The work sits in advocates, commentators, trends, culture, law, and public opinion.",
      "Customers on the right are seats in that landscape, not a persona slide. Relationships are who touches whom.",
      "Evidence before a line. Scale changes the map: a sole trader, a bigger business, and a corporation are not the same neighbourhood.",
    ],
    ["landscape tokens", "relationships", "evidence", "scale"],
    ["Where does this brand actually trade?", "Who speaks for it, and who speaks about it?", "What is evidenced, not hoped?"],
    "Name the neighbourhood this plot sits in, not the one it wishes for."
  ),
  s(
    "process",
    "8 Process",
    "process",
    "The comprehensive eight-phase process. Alignment, budgets, resources, timeline.",
    [
      "Object through Guardianship is the stack under the thing itself. It is not a waterfall poster. It is the order work actually survives.",
      "They populate identity. We run this stack. Our voice, our checkpoints, their plot moving through.",
      "Briefing notes on the table are ownership, protocols, the board, the live host, and guardianship. Skip one and the host invents a second brand.",
    ],
    ["object", "people", "RAD", "concept", "build", "implementation", "guardianship"],
    ["What is the work, and what is it not?", "Who has to live the plan?", "Where does it leave the desk?"],
    "Name the stage this plot is in, and what would make it a lie to skip."
  ),
  s(
    "workbench",
    "Workbench",
    "work",
    "Taking great ideas through the process. The coal face of making.",
    [
      "Artwork, production, code, printers, servers. Delivery where execution matches strategy.",
      "The board is this space: zoom a topic, watch the effect. The host is the live plot they sit with while it grows.",
      "Sandbox and live are two rooms. Trying a thing must not overwrite the public site.",
    ],
    ["tools", "ideas through", "the board", "the host"],
    ["What is being made, in which file?", "Does production see the same thing as the board?", "Where is live, and where is try?"],
    "Put the thing being made on this desk, and say whether it is sandbox or live."
  ),
  s(
    "apes",
    "A.P.E.S.",
    "think",
    "Full 360 creative and critical thinking and decision making.",
    [
      "A thinking tool you switch on when the moment matters. Four points of view: Analytical, Practical, Emotional, Social.",
      "It does not tell you what to think. It tells you where to look. Creative, critical, and decision work still walk all four.",
    ],
    ["analytical", "practical", "emotional", "social"],
    ["Which mindset is fluent here?", "Which has not spoken?", "What would 360 refuse to ship?"],
    "Run the choice through all four. Name the one you usually skip."
  ),
  s(
    "identity",
    "Identity systems toolkits",
    "identity",
    "Tools to print or buy — for humans only. Deep-level brand architectures.",
    [
      "Understanding, breaking, and fixing identity systems. Principles, ethics, protocols.",
      "The left of the table is theirs to populate: statements, mission, vision, promise. This avenue is the system that holds them as the work grows.",
      "A flyer cannot invent a second identity. Procurement and design are not two brands.",
    ],
    ["principles", "ethics", "toolkit", "systems"],
    ["What will this system not break?", "Who is the toolkit for?", "Where has the identity already split?"],
    "Name the one rule the system will not break, even under a rush job."
  ),
  s(
    "solport",
    "Solport Sessions",
    "sit",
    "One-to-one online strategy sessions. Collaborative integration.",
    [
      "Direct work with clients, peers, and students — the tools, channels, and content they already use.",
      "A sitting you can run with, not a talk about process. Leave with the next thing to publish.",
      "What is said here feeds back onto the board. It is not someone’s private notes.",
    ],
    ["sitting", "tools in use", "channels", "content"],
    ["Who is in the sitting?", "What do they already have in their hands?", "What goes out this week?"],
    "Name the next thing this sitting must leave with, today."
  ),
];

const TOPIC_SHEETS: BoardSheet[] = [
  s("comms:message", "Message", "work", "What is actually being said, in one line.", [
    "If you cannot say it once, you do not have a message. You have a pile of lines fighting.",
    "Print, site, and a conversation have to match. A second voice is a committee.",
  ], ["one line", "intent", "what it is not"], ["What is the line?", "What must it never say?", "Does every door say this?"], "Write the one line. Cut the second."),
  s("comms:channel", "Channel", "work", "Where that line has to hold — screen, print, a room.", [
    "A channel is not a platform logo. It is a physical or digital place the line has to survive.",
    "If it only works in a deck, it is not a channel. Sensory on the table is how it is felt in that place.",
  ], ["screen", "print", "a room"], ["Where does it have to hold?", "Where does it already break?", "What cannot travel?"], "Name the three places this line has to live this month."),
  s("comms:audience", "Audience", "work", "Who it is for, and who it is not for.", [
    "Audience on Comms is the people the line is spoken to. Customers on Mapping are seats in the landscape. Do not collapse them.",
    "Clarity is also refusal. If it is for everyone, it is for no one you can name.",
  ], ["who", "not-who", "effect"], ["Who is this for?", "Who is it not for?", "What should happen in them?"], "Name who it is for, and one person it is not."),
  s("comms:spotlight", "Spotlight", "work", "The moments that must be clear.", [
    "Launches, sittings, a pack, a host going live. Those moments cannot invent a second intent.",
    "A spotlight script is not a slogan pack. It is the same line, held, when it counts.",
  ], ["launch", "sitting", "live host"], ["Which moments must be clear?", "What is allowed to be quiet?", "Who holds the script?"], "List the next three spotlight moments and the line they share."),

  s("mapping:landscape", "Landscape", "landscape", "The brand in its actual context, not a blank page.", [
    "Landscape is the field along the top of the table: advocates, commentators, trends, culture, law, opinion.",
    "Each token is its own sheet and, later, its own engine. Cultural/Social is where the social engine will sit.",
  ], ["advocates", "commentators", "trends", "culture", "law", "opinion"], ["What is actually around this brand?", "What is noise?", "What would change the map?"], "Mark the three forces that already move this plot."),
  s("mapping:relations", "Relationships", "landscape", "Who touches whom: people, products, places.", [
    "Advocates and commentators live here. One speaks for. One speaks about. They are not the same seat.",
    "Products and places are in the web. If you cannot draw who touches whom, the landscape is a mood board.",
  ], ["who speaks for", "who speaks about", "what touches what"], ["Who is for this brand?", "Who talks about it without wearing it?", "What breaks if one link goes?"], "Draw who touches whom in one sitting."),
  s("mapping:evidence", "Evidence", "landscape", "Research, analytics, and discovery before a line is drawn.", [
    "Laws, rules, and public opinion sit here because they are facts the work has to survive, not vibes.",
    "Discovery is not a survey dump. It is what you will hold as true before anyone draws.",
  ], ["research", "analytics", "discovery", "rules"], ["What is evidenced?", "What is only claimed?", "What would disprove the line?"], "Name one fact you will hold, and one you will not pretend."),
  s("mapping:scale", "Scale", "landscape", "A flag on the plot, set early. The map changes with it.", [
    "The same landscape tokens mean different work at different scale. A founder is not a division.",
    "Scale is not a toggle on the table. Rooms may read the flag. If scale is wrong, every cell lies.",
  ], ["sole trader", "bigger business", "corporation"], ["What scale is this plot really?", "What pretends to be bigger?", "What would change if we told the truth?"], "Pick the scale that is true this quarter, not the one on the about page."),
  s("mapping:advocates", "Advocates", "landscape", "People who speak for the work, not only about it.", [
    "An advocate wears it. They will say the line in a room we are not in.",
    "Later this cell is an engine: who they are, how they speak, what they need in their hands.",
  ], ["who wears it", "where they speak", "what they need"], ["Who already advocates?", "Who should, and does not?", "What would they refuse to say?"], "Name three advocates and the sentence they can actually say."),
  s("mapping:commentators", "Commentators", "landscape", "People who speak about the work, without having to wear it.", [
    "Press, peers, the neighbour with an opinion. They shape the landscape whether you invited them or not.",
    "Do not treat them as advocates. The line they carry is rarely yours.",
  ], ["press", "peers", "uninvited voice"], ["Who comments without wearing it?", "What do they already say?", "What must not be fed to them?"], "Name the commentators who already have a line, and what it is."),
  s("mapping:trends", "Trends / Style", "landscape", "What is moving in form, not what is fashionable for its own sake.", [
    "Style here is evidence of movement in the field. It is not a moodboard raid.",
    "If a trend cannot be pointed at in this neighbourhood, it does not belong on this cell.",
  ], ["form", "movement", "this neighbourhood"], ["What is actually moving here?", "What is only a feed?", "What would we be late to ignore?"], "Name one movement that is real in this plot’s field, and one that is not."),
  s("mapping:cultural", "Cultural / Social", "landscape", "How the work will be read between people.", [
    "This is the social cell. The social engine slots here: not a generic caption machine, a system exclusive to this subheading.",
    "Culture is not a colour palette. It is the rituals, language, and belonging the plot walks into.",
  ], ["rituals", "language", "belonging", "social engine"], ["What culture is this landing in?", "What would be tone-deaf?", "What should the social engine never do?"], "Describe the culture this plot is walking into, in their words, not ours."),
  s("mapping:laws", "Laws. Rules.", "landscape", "What the work is not allowed to ignore.", [
    "Regulation, house rules, platform policy, professional codes. Not a vibe check.",
    "If it cannot survive this cell, it cannot ship, no matter how it photographs.",
  ], ["regulation", "house rules", "codes"], ["Which rules actually bind this plot?", "Which are habit, not law?", "What would a rush job try to skip?"], "List the rules this plot cannot skip, even for a launch."),
  s("mapping:opinion", "Public opinion", "landscape", "How the work is already being read, before we speak.", [
    "Opinion is not a survey score. It is the story already in the room.",
    "Evidence sits beside it. If opinion and evidence fight, the board has to show both.",
  ], ["the story already there", "trust", "noise"], ["What do people already believe?", "What is fair?", "What is noise we must not chase?"], "Write the sentence the public would say today, before we add a line."),
  s("mapping:audience", "Customers", "landscape", "Seats 1–8 on the right of the table.", [
    "Each seat is a real customer the plot has to hold, not a persona nickname.",
    "Eight is enough to see difference. If two seats are the same person twice, the map is empty.",
  ], ["eight seats", "difference", "who has to live with it"], ["Who sits in each seat?", "Which seat is empty on purpose?", "Which seat would change the line?"], "Name the eight seats, or say which are still empty and why."),

  s("process:stage-1", "The Project", "process", "You leave knowing what the work is, and what it is not.", [
    "What we will hold as true before anyone draws. Ownership involvement lives on this briefing note.",
    "If the object is fuzzy, every later stage is decoration.",
  ], ["what it is", "what it is not", "ownership"], ["What is the work?", "What is it not?", "Who owns the involvement?"], "State the object in one sentence, and one thing it is not."),
  s("process:stage-2", "The People", "process", "Who is in the room, and who has to live the plan.", [
    "How we talk so the work stays one thing. People here are not a stakeholder wheel in a slide.",
  ], ["in the room", "have to live it", "how we talk"], ["Who is in the room?", "Who has to live it and is not in the room?", "How do we talk so it stays one thing?"], "Name who is in, who lives it, and who is missing."),
  s("process:stage-3", "Research, Analytics and Discovery", "process", "What you already run, who it is for, what the market needs.", [
    "Evidence before a line is drawn. This is the RAD rung on the stack.",
  ], ["what you run", "who it is for", "what the market needs"], ["What is already running?", "What did discovery actually find?", "What would we be pretending?"], "Pin three facts from discovery, not three wishes."),
  s("process:stage-4", "Initial Ideas", "process", "A wide pass. Nothing is the answer yet.", [
    "The point is to see the range, then we cut. Concepts on the table are this rung’s short name.",
  ], ["range", "not the answer yet", "then we cut"], ["What is in the wide pass?", "What got in too early as ‘the one’?", "What did we refuse to generate?"], "Put three directions on the table. Do not pick yet."),
  s("process:stage-5", "The Concept", "process", "One direction you can hold.", [
    "Naming, positioning, and the first system sit here. Candidate on the table.",
  ], ["one direction", "naming", "first system"], ["Which direction holds?", "What did we let go?", "Can it be named out loud?"], "Name the concept you can hold, and the ones you will not."),
  s("process:stage-6", "The Build", "process", "This is where the work is made, not described.", [
    "Print, screen, or the working session itself. System on the table.",
  ], ["made not described", "print", "screen", "session"], ["What is actually being made?", "What is still only a description?", "Does production have the file?"], "Point at the file or the sitting. If you cannot, it is not the build."),
  s("process:stage-7", "The Implementation", "process", "It leaves the desk. Out in the world.", [
    "The live site, the pack, the notes from the session.",
  ], ["live site", "pack", "session notes"], ["What left the desk?", "What is still on the desk pretending it left?", "Where can they sit with it?"], "Name the public thing, and the date it left."),
  s("process:stage-8", "The Guardianship", "process", "Looked after, not left.", [
    "We keep coming in. A private preview can reopen. The live site stays up.",
    "Guardianship on the table is lit because this is the job after the photograph.",
  ], ["keep coming in", "preview can reopen", "live stays"], ["Who looks after it?", "What happens if they go quiet?", "What can reopen without breaking live?"], "Say who looks after it next month, and how they get in."),

  s("workbench:tools", "Tools", "work", "The coal face: artwork, production, code, printers, servers.", [
    "If the tool is not on this desk, the work is a wish. Humans first. No portal for its own sake.",
  ], ["artwork", "production", "code", "print", "servers"], ["What tool is in hand?", "What is missing?", "What is theatre?"], "List the tools this plot actually uses this week."),
  s("workbench:ideas", "Ideas through", "work", "Taking a great idea through the process, not around it.", [
    "A great idea that skips the stack is how a live host invents a second brand.",
  ], ["through not around", "the stack", "the file"], ["Which idea is going through?", "Where is it trying to skip?", "What would stop it?"], "Name the idea, and the stage it is in, honestly."),
  s("workbench:board", "The board", "work", "An interactive space. Zoom a topic. Watch the effect.", [
    "This cell is the table you are on. Later: they put work in, it answers, assets sit on the cell, generation has a pathway.",
    "The short view of their plot expands from the thing itself. The full sheet is a second click.",
  ], ["zoom", "effect", "their plot"], ["What moved?", "What did it do to the other cells?", "What is still empty?"], "Say what you want this board to know about the plot today."),
  s("workbench:host", "Host", "work", "Live site and a constant sandbox. One package they sit with while the work grows.", [
    "Hosting is one package: live site and a constant sandbox they can talk to all day. Price follows traffic.",
    "The host is not a preview button. It is the site they live with.",
  ], ["live", "sandbox", "sit with it"], ["Where is live?", "Where is the sandbox?", "Who sits with it?"], "Name the live host. The sandbox is in the package."),

  s("identity:principles", "Principles", "identity", "What the system will not break.", [
    "Principles are not values wallpaper. They are the refusal the toolkit has to obey.",
  ], ["refusal", "hold as it grows"], ["What will we not break?", "What has already been broken?", "Who thinks it is optional?"], "Write the one principle a rush job is not allowed to skip."),
  s("identity:ethics", "Ethics", "identity", "Protocols that hold as the work grows.", [
    "A campaign cannot contradict the system. Audit the public line against this cell.",
  ], ["protocols", "public line", "audit"], ["Where does the public line fight the system?", "What is the protocol?", "Who enforces it?"], "Name the ethical protocol, and one place it is already thin."),
  s("identity:toolkit", "Toolkit", "identity", "Tools to print or buy — for humans only.", [
    "People can make on-brand work without a CMS. Issue tools, not a portal.",
  ], ["print", "buy", "humans only"], ["What can a human hold?", "What requires a login we do not want?", "What is missing from the kit?"], "List what is in the toolkit, and what is still a file on someone’s desktop."),
  s("identity:systems", "Systems", "identity", "Understanding, breaking, and fixing identity systems.", [
    "Growth does not mean a new logo each year. Break it on purpose, then write the protocol.",
  ], ["understand", "break", "fix"], ["What system is in play?", "Where is it already split?", "What would fixing it change on the table?"], "Say where the identity has split, in one concrete example."),

  s("solport:sitting", "Sitting", "sit", "One-to-one, online, on the actual work.", [
    "Not a town hall. A sitting has an effect the same day.",
  ], ["one-to-one", "online", "actual work"], ["Who sits?", "What is the work on the table?", "What leaves with them?"], "Name who sits, and the work they will bring."),
  s("solport:tools-in-use", "Tools in use", "sit", "The tools they already have in their hands.", [
    "Strategy is a week of work, not a deck, when it uses what they already run.",
  ], ["already in hand", "not a new stack"], ["What do they already use?", "What are we tempted to invent?", "What can we leave alone?"], "List the tools already in their hands. Do not add one yet."),
  s("solport:channels", "Channels", "sit", "Where the brand has to live this week.", [
    "A channel plan survives the meeting only if the people who write are in the sitting.",
  ], ["this week", "who writes"], ["Where does it live this week?", "Who actually writes?", "What is dormant?"], "Name this week’s channels and who writes them."),
  s("solport:content", "Content", "sit", "What goes out, and what it does when it does.", [
    "Map content to the landscape. What goes out has to match where they trade.",
  ], ["what goes out", "what it does", "landscape"], ["What is going out?", "What does it do?", "Does it match the landscape?"], "Name the next thing to publish, and the cell on the landscape it serves."),

  s("apes:analytical", "Analytical", "think", "Does this make sense? Is it consistent? Can it be explained?", [
    "Clarity, evidence, structure, coherence. A lens, not a person.",
    "This plot’s mission, people, and ethics are the material. The lens does not replace the identity column.",
  ], ["logic", "evidence", "structure"], ["What are the known facts?", "Where is the contradiction?", "What would look correct and still be hollow?"], "Look at this plot through Analytical. Name what is consistent, and what only looks it."),
  s("apes:practical", "Practical", "think", "Can this be done? Who does what, when, and with what?", [
    "Feasibility, resources, timing, delivery. A lens, not a person.",
  ], ["feasibility", "resources", "timing"], ["Who does this, and with what?", "What will break first?", "Will it survive next Tuesday?"], "Look at this plot through Practical. Name the step, and the bottleneck."),
  s("apes:emotional", "Emotional", "think", "Felt experience, trust, meaning. Can people inhabit it?", [
    "A lens, not a person. Personality and people on this plot are the material.",
  ], ["felt", "trust", "meaning"], ["What would it feel like to live with this?", "Where is trust thin?", "What is only a mood?"], "Look at this plot through Emotional. Name what a person could inhabit."),
  s("apes:social", "Social", "think", "Relationships, culture, how it will be read between people.", [
    "A lens, not a person. Cultural/Social on the landscape is the first engine this letter looks at.",
  ], ["culture", "relationships", "how it is read"], ["Who is this for, between people?", "What would be tone-deaf?", "What should the social engine never do?"], "Look at this plot through Social. Name how it would be read in the room."),
  s("apes:creative", "Creative", "think", "Generate range. Walk each idea through all four mindsets.", [
    "Creative still walks Analytical, Practical, Emotional, and Social. Range is not the answer.",
  ], ["range", "all four"], ["What else could it be?", "Which idea arrived too early as the one?", "Have all four spoken?"], "Put three directions on the table. Do not pick yet."),
  s("apes:critical", "Critical", "think", "For and against, from each mindset. Taste is not the test.", [
    "Critical is not a veto from one loud seat. Walk for and against through all four.",
  ], ["for", "against", "all four"], ["What is the strongest case against?", "What is only taste?", "Which lens has not spoken?"], "Write for and against. Name the lens that has not spoken."),
  s("apes:decision", "Decision", "think", "What if. Hold the choice across all four, not the loudest seat.", [
    "Record why. Human decision stays sovereign.",
  ], ["what if", "why", "all four"], ["What if we choose this?", "What if we refuse?", "Which lens would make it a lie to ship?"], "Name the choice, and why, from all four."),
  s("apes:full", "360", "think", "Hold Analytical, Practical, Emotional, and Social at once.", [
    "Full 360 is the last row of the combinations plate. Unfinished until all four have had a turn.",
  ], ["all four at once"], ["Which letter is fluent?", "Which is silent?", "What would 360 refuse to ship?"], "Hold all four. Name the one you usually skip."),
  s("apes:combinations", "Combinations", "think", "Which combo is this work sitting in. Not a personality quiz.", [
    "Fifteen combinations from APES2. Full 360 is the last row. Never label a person as a type.",
  ], ["fifteen combinations", "this work", "not a person"], ["Which combo is the work in today?", "What is missing for 360?", "What would change if the silent letter spoke?"], "Pin the combination this plot is sitting in, and why."),
  s("apes:cycle", "Cycle", "think", "Launch to landing. Reflection consolidates; it does not reopen.", [
    "Launch → Action → Turnaround → Reflection → Landing. Bounded tasks.",
  ], ["launch", "action", "turnaround", "reflection", "landing"], ["Where is this task in the cycle?", "Did reflection reopen the brief?", "What landed?"], "Name the stage of this cycle, and what must not reopen."),
  s("apes:cards", "Cards", "think", "Six honest questions until the context is understood.", [
    "What is it, where/who, why, what could go wrong, what could we do, so what.",
  ], ["six cards", "honest until understood"], ["What is it, actually?", "What could go wrong?", "So what, for this plot?"], "Answer the cards in order. Do not skip to so-what."),
  s("apes:interrogation", "Interrogation", "think", "Analyse, probe, evaluate, synthesise — the human stays sovereign.", [
    "How an LLM should walk context later. Do not fake talk-to. Human decision remains.",
  ], ["analyse", "probe", "evaluate", "synthesise"], ["What is the context?", "What did we assume?", "What must a person still decide?"], "Walk the four. Leave the decision with the human."),
];

const APES_TOPIC_KEYS = [
  "analytical",
  "practical",
  "emotional",
  "social",
  "creative",
  "critical",
  "decision",
  "full",
  "combinations",
  "cycle",
  "cards",
  "interrogation",
] as const;

const BIT_COPY: Record<string, [string, string, string]> = {
  identity: ["The sentences that say who this is.", "Not a paragraph of about-us. Statements you can hold on the left of the table.", "What are the identity statements, in their words?"],
  mission: ["What this plot is for, in motion.", "Mission is a job, not a slogan. If it could sit on any site, it is empty.", "What is the mission, as a job of work?"],
  vision: ["Where this is going, if the work holds.", "Vision is not a mood. It is a future you could recognise.", "What would we recognise if we arrived?"],
  proposition: ["The offer, said so a person can answer.", "If they cannot say yes or no, it is not a proposition.", "What is being offered, to whom?"],
  purpose: ["Why this exists when nobody is watching.", "Purpose is not a campaign. It has to survive a quiet month.", "Why does this exist when it is not launching?"],
  "big-idea": ["The idea the rest of the table has to serve.", "If everything is the big idea, nothing is.", "What is the one idea the rest serves?"],
  positioning: ["Where this stands, relative to the landscape.", "Positioning without the landscape cell is a pose.", "Where do we stand, next to whom?"],
  differentiation: ["What is actually different, in use.", "Not a comparative adjective. A difference a customer could point at.", "What can they point at that the neighbour cannot?"],
  value: ["What they get, that costs them something real.", "If it is only ‘quality’, it is not a value proposition.", "What do they get, and what does it cost them?"],
  "brand-type": ["What kind of brand this is allowed to be.", "Type constrains the toolkit. A house cannot pretend to be a rebel every Tuesday.", "What type is this, and what type must it not play at?"],
  promise: ["What we will do, that they can hold us to.", "A promise you cannot keep is a future complaint.", "What do we promise, and how would they know we kept it?"],
  features: ["What it has, in fact.", "Features are not benefits. Keep them honest and countable.", "What does it actually have?"],
  benefit: ["What that does for a person.", "If the benefit needs a paragraph, it is still a feature.", "What does a person get that they could feel?"],
  location: ["Where this lives — geography, or a clearly named place in the world.", "Online-only still has a where. Do not leave it blank.", "Where does this live?"],
  people: ["Who is this, as humans.", "Not a team photo. The people the work has to be true for.", "Who are the people, named?"],
  founder: ["The founder story, if there is one, told without myth padding.", "If there is no founder story, say so. Do not invent one.", "Is there a founder story, and is it true?"],
  personality: ["How it behaves when it speaks.", "Personality is not a list of adjectives from a workshop.", "How does this behave, in a sentence?"],
  standards: ["The bar we will not drop.", "Standards are operational. If they cannot be checked, they are wishes.", "What standard can we check?"],
  ethics: ["The ethical line on the left of the table.", "Different from the identity-faculty ethics room: this is their filled cell.", "What will they not do for a win?"],
  philosophy: ["The longer why, if they have one.", "Philosophy can stay quiet. It must not contradict the promise.", "What is the philosophy, or is it empty on purpose?"],
};

const PLOT_SHEETS: BoardSheet[] = BRAND_BITS_LEFT.map((b) => {
  const row = BIT_COPY[b.id] || [b.label, "A cell on the left of the table. They populate it.", `What belongs in ${b.label}?`];
  return s(
    `plot:${b.id}`,
    b.label,
    "identity",
    row[0],
    [row[1], "This is theirs to fill. Later the machine reads it when it runs the stack."],
    ["their words", "on the left", "feeds the stack"],
    [row[2], "What would make this cell a lie?", "What asset belongs here?"],
    row[2]
  );
});

const SHEETS: BoardSheet[] = [...FACULTY_SHEETS, ...TOPIC_SHEETS, ...PLOT_SHEETS];

const INDEX = new Map(SHEETS.map((sheet) => [sheet.key, sheet]));

export function boardSideLine(side: BoardSide): string {
  return SIDE_LINE[side];
}

export function facultySheet(id: FacultyId): BoardSheet | undefined {
  return INDEX.get(id);
}

export function topicSheet(faculty: FacultyId, topic: string): BoardSheet | undefined {
  return INDEX.get(`${faculty}:${topic}`);
}

export function plotBitSheet(bit: string): BoardSheet | undefined {
  return INDEX.get(`plot:${bit}`);
}

export function isPlotBitId(id: string): boolean {
  return BRAND_BITS_LEFT.some((b) => b.id === id);
}

export function plotBitHref(id: string): string {
  return `/board/plot/${id}`;
}

/** Faculty list used to prove the catalogue is complete at build time. */
export function expectedFacultyIds(): FacultyId[] {
  return FACULTIES.map((f) => f.id);
}

export function processStageCount(): number {
  return ENGINE_STAGES.length;
}

export const APES_SHEET_KEYS = APES_TOPIC_KEYS;
