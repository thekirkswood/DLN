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
8. **Live user pages:** public hub on the VPS. Studio desk stays home and talks back through the tunnel. Client `/account` on the VPS. Anne Marie’s ModYu book stays on her plot host.
9. **Invoice desk:** Settings holds per-entry amounts + online rail + spare bank; Pay selects those lines onto an invoice for the served client and pings online; desk rooms stay; campus header Campus / Builder / Account. Book this-week; Onboarding cards; Cursor is human. Card provider later.
10. **Clients:** Paul Fosbury Portraits is the second named client (`pfp`, `paulfosburyportraits.com` + `paulfosbury.designlabnorth.com`). Further named clients = GitHub repo, `plots.json`, compose service, Caddy host, Livedns A. DAA reserved only until Ewan lists them. Login is the email they wrote us; password in the confirmation mail after audit.
11. **Choozlist:** listed, beta contact `create@wishwell.uk`. Own server until the repo is uploaded here.
12. **Various Titles:** hosted at `https://varioustitles.com` on this VPS (`plot-titles`). Public wall is Building. Studio enter on this book’s session. Honour `titlesGrant` when it opens. Billed on this book; bank pay is the rail. Card later.
13. Swarm public onto IONOS (same `plot-swarm`) when Ewan flips Livedns A `@`/`www` → `82.165.5.84`. Leave MX on Livemail. Fasthosts VPS stays until April 2027 as public preview/scratch — not live products. Subdomain stays the gated copy.
14. **Notes on plot pages:** live host has a **suggestion box** (text only). Collect, audit, sweep to a plan, run ourselves. Not a live changer. Local lab foot comments stay the offline builder queue. Do not put a studio comment-admin on the live subdomain.
15. **SMTP:** so onboard confirmations and enquiries actually mail. Until then the desk shows the login once.
16. **Offline lab:** Design Lab North on `:3010` is the public site (same as live). The lab is `/home/main/Repos/Builder` on **`:3100`**. One sniffer there. `ops/lab.md`.

## Open — Campus house (tester `:3010`)

17. **Letter parked** at `/letter`. Home is the campus workbench.
18. **Asset pack:** NewSiteBrief stills, Frameworks, Portfolio, PNGs, Copy PDFs, motion in `Site/public/brief/`.
19. **Campus home:** ticket landing (Campus left of the ticket block on browser and phone; plus is add-plot or the last plot name when signed in). Open lists, grey only on 01–03 and Enter. Floating mark; Paper/Ink chips as a box with no bottom on the header line. No rolling GIF chrome. Enter collapses the ticket so the three names become the left rail. On a phone that rail folds to an arrow. Contact lines at the foot of each list, as a form. Left-locked Design / Strategy / Build with the line list as a dropdown under the open door. Design: logos centred with house marks; identity as devices with stills in them, no orphan gallery; UI as a window you can use. Strategy: How we work first (stage title switches, plate + track + glyphs); Start-up is a two-hour sitting; brand/marketing beats; audits walk the arrow. Build: PEE rooms. Host on the rail (£50 / £100, sandbox reopen). **Board is campus studio only while it is built** — 404 on the live host, hidden from the public header and from live plot doors. Watch is its own desk room. Blocked IPs see `/blocked`. FAL clips later with Ewan.
20. **Funnel mail:** Forms first. IMAP later. No private Gmail scrape.
21. **Builder house:** `/home/main/Repos/Builder` on **`:3100`** / `builder.dln.local`. Always-on lab. Campus `/admin` and `/lab/{slug}/admin` are gone. DLN local matches live.
22. **Named local studio:** Dave bookmarks `dln.local` names (Debian Caddy :80). Cookie `Domain=.dln.local` on those hosts. Live `/desk` tunnels the home book. Clock live overlay. Houses sheet (View site / Open live / View EPK) on the book and on the lab `/links`. **Assets is the house library** (dropdowns, drag-and-drop, text notes, comments, download, delete uploads, tick share). **EPKs pull only shared assets** into the MAP editor (cover, On/Off vault, Add/Remove, stories and promotions you can take off when old). `/epk` is the in-house press-kit gate: stranger → code; client → kits flagged on their account; studio → every kit. Each kit is unique at `/epk/{kit}` on the **HT4 MAP look**. A cookie for one house never opens another. DAA kit is fed from that house’s `_meta/assets/daa.json` (slim copy in the hub). Lab launches View site / View EPK; no harvest box in compose. Ordinary Send does not deploy. **Board stays off the live ship.**

## Standing checks (every plot ship)

- Memory: protocol (shape of the work) / BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie, shut after Settings days to pay unpaid.
- No insult to a live site. No invented status. No secrets in git.
- Each hosted plot has its own hostname. Do not rebase a live plot onto a hub path. Named LAN hosts: `ops/named-studio.md`.
- Greenhouse enter is the product domain. Client sites stay on the account.
