#!/usr/bin/env bash
# Put the downstairs PFP house on the VPS *sandbox* plot.
# Live (plot-pfp / paulfosbury.com) is not touched.
set -euo pipefail
DEBIAN="${DEBIAN:-user@192.168.0.223}"
HOST="${DLN_SSH_HOST:-dln-vps}"
DEST="${PFP_SANDBOX_REMOTE:-/srv/dln/plots/pfp-sandbox}"
KEY="${HOME}/.ssh/id_ed25519_dln"
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i "$KEY")
RSYNC_SSH="ssh -o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i $KEY"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "== house $DEBIAN:/home/main/PFP → sandbox $HOST:$DEST =="
"${SSH[@]}" "$DEBIAN" "test -d /home/main/PFP/Site"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude _meta/accounts \
  --exclude _meta/lab-inbox \
  -e "$RSYNC_SSH" \
  "$DEBIAN:/home/main/PFP/" "$STAGE/"
"${SSH[@]}" "$HOST" "mkdir -p '$DEST'"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude _meta/accounts \
  --exclude _meta/lab-inbox \
  -e "$RSYNC_SSH" \
  "$STAGE/" "$HOST:$DEST/"

echo "== recreate plot-pfp-sandbox + edge =="
"${SSH[@]}" "$HOST" "cd /srv/dln/repo/deploy && docker compose up -d --build --no-deps plot-pfp-sandbox edge"
echo "sandbox: https://paulfosbury.designlabnorth.com"
