#!/usr/bin/env bash
# If :3010 stops answering, restart the campus unit. Three misses, then bounce.
# Skip while a rebuild lock is held.
set -euo pipefail
ROOT=/home/main/DLN
LOCK="$ROOT/_meta/lab-houses/campus-rebuild.lock"
STATE="$ROOT/_meta/lab-houses/campus-watch.state"
mkdir -p "$(dirname "$STATE")"
if [ -f "$LOCK" ]; then
  exit 0
fi
if curl -sf --max-time 8 http://127.0.0.1:3010/api/health >/dev/null; then
  echo 0 >"$STATE"
  exit 0
fi
fails=0
if [ -f "$STATE" ]; then
  fails=$(tr -cd '0-9' <"$STATE" || true)
  fails=${fails:-0}
fi
fails=$((fails + 1))
echo "$fails" >"$STATE"
if [ "$fails" -ge 3 ]; then
  echo 0 >"$STATE"
  systemctl --user restart campus.service
fi
