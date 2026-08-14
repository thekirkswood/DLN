# Blueprint — Design Lab North

Site-wide map. Update on major change only. Small work goes to DIRECTIONS + CHANGELOG. Open sequenced work lives in `memory/WORKSTREAM.md`.

## Purpose

Design Lab North is a **hub of multiple sites**, not a single brochure. Identities, marketing principles, redesigns, facelifts, new builds. Each site grows in its own Docker plot. Isolation is the point: one plot dying must not take the others.

Two kinds of plot:

| Party | Who | Greenhouse | Hosting |
|---|---|---|---|
| **Client** | Someone we are building for (first: ModYu) | Mark + voice. Sign-in opens their plot. | Subdomain of designlabnorth.com while it grows, then migrate. |
| **Studio** | Ours (Swarm Fund, Choozlist) | Mark + voice. We want more client plots beside these. | Swarm: will host here when Ewan says. Choozlist: own server forever; never a DLN plot host. |

We want more **client** plots. Studio listings are allowed because Ewan said so. Do not invent more studio names. Do not put studio live domains on the public wall.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public | Who we are. Quiet. |
| `/practice` | public | Studio credentials, selected clients, how we work. |
| `/greenhouse` | public | What’s growing. Index, not cards. DLN voice. |
| `/greenhouse/[slug]` | public | Plot story from our side. No live-client-site link. Studio listings have no enter-plot until hosted. |
| `/preview/[slug]` | cookie | Redirects to the live plot URL if one exists. |
| `{slug}.designlabnorth.com` | cookie | Real plot host (Livedns A / wildcard). Unauthed → greenhouse story. |
| `/p/modyu` | cookie | **Interim ModYu dock** on the hub hostname (port 80). IONOS drops non-80/443. Close when Livedns answers and we rebuild ModYu with empty `BASE_PATH`. |
| `/login` `/logout` | public / session | DLN login. Cookie `dln_session`. |
| `/privacy` `/terms` | public | Small. Real. Footer. |
| Cursor / this repo | studio | The actual design interface. No in-site builder UI. |

## Auth

- Cookie: `dln_session` httpOnly. Domain `.designlabnorth.com` so apex, www, plot hosts, and the interim dock port inherit it.
- Store: `_meta/accounts/` on VPS `/srv/dln/data/accounts`. Gitignored. Seed file `SEED.txt`.
- Roles: `owner` (all plots), `studio` (all plots), `client` (listed `plots[]` only).
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 to `/greenhouse/{slug}` if not.
- Edge (Caddy) `forward_auth` to that gate before proxying a plot.

## Stack

| Layer | Choice |
|---|---|
| Studio site | Next.js 14 App Router, TypeScript, `Site/` (local `:3010`) |
| Edge | Caddy 80/443; wildcard / per-plot hosts after Livedns. Interim hub path `/p/{slug}` + plot `BASE_PATH` (IONOS only admits 22/80/443). |
| Plots | One compose service per **hosted** plot. ModYu: `plot-modyu` from `/srv/dln/plots/modyu`. Greenhouse image may set `BASE_PATH=/p/modyu` so it can live on the hub host. Local ModYu on `:3000` stays at `/`. |
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
  plots/modyu    ModYu source bind for image builds
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
| Dock | Interim path on the hub (`/p/modyu`) so a plot is reachable before its subdomain exists |
| Migrate | Client plot leaves the greenhouse onto their own server/URL |

Open names (not locked): “upgrade station” for branding-only work. Do not ship a label until Ewan picks it.

## Out of scope (now)

- GitHub Actions deploy
- In-site CMS / designer UI
- Charging / billing UI
- Hosting Choozlist on this VPS
- Swarm subdomain until Ewan says the plot is ready to host
