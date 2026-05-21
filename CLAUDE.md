# CLAUDE.md

Study notes for Databricks certifications: Data Engineer (Associate & Professional), Data Analyst Associate, ML Associate & Professional, GenAI Engineer Associate.

## Repository Structure

```text
databricks-certification-study-guide/
├── certifications/
│   ├── data-engineer-associate/    # 5 topic folders + resources/
│   ├── data-engineer-professional/ # 8 topic folders + resources/
│   ├── data-analyst-associate/     # 5 topic folders + resources/
│   ├── ml-associate/               # 4 topic folders + resources/
│   ├── ml-professional/            # 4 topic folders + resources/
│   └── genai-engineer-associate/   # 4 topic folders + resources/
├── shared/
│   ├── fundamentals/       # Cross-cert concept files
│   ├── cheat-sheets/       # Quick-reference sheets
│   ├── appendix/           # Glossary, comparisons, errors, troubleshooting
│   ├── code-examples/      # python/ and sql/ (always .md files)
│   └── interview-prep/     # 15 topic files, 108 open-ended questions
├── learning-paths/         # Per-role study paths
├── i18n/                   # Translations index + th/ (Thai in-tree translation)
│   ├── README.md           # Index of all language translations
│   ├── STATUS-TEMPLATE.md  # Template for non-Thai community forks
│   └── th/                 # Thai translation (README.md, glossary.md, STATUS.md)
├── anki/                   # Spaced-repetition Anki decks
│   ├── README.md, format.md, build.py     # Workflow, spec, builder
│   ├── decks/                              # Markdown source (committed)
│   └── build/                              # TSV output (gitignored)
├── practice/               # Static adaptive practice quiz
│   ├── README.md, format.md, build.py     # Workflow, spec, markdown→JSON builder
│   ├── index.html, app.js, styles.css     # Vanilla JS quiz UI (no deps)
│   └── data/<cert>.json                    # Generated question banks (committed for static hosting)
└── images/databricks-ui/   # Screenshots by feature area
```

Each certification folder contains numbered topic folders (`01-topic/`, `02-topic/`, …) with a `README.md` index and individual `.md` topic files. Each also has `resources/` with `exam-tips.md`, `official-links.md`, `practice-questions/`, `mock-exam/`, and `mock-exam-2/`.

## Translations

- **English** is the canonical source. All content edits land in English first.
- **Thai** is the only in-tree translation, at `i18n/th/`. The maintainer reads Thai and reviews Thai PRs.
- **Other languages** use the fork model — community forks register themselves in `i18n/README.md`. We don't merge non-Thai translations into upstream.
- Translation policy is in `TRANSLATING.md`; the Thai glossary is `i18n/th/glossary.md`. Thai translations must conform to the glossary.
- Product names (Delta Lake, Unity Catalog, Lakeflow Jobs, MLflow, etc.) and code blocks stay in English in all translations.
- When English content changes that has a Thai counterpart, mark the Thai file 🔄 in `i18n/th/STATUS.md` until re-synced.

## Content Guidelines

### Content Placement

- **Check `shared/` first** — if content applies to multiple certifications, put it there
- **Reference, don't duplicate** shared content across certifications

### Code Examples

- **Always `.md` files**, never `.py` or `.sql` — store in `shared/code-examples/python/` or `sql/`
- Fenced code blocks with language tags; group related snippets under `##` headings; add YAML frontmatter with `tags`

### File Size

- **Target: 300–600 lines**; hard limit: ~800 lines (~20–25 KB)
- **Exception:** `mock-exam/questions.md` files — do not split
- **Split** when 2+ distinct sub-topics can stand alone → `03-topic-part1.md` + `03-topic-part2.md`:
  1. Same number prefix; append `-part1` / `-part2`
  2. Each part gets own YAML frontmatter and intro
  3. Terminal sections (Use Cases → Official Docs) go in **Part 2 only**; Part 1 ends with forward link
  4. Update topic `README.md` index; delete original; fix all links repo-wide

### Markdown Conventions

- Run markdownlint on every modified file; blank lines before/after headings (MD022)
- Language tags on all code blocks (`sql`, `python`, `scala`)
- **One `#` H1 per file (the title).** Exception: the top-level `README.md` uses a centered `<h1 align="center">` HTML block instead of a markdown `#` to render the banner — this is intentional; do not "fix" it
- **Callout type names are lowercase**: `> [!note]`, `> [!important]`, `> [!warning]`, `> [!tip]`, `> [!success]-`, `> [!abstract]`, `> [!info]`
- **Topic-file preamble callouts** (after the `## Overview`): two standard callouts in this order:
  1. `> [!abstract]` — 2–4 bullets summarising the topic's key concepts (the "what")
  2. `> [!tip] What the Exam Tests` — 2–4 bullets framing what an exam taker should learn from the topic (the "why study this")

  These are *preamble* / orientation callouts. The terminal `## Exam Tips` section (between Common Issues & Errors and Key Takeaways) is for *cram-style* advice consumed right before the exam, and serves a distinct purpose.
- **Use a non-breaking space before `%`** in weights and percentages (e.g., `24 %`, not `24%`) for visual consistency across cert READMEs
- **Multi-line Python:** parenthesized expressions, not backslash continuations:

  ```python
  df = (spark.read.format("delta")
      .option("key", "value")
      .load("/path"))
  ```

- **Practice answers:** Obsidian foldable `> [!success]- Answer` callout
- **Practice choices:** A/B/C/D on separate lines (no bullets); two trailing spaces for line breaks

### Diagrams & Images

- **Architecture diagrams:** Mermaid (`flowchart`, `sequenceDiagram`, `graph`)
- **Directory trees:** ASCII text, not Mermaid
- **Screenshots:** `images/databricks-ui/<feature>/`; standard markdown `![Alt](path)` with caption; ≤800 px wide

### Links

- **Link to files, not folders** (`path/to/README.md`, not `path/to/`)
- **Always `./README.md`** for local READMEs — bare `README.md` resolves ambiguously in Obsidian
- Verify target files exist after edits

### Section Ordering (End of Topic Files)

Terminal sections in this exact order:

1. `## Use Cases`
2. `## Common Issues & Errors`
3. `## Best Practices` *(optional)*
4. `## Exam Tips`
5. `## Key Takeaways`
6. `## Related Topics`
7. `## Official Documentation`
8. `---` separator + navigation link (always last)

**Lab files** (`type: lab` under `labs/`) are exercises, not topic files. They follow a different terminal pattern: `## Verification` (or fold verification into the last numbered step) → `## Cleanup` → `## Related Study Material` → `---` + nav. The Use Cases / Common Issues / Exam Tips / Key Takeaways sections do not apply.

**Final-review files** (`type: final-review` under each cert's `resources/final-review.md`) are exam-morning cram scans, also not topic files. Standard structure: a `> [!important]` framing callout (optional), `## 2-minute facts ...`, `## 5-minute per-domain quick-fire`, `## Common-trap reminders` (table), `## Today's exam — <N>-minute time budget`, optional motivational close, `---` + nav. No Use Cases / Common Issues / Key Takeaways terminal sections — the whole file IS the cram material.

**Nav format:** end each topic file with a three-segment bold line — Previous file link, Back-to-Section link to `./README.md`, Next file link — separated by ` | `. Schematic (replace `<prev>` and `<next>` with the actual sibling filenames):

```text
**[← Previous: <Prev Topic>](<prev>.md) | [↑ Back to Section](README.md) | [Next: <Next Topic> →](<next>.md)**
```

- Part 1 files: end with only forward link to Part 2
- Part 2 files: full three-way nav

## README Standards

### Certification README (`certifications/<cert>/README.md`)

Required: YAML frontmatter (`title`, `type: certification`, `aliases`, `tags`), Exam Overview table, Domain Weights (Mermaid pie), Study Topics table with weights, Practice & Resources table, Prerequisites (shared fundamentals links), Study Progress Tracker (checkboxes), Interview Preparation link.

### Topic Folder README (`<topic-folder>/README.md`)

Required: YAML frontmatter (`title`, `type: category`, `tags`, `status`), topic title with exam weight, Topics Overview (Mermaid flowchart), Section Contents table, Key Concepts, Related Resources, Back/Next navigation.

## Certification Topic Folders

- **DE Associate:** 01-lakehouse-platform, 02-etl-spark-sql, 03-delta-lake, 04-workflows-orchestration (Lakeflow Jobs), 05-data-governance, 06-cicd-and-monitoring *(folder added for the May 2026 blueprint refresh)*
- **DE Professional:** 01-developing-code-for-data-processing, 02-cost-and-performance-optimization, 03-data-transformation-cleansing-quality, 04-monitoring-and-alerting, 05-ensuring-data-security-and-compliance, 06-debugging-and-deploying, 07-data-ingestion-and-acquisition, 08-data-governance, 09-data-modelling, 10-data-sharing-and-federation *(matches Nov 30, 2025 official 10-domain blueprint)*
- **Data Analyst:** 01-executing-queries-databricks-sql-warehouses, 02-creating-dashboards-and-visualizations, 03-analyzing-queries, 04-developing-sharing-maintaining-genie-spaces, 05-understanding-databricks-platform, 06-managing-data, 07-securing-data, 08-importing-data, 09-data-modeling-with-databricks-sql *(matches Oct 2025 official 9-domain blueprint)*
- **ML Associate:** 01-databricks-machine-learning, 02-model-development, 03-ml-workflows, 04-model-deployment *(matches Mar 1, 2025 official 4-domain blueprint)*
- **ML Professional:** 01-model-development, 02-ml-ops, 03-model-deployment *(matches Sep 2025 official 3-domain blueprint)*
- **GenAI Engineer:** 01-application-development, 02-assembling-and-deploying-apps, 03-design-applications, 04-data-preparation, 05-evaluation-and-monitoring, 06-governance *(matches March 2026 official 6-domain blueprint)*

## Shared Content

- **fundamentals/**: platform-architecture, databricks-workspace, delta-lake-basics, spark-fundamentals, sql-essentials, streaming-fundamentals, unity-catalog-basics, medallion-architecture, mlflow-basics, feature-engineering-basics, rag-vector-search-basics, open-table-formats, python-essentials (×2)
- **cheat-sheets/**: delta-lake-commands, dlt-quick-ref, mlflow-quick-ref, pyspark-api-quick-ref, spark-configurations, sql-functions, unity-catalog-quick-ref, performance-optimization, describe-show-commands
- **appendix/**: glossary, comparison-tables, error-messages, performance-troubleshooting, version-history, renewal-guide
- **code-examples/**: python/ (delta_lake_operations, python_patterns, streaming_examples, unity_catalog_setup), sql/ (cte_patterns, delta_lake_operations, window_functions)
- **interview-prep/**: associate-fundamentals, file-formats-spark-internals, delta-lake-internals, pipeline-architecture, streaming-cdc, data-modeling, performance-optimization, pyspark-sql-patterns, python-code-quality, governance-security, production-operations, data-compliance-quality, system-design, ml-system-design, genai-rag-design

## PR Workflow

This repo uses a **3-round self-review** before squash-merge. Full process in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

| Round | Focus |
| :---: | :--- |
| **1** | Technical correctness — links resolve, code runs, markdownlint passes |
| **2** | Factual / blueprint accuracy — every change cites a Databricks source |
| **3** | Style & conventions — terminal sections, callouts, A/B/C/D formatting |

- Branch off `main` with a descriptive name (`fix/`, `feat/`, `docs/`, `chore/`)
- Commit prefixes: `docs:`, `fix:`, `feat:`, `chore:`, `review(roundN):` for review passes
- **Squash-merge only.** Merge commits and rebase merges are disabled at the repo level
- Branch protection: linear history required, force pushes and deletions blocked

## README & CLAUDE.md Sync Rule

Every PR that changes content **must** keep `README.md` and `CLAUDE.md` in sync.

| If the PR… | …also update |
| :--- | :--- |
| Adds a new certification | top-level `README.md` (certs table, exam-at-a-glance), `CLAUDE.md` (Repository Structure, Certification Topic Folders) |
| Renames or restructures a topic folder | `CLAUDE.md` (Certification Topic Folders), the cert's `README.md` (Study Topics table) |
| Adds a new cheat sheet, interview-prep file, fundamental, code example, or appendix entry | `CLAUDE.md` (Shared Content) |
| Changes domain weights, fee, duration, or question count | top-level `README.md` (per-cert exam-at-a-glance) AND the cert's `README.md` |
| Bumps the exam-guide version date for a cert | top-level `README.md` (table + "What changed" callout), `CHANGELOG.md`, the cert's `README.md` |
| Touches a convention or layout rule | `CLAUDE.md` (Content Guidelines) |
| Edits an English file that has a Thai counterpart under `i18n/th/` | mark the counterpart 🔄 in `i18n/th/STATUS.md` (don't translate in the same PR — Thai catch-up is a separate PR) |
| Adds a new Databricks-adjacent term to a Thai translation | also add it to `i18n/th/glossary.md` in the same PR |
| Adds or modifies an Anki deck under `anki/decks/` | update the "Available decks" table in `anki/README.md`; run `python3 anki/build.py --check` before committing |
| Edits a `certifications/<cert>/resources/practice-questions/*.md` file | re-run `python3 practice/build.py --cert <cert>` and commit the regenerated `practice/data/<cert>.json` in the same PR |
| Adds a new cert to the practice quiz | run `python3 practice/build.py`, update the "Available banks" table in `practice/README.md`, and add the cert to `KNOWN_BANKS` in `practice/app.js` |

The PR template checkbox enforces this. Do not check the box unless the update is actually in the diff.

## Currency Policy

When Databricks updates the exam guide for any certification:

1. Update the exam-guide version date in the cert's `README.md` Exam Overview table
2. Update any changed domain weights (Mermaid pie + Study Topics table)
3. Update / add the "What changed in the latest blueprint" callout at the top of that cert's `README.md`
4. Update the matching cert row in the top-level `README.md` certifications table and the "What changed in the 2025–2026 exam guides" section
5. Add an entry to [`CHANGELOG.md`](./CHANGELOG.md) describing the refresh
6. Mark new practice questions targeting the updated skills with a `*(YYYY blueprint)*` suffix in the question heading

Always cite the new exam-guide PDF URL in the PR description.
