# DNS — designlabnorth.com

VPS IPv4: **82.165.5.84** (IONOS).

## How it should be

Nameservers at the **registrar** (123-reg / Heart / Fasthosts): **Livedns**

- `ns1.livedns.co.uk`
- `ns2.livedns.co.uk`
- `ns3.livedns.co.uk`

Then **A records** in the Livedns panel (not nameserver rows, not IONOS DNS):

| Host | Type | Value |
|---|---|---|
| `@` (apex / designlabnorth.com) | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |
| `modyu` | A | `82.165.5.84` |
| `swarmfund` | A | `82.165.5.84` |
| `daa` | A | `82.165.5.84` |
| `paulfosbury` | A | `82.165.5.84` |
| `*` (wildcard) | A | `82.165.5.84` |

Plot hosts are **A records**. They are not nameservers.

`paulfosburyportraits.com` (Livedns, same nameservers):

| Host | Type | Value |
|---|---|---|
| `@` | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |

`swarmfund.com` (Livedns on that domain — not designlabnorth.com):

| Host | Type | Value |
|---|---|---|
| `@` | A | `82.165.5.84` |
| `www` | A | `82.165.5.84` |

Leave MX / SPF / Livemail alone (`mailserver.livemail.co.uk`). No AAAA until we have IPv6 on this VPS. Fasthosts VPS stays until April 2027 as a preview box; after the A records answer `82.165.5.84`, it is no longer live Swarm.

No AAAA until we have IPv6.

## DMARC (2026-09-07)

Public TXT `_dmarc.designlabnorth.com` must **not** list `build@` (the enquiries mailbox). RFC 7489 `rua`/`ruf` are public `mailto:` (or `https:`) URIs. You cannot hide a reporting address inside DNS, and you cannot put an encrypted private API in a TXT record. Mail still authenticates with `p=none`.

Create a Livemail mailbox or alias **`dmarc@designlabnorth.com`** (not an alias onto `build@`). Then set:

```
v=DMARC1; p=none; sp=none; rua=mailto:dmarc@designlabnorth.com; adkim=r; aspf=r; pct=100
```

Drop `ruf` (forensic reports are more private than aggregate). Policy stays `none` so ordinary mail is not rejected. Livedns panel — this repo cannot write the zone.

## What went wrong (2026-08-15)

The registrar nameservers were set to the plot hosts:

- `modyu.designlabnorth.com`
- `swarmfund.designlabnorth.com`
- `daa.designlabnorth.com`

Let’s Encrypt then asks those names for DNS. They are the VPS web hosts, not DNS servers, so ACME gets timeout/SERVFAIL and HTTPS cannot issue. Livedns still has the A records (querying ns1.livedns.co.uk works); the parent `.com` zone no longer points at Livedns.

**Now (2026-08-15 evening):** Registrar NS are Livedns again. A records for `@`, `www`, `modyu`, `swarmfund`, `daa` → `82.165.5.84`. That is the correct shape. HTTPS is still off until a certificate exists.
