#!/usr/bin/env bash
# Debian once: autossh reverse tunnel to the VPS. Campus :3010 must already sit.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
KEY="$ROOT/_meta/secrets/dln-home"
HOSTS="$ROOT/_meta/secrets/dln-home.known_hosts"
if [ ! -s "$KEY" ]; then
  echo "missing $KEY — generate on the Cursor disk first" >&2
  exit 1
fi
chmod 600 "$KEY" "$KEY.pub" 2>/dev/null || true
install -d -m 700 "$(dirname "$HOSTS")"
ssh-keyscan -H 82.165.5.84 > "$HOSTS" 2>/dev/null
chmod 600 "$HOSTS"
mkdir -p "$UNIT_DIR"
cp "$ROOT/ops/home-tunnel.service" "$UNIT_DIR/home-tunnel.service"
systemctl --user daemon-reload
systemctl --user enable --now home-tunnel.service
echo "home-tunnel: systemctl --user status home-tunnel.service"
