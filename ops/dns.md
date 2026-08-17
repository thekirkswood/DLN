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
| `*` (wildcard) | A | `82.165.5.84` |

Plot hosts are **A records**. They are not nameservers.

No AAAA until we have IPv6.

## What went wrong (2026-08-15)

The registrar nameservers were set to the plot hosts:

- `modyu.designlabnorth.com`
- `swarmfund.designlabnorth.com`
- `daa.designlabnorth.com`

Let’s Encrypt then asks those names for DNS. They are the VPS web hosts, not DNS servers, so ACME gets timeout/SERVFAIL and HTTPS cannot issue. Livedns still has the A records (querying ns1.livedns.co.uk works); the parent `.com` zone no longer points at Livedns.

**Now (2026-08-15 evening):** Registrar NS are Livedns again. A records for `@`, `www`, `modyu`, `swarmfund`, `daa` → `82.165.5.84`. That is the correct shape. HTTPS is still off until a certificate exists.
