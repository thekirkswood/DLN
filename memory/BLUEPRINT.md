# Blueprint — Design Lab North

Site-wide map. Update on major change only. Small work goes to DIRECTIONS + CHANGELOG. Open sequenced work lives in `memory/WORKSTREAM.md`.

## Purpose

Design Lab North is a **hub of multiple sites**, and a lab. People come for **Design**, **Strategy**, and **Build** — three offers that sit together. Walk in at the one you need. The work may move between them; the site does not number them or gatekeep the journey.

- **Design** — identity: naming, logo, identity systems. From the ground, or a refresh.
- **Strategy** — consultancy: brand strategy, marketing strategy, audits, workshops, blueprints. Sit-down counsel. Various Titles is a greenhouse product, not a section on this offer page.
- **Build** — the site. From the ground, or a rebuild. Then a **live host** on a Design Lab North subdomain: they leave notes, we come in, the site changes while they watch. Work is done **offline** (this PC / later a home server), then uploaded as a bigger step — never live-edit the hosted copy every save. When they are ready, migrate onto their own domain; we keep coming in the same way from our desk. Smaller sites can share a server later. Ewan charges the build and the live host. Dave charges branding and marketing for that work.

The greenhouse is **our products** (Swarm Fund, Choozlist, Various Titles). Client sites live on the account, not the greenhouse wall. Isolation: one Docker plot per hosted client site.

Two kinds of plot:

| Party | Who | Greenhouse | Hosting |
|---|---|---|---|
| **Client** | Someone we are building for (first: ModYu) | Not listed. Sites live on the account. | Subdomain of designlabnorth.com while it grows, then migrate. |
| **Studio** | Ours (Swarm Fund, Choozlist, Various Titles) | Public product stories. Enter the **product domain**, not a DLN subdomain. | Live products sit on the IONOS VPS with the hub (`plot-swarm`, `plot-titles`). Swarm public is swarmfund.com (apex may still be Fasthosts until A records flip). Choozlist: own house until Ewan uploads. Fasthosts `77.68.49.132` is a paid preview box until April 2027 — not a second production greenhouse. |

We want more **client** plots. Do not invent studio names or clients. Do not put DAA on the wall until Ewan names them.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public VPS | **Campus home** (Design / Strategy / Build). Same ticket landing as the LAN tester. The framework board is **not** on this host. Print sits in the work lines. Account, press kits, and the asset hub are behind sign-in. |
| Campus tester `:3010` `/` | public on home | **The campus.** Ticket landing (Dave’s sentence with slight grey on the working words; 01–03 lists on one field; Campus tab locked left of the box). No pigment: only the numbers and Enter links are grey. 01/02/03 scramble those greys, not Paper/Ink. Paper/Ink chips sit on the header line next to the floating DLN mark. Strangers: plus is add plot. Signed-in: plus is the last plot’s name; sandbox / live host sit under the ticket (board only for campus studio). No rolling framework GIF. Enter: lists and sentence collapse so the three names become the left rail — they do not stack down the full screen. Contact Design / Contact our consultants / Contact the web team sit at the foot of each rail list and look like a form, not a page. Inside: Design / Strategy / Build locked on the left, line list as a dropdown under the open door. Design: logos centred in the plate (house marks plus the library; DAA on Logos only, not greenhouse); identity as the mark on card/phone/laptop with the stills in the devices, no filmstrip under; UI as a window you can tab and menu. Strategy opens on How we work — eight stage names switch in place with a plate, a walking track, the four glyphs, and pipeline outputs. Rail: How we work, Start-up, Brand, Marketing, Audits, Over-arching. No Online Strategy (online sits inside brand and marketing). Start-up is a two-hour sitting in four half-hours. Brand/marketing beats change the surfaces. Audits walk Look / Sit / Write. Phone: the left list folds to an arrow. Campus tab stays on the left of the ticket on a phone. Paper/Ink is a box with no bottom on the header line. Build: point / evidence / explain — Simple sites as formats (gallery, shop front, page, diary); workspaces as a desk (incoming / in work / done) plus the seven-step job flow (input → process → output → allocated → completed → commented → logged); apps morph layouts; modernization quote cycles (Change the title, then Sit the body in a different colour) then Push; Systems add functions and can join what they run. Host: sandbox can reopen, £50 one environment / £100 both. Paper/Ink. Not the public VPS until a numbered ship. |
| Campus tester `:3010` `/letter` | public on home | **Parked letter.** Dave’s previous plate (Design / Lab / North + Strategy / Design / Build columns). Kept as an instance to take from. Not in the main menu. |
| Campus tester `:3010` `/app` | redirect | Redirects to `/`. |
| `192.168.0.223:3011` DLNAPP | stopped | Port off. `dlnapp.service` disabled. Not a show URL. Folder may remain on disk. |
| `/design` `/strategy` `/build` | public | Offer pages with through-lists and the sentence enquire form. Home column names the six Build engines; `/build` body stays until the engine cutover. |
| `/practice` | public | About us. Heading: High-Value Brand Ecosystems. Mid-grey line: Plan, Design, Build, Maintain. Dave’s practice story first, then Dave and Ewan stacked bios (1px mid-grey rules; names and copy, no portraits), then Selected Experience and the client list. No enquire form. |
| `/work` | public | Dave’s work plate. Main-menu Work. The gif is full width on the gif’s own dark grey (#686868). No footer on this page. |
| `/method` | public | **Methodology.** Seven RUUN papers at the top (moved off home). How Design Lab North work. Quality filter (four screens: Commercial, Human, Societal, Environmental) and campus pipeline as diagrams; idle play lights the tile under the token. Eight-stage campus engine concertina (same fold as home Design / Lab / North): Stage 1–8 titles bold, revealed line medium beneath; all closed on load. Under the 4-room pipeline: Consultancy / Design / Websites as three light-grey words (same fold as home Strategy / Design / Websites). Closed on load; one pipeline at a time; choosing another word closes the last; a click off the words closes all three. Each flow is eight vertical stages in pairs, orange outputs lighting as the token walks. Phone: stacked rooms, left-rail token, compressed copy under each tile lighting with it; project flows scroll sideways. Desktop facets unchanged. No Various Titles close. In the footer as Methodology. Not in the main menu. |
| `/greenhouse` | public | Greenhouse projects. No named list in the intro. Various Titles first. |
| `/greenhouse/[slug]` | public | Studio product story. Enter the product domain if one exists. |
| `/account` | cookie | Client: profile; **Sites**, **Press kits**, **Assets**. Sites: Visit site + Press kit + **Assets** (library) + **Edit kit**. Assets is the **asset hub**: house and type dropdowns, drag-and-drop upload, write a text note, comments, download, delete (uploads/docs only), tick **On the press kit**. Edit kit is the MAP framework editor (cover, vault On/Off, Add/Remove, stories and promotions On/Off). See it live opens `/epk/{kit}`. Studio: profile plus the book rooms — Clients / Onboarding / Book / Pay / Settings / Watch / **Clock** / **Houses** / **Assets** (hub) / **EPKs** (kit list; Edit kit opens the MAP editor). Houses is Dave’s click sheet. Unauth → `/login`. |
| `/epk` | public code / session | **Press kits.** `designlabnorth.com/epk` (LAN `dln.local/epk`). Strangers: access code only (kit code or promotion code). Cookie `dln_epk`. No email. Rate-limited. Signed-in client: tiles for kits flagged on their account (`plots` → kit). Signed-in studio: every kit. A journalist who already has a cookie and returns to bare `/epk` is sent to **their** kit only. |
| `/epk/[kit]` | EPK cookie **for this kit**, studio, or tagged client | **Unique kit on the HT4 MAP chrome** (`_meta/HT4_EPK MAP.pdf`): top bar, left rail, cover of three hero stills + story plates + asset-vault strip. Live pack **pulls only assets ticked to share**, then the editor’s section flags / On/Off / live stories and promotions. Unique seed copy in `epk-docs/{kit}.ts`. Kits: dln, modyu, pfp, dks, swarm, daa, titles. Cookie mismatch **gates in place**. Do not put DAA on the greenhouse wall. |
| `/desk` | studio | Door to the downstairs studio book. Live `designlabnorth.com/desk` is Caddy-proxied home after studio-gate. Client `/account` stays on the VPS. |
| `/board` | campus studio only | **Framework gameboard — not live.** On `dln.local` / LAN, owner and studio may open it while it is built. On `designlabnorth.com` it **404s** for everyone, including studio. Not in the public header. Plot doors and qualify do not send people there on the live host. Unauth on campus → `/login?next=/board`. |
| `/host` | public on tester | Host room: live or sandbox £50 pm, both £100 pm, heavy traffic negotiable, Build costs. Sandbox can reopen while live stays. Contact writes the enquiry book. Live VPS does not carry this priced room until ship. |
| `/account/receipts/[id]` | cookie | Paid receipt. Print and download. Client if it is theirs; studio sees all. |
| `/not-yours` | cookie | Blanket: not yours. Home after 3 seconds. |
| `/preview/[slug]` | cookie | Redirects to the live plot URL if one exists. |
| `modyu.designlabnorth.com` | public + ModYu cookie | Self-contained plot (`plot-modyu`). Own accounts (`modyu_session`). Same logins as local `:3000`. Not behind DLN `forward_auth` — that gate blocked ModYu’s own login. Suggestion box in the footer (text only, not a live editor). Swarm growing copy stays gated. |
| `paulfosbury.designlabnorth.com` | public | Paul Fosbury Portraits growing copy (`plot-pfp`). Ungated parking wall: Design Lab North mark and Building. Same plot as the live domain. |
| `paulfosburyportraits.com` | public | Client live host. Ungated. www redirects to apex. Same container as the DLN subdomain. |
| `swarmfund.designlabnorth.com` | cookie | Growing Swarm plot on this VPS. Public enter is `https://swarmfund.com`. |
| `daa.designlabnorth.com` | public | Reserved. Redirects to the hub. |
| `varioustitles.com` | public: building. Studio: DLN session copied onto this host | Resource centre (`plot-titles`). Not behind `forward_auth`. Enter bounce: `/api/auth/titles-enter`. www redirects to apex. |
| `/login` `/logout` | public / session | Cookie `dln_session`. Header Sign in → `/account`. Studio addresses `@designlabnorth.com`. On `dln.local` / `*.dln.local` the cookie is `Domain=.dln.local` **and** a host-only twin. Live stays `.designlabnorth.com`. `Secure` follows HTTPS. Middleware refreshes Max-Age on each walk (90 days). Sign in `next` may be a LAN lab URL (`builder.dln.local`, backup IP ports). Lab copies the session via `/api/auth/lan-enter` → `/api/auth/lan-consume` (half-hour one-time code). Studio login ok/fail and lastLogin are Clock facts (no passwords). |
| `/privacy` `/terms` | public | Real notices. Who we are, accounts, cookie, invoices, live hosts, rights. Footer. |
| `/blocked` | public | Blocked-address screen on this host. One box: why should this address be unblocked. Stored for studio Watch. Likely ignored. Signed-in people are never blocked. Live `designlabnorth.com` gets this on a numbered ship (Caddy `forward_auth` to ip-gate, fail open). |
| `dln.local` | studio + public on LAN | Named Design Lab North host (Debian Caddy :80 → `:3010`). Backup `http://192.168.0.223:3010`. |
| `builder.dln.local` | studio | Named lab. Change / plan / note. **View site** and **View EPK** launch in a new tab. The lab window iframes Design Lab North and the hub kit; other houses launch rather than sit empty (they block embedding). Page chips still include Press (hub `/epk/{kit}`). `/links` is Dave’s click sheet. No harvest lecture in compose. Push to git and live + Hotfix are named buttons. Send does not deploy. Backup `:3100`. |
| `/suggest/[slug]` | public | Live-host suggestion well. Text only. Lands on the client’s notes. Studio audits and sweeps into a plan. Not a live editor. Plot hosts can serve `/suggest` via Caddy → hub. |
| Cursor / this repo | studio | The actual design interface. Builder `:3100` / `builder.dln.local` talks to house Cursors. This Design Lab North Cursor owns `thekirkswood/DLN`. |
| Offline lab | studio | Spec `memory/offline-lab.md` + `ops/lab.md` + `ops/named-studio.md`. Named LAN hosts. Live VPS unchanged until a numbered ship. |
| `/home/main/VariousTitles` | studio | Sibling house. Public: `https://varioustitles.com` (`plot-titles` on this VPS). DLN email is the login. Billing stays on this book. |

## Auth

- Cookie: `dln_session` httpOnly. Live Domain `.designlabnorth.com`. Named LAN Domain `.dln.local` plus a host-only twin so a rejected Domain still sticks on this host. Host-only on localhost and on the IP backup. `Secure` on HTTPS (from `X-Forwarded-Proto`, not a blanket flag). Path `/`. **90 days**, refreshed on every walk (middleware Set-Cookie + `/api/auth/me`). Do not treat a walk as signed-out if the page already knew they were in. Press kit cookie `dln_epk` is the kit id (30 days), same domain rules. Signed-in studio or tagged client visiting a kit stamps that cookie so they do not type a code. Lab without a cookie bounces through hub `/api/auth/lan-enter` (copy, do not dump `next=builder.dln.local` onto `/account`). Root layout is always dynamic — do not cache a signed-out header. Logout and other server redirects use `DLN_PUBLIC_URL` / forwarded host, never `0.0.0.0:3000`.
- Store: `_meta/accounts/` and `_meta/billing/` on VPS `/srv/dln/data/accounts` and `/srv/dln/data/billing`. Gitignored. Avatars in `_meta/accounts/avatars/`. Seed file `SEED.txt`. **Never rsync accounts onto the VPS.** A hub ship rebuilds the `web` container only — not plot-modyu, not ModYu’s book.
- Studio logins: `ewan@designlabnorth.com` (owner), `dave@designlabnorth.com` (studio). Both have the full desk at **home** (Debian campus). The public host does not carry a copy of the desk.
- Public studio sign-in **talks home**: VPS asks Debian over the house tunnel (`ops/home-tunnel.md`). Home checks the password against the at-home book and issues an Ed25519 ticket. The VPS verifies the ticket with the public key. `/desk` on `designlabnorth.com` is Caddy-proxied to the downstairs book after `GET /api/auth/studio-gate`. Client `/account` stays on the VPS. Remote work and LAN work are the same Debian files; lease still one writer per house.
- Copyable login sheets live in gitignored `_meta/accounts/sheets/` (Dave’s computer only for his; Ewan’s master has both studio pairs, live and local). Never put the passwords in this file.
- **Blanket:** those two logins are studio access on every plot host and subdomain login. Client books on live sites (ModYu patients/clinics, and so on) stay theirs. Hub endpoints: `GET /api/auth/studio`, `POST /api/auth/studio-verify`, `GET /api/auth/studio-gate`. Plots ask the hub; they do not copy passwords.
- ModYu ops: Anne Marie is a **client record** on this book (`annmarie.barlow@modyu.com`, plot `modyu` only) and an **offline puppet** (`puppet: true`). Sign in on campus / localhost to see a client account. Do not mail or regenerate that login. Public `designlabnorth.com` still refuses the puppet. The same email is her ModYu admin on the live host; **separate password**. Keep that live book working across hub ships. The old seed `modyu@designlabnorth.local` is obsolete and absorbed. Rotation at launches / key events is later.
- Client accounts: the email they wrote us is the login. Studio audits the enquiry, then sends a confirmation of account with the password in that mail. An internal `@designlabnorth.local` handle is the exception, not the default. Do not mail puppets.
- Roles: `owner` (all), `studio` (all), `client` (listed `plots[]` only). Board seats (`division`, colour) live on the user record for a plot. Studio/bot board events are `actor: "campus"` with no division colour.
- Various Titles: DLN customers log in with their Design Lab North address. Billing stays on this book. They must be a paying VT customer (a paid `titlesGrant` line). Bank-account link is the next rail. People who only want VT still get a DLN account and are billed here.
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 `/login` if unauth, 302 `/not-yours` if wrong account or plot shut for unpaid (Settings days to pay after due). Studio/owner always 200 when signed in.
- Titles: `GET /api/auth/titles` → session grant for the VT house (`section` \| `full` \| none), plus `studio`. `GET /api/auth/titles-enter` copies a studio session onto varioustitles.com. Clients are sent to the building page.
- Swarm public (`swarmfund.com`): same pattern. `GET /api/auth/swarm` → `{ ok, studio }`. `GET /api/auth/swarm-enter` copies a studio session onto swarmfund.com. `GET /api/auth/swarm-consume` for the one-time code. Public wall is the Swarm Fund mark and “Building.” until Ewan/Dave enter. Clients signed in here still see Building.
- Edge (Caddy) `forward_auth` to that gate before proxying a **gated** plot (Swarm growing copy). ModYu’s host is ungated so its own account book can sign people in. Various Titles at `varioustitles.com` is ungated at the edge — the app shows Building unless a studio session is copied on.

## Desk (studio)

On a lab host the studio book is `/account` (Watch, Clock, Houses, **Assets** as the file hub, **EPKs** as press kits). `/desk` is the same book, used as the live tunnel target so the public host is not a second writer. Client `/account` on the VPS stays theirs.

Pick a person from Clients — that is **our dossier**, not their account. Rooms stay on the desk. Serving is who we are charging. Pay: tap the same Design / Strategy / Build list as Settings to populate an invoice, Other for a Reason and Charge, **Ping payment** sends them to the online system (they enter their details there). Save draft still exists. Compose on the person’s Billing tab is the same list, not a second invention. Defaults (amounts, days to pay, Adobe kit, online rail, spare bank) live in Settings.

**Current builds** at the top of Book: named local hosts (`modyu.dln.local` and so on). Live URLs stay for the hosted copy. Greenhouse / Strategy **Enter** on the public hub still enters the live host.

## Live host, notes, plan, staging

The service they buy after an initial sit-down and an initial build is a **live host**: a growing copy on our subdomain. They leave **suggestions** in a text box on the live host (ModYu footer, and `/suggest` on the plot host). That is not a live editor and not the offline lab comment well. Studio reads the notes on the person, sweeps them into **one plan**, and runs it **offline**. Nothing is pushed live until that bigger update is happy. Shipped plans carry **patch notes** (their notes, rewritten, plus what we added). Account notes still exist for people who have a hub login.

Do not live-edit hosted plots on every save. Offline staging is the point.

**Offline lab:** Design Lab North on `:3010` / `dln.local` is the public site. The lab is Builder on `:3100` / `builder.dln.local`. Units are their own folders. On this GPU PC a unit sleeps at zero occupancy; on the downstairs host the ports **sit**. Send writes the queue and does not deploy. Push to git and live / Hotfix are named buttons (`ops/ship-live.sh`). Builder sniff runs in the Builder Cursor. `/admin` and `/lab` page routes are gone. View site / View EPK launch the house and the hub kit. Harvest from house `public/assets` folders (`ops/press-folders.md`). Which Cursor owns which queue: `memory/cross-house-comms.md`. Which GPU seat and how two Cursors share a house: `memory/compass.md`, `ops/house-lease.md`. **Debian holds the files and hosts the sites.** Studio houses on the NVMe (`/home/main`). Client houses on the 1TB (`/srv/clients`, symlink at `/home/main/ModYu`). GPU PCs keep working copies so Cursor is fast, then push (GitHub sense). Public IONOS stays the internet host. Audit: `memory/audit-campus.md`. Spec: `memory/offline-lab.md`. How to run: `ops/lab.md`, `ops/named-studio.md`. Do not rebase **live** plots onto hub paths.

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
| Plots | One compose service per **hosted** plot. ModYu at `modyu.designlabnorth.com`. Paul Fosbury Portraits at `paulfosbury.designlabnorth.com` and `paulfosburyportraits.com` (`plot-pfp`). Swarm growing copy at `swarmfund.designlabnorth.com`. Various Titles at `varioustitles.com` (`plot-titles`). |
| Local | Design Lab North on `:3010` / `dln.local` (`ops/campus.service` until Debian Caddy). Pitch sibling on `:3011` is **stopped**. Units are their own folders. On this GPU PC a unit sleeps at zero occupancy; on the downstairs host the ports **sit**. Send writes the queue and does not deploy. Builder sniff in the Builder Cursor. `/admin` and `/lab` page routes are gone. Which Cursor owns which queue: `memory/cross-house-comms.md`. Which GPU seat and how two Cursors share a house: `memory/compass.md`, `ops/house-lease.md`. **Debian holds the files and hosts the sites.** Named LAN: `ops/named-studio.md`. Public IONOS stays the internet host. Do not rebase **live** plots onto hub paths. |
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
_meta/assets/           studio plate index (not git; live volume)
_meta/epk/              press kit hashes, seed codes, content/{kit}.json (not git; live volume)
Site/public/press/      harvested stills + uploads (not git; live volume, never --delete on ship)
deploy/                 Caddy, compose, Dockerfiles, VPS bootstrap
ops/                    host facts, no secrets (press-folders.md = standing asset tree)
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
  plots/pfp      Paul Fosbury Portraits source bind (`plot-pfp`)
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
| Client | ModYu and Paul Fosbury Portraits now. More to come. |
| Desk | Owner + studio: pick a person; current builds; bring on from an enquiry |
| Live host | Growing copy on our subdomain. Notes in, we come in, they watch. |
| Plan | Swept notes. Run offline. Upload when happy. Patch notes on ship. |
| Various Titles | Resource centre. A life’s work, for people to learn. Sibling house, hosted at varioustitles.com on this VPS. DLN email is the login. Billed on this book. |
| Campus | Hub on `:3010`. On this PC until Debian downstairs holds files+ports. Design Lab North. |
| Unit | One house folder + its Cursor + its app while occupied (ModYu, PFP, Various Titles, Swarm, new stations). |
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
