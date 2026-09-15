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

Campus signed-in plus-select uses those **IP:port** binds in the homepage window, and calls the house if the port is quiet (`ops/wake-house.sh`). Live `designlabnorth.com` uses the same window with public domains. Do not iframe subdomains from the homeserver. Units sit at `/` on that port — never `BASE_PATH=/go/{slug}`.

Cookie `dln_session` is **one value per host**. Named LAN is host-only — do not set `Domain=.dln.local` (special-use TLD; a twin then fights). Lab copies the hub session through `/api/auth/lan-enter`. House sites do not — they have no consume route. Live `designlabnorth.com` keeps `.designlabnorth.com`. localhost on Ewan’s tower stays host-only. Max-Age is ninety days. `/api/auth/me` refreshes; middleware does not rewrite the cookie on every click.

## Debian

Landed. Caddy owns **:80**. Apache is disabled (it was only Debian’s default “It works” page). Dave tries `http://dln.local`. Backup remains `http://192.168.0.223:3010`.

DNS: `ops/debian-lan-dns.sh` (dnsmasq / avahi). Re-run the Caddy script only if `:80` is stolen again.

## Dave’s Mac

If `dln.local` does not resolve, add the line in `ops/dave-hosts.txt` to `/etc/hosts`.
