#!/usr/bin/env bash
# Recreate the VPS host key file the tunnel needs. Missing file = StrictHostKeyChecking fails.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOSTS="$ROOT/_meta/secrets/dln-home.known_hosts"
install -d -m 700 "$(dirname "$HOSTS")"
if [ ! -s "$HOSTS" ]; then
  ssh-keyscan -H 82.165.5.84 > "$HOSTS" 2>/dev/null
  chmod 600 "$HOSTS"
fi
if [ ! -s "$HOSTS" ]; then
  echo "ensure-home-known-hosts: empty $HOSTS" >&2
  exit 1
fi
