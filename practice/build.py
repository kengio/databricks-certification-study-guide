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

# Three heading formats found in the wild:
#   Format A: `## Question 5: Title`               (difficulty in body via `**Question** *(...)*:`)
#   Format B: `## Question 5 *(Medium)*: Title`    (difficulty between number and colon)
#   Format C: `## Question 5: Title *(Medium)*`    (difficulty appended after title)
# All three are detected from a single heading line; the body may or may not
# start with `**Question**:` regardless of which heading format is used.
H2_NUMBER_RE = re.compile(r"^## Question (\d+)(?:\.\d+)?(.*)$")
HEADING_DIFFICULTY_RE = re.compile(r"\*\(\s*(Easy|Medium|Hard)\s*\)\*", re.IGNORECASE)
BODY_DIFFICULTY_RE = re.compile(r"\*\*Question\*\* \*\((Easy|Medium|Hard)\)\*:\s*(.+)", re.DOTALL)
BODY_QUESTION_PREFIX_RE = re.compile(r"\*\*Question\*\*:\s*(.+)", re.DOTALL)
CHOICE_RE = re.compile(r"^([A-D])\)\s*(.+?)\s*$")
ANSWER_CALLOUT_RE = re.compile(r"^>\s*\[!success\]-?\s*(?:Answer)?\s*$", re.IGNORECASE)
# Correct-answer markers seen in the wild:
#   **Correct Answer: B**
#   **Correct Answer: B) full choice text**
#   **Correct Answer:** B
CORRECT_ANSWER_RE = re.compile(
    r"\*\*Correct Answer:?\s*\*?\*?\s*([A-D])\b", re.IGNORECASE)


def parse_heading(heading_line: str):
    """Return (qnum, title, difficulty_from_heading_or_None) or (None, None, None)."""
    m = H2_NUMBER_RE.match(heading_line)
    if not m:
        return None, None, None
    qnum = m.group(1)
    rest = m.group(2)  # everything after `## Question N`
    diff_match = HEADING_DIFFICULTY_RE.search(rest)
    difficulty = diff_match.group(1).lower() if diff_match else None
    # Strip the difficulty marker + any leading `: ` to get a clean title
    title = HEADING_DIFFICULTY_RE.sub("", rest)
    title = title.strip().lstrip(":").strip()
    if not title:
        title = f"Question {qnum}"
    return qnum, title, difficulty


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

        qnum, title, heading_difficulty = parse_heading(heading)
        if qnum is None:
            continue

        if heading_difficulty:
            # Format B or C — difficulty already in heading
            difficulty = heading_difficulty
            # Stem: from body after `**Question**:` if present, else whole body
            # (the choice-detection step below cuts at the first `A)` line either way)
            sm = BODY_QUESTION_PREFIX_RE.search(body)
            stem_block = sm.group(1) if sm else body
        else:
            # Format A — look for `**Question** *(...)*: stem` in body
            dm = BODY_DIFFICULTY_RE.search(body)
            if not dm:
                print(f"  ⚠ {md_path.name} Q{qnum}: no difficulty marker — skipped",
                      file=sys.stderr)
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


# Section heading inside a mock-exam questions.md, e.g.
#   "## Databricks Lakehouse Platform (Questions 1–11)"
DOMAIN_SECTION_RE = re.compile(
    r"^## (.+?)\s*\(Questions?\s+[\d\-–—]+\)\s*$")
# Lightweight Q-heading detector for the mock pre-scan
SIMPLE_Q_HEADING_RE = re.compile(r"^## Question (\d+)(?:\.\d+)?")


def slugify(name: str) -> str:
    s = re.sub(r"[^\w\s-]", "", name).strip().lower()
    return re.sub(r"[-\s]+", "-", s) or "section"


def build_mock(cert: str, exam_n: int, check_only: bool = False) -> dict:
    """Build a mock-exam bank for `cert` exam number `exam_n` (1 or 2).

    Mock-exam files contain all questions in one `questions.md`, with
    intra-file H2 section headings demarcating domains, e.g.

        ## Databricks Lakehouse Platform (Questions 1–11)
        ## Question 1 *(Medium)*
        ...

    We first scan the file linearly to build a qnum→domain map, then reuse
    parse_questions() and overlay the per-question domain from the map.
    """
    folder = "mock-exam" if exam_n == 1 else f"mock-exam-{exam_n}"
    md_path = CERTS_DIR / cert / "resources" / folder / "questions.md"
    bank_id = f"{cert}-mock-{exam_n}"
    cert_title_base, blueprint = CERT_TITLES.get(cert, (cert, ""))
    cert_title = f"{cert_title_base} — Mock Exam {exam_n}"

    if not md_path.exists():
        return {"cert": bank_id, "questions": []}

    text = md_path.read_text(encoding="utf-8")
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4:]

    # Pre-scan for domain boundaries
    current_domain_id = "general"
    current_domain_name = "General"
    domain_order: list[tuple[str, str]] = []
    qnum_to_domain: dict[str, str] = {}
    for line in text.splitlines():
        d_match = DOMAIN_SECTION_RE.match(line)
        if d_match:
            current_domain_name = d_match.group(1).strip()
            current_domain_id = slugify(current_domain_name)
            if not any(d[0] == current_domain_id for d in domain_order):
                domain_order.append((current_domain_id, current_domain_name))
            continue
        q_match = SIMPLE_Q_HEADING_RE.match(line)
        if q_match:
            qnum_to_domain[q_match.group(1)] = current_domain_id

    # Reuse the standard question parser, then overlay per-question domain
    raw_questions = parse_questions(md_path, "mock")
    for q in raw_questions:
        # Original id is "questions-q005" — rewrite to include cert + mock #
        original_qnum = q["id"].rsplit("-q", 1)[-1]
        try:
            qnum_int = str(int(original_qnum))
        except ValueError:
            qnum_int = original_qnum
        q["id"] = f"{bank_id}-q{original_qnum}"
        q["domain"] = qnum_to_domain.get(qnum_int, "general")

    domains: list[dict] = []
    for did, dname in domain_order:
        count = sum(1 for q in raw_questions if q["domain"] == did)
        if count > 0:
            domains.append({
                "id": did,
                "name": dname,
                "sourceFile": str(md_path.relative_to(ROOT)),
                "questionCount": count,
            })

    bank = {
        "cert": bank_id,
        "certTitle": cert_title,
        "blueprintVersion": blueprint,
        "generated": date.today().isoformat(),
        "domains": domains,
        "questions": raw_questions,
        "kind": "mock",
        "sourceCert": cert,
    }

    if not check_only:
        if not raw_questions:
            print(f"  {bank_id}: 0 questions")
            return bank
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        out_path = DATA_DIR / f"{bank_id}.json"
        out_path.write_text(json.dumps(bank, indent=2, ensure_ascii=False) + "\n",
                            encoding="utf-8")
        print(f"  {bank_id}: {len(raw_questions)} questions across {len(domains)} domains "
              f"→ {out_path.relative_to(ROOT)}")
    else:
        print(f"  {bank_id}: {len(raw_questions)} questions across {len(domains)} domains (ok)")

    return bank


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
    parser.add_argument("--kind", choices=["practice", "mock", "all"], default="all",
                        help="Which question banks to build: practice-questions, mock exams, or both (default).")
    args = parser.parse_args()

    targets = [args.cert] if args.cert else sorted(CERT_TITLES.keys())

    total_qs = 0
    total_banks = 0

    if args.kind in ("practice", "all"):
        print("Practice question banks:")
        for cert in targets:
            bank = build_cert(cert, check_only=args.check)
            n = len(bank.get("questions", []))
            if n:
                total_qs += n
                total_banks += 1

    if args.kind in ("mock", "all"):
        print("\nMock exam banks:")
        for cert in targets:
            for exam_n in (1, 2):
                bank = build_mock(cert, exam_n, check_only=args.check)
                n = len(bank.get("questions", []))
                if n:
                    total_qs += n
                    total_banks += 1

    print(f"\n{'Checked' if args.check else 'Built'} {total_banks} bank(s), "
          f"{total_qs} question(s) total")
    if not args.check:
        print(f"Output: {DATA_DIR}")
        print("Open practice/index.html (any browser) or serve via GitHub Pages to study.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
