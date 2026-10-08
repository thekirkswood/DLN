# Identity bits — they populate the left

Own: `BoardPlotBit.tsx`, `board-identity.ts`, `/board/plot/{bit}`, `bits` on the plot file. Faculty 06 (principles / ethics / toolkit / systems) is `11-identity-faculty.md` — different job.

## Job

The left of the table is **theirs**. Hours of input. Human-made stills and later generated media live here. A.P.E.S. letters sit *on* this column (`08-apes.md`) but do not replace these cells.

Locked list (`BRAND_BITS_LEFT` / Binder3):

Identity statements · Mission · Vision · Proposition · Purpose · Big idea · Positioning · Differentiation · Value proposition · Brand type · Promise · Features · Benefit · Location · People · Founder story · Personality · Standards · Ethics · Philosophy

Teaching sentences are already in `BIT_COPY` in `board-sheets.ts`. Honour them. Do not invent a founder story. Do not write a slogan that could sit on any site.

## The scaffold to kill

`BoardPlotBit` is one form renderer. Different field labels and a CSS modifier (`is-job`, `is-story`) is still one object. Mission must not be implementable as “textarea but bigger.”

## Each bit as its own object

**Identity statements.** A stack of sentences they would actually say, plus one they would refuse to print. Add/remove lines. Not a paragraph of about-us.

**Mission.** One job of work, set as a line they can stand in (large type, short). For whom (point at a seat). When this would be a lie. If it could sit on any site, the room should feel empty even if text is present — show a quiet warning from teaching, not a blocker.

**Vision.** A future you could recognise. “If we arrived” as a scene (what we would see, hear, hold), not a mood. Optional year. What this future is not.

**Proposition.** Offer / to whom / the yes or the no. If they cannot answer, it is not a proposition. Door to seats.

**Purpose.** Quiet room. Why this exists when nobody is watching. Survives a quiet month. Smaller type. Links philosophy.

**Big idea.** One idea the rest of the table has to serve. If everything is the big idea, the room should only accept one field. Door to workbench ideas-through.

**Positioning.** Where we stand *next to the landscape*. Requires a named neighbour (advocate, market, or “we do not know yet”). Door into `/board/mapping/landscape`. Without that cell, copy already says it is a pose — show the empty landscape as a hole in this room.

**Differentiation.** What a customer could **point at** in use. Not a comparative adjective. Door to features.

**Value proposition.** Get / cost / why the trade is fair. “Quality” is not a value. Door to seats and benefit.

**Brand type.** Two plates: what it is allowed to be / what it must not play at. Constrains the toolkit (`11-identity-faculty.md`).

**Promise.** What we will do, how they would know we kept it without us in the room, what would break it. Door to public opinion and standards.

**Features.** Countable list. One per line. What it does *not* have that people assume.

**Benefit.** Felt, after the feature. Which seat this is for — not all eight.

**Location.** Geography or a named place, and where it lives online. Online-only still has a where. Door to host.

**People.** Named humans. Who the work has to be true for. Not a team photo layout pretending to be names. Door to founder and seats.

**Founder story.** First act is a choice: yes and it is true / no leave empty / not yet do not invent. If no, the story field does not exist. If yes, a **timeline** of a few events (year + what happened), not myth padding. What we will not add.

**Personality.** How it behaves when it speaks, in a sentence you could hear across a room. How it never behaves. Later: stills of tone (type specimens, not stock adjectives). Door to Message.

**Standards.** Operational bar + how we check it. If it cannot be checked it is a wish — the check field is required for the bar to count as held.

**Ethics.** What they will not do for a win. The sentence if someone asked. Different from faculty ethics (`11`).

**Philosophy.** May be empty on purpose (choice). If not empty, must not contradict the promise — show the promise snippet here.

## Interconnect

`KEY_READS` in `board-live.ts` already names neighbours. The interior must *display* them as the plot’s words, not as “a neighbouring cell.” Positioning without landscape shows a hole. Promise without a way to know it was kept does not count as held.

## Multi-format

Every bit: text as specified, still socket (Assets), generate socket (this bit + book + stills). Personality and identity statements especially want stills. Founder may attach one true photograph later — never a generated founder.

## Save

`bits[id]` as JSON `{ v:1, kind:"identity", bit, shape, fields }`. Old prose seeds the first field. `packSummary` for the table fill.

## Look

A left-column rail of twenty chamfered names (exists). The **body** of each route must not share one pack grid. Mission is a stand-in line. Founder is a spine of dates. Features is a countable list. Philosophy is a long quiet page. Ethics is a refusal plate.

## Done when

A sitting can fill mission, two seats, and positioning that points at a real landscape neighbour, then see those three speak on the centre showcase. Founder “no” is a complete room. Twenty URLs with the same three boxes is not done.

## Do not

Invent a founder. Workshop adjective clouds. Collapse faculty 06 into these bits.
