# Cross-house communication (campus ↔ units)

How Ewan wants the Cursor instances to talk. Keep this when work spans Design Lab North and a unit house. Twin of ModYu `memory/cross-house-comms.md`.

## Shape

| Place | Folder | Local | Inbox | Whose Cursor |
| --- | --- | --- | --- | --- |
| Campus (this house) | `/home/main/DLN` | `:3010` | `_meta/lab-inbox/` | **This** Design Lab North chat |
| ModYu unit | `/home/main/ModYu` | `:3000` under `/go/modyu` when framed | `_meta/designer-inbox/` | ModYu chat |
| Various Titles | `/home/main/VariousTitles` | `:3020` | `_meta/lab-inbox/` | VT chat |
| Swarm | `/home/main/SwarmFund` | `:5173` | `_meta/lab-inbox/` | Swarm chat |

- Campus `/admin` → DLN inbox → DLN Cursor.
- `/lab/modyu/admin` and notes **inside ModYu** → ModYu designer inbox → ModYu Cursor.
- `/lab/various-titles/admin` → VT `_meta/lab-inbox/` → VT Cursor.
- `/lab/swarm/admin` → Swarm `_meta/lab-inbox/` → Swarm Cursor.
- Unit apps run while occupied; inboxes still listen when the app sleeps.

## Routing rule

If the request is ModYu product, shop, accounts, ops, designer desk, or “start ModYu” — **ModYu’s folder Cursor**. Do not implement ModYu source in this chat. Campus may hold/start the framed unit (`/lab/modyu`). Write ModYu’s inbox + `wake.flag` if the note arrived here by mistake.

Same for Various Titles and Swarm: point at that station, write that folder’s inbox, do not stamp that unit’s pending queue as campus.

## Message received from ModYu (2026-08-18)

ModYu Cursor queued note `6ec8202d-5580-4220-ad54-f4cfe8665b3e` on this campus inbox so this instance learns the same map. Dual post: same protocol in both chats.
