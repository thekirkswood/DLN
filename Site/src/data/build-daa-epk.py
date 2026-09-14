#!/usr/bin/env python3
"""Slim DAA content pack → journalist EPK. Source is the DAA house pack. Do not rewrite DAA."""

from __future__ import annotations

import json
from pathlib import Path

SRC = Path("/home/main/DAA/_meta/assets/daa.json")
OUT = Path(__file__).with_name("daa-epk.json")


def main() -> None:
    raw = json.loads(SRC.read_text())
    company = raw["company"]
    about = raw["about"]["page"]
    how = next(s for s in about["sections"] if s.get("heading") == "How we work")
    here = next(s for s in about["sections"] if s.get("heading") == "What DAA is here to do")
    start = next(s for s in about["sections"] if s.get("heading") == "How to start")
    principles = [p for p in how["paragraphs"] if p != "What DAA is not"]
    not_paras = []
    seen_not = False
    for p in how["paragraphs"]:
        if p == "What DAA is not":
            seen_not = True
            continue
        if seen_not:
            not_paras.append(p)

    offerings = []
    for o in raw["offerings"]:
        banner = o.get("banner") or {}
        offerings.append(
            {
                "id": o["id"],
                "badge": o.get("badge") or o.get("short"),
                "group": o.get("group"),
                "title": banner.get("title") or o.get("option") or o["id"],
                "line": o.get("line"),
                "question": banner.get("question") or o.get("line"),
                "lede": (o.get("ledes") or [None])[0],
            }
        )

    situations = []
    for s in raw["situations"]:
        situations.append(
            {
                "id": s["id"],
                "title": s.get("title"),
                "question": s.get("question"),
            }
        )

    advisors = []
    for a in raw["advisors"]:
        body = [p for p in (a.get("body") or []) if "workshop" not in p.lower()]
        advisors.append(
            {
                "slug": a["slug"],
                "name": a["name"],
                "role": a["role"],
                "email": a.get("email"),
                "lede": a.get("lede"),
                "body": body,
                "image": a.get("image"),
            }
        )

    ht = raw["hypertrack"]
    slim = {
        "version": raw.get("version"),
        "source": "DAA/_meta/assets/daa.json",
        "company": {
            "name": company["name"],
            "legal": company["legal"],
            "number": company["number"],
            "email": company["publishedEmail"] or company["email"],
            "party": company["party"],
            "address": company["address"],
            "line": company["line"],
            "voice": company["voice"],
        },
        "fields": [
            {"id": f["id"], "src": f["src"], "ground": f.get("ground")}
            for f in raw["visual"]["fields"]
        ],
        "groups": [
            {"id": g["id"], "title": g["title"], "line": g["line"]}
            for g in raw["groups"]
        ],
        "offerings": offerings,
        "situations": situations,
        "about": {
            "h1": about["h1"],
            "ledes": about["ledes"],
            "here": here["paragraphs"],
            "principles": principles,
            "not": not_paras,
            "start": start["paragraphs"],
        },
        "hypertrack": {
            "kicker": ht["kicker"],
            "title": ht["title"],
            "ledes": ht["ledes"],
            "for": ht["sections"][0]["paragraphs"],
            "leave": ht["sections"][1]["paragraphs"],
            "clouds": [
                {"label": c["label"], "line": c["line"], "body": (c.get("body") or [None])[0]}
                for c in ht["clouds"]
            ],
        },
        "sessions": {
            "h1": raw["sessions"]["page"]["h1"],
            "ledes": raw["sessions"]["page"]["ledes"],
            "note": raw["sessions"].get("note"),
            "formats": raw["sessions"]["formats"],
        },
        "council": {
            "h1": raw["council"]["page"]["h1"],
            "eyebrow": raw["council"]["page"].get("eyebrow"),
            "ledes": raw["council"]["page"]["ledes"],
            "why": (raw["council"]["page"]["sections"][0].get("paragraphs") or [])[:2],
        },
        "advisors": advisors,
    }
    OUT.write_text(json.dumps(slim, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
