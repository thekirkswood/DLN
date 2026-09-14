#!/usr/bin/env bash
# Advertise dln.local names on the LAN. Debian only. Not public DNS.
# dnsmasq answers the LAN; avahi publishes mDNS A records for Macs that ignore unicast .local.
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then
  echo "Needs root: sudo $0"
  exit 1
fi
IP="${LAN_IP:-192.168.0.223}"
apt-get update
apt-get install -y dnsmasq avahi-daemon avahi-utils
cat > /etc/dnsmasq.d/dln-local.conf <<EOF
# Design Lab North LAN names. Do not ship this file to the VPS.
listen-address=127.0.0.1,${IP}
bind-interfaces
address=/dln.local/${IP}
EOF
systemctl enable --now dnsmasq
systemctl restart dnsmasq || true
systemctl enable --now avahi-daemon
cat > /etc/systemd/system/dln-avahi-aliases.service <<EOF
[Unit]
Description=Design Lab North mDNS aliases
After=avahi-daemon.service
Wants=avahi-daemon.service

[Service]
Type=simple
ExecStart=/usr/bin/bash -c 'for n in dln.local builder.dln.local modyu.dln.local titles.dln.local swarm.dln.local pfp.dln.local dks.dln.local daa.dln.local; do /usr/bin/avahi-publish -a -R "\$n" ${IP} & done; wait'
Restart=always

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now dln-avahi-aliases.service
echo "LAN names → ${IP}. Dave fallback: ops/dave-hosts.txt"
