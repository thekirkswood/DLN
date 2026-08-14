# Workstream — open hub work

Sequenced. Do not skip. Tick in changelog when a step actually lands (`k:mod` + this file). Do not invent extra studio names. Do not take the shortest path if it overwrites a working plot.

## Now — ModYu reachable from a DLN login

1. Confirm plot container `dln-plot-modyu-1` is up (it is).
2. Confirm apex DNS `designlabnorth.com` → `82.165.5.84` (it is).
3. Confirm `modyu.designlabnorth.com` NXDOMAIN on Livedns (it is). Do not pretend the subdomain works.
4. Interim dock: Caddy `/p/modyu*` → `plot-modyu:3000` with `forward_auth`. ModYu greenhouse image `BASE_PATH=/p/modyu`. Caddy also sends `/assets*` to the plot (hardcoded src). IONOS drops ports other than 22/80/443 — do not use `:3080` from the internet.
5. `plots.json` `enterUrl` = `http://designlabnorth.com/p/modyu`. Sign in on the apex, then Enter the plot.
6. Prove with a real session cookie: unauth `/p/modyu` → 302 greenhouse; owner cookie → 200 ModYu HTML (assets load).
7. Local ModYu on `:3000` keeps empty `BASE_PATH`. Only the VPS greenhouse image is prefixed.

## Next — Livedns (Ewan, 123-reg / Heart / Fasthosts panel)

Nameservers: `ns1.livedns.co.uk`, `ns2`, `ns3`. This is **not** the IONOS VPS panel.

8. Add A `modyu` → `82.165.5.84` (TTL 300). Prefer also A `*` → same IP for every future client plot.
9. Wait until `dig +short A modyu.designlabnorth.com` returns the IP.
10. Switch `enterUrl` to `http://modyu.designlabnorth.com`. Rebuild plot image with empty `BASE_PATH`. Keep `/p/modyu` until that is proven.
11. Remove `/p/modyu` Caddy handle and `/assets` steal. Log `k:del` for the dock.

## Then — TLS

12. Apex already answers; wildcard/modyu must answer first.
13. Switch edge to `Caddyfile.prod`, set `DLN_COOKIE_SECURE=true`, `DLN_PUBLIC_URL=https://designlabnorth.com`.
14. Prove https://designlabnorth.com and https://modyu.designlabnorth.com (signed-in).

## Grow the hub

15. **Clients:** next client = new GitHub repo, `plots.json` party `client`, compose service, Caddy host, greenhouse voice. Isolation: one container each.
16. **Swarm Fund (studio):** listed only until Ewan says host it. Then same path as a client plot, party `studio`. No public domain of their live site.
17. **Choozlist (studio):** listed only. Own server forever. Never a DLN plot host. Public copy is the life registry, not the agentic stack.
18. Greenhouse stays the front: mark + brand sentence. Enter the plot only when a host exists and the person is signed in.

## Standing checks (every plot ship)

- Memory: BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie.
- No insult to a live site. No invented status. No secrets in git.
