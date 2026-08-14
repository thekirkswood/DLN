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

**T-Star** (Light 300 / Medium 500 / Bold 700 / Heavy 800) via `next/font/local`.  
Fallback: `"T Star", "Helvetica Neue", Helvetica, Arial, sans-serif`.  
Body mostly Light/Medium. Heavy is for rare display, not buttons. Plain text. No Google faces, no Inter-as-identity.

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
