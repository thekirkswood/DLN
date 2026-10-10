#!/usr/bin/env bash
# Per-house: ops/sniff-inbox.sh daa|pfp|modyu
# No arg: Builder all-house sniffer.
set -u
if [ -z "${1:-}" ]; then
  echo "retired: use /home/main/Repos/Builder/ops/sniff-inbox.sh" >&2
  exec /home/main/Repos/Builder/ops/sniff-inbox.sh
fi

HOUSE="$1"
HOUSES="${BUILDER_HOUSES:-/home/main/Repos/Builder/houses.json}"
DEBIAN="${DEBIAN_SNIFF:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=4 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
MERGE="/home/main/Repos/Builder/ops/merge-lab-inbox.py"
LAN="/home/main/Repos/Builder/_meta/lan-inboxes"

eval "$(python3 - "$HOUSES" "$HOUSE" <<'PY'
import json, sys, shlex
from pathlib import Path
houses = json.loads(Path(sys.argv[1]).read_text())
slug = sys.argv[2]
hit = next((h for h in houses if h["slug"] == slug), None)
if not hit:
    raise SystemExit(f"unknown house: {slug}")
inbox = Path(hit["housePath"]) / hit["inboxRel"]
print(f"INBOX={shlex.quote(str(inbox))}")
print(f"WAKE={shlex.quote(str(inbox / 'wake.flag'))}")
print(f"MSG={shlex.quote(str(inbox / 'messages.json'))}")
PY
)"

pending_count() {
  python3 -c '
import json, sys
from pathlib import Path
n = 0
try:
    rows = json.loads(Path(sys.argv[1]).read_text())
except Exception:
    rows = []
if isinstance(rows, list):
    n = sum(1 for m in rows if isinstance(m, dict) and m.get("status") == "pending")
print(n)
' "$1"
}

pull_house() {
  mkdir -p "$LAN/$HOUSE" "$INBOX"
  rsync -aH -e "ssh ${SSH_OPTS[*]}" \
    "$DEBIAN:$INBOX/" "$LAN/$HOUSE/" 2>/dev/null || return 0
  rsync -aH -e "ssh ${SSH_OPTS[*]}" \
    --exclude messages.json --exclude wake.flag \
    "$DEBIAN:$INBOX/" "$INBOX/" 2>/dev/null || true
  if [ -f "$MERGE" ] && [ -f "$LAN/$HOUSE/messages.json" ]; then
    python3 "$MERGE" "$LAN/$HOUSE/messages.json" "$MSG" 2>/dev/null || true
    python3 "$MERGE" "$MSG" "$LAN/$HOUSE/messages.json" 2>/dev/null || true
  fi
}

wake_line() {
  printf 'AGENT_LOOP_WAKE_%s_inbox\n' "$HOUSE"
}

mkdir -p "$INBOX" 2>/dev/null || true
[ -f "$WAKE" ] || touch "$WAKE" 2>/dev/null || true

echo "sniff $HOUSE inbox=$INBOX debian=$DEBIAN"
pull_house
LAST_LOCAL=$(stat -c %Y "$WAKE" 2>/dev/null || echo 0)
LAST_REMOTE=$(ssh "${SSH_OPTS[@]}" "$DEBIAN" "stat -c %Y $WAKE" 2>/dev/null || echo 0)
if [ "$(pending_count "$MSG")" -gt 0 ]; then
  wake_line
fi

while true; do
  localw=$(stat -c %Y "$WAKE" 2>/dev/null || echo 0)
  if [ -n "$localw" ] && [ "$localw" != "$LAST_LOCAL" ]; then
    wake_line
    LAST_LOCAL=$localw
  fi
  remote=$(ssh "${SSH_OPTS[@]}" "$DEBIAN" "stat -c %Y $WAKE" 2>/dev/null || echo "")
  if [ -n "$remote" ] && [ "$remote" != "$LAST_REMOTE" ]; then
    pull_house
    wake_line
    LAST_REMOTE=$remote
    LAST_LOCAL=$(stat -c %Y "$WAKE" 2>/dev/null || echo 0)
  fi
  sleep 5
done
