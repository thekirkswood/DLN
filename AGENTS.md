# Design Lab North — agent notes

Parent studio site + greenhouse of Docker plots. Domain: designlabnorth.com.

## Read first

Every turn, before edits: [memory/protocol.md](memory/protocol.md) (shape of the work), then identity → brand → BLUEPRINT → greenhouse → DIRECTIONS → WORKSTREAM → changelog tail. Campus vital (path only): `/home/main/_meta/LTM-vital.md`, `/home/main/_meta/github-repos.md`, `/home/main/_meta/github-ops.env`. This Cursor owns `thekirkswood/DLN` only.

- [memory/protocol.md](memory/protocol.md)
- [memory/ITERATION](memory/ITERATION) — current site number. GitHub ships are tagged `dln-{n}`.
- [memory/BLUEPRINT.md](memory/BLUEPRINT.md)
- [memory/DIRECTIONS.md](memory/DIRECTIONS.md)
- [memory/WORKSTREAM.md](memory/WORKSTREAM.md)
- [memory/greenhouse.md](memory/greenhouse.md)
- [memory/cross-house-comms.md](memory/cross-house-comms.md) — campus vs unit; who owns which queue
- [memory/compass.md](memory/compass.md) — Debian holds files+sites; GPU PCs are Cursor seats; house lease
- [memory/offline-lab.md](memory/offline-lab.md) — central offline builder. Run that file when the work is the lab.
- [memory/brand.md](memory/brand.md)
- [.cursor/rules/dln-memory.mdc](.cursor/rules/dln-memory.mdc)

## Run

User systemd (`Restart=always`) until Debian downstairs is the host:

```bash
/home/main/DLN/ops/enable-campus-user.sh
```

Or: `cd Site && npm run dev`

http://localhost:3010 — the user-facing local port (Dave can use this PC’s LAN address on the same port). Greenhouse at `/greenhouse`, login at `/login`, lab at `/lab` (studio). How to frame the other houses: `ops/lab.md`. Audit: `memory/audit-campus.md`. Debian later: `ops/debian-host.md`.

## Accounts

`_meta/accounts/` (gitignored). Cookie `dln_session`. Seed file `_meta/accounts/SEED.txt` after first boot. Studio logins are `@designlabnorth.com` (Ewan owner, Dave Kirkwood studio).

## Wake (this house)

When `_meta/lab-inbox/wake.flag` changes, open `_meta/lab-inbox/messages.json`. If `_meta/edit-lease.json` is held by another seat, **stop** ([`ops/house-lease.md`](ops/house-lease.md)). Take every `pending` item **in order**. Set `working`, do the work in **this** filesystem (`/home/main/DLN`). Honour memory. Stamp `done` or `error` with a `reply`. One failure does not block the rest. Do not auto-deploy.

**Browser campus** (Mac, phones, any LAN address) is downstairs: `http://192.168.0.223:3010`. This chat sniffs `_meta/lab-houses/lan-inbox` and stamps Debian’s inbox. **localhost:3010** writes this disk and pushes that inbox to Debian. Merge by id — never overwrite a local-only note.

While someone is signed in on the browser campus, keep `ops/sniff-inbox.sh` running. Do not stamp another unit’s pending queue.

`/lab/modyu/admin` and comments inside ModYu write `/home/main/ModYu/_meta/designer-inbox/` — that is the ModYu Cursor, not this chat. `/lab/various-titles/admin` writes `/home/main/VariousTitles/_meta/lab-inbox/`. `/lab/swarm/admin` writes `/home/main/SwarmFund/_meta/lab-inbox/`. Load that unit’s Cursor to sniff; leave it until you log off that instance, or until processing finishes. The unit **app** only runs while someone is in that unit (and stays up if a job is still `working`); the inbox still listens when the app is asleep.



## VPS

See `ops/vps.md`. Do not put passwords in this repo.
