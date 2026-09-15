#!/usr/bin/env bash
# Compare live designlabnorth.com /api/health with downstairs ITERATION.
# Writes _meta/ship/hotfix-eval.json. Does not ship unless SHIP=1.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOME_N="$(tr -d '[:space:]' < "$ROOT/memory/ITERATION")"
LIVE_JSON="$(curl -fsS --max-time 8 https://designlabnorth.com/api/health || echo '{}')"
LIVE_N="$(python3 -c 'import json,sys; d=json.loads(sys.argv[1] or "{}"); print(d.get("iteration") or "")' "$LIVE_JSON")"
LIVE_TAG="$(python3 -c 'import json,sys; d=json.loads(sys.argv[1] or "{}"); print(d.get("tag") or "")' "$LIVE_JSON")"
NOW="$(date +%Y-%m-%dT%H:%M:%S%:z)"
mkdir -p "$ROOT/_meta/ship"
python3 - "$ROOT/_meta/ship/hotfix-eval.json" "$NOW" "$HOME_N" "$LIVE_N" "$LIVE_TAG" <<'PY'
import json, sys
path, now, home, live, tag = sys.argv[1:6]
out = {
  "at": now,
  "homeIteration": int(home) if str(home).isdigit() else None,
  "liveIteration": int(live) if str(live).isdigit() else None,
  "liveTag": tag or None,
  "behind": (str(home).isdigit() and str(live).isdigit() and int(home) != int(live)),
}
open(path, "w").write(json.dumps(out, indent=2) + "\n")
print(json.dumps(out))
PY
if [[ "${SHIP:-}" == "1" ]]; then
  CONFIRM="${CONFIRM:-hotfix}" KIND=hotfix "$ROOT/ops/ship-live.sh"
fi
