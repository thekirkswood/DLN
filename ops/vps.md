# VPS

- Host: `82.165.5.84`
- SSH: `dln-vps` (`~/.ssh/config`) · key `~/.ssh/id_ed25519_dln`
- OS: Ubuntu 26
- Layout: `/srv/dln`
- Edge: Caddy 80 (live `Caddyfile.ip`). 443 closed until a real cert. Watchdog `deploy/watchdog.sh`.
- App + plots: Docker Compose (`web`, `plot-modyu`, `plot-swarm`, `plot-titles`; `dns` only while registrar NS are plot hosts)
- IONOS Cloud Panel firewall must allow 80 (and 53 tcp/udp only if this box is the public NS). UFW is not the outer firewall.
- App + plots: Docker Compose (`web`, `plot-modyu`, `plot-swarm`, `plot-titles`)
- Plot source: `/srv/dln/plots/modyu`, `/srv/dln/plots/swarm`, `/srv/dln/plots/various-titles`
- Data: `/srv/dln/data/accounts`, `billing`, `enquiries`, `plans`, `modyu-accounts`, `swarm`
- Enquiries email: optional SMTP in `deploy/.env` (`DLN_SMTP_HOST` etc). Without it, enquiries still land on the studio desk. Onboard logins are emailed to the client’s mailbox when SMTP is set; otherwise the desk shows the login once to copy. No passwords in this file.
- DNS: designlabnorth.com + `*.designlabnorth.com` → this IP (Ewan / registrar)

No passwords here. Chat-supplied root password was used once to install the key, then SSH password login is disabled.
