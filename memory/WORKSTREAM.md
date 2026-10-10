# Workstream — open hub work

Sequenced. Do not skip. Tick in changelog when a step actually lands (`k:mod` + this file). Do not invent extra studio names. Do not take the shortest path if it overwrites a working plot.

## Done — plots on their own hosts

1. Apex + www + `modyu` + `swarmfund` + `daa` A records → `82.165.5.84`.
2. Caddy host routing. HTTPS live. Livedns NS. Watchdog keeps HTTP on :80.
3. ModYu image empty `BASE_PATH`, host `modyu.designlabnorth.com`.
4. Swarm growing copy `VITE_BASE=/`, host `swarmfund.designlabnorth.com`. Public enter is swarmfund.com.
5. Unauth client plot host → 302 login. Signed-in cookie → 200 plot. Unpaid seven days → shut for the client.
6. Old `/p/modyu` and `/p/swarm` redirect to the hosts.

## Open — lab and desk

7. **Offers:** Design, Strategy, Build as equal columns. Form, not write-to-us. Practice holds the hub description + portfolio. (Landed locally.)
8. **Live user pages:** public hub on the VPS. Signed-in **Studio** is on that host (site projects, then the picture window at `/studio-engine`). Client `/account` on the VPS. Anne Marie’s ModYu book stays on her plot host.
9. **Invoice desk:** Settings holds per-entry amounts + online rail + spare bank; Pay selects those lines onto an invoice for the served client and pings online; desk rooms stay; campus header Campus / Builder / Account. Book this-week; Onboarding cards; Cursor is human. Card provider later.
10. **Clients:** Paul Fosbury Portraits is the second named client (`pfp`). DAA is on the book (`daa`, Mark Barlow, `public: false`) and live at `daa.designlabnorth.com` (`plot-daa`). Further named clients = GitHub repo, `plots.json`, compose service, Caddy host, Livedns A. Login is the email they wrote us; password in the confirmation mail after audit.
11. **Choozlist:** listed, beta contact `create@wishwell.uk`. Own server until the repo is uploaded here.
12. **Various Titles:** not a Design Lab North service. Sibling house may stay on this VPS. Off the greenhouse, catalogue, and client account.
13. Swarm public onto IONOS (same `plot-swarm`) when Ewan flips Livedns A `@`/`www` → `82.165.5.84`. Leave MX on Livemail. Fasthosts VPS stays until April 2027 as public preview/scratch — not live products. Subdomain stays the gated copy.
14. **Notes on plot pages:** live host has a **suggestion box** (text only). Collect, audit, sweep to a plan, run ourselves. Not a live changer. Local lab foot comments stay the offline builder queue. Do not put a studio comment-admin on the live subdomain.
15. **SMTP:** so onboard confirmations and enquiries actually mail. Until then the desk shows the login once.
16. **Offline lab:** Design Lab North on `:3010` is the public site (same as live). The lab is `/home/main/Repos/Builder` on **`:3100`**. One sniffer there. `ops/lab.md`.

## Open — Campus house (tester `:3010`)

17. **Letter parked** at `/letter`. Home is the campus workbench.
18. **Asset pack:** NewSiteBrief stills, Frameworks, Portfolio, PNGs, Copy PDFs, motion in `Site/public/brief/`.
19. **Campus home:** ticket landing. Watch on live is the estate book (in now, sign-in attempts, visitors by house, trap sort). Persist `_meta/studio`. Caddy access JSON feeds plot hosts. Tabs: **Campus** (sentence + Design / Strategy / Build), then **Studio** on the signed-in house (projects for that site, then the picture window for one job; Instant-update tokens; live as of the Studio ship), then one tab per site on the book. **EPK** is a button in line with Live site and Sandbox when the stack includes it, not a homepage tab. No Press packs on the header. No top-right website tag. Journalists still use `/epk` with a code. A site tab is the live view (campus **IP:port**, wake if off; live VPS is the **domain**), hits, live/sandbox, that house’s real pages (chips drive the window and the chat), Instant update and hotfix under the window, and patch notes. Account Sites is the list. Tokens live on Payments. Strangers get a plus tab **Add a brand**. 01 / 02 / 03 names only. DAA and DKS stay as tabs when the account holds them — `plots.json` is the book, not only the greenhouse wall. Open lists, grey only on 01–03 and Enter. Floating mark; Paper/Ink chips as a box with no bottom on the header line. No rolling GIF chrome. Enter collapses the ticket so the three names become the left rail. On a phone that rail folds to an arrow. Contact lines at the foot of each list, as a form. Left-locked Design / Strategy / Build / BoomStack as **one walk of sections** (gap between doors; cannot rest in the gap — bottom of a door or top of the next; resistance only Design / Strategy / Build). BoomStack is the billing door and that dashboard. Strategy still has How we work. Design still has the films on that page. **Board is campus studio only while it is built** — 404 on the live host, hidden from the public header and from live plot doors. Watch is its own desk room (visitors retained; snoop ≠ ban). Blocked IPs see `/blocked`. FAL clips later with Ewan. **Public copy is for the public and for clients** — no desk asides from the Cursor back-and-forth.
20. **Funnel mail:** Forms first. IMAP later. No private Gmail scrape.
21. **Builder house:** `/home/main/Repos/Builder` on **`:3100`** / `builder.dln.local`. Always-on lab. Campus `/admin` and `/lab/{slug}/admin` are gone. DLN local matches live.
22. **Named local studio:** Dave bookmarks `dln.local` names (Debian Caddy :80). Cookie `Domain=.dln.local` on those hosts. Live `/desk` tunnels the home book. Clock live overlay. Houses sheet (View site / Open live / View EPK) on the book and on the lab `/links`. **Assets is the house library** (dropdowns, drag-and-drop, text notes, comments, download, delete uploads, tick share). **ModYu journalist kit matches Dave’s landing and two-group rail** (MAP / his `/epk`); on-screen is not a PDF; Download PDF on desk stories, logo+banner on the PDF foot only. **ModYu and DAA text is in the hub**. Various Titles later. **EPKs pull only shared assets** into the MAP editor for other houses. `/epk` is the in-house press-kit gate. Each kit is unique at `/epk/{kit}`. A cookie for one house never opens another. DAA kit is fed from that house’s `_meta/assets/daa.json` (slim copy in the hub). Lab launches View site / View EPK; no harvest box in compose. Ordinary Send does not deploy. **Board stays off the live ship.**
23. **Board campus:** Plans in `memory/board-plans/` (walk `12-one-space.md`; slices `13-little-tasks.md`; environments `14-environments.md`; return `15-give-back.md`). `/board` is one sitting: interiors mount on the table (`?enter=`). Maps camera stays 3D at every width; pan limited on a phone. Wheel stays in the board. Scale is a plot flag. Rooms are instruments. Give-back is derived / research / generate — last two wait for a key. Still skeletal. Not live.
24. **Social avenues:** map in `memory/social-video-blueprint.md`. Talk to people (questions, years, system you put work into, place you sell from). No deck. No poetry. Loops are the pretty moving picture. Three doors, three leads. House homepage tab **Studio** after Campus lists projects for the selected site. Open a project: Picture gen, Inpaint, Text inside it. Video later in the same project. Instant updates on the project bar and on the site tab. Board still off live.
25. **Section films:** one-at-a-time plan in `memory/section-films.md`. Pack is traced mark slices onto the wide lockup → products. UI is devices, real mark, chips that shrink then travel. Host loop sits on Live site and a sandbox beside it. Apps is phone + browser, same app. Identity still leaves ModYu. Print is parked.
26. **BoomStack:** product book `memory/boomstack.md`. Campus door is one chamfered stair of stacks 1 / 2 / 3 (£75 / £150 / £275 pm on the plates). Signed-in plot window is the same name. Press is a signed-in account function (stack 2+ / kit on the book), not public chrome. No how-you-come-in money on this page. Token ledger on Payments. Capture well under the live view on the site tab. Instant update wakes the house; free field is the sweep. Mark/DAA is the first client this is for. host-monthly still counts as stack 1. Do not print Springstack.
27. **Live Swarm observer:** a client on the VPS book tagged `swarm` — log in on `designlabnorth.com` and see the DLN client view (Sites, press kit, assets) as if they own Swarm Fund. Same pathway as ModYu / DAA. No dummy plot. Watch Visitors remains the house-by-house access book.

## Standing checks (every plot ship)

- Memory: protocol (shape of the work) / BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie, shut after Settings days to pay unpaid.
- No insult to a live site. No invented status. No secrets in git.
- Each hosted plot has its own hostname. Do not rebase a live plot onto a hub path. Named LAN hosts: `ops/named-studio.md`.
- Greenhouse enter is the product domain. Client sites stay on the account.

## EPK generator (2026-10-01)

Learn from ModYu plot kit (`modyu.designlabnorth.com/epk`): labelled asset vault, story rails, picture palette, HT4 About + Shop RRP, transparent downloadable PNGs. Hub auto kits should adopt; bespoke plots override via `KIT_EXTERNAL_PRESS` handoff.

## Client preview gate (2026-10-02)

ModYu uses the plot host itself (`modyu.designlabnorth.com`) with an in-app code gate — no second container or `-sandbox` URL. Organic → `/enter` + sayable code; `dln_session` / desk cookies bypass. Compose: `SANDBOX_GATE=1` on `plot-modyu`. Extrapolate the same way on each plot host.
