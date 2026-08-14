# DNS — designlabnorth.com

VPS IPv4: **82.165.5.84** (IONOS).  
Nameservers: **Livedns** — `ns1.livedns.co.uk`, `ns2.livedns.co.uk`, `ns3.livedns.co.uk`.  
That panel is typically **123-reg / Heart Internet / Fasthosts**, not the IONOS VPS panel. Adding records in IONOS will do nothing.

Put these **A** records at Livedns (no CNAME to the VPS). TTL 300 while it settles, then 3600.

| Host | Type | Value |
|---|---|---|
| `@` (apex / designlabnorth.com) | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |
| `*` (wildcard) | A | `82.165.5.84` |

The wildcard covers `modyu.designlabnorth.com` and every future client plot. If the panel has no `*`, add each plot as its own A to the same IP.

**Now (2026-08-15):** `@` and `www` answer. `modyu` does not. Add:

| Host | Type | Value |
|---|---|---|
| `modyu` | A | `82.165.5.84` |

Until that answers, Enter the plot uses the interim dock: `http://designlabnorth.com/p/modyu` (signed in, port 80). Use `http://` until we switch Caddy to `Caddyfile.prod`.

No AAAA until we have IPv6.
