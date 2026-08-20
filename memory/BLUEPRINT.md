# Blueprint — Design Lab North

Site-wide map. Update on major change only. Small work goes to DIRECTIONS + CHANGELOG. Open sequenced work lives in `memory/WORKSTREAM.md`.

## Purpose

Design Lab North is a **hub of multiple sites**, and a lab. People come for **Design**, **Strategy**, and **Build** — three offers that sit together. Walk in at the one you need. The work may move between them; the site does not number them or gatekeep the journey.

- **Design** — identity: naming, logo, identity systems. From the ground, or a refresh.
- **Strategy** — how the identity carries forward: brand strategy, marketing strategy, one-year and three-year plans. Sit-down counsel. **Various Titles** also lives here as a resource for people to learn (marketing fundamentals, branding book, further facets when named).
- **Build** — the site. From the ground, or a rebuild. Then a **live host** on a Design Lab North subdomain: they leave notes, we come in, the site changes while they watch. Work is done **offline** (this PC / later a home server), then uploaded as a bigger step — never live-edit the hosted copy every save. When they are ready, migrate onto their own domain; we keep coming in the same way from our desk. Smaller sites can share a server later. Ewan charges the build and the live host. Dave charges branding and marketing for that work.

The greenhouse is **our products** (Swarm Fund, Choozlist, Various Titles). Client sites live on the account, not the greenhouse wall. Isolation: one Docker plot per hosted client site.

Two kinds of plot:

| Party | Who | Greenhouse | Hosting |
|---|---|---|---|
| **Client** | Someone we are building for (first: ModYu) | Not listed. Sites live on the account. | Subdomain of designlabnorth.com while it grows, then migrate. |
| **Studio** | Ours (Swarm Fund, Choozlist, Various Titles) | Public product stories. Enter the **product domain**, not a DLN subdomain. | Swarm: live at swarmfund.com (own server). DLN `plot-swarm` is a growing copy until cutover. Choozlist: own house until Ewan uploads. Various Titles: `https://varioustitles.com` on this VPS (`plot-titles`). Public wall is Building; studio enter on this book’s session. |

We want more **client** plots. Do not invent studio names or clients. Do not put DAA on the wall until Ewan names them.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public | Small Design Lab North. Seven RUUN papers above Design, Strategy, Build. The strip scrolls only when it overflows (drag, wheel, swipe). If every paper fits, it sits. Three offer columns when they lock; one full centred slide with a swipe when they cannot. Trial column copy live; Dave’s institute paragraphs cached. No form, no extra links in the body. Header: mark, Home, Method, Practice, Greenhouse, Sign in or an account **circle**. Public nav stays the public nav — Lab / Builder do not appear here. Studio open Campus from under the circle. Menu is initial caps, not all caps. |
| `/design` `/strategy` `/build` | public | The offer. Write-in form lands on the studio desk. Other offers are open — not a funnel. |
| `/practice` | public | About us. Heading: Designing High-Value Brand Ecosystems. Dave Kirkwood first, then Ewan Kirkwood, **50/50**. Selected clients. No enquire form. |
| `/method` | public | How Design Lab North work — Dave’s institute copy (cooperation, scale, three values, border campus pipeline). |
| `/greenhouse` | public | Greenhouse projects. No named list in the intro. Various Titles first. |
| `/greenhouse/[slug]` | public | Studio product story. Enter the product domain if one exists. |
| `/account` | cookie | Client: profile, sites, notes, shipped patch notes, invoices. Studio on a lab host: **us** only (profile, sign out). The book lives on `/lab` under the unit doors. Public VPS has no `/lab`, so studio still gets the book here. Unauth → `/login`. |
| `/account/receipts/[id]` | cookie | Paid receipt. Print and download. Client if it is theirs; studio sees all. |
| `/not-yours` | cookie | Blanket: not yours. Home after 3 seconds. |
| `/preview/[slug]` | cookie | Redirects to the live plot URL if one exists. |
| `modyu.designlabnorth.com` | public + ModYu cookie | Self-contained plot (`plot-modyu`). Own accounts (`modyu_session`). Same logins as local `:3000`. Not behind DLN `forward_auth` — that gate blocked ModYu’s own login. Suggestion box in the footer (text only, not a live editor). Swarm growing copy stays gated. |
| `swarmfund.designlabnorth.com` | cookie | Growing Swarm plot on this VPS. Public enter is `https://swarmfund.com`. |
| `daa.designlabnorth.com` | public | Reserved. Redirects to the hub. |
| `varioustitles.com` | public: building. Studio: DLN session copied onto this host | Resource centre (`plot-titles`). Not behind `forward_auth`. Enter bounce: `/api/auth/titles-enter`. www redirects to apex. |
| `/login` `/logout` | public / session | Cookie `dln_session`. Header Sign in → `/account` (studio on this PC → `/lab`). Studio addresses `@designlabnorth.com`. |
| `/privacy` `/terms` | public | Real notices. Who we are, accounts, cookie, invoices, live hosts, rights. Footer. |
| `/lab` | studio, this PC (`localhost` or its LAN address on `:3010`) | Campus hub. Unit doors, then **Accounts**: Clients / Onboarding / Book / Pay / Settings as rooms that never go away. Serving is the client on the desk. Pay composes for that person. Header is the mark plus the account circle — Campus is the only admin surface (Builder lives as a door on campus). Public Home / Method / Practice / Greenhouse stay off this bar. 404 on the public host. Dave and Ewan both enter. |
| `/suggest/[slug]` | public | Live-host suggestion well. Text only. Lands on the client’s notes. Studio audits and sweeps into a plan. Not a live editor. Plot hosts can serve `/suggest` via Caddy → hub. |
| `/lab/[slug]` | studio, this PC | Unit station: the house in a frame under `/go/{slug}/`, note well on the exact page. `/modyu` and `/modyu/admin` alias here. |
| `/lab/[slug]/admin` | studio, this PC | Builder queue for **that** unit’s Cursor (writes that folder’s inbox + `wake.flag`). |
| `/admin` | studio, this PC | **Campus building site** — queue for this Design Lab North Cursor (`_meta/lab-inbox/`). Not a public CMS. |
| Cursor / this repo | studio | The actual design interface. `/admin` on 3010 talks to this chat. `/lab/modyu/admin` talks to the ModYu folder’s chat. |
| Offline lab | studio, this PC | Spec `memory/offline-lab.md` + `ops/lab.md`. One user-facing port. Live VPS unchanged. |
| `/home/main/VariousTitles` | studio | Sibling house. Public: `https://varioustitles.com` (`plot-titles` on this VPS). DLN email is the login. Billing stays on this book. |

## Auth

- Cookie: `dln_session` httpOnly. Domain `.designlabnorth.com`. `Secure` on HTTPS. Path `/`. 90 days, refreshed while they walk the site (`/api/auth/me` on each page). Root layout is always dynamic — do not cache a signed-out header. Logout and other server redirects use `DLN_PUBLIC_URL` / forwarded host, never `0.0.0.0:3000`.
- Store: `_meta/accounts/` and `_meta/billing/` on VPS `/srv/dln/data/accounts` and `/srv/dln/data/billing`. Gitignored. Avatars in `_meta/accounts/avatars/`. Seed file `SEED.txt`.
- Studio logins: `ewan@designlabnorth.com` (owner), `dave@designlabnorth.com` (studio). Both have the full desk: current builds, onboard, invoices, every plot.
- Copyable login sheets live in gitignored `_meta/accounts/sheets/` (Dave’s computer only for his; Ewan’s master has both studio pairs, live and local). Never put the passwords in this file.
- **Blanket:** those two logins are studio access on every plot host and subdomain login. Client books on live sites (ModYu patients/clinics, and so on) stay theirs. Hub endpoints: `GET /api/auth/studio`, `POST /api/auth/studio-verify`. Plots ask the hub; they do not copy passwords.
- ModYu ops: Anne Marie is a **client record** on this book (`modyu@designlabnorth.com`, plot `modyu` only) and an **offline puppet** (`puppet: true`). Sign in on campus / localhost to see a client account. Do not mail or regenerate that login. Public `designlabnorth.com` still refuses the puppet. The same email is her ModYu admin on the live host; **separate password**. The old seed `modyu@designlabnorth.local` is obsolete and absorbed. Rotation at launches / key events is later.
- Client handles: a real email, or an internal `@designlabnorth.local` address. `.local` is not a mailbox — it is the login on this book, and the same login for Various Titles. Personal mailbox is stored separately; onboard generates login + password and sends them there.
- Roles: `owner` (all), `studio` (all), `client` (listed `plots[]` only).
- Various Titles: DLN customers log in with their Design Lab North address. Billing stays on this book. They must be a paying VT customer (a paid `titlesGrant` line). Bank-account link is the next rail. People who only want VT still get a DLN account and are billed here.
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 `/login` if unauth, 302 `/not-yours` if wrong account or plot shut for unpaid (Settings days to pay after due). Studio/owner always 200 when signed in.
- Titles: `GET /api/auth/titles` → session grant for the VT house (`section` \| `full` \| none), plus `studio`. `GET /api/auth/titles-enter` copies a studio session onto varioustitles.com. Clients are sent to the building page.
- Swarm public (`swarmfund.com`): same pattern. `GET /api/auth/swarm` → `{ ok, studio }`. `GET /api/auth/swarm-enter` copies a studio session onto swarmfund.com. `GET /api/auth/swarm-consume` for the one-time code. Public wall is the Swarm Fund mark and “Building.” until Ewan/Dave enter. Clients signed in here still see Building.
- Edge (Caddy) `forward_auth` to that gate before proxying a **gated** plot (Swarm growing copy). ModYu’s host is ungated so its own account book can sign people in. Various Titles at `varioustitles.com` is ungated at the edge — the app shows Building unless a studio session is copied on.

## Desk (studio)

On a lab host the book is **campus**, under the unit doors (`/lab`). `/account` is Ewan and Dave: profile and sign out. On the public VPS (no `/lab`) the same book still sits on `/account`.

Pick a person from Clients — that is **our dossier**, not their account. Rooms stay on the desk. Serving is who we are charging. Pay: tap the same Design / Strategy / Build list as Settings to populate an invoice, Other for a Reason and Charge, **Ping payment** sends them to the online system (they enter their details there). Save draft still exists. Compose on the person’s Billing tab is the same list, not a second invention. Defaults (amounts, days to pay, Adobe kit, online rail, spare bank) live in Settings.

**Current builds** at the top of Book: on this PC, **Open here** jumps into `/lab/{slug}`. That page starts the house. Live URLs stay for the hosted copy. Greenhouse / Strategy **Enter** on this PC goes to the same station; public `designlabnorth.com` still enters the live host.

## Live host, notes, plan, staging

The service they buy after an initial sit-down and an initial build is a **live host**: a growing copy on our subdomain. They leave **suggestions** in a text box on the live host (ModYu footer, and `/suggest` on the plot host). That is not a live editor and not the offline lab comment well. Studio reads the notes on the person, sweeps them into **one plan**, and runs it **offline**. Nothing is pushed live until that bigger update is happy. Shipped plans carry **patch notes** (their notes, rewritten, plus what we added). Account notes still exist for people who have a hub login.

Do not live-edit hosted plots on every save. Offline staging is the point.

**Offline lab:** user-facing port is `:3010` — the **campus**. Units are their own folders. On this GPU PC a unit sleeps at zero occupancy; on the downstairs host the ports **sit**. Send writes the queue. Campus sniff runs while studio is signed in. `/admin` is the campus building site. Which Cursor owns which queue: `memory/cross-house-comms.md`. Which GPU seat and how two Cursors share a house: `memory/compass.md`, `ops/house-lease.md`. **Debian holds the files and hosts the sites.** Studio houses on the NVMe (`/home/main`). Client houses on the 1TB (`/srv/clients`, symlink at `/home/main/ModYu`). GPU PCs keep working copies so Cursor is fast, then push (GitHub sense). Public Fasthosts stays the internet host. Audit: `memory/audit-campus.md`. Spec: `memory/offline-lab.md`. How to run: `ops/lab.md`. Do not rebase **live** plots onto hub paths.

## Billing

- Catalogue names and cadence: `Site/src/data/catalogue.ts`. Standing GBP live in Settings (`_meta/billing/prices.json`). Each entry has its own amount. Zero / empty is £0, not a global default. Until a line is given its own amount it stays empty. Sittings, initial build, and live host weekly are whatever we save on those boxes.
- Time: `Site/src/lib/clock.ts`, zone `Europe/London`. Invoice numbers `DLN-YYYY-0001` use the London year. Issue, pay-by (Settings days to pay, default seven), and rolls use London calendar days, not UTC. The book clock ticks itself. Nobody types a date.
- **Diary:** `_meta/billing/bookings.json` + `hours.json`. Studio only (Book on campus). Dave default Design and Strategy, Ewan default Build, override by holding the other calendar. Set hours live on the grid. Public Design / Strategy / Build have no calendar. APIs stay so we can book and see what is on.
- Studio edits standing amounts on **Settings**: Design / Strategy / Build as three columns, swipe on a phone. **Pay** uses that same list as selectable lines to populate an invoice for who we are serving. Other is a Reason and a Charge. Ping payment issues and tries the online rail. They enter card details in the provider, not on a manual invoice. Bank rail stays in Settings as spare. Draft / issue / receipts / rolls stay. 
- Pay is online when the provider is connected (`STRIPE_SECRET_KEY` later, never in git). Ping tries to collect; until the provider is live the invoice still issues and they still owe. Receipts write to `_meta/billing/receipts.json` and download at `/account/receipts/[id]`. Hosting rolls auto-collect when online is live (`online.json` autoHost).
- Client marks “I’ve paid” (claim). Studio records or confirms paid when the money lands (`_meta/billing/payments.json`). Due until studio clears. Unpaid after Settings **days to pay** (default seven) after due, if a line is bound to a plot → that plot is shut for the client.
- Recurring lines (weekly/monthly) roll a new invoice when the period ends. Rolling hosts show on Book.
- A4 print view: DLN mark, invoice, London date, lines, waived in the cost column, total, how to pay (or later).
- Various Titles grants (`titlesGrant` on a line) are billed here. A paid grant is what converts a DLN customer into a VT customer. Same email. This book is the bank. Zero-total invoices (all waived) mark paid on issue.

## Stack

| Layer | Choice |
|---|---|
| Studio site | Next.js 14 App Router, TypeScript, `Site/` (local `:3010`) |
| Edge | Caddy. HTTPS live (`Caddyfile.prod`). Plot `/assets` and `/_next/static` skip the gate. Watchdog keeps HTTP up. |
| Plots | One compose service per **hosted** plot. ModYu at `modyu.designlabnorth.com`. Swarm growing copy at `swarmfund.designlabnorth.com`. Various Titles at `varioustitles.com` (`plot-titles`). |
| Local | Campus on `:3010` (`ops/campus.service` until Debian). Unit apps start on occupancy with lab prefix (ModYu `:3000`, VT `:3020`, Swarm `:5173` + api `:8787`) and sleep at zero. |
| VPS | Ubuntu 26, `/srv/dln`, Docker Engine + compose |
| Source | This PC → GitHub `thekirkswood/DLN` (numbered iteration + tag `dln-{n}`) → VPS. Rsync excluding `.git`, `deploy/.env`, accounts, billing. Counter: `memory/ITERATION`. |
| DNS | Livedns (`ns1.livedns.co.uk`). VPS is IONOS; DNS is not. |

## File map (repo)

```
memory/                 holy LTM + WORKSTREAM + compass
greenhouse/plots.json   plot registry (source of truth)
Site/                   public Next app
_meta/accounts/         users/sessions/avatars (not git)
_meta/billing/          invoices, rolls, prices, rail, online, payments, receipts, bookings, hours (not git)
_meta/studio/           settings dump — default charge, days to pay, Adobe kit (not git)
_meta/enquiries/        site forms (not git)
_meta/plans/            notes + build plans (not git)
deploy/                 Caddy, compose, Dockerfiles, VPS bootstrap
ops/                    host facts, no secrets
```

## VPS layout

```
/srv/dln/
  repo/          git checkout
  data/accounts/ persistent DLN auth + avatars
  data/billing/  invoices, prices, rail, payments
  data/enquiries/ site forms
  data/plans/     notes + build plans
  data/modyu-accounts/  ModYu app auth (separate)
  data/swarm/     Swarm Fund sqlite
  plots/modyu    ModYu source bind for image builds
  plots/swarm    Swarm Fund source bind for image builds
  plots/various-titles  Various Titles source bind (`plot-titles`)
```

Host: `82.165.5.84` (IONOS). SSH key `~/.ssh/id_ed25519_dln`. Secrets never in git or memory prose.

## Naming

| Term | Meaning |
|---|---|
| Stage | Design, Strategy, Build — three offers. Come in at any. |
| Greenhouse | Public heading **Greenhouse projects**. Studio products. |
| Plot | One site (client or studio) — container + host when hosted |
| Party | `client` or `studio` in `plots.json` |
| Studio | Us. Cursor. This repo. Swarm, Choozlist, Various Titles. |
| Client | ModYu now. More to come. |
| Desk | Owner + studio: pick a person; current builds; bring on from an enquiry |
| Live host | Growing copy on our subdomain. Notes in, we come in, they watch. |
| Plan | Swept notes. Run offline. Upload when happy. Patch notes on ship. |
| Various Titles | Resource centre. A life’s work, for people to learn. Sibling house, hosted at varioustitles.com on this VPS. DLN email is the login. Billed on this book. |
| Campus | Hub on `:3010`. On this PC until Debian downstairs holds files+ports. Design Lab North. |
| Unit | One house folder + its Cursor + its app while occupied (ModYu, Various Titles, Swarm, new stations). |
| Compass | Which machine is home (Debian) and which GPU **seat** takes the next job. `memory/compass.md`. |
| Seat | A live Cursor on tower (2070), laptop (3060), or Dave’s PC, SSH’d into Debian. |
| Migrate | Client plot leaves onto their own server/URL. Same desk, different upload target. |

## Out of scope (now)

- GitHub Actions deploy
- Card checkout / Stripe (bank rail is live on the invoice)
- Hosting Choozlist on this VPS
- Auto-deploy from a plan. Offline first. Upload is a decision.
- Listing DAA until Ewan names them as a client
- Inventing extra studio marks
- Public Cursor / in-site CMS on the live hosts
