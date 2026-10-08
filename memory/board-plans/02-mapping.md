# System Mapping — landscape and eight seats

Own: `BoardMapping.tsx` (rewrite interiors; do not keep one pack for every token), mapping CSS, `board-pack.ts` landscape/seat/scale/evidence/relations kinds, `/board/mapping/*`. Teaching copy stays in `board-sheets.ts`.

## Job

“Your brand mapped in your context.” Nothing is drawn on a blank page. The top of the table is the world around the work. The right is eight real people this plot has to hold.

They pin this. We do not invent advocates. Empty is empty.

## Landscape tokens (each a different room)

Do not reuse one `{ who, does, hear }` pack for all six. That is the scaffold. Each token has a job in a sitting:

**Advocates.** People who speak *for* the work, not only about it. Fields: who they are, what they wear of this brand, where we hear them, what they must never be asked to say. Reads: people, founder. Door to seats they overlap.

**Commentators.** People who speak *about* the work without having to wear it. Press, peers, a loud neighbour. Fields: who talks, from where, what story is already in the room, what we do not bother correcting. Binder3 draws the word twice; campus keeps one token. Depth inside: sector vs rest of the world (later Binder3 sheets).

**Trends / Style.** What is moving in form in this neighbourhood. Fields: what is moving, what is noise, what this brand will not chase, one object in the world that already shows the trend. Reads: personality, brand-type.

**Cultural / Social.** How it will be read between people. This is where the **social engine** sits later (`08-apes.md`) — first exclusive landscape engine. For now the room is: who is in the culture around this work, what would shame it, what would let it belong, how A/P/E/S would each look at that. Not a Swarm hive.

**Laws. Rules.** What the work is not allowed to ignore. Fields: the rule, whose rule, what breaks if we skip it, the ethics/standards bits it must match. Not vibes.

**Public opinion.** The story already in the room. Fields: the story, who holds it, what would change it, the promise this brand has already made in public. Reads: promise, personality.

**Landscape (the field).** Overview of the six. Not a seventh textarea. A map of the six plates with fill state. Depth layers when we get to them: Internal / Prospects / Sector / Rest of the world — as a second row *inside this room*, not extra header chips.

**Relationships.** Who touches whom: people, products, places. Draw it (named nodes + how), not a mood. Advocates vs commentators are not the same seat.

**Evidence.** What we will hold as true before anyone draws. Know / don’t / need. RAD on the process stack reads this.

**Scale.** A flag on the plot, set early: sole trader, bigger business, corporation. A founder is not a division. Note: what that size means for *this* plot. Rooms may read it. The MAP does not sit it as a toggle.

## Eight seats (right)

Real people. Not persona nicknames. Not “busy mum.”

Each seat is a room: name, who they are (demographics only as far as they change the work), what they want from *this* brand, how this brand reaches them (channel, hour, object in the hand), what we never say to them.

Seats read people / value / benefit from the left. Comms Audience is *who the line is spoken to* — do not collapse with these eight (`04-comms.md`).

A rail of eight on every seat page. Held seats show the name.

## Interconnect

Positioning and location on the left must be visible from landscape. Landscape must be visible from positioning. Seat 4’s “what they want” should appear as a related line on value and benefit. Evidence appears on process RAD. Laws appears on ethics.

## Multi-format

Each landscape token and each seat has: text fields (the sitting), a still socket (Assets — “a picture of this neighbourhood / this person”, disabled until hook), generate socket (pre-prompt: this token + plot book + brand stills). No fake images.

## Look

Horizon of chamfered plates along the top (already started). Seats as a numbered rail, four then four, not pills. Cultural/Social can carry a quieter social-engine socket (unlit). Token rooms should not share one grid of three textareas — advocates is a who-gallery, trends is a moving strip, laws is a rule stack, opinion is a quoted story.

## Save

`cells["mapping:{topic}"]`. Audience: `mapping:audience:{n}`. JSON packs with `v: 1` and a **distinct kind per token**, not one `landscape` kind.

## Done when

You can sit a plot and pin three real advocates, one law, and two named customers, then walk to mission and see those names underneath. Trends does not look like Laws. Empty seats stay “Seat n”, not invented people.

## Topics must be registered

`frameworkTopics("mapping")` must include advocates, commentators, trends, cultural, laws, opinion, audience — or the horizon 404s. Sheets already exist. Depth layers from later Binder3 (Sector, Rest of the world, Internal, Prospects) sit *inside* landscape, not as extra header chips.

Binder2: landscape is the **environment** of comparison, amplification, distortion, regulation — not the audience. Positioning is tested here under pressure.

## Do not

Invent biography. Dummy briefing. Swarm cultural-sensing copy. Persona workshop adjectives. Collapse Comms Audience into these eight seats.
