# Workstream — open hub work

Sequenced. Do not skip. Tick in changelog when a step actually lands (`k:mod` + this file). Do not invent extra studio names. Do not take the shortest path if it overwrites a working plot.

## Done — plots on their own hosts

1. Apex + www + `modyu` + `swarmfund` + `daa` A records → `82.165.5.84`.
2. Caddy host routing on port 80. TLS (`Caddyfile.prod`) waits until Livedns answers Let’s Encrypt without SERVFAIL/timeout. Do not HTTPS-redirect until certs issue — that bricks login.
3. ModYu image empty `BASE_PATH`, host `modyu.designlabnorth.com`.
4. Swarm image `VITE_BASE=/`, host `swarmfund.designlabnorth.com`.
5. Unauth plot host → 302 greenhouse story. Signed-in cookie → 200 plot.
6. Old `/p/modyu` and `/p/swarm` redirect to the hosts.

## Then — keep the hub growing

7. **Clients:** next named client = GitHub repo, `plots.json`, compose service, Caddy host, Livedns A (or wildcard). DAA is reserved only until Ewan lists them.
8. **Choozlist:** listed, Sign in on the story, beta contact `create@wishwell.uk`. Own server until the repo is uploaded here.
9. Retire old Swarm VPS `77.68.49.132` when `https://swarmfund.designlabnorth.com` is the working builder.

## Standing checks (every plot ship)

- Memory: BLUEPRINT / greenhouse / plots.json / WORKSTREAM / CHANGELOG.
- Gate 302 for strangers, 200 for the matching cookie.
- No insult to a live site. No invented status. No secrets in git.
- Each hosted plot has its own hostname. Do not rebase a plot onto a hub path.
