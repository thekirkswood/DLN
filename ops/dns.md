# DNS — designlabnorth.com

VPS IPv4: **82.165.5.84**

Put these **A** records at the registrar (no CNAME to the VPS). TTL 300 while it settles, then 3600.

| Host | Type | Value |
|---|---|---|
| `@` (apex / designlabnorth.com) | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |
| `*` (wildcard) | A | `82.165.5.84` |

The wildcard covers `modyu.designlabnorth.com` and every future plot. If the panel has no `*`, add each plot as its own A to the same IP.

No AAAA until we have IPv6. After the A records answer, we switch Caddy to `Caddyfile.prod` and issue TLS.
