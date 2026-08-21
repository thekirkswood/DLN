#!/usr/bin/env bash
# Ship this Cursor’s DLN campus onto Debian LAN :3010 and rebuild production.
# Inbox-only is ops/push-lab-inbox.sh. All houses is ops/sync-to-debian.sh
# (use this when only campus HTML moved, or when a full house sync is blocked).
# Do not rsync _meta/accounts — that overwrites live LAN sessions and signs Dave out.
set -euo pipefail
ROOT="${DLN_ROOT:-/home/main/DLN}"
DEBIAN="${DEBIAN:-user@192.168.0.223}"
DEBIAN_KEY="${DEBIAN_KEY:-$HOME/.ssh/id_ed25519_dln}"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=8 -o IdentitiesOnly=yes -i "$DEBIAN_KEY")
# Live book stays on Debian. Overwriting sessions.json signs Dave out on LAN.
RSYNC=(rsync -aH --info=stats1
  --exclude node_modules
  --exclude .next
  --exclude dist
  --exclude .git/objects/pack/*.tmp
  --exclude _meta/accounts/
  --exclude _meta/lab-inbox/
  --exclude _meta/lab-houses/lan-inbox/
  --exclude _meta/lab-houses/studio-presence.json
  --exclude _meta/lab-houses/leases.json
  --exclude _meta/lab-houses/campus-rebuild.lock
  --exclude _meta/lab-houses/campus-watch.state)

echo "== DLN → $DEBIAN =="
"${RSYNC[@]}" -e "ssh ${SSH_OPTS[*]}" "$ROOT/" "$DEBIAN:/home/main/DLN/"
echo "== rebuild LAN campus =="
ssh "${SSH_OPTS[@]}" "$DEBIAN" "chmod +x /home/main/DLN/ops/debian-rebuild-campus.sh"
ssh "${SSH_OPTS[@]}" "$DEBIAN" "/home/main/DLN/ops/debian-rebuild-campus.sh"
echo "LAN: http://192.168.0.223:3010"
