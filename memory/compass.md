# Compass — machines and seats

The downstairs laptop **holds the files and hosts the sites**. GPU PCs **edit**, then push, like GitHub → live. Looking at sites does not need a GPU. Building does.

Load with the rest of holy memory. Twin facts: [`audit-campus.md`](audit-campus.md), [`ops/debian-host.md`](../ops/debian-host.md), [`ops/house-lease.md`](../ops/house-lease.md).

## Map

| Place | What it is |
|---|---|
| Debian downstairs (ethernet) | **Always-on host + browser campus.** NVMe: studio houses. **1TB** `/srv/clients`: clients (ModYu). Sites and `/admin` for Mac/phones/LAN: `http://192.168.0.223:3010`. |

| Tower (2070 Super) | Ewan’s **primary Cursor**. Working copy. `localhost:3010` only (not on the LAN). GPU stays here. |
| Gaming laptop (3060) | Ewan’s **secondary Cursor** — processing. Same account. Can run closed (lid/inhibit) with Cursor still working. Working copy or Remote SSH into Debian. |
| Dave’s PC | Dave’s Cursor. Same git path. Not in Ewan’s round-robin. |
| Public VPS | Internet plots. Unchanged. |

The three disks (tower SSD, downstairs NVMe + 1TB, 3060) **backup each other** because every real change is a push to the centre, then a pull. Push: `ops/sync-to-debian.sh`. Pull: `ops/pull-from-debian.sh`. They are not three live writers on one file. Extra 1TB if fitted is more of the same store, not a second live writer.


## GitHub, but in the house

Same rhythm as Fasthosts:

1. Cursor edits the working copy on the tower or the 3060 (fast disk, local Cursor).
2. Push (GitHub, or a git remote on Debian).
3. Debian **pulls** and the sites on that box change.

Debian runs the ports. This PC is for Cursor and whatever else Ewan wants. Occupancy-sleep was to spare the 2070. On Debian the units **stay up**.

## Two Cursors at once

Cursor does **not** co-edit a buffer like a shared doc. Two agents writing the same file last-write-wins and will smash each other’s work.

What does work:

| Rule | Why |
|---|---|
| **One house, one writer** | Campus chat does not edit ModYu source. ModYu Cursor does not edit campus. Already [`cross-house-comms.md`](cross-house-comms.md). |
| **Lease** | Before a seat writes a house, it takes `_meta/edit-lease.json` in that house. The other seat sees it and waits or takes a different house. [`ops/house-lease.md`](../ops/house-lease.md). |
| **Git is the conversation** | Pull before work. Push when done. If both touched the same house, merge — do not force. |
| **Do not both Remote-SSH-write the live tree** | Live tree on Debian is for pull + serve. Editing fights belong on working copies + git. |

The 3060 can still be a closed worker: Cursor logged in, folder open (clone or SSH), watching that house’s `wake.flag`. It must honour the lease so it does not walk on a tower job in the same house.

## Seats when already answering

When **both** tower and 3060 are already running jobs, new work **cycles** (after the head-of-queue rule): tower, laptop, tower, laptop. Head of the queue, and high weight **and** high tokens, stay on the tower. Jobs too big for the 3060 wait for the tower. Dave is not in this cycle.

If a job needs a house the other seat already holds, it **waits or takes another house**. That is the communication. There is no Cursor setting that merges two live agents into one filesystem.

## Inference vs sites

Ollama/Chooz on Debian is a **different system** from the website campus. Sites sit on Node ports. Do not treat the host laptop as one brain that also routes into this chat.
