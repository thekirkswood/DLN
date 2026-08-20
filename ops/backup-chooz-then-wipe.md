# Backup Chooz on the downstairs Debian box, then wipe for campus

Do this **on or against that laptop**, not against this 2070 PC’s `/home/main/choozlist-local` unless that is the only copy.

## 1. Recoverable snapshot (before wipe)

From this PC, with SSH already working:

```bash
mkdir -p "$HOME/backups"
HOST=user@<debian-lan>
# Whole home (large). Prefer a disk if 1TB is full of Chooz models.
rsync -aH --info=progress2 "$HOST:/home/" "$HOME/backups/debian-home-$(date +%F)/"
# If Chooz lives in a known folder:
rsync -aH "$HOST:/opt/chooz/" "$HOME/backups/debian-chooz-$(date +%F)/" || true
```

Or on the Debian box itself, to a USB disk:

```bash
sudo tar -C / -czf /media/usb/chooz-debian-$(date +%F).tgz home opt/chooz 2>/dev/null || sudo tar -C /home -czf /media/usb/home-$(date +%F).tgz .
```

Keep the tarball until Ewan confirms Chooz still boots from the copy.

## 2. Wipe for Design Lab North

After the snapshot is readable on this PC or a disk:

- Reinstall Debian (clean), **or** delete Chooz/Ollama services and leftover models so the box is a site host, not a mesh node.
- Do **not** reuse Chooz’s Ollama mesh as the DLN campus.
- Create user `main` (or `dln`) with a home that will hold `/home/main/DLN`, `ModYu`, `VariousTitles`, `SwarmFund`.
- Then run `ops/sync-to-debian.sh` and `ops/debian-host.md`.

A.P.E.S. is Swarm (`/home/main/SwarmFund/brain/memory/04-apes-framework.md`). It is **not** part of this wipe. GPU + Chooz + APES is Phase D.
