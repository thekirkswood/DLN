# Phase D — later (not this move)

Standing. Do not build these while Debian is becoming the campus host.

## GPU server

A paid GPU box (not the downstairs Debian, not the 2070 as the source of truth). Choozlist brain and APES as a model live there. DLN stays the website-building campus.

APES: `/home/main/SwarmFund/brain/memory/04-apes-framework.md` and `packages/apes`. Not Chooz’s Ollama mesh.

## Note → agent dispatcher

Web Send writes `_meta/*/messages.json` + `wake.flag`. That only runs a bot if a Cursor chat for that folder is already open. Cursor Remote SSH is the honest way Dave and Ewan talk to the files (`ops/cursor-remote-ssh.md`).

A real queue worker that opens an agent when nobody is in Cursor waits until SSH is normal and notes still need to land unattended. Do not pretend the foot box is that worker.

When that worker exists, **seat** pick follows [`memory/compass.md`](compass.md):

- Live seats already answering → cycle tower / laptop / tower / laptop.
- Head of the queue → tower.
- High weight **and** high tokens → tower.
- Oversized for the 3060 → tower, or wait if the tower is off.
- Only one Ewan seat live → that seat takes what it can; oversized still waits for the tower.
- Dave is not in Ewan’s cycle.

Campus cannot see Cursor’s token meter today. Weight and token estimates are inputs the dispatcher must be given (message size, kind, later an explicit priority), not invented from the web box.
