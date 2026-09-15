#!/usr/bin/env bash
# Put the Paul Fosbury house on the VPS plot (CSP so the hub can iframe it).
set -euo pipefail
SRC="${PFP_ROOT:-/home/main/PFP}"
HOST="${DLN_SSH_HOST:-dln-vps}"
DEST="${PFP_REMOTE:-/srv/dln/plots/pfp}"
KEY="${HOME}/.ssh/id_ed25519_dln"
SSH=(ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "$KEY")

if [[ ! -d "$SRC/Site" ]]; then
  echo "No PFP Site at $SRC" >&2
  exit 1
fi

echo "== PFP → $HOST:$DEST =="
"${SSH[@]}" "$HOST" "mkdir -p '$DEST'"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude _meta/accounts \
  --exclude _meta/lab-inbox \
  -e "ssh -o BatchMode=yes -o IdentitiesOnly=yes -i $KEY" \
  "$SRC/" "$HOST:$DEST/"

echo "== recreate plot-pfp + edge =="
"${SSH[@]}" "$HOST" "cd /srv/dln/repo/deploy && docker compose up -d --build --no-deps plot-pfp edge"
echo "live: https://paulfosburyportraits.com"
