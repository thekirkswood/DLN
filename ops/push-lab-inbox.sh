#!/usr/bin/env bash
# Push this disk's campus inbox to Debian so localhost /admin is the same queue.
set -euo pipefail
ROOT="${DLN_ROOT:-/home/main/DLN}"
DEBIAN="${DEBIAN:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=4 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
SRC="$ROOT/_meta/lab-inbox/"
rsync -aH -e "ssh ${SSH_OPTS[*]}" \
  --exclude sessions.json \
  --exclude wake.flag \
  "$SRC" "$DEBIAN:/home/main/DLN/_meta/lab-inbox/"
