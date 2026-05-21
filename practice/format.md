---
title: Practice Question Format Spec
type: reference
tags:
  - practice
  - format-spec
status: published
---

# Practice Question Format Spec

The exact markdown contract that [`build.py`](./build.py) parses. Stick to this and the converter produces clean JSON; deviate and you'll see warnings or skipped questions.

## File-level structure

Practice-question source files live at:

```text
certifications/<cert>/resources/practice-questions/<NN>-<domain>.md
```

The filename (with the leading numeric prefix stripped) becomes the JSON `domain.id`. The file's H1 becomes the `domain.name`.

Each file contains a YAML frontmatter block, an H1 title, and a sequence of `## Question N: …` blocks separated by `---` horizontal rules.

```markdown
---
title: "Practice Questions: Lakehouse Platform"
type: practice-questions
tags: [data-engineer-associate, practice-questions, lakehouse-platform]
---

# Domain 1: Databricks Lakehouse Platform

## Question 1: Brief Title

**Question** *(Easy|Medium|Hard)*: Question stem text. Can span
multiple lines. Markdown inline formatting (`code`, **bold**) is fine.

A) First choice
B) Second choice
C) Third choice
D) Fourth choice

> [!success]- Answer
> **Correct Answer: B**
>
> Short answer paragraph (typically restates the correct choice in prose).
>
> Explanation paragraph(s). Markdown inline formatting works here too.

---

## Question 2: …
```

## Parser rules

- **Question boundary**: H2 heading matching `## Question <number>: <title>`. The number can include sub-decimals (`## Question 5.3:`) but the JSON `id` uses only the integer prefix.
- **Difficulty**: required. Match `**Question** *(Easy|Medium|Hard)*:` on the line that introduces the stem. Stripped to lowercase in JSON.
- **Stem**: the text after the difficulty marker (`*(…)*:` followed by a space) up to the first line starting with `A)`. Multi-line is fine.
- **Choices**: exactly four lines starting `A)`, `B)`, `C)`, `D)` (in any order, but conventionally A-B-C-D). Trailing whitespace tolerated.
- **Answer callout**: starts with `> [!success]-` (with or without the literal "Answer" word). Content is blockquote text until the next non-blockquote line or `---`.
- **Correct answer**: the first `**Correct Answer: <letter>**` inside the callout. Case-insensitive.
- **Short answer**: the first paragraph (split by blank line) inside the callout *after* the `**Correct Answer:**` line.
- **Explanation**: every subsequent paragraph inside the callout, joined with `\n\n`.

## Things that cause a question to be skipped (with a warning)

| Cause | Fix |
| :--- | :--- |
| Missing `**Question** *(Easy\|Medium\|Hard)*:` marker | Add the difficulty marker — see existing DE Associate files for examples |
| Fewer than 4 `A)`/`B)`/`C)`/`D)` choice lines | Ensure each choice is on its own line, starting with the letter |
| Missing `> [!success]-` callout | Wrap the answer in the foldable callout |
| Missing `**Correct Answer: X**` inside the callout | Add this as the first line of the callout |

## JSON output schema

The converter writes one JSON file per cert at `practice/data/<cert>.json` with this shape:

```jsonc
{
  "cert": "data-engineer-associate",
  "certTitle": "Data Engineer Associate",
  "blueprintVersion": "May 2026",
  "generated": "2026-05-21",
  "domains": [
    {
      "id": "lakehouse-platform",
      "name": "Domain 1: Databricks Lakehouse Platform",
      "sourceFile": "certifications/data-engineer-associate/resources/practice-questions/01-lakehouse-platform.md",
      "questionCount": 12
    }
    // ...one entry per domain file
  ],
  "questions": [
    {
      "id": "01-lakehouse-platform-q001",
      "domain": "lakehouse-platform",
      "title": "Lakehouse as a Unified Source of Truth",
      "difficulty": "medium",
      "question": "A leader in data organization is frustrated...",
      "choices": {
        "A": "Each team would maintain separate copies...",
        "B": "Both teams would utilize the same source of truth...",
        "C": "The data lakehouse would automatically reconcile...",
        "D": "A dedicated ETL pipeline would synchronize..."
      },
      "correctAnswer": "B",
      "shortAnswer": "Both teams would utilize the same source of truth for their tasks.",
      "explanation": "A data lakehouse provides a single, unified platform..."
    }
    // ...one entry per question
  ]
}
```

### Schema rules

- **`id`** must be stable across rebuilds — the converter derives it from `<filename-stem>-q<zero-padded-number>` so renaming a markdown file or renumbering questions inside it will break learners' localStorage progress for the affected questions. Don't renumber unless intentional.
- **`difficulty`** is one of `easy` / `medium` / `hard` (lowercase).
- **`correctAnswer`** is one of `A` / `B` / `C` / `D`.
- **`choices`** must have all four keys A-D.

## Running the converter

```bash
# Build every cert
python3 practice/build.py

# Build one cert
python3 practice/build.py --cert data-engineer-professional

# Parse-only, no JSON written; non-zero exit if any parse error
python3 practice/build.py --check
```

The converter is Python 3.9+ standard library only — no `pip install` needed.

## Markdown features that survive the conversion

When rendered in the quiz UI:

| Source | UI |
| :--- | :--- |
| `` `inline code` `` | `<code>` element |
| `**bold**` | `<strong>` element |
| Blank line | paragraph break |
| Single `\n` | line break within paragraph |

Anything else (lists, tables, links, images, headings) is rendered as literal text. Keep practice-question content text-and-inline-code-only.

## Why the markdown-source / JSON-build split?

Same reasoning as the [Anki deck system](../anki/README.md):

- Markdown source stays human-editable and version-controlled
- JSON is what the static web app actually consumes
- The converter is the only seam — if you change the markdown format, you change the converter; the JSON schema doesn't leak into the source files

This means *correcting an answer* or *adding a new question* is a one-file edit to the relevant `practice-questions/*.md` file. Then re-run `build.py` and commit the regenerated JSON.

## Why is JSON committed and not built in CI?

It's a static site — GitHub Pages serves `practice/data/*.json` directly. If the JSON weren't committed, GitHub Pages would have no way to produce it (we'd need a CI step + commit-back, which is overkill for a static app). The build is cheap (sub-second) and idempotent, so committing the output keeps the workflow simple.

The CI markdownlint + lychee checks ensure the source markdown stays well-formed; correctness of `build.py` itself is verified by running `python3 practice/build.py --check` before opening a PR.

---

**[← Back to practice index](./README.md)**
