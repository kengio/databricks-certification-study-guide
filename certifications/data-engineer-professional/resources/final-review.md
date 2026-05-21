---
title: Final Review — Data Engineer Professional
type: final-review
tags:
  - data-engineer-professional
  - final-review
  - exam-morning
status: published
---

# Final Review — DE Professional (20-minute exam-morning scan)

> [!important]
> Cram scan for exam morning. Each line is a fact the exam can test — if any look unfamiliar, hit the topic folder on the way home.

## 2-minute facts that show up *most often*

- **`MERGE INTO` is the only atomic upsert** on Delta; combine with `WHEN MATCHED` / `NOT MATCHED [BY SOURCE/TARGET]`
- **`APPLY CHANGES INTO`** is the declarative SCD inside Lakeflow Declarative Pipelines — pick over hand-written MERGE for SCD Type 1/2
- **Auto Loader file-notification mode** scales to millions of files; **directory listing** is simpler but lower-scale
- **Photon** accelerates many but **not all** operators — check the Spark UI for the Photon badge
- **Liquid clustering** (`CLUSTER BY`) replaces Z-ORDER + partitioning for new Delta tables; `OPTIMIZE table FULL` back-fills existing data
- **Lakeflow event log** = Delta table at `<storage>/system/events`; queryable for `expectation_metrics`, `flow_progress`, `data_quality`
- **Delta Sharing** = open cross-org; D2D Share uses UC sharing identifiers
- **Lakehouse Federation** = read-mostly query over external DBs (Snowflake, BigQuery, Postgres, MySQL, SQL Server, …); `CREATE CONNECTION` + `CREATE FOREIGN CATALOG`
- **Asset Bundles `mode: development`** prefixes resource names + pauses schedules; `mode: production` uses the configured service principal
- **System tables** under `system.lakeflow.*`, `system.access.*`, `system.billing.*` refresh on a delay (minutes to ~1 hour)

## 5-minute per-domain quick-fire (10 domains)

### 01 — Developing Code for Data Processing (22 %)

- Spark Structured Streaming: triggers `processingTime`, `availableNow`, `once`; output modes `append` / `update` / `complete`
- Watermarks bound how long state is kept for stream-stream joins / dedup
- Lakeflow Declarative Pipelines: `@dlt.table` / `@dlt.view`; `@dlt.expect_or_drop` / `_or_fail` / `expect`
- Lakeflow Jobs: tasks + dependencies + `for_each`; Repair Run on failure

### 02 — Cost & Performance Optimization (13 %)

- Target file size 128 MB – 1 GB; small-file problem hurts; liquid clustering adapts
- AQE (Adaptive Query Execution) dynamically coalesces shuffle partitions
- Photon accelerates vectorisable ops; check Spark UI for badge
- Job clusters cost ~50 % less per DBU than all-purpose

### 03 — Data Transformation, Cleansing, Quality (10 %)

- CDC patterns: Delta CDF as source; `APPLY CHANGES INTO` as target
- Deduplication: `txnAppId` + `txnVersion` for idempotent writes
- Expectations: `_or_drop` (silently drop), `_or_fail` (abort pipeline), bare `expect` (metric only)

### 04 — Monitoring and Alerting (10 %)

- System tables for usage/audit; query `system.lakeflow.job_run_timeline` for run history
- SQL Alerts trigger on query-result thresholds (>, <, ==)
- Lakeflow Jobs notifications: email + webhook on success / failure / duration

### 05 — Ensuring Data Security and Compliance (10 %)

- GRANT cascades; DENY overrides GRANT; REVOKE only removes prior GRANT
- Row filters + column masks = SQL UDFs attached to a column/table
- Secret scopes: Databricks-backed or Azure-Key-Vault-backed (Azure only)

### 06 — Debugging and Deploying (10 %)

- Databricks Asset Bundles: `databricks bundle validate` / `deploy --target` / `run`
- Git folders for source control (formerly Repos)
- Production = service principal, not personal token
- Spark UI: Stages → Tasks → Shuffle → SQL plan triage flow

### 07 — Data Ingestion & Acquisition (7 %)

- Auto Loader (`cloudFiles`) for continuous file ingest; `COPY INTO` for idempotent batch
- Kafka / Kinesis / Event Hubs Structured Streaming sources; exactly-once via Delta + checkpointing
- Checkpoint location must be unique per writeStream

### 08 — Data Governance (7 %)

- UC three-level namespace `catalog.schema.object`
- Managed (UC owns storage) vs External (you own storage)
- UC Volumes replace DBFS mounts for non-tabular files

### 09 — Data Modelling (6 %)

- Medallion: Bronze (raw) → Silver (cleansed) → Gold (aggregated)
- Schema evolution: `mergeSchema = true` adds columns; `overwriteSchema = true` replaces
- SCD Type 1 = overwrite (no history); Type 2 = insert new row with effective range (full history)

### 10 — Data Sharing and Federation (5 %)

- Delta Sharing: provider creates `SHARE` + grants to `RECIPIENT`; D2D uses sharing identifier
- Lakehouse Federation: `CREATE CONNECTION ... TYPE <SOURCE>` + `CREATE FOREIGN CATALOG ... USING CONNECTION`
- Federation is read-mostly; pushdown is best-effort

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| Stem says "DLT" / "Delta Live Tables" | Read as Lakeflow Declarative Pipelines |
| "Cross-organisation Delta data sharing" | Delta Sharing |
| "Query Snowflake without ETL" | Lakehouse Federation |
| "Dropped-record metric per expectation" | Lakeflow event log → `expectation_metrics` |
| "Cheaper compute for scheduled work" | Job cluster |
| "Atomic upsert" | `MERGE INTO` (one statement) |
| "Declarative SCD in a pipeline" | `APPLY CHANGES INTO` |
| "Most-managed governance answer" | Unity Catalog |

## Today's exam — 120-minute time budget

- **59 questions ÷ 120 minutes ≈ 2 min/question** — flag long scenarios on first read, return at end
- Multi-paragraph scenarios: read the *question* first, then the scenario — finds the relevant facts faster
- "Which is the LEAST" / "EXCEPT" stems: read twice; mark answer to your *original* reading then verify
- Default to the **most-managed** option: Lakeflow Jobs > custom Airflow; Lakeflow Declarative Pipelines > hand-written Spark stream; UC > workspace ACLs

## Eat. Hydrate. Breathe.

You've put in the hours. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to Data Engineer Professional](../README.md)**
