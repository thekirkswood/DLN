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

- Public plot copy: Design Lab North **are**. Pleasure is optional, not every caption. Choozlist: the life registry, no “pleasure of”. Swarm: excited to work with this hive brand. ModYu: market-leading hair and scalp. Proper sentences.
- Do not invent plot status. Choozlist is growing. “Resting” was an agent guess from “not hosted here” — wrong. Hosting fact stays off the public wall. Public Choozlist line is the life registry, not the AI stack.

## 2026-08-15 — hub of multiple sites

- DLN is a hub: client plots (ModYu, more wanted) + studio plots (Swarm, Choozlist). Grow each on its own terms. Isolation: one container per hosted plot.
- Interim ModYu dock: `http://designlabnorth.com/p/modyu` behind the same gate (port 80). `:3080` is not reachable from the internet (IONOS). Sequenced work: `memory/WORKSTREAM.md`.

## 2026-08-15 — hub IA, Dave, Swarm on this VPS

- Header is mark + Home + Paper/Ink. Practice, Greenhouse, and Sign in live on the homepage. Logo or Home returns to `/`.
- Homepage plot rows: mark, name, growing underneath. No description, no status column on the right. Descriptions on greenhouse / story.
- Choozlist only: `growing - beta test`. Story: open to beta testers — contact `create@wishwell.uk`.
- Studio logins `@designlabnorth.com`. Dave Kirkwood (`dave@designlabnorth.com`, studio) can enter live plots. Named on `/practice`.
- Swarm Fund hosts on this VPS (`plot-swarm`, `/p/swarm`). Ewan handles Swarm git. Retire the old Swarm VPS when this dock is proven.
- Choozlist: Sign in on the story; no DLN container until the repo is uploaded.

## 2026-08-15 — subdomains, TLS, no homepage Sign in

- Livedns A records: `modyu`, `swarmfund`, `daa` → `82.165.5.84`. One hostname per hosted plot. Edge is `Caddyfile.prod` (HTTPS).
- ModYu: `https://modyu.designlabnorth.com`. Swarm: `https://swarmfund.designlabnorth.com`. DAA reserved, redirects to the hub, not listed.
- Path docks `/p/modyu` and `/p/swarm` retired (redirect to the hosts). Plots serve at `/` on their own host. No hub `/assets` steal.
- Homepage has no Sign in. People with a plot use the plot host; unauth → greenhouse story → Sign in if this is yours. Header Home is hidden when you are already home.
- Public offering: brands and identities, not “marks”.

## 2026-08-15 — overnight: site-down, pictures, HTTP+TLS

- “Site down” was browsers hitting HTTPS while Caddy only listened on 80, plus a forced HTTPS redirect after ACME SERVFAIL. Serve HTTP always. Obtain certs with `auto_https disable_redirects` so HTTP never dies.
- ModYu pictures: `/assets` was behind `forward_auth`, so img requests 302’d to the greenhouse. Static `/assets` and `/_next/static` skip the gate. Hub `/assets*` again goes to `plot-modyu` for leftover `/p/modyu` pages.
- Keep `/p/modyu/ht4-people` working via `handle_path` (strip prefix). Do not redirect that bookmark to the plot homepage.
- DIRECTIONS above that still mention homepage Sign in, `/p/swarm` as the only enter, or TLS as already live are historical. Current: no homepage Sign in; enter on plot hosts; HTTP until certs stick.

## 2026-08-15 — HTTPS without dropping HTTP; ModYu rebuilding

- Obtain certificates with HTTP still serving (`auto_https disable_redirects`). Do not publish host 443 until Caddy has a real cert. A mapped 443 with a failed handshake looks like the site is down.
- ModYu public status is **rebuilding**, not growing. Swarm and Choozlist stay growing. Do not invent status for other plots.
- Plot hosts (`modyu`, `swarmfund`, `daa`) are **A records**, never the domain’s nameservers. Registrar NS must stay `ns1/ns2/ns3.livedns.co.uk`. If they are pointed at the plot hosts, browsers cannot resolve the name unless the VPS answers DNS on 53 **and** IONOS Cloud Panel allows 53/tcp and 53/udp (UFW is not enough).
- Live edge is `Caddyfile.ip` on port 80 only. Do not point `CADDY_FILE` at `Caddyfile.prod` or publish 443 until a real certificate exists. Compose default is `Caddyfile.ip` so a missing `.env` cannot load the localhost Caddyfile.
- Watchdog: `deploy/watchdog.sh` on the VPS every 5 minutes, plus an hourly agent sweep. Keep HTTP 200. Do not map 443 until a real certificate exists. Livedns NS + A records (not nameserver rows) for plot hosts.

## 2026-08-15 — Livedns NS restored; A records are correct

- Subdomains (`modyu`, `swarmfund`, `daa`, `www`, `@`) are **A records** → `82.165.5.84`. That is correct. They must not be the domain’s nameservers.
- Registrar nameservers are Livedns again. A records to the VPS IP are correct. HTTPS is live (Let’s Encrypt). HTTP redirects to HTTPS.

## 2026-08-16 — greenhouse stories behind the matching login

- Homepage rows stay public: mark, name, status. No descriptions.
- Unauth click on a homepage row does nothing.
- Right cookie opens the plot (or the story if there is no host). Wrong cookie → `/not-yours`, then home after 3 seconds. No plot name on that page.
- `/greenhouse` and `/greenhouse/[slug]` are not public. Unauth → home. Gate: unauth → login; wrong account → `/not-yours`.

## 2026-08-17 — account, billing, greenhouse is our products

- Header has Sign in / Account. Login lands on `/account`.
- Greenhouse is studio products only (Swarm, Choozlist). Public stories. Client sites (ModYu) live on the account, not the greenhouse wall.
- Account holds sites, weekly/monthly plans, invoices. Pay records in `_meta/billing` (VPS `/srv/dln/data/billing`). Plan amounts in `Site/src/data/plans.ts` until Ewan locks them. Card/Stripe next.
- Homepage growing list is our products. Clicks open the greenhouse story.

## 2026-08-17 — lab stages, invoice desk, Various Titles

- Public offer is stages in buy order: Design, then Strategy, then Build. You can enter at the stage you need.
- Various Titles resources live inside Strategy (not a fourth home door). Greenhouse still lists Various Titles as a product. No invented logo or domain.
- Practice is 50/50 Ewan and Dave. Both studio logins have the full desk (onboard, invoices, every plot).
- Account splits: clients see profile, picture, sites, invoices. Studio composes from the catalogue, waives, issues, prints A4.
- Catalogue amounts live in `Site/src/data/catalogue.ts`. Hosting weekly £195 / monthly £720 until Ewan changes them. Other GBP he sets.
- Unpaid invoice older than seven days shuts the bound plot for the client. Studio still in.
- Card/Stripe still next. Pay records in the book.
- Swarm greenhouse enter is `https://swarmfund.com`. DLN subdomain stays the growing copy.
- Shape of the work: a named function is built to the depth it implies. Stubs that only prove a path are a defect.
- Various Titles sibling house `/home/main/VariousTitles` — own memory. We host it. DLN email is the login. Billing stays on this book.

## 2026-08-17 — DLN login is the VT login; billing stays here

- `@designlabnorth.local` is an internal handle, not a mailbox. Studio stays `@designlabnorth.com`.
- DLN customers log into Various Titles with that same address. Convert them by issuing a paid `titlesGrant` line on this book. They have to be a paying VT customer. Bank-account link is the next rail, on this book.
- People who only want VT still come through a DLN account and this billing. No separate VT bank.

## 2026-08-17 — home columns, practice copy, enquiries, free entry

- Homepage is a small Design Lab North, then three equal columns (swipe on a phone). Clickable “I have…” reasons as the subheads. No hub essay on home — that copy lives on `/practice` with the portfolio.
- Do not number or funnel Design → Strategy → Build on the public site. They sit together. Come in at any. Offer pages carry equal jumps: beside, not after.
- No “Write to us”. A form: who they are, what they need. Lands on the studio desk. Email if SMTP is set (`DLN_SMTP_HOST`). Studio writes back and onboard themselves.
- Greenhouse: “Our products.” then the list. Various Titles first. Do not name the products in the intro.
- Various Titles public copy: a life’s work, a resource for people to learn. No “not a shop” on the greenhouse.

## 2026-08-17 — desk, session, live host

- Session must survive page to page. Cookie 90 days, path `/`, layout always dynamic, header checks `/api/auth/me` as they walk.
- Studio desk is a person, not a pile of tools. Pick them: sites, notes, plan, invoice. Waiting list → Bring on from what they already typed. We generate login + password and send it to their mailbox.
- Current builds on the desk: jump into ModYu, Swarm on our host, Swarm public, anything else we host. Dave can check without hunting.
- Live host is the product after sit-down and initial build. Notes on the DLN account (overall). Sweep into one plan. Run offline. Upload when happy. Patch notes on ship. No auto-deploy. No comment-admin on the subdomain for studio.
- Catalogue until Ewan changes it: consultation £125, initial build £250, live host weekly £75. Dave’s branding/marketing is charged by Dave on the book. No GBP on the public wall.
- `/build` describes the live host and migrate. Homepage has an “I need a live host…” reason.

## 2026-08-17 — Paper/Ink in the footer

- Paper/Ink cut lives in the footer bar, not the header. Header is mark + Home/Account/Sign in.



