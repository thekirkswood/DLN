#!/usr/bin/env bash
# Campus only. Ping a house port; if quiet, start the known unit and wait.
# Do not run this on the live VPS. Do not restore /lab.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:-}"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"

port_for() {
  case "$1" in
    modyu) echo 3000 ;;
    various-titles) echo 3020 ;;
    swarm) echo 5173 ;;
    pfp) echo 3030 ;;
    dks) echo 3040 ;;
    daa) echo 3050 ;;
    *) echo "" ;;
  esac
}

unit_src() {
  case "$1" in
    modyu) echo "$ROOT/ops/debian-modyu.service" ;;
    various-titles) echo "$ROOT/ops/debian-vt.service" ;;
    swarm) echo "$ROOT/ops/debian-swarm-web.service" ;;
    pfp) echo "$ROOT/ops/debian-pfp.service" ;;
    dks) echo "$ROOT/ops/debian-dks.service" ;;
    daa) echo "$ROOT/ops/debian-daa.service" ;;
    *) echo "" ;;
  esac
}

unit_name() {
  case "$1" in
    modyu) echo debian-modyu.service ;;
    various-titles) echo debian-vt.service ;;
    swarm) echo debian-swarm-web.service ;;
    pfp) echo debian-pfp.service ;;
    dks) echo debian-dks.service ;;
    daa) echo debian-daa.service ;;
    *) echo "" ;;
  esac
}

PORT="$(port_for "$SLUG")"
if [[ -z "$PORT" ]]; then
  echo '{"up":false,"called":false,"hint":"no port"}'
  exit 0
fi

probe() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://127.0.0.1:${PORT}/" || true)"
  [[ -n "$code" && "$code" != "000" ]]
}

if probe; then
  echo '{"up":true,"called":false}'
  exit 0
fi

SRC="$(unit_src "$SLUG")"
NAME="$(unit_name "$SLUG")"
CALLED=false
if [[ -n "$SRC" && -f "$SRC" ]]; then
  mkdir -p "$UNIT_DIR"
  cp "$SRC" "$UNIT_DIR/$NAME"
  systemctl --user daemon-reload >/dev/null 2>&1 || true
  if systemctl --user start "$NAME" >/dev/null 2>&1; then
    CALLED=true
  fi
fi

i=0
while [[ "$i" -lt 8 ]]; do
  if probe; then
    echo "{\"up\":true,\"called\":$CALLED}"
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

echo "{\"up\":false,\"called\":$CALLED,\"hint\":\"port quiet\"}"
exit 0
