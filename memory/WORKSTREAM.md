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
8. **Invoice desk:** catalogue, compose, waive, issue, A4. Card rail next. Person-first on the studio desk.
9. **Clients:** next named client = GitHub repo, `plots.json`, compose service, Caddy host, Livedns A. DAA reserved only until Ewan lists them.
10. **Choozlist:** listed, beta contact `create@wishwell.uk`. Own server until the repo is uploaded here.
11. **Various Titles:** hosted at `https://varioustitles.com` on this VPS (`plot-titles`). Public wall is Building. Studio enter on this book’s session. Honour `titlesGrant` when it opens. Bank-account link with the card rail.
12. Swarm public is already swarmfund.com. Retire the old Swarm VPS when that builder is the one we use; DLN subdomain is the growing copy until cutover.
13. **Notes on plot pages:** hub overall notes are live. Foot-of-page comments on **local** builds join the central queue (see `memory/offline-lab.md`). Do not put a studio comment-admin on the live subdomain.
14. **SMTP:** so onboard logins and enquiries actually mail. Until then the desk shows the login once.
15. **Offline lab (landed locally):** campus on `:3010`; `/lab` door; units under `/lab/{slug}`; unit apps on occupancy, sleep at zero; `/admin` → campus Cursor; `/lab/{slug}/admin` → that unit’s inbox. Live VPS unchanged. Run `ops/lab.md`.

## Standing checks (every plot ship)

- Memory: protocol (shape of the work) / BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie, shut after seven days unpaid.
- No insult to a live site. No invented status. No secrets in git.
- Each hosted plot has its own hostname. Do not rebase a live plot onto a hub path. Local lab on :3010 may frame houses under `/go/{slug}/`.
- Greenhouse enter is the product domain. Client sites stay on the account.
