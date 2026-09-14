# Offline lab — Design Lab North Builder

**Who:** the Builder Cursor on `/home/main/Repos/Builder`.  
**Shape:** one always-on lab on **`:3100`**. Dave talks to each house from a DLN-bannered desk. The sniffer lives only here. Local DLN (`:3010`) is the same site as live `designlabnorth.com`.

Harmony: do not overwrite the live VPS, live Caddy, live plot containers, or working logins. Local is the editor. Live is the upload.

## What this is

We stop editing through campus `/admin` and `/lab/{slug}/admin`. Those surfaces are gone. The lab is this repo.

Two processes stay up:

1. **Design Lab North** — `:3010`, the public site. Same offline and online.
2. **This lab** — `:3100`, always here. House rail. ModYu-style queue. One sniffer.

Login is the Design Lab North book. Cookie `dln_session`. Dave and Ewan. Chooseless is not in this rail.

Dave’s bookmark: **http://builder.dln.local** (backup `http://192.168.0.223:3100`). The lab process runs on Debian. This GPU Cursor sniffs downstairs inboxes and applies edits back with `ops/apply-house.sh`. Arm sniff: keep `ops/sniff-inbox.sh` running in this chat; `ops/enable-sniff-user.sh` is the log backup.

## Houses

| Section | Folder | Inbox | Named | Port |
|---|---|---|---|---|
| Design Lab North | `/home/main/DLN` | `_meta/lab-inbox` | dln.local | `:3010` |
| ModYu | `/home/main/ModYu` | `_meta/designer-inbox` | modyu.dln.local | `:3000` |
| Various Titles | `/home/main/VariousTitles` | `_meta/lab-inbox` | titles.dln.local | `:3020` |
| Swarm Fund | `/home/main/SwarmFund` | `_meta/lab-inbox` | swarm.dln.local | `:5173` |
| Paul Fosbury Portraits | `/home/main/PFP` | `_meta/lab-inbox` | pfp.dln.local | `:3030` |
| Dave Kirkwood Studio | `/home/main/DKS` | `_meta/lab-inbox` | dks.dln.local | `:3040` |
| DAA | `/home/main/DAA` | `_meta/lab-inbox` | daa.dln.local | `:3050` |

Registry: `/home/main/Repos/Builder/houses.json`. Greenhouse `plots.json` stays public product copy.

## Agent loop (Builder Cursor)

Keep `ops/sniff-inbox.sh` running in the Builder chat. On `AGENT_LOOP_WAKE_builder`:

1. Jump to that house folder.
2. Take every `pending` item in order. Honour that house’s `AGENTS.md`.
3. Stamp the same ids. Do not auto-deploy. Do not stamp another house.
4. Return to `/home/main/Repos/Builder`.

ModYu ops (`/admin` for Anne Marie) stays on ModYu. The design queue is `http://builder.dln.local/modyu` (backup `:3100/modyu`).
