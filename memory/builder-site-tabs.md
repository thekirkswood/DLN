# Builder — site tabs (quote this)

Paste to the Builder Cursor on `:3100` / `http://builder.dln.local`. This Design Lab North Cursor does not edit Builder source. Builder implements it in `/home/main/Repos/Builder`.

## What to make

The house rail should work like the campus homepage plus-select: one tab strip, one window, the house you pick loads in that window.

Do not invent a second widget. Extend the existing house chips / tab changer.

## Two planes — same UI, forever

| Where the Builder is running | Window + door | Example |
|---|---|---|
| Campus / lab (`dln.local`, LAN IP, localhost) | **Build** — named host or `http://192.168.0.223:{port}` | `http://daa.dln.local` or `http://192.168.0.223:3050` |
| Live peek | **Live** — `liveUrl` from `houses.json` | `https://daa.designlabnorth.com` |

Offline is ports and builds. Online is subdomains. Do not iframe public subdomains while you are on the LAN. That was the broken homepage: it tried `modyu.designlabnorth.com` from the homeserver and the window stayed dead.

Ship rule: branch on lab host. Never hardcode “always subdomain” or “always :3050”. A numbered campus ship must not mix the planes.

## Houses (keep all of them)

Source: `houses.json`. Do not drop a house because it is off or because it is not on the greenhouse wall.

| Slug | Name | Port | Local | Live |
|---|---|---|---|---|
| dln | Design Lab North | 3010 | http://dln.local | https://designlabnorth.com |
| modyu | ModYu | 3000 | http://modyu.dln.local | https://modyu.designlabnorth.com |
| various-titles | Various Titles | 3020 | http://titles.dln.local | https://varioustitles.com |
| swarm | Swarm Fund | 5173 | http://swarm.dln.local | https://swarmfund.com |
| pfp | Paul Fosbury Portraits | 3030 | http://pfp.dln.local | https://paulfosburyportraits.com |
| dks | Dave Kirkwood | 3040 | http://dks.dln.local | https://davekirkwood.com |
| daa | DAA | 3050 | http://daa.dln.local | https://daa.designlabnorth.com |

**DAA is a house.** Mark Barlow’s book is plot `daa`. It is not a greenhouse card. Losing it from the rail is a defect.

Not in this rail: Choozlist, the lab itself as a target (Builder is the lab).

## Call if off

When a campus tab is chosen and the port does not answer:

1. Show the IP:port link anyway.
2. Call the house (start the sitting process).
3. Load the window from the port, not from the public domain.

Campus already has `ops/wake-house.sh` and `GET /api/houses/wake?plot=` on **lab hosts only**. Builder may call that on the hub (`http://dln.local/api/houses/wake?plot=daa`) with the studio cookie, or keep an equivalent start in Builder. Do not add a `/lab` CMS. Do not wake anything from the live VPS.

If the iframe is blocked (X-Frame-Options), the **link** still opens a tab. Blank window + working link is acceptable. Missing house is not.

## How to talk to campus

Builder is another port (`:3100`). Launch the same way the campus plus-select does: set the iframe `src` to the bind URL for that plane. Cookie `dln_session` already copies across `*.dln.local` when Caddy is on. If a house needs the hub session, go through `/api/auth/lan-enter` as Houses already does.

Do not load `https://*.designlabnorth.com` in the Builder window while Dave is on the LAN.

## Do not

- Rewrite house source from Builder for this job. Tabs and wake only.
- List DAA on the greenhouse.
- Drop DAA, DKS, or PFP from `houses.json`.
- Restore campus `/admin` or `/lab/{slug}/admin`.
- Print credentials.
