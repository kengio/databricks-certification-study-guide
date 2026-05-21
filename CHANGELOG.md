# Changelog

Notable changes to the Databricks Certification Study Guide.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/). Dates use ISO 8601. Each section is grouped under the date the change shipped, with the Databricks exam-guide version each affected certification tracks.

## [2026.05.21-24] — Mock exams in practice quiz + auto-rebuild on source edits (931 q / 18 banks)

### Added

- **12 mock exam banks** in the practice quiz — each cert now has two full-length, exam-feel mock banks alongside its topic-organised practice bank:

  | Cert | Practice | Mock 1 | Mock 2 |
  | :--- | :---: | :---: | :---: |
  | Data Engineer Associate | 85 | 45 | 45 |
  | Data Engineer Professional | 73 | 63 | 60 |
  | Data Analyst Associate | 57 | 45 | 45 |
  | ML Associate | 46 | 43 | 44 |
  | ML Professional | 57 | 45 | 45 |
  | GenAI Engineer Associate | 46 | 45 | 42 |
  | **Total** | **364** | **286** | **281** |

  Grand total: **931 questions across 18 banks**.

- **Grouped bank picker** in the quiz UI: practice and mock banks render under labelled section headings ("Practice questions — drill by topic" and "Mock exams — full-length, exam-feel sets") so the user can choose intent before picking a cert. Two-column grid on screens ≥ 700 px wide.

### Changed — `practice/build.py`

- New `build_mock(cert, exam_n)` function parses `certifications/<cert>/resources/mock-exam{,-2}/questions.md`. Pre-scans the file linearly to map each `## Question N` heading to the most recent `## <Domain> (Questions X-Y)` domain section, then reuses the existing `parse_questions()` and overlays the per-question domain. Output JSON includes `kind: "mock"` and `sourceCert: <cert>` fields for downstream tooling.
- New `--kind {practice,mock,all}` flag (default `all`) lets you build just one kind. `--cert <id>` still filters to a single cert across both kinds.

### Changed — auto-rebuild + auto-deploy from cert markdown edits

`.github/workflows/deploy-practice.yml` now:

- Triggers on push to `main` whenever ANY of these change:
  - `practice/**`
  - `certifications/**/practice-questions/**`
  - `certifications/**/mock-exam/**`
  - `certifications/**/mock-exam-2/**`
  - the workflow file itself
- Runs `python3 practice/build.py` as a step before uploading the Pages artifact so the live JSON is always fresh from current cert markdown — no need to run `build.py` locally and re-commit before pushing.

The committed `practice/data/*.json` files stay (for local dev convenience and quick PR diff review) but are no longer the source of truth at deploy time. Edit a question, push, the live site reflects it within ~1 min.

### Changed — UI cache versioning

`APP_VERSION` bumped to `"4"`. `<script src="app.js?v=4">` and `<link href="styles.css?v=4">` in `index.html`. JSON fetches pass through `bustedUrl()` to inherit the same version query so browsers don't serve stale banks after a deploy.

### Verification

- `python3 practice/build.py --check` → **18 banks / 931 questions** parsed cleanly
- Practice = 364 q (unchanged from previous PR); Mock = 567 q across 12 new bank files
- 4 mock-exam questions skipped due to multi-line-code-fence choices that the parser doesn't handle (same edge case as the practice banks; documented in `practice/README.md`)

## [2026.05.21-23] — Practice quiz polish: all 6 banks + theme + reset + branding + CI Node 24

### Added — all 6 certifications now have a question bank (364 questions total)

The practice quiz now covers every certification:

| Bank | Questions | Domains |
| :--- | :---: | :---: |
| Data Engineer Associate | 85 | 5 |
| Data Engineer Professional | 73 | 8 |
| **Data Analyst Associate** | **57** | **5** |
| ML Associate | 46 | 4 |
| **ML Professional** | **57** | **4** |
| **GenAI Engineer Associate** | **46** | **4** |
| **Total** | **364** | **30** |

Previous total: 198 (3 banks). **Net addition: 166 questions across 3 new banks + 6 in the ML Associate bank.**

### Changed — `practice/build.py` parser now handles three heading formats

The three certs previously missing (DA Associate, ML Pro, GenAI Engineer Associate) used a different heading convention. The parser is now format-tolerant:

- **Format A** (existing): `## Question 5: Title` with `**Question** *(Easy|Medium|Hard)*: stem` in body
- **Format B** (new): `## Question 5 *(Medium)*: Title` with `**Question**: stem` in body
- **Format C** (new): `## Question 5: Title *(Medium)*` with the stem directly in the body (or `**Question**:` prefix)

The correct-answer regex was also relaxed to accept `**Correct Answer: B**`, `**Correct Answer: B) full choice text**`, and `**Correct Answer:** B`. The choice-line regex permits trailing whitespace (some files use two-space line breaks).

### Added — UI polish

- **Branded header**: SVG checkmark badge in Databricks red (`#FF3621`) alongside the page title; same icon as `favicon.svg` so the browser tab matches the page.
- **`favicon.svg`**: served from `practice/favicon.svg`, linked from `index.html`.
- **Theme cycle button** in the top-right of the header: cycles **auto → light → dark → auto**. Persisted in `localStorage` under `dbx-practice-theme`. Applied before any rendering so there's no flash on load.
- **Reset button** in the quiz header (`class="danger"`) — same `resetHistory()` flow as the existing button in the Stats view, now reachable without navigating away from the quiz. Confirm-dialog protects against accidental clicks.
- **"Switch bank"** label replaces "Exit" so the button's effect is clearer.

### Changed — CSS theme architecture

`styles.css` switched from a single `@media (prefers-color-scheme: dark)` override to a three-state system:

- `:root` defaults are light
- `:root[data-theme="dark"]` forces dark regardless of system preference
- `:root[data-theme="light"]` forces light regardless of system preference
- `:root[data-theme="auto"]` (and the no-attribute fallback) inherits from `@media (prefers-color-scheme: dark)`

This lets users override their OS preference, which is the common ask for night-mode browsing on a system-light setup.

### Changed — CI/CD opt-in to Node.js 24

Adds `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` as a workflow-level `env:` to both:

- `.github/workflows/lint.yml`
- `.github/workflows/deploy-practice.yml`

Eliminates the "Node.js 20 actions are deprecated" annotations on every CI run (effective deprecation June 2026 per the GitHub Actions changelog). All action versions are unchanged; the env var instructs the runner to host them on Node 24 regardless of their declared runtime.

### Verification

- `python3 practice/build.py --check` → **6 banks / 364 questions** parsed cleanly
- JSON shape validated: all `correctAnswer` letters in A-D, all 4 choices present, all `difficulty` values lowercase easy/medium/hard
- markdownlint passes
- lychee passes (favicon.svg is a same-origin file link, all relative paths resolve)

After merge: the practice site auto-redeploys via `.github/workflows/deploy-practice.yml` and the 3 new banks appear on the live page.

## [2026.05.21-22] — Deploy practice quiz to GitHub Pages

### Added

- **`.github/workflows/deploy-practice.yml`** — auto-deploys `practice/` to GitHub Pages on every push to `main` that touches `practice/**`. Uses `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`. Adds `.nojekyll` to disable Jekyll processing so HTML/JS pass through unmodified. Manual trigger via `workflow_dispatch` also supported.
- **Live URL**: `https://kengio.github.io/databricks-certification-study-guide/` — open the link, pick a cert bank, start drilling. No clone or install needed.

### Changed

- **Top-level `README.md`** — adds a prominent "▶ Try the practice quiz live" tip callout near the top + live URL in the Q1 2027 roadmap entry
- **`practice/README.md`** — replaces the (incorrect) "Deploy from a branch + /practice folder" instructions with the actual Actions-based deploy flow, including the one-time `Settings → Pages → Source: GitHub Actions` toggle a fork maintainer needs to set

### One-time fork-maintainer setup

For a fresh fork (or this repo before its first deploy), the workflow runs only after:

1. **Settings** → **Pages** → **Source: GitHub Actions**

Then any push under `practice/` (or a manual workflow_dispatch) deploys the live site. The published URL appears on the workflow run page and in Settings → Pages.

### Architecture decision: why a workflow instead of "Deploy from a branch + /practice"?

Classic Pages can only publish from `/` (repo root) or `/docs`. It can't pick the `/practice` folder. To publish only the quiz (and not the entire study guide repo, whose 374 markdown files would be slow + ugly under Jekyll), we need the Actions-based deploy path. Trade-off: one workflow file + one settings toggle vs. exposing the whole repo on Pages. Worth it.

## [2026.05.21-21] — Adaptive practice question quiz (static site + 3 cert banks)

### Added

- **`practice/index.html` + `practice/app.js` + `practice/styles.css`** — a static, dependency-free browser quiz. Loads a JSON question bank, presents one multiple-choice question at a time, records every attempt in `localStorage`, and (in adaptive mode) weights question selection toward never-attempted + recently-wrong items. Includes per-domain accuracy stats, a "questions you're working on" list, JSON export of progress, and a domain/difficulty filter. Works on GitHub Pages out of the box.
- **`practice/build.py`** — Python 3.9+ stdlib-only converter that parses `certifications/<cert>/resources/practice-questions/*.md` files into `practice/data/<cert>.json` banks. Supports `--cert <id>` and `--check` modes. 198 questions across 3 certs parse cleanly; the other 3 certs use an older markdown variant without a difficulty marker and are deferred to a follow-up.
- **`practice/README.md`** — workflow doc (local + GitHub Pages), modes explanation, adaptive-selector math, privacy notes, "Adding a cert to the bank" guide.
- **`practice/format.md`** — markdown source format spec + JSON output schema + parser rules + things-that-cause-a-skip table.
- **`practice/data/data-engineer-associate.json`** — 85 questions across 5 domains
- **`practice/data/data-engineer-professional.json`** — 73 questions across 8 domains
- **`practice/data/ml-associate.json`** — 40 questions across 4 domains

### Changed

- **Top-level `README.md`**:
  - Q1 2027 roadmap entry "Adaptive practice questions" marked ✅ complete
  - Repository layout includes `practice/`
- **`CLAUDE.md`**:
  - Repository Structure section adds the `practice/` tree
  - README & CLAUDE.md Sync Rule table adds 2 rows: re-run `practice/build.py` when practice-question source files change, and the cert-onboarding checklist for adding a new bank

### Architecture decisions

- **Static site, no backend**: progress is per-browser in `localStorage`. Trade-off: no cross-device sync. The "Export progress (JSON)" button gives users an out if they want it.
- **JSON committed, not built in CI**: GitHub Pages serves `practice/data/*.json` directly. Auto-building in CI would require a commit-back step that's overkill for a sub-second deterministic build. Maintainers re-run `build.py` and commit the diff when source markdown changes; the README & CLAUDE sync rule codifies this.
- **No innerHTML with dynamic content**: `app.js` renders markdown into the DOM via `document.createElement` + `textContent`, never via `innerHTML` interpolation. Untrusted bytes from the JSON cannot become script tags. Static initialization-time innerHTML calls (clearing nodes) use empty strings only.
- **Adaptive math is a simple heuristic, not full SM-2**: `never_seen → 10`, `recently_correct → 0.5 + days * 0.3` capped at 5, `recently_wrong → 8 - days * 0.3` floored at 3, then weighted random pick. Users who want true spaced-repetition scheduling should use the [Anki decks](./anki/README.md).
- **3 certs in, 3 deferred**: the missing certs' practice-question markdown lacks the `*(Easy|Medium|Hard)*` difficulty marker. Updating their markdown is a separate follow-up that doesn't block this PR.

### Verification

- `python3 practice/build.py --check` parses all 3 supported certs cleanly (198 questions / 17 domains across 3 banks)
- markdownlint passes
- lychee link-check passes (all cross-references inside `practice/` resolve)

## [2026.05.21-20] — Anki deck scaffolding + 2 starter decks (Delta Lake, Unity Catalog)

### Added

- **`anki/build.py`** — Python 3.9+ stdlib-only converter that parses the markdown deck source format into Anki-importable TSV. Two modes: full build (`python3 anki/build.py`) and parse-check (`python3 anki/build.py --check`, used in CI / pre-commit to validate format without writing output). No `pip install` required.
- **`anki/README.md`** — workflow documentation for learners (how to install Anki + import) and contributors (how to add a new deck), card-writing principles, "what this isn't" framing.
- **`anki/format.md`** — exact contract that `build.py` parses: required frontmatter (`deck`, `tags`), card boundaries (H2 heading + `> [!success]- Answer` callout), what survives the markdown → Anki conversion, tag conventions, complete worked example.
- **`anki/decks/shared/delta-lake.md`** — 27-card starter deck covering ACID semantics, OPTIMIZE / VACUUM / Z-order / Liquid Clustering, Time Travel, CDF, Deletion Vectors, MERGE INTO, schema evolution, idempotent streaming writes, UniForm, Auto Optimize. Tagged for DE Associate + DE Professional.
- **`anki/decks/shared/unity-catalog.md`** — 22-card starter deck covering the three-level namespace, managed vs external tables, External Locations + Storage Credentials, privilege model, row filters + column masks, Volumes, lineage, Tags, service principals, account groups, UC Model Registry, Feature Engineering in UC, Lakehouse Federation, catalog binding. Tagged for all 6 certs.

### Changed

- **`.gitignore`** — adds `anki/build/` (TSV output is regenerated locally; only source markdown is committed)
- **Top-level `README.md`**:
  - Q1 2027 roadmap entry "Spaced-repetition deck (Anki)" marked ✅ complete
  - Repository layout updated to include `anki/`
- **`CLAUDE.md`**:
  - Repository Structure section adds the `anki/` tree
  - README & CLAUDE.md Sync Rule table adds row: update `anki/README.md` "Available decks" table + run `--check` on every deck add/edit

### Architecture decisions

- **Markdown source, TSV output**: source is human-readable in Obsidian + GitHub (the `> [!success]-` callout doubles as a foldable in-place quiz); output is regenerated, not committed, so the repo stays text-only.
- **Stdlib-only builder**: avoids `pip install genanki` or any other dependency. The trade-off: TSV instead of `.apkg`. Acceptable because Anki's TSV import is first-class and supports `#deck:` / `#html:true` / `#columns:` metadata headers that drive deck hierarchy and HTML rendering.
- **49 starter cards, not 500**: ships quality over quantity. Community contributions expand the deck library; the format spec + builder + two worked examples are the leverage point.

### Verification

- `python3 anki/build.py --check` parses both decks cleanly (49 cards total)
- `python3 anki/build.py` produces valid Anki-importable TSV with proper `#separator:tab`, `#html:true`, `#deck:` headers
- markdownlint passes (no new violations)
- lychee link-check passes (all cross-references inside `anki/` resolve)

## [2026.05.21-19] — Translation scaffolding (Thai in-tree + fork model for other languages)

### Added

- **`TRANSLATING.md`** — translation policy at the repo root. Sets the rules: English is canonical, Thai is in-tree at `i18n/th/`, other languages use the fork model. Lists what stays English (product names, code, file/folder names, exam-guide titles) vs. what gets translated (prose, callouts, captions). Documents the sync model, glossary discipline, and PR flow for Thai contributions vs. fork registration for other languages.
- **`i18n/README.md`** — translations index. Tracks in-tree translations (English + Thai) and community translation forks for other languages. Empty fork table for now; first community fork sets the pattern.
- **`i18n/STATUS-TEMPLATE.md`** — copy-paste template that non-Thai community forks can use to track per-file translation progress against an English upstream tag.
- **`i18n/th/README.md`** — Thai-language landing page covering all six certifications, with a clear "ข้อสอบจริงเป็นภาษาอังกฤษ" callout reminding readers that product names stay English even in the Thai translation.
- **`i18n/th/glossary.md`** — Thai translation glossary, ~80 standardised term mappings across four categories (Databricks product names — keep English; data engineering / Spark / SQL; ML / GenAI; UI / workflow). Plus a writing-style section codifying space-between-Thai-and-English, `%` spacing, and tone conventions.
- **`i18n/th/STATUS.md`** — populated Thai translation status checklist covering 374 files in scope (per cert, per shared folder, top-level), with a recommended translation-priority ordering (Top-level README → fundamentals → DE Associate → cheat sheets → renewal guide → other certs).

### Changed

- **Top-level `README.md`**:
  - Added "Read in another language" info callout near the top linking to `i18n/th/README.md` and `TRANSLATING.md`
  - Q1 2027 roadmap entry "Translation scaffolding" marked ✅ complete
  - Repository layout updated to include `i18n/` and `TRANSLATING.md`
- **`CLAUDE.md`**:
  - Repository Structure section adds the `i18n/` tree
  - New "Translations" section codifying the English-canonical / Thai-in-tree / fork-for-others policy
  - README & CLAUDE.md Sync Rule table adds two rows: marking Thai counterparts 🔄 when English upstream changes, and updating `i18n/th/glossary.md` when adding new Databricks-adjacent terms in Thai translations

### Scope clarification (vs. the original roadmap entry)

The Q1 2027 roadmap entry originally read "Translation scaffolding so non-English learners can fork and translate". This PR explicitly narrows the in-tree commitment to **Thai only** (English source + Thai translation), with all other languages still served by the fork model. Reasoning is in `TRANSLATING.md` → "Why Thai in-tree, others as forks?" — the maintainer reads Thai and English, can review Thai PRs for accuracy, but can't meaningfully review other-language translations.

### Verification

- markdownlint passes (no new violations)
- lychee link-check passes (every cross-link inside `TRANSLATING.md`, `i18n/README.md`, `i18n/STATUS-TEMPLATE.md`, `i18n/th/README.md`, `i18n/th/glossary.md`, `i18n/th/STATUS.md` resolves)
- 0 English content was changed; this PR is additive only

## [2026.05.21-18] — Renewal Guide

### Added

- **`shared/appendix/renewal-guide.md`** — a cross-cert renewal playbook covering:
  - The 2-year validity clock (when it starts, where to verify it)
  - A day −365 → day +1 timeline checklist
  - Two renewal paths: full retake vs. dedicated recertification exam (where offered)
  - Per-certification snapshot table linking the highest-yield delta-study areas for each of the 6 certs against the May 2026 / Nov 30 2025 / Oct 2025 / Mar 2026 blueprints
  - Step-by-step "what to actually study for renewal" workflow (diff the exam-guide PDFs, prioritize renamed products, run the repo's mocks, cram with `final-review.md`)
  - Cost considerations, after-renewal actions, FAQ (8 common questions)
  - Official sources list (Certification Hub, credential portal, Academy, blog, docs)

### Changed

- **`shared/appendix/README.md`** — adds the Renewal Guide to the appendix table and a new "Before your 2-year expiry" usage hint
- **All 6 cert `README.md` files** — the `Recertification` row in the exam-overview table now links to the new Renewal Guide instead of just saying "Every 2 years"
- **Top-level `README.md`** — Q1 2027 roadmap entry "Renewal guide" marked ✅ complete
- **`CLAUDE.md`** — `appendix/` Shared Content list adds `renewal-guide`

### Verification

- All cross-cert links resolve (verified via lychee CI)
- markdownlint passes (0 errors)

## [v1.0.0] — 2026-05-21 — Initial public release

First tagged release of the open-sourced Databricks Certification Study Guide. Covers six Databricks certifications, each refreshed to the latest official exam blueprint (Oct 2025 – Mar 2026).

### Certifications covered (all at current blueprint)

| Certification | Blueprint date | Domains |
| :--- | :--- | :--: |
| Data Engineer Associate | May 2026 refresh | 6 |
| Data Engineer Professional | Nov 30, 2025 | 10 |
| Data Analyst Associate | Oct 2025 | 9 |
| ML Associate | Mar 1, 2025 | 4 |
| ML Professional | Sep 2025 | 3 |
| GenAI Engineer Associate | Mar 2026 | 6 |

### What's in the box

- **183 topic content files** across the six certifications, structured 1:1 with each official domain
- **573 mock-exam questions** across 12 full mock exams (2 per cert), with answer keys and per-question debrief tables that map every question to a topic file + cheat sheet
- **36 practice-question files** for spaced repetition between mocks
- **6 hands-on labs** in `labs/` covering medallion ingestion, Unity Catalog setup, Lakeflow Declarative Pipelines, MLflow tracking, and Mosaic AI RAG
- **6 cert-specific final-review files** — 20-minute exam-morning cram scans
- **16 fundamentals + 13 cheat sheets + 16 interview-prep files** in `shared/` for cross-cert reuse
- **CI**: markdownlint + lychee internal-link integrity checks on every PR
- **Branch protection**: linear history, squash-merge only, force-push and deletion blocked on `main`

### Contributor experience

- `CONTRIBUTING.md` — 4-round PR review process, commit-message conventions, local CI reproduction commands
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- `CONTRIBUTORS.md` — attribution list
- PR + issue templates
- MIT License

### Currency commitment

- Every cert tracks its current Databricks exam-guide PDF and cites the version date in the cert README
- Top-level README "What changed in the 2025–2026 exam guides" callouts surface blueprint deltas
- Currency policy in `CLAUDE.md` codifies the refresh workflow for future blueprint updates

## [2026.05.21-3] — Data Analyst Associate folder reorg to 9-domain blueprint

### Changed

- **`certifications/data-analyst-associate/` restructured to match the October 2025 official 9-domain blueprint** (1 : 1 folder-to-domain mapping). Folder map:
  - `01-databricks-sql/` → split across `01-executing-queries-databricks-sql-warehouses/` and `05-understanding-databricks-platform/`
  - `02-data-management/` → split across `06-managing-data/`, `05-understanding-databricks-platform/` (UC), `07-securing-data/`
  - `03-sql-queries/` → `03-analyzing-queries/`
  - `04-dashboards-visualization/` → `02-creating-dashboards-and-visualizations/`
  - `05-analytics-applications/` → split across `03-analyzing-queries/` (parameters) and `02-creating-dashboards-and-visualizations/` (sharing)
- 14 file moves via git mv (history preserved)
- Cert README rewritten with new Study Topics table reflecting all 9 official domains
- `CLAUDE.md` Certification Topic Folders entry updated to list the 9 new folders
- Top-level `README.md` repo layout entry updated; guide-itself roadmap entry marked complete

### Added

- 9 new folder README index files — one per official domain — each with topics overview, section contents, key concepts, and back/next navigation
- 4 new topic files for previously-uncovered domains:
  - `04-developing-sharing-maintaining-genie-spaces/01-genie-spaces-overview.md`
  - `04-developing-sharing-maintaining-genie-spaces/02-tuning-genie-spaces.md`
  - `08-importing-data/01-importing-data-overview.md`
  - `09-data-modeling-with-databricks-sql/01-data-modeling-overview.md`

## [2026.05.21-17] — GitHub Action for markdownlint + lychee link-check

### Added

- **`.github/workflows/lint.yml`** — CI workflow that runs on every PR (and push to `main`) with two jobs:
  - `markdownlint` — runs `DavidAnson/markdownlint-cli2-action@v19` against all repo `.md` files using `.markdownlint-cli2.jsonc` (which extends `.markdownlint.json`)
  - `link-check` — runs `lycheeverse/lychee-action@v2` against all repo `.md` files using `lychee.toml` (checks internal links; external URLs intentionally skipped — their health is a manual PR-review concern)
- **`.markdownlint-cli2.jsonc`** — globs + ignore patterns for markdownlint-cli2 (excludes `.obsidian/`, `docs/superpowers/`, `node_modules/`, `.git/`)
- **`lychee.toml`** — link-check configuration: exclude `^https?://`, `^mailto:`, `^tel:`, `^ftp://`, `^data:`, `^javascript:`; exclude `.obsidian/`, `docs/superpowers/`, `node_modules/`, `.git/`; enable cache
- **`.gitignore`** — adds `.lycheecache` to the ignore list
- **`CONTRIBUTING.md`** — new "Automated checks (CI)" section documenting the two checks + how to reproduce locally

### Changed (markdownlint fixes — making the existing repo pass)

- **`.markdownlint.json`** — relaxed `MD026` (no-trailing-punctuation in headings) since several intentional sentence-style headings end in periods (e.g., "Eat. Hydrate. Breathe." in final-review files); enabled `MD034` (no-bare-urls) explicitly
- **6 cert `resources/README.md` files** — fixed a table-row break introduced by the PR 13 final-review link insertion (the link was inserted as a list inside a table cell, breaking MD055/MD056/MD032). Each Final-Review link is now its own table row.
- **2 GenAI topic files** — removed malformed inline `ChatModel *(deprecated…)*` annotations that broke a code span (MD038). The top-of-file deprecation callout from PR 18 already documents the deprecation, so the inline annotation is redundant.
- **`CLAUDE.md`** — collapsed multiple consecutive blank lines (MD012)
- **`certifications/genai-engineer-associate/06-governance/01-governance-overview.md`** — wrapped a bare URL in a markdown link (MD034)

### Verification

- `markdownlint-cli2` on the working tree: **377 files linted, 0 errors**
- Repo-wide broken-link scan: 0

## [2026.05.21-16] — Topic-file content audit (legacy terminology)

### Changed

- **174 topic files across all 6 certs audited** for legacy product naming inside the numbered topic folders
- **30 files updated** (~83 lines changed) across DE Pro (24 files), DA (1 file), ML Pro (2 files), GenAI (3 files):
  - "Delta Live Tables" → "Lakeflow Declarative Pipelines" — body text + bullet lists
  - Prose "DLT pipeline / framework / event log / managed / decorators" → "Lakeflow Declarative Pipelines …"
  - "Databricks Workflows" → "Lakeflow Jobs"; "Workflows UI" → "Lakeflow Jobs UI"; "Workflows API" → "Jobs API"
  - Mermaid diagram labels referring to the DLT product (e.g., `Pipeline[DLT Pipeline]`) → `Lakeflow Declarative Pipeline`
  - YAML/JSON `description` strings referring to "DLT pipeline" → "Lakeflow Declarative Pipeline"
  - SQL comments referring to the product → "Lakeflow Declarative Pipelines"
- **2 GenAI files** with multiple ChatModel mentions (12 + 4) received a top-of-file `> [!note]` deprecation callout explaining that `ChatModel` is deprecated in MLflow 3.0+ and pointing to the current `ResponsesAgent` / `ChatAgent` + `databricks.agents.deploy()` path. Inline mentions retained because they still appear in stems

### Preserved (intentional)

- `@dlt.*` decorators and the `dlt` Python module name (back-compat)
- `(formerly DLT)` annotations that document the rename
- Python code comments / docstrings that refer to the *module* (e.g., `# Import DLT module`)
- File-path conventions like `dlt_notebook.py` (community naming)

### Verification

- Post-refresh audit: **0 Delta Live Tables**, **0 Databricks Workflows**, **0 Workflows UI**, **0 Workflows API** remain in topic-file prose
- Remaining 9 DLT mentions are all inside Python code comments / docstrings that correctly reference the `dlt` Python module — preserved as-is
- Repo-wide broken-link scan: 0

## [2026.05.21-15] — Per-question debrief tables (all 12 mocks)

### Changed

- **6 existing debrief files** (DE Pro / DA / GenAI mock-1 + mock-2) — replaced the high-level per-section question map with a **per-question table** that maps every single question to its primary domain, topic folder, and cheat sheet
- Per-question tables use heuristic keyword classification of each question's scenario text — a starting point that learners can sanity-check against the actual answer key

### Added

- **6 new debrief files** for DE Associate, ML Associate, and ML Professional (mock-1 + mock-2 each):
  - `certifications/data-engineer-associate/resources/mock-exam{,-2}/debrief.md`
  - `certifications/ml-associate/resources/mock-exam{,-2}/debrief.md`
  - `certifications/ml-professional/resources/mock-exam{,-2}/debrief.md`
- Each new debrief follows the established structure: introduction + how-to-use, Domain → study-resource mapping, **per-question quick map**, study plan by miss count, nav
- All 6 new mock-exam READMEs link the new `debrief.md`

### Counts

- 12 mock files, ~789 questions classified (DE Pro mocks include the new-domain questions from earlier PRs, hence higher counts)
- 12 debrief files total — every cert now has a debrief for both mocks

## [2026.05.21-14] — Practice-questions terminology refresh

### Changed

- **Practice-question files across all 6 certs audited** for legacy product naming
- ~60 occurrences of legacy terms replaced across 13 practice-question files:
  - **"Delta Live Tables"** → **"Lakeflow Declarative Pipelines"**
  - **"DLT pipeline / framework / event log / managed / alert / expectations / tables"** → **"Lakeflow Declarative Pipelines …"** (the `dlt` module name is retained for back-compat in code blocks)
  - **"Databricks Workflows"** → **"Lakeflow Jobs"**; **"Workflows UI"** → **"Lakeflow Jobs UI"**; **"Workflows API"** → **"Jobs API"**
- Question headings (e.g., `## Question 5.3: DLT Event Log` → `## Question 5.3: Lakeflow Declarative Pipelines Event Log`) updated alongside body text
- Code blocks and `@dlt.*` decorator references kept as-is (the Python module is `dlt` by back-compat)
- 1 specific ML Associate fix: "MLflow run history tracks experiment results, and Workflows orchestrate jobs" → "Lakeflow Jobs orchestrate workloads"

### Verification

Final audit: **0 prose DLT mentions** and **0 product-context "Workflows"** mentions remain across all 6 certs' practice-question files. Domain names like "ML Workflows" (which is the official 19% ML Associate domain name) and ML-Associate file paths (`02-ml-workflows.md`) are intentionally preserved.

## [2026.05.21-13] — Cheat-sheet terminology refresh

### Changed

- **`shared/cheat-sheets/dlt-quick-ref.md` → `lakeflow-declarative-pipelines-quick-ref.md`** (rename) to reflect the current product name (formerly Delta Live Tables / DLT)
- The old `dlt-quick-ref.md` is preserved as a one-line back-compat redirect stub so existing bookmarks and inbound links keep resolving
- Cheat-sheet content updated: title, intro paragraph, frontmatter tags, and a new `> [!important]` currency callout documenting the `dlt` Python module name vs the `pyspark.pipelines as dp` newer canonical
- 6 repo-wide references updated from `dlt-quick-ref.md` → `lakeflow-declarative-pipelines-quick-ref.md`
- `shared/cheat-sheets/README.md` link refreshed

### Notes

Other cheat sheets (`auto-loader-quick-ref`, `delta-lake-commands`, `mlflow-quick-ref`, `performance-optimization`, `pyspark-api-quick-ref`, `spark-configurations`, `sql-functions`, `streaming-quick-ref`, `unity-catalog-quick-ref`, `describe-show-commands`) were audited — no Delta Live Tables / DLT / Workflows legacy terminology found in their bodies.

## [2026.05.21-12] — Add CONTRIBUTORS.md

### Added

- **`CONTRIBUTORS.md`** — attribution list for everyone who contributes to the guide. Documents:
  - How to get added (follow-up PR or mention in the original)
  - Attribution format (Markdown bullet with GitHub handle + short description ≤ 100 chars)
  - Opt-out option for contributors who don't want public attribution
  - Maintainer entry
  - Special-thanks section (Databricks for the source-of-truth exam guides, dp-800 community for the open-source pattern)

### Changed

- Top-level `README.md` — Contributing section now mentions `CONTRIBUTORS.md` and points contributors to it; repo-layout updated; Q4 roadmap entry for CONTRIBUTORS.md marked complete
- `CONTRIBUTING.md` — links `CONTRIBUTORS.md` and notes the opt-out option

## [2026.05.21-11] — Per-cert final review files (6 new)

### Added

- **`certifications/<cert>/resources/final-review.md`** for all 6 certs — 20-minute exam-morning cram scan:
  - DE Associate, DE Professional, Data Analyst Associate, ML Associate, ML Professional, GenAI Engineer Associate
- Each final review covers:
  - 2-minute "facts that show up most often" — the top current-blueprint facts
  - 5-minute per-domain quick-fire — one bullet block per official domain
  - Common-trap reminders — table of "if the stem says X, the answer is Y"
  - Today's exam time budget tailored to question count / duration
- 6 cert `resources/README.md` files updated to link the new `final-review.md`

### Notes on style

- Final reviews follow a cram-style format distinct from regular topic files — no Use Cases / Common Issues / Exam Tips terminal sections; the entire file IS exam-tips
- Each file ends with a one-line nav back to Resources and the cert root

## [2026.05.21-10] — ML Associate + ML Professional folder reorgs to current blueprints

### Changed

- **`certifications/ml-associate/` restructured to match the March 1, 2025 official 4-domain blueprint** (1 : 1 folder-to-domain mapping):
  - `01-databricks-ml/` → `01-databricks-machine-learning/`
  - `03-feature-engineering/` → `02-model-development/`
  - `02-ml-workflows/` → `03-ml-workflows/`
  - `04-mlflow-deployment/` → `04-model-deployment/`
  - 11 file moves via git mv (history preserved)
  - 14 same-folder + 15 cross-folder intra-cert links + 5 repo-wide refs rewritten
- **`certifications/ml-professional/` restructured to match the September 2025 official 3-domain blueprint** (4 folders → 3):
  - `01-advanced-feature-engineering/` (4 files) + `02-hyperparameter-optimization/` (3 files) → `01-model-development/` (7 files)
  - `03-model-production-lifecycle/` split + `04-model-governance-mlops/` (4 files) → `02-ml-ops/` (6 files) and `03-model-deployment/` (2 files)
  - 15 file moves via git mv (history preserved)
  - 22 same-folder + 6 cross-folder intra-cert links + 5 repo-wide refs rewritten
- Both cert READMEs rewritten with new Study Topics tables matching official domains
- `CLAUDE.md` Certification Topic Folders entries for ML Associate and ML Pro updated
- Top-level `README.md` repo-layout entries updated; guide-itself roadmap entry for ML cert refresh marked complete

### Added

- 7 new folder README index files (4 ML Associate + 3 ML Pro), each with Topics Overview Mermaid, Section Contents table, Key Concepts, Related Resources, back/next navigation

## [2026.05.21-9] — DE Associate May 2026 blueprint refresh

The May 2026 DE Associate exam guide explicitly tests CI/CD practices (Databricks Asset Bundles, Git folders) and basic monitoring (Lakeflow Jobs notifications, Spark UI, system tables) on top of the prior 5-domain content. This commit adds the new content without restructuring the existing 5 folders.

### Added

- **`certifications/data-engineer-associate/06-cicd-and-monitoring/`** — new domain folder with:
  - `README.md` — index, key concepts, Topics Overview
  - `01-asset-bundles-and-git-folders.md` — bundle YAML anatomy, dev / prod modes, Git-folder workflow, deployment commands, exam tips
  - `02-monitoring-basics.md` — Lakeflow Jobs notifications, repair runs, Spark UI Stages tab, system-table family (`system.lakeflow.*`, `system.access.*`, `system.billing.*`)

### Changed

- DE Associate cert README — Study Topics table now lists the new 06-cicd-and-monitoring folder; "What changed in the May 2026 exam guide" callout updated
- `CLAUDE.md` — DE Associate entry in Certification Topic Folders updated with the 6 folders
- Top-level `README.md` — repo-layout entry updated to "6 topic folders + resources/"; guide-itself roadmap entry for the May 2026 refresh marked complete

## [2026.05.21-8] — Hands-on lab pack

### Added

- **`labs/` directory** with a `README.md` index and 5 runnable labs:
  - `01-medallion-ingestion.md` — Bronze / Silver / Gold layering with `COPY INTO`, `MERGE`, `OPTIMIZE`, `VACUUM`
  - `02-unity-catalog-setup.md` — catalog / schema / volume DDL, GRANT / REVOKE / DENY, row filters, column masks, lineage + audit system tables
  - `03-lakeflow-declarative-pipelines.md` — `@dlt.table`, `expect_or_drop` / `expect_or_fail`, `APPLY CHANGES INTO` for SCD Type 2, event log inspection
  - `04-mlflow-tracking.md` — autologging, registering in UC (`databricks-uc` registry URI), `Production` / `Challenger` aliases, Model Serving + Inference Tables
  - `05-mosaic-ai-rag-demo.md` — Vector Search Delta Sync Index, `ResponsesAgent` subclass, `databricks.agents.deploy()`, Databricks Agent Evaluation with built-in RAG judges
- Each lab includes setup, step-by-step prose, runnable code blocks (PySpark / SQL / Python), verification queries, and a Cleanup section
- Top-level `README.md` repo-layout, How-to-use list, and Q3 2026 roadmap entry for hands-on lab pack updated; `CLAUDE.md` Repository Structure updated

## [2026.05.21-7] — Mock-exam debrief files + further new-domain questions

After completing a timed sitting, learners now have a structured debrief covering domain-to-resource mapping, per-section breakdown, and a study plan tailored to miss count. Each cert also gets 3 more new-domain practice questions on top of the 2 added in the earlier mock-exam refresh.

### Added

- **6 new mock-exam debrief files** — one per mock (`debrief.md`):
  - DE Pro Mock 1 + Mock 2 — full 10-domain → resource table with cheat-sheet cross-links, per-section question map bridging the legacy section headers to the Nov 30 2025 official domains, study plan by miss count, "when most misses cluster in one domain" focus actions
  - DA Mock 1 + Mock 2 — 9-domain → resource table, study plan by miss count, highest-leverage traps (Genie respects UC permissions; Dashboards vs SQL alerts)
  - GenAI Mock 1 + Mock 2 — 6-domain → resource table, study plan by miss count, highest-leverage traps (compound = one endpoint; `ResponsesAgent` + `agents.deploy()` is current; 6 Gateway policy categories; PII before embedding; Inference Tables = audit-of-record)
- **9 more new-domain practice questions per cert (18 question instances appended across the 6 mocks)**:
  - DE Pro: PERF-1 (liquid-clustering migration), COST-1 (Job-cluster + autoscaling), MON-1 (Lakeflow Jobs notifications + `system.lakeflow.job_run_timeline`)
  - DA: GS-3 (Genie audit-log → curation workflow), DASH-1 (SQL Alerts → Slack), DM-1 (materialized view for dashboard backing)
  - GenAI: AGENT-1 (`ResponsesAgent` + `agents.deploy()`), GW-1 (Unity AI Gateway traffic splitting), EVAL-1 (`mlflow.evaluate` LLM-as-judge faithfulness backtest)

### Changed

- 6 mock-exam README files updated with an "After the exam — debrief" section pointing to the new `debrief.md` plus a debrief link in the navigation line at the bottom

## [2026.05.21-6] — Fill content depth gaps in 3 under-covered domains

Three of the domain folders had thin coverage relative to their official weight. This adds 5 new topic files to fill the gaps surfaced in earlier senior-DE reviews.

### Added

- **GenAI Engineer Associate — Assembling and Deploying Apps** (22 %, was 2 files):
  - `03-compound-ai-apps.md` — compound AI app pattern (retriever + re-ranker + LLM + tools behind one endpoint); MLflow Agent Framework, deployment, streaming, tracing
  - `04-ai-gateway-endpoint-setup.md` — Unity AI Gateway configuration: rate limits, traffic splitting, payload logging, usage tracking, guardrails
- **GenAI Engineer Associate — Evaluation and Monitoring** (12 %, was 1 file):
  - `02-online-monitoring.md` — live-traffic monitoring built on Inference Tables + system tables; latency / cost / quality drift / LLM-as-judge backtests; alerting via DBSQL and Lakeflow Jobs
- **DE Professional — Data Ingestion & Acquisition** (7 %, was 1 file on Auto Loader only):
  - `02-copy-into.md` — idempotent batch file ingest; `FORMAT_OPTIONS` vs `COPY_OPTIONS`; `PATTERN` / `FILES`; UC-volume paths
  - `03-streaming-ingestion-from-message-buses.md` — Kafka / Kinesis / Event Hubs Structured Streaming sources; exactly-once via Delta + checkpointing; Lakeflow Declarative Pipelines wrapper

### Changed

- 3 folder README index files updated to list the new topic files and refresh the "Topics Overview" Mermaid diagrams
- DE Pro 07 README: the "single deep-dive" caveat note replaced with a "three pillars now covered" framing

## [2026.05.21-5] — Mock-exam refresh for DE Pro, DA, and GenAI

Refreshed all six mock-exam files (mock-exam + mock-exam-2 across the three certs whose blueprints were updated in 2025–2026) to match the current official structures and product naming.

### Changed

- **Terminology refresh** across all six `questions.md` files:
  - "Delta Live Tables" / "DLT pipeline" → "Lakeflow Declarative Pipelines" (formerly DLT)
  - "Databricks Workflows" / "Workflows UI" → "Lakeflow Jobs" / "Lakeflow Jobs UI"
- **All six mock-exam README files rewritten** with:
  - Refreshed domain-distribution tables matching each cert's current official blueprint (DE Pro 10 domains / DA 9 domains / GenAI 6 domains)
  - Result wording changed from "Passing: 70 % (44/63)" to "Pass / fail (no numeric threshold in the [version] exam guide)" since Databricks no longer publishes a threshold
  - "What's refreshed" callout at the top of each
- Top-level README roadmap entry for refreshed mock exams marked complete

### Added

- **12 new questions** appended to the six mock-exam `questions.md` files covering newly-added blueprint domains:
  - DE Pro: 2 questions per mock on **Data Sharing and Federation** (Delta Sharing D2D + Lakehouse Federation with Snowflake)
  - DA: 2 questions per mock on **AI/BI Genie Spaces** (Genie Space creation with UC permissions + curation via SQL expressions)
  - GenAI: 2 questions per mock on **Governance** (PII redaction at chunk time + Inference Tables as audit-of-record)

## [2026.05.21-4] — GenAI Engineer Associate folder reorg to 6-domain blueprint

### Changed

- **`certifications/genai-engineer-associate/` restructured to match the March 2026 official 6-domain blueprint** (1 : 1 folder-to-domain mapping). Folder map:
  - `01-rag-architecture/` → split across `03-design-applications/` (design), `04-data-preparation/` (chunking), `01-application-development/` (retrieval-augmentation strategies)
  - `02-vector-search-embeddings/` → split across `04-data-preparation/` (index creation, embeddings) and `01-application-development/` (vector search runtime, renamed from `03-vector-search-production.md`)
  - `03-llm-application-development/` → split across `01-application-development/` (prompt engineering, chains/agents) and `05-evaluation-and-monitoring/` (evaluation)
  - `04-databricks-genai-tools/` → `02-assembling-and-deploying-apps/` (Mosaic AI FMAPI, MLflow for GenAI)
- 11 file moves via git mv (history preserved)
- 14 intra-cert links rewritten; 4 repo-wide cross-references updated
- Cert README rewritten with new Study Topics table reflecting the 6 official domains and weights
- `CLAUDE.md` Certification Topic Folders entry updated for GenAI
- Top-level `README.md` repo layout updated; guide-itself roadmap entry marked complete

### Added

- 6 new folder README index files — one per official domain — each with topics overview, section contents, key concepts, and back/next navigation
- New topic file `06-governance/01-governance-overview.md` covering the new 8 % Governance domain (UC for AI assets, PII handling, content safety, AI Gateway, Inference Tables) — was previously not covered

## [2026.05.21-2] — DE Professional folder reorg to 10-domain blueprint

### Changed

- **`certifications/data-engineer-professional/` restructured to match the November 30, 2025 official 10-domain blueprint** (1 : 1 folder-to-domain mapping). Folder map:
  - `01-data-processing/` → split across `01-developing-code-for-data-processing/`, `03-data-transformation-cleansing-quality/`, `04-monitoring-and-alerting/`, `07-data-ingestion-and-acquisition/`
  - `02-databricks-tooling/` → split across `01-developing-code-for-data-processing/`, `02-cost-and-performance-optimization/`, `06-debugging-and-deploying/`, `08-data-governance/`
  - `03-data-modeling/` → `09-data-modelling/` (+ `partitioning-strategies` moved to `02-cost-and-performance-optimization/`)
  - `04-security-governance/` → split across `05-ensuring-data-security-and-compliance/`, `08-data-governance/`, `10-data-sharing-and-federation/`
  - `05-monitoring-logging/` → split across `04-monitoring-and-alerting/`, `06-debugging-and-deploying/`
  - `06-testing-deployment/` → `06-debugging-and-deploying/`
  - `07-lakeflow-pipelines/` → split across `01-developing-code-for-data-processing/`, `03-data-transformation-cleansing-quality/`
  - `08-performance-optimization/` → `02-cost-and-performance-optimization/`
- 12 cross-folder Next/Previous nav links + 50+ same-folder relative links rewritten to track the new locations
- 8 cross-folder references in `learning-paths/master-roadmap.md` and `shared/` cheat sheets and fundamentals updated to point at the new folder paths
- Cert README (`certifications/data-engineer-professional/README.md`) rewritten — Study Topics table now maps each new folder to its official domain weight; "What changed in the Nov 30, 2025 exam guide" callout updated to confirm the folder structure now matches the blueprint 1 : 1
- `CLAUDE.md` Certification Topic Folders entry updated to list the 10 new folders
- Top-level `README.md` repository layout updated to say "10 topic folders" for DE Professional, and the guide-itself roadmap entry for this reorg marked complete

### Added

- 10 new folder README index files — one per official domain — each with topics overview, section contents, key concepts, and back/next navigation
- `10-data-sharing-and-federation/02-lakehouse-federation.md` — new topic file covering the federation half of the domain (was previously not covered)

## [2026.05.21-1] — Remove local Superset state from the repo

### Removed

- `.superset/config.json` — local-only state that was accidentally committed before the open-source release. Not needed by readers; added to `.gitignore` so it stays out.

## [2026.05.21] — Open-source release, refreshed to current exam guides

First public release under MIT. Refreshed exam metadata across all six certifications against the official Databricks exam guides current as of **2026-05-21**.

### Added

- **MIT license** and public GitHub release at <https://github.com/kengio/databricks-certification-study-guide>
- **`README.md` rewrite** — banner, badges, contents, who-this-is-for, per-cert exam-at-a-glance, 2025–2026 updates callout, 4/8/12-week study roadmaps, guide-itself roadmap, expanded official-resources section
- **`CONTRIBUTING.md`** — ground rules, currency policy, 3-round review workflow, README/CLAUDE.md sync rule, conventions reference
- **`.github/` templates** — PR template with 3-round review checklist and README/CLAUDE.md sync confirmation; three issue templates (typo, factual correction, new question/topic); `config.yml` pointing to Databricks official resources
- **`CLAUDE.md` updates** — PR workflow, README/CLAUDE.md sync rule, currency policy sections
- **"What changed in the latest blueprint" callouts** at the top of each certification README
- **Per-cert exam-guide version dates** in every README

### Changed

- **Top-level `README.md`** — replaced the bare certifications table with a full-featured open-source README modelled on the [DP-800 study guide](https://github.com/kengio/dp-800-study-guide)
- **Passing score** — removed the "70 %" claim from every certification README. Databricks does not publish a numeric passing threshold; the READMEs now state "Pass/fail (Databricks does not publish a numeric threshold)."
- **DE Professional README** — domain weights updated from 5 domains to the current **10 domains** matching the November 30, 2025 exam guide (Developing Code 22 %, Cost/Perf 13 %, Transformation 10 %, Monitoring 10 %, Security 10 %, Debug/Deploy 10 %, Ingestion 7 %, Governance 7 %, Modelling 6 %, Sharing/Federation 5 %). Question count corrected from "~60" to **59**.
- **Data Analyst Associate README** — domain weights updated from 5 domains to the current **9 domains** matching the October 2025 exam guide. Added AI/BI Genie Spaces (12 %).
- **ML Associate README** — domain weights updated to match the March 1, 2025 exam guide: Databricks ML 38 %, Model Development 31 %, ML Workflows 19 %, Model Deployment 12 %. Question count corrected from "~45" to **48**.
- **ML Professional README** — domain weights updated to the current **3 domains** matching the September 2025 exam guide: Model Development 44 %, ML Ops 44 %, Model Deployment 12 %. Question count corrected from "~60" to **59**.
- **GenAI Engineer Associate README** — domain weights updated to the current **6 domains** matching the March 2026 exam guide: Application Development 30 %, Assembling and Deploying 22 %, Design Applications 14 %, Data Preparation 14 %, Evaluation and Monitoring 12 %, Governance 8 %.
- **DE Associate README** — added a note flagging that the May 2026 exam guide replaces "Workflows" terminology with **Lakeflow Jobs**. Existing topic folders preserved; folder reorg tracked as a follow-up.

### Removed

- Internal planning artifacts that were not relevant to the public guide

### Fixed

- `.gitignore` extended to exclude `docs/superpowers/`, `node_modules/`, and IDE config (`.idea/`, `.vscode/`)
- **Product-name typo** — corrected "Lakeflow Spark Declarative Pipelines" → "Lakeflow Declarative Pipelines" (the official name) in `certifications/data-engineer-professional/07-lakeflow-pipelines/README.md` and `01-declarative-pipelines.md`
- **Broken GenAI cert URL** — replaced the 404'ing `/generative-ai-engineer-associate` slug with the correct `/genai-engineer-associate` in `README.md` and `certifications/genai-engineer-associate/README.md`
- **Domain-name shortening in DA cert** — restored the official "Developing, Sharing, and Maintaining AI/BI Genie Spaces" full name across the pie chart, table, cross-reference, and note callout (was inconsistently shortened)
- **Callout casing in `README.md`** — `> [!NOTE]` and `> [!IMPORTANT]` normalised to lowercase per the project convention

## [Pre-release] — Private notes

Original private study notes built across 2025–2026 while preparing for the Databricks certification series. Not publicly released; preserved here for context.

### Highlights

- 6 certification folders (Data Engineer Associate / Professional, Data Analyst Associate, ML Associate / Professional, GenAI Engineer Associate)
- Cross-cert `shared/` content: fundamentals, cheat sheets, code examples, appendix, interview prep
- Per-cert practice questions and mock exams
