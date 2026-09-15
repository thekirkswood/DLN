#!/usr/bin/env python3
"""Crop the seven numbered DLN framework glyphs and write a looping GIF."""
from pathlib import Path

from collections import deque

import numpy as np
from PIL import Image

ROOT = Path("/home/main/DLN/Site/public")
SRC = ROOT / "brief" / "Frameworks"
OUT = ROOT / "brand" / "framework"
GIF = ROOT / "brand" / "framework.gif"

# File numbers on disk are not the plate numbers.
FRAMES = [
    ("DLNFrameworks-06.png", "01", "comms"),
    ("DLNFrameworks-05.png", "02", "mapping"),
    ("DLNFrameworks-04.png", "03", "process"),
    ("DLNFrameworks-07.png", "04", "workbench"),
    ("DLNFrameworks-08.png", "05", "apes"),
    ("DLNFrameworks-03.png", "06", "identity"),
    ("DLNFrameworks-02.png", "07", "solport"),
]

SIZE = 160
INK = 88


def ink_components(ink: np.ndarray) -> list[tuple[int, int, int, int, int]]:
    h, w = ink.shape
    seen = np.zeros((h, w), dtype=np.uint8)
    out: list[tuple[int, int, int, int, int]] = []
    ys, xs = np.where(ink)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if seen[y, x]:
            continue
        q = deque([(y, x)])
        seen[y, x] = 1
        n = 0
        y0 = y1 = y
        x0 = x1 = x
        while q:
            cy, cx = q.popleft()
            n += 1
            if cy < y0:
                y0 = cy
            if cy > y1:
                y1 = cy
            if cx < x0:
                x0 = cx
            if cx > x1:
                x1 = cx
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w and ink[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = 1
                    q.append((ny, nx))
        if n >= 40:
            out.append((n, x0, y0, x1 + 1, y1 + 1))
    return out


def crop_glyph(im: Image.Image) -> Image.Image:
    grey = np.array(im.convert("L"))
    h, w = grey.shape
    ink = grey < INK
    ink[:, : int(w * 0.36)] = False
    parts = ink_components(ink)
    if not parts:
        return im
    parts.sort(key=lambda p: -p[0])
    # Glyph cluster sits upper-right. Titles sit lower. Keep blobs near the heaviest ink.
    head = parts[:12]
    cy = sorted((p[2] + p[4]) / 2 for p in head)[len(head) // 2]
    keep = [p for p in parts if abs(((p[2] + p[4]) / 2) - cy) < h * 0.28]
    if not keep:
        keep = head
    x0 = min(p[1] for p in keep)
    y0 = min(p[2] for p in keep)
    x1 = max(p[3] for p in keep)
    y1 = max(p[4] for p in keep)
    band = ink[y0:y1, x0:x1]
    fill = band.mean(axis=1) if band.size else np.array([])
    cut = None
    last_ink = 0
    for i, f in enumerate(fill):
        if f > 0.045:
            last_ink = i
        elif i > len(fill) * 0.58 and f < 0.008 and last_ink > len(fill) * 0.35:
            cut = last_ink + 1
            break
    if cut:
        y1 = y0 + cut
    pad = 14
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad)
    y1 = min(h, y1 + pad)
    return im.crop((x0, y0, x1, y1)).convert("RGBA")


def flatten_white(im: Image.Image) -> Image.Image:
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
    return bg.convert("RGB")


def to_square(im: Image.Image, size: int = SIZE) -> Image.Image:
    rgb = flatten_white(im)
    w, h = rgb.size
    side = max(w, h)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(rgb, ((side - w) // 2, (side - h) // 2))
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    for file_name, n, slug in FRAMES:
        src = SRC / file_name
        glyph = to_square(crop_glyph(Image.open(src)))
        dest = OUT / f"{n}-{slug}.png"
        glyph.save(dest, "PNG")
        frames.append(glyph)
        print(f"{n} {slug} {dest} {glyph.size}")
    first, rest = frames[0], frames[1:]
    first.save(
        GIF,
        save_all=True,
        append_images=rest,
        duration=720,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"gif {GIF} {GIF.stat().st_size} bytes")


if __name__ == "__main__":
    main()
