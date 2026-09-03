#!/usr/bin/env bash
# Pull or push one unit inbox between this disk and Debian. Merge by id.
#   ops/sync-unit-inbox.sh pull daa
#   ops/sync-unit-inbox.sh push modyu
set -euo pipefail
ACTION="${1:-}"
HOUSE="${2:-}"
ROOT="${DLN_ROOT:-/home/main/DLN}"
DEBIAN="${DEBIAN:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=4 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
MERGE="$ROOT/ops/merge-lab-inbox.py"

unit_dir() {
  case "$1" in
    modyu) echo "/home/main/ModYu/_meta/designer-inbox" ;;
    various-titles) echo "/home/main/VariousTitles/_meta/lab-inbox" ;;
    swarm) echo "/home/main/SwarmFund/_meta/lab-inbox" ;;
    pfp) echo "/home/main/PFP/_meta/lab-inbox" ;;
    dks) echo "/home/main/DKS/_meta/lab-inbox" ;;
    daa) echo "/home/main/DAA/_meta/lab-inbox" ;;
    *) return 1 ;;
  esac
}

if [ "$ACTION" != pull ] && [ "$ACTION" != push ]; then
  echo "usage: $0 pull|push <house>" >&2
  exit 2
fi
DIR="$(unit_dir "$HOUSE")" || {
  echo "unknown house: $HOUSE" >&2
  exit 2
}
LAN="$ROOT/_meta/lab-houses/lan-$HOUSE-inbox"
mkdir -p "$DIR" "$LAN"

if [ "$ACTION" = pull ]; then
  rsync -aH -e "ssh ${SSH_OPTS[*]}" "$DEBIAN:$DIR/" "$LAN/" 2>/dev/null || true
  rsync -aH -e "ssh ${SSH_OPTS[*]}" \
    --exclude messages.json --exclude wake.flag \
    "$DEBIAN:$DIR/" "$DIR/" 2>/dev/null || true
  if [ -f "$MERGE" ]; then
    python3 "$MERGE" "$LAN/messages.json" "$DIR/messages.json" 2>/dev/null || true
    python3 "$MERGE" "$DIR/messages.json" "$LAN/messages.json" 2>/dev/null || true
  fi
  exit 0
fi

if [ -f "$MERGE" ] && [ -f "$LAN/messages.json" ]; then
  python3 "$MERGE" "$DIR/messages.json" "$LAN/messages.json" 2>/dev/null || true
fi
rsync -aH -e "ssh ${SSH_OPTS[*]}" \
  --exclude wake.flag \
  "$DIR/" "$DEBIAN:$DIR/" 2>/dev/null || true
