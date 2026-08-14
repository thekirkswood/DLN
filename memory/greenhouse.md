# Greenhouse

Registry prose. Machine source: `greenhouse/plots.json`. Keep them in sync.

DLN is a hub of multiple sites. Client plots can be entered when hosted. Studio plots may be mark + voice only until hosted. Homepage rows are mark + name + growing (no description). Descriptions live on `/greenhouse` and `/greenhouse/[slug]`.

## Client plots

### ModYu (`modyu`)

- Party: client
- Host (wanted): `modyu.designlabnorth.com` — Livedns A not in yet (NXDOMAIN)
- Enter now: `http://designlabnorth.com/p/modyu` (interim dock on port 80, same gate + cookie)
- Kind: rebuild (they have a live site; we are building the next one)
- Status: growing
- Voice: Design Lab North are rebuilding ModYu, the market-leading hair and scalp care brand — for people looking after their scalp before, during, and after transplant.
- Marks: `Site/public/plots/modyu.svg` (paper) + `modyu-white.svg` (ink)
- Source: GitHub `thekirkswood/modyu` · VPS `/srv/dln/plots/modyu` · Docker plot `plot-modyu`
- Access: DLN client user bound to `modyu`. Studio/owner always.

## Studio plots

### Swarm Fund (`swarm`)

- Party: studio. Ours. Hosted on this VPS.
- Enter now: `http://designlabnorth.com/p/swarm` (interim dock, gate `plot=swarm`). Vite prefix `/p/swarm/` — do not use hub `/assets` (that is ModYu).
- Host (wanted): `swarm.designlabnorth.com` — add Livedns A after empty-base rebuild.
- Kind: new. Status: growing.
- Voice: Design Lab North are building Swarm Fund. We are excited to work with this hive brand — people finding work they believe in, and backing it together.
- Mark: `Site/public/plots/swarm.svg` (official hive, amber).
- Source: local `/home/main/SwarmFund` · VPS `/srv/dln/plots/swarm` · Docker `plot-swarm` · sqlite `/srv/dln/data/swarm`. Ewan handles git to the existing Swarm repo. Old Swarm VPS to be retired.

### Choozlist (`choozlist`)

- Party: studio. Ours. Own server — not a DLN plot host until Ewan uploads the repo. Do not say that on the public wall.
- Public brand: all-in-one life registry. Creates, browses, and documents findings, curated to you and those around you.
- Internals (not public copy): agentic AI-driven search app.
- Kind: new. Status: growing. Homepage badge: `growing - beta test`. Never label it resting.
- Story extra: Open to beta testers — contact `create@wishwell.uk`.
- Voice: Design Lab North are building Choozlist. An all-in-one life registry that creates, browses, and documents findings, curated to you and those around you.
- Mark: `Site/public/plots/choozlist.png` (lime heart list).
- Greenhouse story has Sign in. No Enter until a host exists.

## Not listed yet

- Future **client** plots — add a plot file when Ewan names them. Do not invent clients. Do not preview-publish empty cards.

## Plot lifecycle

1. Create GitHub repo for the site (Ewan).
2. Add `greenhouse/plots.json` (`party`: client|studio) + this file + Caddy host + compose service if hosted.
3. Build on PC (Cursor) → push → VPS pull into that plot’s container.
4. Cookie on `.designlabnorth.com` opens the host (or the interim dock).
5. Public still sees the greenhouse story only.
6. Client, after the first month: migrate to their own server + DNS. Plot here can retire or stay as archive (decision later).
7. Swarm hosts here now. Choozlist stays mark + sign-in + beta until the repo is on this VPS.
