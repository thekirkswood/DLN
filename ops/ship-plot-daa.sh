#!/usr/bin/env bash
# Put the DAA house on daa.designlabnorth.com. Does not rebuild plot-modyu.
# Hub Caddy must reverse_proxy plot-daa (not redirect to the hub).
set -euo pipefail
SRC="${DAA_ROOT:-/home/main/DAA}"
HOST="${DLN_SSH_HOST:-dln-vps}"
DEST="${DAA_REMOTE:-/srv/dln/plots/daa}"
KEY="${HOME}/.ssh/id_ed25519_dln"
SSH=(ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "$KEY")

if [[ ! -d "$SRC/Site" ]]; then
  echo "No DAA Site at $SRC" >&2
  exit 1
fi

echo "== DAA → $HOST:$DEST =="
"${SSH[@]}" "$HOST" "mkdir -p '$DEST'"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude _meta/accounts \
  --exclude _meta/lab-inbox \
  -e "ssh -o BatchMode=yes -o IdentitiesOnly=yes -i $KEY" \
  "$SRC/" "$HOST:$DEST/"

echo "== recreate plot-daa + edge =="
"${SSH[@]}" "$HOST" "cd /srv/dln/repo/deploy && docker compose up -d --build --no-deps plot-daa edge"
echo "live: https://daa.designlabnorth.com"
