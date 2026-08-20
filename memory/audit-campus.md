# Campus audit — Send, frames, Debian host

Written 2026-08-19 so this is not only in chat. Pointer from `memory/cross-house-comms.md`.

## What was broken (this PC)

The campus hub is Next on `:3010`. Units are separate folders, framed at `/go/{slug}`. That shape is right. Three defects made it feel like nothing worked.

### 1. Send looks dead

The foot box only appears for studio on a lab host. POST `/api/lab/messages` needs a studio cookie (`dln_session`). Failures used to show as a one-line “didn’t take”, or nothing if the request hung. A **200 write queues the note**. Campus sniff takes it while studio is signed in. A unit note waits for that unit’s Cursor sniffer.

Honest copy now: queued, waiting for that house’s Cursor. HTTP status is shown. 401 sends you to sign in.

### 2. ModYu / Various Titles / Swarm looked corrupt in the frame

The station iframes `/go/{slug}`. If a unit was already on its port **without** `BASE_PATH=/go/{slug}` (or `VITE_BASE` for Swarm), start was skipped because the port was busy. `httpUp` treated any status under 500 as ready, so a 404 still counted as “up”. The frame then loaded the wrong HTML.

Campus fix: 404 is not ready; respawn with the lab prefix; rewrite `/_next` and Vite `/@` roots through the proxy. Product copy and image linking inside ModYu stay **ModYu Cursor** work.

### 3. Overnight “crash”

Twice `:3010` was simply not running (`ERR_CONNECTION_REFUSED`). Occupancy is meant to sleep **units**, never the hub (`killPort` skips 3010). Most likely: this desktop slept, or `next dev` died and nothing restarted it. There was no systemd unit.

Fix on this PC: `ops/campus.service` (`Restart=always`) + `ops/never-sleep.sh` until Debian takes over.

## Target shape (home, not Fasthosts)

| Machine | Role |
|---|---|
| Headless Debian downstairs (ethernet, 1TB, no GPU) | Always-on **campus host**. Sites, git, inboxes. Wipe Chooz on it after a recoverable copy. |
| Tower (2070 Super) | Ewan’s **primary** Cursor seat. Remote SSH into Debian. GPU stays here. |
| Laptop (3060) | Ewan’s **secondary** seat. Same SSH remote. Not only when the tower is off — see [`memory/compass.md`](compass.md). |
| Dave’s PC on the LAN | Dave’s Cursor, Remote SSH into the **same** Debian tree. Separate windows per house. Not in Ewan’s round-robin. |

When GPU machines are off, Debian still serves the sites. Cursor work only happens when someone has Cursor open, SSH’d in. Ewan’s tower and laptop **share** work when both are already answering (round-robin, with high weight+tokens and the head of the queue on the tower). Policy: [`memory/compass.md`](compass.md).

Do not reuse Chooz’s Ollama mesh as the DLN host. **A.P.E.S.** lives on Swarm (`SwarmFund/brain/memory/04-apes-framework.md`), not in Chooz.

## Runbooks

- Stay up on this PC: `ops/lab.md`, `ops/enable-campus-user.sh`, `ops/never-sleep.sh`
- Debian host: `ops/debian-host.md`, `ops/backup-chooz-then-wipe.md`, `ops/sync-to-debian.sh`
- Dave and Ewan in Cursor: `ops/cursor-remote-ssh.md`
- Machines and seat dispatch: `memory/compass.md`

## Phase D — later (do not load into the move)

- Paid GPU box: Choozlist + APES as the shared brain; DLN stays the website-building campus.
- Web Send as a true dispatcher only after SSH is normal and notes still need to land when nobody is in Cursor. When it exists, it honours [`memory/compass.md`](compass.md): cycle tower/laptop while both are answering; head of queue and high weight+tokens to the tower; oversized jobs wait for the tower if the laptop cannot hold them.

## Status 2026-08-20 — overnight “down” (Debian was not asleep)

The downstairs laptop **did not sleep**. Linger yes. Sleep targets masked. `campus.service` **NRestarts=0** from Wed 18:41 through Thu morning. `:3010` was still bound.

What failed was the **kind of server**. LAN campus was `next dev`. Every rsync from the tower recompiled mid-edit. Overnight the live tab hit a Fast Refresh overlay (`HOME_MODULES` missing, `map` of undefined). That looks like the site is dead while the process is still up. A leftover Design tab also polled `/api/diary` every 20s.

Fix (not a bounce): Debian campus is **production** `next start` on `:3010`. Rebuild on push (`ops/debian-rebuild-campus.sh`). Watch timer hits `/api/health` every minute and restarts after three misses. `StartLimitIntervalSec=0` so systemd cannot give up after five crashes. This Cursor disk stays `next dev` on localhost.

## Status 2026-08-19

- Phase A code is on this campus: Send honesty, prefix occupancy, proxy rewrite, systemd unit files.
- Houses copied to ChoozBoost. Studio on NVMe `/home/main`. Clients on 1TB `/srv/clients` (ModYu). Campus **http://192.168.0.223:3010**. Units pinned. 3060 Windows not on the LAN yet — OpenSSH needed (`ops/windows-3060.md`).
