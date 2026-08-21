# Home tunnel — public VPS talks to campus

The public host serves **DLN user pages** (home, practice, work, method, greenhouse, client `/account`). Studio desk stays on Debian. A live ship of the hub must **not** rebuild plot containers or rsync `_meta/accounts` / ModYu books. Anne Marie’s live login is `modyu.designlabnorth.com`, not a copy of campus.

## Shape

1. Debian (always-on campus `:3010`) opens an **outbound** reverse SSH tunnel with `autossh` to the VPS. Home is behind NAT; it dials out.
2. Listen on the VPS is **only** `127.0.0.1:13010`, user `dln-home`, key `_meta/secrets/dln-home`. Global SSH forwarding stays off.
3. Studio sign-in on `designlabnorth.com` asks home to check the password (home book is the blueprint) and issues an **Ed25519 ticket**. The VPS verifies the ticket with the public key; it does not copy the desk.
4. Caddy on the VPS: `/lab` `/admin` `/go` `/api/lab` → `forward_auth` studio-gate, then proxy to the tunnel with `Host: campus.dln.home`.
5. Remote Cursor and LAN campus share Debian. Lease still one writer per house.

Secrets live in gitignored `_meta/secrets/` (ticket PEM, dial secret, tunnel key). Public half of the ticket also sits on the VPS at `/srv/dln/data/home-ticket.pub`. Never commit those files.

## Enable

On the VPS, once: `ops/enable-vps-home-listen.sh` (creates `dln-home`, sshd Match, copies the pub).

On Debian, once: `ops/enable-home-tunnel.sh` (user systemd `home-tunnel.service`). Campus service already loads `_meta/secrets/home-dial.env`.

A hub ship: rsync repo (accounts excluded) → `docker compose up -d --build --no-deps web` → recreate **edge** only if Caddy changed. Do not `--build` plot-modyu.
