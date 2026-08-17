# Greenhouse

Registry prose. Machine source: `greenhouse/plots.json`. Keep them in sync.

The greenhouse is **our products**. Public stories. Enter the product domain, not a DLN subdomain. Client sites live on the account (`/account`). Header Sign in opens the profile. Wrong account on a gated plot → `/not-yours`, then home after 3 seconds. Unpaid due invoice older than seven days shuts the client plot; studio still walks in.

Hub offers: Design, Strategy, Build — walk in at any. Build includes a live host while the site grows (notes in, we come in). Various Titles is a resource for people to learn; also on Strategy. Listed **first** on the greenhouse.

## Client plots

### ModYu (`modyu`)

- Party: client. `public`: false.
- Host: `modyu.designlabnorth.com`
- Enter: `https://modyu.designlabnorth.com` (gated; unauth → login. Wrong account → `/not-yours`).
- Kind: rebuild (they have a live site; we are building the next one)
- Status: rebuilding
- Voice: Design Lab North are rebuilding ModYu, the market-leading hair and scalp care brand — for people looking after their scalp before, during, and after transplant.
- Logos: `Site/public/plots/modyu.svg` (paper) + `modyu-white.svg` (ink)
- Source: GitHub `thekirkswood/modyu` · VPS `/srv/dln/plots/modyu` · Docker plot `plot-modyu`
- Access: DLN client user bound to `modyu`. Studio/owner always. Site + billing on `/account`, not the greenhouse.

## Studio plots

### Swarm Fund (`swarm`)

- Party: studio. Ours.
- Public enter: `https://swarmfund.com` (own server). Greenhouse click goes there.
- Growing copy on this VPS: `swarmfund.designlabnorth.com` (gated plot). Host name is `swarmfund`, not `swarm`.
- Kind: new. Status: growing.
- Voice: Design Lab North are building Swarm Fund. We are excited to work with this hive brand — people finding work they believe in, and backing it together.
- Logo: `Site/public/plots/swarm.svg` (official hive, amber).
- Source: local `/home/main/SwarmFund` · VPS `/srv/dln/plots/swarm` · Docker `plot-swarm` · sqlite `/srv/dln/data/swarm`. Ewan handles git.

### Choozlist (`choozlist`)

- Party: studio. Ours. Own server — not a DLN plot host until Ewan uploads the repo. Do not say that on the public wall.
- Public brand: all-in-one life registry. Creates, browses, and documents findings, curated to you and those around you.
- Internals (not public copy): agentic AI-driven search app.
- Kind: new. Status: growing. Homepage badge: `growing - beta test`. Never label it resting.
- Story extra: Open to beta testers — contact `create@wishwell.uk`.
- Voice: Design Lab North are building Choozlist. An all-in-one life registry that creates, browses, and documents findings, curated to you and those around you.
- Logo: `Site/public/plots/choozlist.png` (lime heart list).
- Public greenhouse story. No Enter until a host exists.

### Various Titles (`various-titles`)

- Party: studio. Ours. Resource centre. A life’s work, for people to learn.
- Sibling house `/home/main/VariousTitles`. We host it. DLN email is the login. Billing on the DLN book (`titlesGrant`). External visitors still get a DLN account.
- Reached through **Strategy** on the hub as well. Consultation can unlock sections; full resource is an upsell. Must be a paying customer (paid grant). Bank link next.
- Kind: brand. Status: growing. Listed first on the greenhouse wall.
- Voice: Design Lab North are building Various Titles. A resource centre — a life’s work — for people to learn marketing fundamentals and branding.
- Public greenhouse story. No “not a shop”. No Enter until a domain exists.

## Not listed yet

- Future **client** plots — add a plot file when Ewan names them. Do not invent clients. Do not preview-publish empty cards.

## Plot lifecycle

1. Create GitHub repo for the site (Ewan).
2. Add `greenhouse/plots.json` (`party`: client|studio) + this file + Caddy host + compose service if hosted.
3. Build on PC (Cursor) → push → VPS pull into that plot’s container.
4. Cookie on `.designlabnorth.com` opens a gated host. Public greenhouse enter is the product domain when one exists.
5. Public greenhouse is studio products. Client sites live on `/account`.
6. Client, after the first month: migrate to their own server + DNS.
7. Swarm public is swarmfund.com. Choozlist and Various Titles stay story until their houses have a public host. DAA is a reserved hostname only.
