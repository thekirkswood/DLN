# Greenhouse

Registry prose. Machine source: `greenhouse/plots.json`. Keep them in sync.

## Public plots

### ModYu (`modyu`)

- Host: `modyu.designlabnorth.com`
- Kind: rebuild (they have a live site; we are building the next one)
- Status: growing
- Voice: Design Lab North are rebuilding ModYu. We have the pleasure of a hair and scalp brand people already know — the next chapter has to carry the same backbone, with them, not over them.
- Marks: `Site/public/plots/modyu.svg` (paper) + `modyu-white.svg` (ink)
- Source: GitHub `thekirkswood/modyu` · VPS `/srv/dln/plots/modyu` · Docker plot `plot-modyu`
- Access: DLN client user bound to `modyu`. Studio/owner always.

### Swarm Fund (`swarm`)

- Listed only: mark + description. No domain, no container, no enter-plot.
- Will host on this greenhouse later. Do not add a host until Ewan says so.
- Kind: new. Status: growing.
- Voice: Design Lab North are building Swarm Fund. Pleasure of the job: a brand with a hive in it, and enough weight that we are not going to unpack it for the street.
- Mark: `Site/public/plots/swarm.svg` (official hive, amber).

### Choozlist (`choozlist`)

- Listed only: mark + description. No domain, no container on DLN (own host — internal fact, never on the public wall).
- Public brand: all-in-one life registry. Creates, browses, and documents findings, curated to you and those around you.
- Internals (not public copy): agentic AI-driven search app. Do not put that on the greenhouse.
- Kind: new. Status: growing. Never label it resting — Ewan did not say the work is paused.
- Voice: Design Lab North are building Choozlist. We have the pleasure of an all-in-one life registry — it creates, browses, and documents findings, curated to you and those around you.
- Mark: `Site/public/plots/choozlist.png` (lime heart list).

## Not listed yet

- Future outreach clients — add a plot file, do not preview-publish empty cards.

## Plot lifecycle

1. Create GitHub repo for the client site (Ewan).
2. Add `greenhouse/plots.json` entry + this file + Caddy host + compose service.
3. Build on PC (Cursor) → push → VPS pull into that plot’s container.
4. Client cookie on `.designlabnorth.com` opens the subdomain.
5. Public still sees the greenhouse story only.
6. After the first month: migrate container/image to the client’s server + DNS. Plot here can retire or stay as archive (decision later).
7. Studio listings may stay mark-only (Swarm until hosted; Choozlist always).
