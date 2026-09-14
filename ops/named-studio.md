# Named local studio

Dave bookmarks names, not ports. Debian Caddy on **:80** sends them to the sitting processes. Public DNS stays on the VPS.

| Name | Process |
|---|---|
| http://dln.local | Design Lab North `:3010` |
| http://builder.dln.local | Lab `:3100` |
| http://modyu.dln.local | ModYu `:3000` |
| http://titles.dln.local | Various Titles `:3020` |
| http://swarm.dln.local | Swarm web `:5173` |
| http://pfp.dln.local | Paul Fosbury Portraits `:3030` |
| http://dks.dln.local | Dave Kirkwood `:3040` |
| http://daa.dln.local | DAA `:3050` |

Backup if a name fails: `http://192.168.0.223:3010` (and the same IP with the house’s port).

Cookie `dln_session` uses `Domain=.dln.local` on those names so Sign in on `dln.local` follows Dave to `builder.dln.local`, plus a host-only twin. Lab copies the hub session through `/api/auth/lan-enter` if the Domain cookie does not travel. Live `designlabnorth.com` keeps `.designlabnorth.com`. localhost on Ewan’s tower stays host-only. Max-Age is ninety days, refreshed as they walk.

## Debian

Landed. Caddy owns **:80**. Apache is disabled (it was only Debian’s default “It works” page). Dave tries `http://dln.local`. Backup remains `http://192.168.0.223:3010`.

DNS: `ops/debian-lan-dns.sh` (dnsmasq / avahi). Re-run the Caddy script only if `:80` is stolen again.

## Dave’s Mac

If `dln.local` does not resolve, add the line in `ops/dave-hosts.txt` to `/etc/hosts`.
