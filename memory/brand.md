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

**[Aktiv Grotesk](https://fonts.adobe.com/fonts/aktiv-grotesk/)** by Dalton Maag, served from **Adobe Fonts**. Dave named this face. Do not self-host foundry files we do not own. No Google faces.

Dave’s Creative Cloud web project is the licence. He adds Aktiv Grotesk (Regular, Italic, Medium, Bold, Black) and the live domains. Kit id in `NEXT_PUBLIC_ADOBE_FONTS_KIT`. CSS stack: `"aktiv-grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif`.

| Weight | Use |
|---|---|
| 400 Regular | Body, lede |
| 400 italic | Emphasis |
| 500 Medium | Kickers, nav, buttons |
| 700 Bold | Subheads, names |
| 900 Black | Page titles, offer columns |

Footer ground dots change colour only. They do not cycle typefaces.

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
