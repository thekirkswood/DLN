#!/usr/bin/env python3
"""Union two lab inboxes by id. Never drop a row that only exists on dest."""
from __future__ import annotations

import json
import sys
from pathlib import Path

RANK = {"pending": 0, "working": 1, "done": 2, "error": 2}


def load(path: Path) -> list:
    try:
        rows = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return []
    return rows if isinstance(rows, list) else []


def prefer(a: dict, b: dict) -> dict:
    ra, rb = RANK.get(a.get("status") or "", 0), RANK.get(b.get("status") or "", 0)
    if ra != rb:
        return a if ra > rb else b
    ta, tb = a.get("repliedAt") or "", b.get("repliedAt") or ""
    if ta != tb:
        return a if ta > tb else b
    return b if (b.get("reply") and not a.get("reply")) else a


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: merge-lab-inbox.py incoming.json dest.json", file=sys.stderr)
        return 2
    incoming, dest = Path(sys.argv[1]), Path(sys.argv[2])
    dest.parent.mkdir(parents=True, exist_ok=True)
    by_id: dict[str, dict] = {}
    order: list[str] = []
    for row in load(dest) + load(incoming):
        if not isinstance(row, dict) or not row.get("id"):
            continue
        i = str(row["id"])
        if i not in by_id:
            by_id[i] = row
            order.append(i)
        else:
            by_id[i] = prefer(by_id[i], row)
    dest.write_text(json.dumps([by_id[i] for i in order], indent=2) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
