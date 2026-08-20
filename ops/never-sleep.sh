#!/usr/bin/env bash
# Inhibit suspend on this PC until Debian is the always-on host.
# Spirit of Chooz deploy/node-setup.sh power guard — not the Chooz product.
# Needs root.
set -euo pipefail
if [ "$(id -u)" -ne 0 ]; then
  echo "Needs root: sudo $0"
  exit 1
fi

mkdir -p /etc/systemd/logind.conf.d
cat > /etc/systemd/logind.conf.d/dln-campus.conf <<EOF
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
HandleSuspendKey=ignore
IdleAction=ignore
EOF
systemctl restart systemd-logind || true
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target 2>/dev/null || true

for u in $(ls /home 2>/dev/null); do
  uid=$(id -u "$u" 2>/dev/null) || continue
  bus="unix:path=/run/user/$uid/bus"
  [ -S "/run/user/$uid/bus" ] || continue
  for schema in org.cinnamon.settings-daemon.plugins.power org.gnome.settings-daemon.plugins.power; do
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema sleep-inactive-ac-type "'nothing'" 2>/dev/null || true
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema sleep-inactive-battery-type "'nothing'" 2>/dev/null || true
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema sleep-inactive-ac-timeout 0 2>/dev/null || true
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema sleep-inactive-battery-timeout 0 2>/dev/null || true
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema lid-close-ac-action "'nothing'" 2>/dev/null || true
    sudo -u "$u" DBUS_SESSION_BUS_ADDRESS="$bus" gsettings set $schema lid-close-battery-action "'nothing'" 2>/dev/null || true
  done
done

echo "Sleep is blocked (lid, idle, systemd sleep targets). Screen may still blank."
echo "Undo later: sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target"
echo "            sudo rm /etc/systemd/logind.conf.d/dln-campus.conf && sudo systemctl restart systemd-logind"
