# Offline lab — run this in the Design Lab North builder

**Who:** the DLN Cursor agent on `/home/main/DLN`.  
**From:** Ewan, 2026-08-17. Various Titles already has its own house; do not build this from that chat.  
**Shape:** a named function. A central offline lab means one local port, every house behind it, comments from any page or from `/admin`, a sniffer that captures them, this Cursor agent that delegates into the right filesystem, and a push that lands on the repo the request came from. Stubs that only prove a path exist are a defect.

Harmony: do not overwrite the live VPS, live Caddy, live plot containers, or working logins. Extend. Local is the editor. Live is the upload.

---

## What this is

We stop editing on the live hosts. We edit **offline on this PC**, the same way ModYu’s design desk already works — then we push a house when that house is ready.

Two processes stay up. Not a zoo of ports Dave has to start.

1. **Campus edge** — one port, like the live site. Always on. Knows where to read and write. You click through from Design Lab North into each **unit**. A unit’s app starts when someone is in it and sleeps at zero.
2. **Sniffer + unit Cursors** — comments land in that unit’s inbox at once (`wake.flag`). Campus sniff runs while studio is signed in. A unit Cursor sniffs while that instance is open. The campus chat does not do another unit’s queue. Push goes to **that house’s GitHub**.

Login is the Design Lab North book. One studio session. Dave and Ewan walk the local builds from the desk.

Remote later: downstairs Debian **holds the files and hosts the sites** (`ops/debian-host.md`). GPU PCs keep working copies for Cursor and push like GitHub. Two seats: [`memory/compass.md`](compass.md) + [`ops/house-lease.md`](../ops/house-lease.md). Public VPS stays the internet. Campus sniff while signed in; unit sniff while that Cursor is open (`ops/sniff-inbox.sh`).

---

## What already exists (use it, do not rebuild)

| Piece | Where | Keep |
|---|---|---|
| Live edge | VPS Caddy, one public port, host routing | Untouched. Local copies the *idea*, not the production file. |
| Studio desk | DLN `/account` when owner/studio | Keep person-first. **Current builds** must jump to **local** offline hosts, not only the live URLs. |
| Notes + plans | `_meta/plans/`, sweep, ready, shipped. Never auto-deploy | Keep. Page comments join this pile, tagged with plot. |
| ModYu builder | `/admin/desk`, `_meta/designer-inbox/`, `wake.flag`, `/admin/log` | **Lift this into DLN and make it central.** ModYu desk can stay as a client ops surface; the *build-machine queue* lives on the hub. |
| Plot registry | `greenhouse/plots.json` | Each plot needs: local house path, local host name, GitHub repo, live enter URL. |
| Houses | `/home/main/DLN` (`thekirkswood/DLN`), `/home/main/ModYu` (`thekirkswood/Modyu`), `/home/main/VariousTitles` (`thekirkswood/vt`), `/home/main/SwarmFund` | Do not merge repos. Delegate by origin. On Debian, client trees sit on `/srv/clients`. |
| VT public | varioustitles.com is Building; studio bounce `titles-enter` | Live gate stays. Offline VT is the editor copy on this PC. |
| Type | Hub uses **Aktiv Grotesk** (Adobe Fonts, Dave’s web project). Do not self-host foundry files we do not own. | Various Titles should use the same when that house is next touched. |

---

## Surfaces to build

### 1. Local edge (always running)

One listener (Caddy or compose on this PC). Same pattern as live: **host names**, not `/p/slug` paths. Do not rebase a plot onto a hub path.

Suggested local hosts (do not invent public domains):

| Host | House | Files |
|---|---|---|
| `localhost` (DLN port, today `:3010`) | Design Lab North hub + central `/admin` | `/home/main/DLN/Site` |
| `modyu.localhost` | ModYu offline | `/home/main/ModYu/Site` |
| `titles.localhost` | Various Titles offline | `/home/main/VariousTitles/Site` |
| `swarm.localhost` | Swarm Fund offline | `/home/main/SwarmFund` |

The hub stays the door. User-facing port is **:3010** on this PC (`localhost` or the LAN address from Dave’s machine). Click through under the Design Lab North banner (`/lab`), then `/lab/{slug}` loads that house and starts its app. Greenhouse and Strategy Enter on this PC go to the same station. Internal servers stay on 3000 / 3020 / 5173 and are proxied at `/go/{slug}/` so the frame is same-origin. Live hosts stay on their own names — do not rebase a **hosted** plot onto a hub path. `/lab` 404s on the public host.

Desk “current builds” on localhost opens `/lab/{slug}`. Live URLs remain on the greenhouse and on the person’s sites for the **hosted** copy.

### 2. Central builder (grab ModYu’s)

Move the design-desk **queue** onto Design Lab North:

- Path: **`/admin`** on the DLN local host (studio/owner only). Not on the public wall. Not a CMS for clients.
- Lift behaviour from ModYu `/admin/desk`: kinds (change / plan / note), text, images/video, pending → working → done/error, stamped log, `wake.flag` (or equivalent) so the agent runs **immediately**, all pending in order, one failure does not block the rest.
- Every item carries **`plot` (slug)** and **`origin`** (which host / path the request came from). That is how push and filesystem are chosen.
- ModYu `/admin` ops (Anne Marie, insights, clinics) stays on ModYu. Do not steal that into DLN.

### 3. Comments on every local page

On **local** builds only (not a requirement on the live VPS this pass):

- A small comment field in the footer (or a fixed note well) on every page of every house behind the local edge.
- Studio session (DLN cookie on the hub; local plots honour studio the same way the desk does). Clients on a live host still use the existing account notes — do not invent a second client login.
- Submit writes into the **same central queue**, with plot + page URL + body.
- Sniffer is this intake. Do not run a third daemon if the DLN app can write the queue and touch `wake.flag`. Two always-on things: **edge** + **this agent watching the flag**. If a tiny watcher process is cleaner than polling, it still counts as the sniffer, not a third site.

### 4. Agent loop (this Cursor)

When the flag changes:

1. Read all `pending` items in order.
2. Route by `plot` / `origin` to the house path and the GitHub remote.
3. Do the work in **that** filesystem. Honour that house’s `AGENTS.md` and memory. Do not restyle VT as DLN. Do not restyle DLN as VT.
4. Stamp `/admin/log` (or the hub equivalent). Safe reverse: never delete live files when `before` is empty (ModYu rule, keep it).
5. Do **not** auto-deploy to the VPS. Offline first. Upload / `sync-to-vps` / push is a decision.

### 5. Push by origin

| Origin | Repo |
|---|---|
| DLN hub | `thekirkswood/DLN` |
| ModYu | `thekirkswood/Modyu` |
| Various Titles | `thekirkswood/vt` |
| Swarm Fund | whatever Ewan already uses for Swarm (do not invent) |
| Choozlist | not until that house is on this PC |

Push when Ewan asks, or when a queue item is explicitly a ship. Individual houses, individual pushes. No monorepo.

### 6. Remote requests (later, still this brief)

Ewan from another device:

- Prefer: VPN/Tailscale or SSH tunnel to **this PC**, then the local hub + this Cursor.
- Account on Design Lab North is the identity. Do not add a new “remote builder” login.
- Port-forward the **local edge**, not the VPS editor.
- Do not expose Cursor’s UI on designlabnorth.com.

---

## Sequence (do not skip)

1. **Registry** — each plot in `plots.json` has `lab.housePath`, `localPort`, `github`, `inboxRel`. Various Titles github is `thekirkswood/vt`.
2. **Local edge** — one user-facing port `:3010`. `/lab` door. Houses proxied at `/go/{slug}/`.
3. **`/admin`** — this hub’s queue (ModYu desk lifted), studio only. `wake.flag`. Origin on every item.
4. **House desks** — `/lab/{slug}/admin` and page comments write **that** house’s inbox (ModYu keeps `_meta/designer-inbox`).
5. **Agent loop** — each folder’s Cursor processes its own pending list. Stamp a reply. No auto-deploy.
6. **Push by origin** — when asked. VT remote is `thekirkswood/vt`.
7. **Remote access** — tunnel to this PC. Not a public IDE.

Tick `memory/WORKSTREAM.md` when a step lands. Changelog every file touch.

---

## Harmony collisions (stop and ask if these fight)

- Live Caddyfile.prod / plot containers — do not rewrite to “serve the PC”.
- ModYu `/admin` ops for Anne Marie — keep. Only the **design inbox / wake queue** moves to the hub.
- Public copy: no Cursor, no desk, no “actually runs on” on `/practice`.
- VT: Building on the public wall; own repo; do not tell the public about shared login or billing. Type follows the hub (Aktiv Grotesk / Adobe Fonts) when that house is next touched.
- Auto-deploy stays forbidden.

---

## Out of scope until Ewan says

- GitHub Actions deploy
- Card checkout
- Hosting Choozlist on the VPS
- Inventing extra studio marks or domains

---

## First concrete move

Landed: **`/lab` door + `/lab/{slug}` station + `/admin` and `/lab/{slug}/admin` queues**, tagged with plot, named author, comments on the page. Houses need their lab prefix running (`ops/lab.md`). Agent loop is the wake.flag in each house — this chat watches DLN’s inbox.

Read `memory/protocol.md`, then identity → brand → BLUEPRINT → greenhouse → DIRECTIONS → this file → WORKSTREAM → changelog tail. Then build.
