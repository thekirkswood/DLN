#!/usr/bin/env bash
# Named LAN hosts on Debian Caddy :80. Not public DNS.
# Apache (or anything else on :80) must be off first — that is why the first run failed.
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then
  echo "Needs root: sudo $0"
  exit 1
fi
# Port 80 is the named studio. Apache’s default site is not.
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true
systemctl stop httpd 2>/dev/null || true
apt-get update
apt-get install -y caddy
cat > /etc/caddy/Caddyfile <<'EOF'
{
	auto_https off
}

http://dln.local {
	reverse_proxy 127.0.0.1:3010
}

http://builder.dln.local {
	reverse_proxy 127.0.0.1:3100
}

http://modyu.dln.local {
	reverse_proxy 127.0.0.1:3000
}

http://titles.dln.local {
	reverse_proxy 127.0.0.1:3020
}

http://swarm.dln.local {
	reverse_proxy 127.0.0.1:5173
}

http://pfp.dln.local {
	reverse_proxy 127.0.0.1:3030
}

http://dks.dln.local {
	reverse_proxy 127.0.0.1:3040
}

http://daa.dln.local {
	reverse_proxy 127.0.0.1:3050
}

:80 {
	reverse_proxy 127.0.0.1:3010
}
EOF
systemctl enable caddy
systemctl restart caddy
systemctl --no-pager --full status caddy | head -20
echo "Named studio on :80 — http://dln.local  http://builder.dln.local"
echo "Backup: http://192.168.0.223:3010"
echo "If this still fails: ss -ltnp | awk '/:80 /'  then stop that service and: systemctl restart caddy"
