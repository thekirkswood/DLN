#!/usr/bin/env bash
# Rsync this checkout to the VPS (excludes node_modules, .next, accounts).
# Press kits, asset index, and journalist codes live on the box — never --delete them.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DLN_SSH_HOST:-dln-vps}"
DEST="${DLN_REMOTE_DIR:-/srv/dln/repo}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude _meta/accounts \
  --exclude _meta/billing \
  --exclude _meta/enquiries \
  --exclude _meta/plans \
  --exclude _meta/assets \
  --exclude _meta/epk \
  --exclude _meta/lab-inbox \
  --exclude _meta/lab-houses \
  --exclude Site/public/press \
  --exclude deploy/.env \
  --exclude .git \
  -e ssh \
  "$ROOT/" "$HOST:$DEST/"

# Stills for the kits: add from this desk, never delete a live upload.
ssh "$HOST" "mkdir -p '$DEST/Site/public/press' '$DEST/_meta/assets' '$DEST/_meta/epk'"
if [[ -d "$ROOT/Site/public/press" ]]; then
  rsync -az --exclude '.git' \
    -e ssh \
    "$ROOT/Site/public/press/" "$HOST:$DEST/Site/public/press/"
fi
echo "synced $ROOT -> $HOST:$DEST"
