# Board — master plan

2026-10-07. This folder is how the board gets built. Chat is not the plan. Scaffolds in `Site/` are not the board.

The thing we are making is **one living MAP**: a navigable space whose regions are unique, interconnected, and all feed **one master entity** — the plot, the thing itself, sitting in the centre. People can spend a sitting putting work in. Neighbouring cells read each other. The table changes as they do.

It is studio only while built. 404 on the live host. Swarm hive, tokens, and DAA vNext stay off this campus.

## What this is not

Not a site of forms. Not one Hold box with different titles. Not a 3D shell whose insides are all the same article. Not an eight-minute generation marked landed. Not Swarm Fund. Not a public CMS.

## Master entity

The **plot** is the book. Everything on the table is a reading of, or a writing into, `_meta/boards/{plot}.json`:

- `bits` — left column they populate (identity statements through philosophy)
- `cells` — every other room (landscape, seats, comms, process, workbench, sit)
- host, notes, plans, stills (Assets) and later generated plates sit on the same book

The centre (`/board/plot`) is a **showcase of that book**, not BrandBoard-while-walking. Click through for the full cell. If the centre does not change when a landscape seat or a mission line is held, the table is still a website.

## Geography (Binder3)

The blueprint “looks fixed, but it’s made for living systems.” Boxes clarify working; they do not constrain it.

| Region | On the table | Who | Job |
|---|---|---|---|
| Top | Advocates, Commentators, Trends/Style, Cultural/Social, Laws. Rules., Public opinion | They pin the world | Neighbourhood the brand actually sits in |
| Left | Narrative, Sensory, then identity bits, with A/P/E/S on that column | They populate | Hours of input. Human-made and generated media |
| Centre | The thing itself | The plot | Short tailored view of *their* work |
| Under | Object → People → RAD → Concepts → Candidate → System → Implementation → Guardianship | We run | Our machine, our voice, checkpoints |
| Right | Customer seats 1–8 | They name real people | Who this plot has to hold, how this brand reaches them |
| Pad | Ownership, process, the board, the host, guardianship | Briefing | Skip one and the host invents a second brand |

Later Binder3 sheets add landscape **depth** (not extra header chips yet): Sector · Rest of the world · Internal · Prospects · Customers + ID. Those belong *inside* landscape rooms as layers, not as a second table.

Scale of business (sole trader / bigger business / corporation) changes how every region reads. It is a flag on the plot (`mapping:scale`), set early. Not a toggle on the table. Not a quiz on every cell.

## Look

Paper / Ink. Aktiv Grotesk. 45° chamfer. No pills, no card shadows, no gradient orbs. Not the binder’s mint construction sheet. Faculty plates from `Site/public/brief/Frameworks/` are the locked names and captions.

Entering a region from the table should **feel like entering**, not like a hyperlink dumped onto a CMS page. If a game engine is wrong, patchwork sockets and CSS motion are allowed. The overview stays the MAP; it does not become a second site.

## Learning

Teaching sits **behind** the page (`What this cell holds`, from `board-sheets.ts`). The first view is this plot’s reading. A.P.E.S. is how thinking is widened when it matters — not a lecture on the wall. The later talk-to / generate face is pre-prompted from this folder + the cell sheet + the plot file. Human decision stays sovereign. Do not fake it.

## How agents work this folder

1. Read `00-index.md` and the section file they own. Read `memory/board-knowledge.md`, `Site/src/data/board-sheets.ts`, `Site/src/data/faculties.ts`, `memory/identity.md`, `memory/brand.md`.
2. Build that section to the depth the plan names. Unique interior. Interconnect. Multi-format sockets. Save to the plot file.
3. Do not mark the campaign **landed**. Status names what is still thin.
4. Do not start a neighbouring section’s rewrite except to read it or leave a named door.
5. Do not `npm run build` over a live campus `.next` without stopping the unit. Push downstairs when Ewan is looking at Debian `:3010`.
6. Generate / Assets stills are visible sockets until a studio key exists. Never a dummy picture or a dummy chat.

## Section files

| File | Region | Build after |
|---|---|---|
| `01-overview.md` | The table as space | Spine. Rooms light from the book. |
| `02-mapping.md` | Top + right | Neighbourhood and eight seats |
| `03-identity-bits.md` | Left column they populate | Twenty objects, not twenty forms |
| `04-comms.md` | Narrative + Sensory | Line, place, who, spotlight |
| `05-process.md` | Under | Eight protocol rooms |
| `06-centre.md` | The thing itself | Showcase from the whole book |
| `07-workbench.md` | Pad + coal face | Tools, board-as-zoom, host |
| `08-apes.md` | Compass on the identity column | Mindsets, cycle, cards, social engine |
| `09-solport.md` | Sit | One-to-one on the actual work |
| `10-generate.md` | Whole table | Plug-in face. Socket until keyed |
| `11-identity-faculty.md` | Avenue 06 | Toolkit that holds their bits |
| `12-one-space.md` | The walk | Interiors mount **on the table**. Routes are fallbacks. |
| `13-little-tasks.md` | Slices | Camera, plates, assets, numbered jobs |
| `14-environments.md` | Interiors | Instruments, not entry boxes. Teaching behind. |
| `15-give-back.md` | Return pipes | Derived now; research + generate when keyed |

Walking is `/board?enter=`. Unique interiors stay; they are not a second site. Build **the space** (this file + 01 + 12) whenever a room still dumps you onto a page. Then deepen rooms inside the well. Generate last.

## Done (section)

A section is not done because routes exist. It is done when:

- A studio sitting can use it for that cell’s actual job
- Neighbours show on the page from the plot file
- The centre would have something new to show if that cell is held
- The interior cannot be mistaken for another section’s interior
- Teaching is behind, not in the way

## Blocking infrastructure (census 2026-10-07)

These were making unique rooms into boxes that could not hold:

1. `/board` rendered BrandBoard. `BoardSpace` was never mounted.
2. `POST /api/board` ignored `cellKey`. Mapping and Comms holds never reached the plot file. `saveCell` + `BoardView.cells` must exist.
3. Landscape tokens and A.P.E.S. mindset ids were missing from `frameworkTopics` — advertised URLs 404ed.
4. Table/room CSS (`.board-space`, `.board-room`, …) was missing on this tree — interiors unstyled until added.

Fix the pipe before polishing rooms. Binder3/Binder2 PDFs live in `/home/main/Downloads/Swarm-Apes/`, not Downloads root.

## Sources (do not improvise past these)

- Binder3.pdf (MAP drawing + later landscape depth sheets)
- Methodology + Frameworks 01–08 plates (`Site/public/brief/`)
- `memory/board-knowledge.md`
- `Site/src/data/board-sheets.ts` (locked teaching)
- `Site/src/data/faculties.ts` (locked names, captions, ENGINE_STAGES)
- APES2 + campus `apes-play.ts` for think
- Identity and brand files for voice and look

Dummy pad lines on Binder3 page 1 (“another one”, “how do you become an expert”) are **rejected**. Live pad is the five briefing notes already on campus.
