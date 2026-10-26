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

- **Streaming table vs materialized view**: an aggregate that must reflect **late updates to prior days** is a materialized view; append-only ingestion processed once is a streaming table
- **AUTO CDC (formerly `APPLY CHANGES INTO`)** is the declarative SCD inside Lakeflow Pipelines — `keys` + `sequence_by` required, `stored_as_scd_type` 1 (default) or 2
- **Watermark + checkpoint**: the watermark bounds state for late events; the checkpoint restores offsets and state so a restart resumes exactly once
- **`MERGE INTO`** is the atomic upsert on Delta; **deletion vectors** cut the file rewrites of frequent small MERGE / UPDATE / DELETE
- **Liquid clustering** (`CLUSTER BY`, or `CLUSTER BY AUTO` to let Databricks pick keys) is the recommended layout for new tables; `OPTIMIZE ... FULL` re-clusters existing data
- **Predictive Optimization** runs OPTIMIZE, VACUUM and statistics on Unity Catalog managed tables for you
- **Cost attribution** = `system.billing.usage` joined with `system.billing.list_prices` (and `system.lakeflow.jobs` / compute tables)
- **ABAC policy on a governed tag** masks every tagged column in current and future tables — no per-table `SET MASK`
- **UC grants inherit downward** to current and future objects; `USE CATALOG` + `USE SCHEMA` are still required
- **Declarative Automation Bundles** (formerly Asset Bundles): `databricks.yml` + targets; `databricks bundle deploy -t <target>`

## 5-minute per-section quick-fire (9 sections)

### 01 — Developing Code for Data Processing using Python and SQL (23 %)

- Bundle project: `databricks.yml`, `resources/`, `src/<package>/`, `tests/`; build a wheel as an artifact
- UDFs: prefer built-ins → SQL UDF → pandas UDF → Python UDF; Unity Catalog functions for governed reuse (`EXECUTE`)
- Pipelines Python API: `from pyspark import pipelines as dp`; `@dp.table`, `@dp.materialized_view`, `@dp.expect_or_drop`
- Lakeflow Jobs: If/else condition and For each tasks; serverless performance-optimized vs standard mode
- Tests: `assertDataFrameEqual`, `assertSchemaEqual`, small functions composed with `DataFrame.transform`

### 02 — Data Ingestion & Acquisition (12 %)

- Auto Loader (`cloudFiles`) for continuous file ingest, incl. `binaryFile`; `COPY INTO` for idempotent batch
- Kafka / Kinesis / Pub/Sub streaming sources; exactly-once into Delta via checkpoints
- Lakeflow Connect managed connectors for SQL Server, MySQL, PostgreSQL CDC
- OpenSharing (formerly Delta Sharing): D2D uses a sharing identifier; Databricks-to-Open uses bearer tokens or OIDC
- Clean Rooms: collaborators run approved notebooks without seeing each other's raw data
- Lakehouse Federation: `CREATE CONNECTION` + `CREATE FOREIGN CATALOG`; credentials live on the connection

### 03 — Data Manipulation (12 %)

- Window functions (`row_number`, `lag`, running totals), joins, aggregations
- VARIANT: `parse_json`, `col:path::type`, `variant_get`, `try_variant_get`
- `ai_query(endpoint, request)` and task functions (`ai_classify`, `ai_extract`, …) for enrichment
- Expectations: warn (`expect`), drop (`_or_drop`), fail (`_or_fail` — the flow update fails and rolls back); quarantine = flag + separate table

### 04 — Monitoring and Alerting (10 %)

- System tables: `system.billing`, `system.compute`, `system.access`, `system.lakeflow`
- Pipeline event log: `event_log(<pipeline-id>)`, `flow_progress` events carry expectation metrics
- Alerts: a scheduled query + condition + notification; the SQL alert task can branch a job with If/else
- REST API / CLI / SDK: `w.jobs.list_runs`, `w.pipelines.list_pipeline_events`, `databricks jobs list-runs`

### 05 — Cost & Performance Optimization (15 %)

- Managed tables + Predictive Optimization + liquid clustering = less maintenance work
- Disk cache (Delta cache) speeds repeated reads from local SSD; Spark `cache()` is different
- Change Data Feed: `delta.enableChangeDataFeed`, `table_changes`, `readChangeFeed`; `_change_type` values
- Query profile: files / bytes pruned vs read, join strategy, shuffle and spill

### 06 — Ensuring Data Security and Compliance (8 %)

- Least privilege: grant to groups, on the narrowest securable; workspace-object ACLs (CAN VIEW / CAN RUN / CAN MANAGE)
- Pseudonymization (salted hash, tokens) is reversible with a key; anonymization (suppression, generalization) is not
- Erasure: DELETE → `REORG TABLE ... APPLY (PURGE)` (deletion vectors) → VACUUM after retention

### 07 — Data Governance (5 %)

- Grants on a catalog or schema are inherited by current and future objects
- Tags and comments on securables drive search and discovery; governed tags also drive ABAC

### 08 — Debugging and Deploying (10 %)

- Diagnose with the Spark UI, driver / compute logs, system tables and the query profile
- **Repair run** re-runs only failed tasks (and dependents), optionally with new parameter values
- Bundles: `validate` → `deploy -t` → `run`; `mode: development` prefixes names and pauses schedules
- Git folders (formerly Repos): CI updates a production Git folder to a branch or tag

### 09 — Data Modeling (5 %)

- Partition only large tables, by low-cardinality grain (date); cluster on filter / join keys; compact with OPTIMIZE
- Star schema: facts + dimensions; materialized views for pre-aggregation; **metric views** for governed, reusable metrics (`MEASURE()`)
- SCD Type 1 = overwrite; Type 2 = new row with an effective range (full history)

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| Stem says "DLT", "Delta Live Tables" or "APPLY CHANGES" | Read as Lakeflow Pipelines / AUTO CDC |
| "Asset Bundles" / "DABs" | Declarative Automation Bundles — same `databricks bundle` CLI |
| "Delta Sharing" | OpenSharing |
| "Aggregate must include late updates to prior days" | Materialized view |
| "Replicate PostgreSQL changes with minimal code" | Lakeflow Connect, not JDBC or OpenSharing |
| "Query Snowflake without ETL" | Lakehouse Federation |
| "One rule to mask every `pii` column" | ABAC policy on a governed tag |
| "Same metric computed differently in each dashboard" | Unity Catalog metric view |
| "Re-run only the failed task with a new date" | Repair run with a parameter override |
| "Most-managed governance answer" | Unity Catalog |

## Today's exam — 120-minute time budget

- **60 scored questions ÷ 120 minutes ≈ 2 min/question** — flag long scenarios on first read, return at end
- Multi-paragraph scenarios: read the *question* first, then the scenario — finds the relevant facts faster
- "Which is the LEAST" / "EXCEPT" stems: read twice; mark answer to your *original* reading then verify
- Default to the **most-managed** option: Lakeflow Jobs > custom Airflow; Lakeflow Pipelines > hand-written Spark stream; UC > workspace ACLs

## Eat. Hydrate. Breathe.

You've put in the hours. Trust the prep. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to Data Engineer Professional](../README.md)**
