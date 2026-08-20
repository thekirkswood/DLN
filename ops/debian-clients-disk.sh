#!/usr/bin/env bash
# Wipe the downstairs 1TB (old unmounted Ubuntu LVM) and mount it as client houses.
# Live OS is the NVMe. This script refuses if /dev/sda looks like the system disk.
set -euo pipefail

DISK="${DISK:-/dev/sda}"
MOUNT="${MOUNT:-/srv/clients}"
LABEL="${LABEL:-dln-clients}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "run as root: sudo $0" >&2
  exit 1
fi

model=$(lsblk -ndo MODEL "$DISK" | head -1 | tr -d ' ')
size=$(lsblk -ndo SIZE "$DISK" | head -1)
echo "disk $DISK model=$model size=$size"

if [[ "$DISK" == *nvme* ]]; then
  echo "refusing: will not touch NVMe" >&2
  exit 1
fi
if findmnt "$DISK" >/dev/null 2>&1 || findmnt -n -o TARGET "$DISK" 2>/dev/null | grep -q .; then
  echo "refusing: $DISK has a mount" >&2
  exit 1
fi
if lsblk -n "$DISK" | grep -q '/$'; then
  echo "refusing: $DISK looks like root" >&2
  exit 1
fi
if [[ "$model" != *ST1000LM035* && "${FORCE_DISK:-}" != "1" ]]; then
  echo "refusing: expected Seagate ST1000LM035 (set FORCE_DISK=1 if this is the right 1TB)" >&2
  exit 1
fi

echo "deactivating old Ubuntu LVM if present"
vgchange -an ubuntu-vg-1 2>/dev/null || true
vgremove -y ubuntu-vg-1 2>/dev/null || true
pvremove -ff -y "${DISK}3" 2>/dev/null || true

if ! command -v parted >/dev/null; then
  apt-get install -y parted
fi

echo "wiping signatures on $DISK"
wipefs -a "$DISK"
parted -s "$DISK" mklabel gpt
parted -s "$DISK" mkpart primary ext4 1MiB 100%
partprobe "$DISK" || true
sleep 1
PART="${DISK}1"
mkfs.ext4 -F -L "$LABEL" "$PART"

mkdir -p "$MOUNT"
UUID=$(blkid -s UUID -o value "$PART")
# drop any previous line for this mount
grep -v " $MOUNT " /etc/fstab >/etc/fstab.new
mv /etc/fstab.new /etc/fstab
echo "UUID=$UUID $MOUNT ext4 defaults,noatime 0 2" >> /etc/fstab
mount "$MOUNT"
chmod 755 "$MOUNT"
if id user >/dev/null 2>&1; then
  chown user:user "$MOUNT"
fi
echo "mounted $MOUNT ($UUID)"
df -hT "$MOUNT"
