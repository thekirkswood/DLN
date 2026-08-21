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
10. **Clients:** next named client = GitHub repo, `plots.json`, compose service, Caddy host, Livedns A. DAA reserved only until Ewan lists them. Login is the email they wrote us; password in the confirmation mail after audit.
11. **Choozlist:** listed, beta contact `create@wishwell.uk`. Own server until the repo is uploaded here.
12. **Various Titles:** hosted at `https://varioustitles.com` on this VPS (`plot-titles`). Public wall is Building. Studio enter on this book’s session. Honour `titlesGrant` when it opens. Billed on this book; bank pay is the rail. Card later.
13. Swarm public is already swarmfund.com. Retire the old Swarm VPS when that builder is the one we use; DLN subdomain is the growing copy until cutover.
14. **Notes on plot pages:** live host has a **suggestion box** (text only). Collect, audit, sweep to a plan, run ourselves. Not a live changer. Local lab foot comments stay the offline builder queue. Do not put a studio comment-admin on the live subdomain.
15. **SMTP:** so onboard confirmations and enquiries actually mail. Until then the desk shows the login once.
16. **Offline lab:** Debian downstairs hosts LAN campus in production on `:3010` with a health watch; this Cursor disk is `next dev` on localhost. `/lab` door; units under `/lab/{slug}` with honest `/go/{slug}` prefix; unit apps on occupancy here, pinned on Debian; `/admin` → campus Cursor; `/lab/{slug}/admin` → that unit’s inbox. Send is not a worker. Live VPS user pages + home tunnel. `ops/lab.md`, `ops/home-tunnel.md`, `memory/audit-campus.md`.

## Standing checks (every plot ship)

- Memory: protocol (shape of the work) / BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie, shut after Settings days to pay unpaid.
- No insult to a live site. No invented status. No secrets in git.
- Each hosted plot has its own hostname. Do not rebase a live plot onto a hub path. Local lab on :3010 may frame houses under `/go/{slug}/`.
- Greenhouse enter is the product domain. Client sites stay on the account.
