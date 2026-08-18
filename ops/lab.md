# Local lab — one port

User-facing port is **:3010** on this PC. Ewan uses http://localhost:3010. Dave uses the same port on this PC’s LAN address from his machine. Live VPS, live Caddy, and live plot hosts stay as they are. This PC is the editor. `/lab` 404s on the public host.

## What Dave and Ewan see

1. Sign in at `/login` with the Design Lab North book (`ewan@` / `dave@`).
2. Land on `/lab` — Design Lab North banner, large buttons into each house.
3. A house opens under `/lab/{slug}` with the build in a frame and a note well on that page.
4. `/admin` talks to **this** Design Lab North Cursor (inbox `_meta/lab-inbox/`).
5. `/lab/modyu/admin` (or a comment inside ModYu) writes ModYu’s `_meta/designer-inbox/` — that house’s Cursor.
6. Same pattern for Various Titles and Swarm (`_meta/lab-inbox/` in that folder).

Two logins so every note is named. Those same two are studio access on every house login. Clients on the live site never see `/lab`.

## Start the hub

```bash
cd /home/main/DLN/Site && npm run dev
```

http://localhost:3010 — or this PC’s LAN address on the same port.

## Houses start when you walk in, sleep when you leave

Dave and Ewan do not start ModYu / Various Titles / Swarm by hand. Walk into a unit — station, builder, greenhouse Enter on this PC, studio preview — and the campus starts that unit’s app. When nobody is in it, the app stops. The inbox in that folder still listens.

The campus (`:3010`) stays up. Units are isolated so a crash in one does not take the others. Swarm also starts its API (`:8787`) beside the web (`:5173`) while that unit is occupied.

Logs and pids: `_meta/lab-houses/` (gitignored).

If you ever need the raw server: `127.0.0.1:{port}` — but that copy must have been started with the lab prefix, or the frame’s scripts miss.

## Wake the builder

When `wake.flag` changes in that house’s inbox, the Cursor chat **for that folder** should:

1. Read `messages.json`
2. Take every `pending` item in order
3. Set `working`, do the work in **that** filesystem
4. Stamp `done` or `error` with a reply
5. One failure does not block the rest
6. Do not auto-deploy to the VPS

Design Lab North hub: `/home/main/DLN/_meta/lab-inbox/`
ModYu: `/home/main/ModYu/_meta/designer-inbox/`
Various Titles: `/home/main/VariousTitles/_meta/lab-inbox/`
Swarm: `/home/main/SwarmFund/_meta/lab-inbox/`
New stations: `{house}/_meta/lab-inbox/`

## Open a station

On `/lab`, **Open a station** makes `/home/main/{slug}` (skipped if that folder already exists), writes `AGENTS.md` + an inbox, and adds the plot. Build the site in that folder. Bind a live host later.

## Production

`/lab`, `/admin`, `/go/*`, `/api/lab` 404 on the public host. Do not rsync this as a Caddy change. Do not put Cursor on the VPS.
