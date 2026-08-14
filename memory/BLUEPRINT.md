# Blueprint — Design Lab North

Site-wide map. Update on major change only. Small work goes to DIRECTIONS + CHANGELOG.

## Purpose

Public studio + gated greenhouse of client plots. Each growing site is a Docker plot on a subdomain. Isolation is the point: one plot dying must not take the others.

## Surfaces

| Path / host | Who | What |
|---|---|---|
| `designlabnorth.com` `/` | public | Who we are. Quiet. |
| `/practice` | public | Studio credentials, selected clients, how we work. |
| `/greenhouse` | public | What’s growing. Index, not cards. DLN voice. |
| `/greenhouse/[slug]` | public | Plot story from our side. No live-client-site link (that is what we are building against). |
| `/preview/[slug]` | cookie | Local stand-in for the subdomain. |
| `{slug}.designlabnorth.com` | cookie | Live plot container. Unauthed → greenhouse story. |
| `/login` `/logout` | public / session | DLN login. Cookie `dln_session`. |
| `/privacy` `/terms` | public | Small. Real. Footer. |
| Cursor / this repo | studio | The actual design interface. No in-site builder UI. |

## Auth

- Cookie: `dln_session` httpOnly. Prod domain `.designlabnorth.com` so plots inherit it.
- Store: `_meta/accounts/` (`users.json`, `sessions.json`). Gitignored.
- Roles: `owner` (all plots), `studio` (all plots), `client` (listed `plots[]` only).
- Gate: `GET /api/auth/gate?plot={slug}` → 200 if allowed, 302 to `/greenhouse/{slug}` if not.
- Edge (Caddy) `forward_auth` to that gate before proxying a plot.

## Stack

| Layer | Choice |
|---|---|
| Studio site | Next.js 14 App Router, TypeScript, `Site/` (local `:3010`) |
| Edge | Caddy 80/443, wildcard / per-plot hosts |
| Plots | One Docker compose service each under `deploy/plots/` |
| Local | `npm run dev` in `Site/` (path preview). Compose optional for edge parity. |
| VPS | Ubuntu 26, `/srv/dln`, Docker Engine + compose |
| Source | This PC → GitHub `thekirkswood/DLN` → VPS pull. Later: home server as the Cursor box. |

## File map (repo)

```
memory/                 holy LTM
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
  data/accounts/ persistent auth
  plots/         per-plot bind mounts / compose overrides
```

Host: `82.165.5.84` (IONOS). SSH key `~/.ssh/id_ed25519_dln`. Secrets never in git or memory prose.

## Naming

| Term | Meaning |
|---|---|
| Greenhouse | Public view of work in progress |
| Plot | One client (or studio) site in a container + subdomain |
| Studio | Us. Cursor. This repo. |
| Migrate | Plot leaves the greenhouse onto the client’s own server/URL |

Open names (not locked): “upgrade station” for branding-only work. Do not ship a label until Ewan picks it.

## Out of scope (now)

- GitHub Actions deploy
- In-site CMS / designer UI
- Public listing of studio-owned shells
- Charging / billing UI
