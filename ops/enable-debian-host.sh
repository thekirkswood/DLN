#!/usr/bin/env bash
# On ChoozBoost: linger, never-sleep, production campus + pinned unit apps + health watch.
set -euo pipefail
ROOT=/home/main/DLN
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
mkdir -p "$UNIT_DIR"
chmod +x "$ROOT/ops/campus-lan.sh" "$ROOT/ops/campus-watch.sh" "$ROOT/ops/debian-rebuild-campus.sh"
cp "$ROOT/ops/debian-campus.service" "$UNIT_DIR/campus.service"
cp "$ROOT/ops/campus-watch.service" "$UNIT_DIR/campus-watch.service"
cp "$ROOT/ops/campus-watch.timer" "$UNIT_DIR/campus-watch.timer"
cp "$ROOT/ops/debian-modyu.service" "$UNIT_DIR/debian-modyu.service"
cp "$ROOT/ops/debian-vt.service" "$UNIT_DIR/debian-vt.service"
cp "$ROOT/ops/debian-swarm-api.service" "$UNIT_DIR/debian-swarm-api.service"
cp "$ROOT/ops/debian-swarm-web.service" "$UNIT_DIR/debian-swarm-web.service"
systemctl --user daemon-reload
systemctl --user enable --now campus.service debian-modyu.service debian-vt.service debian-swarm-api.service debian-swarm-web.service campus-watch.timer
echo "Linger: sudo loginctl enable-linger $USER"
echo "Never-sleep: sudo $ROOT/ops/never-sleep.sh"
echo "Campus (production): http://192.168.0.223:3010"
echo "After a source push: $ROOT/ops/debian-rebuild-campus.sh"

