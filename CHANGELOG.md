# Changelog

Notable changes to the Databricks Certification Study Guide.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/). Dates use ISO 8601. Each section is grouped under the date the change shipped, with the Databricks exam-guide version each affected certification tracks.

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
