#!/usr/bin/env bash
# First-run harden for Design Lab North VPS (Ubuntu 26). Idempotent.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get -y upgrade
apt-get -y install \
  ca-certificates curl git ufw fail2ban unattended-upgrades apt-listchanges \
  gnupg lsb-release software-properties-common

# Automatic security updates
dpkg-reconfigure -f noninteractive unattended-upgrades || true

# Docker (official)
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

id dln >/dev/null 2>&1 || useradd -m -s /bin/bash -G docker dln
usermod -aG docker dln

install -d -m 0755 /srv/dln /srv/dln/repo /srv/dln/data/accounts /srv/dln/plots
chown -R dln:dln /srv/dln

# Firewall: ssh / http / https only
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# fail2ban ssh
cat >/etc/fail2ban/jail.d/dln-ssh.conf <<'JAIL'
[sshd]
enabled = true
maxretry = 5
bantime = 1h
findtime = 10m
JAIL
systemctl enable --now fail2ban
systemctl restart fail2ban

# SSH: key only. Password auth off.
install -d -m 0755 /etc/ssh/sshd_config.d
cat >/etc/ssh/sshd_config.d/dln.conf <<'SSH'
PermitRootLogin prohibit-password
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
X11Forwarding no
AllowTcpForwarding no
ClientAliveInterval 300
SSH
sshd -t
systemctl reload ssh || systemctl reload sshd

hostnamectl set-hostname dln-vps || true

echo "DLN bootstrap ok"
uname -a
docker --version
ufw status
