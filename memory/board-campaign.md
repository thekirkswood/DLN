# Board campaign

2026-10-07. Continuity for every agent. Chat is not the campaign. This file is.

The MAP table is already the geography. A 3D shell with one Hold box in every room is not the board. Each place on the table is a unique room that does that place’s job. People can spend hours putting work in. Neighbouring cells read each other. Generate slots wait for a studio key — do not fake pictures or talk-to.

Studio only while built. 404 on the live host. Swarm hive / tokens / DAA vNext stay off this campus.

## How to work it

Plans live in `memory/board-plans/`. An agent reads `00-index.md` plus the section file, then builds that section. Parallel agents may own different sections if their files do not collide. Do not mark landed from a short form pass.

One section is **one faculty, or half of one**. A pass that tries to “do the board” in thirty minutes is a defect.

Before a section: read the plan, `memory/board-knowledge.md`, Binder3 facts in that scan, `Site/src/data/board-sheets.ts`, the faculty caption in `faculties.ts`. Honour identity and brand. Do not invent biography or a mark.

After a pass: unique interior mounts **on the table** (`/board?enter=`), teaching still behind, plot file still holds the work, changelog + this file’s **Status** line, `ops/push-campus-downstairs.sh` when Ewan is looking at Debian `:3010`. Do not `npm run build` over a live campus `.next` without stopping the unit. Old topic routes are fallbacks, not the sitting.

Keep the chat open, or start a new one with “continue board campaign pass N”. Cursor Cloud Agents / Automations can tick a pass overnight later. Do not migrate the house off this Cursor to get a longer brain — migrate only if Ewan wants a different product.

## Table regions (Binder3)

| Region | On the table | Job |
|---|---|---|
| Top | Advocates, Commentators, Trends/Style, Cultural/Social, Laws. Rules., Public opinion | The world around the work. They pin who speaks, what is moving, what the law is. Generate later from brand stills + this cell. |
| Left | Narrative, Sensory, then identity bits (mission through philosophy), A/P/E/S on that column | They populate this. Human-made and generated media live here. Hours of input. |
| Centre | The thing itself (plot) | Showcase that morphs from the book: stills, lines, a short tailored view. Click through for the full cell. |
| Under | Object → People → RAD → Concepts → Candidate → System → Implementation → Guardianship | Our machine, our voice. Checkpoints, not a poster. |
| Right | Customer seats 1–8 | Real people this plot has to hold. Demographics, what they want, how this brand reaches them. Not persona nicknames. |
| Pad | Ownership, process, the board, the host, guardianship | Briefing. Skip one and the host invents a second brand. |

Scale of business (sole trader / bigger / corporation) is a flag on the plot, set early (`mapping:scale`). Rooms may read it. The MAP does not sit it as a toggle.

## Passes

| Pass | Scope | Prompt (run this, don’t summarise it) |
|---|---|---|
| **1** | System Mapping — landscape + eight seats | Ground-up unique rooms. Landscape tokens are a horizon of plates, not a textarea. Each token: who, what they do here, how we hear them, stills later, generate slot (key later). Customers: eight seat rooms — name, who they are, what they want, how we reach them, what we never say. Seats read people / value / benefit. Interconnect tokens and seats. Teaching behind. |
| **2** | Identity bits (left column) | Each bit is its own object, not a shared form. Mission is a line they can stand in. Founder is a timeline. Personality is a room of traits with stills. Philosophy / ethics / standards are protocols. Save to `bits`. Neighbours on the column. |
| **3** | Comms (Narrative + Sensory) | Message, channel, audience, spotlight as four different rooms. One line vs where it holds vs who it is (and is not) vs the moments that must be clear. Stills and type from Assets. |
| **4** | 8 Process (the stack) | Eight stage rooms as a protocol they walk. DLN voice. Checkpoints, ownership, what is signed. Object through Guardianship. Pad notes 1–5 land in the right stages. |
| **5** | Centre — the thing itself | `/board/plot` is a showcase, not BrandBoard-while-walking. Short view from the whole book. Assets and generated plates sit on the cell. Heavy compile stays off the walking path. |
| **6** | Workbench | Tools, ideas-through, the board, the host. Host is live site / constant sandbox, one package. The board cell is zoom/effect on *their* plot. |
| **7** | A.P.E.S. | Four mindsets as play (already partly unique). Combinations, cycle, cards, interrogation as rooms. Not Swarm hive. Social engine on Cultural/Social (pass 1 leftover) is the first landscape engine. |
| **8** | Solport | Sitting, tools in use, channels, content. One-to-one on the actual work. |
| **9** | Overview | Keep CSS 3D table. Segmented, pretty, navigable. Entering a segment animates into that unique interior (flow, not a second site). Patchwork sockets if a game engine is wrong. |
| **10** | Generate + talk-to | Plug-in LLM. Pre-prompt from plot book + this cell + brand stills. Tokens we issue. Do not fake. Keys in ops env, never in git. |

## Status

**Plans written 2026-10-07** in `memory/board-plans/` (00–12). Not landed. Walk is `12-one-space.md`.

Mapping interiors are distinct rooms on disk (advocates gallery, laws stack, etc.) with per-token packs into `cells`. Not walked, not landed. Still thin: social engine, Assets, seat want → value/benefit, RAD reading evidence, centre morph.

Identity: all twenty left-column bits have unique interiors wired. Not walked, not landed.

`/board` is the sitting. Clicking a plate stays on `/board?enter=` — the interior mounts in a well on the table. Topic/bit/avenue routes redirect onto `?enter=`. Maps camera (yaw + pitch, zoom-in enters a plate, zoom-out leaves). 3D stays on below 1100px; pan limited on a phone. Wheel and overflow stay in the board. Individual plates on the table. Scale is a plot flag. Assets library stills sit on the centre, personality, comms, process, workbench, Solport. Customers street when you enter the row. Solport four rooms and identity faculty 06 are wired into the well. Environments wave (`14-environments.md`): quiet masts, teaching behind, Guardianship as clickable cadence, Object as stand-in, Mission job + seats, Message one line, Advocates as people, A.P.E.S. clover without the lecture. Still a skeleton. Still thin: remaining process stages as instruments, seat rooms as inhabited places, social engine, Clock analytics (no invented numbers), generate. Not landed.

Comms, process, workbench, A.P.E.S., identity bits, identity faculty, mapping, Solport, centre showcase are on disk for that well. Nothing landed.

## Done gate (an agent must not tick itself)

A pass is done only when all of these are true:

- Each room in that pass is a distinct interior (layout, fields, neighbours), not a shared template with different labels.
- Walking stays on `/board`. Entering a plate does not open a second document.
- Teaching is behind the page. The plot file holds structured work.
- Studio session: the rooms can be used for a real sitting (type, hold, move to a neighbour, see it read).
- Generate / Assets stills remain sockets until a key exists — visible, not fake.
- Status line in this file names what is still thin.

## Do not

- One textarea for every cell.
- Swarm tokens, hive revenue, DAA vNext HTML on campus.
- Dummy briefing lines from the Binder3 PDF.
- Ship `/board` live.
- Overwrite working campus chrome to squeeze the table.
