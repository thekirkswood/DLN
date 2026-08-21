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

## 2026-08-20 — Anne Marie is an offline puppet

- Credential snow was so we could see a client account before deployment. Keep that path: `modyu@designlabnorth.com` signs into **campus / localhost** only (`puppet: true`).
- Do not mail, display, or regenerate that login every time. Public hub stays locked for the puppet. Live ModYu book is still hers, separate password.
- Accessible again: password stays in `SEED.txt` / `sheets/anne-marie-modyu.txt` / `/home/main/_meta/ops-secrets.env`. Login on `localhost:3010` works; public hub returns `campus_only`. Sheet no longer claims public hub login.
- This Cursor owns `thekirkswood/DLN` only. Campus vital LTM lives at `/home/main/_meta/LTM-vital.md`, repo map `/home/main/_meta/github-repos.md`, PAT path `/home/main/_meta/github-ops.env` (never echo). Push with `/home/main/_meta/bin/gh-push.sh DLN main`.

## 2026-08-20 — numbered site iterations

- Every GitHub upload of a site is a new integer. DLN: `memory/ITERATION`, log `memory/iterations.jsonl`, git tag `dln-{n}`. Other houses use `{slug}-{n}` in their own repo. So a version can be seen, logged, and rolled back. Do not ship unnumbered. First DLN number is **1**.

## 2026-08-20 — method: filter and pipeline as diagrams

- `/method` stays Dave’s facts (three values, four rooms, Various Titles). Direct, with enough pitch to sell. Do not put GBP on the public page.
- Quality filter and campus pipeline each carry their own chamfered graphic. Idle: the filter token lights each sieve as it drops; the pipeline arrow walks 1→4 then zips the other way back to 1. Hover still takes over on a fine pointer. Play is slow enough to read.
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



