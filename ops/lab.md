# Local lab

The lab is **`/home/main/Repos/Builder`**. Dave uses **http://builder.dln.local** (backup `http://192.168.0.223:3100`). Ewan’s Cursor on this disk sniffs and jumps into the house he (or Dave) just talked to.

Design Lab North on `:3010` / `dln.local` is the public site — same offline and online.

```bash
# this disk
cd /home/main/Repos/Builder && npm run dev

# ship the lab downstairs
ops/push-builder-downstairs.sh
```

Dave: `http://builder.dln.local` — sign in on `http://dln.local` if asked. Pick a house. Change / plan / note, stills, clips, voice. Push to git and live is a named button on the DLN house. That house’s Cursor work happens here, then `ops/apply-house.sh` updates the hosted copy on Debian.

See `/home/main/Repos/Builder/AGENTS.md` and `ops/named-studio.md`.
