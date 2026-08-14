#!/usr/bin/env bash
# Rsync this checkout to the VPS (excludes node_modules, .next, accounts).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DLN_SSH_HOST:-dln-vps}"
DEST="${DLN_REMOTE_DIR:-/srv/dln/repo}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude _meta/accounts \
  --exclude .git \
  -e ssh \
  "$ROOT/" "$HOST:$DEST/"
echo "synced $ROOT -> $HOST:$DEST"
