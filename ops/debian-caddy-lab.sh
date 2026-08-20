#!/usr/bin/env bash
# Optional: Caddy on :80 → campus :3010 on the Debian LAN host.
# Do not point public DNS here. Live plots stay on the VPS.
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then
  echo "Needs root: sudo $0"
  exit 1
fi
apt-get update
apt-get install -y caddy
cat > /etc/caddy/Caddyfile <<'EOF'
:80 {
	reverse_proxy 127.0.0.1:3010
}
EOF
systemctl enable --now caddy
echo "Campus also on http://<this-lan>/"
