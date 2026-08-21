#!/usr/bin/env bash
# VPS once: restricted reverse-listen user for the Debian campus tunnel.
# Does not touch plot containers or /srv/dln/data/accounts.
set -euo pipefail
ROOT="${DLN_ROOT:-/home/main/DLN}"
PUB="${1:-$ROOT/_meta/secrets/dln-home.pub}"
TICKET_PUB="${2:-$ROOT/_meta/secrets/home-ticket.pub}"
if [ "$(id -u)" -ne 0 ]; then
  echo "run as root on dln-vps" >&2
  exit 1
fi
if [ ! -s "$PUB" ]; then
  echo "missing tunnel pubkey: $PUB" >&2
  exit 1
fi
id dln-home >/dev/null 2>&1 || useradd --system --home-dir /home/dln-home --create-home --shell /usr/sbin/nologin dln-home
install -d -m 700 -o dln-home -g dln-home /home/dln-home/.ssh
{
  printf 'restrict,port-forwarding,permitlisten="127.0.0.1:13010" '
  tr -d '\n' < "$PUB"
  printf '\n'
} > /home/dln-home/.ssh/authorized_keys
chown dln-home:dln-home /home/dln-home/.ssh/authorized_keys
chmod 600 /home/dln-home/.ssh/authorized_keys
install -m 644 "$ROOT/deploy/sshd-dln-home.conf" /etc/ssh/sshd_config.d/dln-home.conf
if [ -s "$TICKET_PUB" ]; then
  install -m 644 "$TICKET_PUB" /srv/dln/data/home-ticket.pub
fi
sshd -t
systemctl reload ssh
echo "dln-home reverse listen 127.0.0.1:13010"
