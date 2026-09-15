#!/usr/bin/env python3
"""Put ModYu and DAA house copy into the asset hub as .txt documents.

Files land in Site/public/press/{kit}/docs/ and in _meta/assets/index.json,
the same way a studio note would. They are not shared onto the journalist
kit until someone ticks On the press kit.

Sources (read, do not rewrite the houses):
  ModYu — Dave’s HT4 EPK copy already in Site/src/lib/epk-docs/modyu.ts
  DAA   — /home/main/DAA/_meta/assets/daa.json (site pack)

Idempotent on href. Re-run overwrites the text files and keeps the index id.
"""
from __future__ import annotations

import json
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path

ROOT = Path("/home/main/DLN")
PUBLIC = ROOT / "Site" / "public"
INDEX = ROOT / "_meta" / "assets" / "index.json"
DAA_PACK = Path("/home/main/DAA/_meta/assets/daa.json")

MODYU_NOTE = "From Dave’s HT4 electronic press kit. Off the journalist pack until ticked."
DAA_NOTE = "From the Digital Adoption Advisor site pack. Off the journalist pack until ticked."

PAGE_TITLE = {
    "home": "Home",
    "situations": "Situations",
    "programme-to-operations": "Situation — Programme to operations",
    "making-change-stick": "Situation — Making change stick",
    "value-evidence-governance-handover-situation": "Situation — Value evidence still with the programme",
    "digital-adoption-capability": "Situation — Digital Adoption as a tool function",
    "recovering-value-after-go-live": "Situation — Value leaking after go-live",
    "adoption-evidence-business-outcomes": "Situation — Adoption data and business outcomes",
    "enterprise-value-diagnosis": "Situation — Enterprise value diagnosis",
    "value-assurance-governance": "Situation — Ongoing value assurance",
    "how-daa-helps": "How DAA helps",
    "operational-readiness": "Operational Readiness",
    "intelligent-change-transition": "Intelligent Change Transition",
    "value-evidence-governance-handover": "Value Evidence & Governance Handover",
    "digital-adoption-coe": "Digital Adoption CoE Design & Build",
    "value-performance-optimisation": "Value Performance & Optimisation",
    "daa-sessions": "DAA Sessions",
    "value-optimisation-review": "Value Optimisation Review",
    "value-assurance-office": "Value Assurance Office",
    "daa-council": "DAA Council",
    "about": "About DAA",
    "insights": "Insights",
    "contact": "Contact",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def slugify(title: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    return (s[:72] or "note")


def tidy(text: str) -> str:
    text = text.replace("\r\n", "\n").strip() + "\n"
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        return "\n\n".join(part for v in value if (part := as_text(v)))
    if isinstance(value, dict):
        for key in ("text", "body", "line", "title", "label"):
            got = as_text(value.get(key))
            if got:
                return got
        return ""
    return str(value).strip()


def flatten_section(section: dict) -> str:
    bits: list[str] = []
    heading = (section.get("heading") or "").strip()
    if heading:
        bits.append(heading)
        bits.append("")
    for para in section.get("paragraphs") or []:
        if isinstance(para, str) and para.strip():
            bits.append(para.strip())
            bits.append("")
    items = section.get("items") or []
    for item in items:
        if isinstance(item, str) and item.strip():
            bits.append(f"- {item.strip()}")
        elif isinstance(item, dict):
            label = (item.get("text") or item.get("title") or item.get("label") or "").strip()
            if label:
                bits.append(f"- {label}")
    if items:
        bits.append("")
    numbered = section.get("numbered") or []
    for i, item in enumerate(numbered, 1):
        if isinstance(item, str) and item.strip():
            bits.append(f"{i}. {item.strip()}")
        elif isinstance(item, dict):
            label = (item.get("text") or item.get("title") or "").strip()
            if label:
                bits.append(f"{i}. {label}")
    if numbered:
        bits.append("")
    routes = section.get("routes") or []
    labels = []
    for route in routes:
        if isinstance(route, dict):
            labels.append((route.get("label") or route.get("page") or "").strip())
        elif isinstance(route, str):
            labels.append(route.strip())
    labels = [x for x in labels if x]
    if labels:
        bits.append("See also: " + "; ".join(labels))
        bits.append("")
    return "\n".join(bits).rstrip()


def flatten_page(page: dict) -> str:
    parts: list[str] = []
    eyebrow = (page.get("eyebrow") or "").strip()
    h1 = (page.get("h1") or page.get("title") or "").strip()
    if eyebrow:
        parts.append(eyebrow)
        parts.append("")
    if h1:
        parts.append(h1)
        parts.append("")
    for lede in page.get("ledes") or []:
        if isinstance(lede, str) and lede.strip():
            parts.append(lede.strip())
            parts.append("")
    for section in page.get("sections") or []:
        block = flatten_section(section)
        if block:
            parts.append(block)
            parts.append("")
    return tidy("\n".join(parts))


def flatten_blocks(blocks: list) -> str:
    lines: list[str] = []
    for block in blocks or []:
        if not isinstance(block, dict):
            continue
        kind = (block.get("type") or "p").lower()
        text = (block.get("text") or "").strip()
        if not text:
            continue
        if kind in ("h1", "h2", "h3", "h4"):
            if lines and lines[-1] != "":
                lines.append("")
            lines.append(text)
            lines.append("")
        elif kind == "li":
            lines.append(f"- {text}")
        else:
            lines.append(text)
            lines.append("")
    out: list[str] = []
    blank = False
    for line in lines:
        if line == "":
            if not blank:
                out.append("")
            blank = True
        else:
            out.append(line)
            blank = False
    return tidy("\n".join(out))


def insight_text(item: dict) -> str:
    parts: list[str] = []
    title = (item.get("title") or "").strip()
    date = (item.get("date") or "").strip()
    excerpt = (item.get("excerpt") or "").strip()
    if title:
        parts.append(title)
        parts.append("")
    if date:
        parts.append(date)
        parts.append("")
    if excerpt and excerpt != date:
        parts.append(excerpt)
        parts.append("")
    parts.append(flatten_blocks(item.get("blocks") or []).rstrip())
    return tidy("\n".join(parts))


def advisor_text(person: dict) -> str:
    parts: list[str] = []
    name = (person.get("name") or "").strip()
    role = (person.get("role") or "").strip()
    if name:
        parts.append(name)
    if role:
        parts.append(role)
        parts.append("")
    email = (person.get("email") or "").strip()
    if email:
        parts.append(email)
        parts.append("")
    lede = (person.get("lede") or "").strip()
    if lede:
        parts.append(lede)
        parts.append("")
    for para in person.get("body") or []:
        if isinstance(para, str) and para.strip():
            parts.append(para.strip())
            parts.append("")
    return tidy("\n".join(parts))


def company_text(company: dict) -> str:
    rows = [
        ("Name", company.get("name")),
        ("Legal", company.get("legal")),
        ("Company number", company.get("number")),
        ("Enquiries", company.get("email")),
        ("Published email", company.get("publishedEmail")),
        ("Named party", company.get("party")),
        ("Party email", company.get("partyEmail")),
        ("Address", ", ".join(company.get("address") or [])),
        ("Line", company.get("line")),
        ("Voice", company.get("voice")),
    ]
    lines = ["Digital Adoption Advisor", ""]
    for label, value in rows:
        if value:
            lines.append(f"{label}: {value}")
    return tidy("\n".join(lines))


def hypertrack_text(track: dict) -> str:
    page = {
        "eyebrow": track.get("kicker") or "HyperTrack™",
        "h1": track.get("title") or "HyperTrack™",
        "ledes": track.get("ledes") or [],
        "sections": track.get("sections") or [],
    }
    extra: list[str] = []
    for cloud in track.get("clouds") or []:
        extra.append(as_text(cloud.get("label")))
        extra.append("")
        extra.append(as_text(cloud.get("line")))
        extra.append("")
        extra.append(as_text(cloud.get("body")))
        extra.append("")
    return tidy(flatten_page(page).rstrip() + "\n\n" + "\n".join(extra))


def lifecycle_text(life: dict) -> str:
    page = {
        "eyebrow": life.get("kicker") or "Lifecycle",
        "h1": life.get("title") or "Lifecycle",
        "ledes": life.get("ledes") or [],
        "sections": life.get("sections") or [],
    }
    extra: list[str] = []
    for stage in life.get("stages") or []:
        extra.append(as_text(stage.get("label") or stage.get("slug")))
        extra.append("")
        extra.append(as_text(stage.get("line")))
        extra.append("")
        extra.append(as_text(stage.get("lede")))
        extra.append("")
        extra.append(as_text(stage.get("body")))
        extra.append("")
    return tidy(flatten_page(page).rstrip() + "\n\n" + "\n".join(extra))


def daa_docs(pack: dict) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    out.append(("Company", company_text(pack["company"])))
    groups = pack.get("groups") or []
    if groups:
        bits = ["How the work is grouped", ""]
        bits.append("DAA starts from what you can see. The route follows the situation — not a forced pathway.")
        bits.append("")
        for group in groups:
            bits.append((group.get("title") or "").strip())
            bits.append("")
            bits.append((group.get("line") or "").strip())
            bits.append("")
        out.append(("How the work is grouped", tidy("\n".join(bits))))
    used: set[str] = set()
    for page in pack.get("pages") or []:
        pid = page.get("id") or ""
        title = PAGE_TITLE.get(pid) or (page.get("navTitle") or page.get("h1") or pid or "Page").strip()
        key = title.lower()
        if key in used:
            title = f"{title} ({pid})"
        used.add(title.lower())
        out.append((title, flatten_page(page)))
    if pack.get("hypertrack"):
        out.append(("HyperTrack", hypertrack_text(pack["hypertrack"])))
    if pack.get("lifecycle"):
        out.append(("Lifecycle", lifecycle_text(pack["lifecycle"])))
    for person in pack.get("advisors") or []:
        name = (person.get("name") or "Advisor").strip()
        out.append((name, advisor_text(person)))
    for item in pack.get("insights") or []:
        title = (item.get("title") or item.get("slug") or "Insight").strip()
        out.append((title, insight_text(item)))
    return out


def load_modyu_docs() -> list[tuple[str, str]]:
    from seed_kit_text_modyu import modyu_docs

    return list(modyu_docs())


def upsert(index: dict, kit: str, title: str, body: str, note: str, slug: str) -> str:
    href = f"/press/{kit}/docs/{slug}.txt"
    dest = PUBLIC / href.lstrip("/")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(tidy(body), encoding="utf-8")
    items = index.setdefault("items", [])
    for item in items:
        if item.get("href") == href:
            item["title"] = title
            item["kind"] = "text"
            item["kit"] = kit
            item["note"] = note
            item["flags"] = {"share": False}
            return "update"
    items.append(
        {
            "id": str(uuid.uuid4()),
            "href": href,
            "title": title,
            "kind": "text",
            "flags": {"share": False},
            "kit": kit,
            "note": note,
            "addedAt": now_iso(),
        }
    )
    return "add"


def unique_slugs(docs: list[tuple[str, str]]) -> list[tuple[str, str, str]]:
    seen: dict[str, int] = {}
    out: list[tuple[str, str, str]] = []
    for title, body in docs:
        base = slugify(title)
        n = seen.get(base, 0)
        seen[base] = n + 1
        slug = base if n == 0 else f"{base}-{n + 1}"
        out.append((title, body, slug))
    return out


def load_index() -> dict:
    if INDEX.exists():
        parsed = json.loads(INDEX.read_text(encoding="utf-8"))
        if isinstance(parsed, dict) and isinstance(parsed.get("items"), list):
            return parsed
    return {"items": []}


def save_index(index: dict) -> None:
    INDEX.parent.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    if not DAA_PACK.exists():
        print(f"missing DAA pack: {DAA_PACK}", file=sys.stderr)
        return 1
    pack = json.loads(DAA_PACK.read_text(encoding="utf-8"))
    index = load_index()
    added = updated = 0
    for kit, note, docs in (
        ("modyu", MODYU_NOTE, load_modyu_docs()),
        ("daa", DAA_NOTE, daa_docs(pack)),
    ):
        for title, body, slug in unique_slugs(docs):
            action = upsert(index, kit, title, body, note, slug)
            if action == "add":
                added += 1
            else:
                updated += 1
    save_index(index)
    text = [i for i in index["items"] if i.get("kind") == "text"]
    print(
        f"seeded text assets: +{added} ~{updated} · index {len(index['items'])} items · "
        f"{sum(1 for i in text if i.get('kit')=='modyu')} ModYu · "
        f"{sum(1 for i in text if i.get('kit')=='daa')} DAA"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
