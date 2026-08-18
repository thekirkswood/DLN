#!/usr/bin/env bash
# Houses start themselves when you open them on :3010/lab.
# The hub (cd Site && npm run dev) is the only process you start by hand.
# Each house is an isolated child: own folder, own port, own env, lab prefix.
set -euo pipefail
echo "Start the hub:  cd /home/main/DLN/Site && npm run dev"
echo "Then sign in at http://localhost:3010/lab and open a house."
echo "The hub starts that house (ModYu :3000, Various Titles :3020, Swarm :5173 + api :8787)."
echo "Do not start houses without BASE_PATH / VITE_BASE — the frame needs the /go/{slug} prefix."
