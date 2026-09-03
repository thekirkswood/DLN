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

- Public plot copy: Design Lab North **are**. Pleasure is optional, not every caption. Choozlist: the life registry, no “pleasure of”. Swarm: excited to work on this hive brand. ModYu: market-leading hair and scalp. Proper sentences.
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

- Homepage is a small Design Lab North, then three equal columns (one full slide, swipe, when they cannot sit locked — from 1040px). Clickable “I have…” reasons as the subheads. No hub essay on home — that copy lives on `/practice` with the portfolio.
- Do not number or funnel Design → Strategy → Build on the public site. They sit together. Come in at any. Offer pages carry equal jumps: beside, not after.
- No “Write to us”. A form: who they are, what they need. Lands on the studio desk. Email if SMTP is set (`DLN_SMTP_HOST`). Studio writes back and onboard themselves.
- Greenhouse: “Our products.” then the list. Various Titles first. Do not name the products in the intro.
- Various Titles public copy: a life’s work, a resource for people to learn. No “not a shop” on the greenhouse.

## 2026-08-17 — desk, session, live host

- Session must survive page to page. Cookie 90 days, path `/`, layout always dynamic, header checks `/api/auth/me` as they walk.
- Redirects (logout, gate) use the public URL, never the container bind `0.0.0.0:3000`.
- Studio desk is a person, not a pile of tools. Pick them: picture, sites, notes, plan, invoice. Waiting list → Bring on from what they already typed. We generate login + password and send it to their mailbox.
- Picture: hover the chamfer — “Upload image here” — click to choose. We read the file bytes, not the WhatsApp filename. Studio can set it on the person as well as their own.
- Current builds on the desk: jump into ModYu, Swarm on our host, Swarm public, anything else we host. Dave can check without hunting.
- Live host is the product after sit-down and initial build. Notes on the DLN account (overall). Sweep into one plan. Run offline. Upload when happy. Patch notes on ship. No auto-deploy. No comment-admin on the subdomain for studio.
- Catalogue until Ewan changes it: consultation £125, initial build £250, live host weekly £75. Dave’s branding/marketing is charged by Dave on the book. No GBP on the public wall.
- `/build` describes the live host and migrate. Homepage has an “I need a live host…” reason.

## 2026-08-17 — Paper/Ink in the footer

- Paper/Ink cut lives in the footer bar, not the header. Header is mark + Home/Account/Sign in.

## 2026-08-17 — practice people

- Dave Kirkwood first on `/practice`, then Ewan Kirkwood. Equal.
- Ewan’s public word is **builder**, not designer. Developments that belong to the business; integrated systems (mapping, delivery, stock); AI models for the operation, social and brand development; and the sites that carry them. No Cursor. No desk. No “actually runs on”.
- Dave’s public copy is Dave Kirkwood Studio. Do not say formerly Walsh Simmons.

## 2026-08-17 — hub type is Blender

- Hub type is [Blender](https://binnenland.ch/typeface/blender#overview) by Binnenland: Book body, Medium kickers, Bold subheads, Strong titles. Bold and Strong are used, not sitting unused. T-Star files stay in `public/fonts/` but are not loaded.

## 2026-08-17 — ModYu host ungated

- `modyu.designlabnorth.com` is a self-contained Docker plot. Do not put DLN `forward_auth` in front of it — that steals `/login` and `/api/auth` so ModYu accounts never sign in. Same credentials as local `:3000`. Swarm stays gated.

## 2026-08-17 — Various Titles on varioustitles.com

- Public host is `varioustitles.com` on this VPS (`plot-titles`). A records point here. Not a designlabnorth.com subdomain. Ungated — own login, copies the DLN session. Greenhouse Enter is that URL.

## 2026-08-17 — VT mark locked

- Ewan dropped VT plates (`VT-logo-01` mute grey, `VT-logo-02` white). Greenhouse uses those files. Do not redraw or recolour.

## 2026-08-17 — VT public copy is its own house

- Public VT (greenhouse voice, Strategy blurb, client `/account`, DLN login note): sell the ideas, not the machinery. Never: same login, shared billing, “further facets as they are written,” or “not a shop.” Desk/studio may still name `titlesGrant`. Onboard mail is the DLN login only.

## 2026-08-17 — VT studio only while building

- Public varioustitles.com is Building. Only owner/studio (Ewan, Dave) enter. Bounce `/api/auth/titles-enter` copies `dln_session` onto that host. Clients signed in here still see Building. Greenhouse Enter stays the product domain.
- Public swarmfund.com is Building the same way. Bounce `/api/auth/swarm-enter` copies `dln_session` onto swarmfund.com. Set `SWARM_PUBLIC_URL=https://swarmfund.com` on the DLN app. Clients still see Building.

## 2026-08-17 — Swarm parking wall

- People who are not Ewan or Dave see the Swarm Fund mark and “Building.” — Various Titles parking, Swarm logo. Studio still enters on this book’s session. Local lock is on (set `BUILDING_LOCK=0` only if we need the hive open without a login).

## 2026-08-17 — studio logins on every plot host

- Ewan and Dave’s Design Lab North accounts are the studio door on every subdomain login. Not the client’s live-site book. Same two logins Dave already has. Gated hosts already honour `dln_session`. Houses with their own login (ModYu) ask the hub (`/api/auth/studio` / `studio-verify`) and treat owner/studio as staff. Patient/clinic/walkthrough logins stay on that house.

## 2026-08-17 — offline lab (central builder)

- Full brief: [`memory/offline-lab.md`](offline-lab.md). **Run that file in this builder.** Do not implement it from the Various Titles house.
- Two always-on local things: the hub on **:3010** (the only port Dave sees) and the house servers on their internal ports, proxied under `/go/{slug}/`.
- `/admin` on 3010 talks to this Design Lab North Cursor. `/lab/modyu/admin` (and `/modyu/admin`) writes ModYu’s designer inbox — that folder’s Cursor. Same idea for every house.
- Comments on the exact local page join that house’s queue. Live VPS stays upload-only. No auto-deploy. No public Cursor.
- VT type is Blender / Blender Strong (Binnenland). Hub type is the same face: Book, Medium, Bold, Strong.
- One port, path click-through, DLN banner, big buttons. Not `.localhost` host names for the user. Live hosts stay isolated.

## 2026-08-17 — lab is the local desk for Ewan and Dave

- Only those two studio logins on this PC. Named on every note (`author` + `authorId`).
- Open a station = new filesystem at `/home/main/{slug}`, then build the site in it. Skip if the folder already exists.
- Dave: one login, `/lab`, click a house, comment or builder. No extra passcodes.

## 2026-08-17 — login sheets; Anne Marie on the .com book

- Copyable login documents live in gitignored `_meta/accounts/sheets/`. Dave’s is for his computer only. Ewan’s has both studio logins, live and local (those two stores are different). Do not put the passwords in memory.
- Anne Marie’s Design Lab North login is `modyu@designlabnorth.com` (client, plot `modyu` only — not the studio desk or lab). The same email is her ModYu admin / test login. **Separate passwords** so that book could later open another space without sharing the admin door. Same pair on live and local for her. Password rotation at launches and similar key events comes later — not built yet.
- Keep `modyu@designlabnorth.local` as the older seed client named ModYu. Do not collide the two.

## 2026-08-18 — lab on this PC’s LAN, not only localhost

- Dave’s studio login already has lab. The door was bound to the hostname `localhost`, so his machine on the LAN (`192.168.x.x:3010`) got the desk and a 404 on `/lab`. Ewan on this PC did not.
- Lab host is loopback, `*.local`, and private LAN addresses. Public `designlabnorth.com` still 404s `/lab`. Same two logins. No extra passcode.

## 2026-08-18 — houses start when opened

- Dave does not start each house by hand. `/lab/{slug}` asks the hub; the hub starts that house in its own environment (folder, port, prefix) and proxies `/go/{slug}/`. Unused houses stay down. Swarm’s API starts beside its web. This PC has the RAM; on-open is isolation, not a shortage.
- Gate login redirects use the hub origin (`DLN_PUBLIC_URL`), never the plot Host. `forward_auth` on `swarmfund.designlabnorth.com` was looping onto `/login` on that host.

## 2026-08-18 — listener per house, inbox in that folder

- Every page that shows a house on this PC starts that house when it loads. Station, builder, greenhouse Enter, Strategy Enter, studio preview. Public host still enters live.
- The bot talks to the house whose page the note came from. DLN hub inbox, ModYu designer inbox, Various Titles `_meta/lab-inbox`, Swarm `_meta/lab-inbox`. Opening `/lab` tries to create those folders if they are missing; a unit disk error must not take the campus down. Each house Cursor watches its own `wake.flag`.

## 2026-08-18 — campus and units; occupancy

- Design Lab North on this PC is the **campus**. `/admin` is the campus building site. Each other house is its own unit (own folder, own Cursor, own app) — like plots on an industrial estate, not rooms in one building.
- A unit **app** runs while occupancy is above zero (someone on that station, builder, or framed page). At zero it sleeps. The unit **inbox** still listens; `wake.flag` is acted on at once by that unit’s Cursor. Do not keep every Next/Vite process up “just in case”.
- Later: a bigger PC and a remote workstation keep this shape. Campus stays the door. Do not put Cursor on the VPS.

## 2026-08-18 — campus chat is not a unit Cursor

- This Design Lab North chat thinks campus: occupancy, `/lab`, inboxes routing, the hub. It does not stamp another unit’s pending queue as if it were that house.
- Dave’s note on `/lab/modyu/admin` is for the **ModYu** Cursor window. Same message pasted there is received there. The campus desk’s own queue is `/admin`.
- A unit builder must keep the occupancy hold for the whole visit. Do not remount the starter when the queue finishes loading — that cancelled the app start.

## 2026-08-18 — cross-house map (dual post)

- Map: [`memory/cross-house-comms.md`](cross-house-comms.md). Twin lives on ModYu. Campus `/admin` → this Cursor. `/lab/modyu` and ModYu designer inbox → ModYu Cursor. Do not mix queues.
- ModYu Cursor wrote campus inbox note `6ec8202d-5580-4220-ad54-f4cfe8665b3e` so this instance learns the same routing.

## 2026-08-19 — campus audit; Debian as always-on host

- Send on the dock and `/admin` shows the real HTTP status. A 200 is “queued”. While studio is signed in, campus sniff takes the queue; a unit note waits for that unit’s Cursor sniffer.
- Unit frames: if the port is up but `/go/{slug}` is 404, stop that process and start with `BASE_PATH` / `VITE_BASE`. Occupancy kills are logged. Proxy rewrites `/_next` and Vite `/@` roots.
- This PC keeps campus alive with `ops/campus.service` and `ops/never-sleep.sh` until Debian downstairs is the host.
- Home VPS is that Debian box (ethernet, no GPU). GPU PCs Remote SSH in. Dave has his own Cursor seat on the same tree. Runbooks: `ops/debian-host.md`, `ops/cursor-remote-ssh.md`. Do not wipe Debian until Chooz on it is snapshotted (`ops/backup-chooz-then-wipe.md`).
- Later, not this move: GPU server, Chooz + APES brain, a real note dispatcher (`memory/phase-d-later.md`). The dispatcher honours [`memory/compass.md`](compass.md): laptop is a live seat, not only a spare.

## 2026-08-19 — compass: tower and laptop seats

- Debian is the home host. Ewan’s **tower** (2070) is the primary Cursor seat; the **3060 laptop** is secondary on the same SSH remote.
- The laptop still logs in when the tower is off. When **both** already have responses going, work cycles: tower, laptop, tower, laptop. Head of the queue, and high weight **and** high tokens, stay on the tower. Jobs too big for the laptop wait for the tower. Dave’s seat is his own, not in that cycle.
- Policy lives in [`memory/compass.md`](compass.md). Do not pretend campus Send can open Cursor or read its token meter.

## 2026-08-19 — ChoozBoost look (no migrate)

- Downstairs Debian is `192.168.0.246`, hostname ChoozBoost. Unix `user` can SSH. That account cannot sudo. Palworld is not running. Chooz/Ollama still is. Ethernet unplugged. Bench + site-host verdict: `ops/debian-host.md`. Do not wipe or rsync until Ewan says so.

## 2026-08-19 — replica on the PC, LAN live on Debian

- Do **not** reinstall to get LAN. Plug ethernet downstairs. `user` must be added to `sudo` on the laptop screen (`usermod -aG sudo user`). Reinstall only if root/sudo is unreachable.

## 2026-08-19 — files on the downstairs disk; Cursor on GPU PCs

- Ewan’s shape: websites and filesystems live on the downstairs laptop HDD (another 1TB can join). That box hosts **all the site ports** and sits. This PC and the 3060 are Cursor working copies so editing is fast and the tower is not the host. Push/pull like GitHub. Disks back each other up through that push.
- Two Cursors must not write the same house at once. Cursor has no shared-doc merge. Use house split + [`ops/house-lease.md`](../ops/house-lease.md) + git pull/push. The 3060 can run closed as a second instance on Ewan’s account.
- Occupancy-sleep stays for the 2070. On Debian the units stay up.

## 2026-08-19 — houses on ChoozBoost

- Files and pinned ports are on downstairs Debian. Bookmark `http://192.168.0.223:3010`. Working copies stay on this PC. 3060 Windows: install OpenSSH if this Cursor should reach it (`ops/windows-3060.md`).
- Recheck: campus on `.223:3010` still 200. 3060 still not visible from this Cursor (no OpenSSH / RDP). Reserve `.223` on the router when you can.

## 2026-08-19 — client houses on the 1TB

- Downstairs 1TB (old unmounted Ubuntu) is wiped and mounted at `/srv/clients`. Studio houses stay on the NVMe (`/home/main`). Client houses on the HDD — ModYu now (`/home/main/ModYu` is a symlink). New client stations follow that split when `/srv/clients` exists.

## 2026-08-19 — sniffer while logged in

- Campus sniff is on while Ewan or Dave is signed in on the lab host. Login starts it. The window pings every few minutes. Logout (or ten minutes without a ping) rests it unless a job is still working. Logged out, the site only shows.
- LAN campus is **http://192.168.0.223:3010** (Mac, phones, typing the IP in a browser). This PC’s Cursor sniffs that inbox. `localhost:3010` on the tower is local-only and is not on the LAN.
- ModYu keeps its waiting console. Various Titles and Swarm do the same in their own Cursor chats (`ops/sniff-inbox.sh`). Load that instance, leave it until you log off that instance, or until processing finishes.

## 2026-08-19 — 3060 Cursor vs OpenSSH; DHCP bind

- On the 3060, install Cursor and Remote-SSH **to Debian** (`user@192.168.0.223`). That does not need Windows OpenSSH Server. OpenSSH Server is only if the tower must log into Windows (`ops/windows-3060.md`).
- DHCP reservation for `.223` is optional while ChoozBoost already holds that lease. If add-reservation fails, bind the existing client; do not fight the form.

## 2026-08-19 — chrome buttons rest / hover / click

- Rest: white face, grey border, ink type. Hover wash (`#e8e8e8`) like Choose files. Click: black face, white type. After click, back to the white button. Chrome buttons are **right-angled** (no chamfer). Same for Send, kinds, desk, file picker. Not the large lab doors.

## 2026-08-19 — pull the host onto this disk

- Debian is the centre. After a push (or after the Mac `/admin` queue moves), pull: `ops/pull-from-debian.sh`. Merge inboxes **by id** — do not rsync `messages.json` over a localhost send. localhost `/admin` writes this disk and `ops/push-lab-inbox.sh` copies it downstairs. Sniff watches Debian **and** the local wake flag.

## 2026-08-19 — seven background dots

- Footer Paper/Ink cut is seven small circles with a fine border: white `#ffffff`, charcoal `#353c44`, grey `#e5e5e5`, mint `#e9f5eb`, mist `#eaedee`, cream `#f9f8eb`, blush `#f8f2f6`. They set the site background. Dark charcoal still uses the white plate.

## 2026-08-19 — headlines 30% smaller; Method page

- Public headline type is 30% smaller (home offer titles, page titles). `/method` is the institute copy. Filter and Pipeline headings are large. List titles have no parenthetical gloss. The scale paragraph does not include the “volume of inputs / uncompromising” line.

## 2026-08-19 — ground dots also vary Binnenland type

- Each footer colour also switches the typeface, cycling the Binnenland catalogue at random (Blender, T-Star, T-Star TW, Catalog, Catalog Mono, Formale Grotesque, FRAC, Korpus, Korpus Grotesk, Lexik, Regular, Relevant, Micronova). Default remains Blender. The face name sits beside the dots. Studio lock is still Blender; this is the proof that the work is not only a font or a colour.

## 2026-08-19 — Method: Various Titles heading

- On `/method`, Various Titles is a larger subhead so it does not sit in the Diagnostic Loop body.

## 2026-08-19 — campus without a unit inbox

- `/lab` must render if a unit inbox cannot be created (disk EIO). The site does not depend on Cursor being open. Notes to that house wait until the disk writes.

## 2026-08-19 — invoice amounts and bank pay

- Catalogue option amounts are editable on the studio desk. Standing GBP live in `_meta/billing/prices.json`. Compose still lets you change a line’s amount before issue.
- Pay is bank transfer on the invoice. Studio sets the account on the desk. Client marks sent; studio records paid when it lands. Unpaid seven days still shuts a bound plot. Card/Stripe stays later.

## 2026-08-19 — privacy and terms are real notices

- `/privacy` and `/terms` name who we are, the account, the session cookie, enquiries, invoices, live hosts, rights, and English law. Company number sits there once it is filed. No invented address.


## 2026-08-19 — campus sniff must be running in this Cursor

- Send writes the inbox and `wake.flag`. That does not wake the chat by itself. `ops/sniff-inbox.sh` has to be running in this campus Cursor. A restart must still fire if anything is `pending` — do not swallow the first wake.
- Pushing stamps downstairs must not overwrite Debian’s `wake.flag`. That flag is the LAN Send. Overwriting it wakes the chat a second time with an empty queue.

## 2026-08-19 — type is Rigid Square from Adobe Fonts

- We do not own Binnenland (Blender, T-Star, the catalogue). Those files are off the hub. Face is [Rigid Square](https://fonts.adobe.com/fonts/rigid-square) — octagonal, 45° cuts, closest Adobe Fonts match. Dave’s Adobe Fonts **web project** is the licence: add Regular, Italic, Semi Bold, Bold, Extra Bold; add designlabnorth.com and the campus hosts; put the kit id in `NEXT_PUBLIC_ADOBE_FONTS_KIT`. Do not self-host the files. Footer dots change colour only.

## 2026-08-19 — Method in the header

- The main menu carries Method (`/method`), Practice (`/practice`), and Greenhouse (`/greenhouse`), next to Home. Each hides on its own page. Footer links stay. Menu type is initial caps, not all caps.

## 2026-08-19 — home three columns are Dave’s section copy

- Home Design / Strategy / Build columns carry Dave’s institute paragraphs (UK spelling). Three columns stay. The old “I have…” reason list is no longer the column body. Home has no Tell us form. Design, Strategy, Build and Practice have no enquire form.

## 2026-08-19 — Aktiv Grotesk; header mark 30% smaller

- Hub type is [Aktiv Grotesk](https://fonts.adobe.com/fonts/aktiv-grotesk/) (Dave). Same Adobe Fonts web project: Regular, Italic, Medium, Bold, Black. CSS `"aktiv-grotesk"`. Kit id still `NEXT_PUBLIC_ADOBE_FONTS_KIT`.
- Header mark is 30% smaller (`min(104px, 27vw)`; 60px on a narrow screen).

## 2026-08-19 — no Tell us form on home

- Home is the three columns and the dots. Practice, Method and Greenhouse live in the header, not in the home body. No public enquire form. Write to build@designlabnorth.com.

## 2026-08-19 — home body 20% smaller, no stage enquire forms

- Home column body is 10% up from the last size (`0.86rem`) with the same leading ratio (`1.32`).
- Enquire form is off home, Design, Strategy, Build and Practice. Footer mail stays.

## 2026-08-19 — Practice and Greenhouse in the header

- Main menu is Home, Method, Practice, Greenhouse (each hidden on its own page), then Sign in / Account. Initial caps, not all caps. Home body no longer carries those links.

## 2026-08-19 — home body 10% larger

- Home column body is `0.86rem` at line-height `1.32` — same size-to-leading ratio as the last set.

## 2026-08-19 — Practice heading

- `/practice` heading is Designing High-Value Brand Ecosystems (Dave).

## 2026-08-19 — no Enquiries on Practice

- Practice has no Enquiries heading and no Tell us form. Public write-in is the footer mailbox.

## 2026-08-19 — Practice body matches home

- Practice body, lede and paragraphs use the home column size: `0.86rem` at line-height `1.32`.

## 2026-08-19 — Greenhouse projects

- `/greenhouse` heading is Greenhouse projects (Dave). Not “Our products.”

## 2026-08-19 — Various Titles greenhouse copy

- Greenhouse Various Titles voice is Dave’s Proprietary Engine Room paragraph (`will be` our premium paywalled repository…). List name stays Various Titles.

## 2026-08-19 — Method body matches home

- Method paragraphs use the home column size: `0.86rem` at line-height `1.32`.

## 2026-08-19 — Dave’s Practice paragraph

- `/practice` Dave copy is his amended paragraph: multi-award-winning designer for branding and marketing, former lecturer, LCC advisor, consultant across the region, public speaker and host, work in publications, on TV and radio. Do not restore “Dave Kirkwood Studio —” as the lead, “nominated”, or “lecturer of branding”.

## 2026-08-19 — Practice lede

- Practice lede is: DLN creates Identities, marketing strategies, brand redesigns and facelifts, websites and design for print.

## 2026-08-19 — no What we do on Practice

- Practice has no What we do section. Lede carries the offering line. Design / Strategy / Build stay on home.

## 2026-08-19 — Practice client list

- Selected clients are three columns, no rules between names, home body size (`0.86rem` / `1.32`). Added Richard Creme, Stan Sulzman, Bernard Oglesby, Paul Fosbury, Motionhouse Dance Co. Do not invent further names.

## 2026-08-19 — home module strip

- Home carries Dave’s seven-module RUUN Framework image (`/home/modules.png`) above the Design / Strategy / Build columns. Not a replacement for the header mark.

## 2026-08-19 — home papers; trial column copy

- The seven modules sit as white paper sheets you swipe between (`/home/modules/01.png`–`07.png`). Not one squeezed strip. No mix-blend. Hover lifts the sheet (no drop shadow).
- Home Design / Strategy / Build body is a trial (Ewan): shorter, what we actually give, same for small and large. Dave’s institute paragraphs are cached as `daveCopy` in `needs.ts` — do not delete.

## 2026-08-19 — middle-ground home columns

- Live column copy sits between Dave’s institute voice and the short trial: Sandbox, blueprint, Greenhouse / 8-Phase kept; what you actually get kept. Each column ends “Come in on Design / Strategy / Build”, plus a line-link under the paragraph. `daveCopy` stays cached.

## 2026-08-19 — journey form; tabbed studio desk

- Design, Strategy and Build carry the Tell us form again so interest lands on the desk. Home still has no form.
- Studio `/account` is Clients, Waiting, or Book, then a person with Profile / Work / Billing. Work files live in `_meta/clients/`. Catalogue includes monthly staging and launch on their domain; amounts still set when composed. Do not overwrite the invoice or onboard APIs.

## 2026-08-19 — campus is the book; Tell us folds; menu wheel

- Live home column copy: fewer em dashes and semicolons. Dave terms kept (high-value brand systems, Sandbox, lectures and lab sessions, strategic blueprint, 8-Phase, Greenhouse). `daveCopy` stays cached.
- On a lab host the studio book sits on `/lab` under the unit doors. `/account` is us (profile and sign out). Public VPS keeps the book on `/account` because `/lab` 404s there.
- Catalogue amounts and the bank rail live in Book → How we bill. Compose and issue stay on the person.
- Tell us is a drop-down. The form is hidden until it is open.
- Selects and fold-out menus use `--menu` / `--menu-ink`: a neighbouring colour from the footer ground wheel (paper → grey, ink → mist, the rest → charcoal).

## 2026-08-19 — book as a desk

- Book is a webapp desk, not a list: UK clock, Due / Rolling / Drafts cards, then builds. Standing amounts and bank details sit in folds. Bank details later. Dates stamp themselves in Europe/London. Weekly and monthly hosts roll without a typed date. Compose on the person uses Design / Strategy / Build chips.

## 2026-08-20 — sittings, live calendars, receipts

- Dave’s calendar is Design and Strategy. Ewan’s is Build, unless studio holds the other diary. Pay for the sitting, then pick a slot. No GBP on the public calendar.
- Hosting rolls try to collect online when that rail is live. Card provider later, no secrets in git. Receipts write when a payment clears and download from the account.
- Studio set availability live on the Book calendars: In/Away, weekday chips, from/to, click a time or a day. Hold a slot is a second mode. Book plates lift (offset chamfer, no shadows).
- Public Design / Strategy / Build have no calendar. Diary APIs and the Book grid stay so we book and see what is on.
- LAN campus on Debian is production Next (`next start`), not `next dev`. Watch probes `/api/health`. Do not bounce a dead tab — the overnight overlay was compile-on-rsync.
- Tell us contact is one line: I’m name, email, phone together. Not stacked Name / Email / Phone. Same fields, same API.

## 2026-08-20 — Settings dump; Charge default

- Studio desk has a Settings tab. Dump options there: default charge, days to pay, Adobe Fonts kit, then charging, online pay, bank.
- Charging is Design / Strategy / Build in three columns on a desk, swipe on a phone. The box is Charge £, or Charge default. Empty is the Settings default, not “set when issued”.
- Book keeps calendars, due, rolling, drafts, builds. Compose still lives on the person.

## 2026-08-20 — Book owns pay; Onboarding; calendar this-week

- Payment (standing amounts, online pay, bank) is a **Pay** tab on the desk, not Settings. Settings only holds defaults that feed other pages: Charge default, days to pay, Adobe kit. Do not invent extra settings.
- Calendar on Book collapses to this week. Full calendars when opened.
- Waiting is **Onboarding**: each form fill is a saved card (Design / Strategy / Build). Verify details, make the login, make a folder on disk. Cursor is opened by a human.
- Other in each charging column is a unique named charge for the situation.
- `modyu@designlabnorth.local` is obsolete. Anne Marie is `modyu@designlabnorth.com` only. Absorb the seed into that login; do not keep both.
- Swarm Fund and Choozlist greenhouse copy match Various Titles for depth. Do not make them generic or similar to each other.
- Ewan on Practice: last line is “The sites are built here, and they are built well.” Not a sentence that begins with And.

## 2026-08-20 — Anne Marie live-only; suggestion well; per-entry charge; papers overflow

- Anne Marie never uses campus, localhost, or the public hub. Keep a client **record** for billing and suggestions. `hubLogin: false` on `modyu@designlabnorth.com`. Her login is the live ModYu book.
- Live host comment is a **text box**. Collect, audit, sweep to a plan, run ourselves. Not a live editor like the offline lab.
- No overall Charge default. Settings has the same catalogue list, each box its own saved amount. Pay has that list plus Other: Reason and Charge.
- Homepage papers scroll only when the strip overflows. Desktop drag and wheel count. If they fit, they sit.

## 2026-08-20 — greenhouse product copy

- Swarm and Choozlist greenhouse stories do not open with “Design Lab North are building…”. They talk about the product.
- Do not broadcast where a house lives on the public wall (no “public house is…”, “growing copy”, “on its own house”). Hosting stays in studio memory.

## 2026-08-20 — studio desk: serving, rooms, campus header

- Opening a client is our dossier, not their account. Desk rooms stay. Close / browser back leaves them.
- Pay requires a client to serve. Serving survives switching Clients / Pay / Book.
- Accounts rooms are chamfered plates with a hint, not a tutorial underline tab row.

## 2026-08-20 — live nav vs campus circle

- Live site top bar stays public: Home, Method, Practice, Greenhouse, Sign in. Do not put Lab / Builder / Campus in that row.
- Signed in: Account is a **circle** ready for an avatar. Everything else hangs under it. Studio: Campus is the only admin item in that menu (Builder is a door on campus). Campus header is mark + circle; Live site is under the circle so they can leave without mixing the two bars.
- Phone footer: name, then links, then ground dots on their own rows. Do not let the dots overlap the legal links.

## 2026-08-20 — pay: select lines, ping online

- Do not overwrite a working charge list to add a second compose UI. Pay uses the Settings list look; tapping a line populates the invoice.
- Defaults stay in Settings. Other on Pay is Reason + Charge for this invoice.
- Ping payment — they enter details in the online system. No manual invoice section on Pay. Bank rail remains in Settings as spare. Draft / issue APIs stay.
- Charge rows keep the Settings Charge £ plate. Tap still fills the invoice. Do not let the 20px desk-button chrome restyle `.charge-item`. Screenshot Pay beside Settings when this UI moves.

## 2026-08-24 — Anne Marie real mailbox (live client)

- Login email is `annmarie.barlow@modyu.com` on both DLN (live client) and ModYu staff. Former `modyu@designlabnorth.com` absorbed on seed. Passwords unchanged / separate per door.
- She is **not** a campus-only puppet. Public `designlabnorth.com` must accept her client login. Studio may use the same account on localhost for testing — same functional book, no lock.
- Cleared `puppet` / `hubLogin:false` on her record. Seed now refuses to re-puppet her mailbox.

## 2026-08-20 — (superseded) Anne Marie is an offline puppet

- Earlier “credential snow / puppet” edit locked public hub login. That was wrong for a paying client. See 2026-08-24 above.
## 2026-08-20 — numbered site iterations

- Every GitHub upload of a site is a new integer. DLN: `memory/ITERATION`, log `memory/iterations.jsonl`, git tag `dln-{n}`. Other houses use `{slug}-{n}` in their own repo. So a version can be seen, logged, and rolled back. Do not ship unnumbered. First DLN number is **1**.

## 2026-08-20 — method: filter and pipeline as diagrams

- `/method` stays Dave’s facts (three values, four rooms, Various Titles). Direct, with enough pitch to sell. Do not put GBP on the public page.
- Quality filter and campus pipeline each carry their own chamfered graphic. Idle: the filter token lights each sieve as it drops; the pipeline arrow walks 1→4 to the right-hand end of Diagnostic Loop, turns 90° down onto a tight lower path, returns left, turns 90° up under Prep and Plan, then 90° onto the top path again. Hover still takes over on a fine pointer. Play is slow enough to read.
- Phone and coarse pointer: own formation. Rooms stack, a token runs the left rail, compressed copy sits under each tile and lights with it. Same idle cycle. Tap holds a room briefly then the cycle continues. Do not rely on hover. Desktop facets stay as they are.
- Method animation plates (filter screens, pipeline rooms) are square corners. Chamfer stays on the rest of the site.
- “Peers, not turf”: underline **not**. Same size as the rest of the heading.
- Various Titles close uses the locked VT plates (`various-titles.png` / `-white.png`). Do not redraw.

## 2026-08-20 — localhost ModYu frame; occupancy on disk

- Occupancy is a file (`_meta/lab-houses/leases.json`), not only a Map in the campus Next process. `next dev` reloads used to forget who was in the station and kill ModYu while the iframe was still loading — that shows as Next’s “client-side exception”.
- A leftover idle-sweep from an old compile must not kill a live unit. Sweep generation is in `_meta/lab-houses/sweep-gen`.
- Framed unit JS that calls `/api/…` must hit `/go/{slug}/api/…`, not campus `/api/auth/me`. Proxy rewrite includes `/api/` with `/_next/` and Vite roots.

## 2026-08-21 — Work page (Dave, campus desk)

- Public `/work` in the main menu (Home, Method, Practice, Work, Greenhouse). Dave’s gif full width. Page ground is the gif’s dark grey, not Paper. Footer off this page so the plate can sit.
- After campus HTML on this Cursor disk, push downstairs (`ops/push-campus-downstairs.sh`). Inbox push is not the site. One campus sniff (`ops/sniff-inbox.sh`); do not arm a second sleeper beside it.

## 2026-08-21 — page identifier on campus Send

- Space-specific notes use the same campus input, with a page identifier (Clients, Book, Pay, …) — the same `page` field a client suggestion carries. `/admin` Send was hard-coded `/admin`, so room notes never tagged. Room wells on `/lab` echo the live-host box. One queue: campus inbox. Do not invent a second input.

## 2026-08-21 — home Design list (Dave)

- Home column under **Design** is Dave’s list: Logos, Brand Identity Systems, UI, Design for Print, Packaging. Not the trial paragraph. `/design` page unchanged. `daveCopy` still cached.
- Home left-to-right is Strategy, Design, Websites. The Build offer page and book still say Build. Home heading for that column is **Websites**.
- Home **Strategy** list: Brand Strategy, Marketing Strategy, Online Strategy, Start-up Strategy, Brand Audits, Over-arching Strategic Consultancy.
- Home **Websites** list: Website Builds, Website Modelling, New sites, Rebuilds, Facelifts, Live hosts. Dave’s two stay; the rest is the offer for people not yet online and people who already are. `/build` still says Build. Trial copy stays cached.

## 2026-08-21 — Methodology

- Page title and kicker are **Methodology**. Path stays `/method`. In the footer as Methodology. Not in the main menu.

## 2026-08-21 — home Contact links (Dave)

- Home column links are **Contact our consultants**, **Contact Design**, **Contact the web team**.

## 2026-08-21 — Dave signed out on campus Send

- LAN sessions live on Debian. `push-campus-downstairs.sh` must not rsync `_meta/accounts/` (that file is the cookie book). A full house sync must not overwrite `sessions.json`.
- The notes tool must not dump `/admin` to `/login` on a poll 401 — that throws away the draft. Banner + new-tab sign in.

## 2026-08-21 — RUUN papers on Methodology

- The seven home papers move to the top of `/method`. Home is the three columns only.

## 2026-08-21 — Practice heading (Dave)

- `/practice` heading is **High-Value Brand Ecosystems**. Under it, mid grey, same size: Plan, Design, Build, Maintain.

## 2026-08-21 — home Websites (Dave)

- Home heading for the build column is **Websites**, not Online. The column link is **Contact the web team**. `/build` still says Build.

## 2026-08-21 — home name copy (Dave)

- Top of home, under the Design Lab North kicker: opening line as the page h1 (Black), then the name sentence at the **same size in mid grey** (like Practice’s Plan, Design, Build, Maintain). Then stacked **Design is how we work** / **Lab is how we think** / **North is how we execute** as site h2s with body. In Design, **strategy**, **packaging**, **print and screen** are Bold. Not a three-column row. Then the three offer columns, same width as that text (42rem).
- Home Design / Lab / North subheads: **Design**, **Lab**, **North** stay Bold ink; the rest of each line is Regular mid grey. Body sits close under the subhead.

## 2026-08-21 — Practice story (Dave)

- `/practice` order: heading, story (Our Practice, The Landscape & The Graft, Tested Resilience, Wired to the World), then Dave and Ewan bios (full width: name, role, aside, paragraphs), then **Selected Experience** above the client list.
- Practice line is “in the true Border Riever; Debateable Lands.” (Dave’s spelling).
- Dave and Ewan bios sit as stacked sections with a 1px mid-grey rule before and after each. Dave’s section is his portrait, then the text. Ewan’s is text until a portrait is given.

## 2026-08-21 — live user pages; home is the studio book

- Put the hub **user pages** live (numbered ship). Updates are DLN public pages. Admin / campus does not live on the VPS; it talks home (`ops/home-tunnel.md`).
- Accounts keep working across a ship. **Anne Marie first:** her live ModYu book on `modyu.designlabnorth.com` is untouched. Do not rsync `_meta/accounts`, do not rebuild `plot-modyu`. Public hub still refuses the campus puppet.
- Studio sign-in on the public host authenticates against the **at-home book** (Ed25519 ticket). Remote work and LAN campus are the same Debian files, one writer per house.
- Client logins are the emails written to us. After studio have audited the enquiry, send a confirmation of account — the password is in that mail. Internal `.local` handles are the exception.

## 2026-08-22 — Websites Pipeline (Dave)

- `/build` title is **Website Builds and hosting**. Body is Dave’s build copy (e-commerce through ironclad hosting) then Let’s Establish Your Scope and open Contact. Dropdown is Dave’s six technical openers. Home still says Websites. Path stays `/build`.

## 2026-08-22 — Design page matches Strategy (Dave)

- `/design` uses the same shape as `/strategy`: Dave’s Design copy, through-list (assets & logos through master identity guidelines), Let’s Establish Your Scope, open Contact with his six design openers. No OfferJump.

## 2026-08-22 — Strategy page (Dave)

- `/strategy` title is **Consultancy and Strategy**. Body is Dave’s Consultancy & Strategy copy (Consultancy Sessions, audits, feedback, blueprints, workshops) then **Let’s Establish Your Scope** and Contact. No Various Titles section. No Design / Strategy / Build jump. Design, Strategy and Websites Contact are open on the page (no fold, no repeating need line). Strategy Contact dropdown starts with Consultancy Session, then Dave’s eight openers (startup blueprint through none of the above).

## 2026-08-22 — home concertina (Dave)

- Home Design / Lab / North is a three-step concertina. Triangle right to open, up to close. Light grey at rest, mid grey when open and on hover. Each step independent; stays open until closed. Top and bottom keylines only, hairline and very light — no rules between Design, Lab and North. Leading between the three lines is tight, like the title (line-height 1.1, not padded as separate rows). Gap from the title block to the concertina equals the gap from the lower keyline to Strategy / Design / Websites. Strategy / Design / Websites stay open: ink titles, not fold buttons, lists and Contact always shown. Same 42rem measure as North, centred at every width — three columns when they fit, one swipeable column (dots, not slider rules) when they cannot. Dave’s looping gif sits the full width of the screen (same bleed as Work) under all the copy. Any leftover strip above the footer takes the current slide colour; the footer stays Paper.

## 2026-08-22 — footer (Dave)

- Across the site (not Work): Design Lab North and build@designlabnorth.com ranged left. BKND and the ground circles centred — BKND smaller and bold. Methodology, Privacy, Terms as a left-ranged block lined up with the right-hand end of the measure. Initial capitals; email lowercase. No Practice in the footer.

## 2026-08-22 — Methodology label (Dave)

- Campus pipeline first room is **Prep and Plan** (was Lectures & lab). Sandbox stays Sandbox in the graphic; the line under it is **Strategize and Play**. Greenhouse graphic and subheading are **Greenhouse Workstation**. **Diagnostic Loop** stays on the graphic; the line under it is **Test, Roll-Out and Governance**. The arrow under the four rooms loops the full width of the graphic: out to the right-hand end of Diagnostic Loop, 90° down, tight return path, 90° up under Prep and Plan, 90° onto the top path. Intro under The campus pipeline is Dave’s 8-stage framework line. No Peers / not turf pair, and no The same method at every scale. Under that intro: **The 8-Stage Campus Engine** concertina (same fold as home, Dave’s plate). Stage 1–8 titles bold; revealed line medium beneath. Default is closed; each can open. Heading bold. No Various Titles section on Methodology. Under the 4-room pipeline: Consultancy / Design / Websites as three light-grey words (same as home Strategy / Design / Websites). On load only the words show; click one to reveal that left-to-right flow; choosing another word closes the last; a click off the words (or Escape) closes all three back to words only. Eight vertical stage blocks in pairs. Orange markers are outputs (not a fourth brand colour in chrome). Quality filter has a fourth screen: Environmental (zero waste, recycling, respect for the natural world).

## 2026-08-24 — Paul Fosbury Portraits

- Second named client. House `/home/main/PFP`. Plot `pfp`. GitHub `thekirkswood/PFP`.
- Public `paulfosbury.com` and `paulfosburyportraits.com` serve `plot-pfp` ungated. Wall is the Design Lab North mark and Building.
- Workshop `paulfosbury.designlabnorth.com` is gated (`forward_auth` plot=pfp).
- Client account bound to `pfp`. Live login is `email@paulfosbury.com`. Leave Livemail MX alone when flipping A records.
- Livedns NS already ours. Flip A `@`/`www` to `82.165.5.84`. Remove AAAA until this VPS has IPv6.

## 2026-08-24 — social studios (Ewan)

- We do not run social in the house. Organic and paid social is passed to a few studios in Manchester, Lancashire, Cumbria, southern Scotland. We keep identity, strategy, websites, print. No white-label; they keep the client.
- Outreach one-pager lives at `studio/social-pass/` (HTML + PDF). Pasteable mail is `email.txt`. Subject: **Social, passed on**. Hero is three still tiles spelling DLN (one letter each; one frame from each colour pair). No colour bar at the foot. Public word is **design agency**, not hub.
- Public outreach copy: Design Lab North are a **design agency**. Greenhouse architecture may still be a hub of plots in house memory; do not call us a hub on the one-pager or site meta.

## 2026-08-24 — Stripe billing (Ewan)

- Billing is Stripe. Mail invoices and pay links from `design@designlabnorth.com` to the email on the account.
- One-off, weekly, and monthly. Apple Pay and Google Pay on Checkout. Repeat subscriptions via Stripe. Client portal: Pay online + Manage card.
- Meeting: put it on the calendar and put payment in (Book them while serving). After a meeting, compose the work on Pay and Ping payment.
- Paul Fosbury and Anne Marie are already on the book. Do not invent amounts — compose and ping from Pay. Live secret and webhook signing secret are in gitignored host env (never memory, never git).

## 2026-08-25 — studio live login + pay test (Ewan)

- Studio live uses the **house** password (the Local line). The old Live line was the VPS book; live studio talks home. Sheets now match.
- Do not Caddy-proxy campus `/lab` HTML onto the public host. Hub and campus Next both use `/_next/static`; mixing them kills Accounts (dead room buttons, 404 client avatars). Public `/lab` 404s. Campus is the house network.
- Studio live sign-in lands on `/account`. £1 pay-page test is that button on this login — do not put the studio user into the Pay client list.
- Pay Ping still opens Checkout in this window once a **client** is being served.

## 2026-08-25 — machine mail (Ewan)

- Automations (account made, invoice issued, paid) send through SMTP we already have in the app. They do not need a mail server on the VPS.
- Human mailboxes stay Fasthosts/IONOS Livemail (`ewan@`, `dave@`, `build@`, `design@`). Leave MX / SPF / Livemail alone.
- Machine From is `noreply@designlabnorth.com`. Reply-To stays `design@` (bills) or `build@` (onboard / enquiry). Do not self-host IMAP or pick up MX.
- Cheap path: add `noreply@` on the existing Fasthosts package and put SMTP submission (port 587) in gitignored host env. A relay (Amazon SES / Resend) only if that mailbox cannot send.
- `noreply@designlabnorth.com` is on Livemail Mail Basic. SMTP `smtp.livemail.co.uk` 587. Incoming `mail.livemail.co.uk`. Control panel `https://mcp.livemail.co.uk`. Password lives in gitignored host env — never chat, never git.

## 2026-08-25 — campus Mail room (Ewan)

- Campus Accounts has a **Mail** room (does not replace Clients / Onboarding / Book / Pay / Settings). Studio, lab host only. Not Fasthosts webmail, not `/admin`, not public `/account`.
- Three Livemail boxes: `build@` (Ewan), `design@` (Dave), `noreply@` (machines). IMAP `mail.livemail.co.uk` 993. Passwords in the campus `_meta` ops sheet and `Site/.env.local` only. noreply IMAP reuses `DLN_SMTP_PASS` unless `DLN_MAIL_NOREPLY_PASS` is set.
- Empty password on a box: “Password not on the host yet.” Do not dump IMAP errors with credentials.
- Machine From stays `noreply@`. Reply-To stays `design@` (bills) or `build@` (onboard). Do not invent a plugin marketplace. Livemail IMAP is the system.
- Later, on a house server with a clean public IP, PTR, and outbound 25: a mailbox stack (IMAP + submission + spam) becomes *possible*. It is still not “put those things in place.” Deliverability, backups, and staying off blocklists are the work. GPU does not make mail. Do not put MX on the same IP as the public sites. Do not start that stack on the current VPS.

## 2026-08-25 — local stage is the workshop; live is a ship or a bugfix (Ewan)

- Build on the **local stage**: this PC `localhost:3010` and the Debian campus on the house LAN. When something is working, numbered hub ship to the VPS. Whatever we discuss after a ship stays on the local stage.
- Jump onto the live VPS **only** to fix a named bug. Fix that bug. Then **stop thinking about the live site**. Do not keep workshopping on production because the last topic was live.
- We do not put build material on the live site as a live update. The dummy **£1 self-pay button** on public `/account` was that mistake: a sample pay-page so someone could see a transaction, treated as if live were the workshop. That test belongs on campus/local. Real client Pay online stays on live invoices.
- Same rhythm as the offline lab and numbered iterations. Now explicit for every agent: campus/local is the workshop; live is a ship, or a named bugfix, then stop.

## 2026-08-25 — login: show password + forgot loop (Ewan)

- On `/login`: **Show password** toggles the field (Hide password when open). Chamfered, Aktiv, Paper/Ink. Not a pill.
- **Forgot password** is a full loop: `/login/forgot` → time-limited hashed token in gitignored `_meta/accounts/resets.json` → mail from noreply@ (Reply-To build@) → `/login/reset` to set a new password → token consumed. Do not print the new password in the mail.
- Same public reply whether the address is on the book. Per-email cooldown. Puppets / hubLogin false / .local: do not mail. If SMTP is unset, say mail did not leave (host fact).
- Account profile has no password field — do not invent a change-password UI. Local workshop; do not ship this to VPS until a numbered iteration.

## 2026-08-25 — campus Pay / Mail / Settings (Ewan)

- Serving only on Clients / Book / Pay. Mail has nothing to do with who we are serving — no serving bar there.
- Open a station (name + folder) lives **only on Onboarding**. Not at the foot of the whole campus page.
- Accounts rooms do not carry page-identifier wells. `/admin` stays the Cursor building site.
- Pay composes for a **client** (not the studio login): category, description they type or pick, amount, cadence (once / weekly / monthly). Ping opens Stripe Checkout and mails. Webhook still marks paid.
- £1 “Open a pay page for this login” is campus/lab `/account` only — not public VPS, not a reason to edit live.
- Settings: thinner Design / Strategy / Build rows. Pay is the place you compose. Do not replace Pay with a Stripe-only invention.
- Local workshop. Do not sync-to-vps. Debian LAN may be rebuilt so Ewan can see it.

## 2026-08-25 — sheets, forgot-password, honest security (Ewan)

- Forgot password is the **client** path. Anne Marie has a real mailbox; she resets there. That makes plaintext **sheets** obsolete for clients like her. Do not delete Ewan/Dave studio sheets without asking — studio still uses them. Sheets are copies for the desk, not the live book.
- `users.json` already stores **scrypt** hashes (`salt:hash`). Do not store plaintext there. Do not invent “encrypt the JSON with a key in the repo” — that is not lock-and-key.
- Honest security **now**, on live/server (free): TLS, httpOnly session cookie, hashed passwords, no passwords in git/memory/chat, gitignored `_meta/accounts`, do not rsync accounts onto the VPS as a habit. Local: hashed passwords + gitignore is enough; do not clone a SIEM or enterprise firewall onto the workshop PC.
- Later paid: a proper database and disk encryption when they have the house server. Not this VPS workshop.
- Livemail SMTP (machine From noreply@): host `smtp.livemail.co.uk`, submission **587** STARTTLS, username the **full address**, password the **mailbox** password from Fasthosts Mailbox password → Change. Not port 25, not the website A record, not the VPS SSH password. If Livemail rejects login, Change that mailbox password and paste onto `DLN_SMTP_PASS` (and `DLN_MAIL_BUILD_PASS` for IMAP/build). MX/SPF stay Livemail.

## 2026-08-25 — two campuses; activate-account; webhook-paid-only (Ewan, afternoon)

- **Live Campus** is `designlabnorth.com/campus` — VPS `web` Next routes, same build as the public hub. Whole **client handling** lives here: Clients + Onboarding + Book + Pay as **one section** (need a selected client; onboarding is a subset). **Settings** for that system. **Mail** is its own page/tab (Livemail IMAP for build@ / design@ / noreply@) — **no Serving** on Mail. Studio logins from sheets (Ewan, Dave). Client data, Stripe, SMTP, invoices, activate-account — all on the **live server**, one book, safer. Do **not** Caddy-proxy Debian `/lab` HTML onto the hub (hub `/_next` ≠ campus `/_next`).
- **Local Campus** is `localhost:3010/lab` and LAN `192.168.0.223:3010/lab`. **Site editor only**: units, Open a station, `/admin` Cursor queue, building public DLN and plot files. Dummy/offline accounts so studio can see what a client will see. Not the live billing book.
- Do not rip LAN Accounts out until live `/campus` exists and is a **numbered ship**. First cuts + LTM now; full move is sequenced WORKSTREAM. Do not add a half `/campus` page to public live. Default: **no VPS ship** unless a named webhook bug.
- `/account` stays the person’s own profile.
- Never dictate a password to a client. After review: create the record, **noreply** mails **Activate your account** (they set their own password). Forgot-password is the same idea (invite vs reset). Anne Marie: public email is her live login; she sets her own password in her space. Paul Fosbury: `email@paulfosbury.com` is the live login; Ping mails invoices there. Sheets stay studio copies, not the client password book.
- Security: live book hashed (scrypt already); TLS; no passwords in git; don’t rsync accounts casually. Real DB encryption later on the house server — not fake JSON encryption.
- Pay: **paid only when Stripe confirms** (webhook `checkout.session.completed` / `payment_intent.succeeded`). Do not mark paid on Ping/Buy click or on the success return URL. Ping from live Campus talks to live Stripe + noreply SMTP.

## 2026-08-25 — admin QoL on live (Ewan)

- While we are still shaping studio login / campus chrome, those **admin quality-of-life** bits may ship to the VPS `web` container (and LAN) in the same turn. Public marketing pages still wait for a numbered ship. Once the admin split looks right, back to local-then-push.
- Show password and Forgot password are on live `/login` (hard-refresh if the old sheet is cached). Live `/campus` is **not** built yet.

- Stripe Checkout is Stripe-hosted. Brand it in Dashboard → Settings → Branding (icon/logo) and Settings → Branding → Checkout (Checkout page). Logo: DLN mark (`Site/public/brand/dln-mute.png` on Paper). Colours: Paper `#ffffff`, Ink `#414141`. Business name Design Lab North. Do not invent a logo. Do not add a permanent £1 button on public `/account`.
- noreply still `smtp.livemail.co.uk:587`, full address as user, mailbox password from Fasthosts Change — **not** the A record. Do not restore Fasthosts automatic DNS (that would point @/www at 88.208.252.9 and take the site off our VPS). If SMTP still rejects, Change password again; don’t break DNS.
- Harmony: do not smash login show/forgot, Mail IMAP APIs, or Pay composer. Do not proxy `/lab` to Debian. Do not leave Debian campus down if you rebuild LAN.

## 2026-08-25 — Dave Kirkwood personal host (Ewan)

- Dave’s personal site `davekirkwood.com` hosts on this VPS (`plot-dks`, house `/home/main/DKS`). Co-owner, not a client. Not a greenhouse product.
- Ungated parking wall: Design Lab North mark and Building. Same pattern as Paul Fosbury Portraits. Do not invent his mark or extra biography.
- A `@`/`www` already point at `82.165.5.84`. Leave MX / SPF / Livemail alone.
- Remove AAAA for `@` and `www` until this VPS has public IPv6 — Livedns currently has `2001:8d8:100f:f000::200`, which is IONOS nginx, not this box. IPv6 visitors get a 404 until that row is deleted. Let’s Encrypt also prefers AAAA, so HTTPS for this name waits on that delete.

## 2026-08-25 — Fasthosts mail hostnames, not apex (Ewan)

- Optional extra A records only (`mail`/`mailserver` 213.171.216.40, `smtp` 213.171.216.50, `webmail` 213.171.216.231, `mcp` 213.171.195.10, `exchange` 213.171.193.192). Never move `@`, `www`, or plot hosts off 82.165.5.84. Do not Restore Default / Automatic DNS (that wants Fasthosts web 88.208.252.9). App SMTP stays `smtp.livemail.co.uk:587` + full address + mailbox password Change — missing mail A records are not why Livemail rejected noreply. Table: `ops/dns.md`.

## 2026-08-25 — one campus, two ends (Ewan)

- Same `/campus` on live and at home. Lab is a **room** inside it (sites/units). Client handling sits in the same spots on both.
- **Live** (VPS `web`): ENVs, Stripe, SMTP, IMAP, passwords, activate mail — connected. Lab doors are snapped (those ends live on the house).
- **House** (localhost + LAN `:3010`): same look so we can edit style and how it works. Stripe, mail send, Livemail are snapped — Ping does not send. Lab doors still open.
- `/lab` on the house redirects to `/campus`. Public `/lab` `/admin` `/go` stay 404. Do not Caddy-proxy Debian HTML.
- Studio sign-in lands on `/campus`. `/account` stays the person’s profile.
- Ship hub `web` for this (admin/campus). Do not rsync accounts. Do not rebuild plots.

## 2026-08-25 — Livemail is the mailbox password, quoted on VPS (Ewan)

- Fasthosts **Mailbox password → Change** is what Livemail accepts. The local env line was already that password; Change made Livemail match it. SMTP 587 + IMAP 993 both answer from this PC.
- Live `/campus` Mail is the connected end. House `/campus` Mail stays snapped on purpose.
- Put `DLN_SMTP_PASS` and `DLN_MAIL_BUILD_PASS` on VPS `deploy/.env` (gitignored). **Single-quote values that contain `$`** or Docker Compose eats them.
- `design@` still has no password on the host until Dave’s mailbox Change is pasted there.
- Noreply can send. A studio check left for build@.

## 2026-08-25 — campus rooms inside the client (Ewan)

- Top rooms: Clients, Onboarding, Accounting, Mail, Lab. No Pay tab, no Book tab, no Settings tab.
- Client dossier: Profile, Book, Billing, Work. Charge and calendar on the person. Current invoices then past invoices. Work stays shut until a line is paid (APES / stages when that system is built).
- Accounting: received, locked-in monthlies/weeklies, accounts, requests, live page hits, hours, notifications. Housekeeping is days to pay + Adobe kit only — no default amounts, no sample play-online.
- Mail: full inbox sync (up to 500 envelopes), select, remove from campus.
- Booking writes a studio notice and mails them on live. Later automations can post to the same notice well.

## 2026-08-25 — Dave as a billed client (Ewan)

- Email send works on **live** campus (`designlabnorth.com/campus`). House campus mail stays snapped.
- `dave@` is studio. To bill him as a person: Onboarding walk-in, mailbox `dave@`, internal handle. Activate + invoices mail `dave@`. He opens `/account` with the `.local` handle, not his studio login. Ewan sees the same invoice on Clients → Dave → Billing.
- Studio mailbox cannot also be the client login. Tick the internal handle; mail still goes to that box.

## 2026-08-25 — build@ and design@ are the logins (Ewan)

- Studio logins are the live mailboxes: Ewan `build@designlabnorth.com`, Dave `design@designlabnorth.com`. Same on localhost, LAN downstairs, and live. Passwords stay as on the sheets — do not generate new ones.
- Do not invent `@designlabnorth.local` accounts for Dave or Ewan. The `dave.kirkwood@designlabnorth.local` test login was a mistake; remove it.
- Dave stays one person: studio desk plus on the Clients book so Ewan can Ping a bill to `design@`. Dave signs in as `design@`, opens `/account`, pays. Ewan signs in as `build@` and bills him from Clients.
- Old `ewan@` / `dave@` still resolve to the same people if typed. Sheets show `build@` and `design@`.

## 2026-08-25 — Ping does not open pay for studio (Ewan)

- Ping mails the client the Checkout link. Do not send the studio window to Stripe. They pay from the mail or their `/account`. You stay on campus.

## 2026-08-25 — Stripe marks the invoice paid (Ewan)

- Stripe webhook (and a catch-up if Checkout already says paid) writes **paid** on the invoice and a receipt. Studio does not click Record paid / I’ve paid / Paid online for that. Those buttons were the old bank claim. Client due invoice: Pay online only. Paid invoice: paid + receipt.

## 2026-08-25 — Client account rooms (Ewan)

- `/account` was sprawly (profile, site, notes, Titles, sittings, receipts, invoices). Make it campus-like cards and tabs: **Account** (profile, password, their sites), **Write** (sitting / new site / idea — existing customers), **Billing** (invoices prominent, subscriptions, receipts), **Various Titles** (ready; “Nothing unlocked yet”).
- No note well on the hub account. Suggestions stay on the plot host.
- No Manage card / Stripe Customer Portal. All money through Checkout.
- Invoices should be easy to pay as a card. First real invoice can go to Anne Marie once this is live.

## 2026-08-25 — Unify logins (Ewan)

- Offline and live: same Design Lab North login (`build@` / `design@` already). Clients handle password on `/account`.
- Plot access is that cookie, not a second staff account. Studio = admin on the host. Bound client = observer (site + page suggestions). Parking does not apply to them once the plot reads `/api/auth/plot`.
- Do not mint plot staff rows for Ewan and Dave. Tell the plot: if these people are signed into DLN, they can come in.
- ModYu patient/clinic book stays theirs.

## 2026-08-25 — Account tabs must not sign them out (Ewan)

- Never use a Next `<Link>` to `/logout`. Prefetch is a GET, and GET `/logout` clears the cookie. Sign out is a plain `<a href="/logout">`. Prefetch requests to `/logout` must no-op.
- Account rooms (Account / Write / Billing / Various Titles) switch in the page. They must look like chamfered buttons. Clicking a room must not round-trip the server.

## 2026-08-25 — Paul Fosbury live login (Ewan)

- Paul’s Design Lab North login is `email@paulfosbury.com` (one string). Same on localhost, LAN, and live. Ping mails invoices to that address. Old `paul@paulfosburyportraits.com` is retired. Do not invent a second password; do not mail him a dictated one.

## 2026-08-25 — Paul Fosbury hosts (Ewan)

- Main public site is `paulfosbury.com`. `paulfosburyportraits.com` keeps pointing at the same plot. Both are ungated Building.
- The gallery shell is built on `paulfosbury.designlabnorth.com`. Only three logins: `build@designlabnorth.com` (Ewan), `design@designlabnorth.com` (Dave), `email@paulfosbury.com` (Paul). Studio use the existing DLN cookie. Paul uses his client cookie (observer). Do not invent a second staff row.

## 2026-08-25 — Charge row on campus (Ewan)

- Invoice lines were tagging **modyu** because compose defaulted to the first plot on the book. A line only binds a site the person owns.
- Billing compose is one strip: Design / Strategy / Build / DLN, then a boxed “type or pick” (home column lists plus catalogue names; type anything), then amount, cadence, Add line — same height, inside the plate. Description is a box, not an underline. Suggestions must be readable in full.

## 2026-08-26 — automatic studio mail look (Ewan)

- All automatic studio mail shares one Paper/Ink layout: mute mark at the top, hairline, system type (Aktiv cannot be a foundry file in email), optional colourful social-pass tiles on onboard / invoice / paid / booking, light legal (trading name; no invented company number). Reset / recover stays short. Dave liked the amount of text — keep the useful body.
- Machine From is noreply@. Queries: design@ on bills, build@ on onboard / activate / reset / booking. Multipart html + text. Do not smash SMTP, Stripe, webhook paid, or login.

## 2026-08-26 — auto-mail legal; Mail editor later (Ewan)

- Automatic mail legal is real copy in `mail-layout.ts` (**Dave then Ewan**; trading name under Dave Kirkwood Studio at the moment; site and mailboxes; no invented company number). Look is edited in code for now. A live-only Mail “edit auto emails” control is later — do not duplicate a conflicting offline Mail page.

## 2026-08-26 — client login codes (Ewan)

- Clients sign in with a six-digit code emailed to their mailbox. No password faff — especially when invoiced. Password stays as “Or use a password”. Studio (`build@`, `design@`) never get a code: live studio still talks home. Do not reveal whether an address is on the book. Hashed codes in `_meta/accounts/login-codes.json`, not mixed with resets. Ping invoices mention the code door; paying online still does not need a login.

## 2026-08-26 — house password stays on the login page (Ewan)

- Adding codes must not hide or kill password login. `/login` is email + password + Enter, as it has been. Codes are extra for clients on the same page. Studio (`build@`, `design@`) keep the house password (the Local line on the sheet). The offline campus is where we build — that door has to work. Do not ship an addition that takes a working door off the page.

## 2026-08-26 — delete onboarding requests (Ewan)

- Onboarding must be able to **Delete** a request off the book (bots, junk). Done only archives. Do not leave spam sitting in Earlier instances with no way off.

## 2026-08-26 — home Build, not Websites; Instagram trial (Ewan)

- Home third column is **Build**, not Websites. List includes websites, web apps, rebuilds, facelifts, live hosts, development.
- Trial Instagram set lives in `studio/instagram/`. Three pinned carousels: D Design, L Strategy, N Build. Do not redraw the tiles. Type on the export is grotesk fallback (Aktiv stays Adobe Fonts).

## 2026-08-27 — noreply deliverability (Ewan)

- Automated mail from `noreply@` was landing as untrusted because Livedns had SPF but **no DKIM and no DMARC**.
- Keep sending through Nodemailer → Livemail 587. Do **not** install Postfix, Sendmail, or OpenDKIM on the VPS. Recipients see Livemail’s HELO; we set ours to `designlabnorth.com` on the way in.
- DKIM selector is **`mail`**. Private key gitignored. Paste the Livedns TXT / DMARC / SPF / IONOS PTR from `ops/mail-deliverability.md`. Do not Restore Default DNS. Do not rotate the key without replacing that TXT.

## 2026-08-27 — invoice remind (Ewan)

- Additions sit beside working doors. **Remind** on a due invoice mails the same invoice layout, worded still yet to pay with the time they have left. Do not change Ping, Stripe Checkout, webhook paid, or login. House campus stays snapped for send.

## 2026-08-30 — DAA named; preview tenancy (Ewan)

- Digital Adoption Advisor is a client. House `/home/main/DAA`, port `:3050`, campus `/lab/daa`. Mark Barlow is the party (mark.barlow@digitaladoptionadvisor.io). Company published address stays enquiries@digitaladoptionadvisor.io. Local campus can stay blank; the VPS live DLN site is the account book.
- Tenure on his account is **preview**: system language, “this workspace is open while the current build is underway.” Not a closer. Dave made the unpaid exception; do not generalise it.
- `daa.designlabnorth.com` is Building for strangers. Ewan and Dave are studio admin. Mark is observer. Not on the greenhouse wall. `digitaladoptionadvisor.io` stays his until they are ours.
- Sequence: this disk → downstairs LAN campus → VPS `plot-daa` + Caddy flip on a numbered ship once the local site answers. Do not live-edit the VPS every save.
- GitHub `thekirkswood/daa` is Ewan’s to open. This Cursor owns that house once the remote exists.
- Prospect spaces stay rare. Most work is paid first.
- 2026-08-30: Debian `/srv/clients` (1TB) I/O-errored while opening DAA. DAA sits on the NVMe at `/home/main/DAA`. Do not mkdir under `/srv/clients` until that disk is checked. Leave ModYu alone.

## 2026-08-30 — how we approach a house (Ewan)

- Look at **ModYu** and **Choozlist**, not PFP, when judging how deep a house should be. PFP is quite new: Building + workshop shell. Campus wiring may follow it. The *site* must not.
- Every new project is all-encompassing and fresh at the same time. Whole picture — do not focus on one thing. Frameworks are a kit; fit the house.
- Steal plot/gate/inbox/ship. Do not transplant look, tokens, or copy rhythm.
- Doctrine file: `/home/main/_meta/house-approach.md`. Pointer in campus LTM-vital. Do not restyle DAA from this note in the same turn.

## 2026-08-31 — one compose module (Ewan)

- Campus `/admin`, every `/lab/{slug}/admin`, the station dock, and the hub page note use the same compose as ModYu’s desk: change / plan / note, text, images and video, previews before send. Do not keep a notes-only well beside it. Live `/suggest` stays text only.

## 2026-09-01 — onboard password; Mark Barlow (Ewan)

- Onboard mails the login (their email) and a generated password so they can sign in and see their site straight away. Change is optional — `/activate` or **Change password** beside Forgot. Do not force it. Email is a point of failure; ours are decent enough to start. Studio can tell them to change it on the call. Desk shows the password once. Never persist plaintext. Do not smash password login, codes, Ping, or forgot.
- **Activate site** on the person (Clients) mails that onboard and binds the plot. House campus stays snapped for send. Live `/campus` is the book.
- Mark Barlow is on the DLN book: mark.barlow@digitaladoptionadvisor.io, plot `daa` only, preview tenancy. Do not rsync accounts. Invoice reminder closing has no Oxford comma (Apple Pay, Google Pay or card).

## 2026-09-01 — workbench View; campus Mail fetch (Ewan)

- View curtain and foot: this is a workbench. Sandbox host temporary until claimed. KPIs on this space are chargeable. Same line both places. Perception, so KPI work is billed.
- View foot (2 Sep): “This sandbox will be terminated” plus a ticking clock to midnight Sunday 6 Sep 2026, Europe/London.
- View curtain gold line (the refresh animation): **Welcome to the sandbox.** Not “the build”. Foot bar stays the workbench line.
- Campus Mail: Livemail IMAP SEARCH ALL returns empty while the box still has mail (including Microsoft DMARC rua to build@). Fetch by sequence from EXISTS. Nested MIME + attachments named. House campus stays snapped — open Mail on live `/campus`. Do not smash SMTP send.

## 2026-09-01 — Mail graphics and files (Ewan)

- Campus Mail opens the HTML of a note (sandbox iframe) so graphics land. Inline cid images are inlined. Attachments download. Pictures that arrived as files (not cid) still show in the letter. Do not smash list, remove, or IMAP sequence fetch.

## 2026-09-01 — DAA live fields (Ewan)

- DAA live plates use the studio field photographs, not the small mark SVGs stretched as cover. Named plot-daa bugfix. Do not rsync accounts. Do not rebuild other plots.

## 2026-09-01 — Paul onboard mail (Ewan)

- Paul’s login is `email@paulfosbury.com`. He had a hash on the live book and no invite token — the old standing was not to mail a dictated password. That is superseded: onboard / activate-site mails login + generated password in the studio layout (same as Mark). Sent 1 Sep. New clients get that mail so they can sign in and pay. Optional change-password. Do not print the password in chat.

## 2026-09-01 — reminder pay link lasts 24 hours (Ewan)

- Do not Remind with a dead Stripe Checkout. Stripe sessions die 24 hours after **create**, not after the mail. Remind mints a **fresh** Checkout (full 24 hours from that send) and puts that URL in Pay online. Do not issue. Do not mark paid. Do not smash Ping, webhook paid, or login. House campus stays snapped — send on live `/campus`. Paul’s DLN-2026-0003 was the named case.

## 2026-09-01 — mail Pay online is a hub door (Ewan)

- Do not put a Stripe Checkout URL in the letter. It dies in 24 hours while they still owe. Pay online is `designlabnorth.com/pay/{invoiceId}` — Checkout opens when they click. Do not spam. Anne Marie’s mailed Stripe button (DLN-2026-0002) is already expired; do not Remind her unless asked. She can still pay from `/account` Pay online after sign-in. Paul’s fresh Checkout from the 1 Sep remind is a Stripe URL in that one note; next Ping/Remind uses the door. Do not smash Ping, webhook paid, or login.

## 2026-09-01 — studio mail: hub pay door + onboard (Ewan)

Supersedes “Remind mints a Checkout URL that lasts 24 hours from send.” Stripe still dies 24 hours after **create**. We do not put that URL in mail.

**Pay**
- Letters (Ping, Remind, booking pay, onboard if a bill is due) link to **our** page: `https://designlabnorth.com/pay/{invoiceId}`.
- Checkout is created **when they click** (or when they hit Pay online on `/account`). Not at send.
- That screen follows the invoice lines: one-off is a payment; weekly or monthly is a subscription. Apple Pay, Google Pay or card.
- Do not put `checkout.stripe.com` in onboard, invoice, remind, booking, or reset mail.
- Do not spam. A reminder is a new letter with the same hub door, not a new Checkout in the body.
- Paid is still the Stripe webhook. House campus stays snapped for send. Do not smash Ping, webhook paid, or login.

**Onboard / Activate site**
- Subject **Your Design Lab North account**. Noreply, Reply-To build@.
- Body: login (the email they wrote us) + generated password so they can sign in and see the site. Change is optional (`/activate` or Change password). Do not force it. Desk shows the password once. Never persist plaintext. Never print it in chat.
- Never a Checkout URL in this note. If a bill is already due, name the hub pay door — Checkout still waits until they click.
- Do not mail puppets. Dummy local accounts are preview only.

## 2026-09-01 — Watch: trap doors and notifications (Ewan)

- Accounting shows **counts** only. Trap doors and notifications are plates with the amount. Click takes you to **Watch** (`?desk=accounting&board=watch`). Each entry is its own plate; expand for the rest (path, IP, host, account, user agent on traps; body and Clear on notices). Do not dump the full lists on Accounting. Do not add a new top room. House and live campus both.

## 2026-09-01 — Accounting plates are doors; keep trap trips (Ewan)

- Every Accounting count is clickable. Industry drill-down, not a dump on the landing.
- **Received** and **Paid invoices** open the same book: past paid invoices. Name opens that client.
- **On the book** and **Accounts** open Clients.
- **Monthly locked** / **Weekly locked** open the current subscriptions (the “2” is the running monthlies).
- **Requests** open Onboarding. **Live page hits** open the public-path counts. Notifications and trap doors still open Watch.
- Hours and housekeeping stay on the Accounting landing. Do not add a new top room.
- Trap trips, notices, hits, and settings live in `_meta/studio`. On live, that folder is `/srv/dln/data/studio` on `web` so a rebuild does not wipe the book. Keep existing trips (merge by id). Keep recording new probes as normal. Do not rsync accounts.

## 2026-09-01 — tower Mullvad must allow LAN (Ewan)

- Downstairs campus is `http://192.168.0.223:3010`. If ping says Destination Port Unreachable / Operation not permitted and SSH is “connection refused” from this GPU, check Mullvad **local network sharing** before treating the laptop as off. `mullvad lan get` must be **allow** (`mullvad lan set allow`). The box was up; the VPN was hiding it. Do not bind this GPU’s campus to the LAN.

## 2026-09-01 — trap session watchlist (Ewan)

- When someone hits a trap door, that IP is on the watchlist for two hours after last activity. Every path they try in that instance is logged, not only the doors. Watch shows one plate per session; expand for the slash list.
- Sweep about hourly (campus open, or after a new door): learn new probe shapes, write `_meta/studio/watch-learn.md` (studio book, gitignored). Do not put IPs in git memory.
- Retrospective: cluster existing `traps.json` into sessions. Paths they tried that were **not** doors cannot be recovered — the edge did not keep access logs. Going forward those slashes are kept. Live tap stamps the real IP (`x-dln-watch-ip`) so Caddy cannot attach follow-on paths to the container.
- Watch the **account** as well as the IP. A signed-in client who hits a door stays hot for two hours even if they change address. The plate shows their name. Studio campus walking does not fill the book; a studio session that hits a probe path still does. Caddy sends trap paths on every live host (including ungated plots) to the hub so the DLN cookie is seen.
- Secrets stay out of git: `_meta/accounts`, `_meta/studio`, `_meta/billing`, `_meta/secrets`, `.env*`, `deploy/.env`, keys. Gitignore is not a lock on a seized server. Public HTML/CSS/JS can be copied; origin crumbs (`dln-kirkwood-origin`, generator meta, `/_dln/canary`) help us notice a lift, they do not stop one. There are no WordPress plugins. Login fails from one address rest after eight tries in fifteen minutes. Do not claim the house is unbreachable.

## 2026-09-02 — Paid sandbox; Mark Barlow onboard (Ewan)

- The workshop subdomain is the **sandbox**. Fifty pounds a month. Observer does not launch until that line is **paid** (webhook). Studio always in. Strangers on DAA still see Building.
- Compose: tick **Sandbox — this payment opens the subdomain**. Catalogue name Sandbox, £50 monthly.
- Paul Fosbury’s existing payment (the £100 that also pays off the build) and Anne-Marie’s existing space payment attach as sandbox. They already count.
- Mark: welcome letter (login + generated password, never print in chat), then the sandbox invoice letter (hub `/pay/{id}`). Access to `daa.designlabnorth.com` opens when paid.
- Account cards: **Launch the sandbox**. Copy names the in-house ground-up web app. Unpaid: **Pay to launch the sandbox**.
- Dave, today only (2 Sep 2026): the DAA design chat may push **plot-daa** live (`ops/ship-plot-daa.sh`). No other live house. After today, Ewan numbered ships.
- Do not ship source maps. Trap `/lab` `/admin` `/src` `.map`. Observer has no developer settings. Inspect element can still copy rendered HTML — we do not pretend otherwise. Watch for trapdoors on this account.
- Do not rsync accounts. Hub ships rebuild `web` + edge. DAA ship is `plot-daa` only.

## 2026-09-02 — Sandbox once, influence, Anne-Marie (Ewan)

- Mark’s sandbox is **£50 once**, not monthly. Two-week timer from **pay**. Pause that monthly roll. People will not live in the sandbox long.
- Catalogue Sandbox stays id `host-monthly` so the price overlay still matches. Cadence **once**, `sandboxDays: 14`.
- Paul stays on his paid **monthly** sandbox — no fourteen-day cut.
- Anne-Marie still owes the space bill. ModYu is **hers**. Unpaid sandbox must not send her to Not yours, and must not `plotShutFor` the shop. Open site + observer. Implore the pay on the account card (`Space still to pay`) without lying about ownership.
- Influence sits on the **account site card** (the place they enter the sandbox) and on the live well. Client notes go to a living draft plan, reviewed on campus, shaped with our touch. Immediate reply: understood, next patch. Dave/lab inbox stays the “make it and tell Dave it is done” path.
- Every subdomain update writes **patch notes** (`recordPlotPatch` / `_meta/plans/patches.json`) as client LTM: what we did, and which of their suggestions landed. Shipped campus plans stamp the same. Agent writes those notes when shipping a plot.
- Hub ship is `web` only for this. Do not rebuild plot-modyu. Do not rsync accounts.

## 2026-09-02 — Client account is the site (Ewan)

- Landing is **their site**, not profile forms. Picture, name, password live behind a **cog**. Static identity on the bar.
- **Patches** sit under the site. Visible even unpaid. Drawn from house LTM (`Site/src/data/plot-patches.ts`) plus live `_meta/plans/patches.json`. Post-date to when the work actually landed so ModYu (and the others) look full by being real. Agent writes a patch on every plot ship.
- Influence stays under the changelog. Same next-patch reply.
- Billing: do not show a due invoice and a subscription as two identical payments. Nest the invoice under the standing line. `0/1 paid · see invoice DLN-XX`. Collapsible.
- Rooms feel like a small web app (glider nav, pane rise, profile sheet). Chamfer, no pills, no card shadows.
- **Do not convert or re-bill existing clients. Do not mail them about cadence.** Payments on the book stay as they are. We are learning the offer for **new** customers. Mark’s monthly was restored silently after a mistaken once-convert.
- Default room is Sites, even if an invoice is due.

## 2026-09-02 — Pay for the sandbox; patches are product; then offline (Ewan)

- They **pay to have the sandbox**. This supersedes the earlier 2 Sep bullet that left Anne-Marie Open site + observer while unpaid. A sandbox line on a plot they own still blocks observer / Open site / plot-enter until it is paid. Bounce is the **pay door**, never Not yours. ModYu’s public shop stays ungated for patients; Anne-Marie’s signed-in door does not.
- Patch notes are **customer-facing**: positive, direct, actual product changes, short. **Hotfixes do not get a patch.** Do not log plumbing, cookies, or named bugfixes as patches.
- Dave’s 2 Sep **plot-daa live push exception is closed**.
- **This is the last live hub edit of this pass.** After it ships: build on campus / this disk again. Numbered ship or a named bugfix, then stop. Do not keep iterating on the VPS. Do not hotfix live because a chat is about live.

## 2026-09-02 — Cleared notices vanish; pay writes a notice (Ewan)

- Clear a notification and it **leaves Watch**. The row stays in `_meta/studio/notices.json`. Do not show Earlier / Cleared on the site.
- Relevant events write a notice: **paid** (Stripe webhook or studio clear), public request, write-in, influence, sitting, new client account. Trap doors do **not** write a notice — they live on Watch. Do not notice studio Ping / Remind (they already did it). Zero-total auto-collect does not notice.
- Campus only until a numbered ship. Do not hotfix live.

## 2026-09-02 — Block scanners; keep the list (Ewan)

- Trap notifications were still on Watch because they were unread, and because traps had their own plates. Hide trap-kind notices (log stays). Do not write new trap notices.
- **Block** a public scanner IP. Keep them on Watch → Blocked. Still log every path they try after they are shut. Local / LAN addresses can sit on the list; they are not shut.
- Link addresses that share trap doors, the same client string, or the same /24. One blocked plate can hold several IPs.
- A signed-in client who hits a door is not auto-blocked (studio can Block). Studio cookie is never shut out.
- Campus until a numbered ship.

## 2026-09-02 — Watch: no Earlier; Paid for Paul (Ewan)

- Read / Earlier notices never render. Keep collecting in `_meta/studio/notices.json` until a real database is the deep save. Do not dump the log on the page.
- Purchases write a **Paid** notice. Seed one from Paul Fosbury’s existing paid invoice so Watch can show the trigger. Future Stripe / studio clears do the same. Do not backfill every old invoice as unread.
- Named bugfix on hub `web` so live campus matches. Then stop.

## 2026-09-02 — Trap web: exact count, path bubbles (Ewan)

- Accounting **Trap doors** is every slash attempt from the start of this book. Exact. It only rises. Do not count only open plates, and do not cap the number.
- Watch shows one bubble per distinct `/` with the attempt count. Expand: blocked IPs that tried it (then other addresses). Open instances still hold that bot’s slash list. Blocked plates keep the IPs.
- Collect in `_meta/studio/trap-web.json`. New slashes grow the web. Named hub `web` so live Watch matches.

## 2026-09-02 — Local campus first; keep home exact (Ewan)

- **Normal is local first.** This disk `localhost:3010` (dev, instant). Then downstairs LAN campus `http://192.168.0.223:3010` (`ops/push-campus-downstairs.sh` — do not rsync accounts). Home must see the work before, or at least with, the VPS.
- Even when told to post to the VPS, **update local first** so the status quo at home is exact. Then VPS. Do not leave downstairs stale because live moved.
- Keep local campus updated on every hub change. Instant at home is the point.

## 2026-09-02 — Paid is active; no password from the dossier (Ewan)

- **Activate site** on a client’s profile is retired. It mailed a new login and generated a new password. That is not a function. Do not put it back.
- Login is the Design Lab North account. Cookie `dln_session` is the door onto their plot. Signed in at DLN → they enter. Not signed in → they sign in at DLN. Studio walk in the same way. Do not mint a second password for the site.
- First-time **Onboarding** may still mail login + generated password **once** when the record is created. Never from a paying client’s dossier. Never because someone clicked Activate.
- The dossier shows whether the site is **Active** or **Not active** from pay. Paid sandbox (Paul’s £100 monthly) is active. Unpaid space is not. That is the status, not a button.
- **Live page hits** is the cumulative total from the start of this book, and every counted path listed with its own count. Do not show a truncated small number as the story. Campus, lab, login and account are not counted. Gated plot page views join the same book. It only rises.

## 2026-09-02 — Trap doors: block known-malicious only (Ewan)

- Do not auto-block people who play around and try other slashes (`/admin`, `/lab`, a `.map`, random paths). 404 those doors, rack them on the web, keep the instance while it is hot. Do not shut the address.
- **Block** only for known-malicious doors (`.env`, git, WordPress, phpMyAdmin, dumps, secrets). When that scanner also tries other things, those slashes sit on the same plate so we can see them.
- Other addresses on a bubble are tracked in case. They are not blocked for that.
- **Clear** an open plate when it is just a poke / not significant. The web count still rises. Studio can still Block if it turns out to be a scanner.
- Auto-bans that were only curiosity (no known-malicious door) are listed, not enforced. Signed-in clients and studio still never auto-block. Local / LAN listed, not shut.
- House campus (`localhost:3010`, downstairs `:3010`) **is** `/lab` and `/admin`. Do not trap those paths on the lab host — the site-builder bubbles and `/go/{slug}` frames are the work. Public `designlabnorth.com` still 404s and racks `/lab` `/admin`. View stays `/view/{slug}`.

## 2026-09-03 — Leave this Cursor on; sniff, do not grind (Ewan)

- This Design Lab North chat stays open on the home server. It is idle until pinged. That is the point.
- While studio is on campus, `ops/sniff-inbox.sh` (dln) must be running. It watches downstairs `wake.flag` and this disk. It sleeps. It only wakes this chat when a note lands.
- Campus `:3010` stays up (this disk + downstairs). Unit apps (ModYu, DAA, …) start when Dave or Ewan walks in and sleep at zero. Do not keep them processing empty.
- Campus `/admin` notes are this queue. `/lab/modyu/admin` is the ModYu Cursor. `/lab/daa/admin` is the DAA Cursor. Leave those instances open if Dave is in that house. Do not stamp another unit’s pending list from this chat.
- Do not run a strenuous always-working loop. Awake when `wake.flag` changes, take pending in order, then idle.

## 2026-09-03 — DAA and ModYu /admin downstairs (Ewan)

- Dave on downstairs `http://192.168.0.223:3010`. Unit `/admin` is `/lab/{slug}/admin`. Notes already land; they sat because sniff only watched this disk (and DAA wake, without pulling the queue).
- Unit sniff (`ops/sniff-inbox.sh daa` / `modyu`) **pulls** the Debian inbox first (`ops/sync-unit-inbox.sh`). Pending wakes at once. Stamps push back downstairs. Campus sniff still does not stamp another unit.
- DAA `/go/daa/admin` is the campus builder (`/lab/daa/admin`), not a trap. Concertina replaceState keeps `/go/daa`.
- ModYu downstairs `_meta` was EIO on the 1TB `/srv/clients`. House sits on NVMe `/home/main/ModYu` like DAA. Leave the dead 1TB copy. Do not mkdir there until that disk is healthy.


















