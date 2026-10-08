# Overview — the table as space

Own: `Site/src/components/BoardSpace.tsx`, board overview CSS in `globals.css` (`.board-space`, `.board-table`, `.board-world`, `.board-stage`), `Site/src/app/board/page.tsx`, `Site/src/data/board-map.ts` geography only. Do not restyle campus chrome outside `/board`.

## Job

`/board` is the MAP. It is the only zoomed-out view. Landscape along the top, narrative and identity on the left, the thing itself in the middle, eight-stage stack under it, customers on the right, briefing pad at the edge. Drag to orbit (yaw and pitch). Wheel zooms like a map. Scale is a plot flag rooms may read (`frameworkMoves` per faculty × held scale). Not HUD chips.

Clicking a place must **enter** that place: the region comes forward, the rest of the table recedes, then the unique interior mounts **in a well on this table** (`?enter=`). A hard cut to `/board/plot/mission` or `/board/mapping/advocates` as a new document is the defect. See `12-one-space.md`. If CSS 3D cannot carry a true zoom, animate opacity, scale, and a chamfered socket that the interior replaces — patchwork, still one space.

## What is there now

`BoardSpace.tsx` is a CSS 3D desk that already names the geography — and **nothing mounts it**. `/board` (`Site/src/app/board/page.tsx`) still renders `BrandBoard`, the communal spreadsheet. `/board/plot` does the same. That is why the walking path feels like a crappy site: the MAP is not the front door.

Build: mount `BoardSpace` on `/board` with live plot fill. Leave BrandBoard off this route (centre showcase is `06-centre.md`; heavy book only behind an explicit control if it must survive). Links from the table dump to avenue/topic/plot routes today; entering is a hard cut. Cells do not show whether the plot has held anything. The table does not change when the book changes.

## Unique interior (the overview itself)

The overview is a room. It is not a menu.

1. **Plot-aware fill.** Each token, bit, seat, and stage on the table reads the live plot (same `liveBoard` the cell pages use). Empty is mute line. Held is ink. A short snippet (pack summary) can sit on hover, not a tooltip wall.
2. **Master entity in the centre.** The middle plate is the plot name, host if any, and one line from mission or the last held cell. It is the thing the rest feeds. Click it for the showcase (`06-centre.md`), not the heavy BrandBoard compile.
3. **Region motion.** Pointer down on a region: that grid-area scales up (~1.08–1.2), neighbours dim, then `router.push` the interior. Reduced motion: skip the scale, keep the dim. Do not invent a second 3D engine.
4. **Scale.** Sole trader / bigger business / corporation already switch faculty moves on the table. Keep that. Those moves are doors into work, not decoration. They must land on the unique interior, not a sheet.
5. **Pad.** Five briefing notes only. Ownership → process stage 1. Protocols → process avenue. The board → workbench/board. Live host → workbench/host. Guardianship → process stage 8. Never Binder3’s dummy lines.
6. **A/P/E/S.** Four letters sit on the identity column (already `APES_COMPASS`). They enter mindset rooms (`08-apes.md`), not the identity-bit list.

## Interconnect

The overview is the only place that must know *all* regions. It does not save. It only reads. If mapping holds advocates, that plate on the top edge should show it. If mission is held, the left column should show it. If seat 3 has a name, the right rail shows the name not “Customer 3”.

## Multi-format

Overview does not take uploads. Stills belong in cells. The centre plate may show one shared still from Assets when that hook exists — socket until then, no dummy image.

## Look

Same Paper/Ink table. Chamfered plates. Aktiv. The motion is the craft: 45° language, not bounce easing. Do not mint-green the binder.

## Done when

A studio session can turn the table, see which cells of *this plot* are held, click landscape and arrive in a landscape room (not a generic sheet), click the centre and see the plot as a thing. Empty plots still look like a board, not an error.

## Do not

Rewrite the campus header. Add a sun/moon. Put Swarm on the desk. Compile `/board/plot` BrandBoard on this route.
