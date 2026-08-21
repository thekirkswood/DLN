#!/usr/bin/env bash
# Push campus + unit houses onto the downstairs Debian host.
# Pull the other way with ops/pull-from-debian.sh so this disk matches the centre.
# Secrets stay out of git: _meta/accounts is rsynced, not committed.
#
#   DEBIAN=user@192.168.0.XX ./ops/sync-to-debian.sh
#   DEBIAN=dln@dln-campus ./ops/sync-to-debian.sh
set -euo pipefail
DEBIAN="${DEBIAN:-user@192.168.0.223}"

RSYNC=(rsync -aH --info=stats1
  --exclude node_modules
  --exclude .next
  --exclude dist
  --exclude .git/objects/pack/*.tmp
  --exclude _meta/accounts/sessions.json
  --exclude _meta/lab-houses/studio-presence.json
  --exclude _meta/lab-houses/leases.json)
HOUSE_ROOT="${HOUSE_ROOT:-/home/main}"
# On Debian, client houses live on the 1TB at /srv/clients. /home/main/ModYu is a symlink.

echo "== studio houses → $DEBIAN:$HOUSE_ROOT =="
for house in DLN VariousTitles SwarmFund; do
  src="$HOUSE_ROOT/$house"
  if [ ! -d "$src" ]; then
    echo "skip missing $src"
    continue
  fi
  echo "-- $house"
  "${RSYNC[@]}" "$src/" "$DEBIAN:$HOUSE_ROOT/$house/"
done

echo "== client houses → $DEBIAN:$HOUSE_ROOT (follows /srv/clients symlink on Debian) =="
for house in ModYu; do
  src="$HOUSE_ROOT/$house"
  if [ ! -d "$src" ]; then
    echo "skip missing $src"
    continue
  fi
  echo "-- $house"
  "${RSYNC[@]}" "$src/" "$DEBIAN:$HOUSE_ROOT/$house/"
done

echo "== gitignored account book (SSH, not git; live sessions stay on Debian) =="
if [ -d "$HOUSE_ROOT/DLN/_meta/accounts" ]; then
  ssh "$DEBIAN" "mkdir -p $HOUSE_ROOT/DLN/_meta/accounts"
  "${RSYNC[@]}" \
    --exclude sessions.json \
    "$HOUSE_ROOT/DLN/_meta/accounts/" "$DEBIAN:$HOUSE_ROOT/DLN/_meta/accounts/"
fi

echo "== install Debian campus units + health watch =="
ssh "$DEBIAN" "chmod +x $HOUSE_ROOT/DLN/ops/enable-debian-host.sh $HOUSE_ROOT/DLN/ops/debian-rebuild-campus.sh $HOUSE_ROOT/DLN/ops/campus-lan.sh $HOUSE_ROOT/DLN/ops/campus-watch.sh"
ssh "$DEBIAN" "$HOUSE_ROOT/DLN/ops/enable-debian-host.sh"

echo "== rebuild LAN campus (production Next on :3010) =="
ssh "$DEBIAN" "$HOUSE_ROOT/DLN/ops/debian-rebuild-campus.sh"

echo "Bookmark: http://192.168.0.223:3010"
