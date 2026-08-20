# Attention to memory — Design Lab North

**Trigger:** “Okay attention to memory” (and close variants).  
**Always-on:** every agent turn in this repo. These files are holy. Build, do not subtract.

## Load order (earliest → latest)

1. `memory/identity.md`
2. `memory/brand.md`
3. `memory/BLUEPRINT.md`
4. `memory/greenhouse.md`
5. `memory/cross-house-comms.md` (campus vs unit Cursors — who owns which queue)
6. `memory/compass.md` (which machine is home; tower vs laptop seats)
7. `memory/DIRECTIONS.md`
8. `memory/WORKSTREAM.md` (open sequenced hub work)
9. `memory/CHANGELOG.jsonl` (tail — last ~40 lines is enough unless auditing)
10. `AGENTS.md` + `.cursor/rules/*.mdc`
11. Campus vital (outside every repo): `/home/main/_meta/LTM-vital.md` → `/home/main/_meta/github-repos.md` → `/home/main/_meta/github-ops.env` (existence + non-empty `GH_TOKEN=`, never print the value). This Cursor owns `thekirkswood/DLN` only.

## Write rules

| Event | Where |
|---|---|
| Major architecture, new function, IA change | `BLUEPRINT.md` then changelog `k:bp` |
| Machines / GPU seats / home host | `compass.md` + `BLUEPRINT.md` then changelog |
| Standing / small direction | `DIRECTIONS.md` then changelog `k:dir` |
| Any file add / mod / delete | `CHANGELOG.jsonl` (`k:add\|mod\|del`) |
| Plot added / status change | `greenhouse.md` + `greenhouse/plots.json` + changelog |
| Brand / voice lock | `brand.md` — never invent marks or colours |
| GitHub upload / new site version | Bump `memory/ITERATION`, append `memory/iterations.jsonl`, tag `dln-{n}`, changelog `k:ver` |

## Changelog line (jsonl, agent-dense, not for humans)

```
{"t":"ISO8601","k":"add|mod|del|dir|bp|mem|ver","p":"path-or-scope","s":"1-line","d":"why"}
```

- Append only. Never rewrite history.
- `s` = enough for a future agent to know what moved. No essays.
- Deletions must log `p` + what was removed. Empty `d` is a defect.

## Shape of the work

A named function is built to the shape it implies. Billing means line items, a service, a price, who issues, who pays, a document, and what happens if it is not paid. A login means a way in and a room behind it. A product listing means a story and a path to the product. Stubs that only prove a path exists are a defect. Read this file first every turn, then identity → brand → BLUEPRINT → greenhouse → DIRECTIONS → WORKSTREAM → changelog tail. Do not invent brand facts.

## Harmony law

Do not overwrite working behaviour to make a new thing fit. Extend. If a collision exists, stop, log, ask. Treat live plots as client property.
