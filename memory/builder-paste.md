# Paste to the Builder Cursor

Copy this into the Builder chat at `/home/main/Repos/Builder` (`http://builder.dln.local`, backup `:3100`). Do not drag that chat into Design Lab North.

## Binds

Window `src` is the same as the campus homepage: `http://192.168.0.223:{port}/`. Never `0.0.0.0`, never `/go/{slug}`, never `lan-enter` onto a house. Named `*.dln.local` only when the browser is already on `dln.local`.

| Plane | Window `src` | Example |
|---|---|---|
| Build | `http://192.168.0.223:{port}/` | DAA `http://192.168.0.223:3050/` |
| Live | `liveUrl`, new tab | `https://daa.designlabnorth.com` |

Houses allow Builder to iframe them (`frame-ancestors` includes `:3100`). If a window is blank after a house restart, the port is down — wake via hub `GET /api/houses/wake?plot=`.

Houses stay in `houses.json`, including DAA and Dave Kirkwood.

Full table: `memory/builder-site-tabs.md` in `/home/main/DLN`.
