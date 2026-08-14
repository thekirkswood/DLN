# Design Lab North — agent notes

Parent studio site + greenhouse of Docker plots. Domain: designlabnorth.com.

## Read first

- [memory/protocol.md](memory/protocol.md)
- [memory/BLUEPRINT.md](memory/BLUEPRINT.md)
- [memory/DIRECTIONS.md](memory/DIRECTIONS.md)
- [memory/WORKSTREAM.md](memory/WORKSTREAM.md)
- [memory/greenhouse.md](memory/greenhouse.md)
- [memory/brand.md](memory/brand.md)
- [.cursor/rules/dln-memory.mdc](.cursor/rules/dln-memory.mdc)

## Run

```bash
cd Site && npm run dev
```

http://localhost:3010 — greenhouse at `/greenhouse`, login at `/login`. Port 3010 so it does not collide with ModYu on 3000.

## Accounts

`_meta/accounts/` (gitignored). Cookie `dln_session`. Seed file `_meta/accounts/SEED.txt` after first boot. Studio logins are `@designlabnorth.com` (Ewan owner, Dave Kirkwood studio).

## VPS

See `ops/vps.md`. Do not put passwords in this repo.
