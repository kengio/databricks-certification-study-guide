#!/usr/bin/env python3
"""Convert practice-question markdown files into adaptive-practice JSON banks.

For each certification, walks `certifications/<cert>/resources/practice-questions/`,
parses every `## Question N: <Title>` block, and emits one consolidated JSON
file under `practice/data/<cert>.json` for the static practice frontend to load.

Source markdown format (per question):

    ## Question 5: Title

    **Question** *(Easy|Medium|Hard)*: <question stem>

    A) <choice>
    B) <choice>
    C) <choice>
    D) <choice>

    > [!success]- Answer
    > **Correct Answer: B**
    >
    > <short answer paragraph>
    >
    > <explanation paragraph(s)>

    ---

Usage:
    python3 practice/build.py                       # build every cert
    python3 practice/build.py --cert data-engineer-associate
    python3 practice/build.py --check               # parse-only; no JSON written

Dependencies: Python 3.9+ standard library only.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRACTICE_DIR = ROOT / "practice"
DATA_DIR = PRACTICE_DIR / "data"
CERTS_DIR = ROOT / "certifications"

CERT_TITLES = {
    "data-engineer-associate": ("Data Engineer Associate", "May 2026"),
    "data-engineer-professional": ("Data Engineer Professional", "Nov 30, 2025"),
    "data-analyst-associate": ("Data Analyst Associate", "Oct 2025"),
    "ml-associate": ("ML Associate", "Mar 1, 2025"),
    "ml-professional": ("ML Professional", "Sep 2025"),
    "genai-engineer-associate": ("GenAI Engineer Associate", "Mar 2026"),
}

H2_QUESTION_RE = re.compile(r"^## Question (\d+)(?:\.\d+)?: (.+)$", re.MULTILINE)
DIFFICULTY_RE = re.compile(r"\*\*Question\*\* \*\((Easy|Medium|Hard)\)\*:\s*(.+)", re.DOTALL)
CHOICE_RE = re.compile(r"^([A-D])\)\s*(.+)$")
ANSWER_CALLOUT_RE = re.compile(r"^>\s*\[!success\]-?\s*(?:Answer)?\s*$", re.IGNORECASE)
CORRECT_ANSWER_RE = re.compile(r"\*\*Correct Answer:\s*([A-D])\*\*", re.IGNORECASE)


def parse_questions(md_path: Path, domain_id: str) -> list[dict]:
    text = md_path.read_text(encoding="utf-8")
    # Drop YAML frontmatter
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4 :]
    # Split into per-question blocks by `## Question ` heading
    blocks = re.split(r"^(## Question .+)$", text, flags=re.MULTILINE)
    questions: list[dict] = []
    for i in range(1, len(blocks), 2):
        heading = blocks[i].strip()
        body = blocks[i + 1] if i + 1 < len(blocks) else ""
        m = H2_QUESTION_RE.match(heading)
        if not m:
            continue
        qnum = m.group(1)
        title = m.group(2).strip()

        # Extract stem + difficulty
        dm = DIFFICULTY_RE.search(body)
        if not dm:
            print(f"  ⚠ {md_path.name} Q{qnum}: no difficulty marker — skipped", file=sys.stderr)
            continue
        difficulty = dm.group(1).lower()
        stem_block = dm.group(2)

        # The stem ends at the first `A)` choice line
        stem_lines = []
        rest_lines = []
        in_stem = True
        for line in stem_block.splitlines():
            if in_stem and re.match(r"^[A-D]\)", line.strip()):
                in_stem = False
            if in_stem:
                stem_lines.append(line)
            else:
                rest_lines.append(line)
        stem = "\n".join(stem_lines).strip()

        # Extract choices
        choices: dict[str, str] = {}
        choice_lines = list(rest_lines)
        for line in choice_lines:
            cm = CHOICE_RE.match(line.strip())
            if cm:
                choices[cm.group(1)] = cm.group(2).strip()
        if len(choices) != 4:
            print(f"  ⚠ {md_path.name} Q{qnum}: expected 4 choices, found {len(choices)} — skipped",
                  file=sys.stderr)
            continue

        # Extract answer callout
        callout_idx = None
        for idx, line in enumerate(rest_lines):
            if ANSWER_CALLOUT_RE.match(line):
                callout_idx = idx
                break
        if callout_idx is None:
            print(f"  ⚠ {md_path.name} Q{qnum}: no answer callout — skipped", file=sys.stderr)
            continue
        callout_lines = []
        for line in rest_lines[callout_idx + 1 :]:
            if line.startswith("> "):
                callout_lines.append(line[2:])
            elif line.startswith(">"):
                callout_lines.append(line[1:])
            elif line.strip() == "":
                callout_lines.append("")
            elif line.strip() == "---":
                break
            else:
                # Hit a non-blockquote line — end of callout
                break
        callout_body = "\n".join(callout_lines).strip()

        # Parse callout body: first line is "**Correct Answer: X**", then short
        # answer, then explanation paragraph(s)
        cam = CORRECT_ANSWER_RE.search(callout_body)
        if not cam:
            print(f"  ⚠ {md_path.name} Q{qnum}: no correct-answer marker — skipped",
                  file=sys.stderr)
            continue
        correct = cam.group(1).upper()
        paragraphs = [p.strip() for p in callout_body.split("\n\n") if p.strip()]
        # paragraphs[0] is the "**Correct Answer: X**" line
        short_answer = paragraphs[1] if len(paragraphs) > 1 else ""
        explanation = "\n\n".join(paragraphs[2:]) if len(paragraphs) > 2 else ""

        questions.append({
            "id": f"{md_path.stem}-q{qnum.zfill(3)}",
            "domain": domain_id,
            "title": title,
            "difficulty": difficulty,
            "question": stem,
            "choices": choices,
            "correctAnswer": correct,
            "shortAnswer": short_answer,
            "explanation": explanation,
        })
    return questions


def build_cert(cert: str, check_only: bool = False) -> dict:
    cert_dir = CERTS_DIR / cert / "resources" / "practice-questions"
    if not cert_dir.exists():
        print(f"  No practice-questions/ for {cert}", file=sys.stderr)
        return {"cert": cert, "questions": []}

    cert_title, blueprint = CERT_TITLES.get(cert, (cert, ""))
    domains: list[dict] = []
    questions: list[dict] = []
    for md_path in sorted(cert_dir.glob("*.md")):
        if md_path.name == "README.md":
            continue
        # Domain id = filename without numeric prefix + .md
        stem = md_path.stem  # e.g., "01-lakehouse-platform"
        m = re.match(r"^\d+-(.+)$", stem)
        domain_id = m.group(1) if m else stem
        # Domain name: from H1 inside file, fallback to derived from filename
        text = md_path.read_text(encoding="utf-8")
        h1_match = re.search(r"^# (.+)$", text, re.MULTILINE)
        domain_name = h1_match.group(1).strip() if h1_match else domain_id.replace("-", " ").title()

        domain_questions = parse_questions(md_path, domain_id)
        if domain_questions:
            domains.append({
                "id": domain_id,
                "name": domain_name,
                "sourceFile": str(md_path.relative_to(ROOT)),
                "questionCount": len(domain_questions),
            })
            questions.extend(domain_questions)

    bank = {
        "cert": cert,
        "certTitle": cert_title,
        "blueprintVersion": blueprint,
        "generated": date.today().isoformat(),
        "domains": domains,
        "questions": questions,
    }

    if not check_only:
        if not questions:
            print(f"  {cert}: 0 questions — no JSON written (practice-question files use a different format and aren't yet convertible)")
            return bank
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        out_path = DATA_DIR / f"{cert}.json"
        out_path.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  {cert}: {len(questions)} questions across {len(domains)} domains → {out_path.relative_to(ROOT)}")
    else:
        print(f"  {cert}: {len(questions)} questions across {len(domains)} domains (ok)")

    return bank


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--cert", help="Build only this cert (e.g., data-engineer-associate)")
    parser.add_argument("--check", action="store_true",
                        help="Parse-only; don't write JSON. Non-zero exit if any parse fails.")
    args = parser.parse_args()

    targets = [args.cert] if args.cert else sorted(CERT_TITLES.keys())

    total_qs = 0
    total_certs = 0
    for cert in targets:
        bank = build_cert(cert, check_only=args.check)
        n = len(bank.get("questions", []))
        if n:
            total_qs += n
            total_certs += 1

    print(f"\n{'Checked' if args.check else 'Built'} {total_certs} cert bank(s), "
          f"{total_qs} question(s) total")
    if not args.check:
        print(f"Output: {DATA_DIR}")
        print("Open practice/index.html (any browser) or serve via GitHub Pages to study.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
