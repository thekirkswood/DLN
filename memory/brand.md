# Brand

**Status:** Mark locked 2026-08-14 from Ewan’s plates. Do not redraw, restyle, or “improve” the letterforms.

## Mark

Custom geometric **DLN** — modular blocks, 45° chamfers, TM above the join. No curves.

| File | Use |
|---|---|
| `Site/public/brand/dln-ink.png` | Paper ground (black mark, transparent) |
| `Site/public/brand/dln-white.png` | Ink ground (white mark, transparent) |
| `Site/public/brand/dln-mute.png` | Quiet dark-plate cousin — spare, not UI default |
| `dln-plate-ink.jpg` / `dln-plate-mute.jpg` | Source plates (black field). Archive, not layout chrome |

Never put the black-field JPEG on a light page. Never recolour the glyphs.

## Type

**T-Star** (Light 300 / Medium 500 / Bold 700 / Heavy 800) via `next/font/local`.  
Fallback: `"T Star", "Helvetica Neue", Helvetica, Arial, sans-serif`.  
Body mostly Light/Medium. Heavy is for rare display, not buttons. Plain text. No Google faces, no Inter-as-identity.

## Ground (not “theme”)

Studio language: **Paper** / **Ink**. Control is a chamfered PAPER | INK cut (45°), never a sun/moon.

| Token | Paper | Ink |
|---|---|---|
| `--ground` | `#EFEDE7` | `#070707` |
| `--ink` | `#0C0C0C` | `#F3F1EC` |
| `--mute` | `#6E6C66` | `#9A9892` |
| `--line` | `#D8D5CC` | `#242424` |
| `--mark` | ink png | white png |

Chamfer every interactive edge (8px, 45°) — buttons, switch, plot rows, submit. No 999px pills, no drop-shadow cards, no gradient orbs.

## Voice

Plain. North. Professional. Not agency-speak. Not “we craft experiences”.
