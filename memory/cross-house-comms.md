# Cross-house communication (lab ↔ houses)

How Ewan wants the Cursor instances to talk. Twin of ModYu `memory/cross-house-comms.md`.

## Shape

The **lab** is `/home/main/Repos/Builder` on `:3100`. One sniffer. Dave picks a house. That house’s inbox + `wake.flag` fire. The Builder Cursor jumps to that folder.

| Place | Folder | Local | Inbox | Whose Cursor |
| --- | --- | --- | --- | --- |
| Lab | `/home/main/Repos/Builder` | `:3100` | (watches all) | **Builder** chat |
| Design Lab North | `/home/main/DLN` | `:3010` | `_meta/lab-inbox/` | Builder jumps here |
| ModYu | `/home/main/ModYu` | `:3000` | `_meta/designer-inbox/` | Builder jumps here |
| Paul Fosbury Portraits | `/home/main/PFP` | `:3030` | `_meta/lab-inbox/` | Builder jumps here |
| Various Titles | `/home/main/VariousTitles` | `:3020` | `_meta/lab-inbox/` | Builder jumps here |
| Swarm | `/home/main/SwarmFund` | `:5173` | `_meta/lab-inbox/` | Builder jumps here |
| Dave Kirkwood Studio | `/home/main/DKS` | `:3040` | `_meta/lab-inbox/` | Builder jumps here |
| DAA | `/home/main/DAA` | `:3050` | `_meta/lab-inbox/` | Builder jumps here |

Chooseless is not on this lab.

Send is a file drop (`wake.flag`). Only Builder sniffs (`Repos/Builder/ops/sniff-inbox.sh`). Do not stamp another house’s pending queue.

## Routing rule

If the request is a house’s product, shop, accounts, or “start that house” — **that house’s filesystem**. Do not implement ModYu source while sitting in DLN, or Swarm source while sitting in VT. Jump, then work.
