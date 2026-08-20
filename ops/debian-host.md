# Debian downstairs = always-on campus host

The **files and the running sites live on this laptop’s disk**. GPU PCs edit a working copy and **push**; this box **pulls** and serves — same rhythm as GitHub → Fasthosts, but on the LAN. Public Fasthosts stays the internet host.

Once ethernet is in, this is the quickest host in the house. Units **stay up** (all the ports). Occupancy-sleep was to spare the 2070, not this machine.

Do not treat Fasthosts / `dln-vps` as this machine.

## Role

| Machine | Role |
|---|---|
| This Debian laptop (ethernet) | **Central host.** Studio houses on NVMe `/home/main`. Client houses on the 1TB `/srv/clients`. `:3010` and unit ports sit here. |
| Tower (2070 Super) | Primary Cursor. Working copy for speed. GPU. Need not host sites. |
| Gaming laptop (3060) | Secondary Cursor / processing. Same git path. Can run closed. Honour [`ops/house-lease.md`](house-lease.md). |
| Dave’s PC | Dave’s Cursor, same git. Not in Ewan’s cycle. |

## First boot (after Chooz backup + wipe)

See `ops/backup-chooz-then-wipe.md`. Then:

1. Debian, ethernet, never-sleep: `sudo ops/never-sleep.sh`
2. Node 18+ (`apt install nodejs npm` or NodeSource). `git`. `rsync`.
3. SSH server: `sudo apt install openssh-server && sudo systemctl enable --now ssh`
4. Copy houses: from the 2070, `DEBIAN=main@<lan-ip> ./ops/sync-to-debian.sh`
5. Copy `_meta/accounts` over SSH (the script does this). Never commit it.
6. Campus service: `ops/enable-campus-user.sh` then `sudo loginctl enable-linger main`
7. Bookmark `http://192.168.0.223:3010`. This PC’s campus is localhost only.
8. **Pin unit apps warm** on this box (all ports sit). Occupancy-sleep is for when the hub ran on the 2070.

LAN IP will move if DHCP is wild — reserve it on the router, or set a static address.

## Probe 2026-08-19 (from the 2070)

This PC: `192.168.0.123` (ethernet) and `192.168.0.104` (wifi).

**`192.168.0.154` is not Debian.** It is a MacBook Pro (`MacBook-Pro-5.local`, OpenSSH 10.2). Ignore it for the home host.

**The downstairs box is wired `192.168.0.223`**, hostname **ChoozBoost**. Wi‑Fi spare `.246`. `user` can sudo. Houses on `/home/main`. Campus on **:3010**.

A recoverable copy of **this PC’s** Choozlist tree (no `node_modules`) is at `/home/main/backups/choozlist-local-2026-08-19/`. That is not a substitute for snapshotting Chooz **on this Debian box** before any wipe (`ops/backup-chooz-then-wipe.md`).

## Bench 2026-08-19 (look only — no copy)

| Fact | ChoozBoost |
|---|---|
| CPU | 13th Gen Intel Core i5-1335U (12 threads, U-series laptop) |
| RAM | 16 GiB, ~15 GiB available at idle, load ~0 |
| GPU | Intel Iris Xe only — no NVIDIA |
| System disk | Samsung 512G NVMe. `/` is **23G** (16G free). `/home` is **441G** almost empty. |
| Extra disk | 1TB Seagate `dln-clients` at `/srv/clients` (~916G). Old unmounted Ubuntu LVM wiped 2026-08-19. ModYu lives here; `/home/main/ModYu` is a symlink. |
| NVMe | 512 MiB write ~1.3 GB/s; read ~7.3 GB/s |
| CPU crypto | RSA-2048 ~1990 signs/s (fine for TLS and Node) |
| Node / git / Docker / Caddy | **Not installed** (Apache is) |
| Uptime | ~20 days |

**Verdict for campus sites:** this box can host the hub and occupancy units on the LAN. 16 GiB is enough if units sleep at zero and Chooz/Ollama is not also pulling a big model. Putting four Next apps plus Ollama on 16 GiB at once would be tight. `/` is too small for `node_modules` and Docker — keep houses under `/home`. Hardware is in the same class as a small Fasthosts/IONOS VPS (and local, so LAN latency is better). It does **not** replace the public VPS: no public IP story, Wi‑Fi today, home power.

## LAN — do not reinstall for this

The NIC is a Realtek RTL8111 **gigabit** (`enp2s0`). It is down because there is no cable (and no sudo to raise it). Booting in the bedroom on Wi‑Fi is enough to explain that. Plug ethernet downstairs, then from a **root/sudo console**:

```bash
sudo ip link set enp2s0 up
# if DHCP:
sudo dhclient -v enp2s0
# persist: enable a wired profile (ifupdown or NetworkManager once installed)
```

**Reinstall the OS only if you cannot get sudo.** That is done: `user` is in `sudo`.

## Sudo 2026-08-19

`user` is in the `sudo` group. SSH as `user` can sudo. Root SSH password stays off. Do not put passwords in this file.

`enp2s0` is **1 Gbit, carrier up**. Wired address is **`192.168.0.223`**, MAC `40:c2:ba:78:6c:fb`. Wi‑Fi still has `.246` as a fallback.

DHCP reservation is nice, not urgent, while ChoozBoost already shows that MAC at `.223` in the client list. If “add reservation” says operation failed: do not add a new row — bind/reserve the **existing** DHCP client. Try MAC as `40:c2:ba:78:6c:fb` or `40-C2-BA-78-6C-FB`. Some routers refuse a new static entry for an address that is already a live lease. Leave it if the bind will not take; worry only if `.223` moves after a power cut.

## Git / deploy

Same sense as the VPS: working copy on the GPU PC → push → Debian pull → sites change. Remotes stay GitHub (and/or a git remote on this box). Two Cursors: [`ops/house-lease.md`](house-lease.md). Studio on NVMe, clients on the 1TB (`ops/debian-clients-disk.sh`).

## Transfer 2026-08-19

Studio houses on `/home/main/{DLN,VariousTitles,SwarmFund}` (NVMe). Client houses on `/srv/clients` (1TB); `/home/main/ModYu` → `/srv/clients/ModYu`. Node 18. User systemd: **production** campus `:3010` (`next start`, not `next dev`). Watch timer probes `/api/health` and restarts if it misses three times. Units still `next dev` with lab prefix (ModYu `:3000`, VT `:3020`, Swarm `:5173`+`:8787`), pinned warm. Linger + never-sleep on. Push with `./ops/sync-to-debian.sh` (rebuilds campus after the copy). Pull onto a GPU disk with `./ops/pull-from-debian.sh`. npm if package.json moved.

## What this is not

- Not the public VPS.
- Not where Cursor *must* live (IDE on GPU PCs). Optional Remote SSH for a closed 3060 worker.
- Not Palworld. Ollama/Chooz is a different system from the website ports.

## Ewan’s two GPU seats

Both GPU machines push to the centre and honour house leases. The 3060 is a processing seat, not a spare that only wakes when the tower is dead. Cycle and weight: `memory/compass.md`.
