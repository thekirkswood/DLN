# Design Lab North — agent notes

Parent studio site + greenhouse of Docker plots. Domain: designlabnorth.com.

## Read first

Every turn, before edits: [memory/protocol.md](memory/protocol.md) (shape of the work), then identity → brand → BLUEPRINT → greenhouse → DIRECTIONS → WORKSTREAM → changelog tail.

- [memory/protocol.md](memory/protocol.md)
- [memory/BLUEPRINT.md](memory/BLUEPRINT.md)
- [memory/DIRECTIONS.md](memory/DIRECTIONS.md)
- [memory/WORKSTREAM.md](memory/WORKSTREAM.md)
- [memory/greenhouse.md](memory/greenhouse.md)
- [memory/cross-house-comms.md](memory/cross-house-comms.md) — campus vs unit; who owns which queue
- [memory/offline-lab.md](memory/offline-lab.md) — central offline builder. Run that file when the work is the lab.
- [memory/brand.md](memory/brand.md)
- [.cursor/rules/dln-memory.mdc](.cursor/rules/dln-memory.mdc)

## Run

```bash
cd Site && npm run dev
```

http://localhost:3010 — the user-facing local port (Dave can use this PC’s LAN address on the same port). Greenhouse at `/greenhouse`, login at `/login`, lab at `/lab` (studio). How to frame the other houses: `ops/lab.md`.

## Accounts

`_meta/accounts/` (gitignored). Cookie `dln_session`. Seed file `_meta/accounts/SEED.txt` after first boot. Studio logins are `@designlabnorth.com` (Ewan owner, Dave Kirkwood studio).

## Wake (this house)

When `_meta/lab-inbox/wake.flag` changes, open `_meta/lab-inbox/messages.json`. Take every `pending` item **in order**. Set `working`, do the work in **this** filesystem (`/home/main/DLN`). Honour memory. Stamp `done` or `error` with a `reply`. One failure does not block the rest. Do not auto-deploy.

`/admin` on localhost:3010 writes this inbox. Comments on the public hub pages (the note well) write this inbox too. That is the **campus**. Do not action queues that belong to another unit. Do not stamp a unit’s `pending` items from this chat — that unit’s Cursor window does.

`/lab/modyu/admin` and comments inside ModYu write `/home/main/ModYu/_meta/designer-inbox/` — that is the ModYu Cursor, not this chat. `/lab/various-titles/admin` writes `/home/main/VariousTitles/_meta/lab-inbox/`. `/lab/swarm/admin` writes `/home/main/SwarmFund/_meta/lab-inbox/`. Each unit’s Cursor watches its own `wake.flag` and acts at once. The unit’s **app** only runs while someone is in that unit; the inbox still listens when the app is asleep.



## VPS

See `ops/vps.md`. Do not put passwords in this repo.
