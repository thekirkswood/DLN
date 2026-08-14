# Blueprint — Design Lab North

Site-wide map. Update on major change only. Small work goes to DIRECTIONS + CHANGELOG. Open sequenced work lives in `memory/WORKSTREAM.md`.

## Purpose

Design Lab North is a **hub of multiple sites**, not a single brochure. Identities, marketing principles, redesigns, facelifts, new builds. Each site grows in its own Docker plot. Isolation is the point: one plot dying must not take the others.

Two kinds of plot:

| Party | Who | Greenhouse | Hosting |
|---|---|---|---|
| **Client** | Someone we are building for (first: ModYu) | Mark + voice. Sign-in opens their plot. | Subdomain of designlabnorth.com while it grows, then migrate. |
| **Studio** | Ours (Swarm Fund, Choozlist) | Mark + voice. Sign-in on the story. Enter when hosted. | Swarm: hosted here (`plot-swarm`). Choozlist: own server; never a DLN plot host until Ewan says otherwise. |

We want more **client** plots. Studio listings are allowed because Ewan said so. Do not invent more studio names. Do not put studio live domains on the public wall.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public | Who we are. Quiet. Home rows: logo, name, growing. No descriptions. Practice / Greenhouse on the homepage. No Sign in on the home page. Header has Home only when you are not already there. |
| `/practice` | public | Studio credentials, selected clients, how we work. Dave Kirkwood named. Public offering: **brands** and identities (not “marks”). |
| `/greenhouse` | public | What’s growing. Index with descriptions. DLN voice. Sign out as text if signed in. |
| `/greenhouse/[slug]` | public | Plot story from our side. Sign in if yours — then the plot host. Choozlist: beta contact `create@wishwell.uk`. |
| `/preview/[slug]` | cookie | Redirects to the live plot URL if one exists. |
| `modyu.designlabnorth.com` | cookie | ModYu plot. Unauthed → greenhouse story. |
| `swarmfund.designlabnorth.com` | cookie | Swarm Fund plot. Unauthed → greenhouse story. |
| `daa.designlabnorth.com` | public | Name reserved for a possible client. Redirects to the hub. Not listed in the greenhouse until Ewan says so. |
| `/login` `/logout` | public / session | DLN login. Cookie `dln_session`. Studio addresses `@designlabnorth.com`. Reached from a plot story, not the homepage. |
| `/privacy` `/terms` | public | Small. Real. Footer. |
| Cursor / this repo | studio | The actual design interface. No in-site builder UI. |
| `/privacy` `/terms` | public | Small. Real. Footer. |
| Cursor / this repo | studio | The actual design interface. No in-site builder UI. |

## Auth

- Cookie: `dln_session` httpOnly. Domain `.designlabnorth.com` so apex, www, and plot hosts inherit it. `Secure` on HTTPS.
- Store: `_meta/accounts/` on VPS `/srv/dln/data/accounts`. Gitignored. Seed file `SEED.txt`.
- Studio logins: `ewan@designlabnorth.com` (owner), `dave@designlabnorth.com` (studio). Older `.local` seeds may still work until dropped.
- Roles: `owner` (all plots), `studio` (all plots), `client` (listed `plots[]` only).
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 to `/greenhouse/{slug}` if not.
- Edge (Caddy) `forward_auth` to that gate before proxying a plot.

## Stack

| Layer | Choice |
|---|---|
| Studio site | Next.js 14 App Router, TypeScript, `Site/` (local `:3010`) |
| Edge | Caddy 80/443, Let’s Encrypt. One hostname per hosted plot. |
| Plots | One compose service per **hosted** plot. ModYu: `plot-modyu` at `modyu.designlabnorth.com`. Swarm: `plot-swarm` at `swarmfund.designlabnorth.com`. Plots serve at `/` on their own host. Local ModYu on `:3000` stays at `/`. |
| Local | `npm run dev` in `Site/` (`:3010`). ModYu stays `:3000`. |
| VPS | Ubuntu 26, `/srv/dln`, Docker Engine + compose |
| Source | This PC → GitHub `thekirkswood/DLN` → VPS `git fetch` + `reset --hard origin/main`. Later: home server as the Cursor box. |
| DNS | Livedns (`ns1.livedns.co.uk` — 123-reg / Heart / Fasthosts panel). VPS is IONOS; DNS is not. |

## File map (repo)

```
memory/                 holy LTM + WORKSTREAM
greenhouse/plots.json   plot registry (source of truth)
Site/                   public Next app
_meta/accounts/         users/sessions (not git)
deploy/                 Caddy, compose, Dockerfiles, VPS bootstrap
ops/                    host facts, no secrets
```

## VPS layout

```
/srv/dln/
  repo/          git checkout
  data/accounts/ persistent DLN auth
  data/modyu-accounts/  ModYu app auth (separate)
  data/swarm/     Swarm Fund sqlite
  plots/modyu    ModYu source bind for image builds
  plots/swarm    Swarm Fund source bind for image builds
```

Host: `82.165.5.84` (IONOS). SSH key `~/.ssh/id_ed25519_dln`. Secrets never in git or memory prose.

## Naming

| Term | Meaning |
|---|---|
| Greenhouse | Public view of work in progress |
| Plot | One site (client or studio) — container + host when hosted, mark+voice when listed only |
| Party | `client` or `studio` in `plots.json` |
| Studio | Us. Cursor. This repo. Swarm and Choozlist. |
| Client | ModYu now. More to come. |
| Dock | Retired. Interim hub paths `/p/modyu` and `/p/swarm` redirected to the plot hosts. |
| Migrate | Client plot leaves the greenhouse onto their own server/URL |

Open names (not locked): “upgrade station” for branding-only work. Do not ship a label until Ewan picks it.

## Out of scope (now)

- GitHub Actions deploy
- In-site CMS / designer UI
- Charging / billing UI
- Hosting Choozlist on this VPS (waiting on repo upload)
- Listing DAA in the greenhouse until Ewan names them as a client
- Homepage Sign in (people with a plot use the plot host)
