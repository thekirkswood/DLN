#!/usr/bin/env bash
# Stop the LAN campus, build a good tree, start production. Watch skips while locked.
set -euo pipefail
ROOT=/home/main/DLN
SITE="$ROOT/Site"
LOCK="$ROOT/_meta/lab-houses/campus-rebuild.lock"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
mkdir -p "$(dirname "$LOCK")" "$UNIT_DIR"
cp "$ROOT/ops/debian-campus.service" "$UNIT_DIR/campus.service"
systemctl --user daemon-reload
printf '%s %s\n' "$$" "$(date -Iseconds)" >"$LOCK"
cleanup() { rm -f "$LOCK"; }
trap cleanup EXIT
cd "$SITE"
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
systemctl --user stop campus.service || true
/usr/bin/npm run build
systemctl --user start campus.service
ok=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  if curl -sf --max-time 2 http://127.0.0.1:3010/api/health >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo "campus started but /api/health did not answer yet" >&2
  exit 1
fi
