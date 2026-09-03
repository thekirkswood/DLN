#!/usr/bin/env bash
# Console wait for a house inbox — same shape ModYu used before the hub.
# Arm from that house's Cursor.
#
# Campus (dln): browser notes live downstairs. This PC's localhost inbox is separate.
#   ops/sniff-inbox.sh
# Units:
#   ops/sniff-inbox.sh modyu | various-titles | swarm | pfp | dks | daa
# Unit sniff pulls the downstairs inbox (Dave/LAN) then wakes this chat.
set -u
HOUSE="${1:-dln}"
ROOT="${DLN_ROOT:-/home/main/DLN}"
DEBIAN_SNIFF="${DEBIAN_SNIFF:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=4 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
MERGE="$ROOT/ops/merge-lab-inbox.py"
PUSH="$ROOT/ops/push-lab-inbox.sh"
SYNC_UNIT="$ROOT/ops/sync-unit-inbox.sh"
LAN_INBOX="$ROOT/_meta/lab-houses/lan-inbox"
LOCAL_INBOX="$ROOT/_meta/lab-inbox"
case "$HOUSE" in
  dln) INBOX="$ROOT/_meta/lab-inbox/wake.flag" ;;
  modyu) INBOX="/home/main/ModYu/_meta/designer-inbox/wake.flag" ;;
  various-titles) INBOX="/home/main/VariousTitles/_meta/lab-inbox/wake.flag" ;;
  swarm) INBOX="/home/main/SwarmFund/_meta/lab-inbox/wake.flag" ;;
  pfp) INBOX="/home/main/PFP/_meta/lab-inbox/wake.flag" ;;
  dks) INBOX="/home/main/DKS/_meta/lab-inbox/wake.flag" ;;
  daa) INBOX="/home/main/DAA/_meta/lab-inbox/wake.flag" ;;
  *)
    echo "unknown house: $HOUSE" >&2
    exit 1
    ;;
esac
PRESENCE="$ROOT/_meta/lab-houses/studio-presence.json"
SNIFF="$ROOT/_meta/lab-houses/sniff.flag"
WANT="$ROOT/_meta/lab-houses/want-sniff-$HOUSE"
mkdir -p "$(dirname "$INBOX")" "$ROOT/_meta/lab-houses" "$LAN_INBOX"
[ -f "$INBOX" ] || touch "$INBOX" 2>/dev/null || true
[ -f "$SNIFF" ] || touch "$SNIFF" 2>/dev/null || true
[ -f "$PRESENCE" ] || echo '{"seats":{}}' > "$PRESENCE"
touch "$WANT" 2>/dev/null || true

prompt_for() {
  local why="$1"
  if [ "$HOUSE" = dln ]; then
    printf 'AGENT_LOOP_WAKE_dln_inbox {"prompt":"Campus sniff (%s). Browser notes (Mac, phones, LAN IP) are downstairs: read _meta/lab-houses/lan-inbox then stamp the same ids on Debian. localhost:3010 writes this disk then pushes to Debian. Merge inboxes by id — never overwrite a local-only note. If nobody is signed in and nothing is working, idle. Do not stamp another unit queue."}\n' "$why"
  else
    printf 'AGENT_LOOP_WAKE_%s_inbox {"prompt":"Unit sniff %s (%s). Pull the downstairs inbox first (ops/sync-unit-inbox.sh pull). Take every pending item in this house inbox in order. Stay in this filesystem. Push stamps downstairs. Do not auto-deploy."}\n' "$HOUSE" "$HOUSE" "$why"
  fi
}

pull_lan() {
  rsync -aH -e "ssh ${SSH_OPTS[*]}" \
    "$DEBIAN_SNIFF:/home/main/DLN/_meta/lab-inbox/" "$LAN_INBOX/" 2>/dev/null || true
  rsync -aH -e "ssh ${SSH_OPTS[*]}" \
    --exclude messages.json --exclude wake.flag \
    "$DEBIAN_SNIFF:/home/main/DLN/_meta/lab-inbox/" "$LOCAL_INBOX/" 2>/dev/null || true
  if [ -f "$MERGE" ]; then
    python3 "$MERGE" "$LAN_INBOX/messages.json" "$LOCAL_INBOX/messages.json" 2>/dev/null || true
    python3 "$MERGE" "$LOCAL_INBOX/messages.json" "$LAN_INBOX/messages.json" 2>/dev/null || true
  fi
}

pending_count() {
  python3 -c '
import json, sys
from pathlib import Path
n = 0
for p in sys.argv[1:]:
    try:
        rows = json.loads(Path(p).read_text())
    except Exception:
        continue
    if not isinstance(rows, list):
        continue
    n += sum(1 for m in rows if isinstance(m, dict) and m.get("status") == "pending")
print(n)
' "$@"
}

echo "sniff $HOUSE inbox=$INBOX lan=$DEBIAN_SNIFF"

if [ "$HOUSE" = dln ]; then
  pull_lan
  LAST_DEBIAN_WAKE=$(ssh "${SSH_OPTS[@]}" "$DEBIAN_SNIFF" "stat -c %Y /home/main/DLN/_meta/lab-inbox/wake.flag" 2>/dev/null || true)
  LAST_LOCAL_WAKE=$(stat -c %Y "$LOCAL_INBOX/wake.flag" 2>/dev/null || true)
  # First-seen wake used to be ignored so a restart would not fire. That left
  # a Send sitting pending until the next note. If the queue is waiting, wake now.
  if [ "$(pending_count "$LAN_INBOX/messages.json" "$LOCAL_INBOX/messages.json")" -gt 0 ]; then
    prompt_for "pending"
  fi
  while true; do
    remote=$(ssh "${SSH_OPTS[@]}" "$DEBIAN_SNIFF" "stat -c %Y /home/main/DLN/_meta/lab-inbox/wake.flag" 2>/dev/null || true)
    if [ -n "$remote" ] && [ "$remote" != "$LAST_DEBIAN_WAKE" ]; then
      pull_lan
      prompt_for "debian"
      LAST_DEBIAN_WAKE=$remote
    fi
    localw=$(stat -c %Y "$LOCAL_INBOX/wake.flag" 2>/dev/null || true)
    if [ -n "$localw" ] && [ "$localw" != "$LAST_LOCAL_WAKE" ]; then
      "$PUSH" 2>/dev/null || true
      prompt_for "localhost"
      LAST_LOCAL_WAKE=$localw
    fi
    sleep 5
  done
fi

case "$HOUSE" in
  modyu) DEBIAN_UNIT_WAKE="/home/main/ModYu/_meta/designer-inbox/wake.flag" ;;
  various-titles) DEBIAN_UNIT_WAKE="/home/main/VariousTitles/_meta/lab-inbox/wake.flag" ;;
  swarm) DEBIAN_UNIT_WAKE="/home/main/SwarmFund/_meta/lab-inbox/wake.flag" ;;
  pfp) DEBIAN_UNIT_WAKE="/home/main/PFP/_meta/lab-inbox/wake.flag" ;;
  dks) DEBIAN_UNIT_WAKE="/home/main/DKS/_meta/lab-inbox/wake.flag" ;;
  daa) DEBIAN_UNIT_WAKE="/home/main/DAA/_meta/lab-inbox/wake.flag" ;;
  *) DEBIAN_UNIT_WAKE="" ;;
esac

echo "sniff $HOUSE unit inbox=$INBOX (Debian + this disk)"
"$SYNC_UNIT" pull "$HOUSE" 2>/dev/null || true
LAST_LOCAL_WAKE=$(stat -c %Y "$INBOX" 2>/dev/null || true)
LAST_DEBIAN_WAKE=$(ssh "${SSH_OPTS[@]}" "$DEBIAN_SNIFF" "stat -c %Y $DEBIAN_UNIT_WAKE" 2>/dev/null || true)
if [ "$(pending_count "$(dirname "$INBOX")/messages.json")" -gt 0 ]; then
  prompt_for "pending"
fi
while true; do
  if command -v inotifywait >/dev/null 2>&1; then
    ev=$(inotifywait -t 8 -e modify,close_write,create --format '%w%f' "$INBOX" 2>/dev/null || true)
    case "$ev" in
      *wake.flag*)
        "$SYNC_UNIT" push "$HOUSE" 2>/dev/null || true
        prompt_for "wake"
        LAST_LOCAL_WAKE=$(stat -c %Y "$INBOX" 2>/dev/null || true)
        ;;
    esac
  else
    sleep 8
    localw=$(stat -c %Y "$INBOX" 2>/dev/null || true)
    if [ -n "$localw" ] && [ "$localw" != "$LAST_LOCAL_WAKE" ]; then
      "$SYNC_UNIT" push "$HOUSE" 2>/dev/null || true
      prompt_for "wake"
      LAST_LOCAL_WAKE=$localw
    fi
  fi
  if [ -n "$DEBIAN_UNIT_WAKE" ]; then
    remote=$(ssh "${SSH_OPTS[@]}" "$DEBIAN_SNIFF" "stat -c %Y $DEBIAN_UNIT_WAKE" 2>/dev/null || true)
    if [ -n "$remote" ] && [ "$remote" != "$LAST_DEBIAN_WAKE" ]; then
      "$SYNC_UNIT" pull "$HOUSE" 2>/dev/null || true
      prompt_for "debian"
      LAST_DEBIAN_WAKE=$remote
      LAST_LOCAL_WAKE=$(stat -c %Y "$INBOX" 2>/dev/null || true)
    fi
  fi
done
