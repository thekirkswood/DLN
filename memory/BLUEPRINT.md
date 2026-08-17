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
| **Studio** | Ours (Swarm Fund, Choozlist, Various Titles) | Public product stories. Enter the **product domain**, not a DLN subdomain. | Swarm: live at swarmfund.com (own server). DLN `plot-swarm` is a growing copy until cutover. Choozlist: own house until Ewan uploads. Various Titles: ours — we host it so a Design Lab North login opens the resources. Not a plot host until the house is built. |

We want more **client** plots. Do not invent studio names or clients. Do not put DAA on the wall until Ewan names them.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public | Small Design Lab North. Three columns (swipe on a phone): Design, Strategy, Build. Each has clickable reasons. Form to tell us who they are. No journey copy. |
| `/design` `/strategy` `/build` | public | The offer, and the same form. Other offers are open — not a funnel. |
| `/practice` | public | About us. Old hub description. Ewan and Dave **50/50**. Selected clients. Form. |
| `/greenhouse` | public | Our products. No named list in the intro. Various Titles first. |
| `/greenhouse/[slug]` | public | Studio product story. Enter the product domain if one exists. |
| `/account` | cookie | Client: profile, sites, notes, shipped patch notes, invoices. Studio/owner: desk — current builds to jump into, waiting enquiries, pick a person (sites, notes, sweep-to-plan, invoice, VT), bring someone on from an enquiry. Unauth → `/login`. |
| `/account/invoices/[id]` | cookie | One invoice. A4 print. Client if it is theirs; studio sees all. |
| `/not-yours` | cookie | Blanket: not yours. Home after 3 seconds. |
| `/preview/[slug]` | cookie | Redirects to the live plot URL if one exists. |
| `modyu.designlabnorth.com` | cookie | ModYu plot. Unauth → login. Wrong account → `/not-yours`. Unpaid due invoice older than seven days → shut for the client. Studio still in. Not on the greenhouse. |
| `swarmfund.designlabnorth.com` | cookie | Growing Swarm plot on this VPS. Public enter is `https://swarmfund.com`. |
| `daa.designlabnorth.com` | public | Reserved. Redirects to the hub. |
| `/login` `/logout` | public / session | Cookie `dln_session`. Header Sign in → `/account`. Studio addresses `@designlabnorth.com`. |
| `/privacy` `/terms` | public | Small. Real. Footer. |
| Cursor / this repo | studio | The actual design interface. No in-site builder UI. |
| `/home/main/VariousTitles` | studio | Sibling house. Own memory. Will be hosted with us. DLN email is the login. Billing stays on this book. |

## Auth

- Cookie: `dln_session` httpOnly. Domain `.designlabnorth.com`. `Secure` on HTTPS. Path `/`. 90 days, refreshed while they walk the site (`/api/auth/me` on each page). Root layout is always dynamic — do not cache a signed-out header.
- Store: `_meta/accounts/` and `_meta/billing/` on VPS `/srv/dln/data/accounts` and `/srv/dln/data/billing`. Gitignored. Avatars in `_meta/accounts/avatars/`. Seed file `SEED.txt`.
- Studio logins: `ewan@designlabnorth.com` (owner), `dave@designlabnorth.com` (studio). Both have the full desk: current builds, onboard, invoices, every plot.
- Client handles: a real email, or an internal `@designlabnorth.local` address. `.local` is not a mailbox — it is the login on this book, and the same login for Various Titles. Personal mailbox is stored separately; onboard generates login + password and sends them there.
- Roles: `owner` (all), `studio` (all), `client` (listed `plots[]` only).
- Various Titles: DLN customers log in with their Design Lab North address. Billing stays on this book. They must be a paying VT customer (a paid `titlesGrant` line). Bank-account link is the next rail. People who only want VT still get a DLN account and are billed here.
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 `/login` if unauth, 302 `/not-yours` if wrong account or plot shut for unpaid (seven days after due). Studio/owner always 200 when signed in.
- Titles: `GET /api/auth/titles` → session grant for the VT house (`section` \| `full` \| none).
- Edge (Caddy) `forward_auth` to that gate before proxying a plot.

## Desk (studio)

Pick a person. Everything for them lives in that panel: their sites (jump in), notes they left, sweep those notes into one plan, invoice, Various Titles. Waiting list is people who wrote in — Bring on uses what they already typed. We generate the login and password; SMTP sends it to their mailbox; the desk always shows the copy once.

**Current builds** at the top of the desk: ModYu, Swarm on our host (`swarmfund.designlabnorth.com`), Swarm public (`swarmfund.com`), and any other hosted plot. Dave opens them from here.

## Live host, notes, plan, staging

The service they buy after an initial sit-down and an initial build is a **live host**: a growing copy on our subdomain. They leave notes (on the DLN account now; later also at the foot of plot pages — studio does not need a comment admin on the subdomain). An agent reads the notes, sweeps them into **one plan**. Ewan edits the plan, marks it ready, runs it **offline**. Nothing is pushed live until that bigger update is happy. Shipped plans carry **patch notes** (their notes, rewritten, plus what we added).

Do not live-edit hosted plots on every save. Offline staging is the point.

## Billing

- Catalogue: `Site/src/data/catalogue.ts`. Ewan sets GBP. Standing figures until he changes them: consultation £125, initial build £250, live host weekly £75. Monthly live host is set when issued. Design and branding lines stay 0 — Dave charges that work himself when it is issued.
- Studio composes invoices **on the person**: presets, manual lines, waive (struck through, £0). Issue. Number `DLN-YYYY-0001`.
- Client sees due/paid. Pay records in the book this pass. Card rail next.
- Recurring lines (weekly/monthly) roll a new invoice when the period ends.
- Unpaid **seven days** after due, if a line is bound to a plot → that plot is shut for the client.
- A4 print view: DLN mark, invoice, date, lines, waived in the cost column, total.
- Various Titles grants (`titlesGrant` on a line) are billed here. A paid grant is what converts a DLN customer into a VT customer. Same email. This book is the bank. Zero-total invoices (all waived) mark paid on issue.

## Stack

| Layer | Choice |
|---|---|
| Studio site | Next.js 14 App Router, TypeScript, `Site/` (local `:3010`) |
| Edge | Caddy. HTTPS live (`Caddyfile.prod`). Plot `/assets` and `/_next/static` skip the gate. Watchdog keeps HTTP up. |
| Plots | One compose service per **hosted** plot. ModYu at `modyu.designlabnorth.com`. Swarm growing copy at `swarmfund.designlabnorth.com`. |
| Local | `npm run dev` in `Site/` (`:3010`). ModYu stays `:3000`. |
| VPS | Ubuntu 26, `/srv/dln`, Docker Engine + compose |
| Source | This PC → GitHub `thekirkswood/DLN` → VPS. Rsync excluding `.git`, `deploy/.env`, accounts, billing. |
| DNS | Livedns (`ns1.livedns.co.uk`). VPS is IONOS; DNS is not. |

## File map (repo)

```
memory/                 holy LTM + WORKSTREAM
greenhouse/plots.json   plot registry (source of truth)
Site/                   public Next app
_meta/accounts/         users/sessions/avatars (not git)
_meta/billing/          invoices + rolls (not git)
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
  data/billing/  invoices
  data/enquiries/ site forms
  data/plans/     notes + build plans
  data/modyu-accounts/  ModYu app auth (separate)
  data/swarm/     Swarm Fund sqlite
  plots/modyu    ModYu source bind for image builds
  plots/swarm    Swarm Fund source bind for image builds
```

Host: `82.165.5.84` (IONOS). SSH key `~/.ssh/id_ed25519_dln`. Secrets never in git or memory prose.

## Naming

| Term | Meaning |
|---|---|
| Stage | Design, Strategy, Build — three offers. Come in at any. |
| Greenhouse | Public view of **our products** |
| Plot | One site (client or studio) — container + host when hosted |
| Party | `client` or `studio` in `plots.json` |
| Studio | Us. Cursor. This repo. Swarm, Choozlist, Various Titles. |
| Client | ModYu now. More to come. |
| Desk | Owner + studio: pick a person; current builds; bring on from an enquiry |
| Live host | Growing copy on our subdomain. Notes in, we come in, they watch. |
| Plan | Swept notes. Run offline. Upload when happy. Patch notes on ship. |
| Various Titles | Resource centre. A life’s work, for people to learn. Sibling house, hosted with us. DLN email is the login. Billed on this book. |
| Migrate | Client plot leaves onto their own server/URL. Same desk, different upload target. |

## Out of scope (now)

- GitHub Actions deploy
- In-site CMS / designer UI
- Card checkout / Stripe (invoice book is live; bank-account link next)
- Hosting Choozlist on this VPS
- Various Titles public site, paywall UI, screenshot blocking (DIRECTION on that house — login sync and billing are on DLN now)
- Comment widgets on plot pages (hub notes are live; agent scrape of plot pages later)
- Auto-deploy from a plan. Offline first. Upload is a decision.
- Listing DAA until Ewan names them as a client
- Inventing a Various Titles logo or domain
