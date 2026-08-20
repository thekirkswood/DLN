# House edit lease

Two Cursor seats must not write the same house at once. Cursor has no shared-doc merge. This file is the agreement.

## File

In each house, gitignored or committed as empty template — **committed lease is the signal both clones can see after push**. Prefer a **pushed** lease so the other PC sees it:

`{house}/_meta/edit-lease.json`

```json
{
  "house": "dln",
  "seat": "tower",
  "host": "main-System-Product-Name",
  "since": "2026-08-19T12:00:00+01:00",
  "until": "2026-08-19T14:00:00+01:00",
  "job": "short why"
}
```

`seat` is `tower` | `3060` | `dave`. `house` is `dln` | `modyu` | `various-titles` | `swarm`.

## Take

1. `git pull`
2. If `edit-lease.json` exists and `until` is in the future and `seat` is not you → **stop**. Work another house, or wait.
3. If expired or yours, write the lease, commit, push.
4. Do the work in **that** filesystem only.
5. Clear the lease (delete or empty `seat`), commit, push.

If GitHub is unreachable, a lease on the Debian disk is second best — only if both seats can read it (SSH). Do not invent a live lock inside Cursor.

## Same house, two jobs

Wait. Or split: one seat on campus, one on ModYu. That is the usual split. Never force-push over the other seat.
