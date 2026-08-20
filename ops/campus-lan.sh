#!/usr/bin/env bash
# LAN campus on :3010 — production Next, not `next dev`.
# Dev mode recompiles on every rsync and can overlay a crash on a live tab.
set -euo pipefail
cd /home/main/DLN/Site
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
if [ ! -f .next/BUILD_ID ]; then
  /usr/bin/npm run build
fi
exec /usr/bin/npm run start:lan
