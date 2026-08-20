#!/usr/bin/env bash
# Keep campus :3010 up on this PC until the downstairs Debian host takes over.
# User systemd unit — Restart=always. Stop any ad-hoc `npm run dev` first.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
mkdir -p "$UNIT_DIR"
cp "$ROOT/ops/campus.service" "$UNIT_DIR/campus.service"
cp "$ROOT/ops/campus-inhibit-sleep.service" "$UNIT_DIR/campus-inhibit-sleep.service"
systemctl --user daemon-reload
systemctl --user enable campus-inhibit-sleep.service
systemctl --user start campus-inhibit-sleep.service || true
if ss -ltn 2>/dev/null | grep -q ':3010 '; then
  echo "Port 3010 is already in use. Enable the unit now; it will take over after you stop the current next process:"
  echo "  systemctl --user enable campus.service"
  echo "Then stop the extra npm/next on :3010 and run:"
  echo "  systemctl --user start campus.service"
  systemctl --user enable campus.service
else
  systemctl --user enable --now campus.service
fi
echo "Linger (so campus survives logout) — needs one sudo:"
echo "  sudo loginctl enable-linger \"$USER\""
echo "Status: systemctl --user status campus.service"
echo "Logs:   journalctl --user -u campus.service -f"
