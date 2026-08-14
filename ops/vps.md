# VPS

- Host: `82.165.5.84`
- SSH: `dln-vps` (`~/.ssh/config`) · key `~/.ssh/id_ed25519_dln`
- OS: Ubuntu 26
- Layout: `/srv/dln`
- Edge: Caddy 80/443
- App + plots: Docker Compose
- DNS: designlabnorth.com + `*.designlabnorth.com` → this IP (Ewan / registrar)

No passwords here. Chat-supplied root password was used once to install the key, then SSH password login is disabled.
