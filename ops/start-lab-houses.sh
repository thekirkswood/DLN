#!/usr/bin/env bash
# Retired occupancy starter. Houses sit on Debian named hosts, at the port root.
# The lab is Builder — not campus /lab and not /go/{slug}.
set -euo pipefail
echo "Lab: http://builder.dln.local  (backup http://192.168.0.223:3100)"
echo "Campus: http://dln.local  (backup http://192.168.0.223:3010)"
echo "Do not start houses with BASE_PATH=/go/{slug}. Units sit at /."
echo "Paste memory/builder-paste.md into the Builder Cursor. Do not drag that chat here."
