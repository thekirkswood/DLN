# Cross-house communication (campus ↔ units)

How Ewan wants the Cursor instances to talk. Keep this when work spans Design Lab North and a unit house. Twin of ModYu `memory/cross-house-comms.md`.

## Plot identity (one login)

Hub is the book. Plots do not copy passwords.

| Call | Who | Result |
| --- | --- | --- |
| `GET /api/auth/plot?plot={slug}` with `dln_session` | plot server | `{ ok, role: studio\|observer, email, displayName }` or 401/403 |
| `POST /api/auth/plot` `{ plot, email, password }` | plot login form | same body; no second account |
| `GET /api/auth/plot-enter?plot=` | browser from `/account` | 302 onto the host (cookie already on `*.designlabnorth.com`) |
| Gate `X-DLN-Role` | Caddy copy_headers | `studio` / `observer` on hard-gated copies |

Studio (`build@`, `design@`) = **admin** on the host. Bound client = **observer** (site + suggestions). Patient/clinic books stay the plot’s. Do not mint staff rows for Ewan and Dave.

Campus landed the ModYu consumer in `hub-studio.ts` (2026-08-25) because unify-login is the hub contract. PFP public hosts stay Building. The gated workshop (`paulfosbury.designlabnorth.com`) is Caddy `forward_auth` `plot=pfp`: studio admin, Paul observer.

## Shape


| Place | Folder | Local | Inbox | Whose Cursor |
| --- | --- | --- | --- | --- |
| Campus (this house) | `/home/main/DLN` | `:3010` | `_meta/lab-inbox/` | **This** Design Lab North chat |
| ModYu unit | `/home/main/ModYu` | `:3000` under `/go/modyu` when framed | `_meta/designer-inbox/` | ModYu chat |
| Paul Fosbury Portraits | `/home/main/PFP` | `:3030` under `/go/pfp` when framed | `_meta/lab-inbox/` | PFP chat |
| Dave Kirkwood | `/home/main/DKS` | `:3040` under `/go/dks` when framed | `_meta/lab-inbox/` | DKS chat |
| Digital Adoption Advisor | `/home/main/DAA` | `:3050` under `/go/daa` when framed | `_meta/lab-inbox/` | DAA chat |
| Various Titles | `/home/main/VariousTitles` | `:3020` | `_meta/lab-inbox/` | VT chat |
| Swarm | `/home/main/SwarmFund` | `:5173` | `_meta/lab-inbox/` | Swarm chat |

- Campus `/admin` → DLN inbox → DLN Cursor.
- `/lab/modyu/admin` and notes **inside ModYu** → ModYu designer inbox → ModYu Cursor.
- `/lab/pfp/admin` → PFP `_meta/lab-inbox/` → PFP Cursor.
- `/lab/dks/admin` → DKS `_meta/lab-inbox/` → DKS Cursor.
- `/lab/daa/admin` → DAA `_meta/lab-inbox/` → DAA Cursor. The 2 Sep 2026 live `plot-daa` push exception is **closed**. Ewan numbered ships (or a named bugfix), then stop.
- `/lab/various-titles/admin` → VT `_meta/lab-inbox/` → VT Cursor.
- `/lab/swarm/admin` → Swarm `_meta/lab-inbox/` → Swarm Cursor.
- Unit apps run while occupied; inboxes still listen when the app sleeps.
- Send is a file drop (`wake.flag`). Campus sniff runs while studio is signed in (`ops/sniff-inbox.sh`). A unit note waits for that unit’s Cursor sniffer, which **pulls** the downstairs inbox first. Audit: [`memory/audit-campus.md`](audit-campus.md). Machines and seats: [`memory/compass.md`](compass.md). Dave and Ewan talk to the same files through Cursor Remote SSH on the downstairs Debian host (`ops/cursor-remote-ssh.md`). GPU seats are optional workers, not the source of truth. Ewan’s tower and laptop cycle work when both are answering. Later dispatcher: `memory/phase-d-later.md`.

## Routing rule

If the request is ModYu product, shop, accounts, ops, designer desk, or “start ModYu” — **ModYu’s folder Cursor**. Do not implement ModYu source in this chat. Campus may hold/start the framed unit (`/lab/modyu`). Write ModYu’s inbox + `wake.flag` if the note arrived here by mistake.

Same for Various Titles, Swarm, PFP, DKS, and DAA: point at that station, write that folder’s inbox, do not stamp that unit’s pending queue as campus.

## Message received from ModYu (2026-08-18)

ModYu Cursor queued note `6ec8202d-5580-4220-ad54-f4cfe8665b3e` on this campus inbox so this instance learns the same map. Dual post: same protocol in both chats.
