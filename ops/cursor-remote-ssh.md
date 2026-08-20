# SSH to the Debian LAN host

Debian **holds the files and runs the sites**. Cursor on the GPU PCs uses a **working copy** (fast) and pushes, like GitHub. SSH is how a seat can also open the live tree (3060 closed worker) and how we pull/restart.

Two seats must not write the same house at once — [`ops/house-lease.md`](house-lease.md). Cursor cannot merge two live agents.

The web Send box still only writes an inbox. A Cursor chat only acts if that folder is open on a GPU seat.

## On Debian (once)

Create the studio Unix users (or one shared `main` in a common group). Same folders:

```bash
sudo adduser ewan
sudo adduser dave
sudo groupadd -f dln
sudo usermod -aG dln ewan dave main
sudo chgrp -R dln /home/main/DLN /home/main/ModYu /home/main/VariousTitles /home/main/SwarmFund
sudo chmod -R g+rwX /home/main/DLN /home/main/ModYu /home/main/VariousTitles /home/main/SwarmFund
# new files stay in the group
sudo find /home/main/DLN /home/main/ModYu /home/main/VariousTitles /home/main/SwarmFund -type d -exec chmod g+s {} \;
```

SSH keys — each person pastes **their public key** (no passwords in this repo):

```bash
# as that user on Debian
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# append the .pub line, then:
chmod 600 ~/.ssh/authorized_keys
```

`sshd` must allow pubkey. Do not put private keys in git.

## 3060 as a closed worker

Install Cursor, log into Ewan’s account, open the house folder (clone on its disk, or Remote SSH to Debian). Leave it running; inhibit sleep. It watches that house’s `wake.flag`. Take the lease before writing. It is a second instance, not a shared cursor with the tower.

1. Install Cursor’s Remote SSH.
2. SSH config (~/.ssh/config), no secrets:

```
Host dln-campus
  HostName 192.168.0.223
  User user
```

Use a key once sudo exists (password SSH is a stopgap). Dave can have `User dave` later.
3. Open the house on Debian if this seat is the closed worker.

Working copies on the GPU PCs stay for fast Cursor. Push (`ops/sync-to-debian.sh`), then pull (`ops/pull-from-debian.sh`) so this disk matches the host.

## What does not hop

Dave’s work runs on **Dave’s** Cursor against **his working copy** (git). It is not a rank in Ewan’s tower/laptop cycle. Two writers in one house: [`house-lease.md`](house-lease.md).

A later “note wakes a GPU” worker is Phase D — not SSH — and must honour [`memory/compass.md`](../memory/compass.md).

## Ewan: tower and laptop

Both connect to the same `dln-campus` Host.

- **Fallback:** laptop when the tower is off; tower when the laptop is off.
- **When both are already answering:** delegate. Ranks cycle tower → laptop → tower → laptop. Head of the queue goes to the tower. High weight **and** high tokens go to the tower. Jobs the 3060 cannot hold wait for the tower. Small jobs may run on the laptop so the queue keeps moving.

