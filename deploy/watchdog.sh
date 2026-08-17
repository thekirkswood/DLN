#!/usr/bin/env bash
# Keep the hub answering on port 80. Do not invent a Caddyfile switch.
# Only drop 443 if compose is HTTP-only. If HTTP dies, recreate; last resort Caddyfile.ip.
set -u
LOG="${DLN_WATCHDOG_LOG:-/srv/dln/data/watchdog.log}"
DEPLOY="${DLN_DEPLOY:-/srv/dln/repo/deploy}"
ENVF="$DEPLOY/.env"
mkdir -p "$(dirname "$LOG")"
ts() { date --iso-8601=seconds; }
say() { echo "$(ts) $*" | tee -a "$LOG"; }

cd "$DEPLOY" || { say "fail: no $DEPLOY"; exit 1; }

if [ -f "$ENVF" ] && ! grep -q '^CADDY_FILE=' "$ENVF"; then
  echo 'CADDY_FILE=./Caddyfile.ip' >> "$ENVF"
fi

# Drop a stale 443 map only when compose is not publishing it.
if docker port dln-edge-1 443 >/dev/null 2>&1; then
  if ! grep -qE '^[[:space:]]*- "443:443"' docker-compose.yml; then
    say "fix: edge had 443 published while compose is HTTP-only"
    docker compose up -d --force-recreate --no-deps --no-build edge >/dev/null
  fi
fi

docker compose up -d --no-build edge web plot-modyu plot-swarm dns >/dev/null 2>&1 \
  || docker compose up -d --no-build edge web plot-modyu plot-swarm >/dev/null 2>&1

hub() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time 8 -H 'Host: designlabnorth.com' http://127.0.0.1/ || echo 000
}

code="$(hub)"
if [ "$code" != "200" ]; then
  say "fail: hub http=$code — recreating edge+web"
  docker compose up -d --force-recreate --no-deps --no-build edge web >/dev/null
  sleep 2
  code="$(hub)"
fi
if [ "$code" != "200" ] && [ -f "$ENVF" ]; then
  say "fail: still http=$code — falling back to Caddyfile.ip"
  sed -i 's|^CADDY_FILE=.*|CADDY_FILE=./Caddyfile.ip|' "$ENVF"
  docker compose up -d --force-recreate --no-deps --no-build edge >/dev/null
  sleep 2
  code="$(hub)"
fi

ports="$(docker port dln-edge-1 2>/dev/null | tr '\n' ' ')"
names="$(docker compose ps --format '{{.Name}}:{{.State}}' 2>/dev/null | tr '\n' ' ')"
say "ok http=$code ports=[$ports] $names"
[ "$code" = "200" ]
