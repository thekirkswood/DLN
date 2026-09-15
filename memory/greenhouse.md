# Greenhouse

Registry prose. Machine source: `greenhouse/plots.json`. Keep them in sync.

The greenhouse is **our products**. Public heading: **Greenhouse projects**. Public stories. Enter the product domain, not a DLN subdomain. Client sites live on the account (`/account`). Header Sign in opens the profile. Wrong account on a gated plot → `/not-yours`, then home after 3 seconds. Unpaid due invoice older than seven days shuts the client plot; studio still walks in.

Hub offers: Design, Strategy, Build — walk in at any. Build includes a live host while the site grows (notes in, we come in). Various Titles is a resource for people to learn; also on Strategy. Listed **first** on the greenhouse.

## Client plots

### ModYu (`modyu`)

- Party: client. `public`: false.
- Host: `modyu.designlabnorth.com`
- Enter: `https://modyu.designlabnorth.com` (self-contained. ModYu login, same credentials as local `:3000`. Not DLN-gated.)
- Kind: rebuild (they have a live site; we are building the next one)
- Status: rebuilding
- Voice: Design Lab North are rebuilding ModYu, the market-leading hair and scalp care brand — for people looking after their scalp before, during, and after transplant.
- Logos: `Site/public/plots/modyu.svg` (paper) + `modyu-white.svg` (ink)
- Source: GitHub `thekirkswood/modyu` · VPS `/srv/dln/plots/modyu` · Docker plot `plot-modyu`
- Offline lab: `/home/main/ModYu` · `modyu.dln.local` (`:3000`) · inbox `_meta/designer-inbox` · desk `builder.dln.local/modyu`. On Debian the live tree is `/srv/clients/ModYu` (symlink at `/home/main/ModYu`).
- Access: DLN client **record** bound to `modyu` for billing and live suggestions. Anne Marie: `annmarie.barlow@modyu.com` — **live client** on designlabnorth.com (plot `modyu`). Same account usable on campus for testing — not locked to localhost. Live ModYu book stays `modyu.designlabnorth.com` (`modyu_session`, other password). Studio/owner always. Client sites stay off the greenhouse.

### Paul Fosbury Portraits (`pfp`)

- Party: client. `public`: false.
- Live: `https://paulfosburyportraits.com` (own domain, ungated). Same plot as the growing copy.
- Host: `paulfosbury.designlabnorth.com`
- Kind: rebuild. Status: rebuilding.
- Voice: Design Lab North are rebuilding Paul Fosbury Portraits.
- Public wall: Design Lab North mark and the word Building. Not his own mark on the parking page.
- Source: GitHub `thekirkswood/PFP` · VPS `/srv/dln/plots/pfp` · Docker plot `plot-pfp`
- Offline lab: `/home/main/PFP` · `pfp.dln.local` (`:3030`) · inbox `_meta/lab-inbox` · desk `builder.dln.local/pfp`.
- Access: DLN client record bound to `pfp`. Client sites stay off the greenhouse.

### Digital Adoption Advisor (`daa`)

- Party: client. `public`: false. **On the book, off the wall.**
- Host: `daa.designlabnorth.com` (live `plot-daa`, ungated). Campus `daa.dln.local` / `:3050`.
- Kind: rebuild. Status: rebuilding.
- Voice: Design Lab North are rebuilding Digital Adoption Advisor.
- Offline lab: `/home/main/DAA` · `daa.dln.local` (`:3050`) · inbox `_meta/lab-inbox` · desk `builder.dln.local/daa`.
- Access: DLN client record bound to `daa`. Mark Barlow. Studio/owner always. Do not list on the greenhouse.

## Studio plots

### Swarm Fund (`swarm`)

- Party: studio. Ours.
- Public enter: `https://swarmfund.com` (own domain). On the public hub, greenhouse Enter goes there. Lab desk: `builder.dln.local/swarm`. Named local: `swarm.dln.local`.
- Growing copy on this VPS: `swarmfund.designlabnorth.com` (gated plot). Host name is `swarmfund`, not `swarm`.
- Public wall on swarmfund.com is **Building** — Swarm Fund logo and the word Building. Only Ewan and Dave walk in (`swarm-enter`). Same idea as Various Titles.
- **Cutover (2026-09-08):** Same `plot-swarm` as Various Titles / PFP on this VPS. Caddy already serves apex HTTP. Ewan may flip Livedns A `@`/`www` for swarmfund.com → `82.165.5.84` so public Swarm is on IONOS with the rest. Leave MX / SPF on Livemail. Fasthosts VPS stays until April 2027 as a public preview box — not live Swarm. `swarmfund.designlabnorth.com` stays the gated growing copy.
- Kind: new. Status: growing.
- Voice: A hive for cultural discovery and collective backing. A person finds work they believe should exist, signals it, and a like-minded hive weighs whether to swarm. Backing follows belief, not a feed and not an ads marketplace. Do not say where it is housed on the public wall.
- Logo: `Site/public/plots/swarm.svg` (official hive, amber).
- Source: local `/home/main/SwarmFund` · VPS `/srv/dln/plots/swarm` · Docker `plot-swarm` · sqlite `/srv/dln/data/swarm`. Ewan handles git.
- Offline lab: `swarm.dln.local` (`:5173`) · inbox `_meta/lab-inbox` · desk `builder.dln.local/swarm`

### Choozlist (`choozlist`)

- Party: studio. Ours. Own server — not a DLN plot host until Ewan uploads the repo. Do not say that on the public wall.
- Public brand: all-in-one life registry. Creates, browses, and documents findings, curated to you and those around you.
- Internals (not public copy): agentic AI-driven search app.
- Kind: new. Status: growing. Homepage badge: `growing - beta test`. Never label it resting.
- Story extra: Open to beta testers — contact `create@wishwell.uk`.
- Voice: The life registry. What you find gets kept: created, browsed, and documented, curated to you and to the people around you. Not another stream to scroll. A place that remembers, for a life that is already underway. It is growing, open to beta testers at create@wishwell.uk. Do not say where it is housed on the public wall.
- Logo: `Site/public/plots/choozlist.png` (lime heart list).
- Public greenhouse story. No Enter until a host exists.

### Various Titles (`various-titles`)

- Party: studio. Ours. Public greenhouse copy is Dave’s Proprietary Engine Room text.
- Sibling house `/home/main/VariousTitles`. Public host `https://varioustitles.com` on this VPS (`plot-titles`). Ungated at the edge. Public wall is Building. Studio (Ewan, Dave) enter on this book’s session (`titles-enter` bounce). GitHub `thekirkswood/vt`. Billing on the DLN book (`titlesGrant`) when it opens.
- Offline lab: `titles.dln.local` (`:3020`) · inbox `_meta/lab-inbox` · desk `builder.dln.local/various-titles`
- Source: VPS `/srv/dln/plots/various-titles`. A records for varioustitles.com point at this VPS.
- Reached through **Strategy** on the hub as well. Consultation can unlock sections; full resource is an upsell. Must be a paying customer (paid grant). Bank link next.
- Kind: brand. Status: growing. Listed first on the greenhouse wall.
- Voice: The Proprietary Engine Room. The anchor of our campus authority. Various Titles will be our premium, paywalled repository of operational design methodology, identity blueprints, and communication frameworks. Corporate teams and external agency peers subscribe to trade in our proprietary tools, while our direct studio clients receive complete, unhindered access — equipping internal teams with the exact blueprints needed to scale independently without forced agency dependency.
- Public greenhouse story. Enter on the public hub: `https://varioustitles.com`. Lab desk: `builder.dln.local/various-titles`. No “not a shop”. No same-login or shared-billing copy on the public wall.
- Logos: `Site/public/plots/various-titles.png` (paper, mute grey VT) + `various-titles-white.png` (ink). Plates from Ewan 2026-08-17. Do not redraw.

### Dave Kirkwood (`dks`)

- Party: studio. `public`: false. Dave’s site. **On the book toggle, not the greenhouse wall.**
- Live: `https://davekirkwood.com`. Campus: `dks.dln.local` (`:3040`).
- Offline lab: `/home/main/DKS` · inbox `_meta/lab-inbox` · desk `builder.dln.local/dks`. No invented mark.

## Not listed on the wall yet

- Future **client** plots — add a plot file when Ewan names them. Do not invent clients. Do not preview-publish empty cards.

## Plot lifecycle

1. Create GitHub repo for the site (Ewan).
2. Add `greenhouse/plots.json` (`party`: client|studio) + this file + Caddy host + compose service if hosted.
3. Build on PC (Cursor) → push → VPS pull into that plot’s container.
4. Cookie on `.designlabnorth.com` opens a gated host. Public greenhouse enter is the product domain when one exists.
5. Public greenhouse is studio products. Client sites live on `/account`.
6. Client, after the first month: migrate to their own server + DNS.
7. Swarm public is swarmfund.com. Choozlist stays story until that house has a public host. Various Titles enter is varioustitles.com. DAA and DKS stay on the account book (`public: false`) — not greenhouse cards.
