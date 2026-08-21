# Local lab — one port

User-facing **localhost** is **:3010** on this Cursor disk. Dave and phones use downstairs: `http://192.168.0.223:3010`. After campus HTML on this disk, push downstairs with `ops/push-campus-downstairs.sh` (rsync DLN + rebuild). That push leaves `_meta/accounts` and the live inbox on Debian — otherwise Dave’s LAN session is wiped. `ops/push-lab-inbox.sh` is the queue only. Live VPS stays as it is. `/lab` 404s on the public host.

## What Dave and Ewan see

1. Sign in at `/login` with the Design Lab North book (`ewan@` / `dave@`).
2. Land on `/lab` — Design Lab North banner, large buttons into each house.
3. A house opens under `/lab/{slug}` with the build in a frame and a note well on that page.
4. `/admin` talks to **this** Design Lab North Cursor (inbox `_meta/lab-inbox/`).
5. `/lab/modyu/admin` (or a comment inside ModYu) writes ModYu’s `_meta/designer-inbox/` — that house’s Cursor.
6. Same pattern for Various Titles and Swarm (`_meta/lab-inbox/` in that folder).

Two logins so every note is named. Those same two are studio access on every house login. Clients on the live site never see `/lab`.

## Start the hub

Preferred (survives a crash; `Restart=always`):

```bash
/home/main/DLN/ops/enable-campus-user.sh
sudo loginctl enable-linger "$USER"
sudo /home/main/DLN/ops/never-sleep.sh
```

Until that is enabled, the old way still works:

```bash
cd /home/main/DLN/Site && npm run dev
```

http://localhost:3010 — or this PC’s LAN address on the same port. Occupancy logs: `_meta/lab-houses/occupancy.log`.

Overnight death on this desktop was the hub process exiting (sleep / OOM / `next dev` with nothing to restart it). The user unit is the fix for **this Cursor disk**. The always-on LAN campus is Debian downstairs in **production** (`ops/debian-campus.service`, `ops/campus-watch.timer`). Do not host Dave’s browser on `next dev`.

Do not start unit apps without `BASE_PATH` / `VITE_BASE`. If a unit is already on its port **without** the `/go/{slug}` prefix, the hub now stops that process and starts it correctly. A 404 is not “up”.

## Houses start when you walk in, sleep when you leave

Dave and Ewan do not start ModYu / Various Titles / Swarm by hand. Walk into a unit — station, builder, greenhouse Enter on this PC, studio preview — and the campus starts that unit’s app. When nobody is in it, the app stops. The inbox in that folder still listens.

The campus (`:3010`) stays up. Units are isolated so a crash in one does not take the others. Swarm also starts its API (`:8787`) beside the web (`:5173`) while that unit is occupied.

Logs and pids: `_meta/lab-houses/` (gitignored). Who is in a unit is `leases.json` in that folder — not only memory in the campus process.

If you ever need the raw server: `127.0.0.1:{port}` — but that copy must have been started with the lab prefix, or the frame’s scripts miss.

## Wake the builder

When `wake.flag` changes in that house’s inbox, the Cursor chat **for that folder** should:

1. Read `messages.json`
2. Take every `pending` item in order
3. Set `working`, do the work in **that** filesystem
4. Stamp `done` or `error` with a reply
5. One failure does not block the rest
6. Do not auto-deploy to the VPS

Campus sniff: `ops/sniff-inbox.sh` watches downstairs `http://192.168.0.223:3010` (Mac, phones, LAN). After a stamp, pull the host onto this disk (`ops/pull-from-debian.sh`). `localhost:3010` is the working copy. Unit chats: `ops/sniff-inbox.sh modyu` / `various-titles` / `swarm`.

Design Lab North hub: `/home/main/DLN/_meta/lab-inbox/`
ModYu: `/home/main/ModYu/_meta/designer-inbox/`
Various Titles: `/home/main/VariousTitles/_meta/lab-inbox/`
Swarm: `/home/main/SwarmFund/_meta/lab-inbox/`
New stations: `{house}/_meta/lab-inbox/`

When two of Ewan’s Cursor seats are already answering (tower and 3060 laptop, both SSH’d into Debian), the **next** jobs cycle between them. Head of the queue and high weight+tokens stay on the tower. See `memory/compass.md`. Dave’s Cursor is his own seat.

## Open a station

On `/lab`, **Open a station** makes `/home/main/{slug}` (skipped if that folder already exists), writes `AGENTS.md` + an inbox, and adds the plot. On Debian, **client** stations are created on `/srv/clients` with a symlink at `/home/main/{slug}`. Studio stations stay on the NVMe. Build the site in that folder. Bind a live host later.

## Production

`/lab`, `/admin`, `/go/*`, `/api/lab` 404 on the public host. Do not rsync this as a Caddy change. Do not put Cursor on the VPS.
