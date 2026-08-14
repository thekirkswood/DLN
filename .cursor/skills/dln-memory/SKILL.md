---
name: dln-memory
description: Maintains Design Lab North holy long-term memory (BLUEPRINT, DIRECTIONS, CHANGELOG.jsonl, greenhouse). Use on every DLN turn that changes files or receives a direction; also when the user says attention to memory, blueprint, changelog, plot, greenhouse, or VPS.
---

# DLN memory

## End of every turn that touched the repo

1. Append one or more lines to `memory/CHANGELOG.jsonl`:
   `{"t":"ISO8601","k":"add|mod|del|dir|bp|mem","p":"path","s":"1-line","d":"why"}`
2. If architecture / new function / IA changed → edit `memory/BLUEPRINT.md` first.
3. If a standing instruction arrived → append dated bullet to `memory/DIRECTIONS.md`.
4. If a plot changed → `greenhouse/plots.json` and `memory/greenhouse.md`.
5. If sequenced hub work moved → `memory/WORKSTREAM.md`.

## Attention to memory

Read earliest → latest per `memory/protocol.md`. Do not invent brand facts. Confirm files exist. Then continue the user’s task.

## Forbidden

- Rewriting changelog history
- Secrets in memory
- Deleting without a `k:del` line
- Overwriting a working system to squeeze in a new one
