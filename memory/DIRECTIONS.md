# Directions (standing)

Small and medium instructions. Date-stamp additions. Promote into BLUEPRINT when they become architecture.

## 2026-08-14 — genesis

- Build local first. GitHub comes from Ewan (access after). Then VPS pull. Automate once the remote exists.
- No in-site UI for designing. Cursor is the desk. Second designer machine will also feed this repo.
- Front site documents who we are. Greenhouse shows what’s cooking.
- Login is DLN-wide. Cookie unlocks the matching plot subdomain. Strangers hitting a plot get the greenhouse story, not the live competitor site, not the unfinished preview.
- Plot copy is from Design Lab North’s perspective, conversational.
- Aesthetics of DLN can wait for the real mark; background (auth, privacy, docker, harden) must be thorough now.
- Ubuntu 26 + Docker plots under the DLN edge. Isolation over one big shared web root.
- Privacy exists because we will hold logins and later more data. Footer, small, proper.
- Treat memory as holy. Log deletes. Do not overwrite working systems.
- Changelog may be illegible to Ewan. Must be enough for agents.
- VPS arrived empty: firewall, updates, docker, ssh keys, fail2ban — before pretty.
- Password was given in chat. Move SSH to keys. Do not store that password in the repo.

## 2026-08-14 — after genesis build

- Local studio site on `:3010` (ModYu keeps `:3000`).
- VPS live on `http://82.165.5.84` (HTTP until DNS). Switch Caddy to `Caddyfile.prod` after A/AAAA + wildcard for `designlabnorth.com`.
- SSH: key `id_ed25519_dln` only. Root password login is off. Rotate the panel password — it was in chat.
- GitHub still pending from Ewan. Local git repo is `main`, no remotes yet.
- Logo/type still not in this workspace. Wordmark only.

## 2026-08-14 — mark + paper/ink

- Plates from Ewan: geometric DLN mark. Use transparent extracts, do not redraw.
- Type: T-Star. Grounds named Paper / Ink. Switch is a 45° PAPER\|INK cut with a chamfered wipe — never sun/moon.
- `/practice` holds selected clients + founding designer credentials (no invented personal name until Ewan sets it).
- GitHub: `https://github.com/thekirkswood/DLN`. PAT was in chat — use once, do not store in repo, rotate.
- DNS A records: `@`, `www`, `*` → `82.165.5.84` (see `ops/dns.md`).

## 2026-08-14 — hub copy + logo grounds + ModYu plot

- DLN is a design hub: identities, marketing principles, redesigns, facelifts, new sites. Home hero mark removed; header mark stays.
- Paper/Ink must be the two plate colours: white+#414141 vs black+#FFFFFF. Toggle applies `data-ground` immediately (React must not pin `data-ground` on `<html>`).
- Greenhouse plots show the client mark. ModYu live container on `modyu.designlabnorth.com`.
- ModYu source → `thekirkswood/modyu` (Ewan: kirkswood/modyu).

## 2026-08-14 — VPS git + live plot

- `/srv/dln/repo` is a git checkout of `thekirkswood/DLN` (fetch + reset to origin/main). Do not rsync over `.git`.
- ModYu plot image is live behind Caddy `forward_auth`. Unauth `Host: modyu.designlabnorth.com` → `/greenhouse/modyu`.
- Cookie domain stays host-only until DNS; then `DLN_COOKIE_DOMAIN=.designlabnorth.com` + `Caddyfile.prod`.

## 2026-08-15 — plot DNS

- Apex + www A records are live. `modyu.designlabnorth.com` is NXDOMAIN until Ewan adds `modyu` or `*` A → `82.165.5.84`. Plot container is up; the name is not.
- VPS `deploy/.env` (gitignored): `DLN_PUBLIC_URL=http://designlabnorth.com`, `DLN_COOKIE_DOMAIN=.designlabnorth.com`. Sign in on the apex, then the plot host inherits the cookie. HTTPS later with `Caddyfile.prod`.

## 2026-08-14 — plates, mail, studio listings

- Paper = grey mark on white. Ink = white mark on `#414141`. Mute PNG must be opaque grey glyphs, not a faint extract.
- Enquiries: `build@designlabnorth.com` (mailbox exists).
- Greenhouse may list studio work as mark + copy only. Swarm: later a plot. Choozlist: never hosted here.
- Password SSH/FTP stays off. Access is SFTP/SSH with `id_ed25519_dln`. Do not store the IONOS root password in memory.

## 2026-08-15 — greenhouse captions

- Public plot copy: Design Lab North **are**. Pleasure said differently each time. Proper sentences. Brand, plainly. No riddles, no product internals, no hosting plan, no slight on a live site or its builders.
- Do not invent plot status. Choozlist is growing. “Resting” was an agent guess from “not hosted here” — wrong. Hosting fact stays off the public wall. Public Choozlist line is the life registry, not the AI stack.
