#!/usr/bin/env python3
"""Convert markdown deck source files into Anki-importable TSV.

Reads:  anki/decks/**/*.md (excluding README.md files)
Writes: anki/build/<same-relative-path>.txt   (tab-separated: Front \t Back \t Tags)

The TSV format Anki expects (File → Import → "Fields separated by: Tab"):
    Front[TAB]Back[TAB]Tags

Card boundaries: each H2 heading (## …) starts a new card. The H2 title is
rendered bold at the top of the Front. The body up to the answer callout is
the rest of the Front. The text inside `> [!success]- Answer` (or just
`> [!success]-`) is the Back. Tags come from the file's YAML frontmatter.

Usage:
    python anki/build.py                # build every deck under anki/decks/
    python anki/build.py --deck shared/delta-lake.md   # build one deck
    python anki/build.py --check        # parse-only; non-zero exit on any error

Dependencies: Python 3.9+ standard library only. No pip install required.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DECKS_DIR = ROOT / "decks"
BUILD_DIR = ROOT / "build"

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
H2_SPLIT_RE = re.compile(r"^## ", re.MULTILINE)
ANSWER_CALLOUT_RE = re.compile(r"^>\s*\[!success\]-?\s*(?:Answer)?\s*$", re.IGNORECASE)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Very small YAML-subset parser. Supports scalar values and string lists."""
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}, text
    yaml_block = m.group(1)
    body = text[m.end():]
    fm: dict = {}
    current_key: str | None = None
    for raw in yaml_block.splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw.startswith("  - ") or raw.startswith("- "):
            if current_key is None:
                continue
            value = raw.lstrip("- ").strip()
            fm.setdefault(current_key, []).append(value)
        elif ":" in raw and not raw.startswith(" "):
            key, _, value = raw.partition(":")
            current_key = key.strip()
            value = value.strip()
            if value:
                fm[current_key] = value
            else:
                fm[current_key] = []
    return fm, body


def parse_cards(body: str, source: Path) -> list[tuple[str, str, str]]:
    """Return [(title, front_body, back_body), …]. front_body and back_body
    may be multi-line and contain markdown."""
    cards: list[tuple[str, str, str]] = []
    sections = H2_SPLIT_RE.split(body)
    for idx, section in enumerate(sections):
        if idx == 0:
            continue  # text before the first H2 is preamble — skip
        lines = section.splitlines()
        if not lines:
            continue
        title = lines[0].strip()
        if not title:
            continue
        answer_idx = None
        for i, line in enumerate(lines[1:], start=1):
            if ANSWER_CALLOUT_RE.match(line):
                answer_idx = i
                break
        if answer_idx is None:
            print(f"  ⚠ {source}: card '{title}' has no '> [!success]-' answer callout — skipped",
                  file=sys.stderr)
            continue
        front_lines = lines[1:answer_idx]
        back_lines = lines[answer_idx + 1:]
        front_body = "\n".join(front_lines).strip()
        back_body_lines = []
        for ln in back_lines:
            if ln.startswith("> "):
                back_body_lines.append(ln[2:])
            elif ln.startswith(">"):
                back_body_lines.append(ln[1:])
            elif ln.strip() == "":
                back_body_lines.append("")
            else:
                # Hit a non-blockquote line — end of answer callout
                break
        back_body = "\n".join(back_body_lines).strip()
        if not front_body or not back_body:
            print(f"  ⚠ {source}: card '{title}' has empty front or back — skipped",
                  file=sys.stderr)
            continue
        cards.append((title, front_body, back_body))
    return cards


def to_anki_html(text: str) -> str:
    """Convert markdown line breaks to Anki's <br>, preserving fenced code spans
    visually. Tabs become spaces (TSV constraint). This is intentionally minimal —
    Anki accepts HTML, and markdown text usually renders fine inside <br>-joined
    lines for question/answer cards."""
    text = text.replace("\t", "    ")
    return text.replace("\n", "<br>")


def build_one(md_path: Path) -> int:
    text = md_path.read_text(encoding="utf-8")
    fm, body = parse_frontmatter(text)
    cards = parse_cards(body, md_path.relative_to(ROOT))
    if not cards:
        return 0
    deck_name = fm.get("deck", f"Databricks::{md_path.stem}")
    tags = fm.get("tags", [])
    if isinstance(tags, str):
        tags = [tags]
    tag_str = " ".join(t.replace(" ", "_") for t in tags)

    rel = md_path.relative_to(DECKS_DIR)
    out_path = BUILD_DIR / rel.with_suffix(".txt")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        f.write("#separator:tab\n")
        f.write("#html:true\n")
        f.write(f"#deck:{deck_name}\n")
        f.write("#columns:Front\tBack\tTags\n")
        for title, front_body, back_body in cards:
            front_html = f"<b>{title}</b><br><br>{to_anki_html(front_body)}"
            back_html = to_anki_html(back_body)
            f.write(f"{front_html}\t{back_html}\t{tag_str}\n")
    print(f"  {rel} → {len(cards)} cards → {out_path.relative_to(ROOT)}")
    return len(cards)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--deck", help="Build only this deck (path relative to anki/decks/)")
    parser.add_argument("--check", action="store_true",
                        help="Parse-only; don't write output. Non-zero exit if any deck has problems.")
    args = parser.parse_args()

    if not DECKS_DIR.exists():
        print(f"No deck source dir at {DECKS_DIR}", file=sys.stderr)
        return 1

    if args.deck:
        targets = [DECKS_DIR / args.deck]
    else:
        targets = sorted(p for p in DECKS_DIR.rglob("*.md") if p.name != "README.md")

    if not targets:
        print("No deck files found.")
        return 0

    if not args.check:
        BUILD_DIR.mkdir(parents=True, exist_ok=True)

    total_cards = 0
    total_decks = 0
    for md_path in targets:
        if args.check:
            text = md_path.read_text(encoding="utf-8")
            _, body = parse_frontmatter(text)
            cards = parse_cards(body, md_path.relative_to(ROOT))
            if cards:
                print(f"  {md_path.relative_to(ROOT)} → {len(cards)} cards (ok)")
                total_cards += len(cards)
                total_decks += 1
        else:
            n = build_one(md_path)
            if n:
                total_cards += n
                total_decks += 1

    print(f"\n{'Checked' if args.check else 'Built'} {total_decks} deck(s), "
          f"{total_cards} card(s) total")
    if not args.check:
        print(f"Output: {BUILD_DIR}")
        print("Import into Anki: File → Import → select each .txt file.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
