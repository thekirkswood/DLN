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

http://localhost:3010 — Ewan’s tower (not on the LAN). Dave: **http://dln.local** (backup `http://192.168.0.223:3010`). Greenhouse at `/greenhouse`, login at `/login`. The lab is a separate always-on app: `/home/main/Repos/Builder` on **`:3100`** / **http://builder.dln.local**. How to run the lab: that repo’s `AGENTS.md`. Named hosts: `ops/named-studio.md`. Debian: `ops/debian-host.md`.

## Accounts

`_meta/accounts/` (gitignored). Cookie `dln_session`. Seed file `_meta/accounts/SEED.txt` after first boot. Studio logins are `@designlabnorth.com` (Ewan owner, Dave Kirkwood studio).

## Wake (this house)

The design queue for DLN is the lab at `/home/main/Repos/Builder` (`http://localhost:3100/dln`). That Cursor sniffs `_meta/lab-inbox/wake.flag` and jumps here.

When this chat is asked to take pending items: open `_meta/lab-inbox/messages.json`. If `_meta/edit-lease.json` is held by another seat, **stop** ([`ops/house-lease.md`](ops/house-lease.md)). Take every `pending` item **in order**. Set `working`, do the work in **this** filesystem (`/home/main/DLN`). Honour memory. Stamp `done` or `error` with a `reply`. Kind `hotfix` then `ship` are the numbered live path: `ops/hotfix-eval.sh` then `ops/ship-live.sh` (confirm already in `_meta/ship/request.json`). Ordinary change / plan / note must not deploy. One failure does not block the rest.

Do not run a sniffer in this chat. The lab sniffer is `/home/main/Repos/Builder/ops/sniff-inbox.sh`. Do not stamp another house’s pending queue.



## VPS

See `ops/vps.md`. Do not put passwords in this repo.
