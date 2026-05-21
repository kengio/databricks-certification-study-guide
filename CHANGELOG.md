# Changelog

Notable changes to the Databricks Certification Study Guide.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/). Dates use ISO 8601. Each section is grouped under the date the change shipped, with the Databricks exam-guide version each affected certification tracks.

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
