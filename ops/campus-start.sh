#!/usr/bin/env bash
# Campus hub on :3010. Occupancy must never kill this port.
set -euo pipefail
cd /home/main/DLN/Site
exec /usr/bin/npm run dev
