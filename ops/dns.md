# DNS — designlabnorth.com

VPS IPv4: **82.165.5.84** (IONOS).  
Nameservers: **Livedns** — `ns1.livedns.co.uk`, `ns2.livedns.co.uk`, `ns3.livedns.co.uk`.  
That panel is typically **123-reg / Heart / Fasthosts**, not the IONOS VPS panel. Adding records in IONOS will do nothing.

Put these **A** records at Livedns (no CNAME to the VPS). TTL 300 while it settles, then 3600.

| Host | Type | Value |
|---|---|---|
| `@` (apex / designlabnorth.com) | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |
| `modyu` | A | `82.165.5.84` |
| `swarmfund` | A | `82.165.5.84` |
| `daa` | A | `82.165.5.84` |
| `*` (wildcard) | A | `82.165.5.84` |

The wildcard covers every future client plot. If the panel has no `*`, add each plot as its own A to the same IP.

**Now (2026-08-15):** `@`, `www`, `modyu`, `swarmfund`, and `daa` answer. Plot hosts:

- `https://modyu.designlabnorth.com` — ModYu (gated)
- `https://swarmfund.designlabnorth.com` — Swarm Fund (gated)
- `https://daa.designlabnorth.com` — reserved name, redirects to the hub. Not a greenhouse plot yet.

No AAAA until we have IPv6.
