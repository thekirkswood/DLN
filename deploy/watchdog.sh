#!/usr/bin/env bash
# Keep the hub answering on port 80. Do not switch Caddyfile. Do not tickle plots.
# Live TLS is Caddyfile.prod. A hub blip must recreate edge+web, never strip 443.
set -u
LOG="${DLN_WATCHDOG_LOG:-/srv/dln/data/watchdog.log}"
DEPLOY="${DLN_DEPLOY:-/srv/dln/repo/deploy}"
mkdir -p "$(dirname "$LOG")"
ts() { date --iso-8601=seconds; }
say() { echo "$(ts) $*" | tee -a "$LOG"; }

cd "$DEPLOY" || { say "fail: no $DEPLOY"; exit 1; }

hub() {
  local out
  out="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 -H 'Host: designlabnorth.com' http://127.0.0.1/ 2>/dev/null || true)"
  [ -n "$out" ] || out=000
  printf '%s' "$out"
}

code="$(hub)"
if [ "$code" != "200" ]; then
  say "fail: hub http=$code — recreating edge+web (TLS file stays)"
  docker compose up -d --no-deps --no-build --force-recreate edge web >/dev/null
  sleep 3
  code="$(hub)"
fi

ports="$(docker port dln-edge-1 2>/dev/null | tr '\n' ' ')"
names="$(docker compose ps --format '{{.Name}}:{{.State}}' 2>/dev/null | tr '\n' ' ')"
say "ok http=$code ports=[$ports] $names"
[ "$code" = "200" ]
