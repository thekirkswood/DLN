#!/usr/bin/env bash
# Bring the tower working copy in line with the downstairs host.
# Pair of ops/sync-to-debian.sh (push). Centre is Debian; this disk pulls.
#
#   ./ops/pull-from-debian.sh
#   ./ops/pull-from-debian.sh dln
#   DEBIAN=user@192.168.0.223 ./ops/pull-from-debian.sh
set -euo pipefail
DEBIAN="${DEBIAN:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
HOUSE_ROOT="${HOUSE_ROOT:-/home/main}"
ONLY="${1:-}"

RSYNC=(
  rsync -aH --info=stats1
  -e "ssh ${SSH_OPTS[*]}"
  --exclude node_modules
  --exclude .next
  --exclude dist
  --exclude '.git/objects/pack/*.tmp'
  --exclude _meta/accounts/sessions.json
  --exclude _meta/lab-houses/studio-presence.json
  --exclude _meta/lab-houses/sniff.flag
)

pull_house() {
  local house="$1"
  local dest="$HOUSE_ROOT/$house"
  if [ ! -d "$dest" ]; then
    echo "skip missing $dest"
    return
  fi
  echo "-- $house ← $DEBIAN"
  "${RSYNC[@]}" "$DEBIAN:$HOUSE_ROOT/$house/" "$dest/"
}

echo "== host → working copy ($DEBIAN) =="
case "$ONLY" in
  "")
    for house in DLN VariousTitles SwarmFund ModYu; do
      pull_house "$house"
    done
    ;;
  dln|DLN) pull_house DLN ;;
  various-titles|VariousTitles) pull_house VariousTitles ;;
  swarm|SwarmFund) pull_house SwarmFund ;;
  modyu|ModYu) pull_house ModYu ;;
  *)
    echo "unknown house: $ONLY (dln | various-titles | swarm | modyu)" >&2
    exit 1
    ;;
esac

if [ -z "$ONLY" ] || [ "$ONLY" = dln ] || [ "$ONLY" = DLN ]; then
  mkdir -p "$HOUSE_ROOT/DLN/_meta/lab-houses/lan-inbox"
  "${RSYNC[@]}" "$DEBIAN:$HOUSE_ROOT/DLN/_meta/lab-inbox/" \
    "$HOUSE_ROOT/DLN/_meta/lab-houses/lan-inbox/"
fi

echo "Pulled. Live sessions stay on each box. Send on http://192.168.0.223:3010"
