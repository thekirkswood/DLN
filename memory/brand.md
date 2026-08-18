# Brand

**Status:** Mark locked 2026-08-14 from Ewan’s plates. Do not redraw, restyle, or “improve” the letterforms.

## Mark

Custom geometric **DLN** — modular blocks, 45° chamfers, TM above the join. No curves.

| File | Use |
|---|---|
| `Site/public/brand/dln-mute.png` | Paper ground (grey mark, transparent) |
| `Site/public/brand/dln-white.png` | Ink ground (white mark, transparent) |
| `Site/public/brand/dln-ink.png` | Near-black extract — spare |
| `dln-plate-ink.jpg` / `dln-plate-mute.jpg` | Source plates. Archive, not layout chrome |

Never put the black-field JPEG on a light page. Never recolour the glyphs.

## Type

**[Blender](https://binnenland.ch/typeface/blender#overview)** by Nik Thoenen / Binnenland. Self-hosted `next/font/local`. Not T-Star. No Google faces.

| File | Weight | Use |
|---|---|---|
| `Site/public/fonts/Blender-Book.woff2` | 400 | Body, lede |
| `Site/public/fonts/Blender-BookItalic.woff2` | 400 italic | Emphasis |
| `Site/public/fonts/Blender-Medium.woff2` | 500 | Kickers, nav, buttons |
| `Site/public/fonts/Blender-Bold.woff2` | 700 | Subheads, names, strong |
| `Site/public/fonts/Blender-Strong.woff2` | 900 | Page titles, offer columns |

Fallback: `"Blender", "Helvetica Neue", Helvetica, Arial, sans-serif`. T-Star files stay in `public/fonts/` unused.

## Ground (not “theme”)

Studio language: **Paper** / **Ink**. Control is a chamfered PAPER | INK cut (45°), never a sun/moon.

| Token | Paper | Ink |
|---|---|---|
| `--ground` | `#FFFFFF` | `#414141` (mute plate field) |
| `--ink` | `#414141` (grey mark) | `#FFFFFF` (white mark) |
| `--mute` | `#6E6E6E` | `#C8C8C8` |
| `--line` | `#D4D4D4` | `#5C5C5C` |
| `--mark` | `dln-mute.png` (grey glyph, transparent) | `dln-white.png` |

Paper is grey on white. Ink is white on grey. Not black plates in the UI. Toggle must set `data-ground` on `<html>` immediately.

Chamfer every interactive edge (8px, 45°) — buttons, switch, plot rows, submit. No 999px pills, no drop-shadow cards, no gradient orbs.

## Voice

Plain. North. Professional. Not agency-speak. Not “we craft experiences”.
