---
title: Final Review — Data Engineer Associate
type: final-review
tags:
  - data-engineer-associate
  - final-review
  - exam-morning
status: published
---

# Final Review — DE Associate (20-minute exam-morning scan)

> [!important]
> **Read this on the morning of the exam.** It's a cram scan, not a study guide. If a fact below is unfamiliar, that's a domain you missed during study — make a note and revisit the relevant topic folder right after.

## 2-minute facts that show up *most often*

- **Lakeflow Jobs** is the current name for what was called Workflows. Expect "Workflows" only in older material
- **Lakeflow Declarative Pipelines** (the exam's name) = the former "Delta Live Tables / DLT". Since Nov 12, 2025 the docs call it **Lakeflow Spark Declarative Pipelines**
- **Declarative Automation Bundles** = the former **Databricks Asset Bundles** (DABs). Same `databricks bundle` CLI. **Git folders** = the former Repos
- **`COPY INTO` is idempotent**: a re-run skips files already loaded. `'force' = 'true'` reloads them
- **Auto Loader (`cloudFiles`)**: `addNewColumns` (default) *stops* the stream, then evolves on restart. `rescue` never fails and sends extras to `_rescued_data`
- **Managed connectors** (SaaS, databases) → serverless ingestion pipelines writing streaming tables. The **ingestion gateway** exists for databases only
- **Triggers**: scheduled (time-based) vs **file arrival** and **table update** (data-driven)
- **AQE skew handling = joins only**. A skewed `groupBy` needs **salting**
- **Liquid Clustering** (`CLUSTER BY`, up to 4 keys, can't be combined with partitioning or Z-order). **Predictive optimization** = automatic `OPTIMIZE` / `VACUUM` / `ANALYZE` on **UC managed tables**
- **UC access** = `USE CATALOG` + `USE SCHEMA` + object privilege. Grants are inherited by current and future children
- **DENY**: the classic statement is **Hive metastore only**. UC uses REVOKE or withholding grants, filters, masks, and ABAC (an ABAC DENY policy, in Beta, denies only `MANAGE ACCESS CONTROL`)
- **External → managed**: `ALTER TABLE ... SET MANAGED`. Undo with `UNSET MANAGED` within 14 days

## 5-minute per-domain quick-fire

### 01 — Databricks Intelligence Platform (6 %)

- Lakehouse = one governed copy (Delta Lake + Unity Catalog) for BI and AI. Time travel gives rollback and an audit trail
- Many concurrent ad hoc SQL users → **serverless SQL warehouse** (starts in about 2–6 s, autoscaling, auto stop)
- Scheduled ETL → serverless jobs or jobs compute. Interactive work → all-purpose compute or a serverless notebook

### 02 — Data Ingestion and Loading (21 %)

- Start with the **most managed** layer: managed connector → Lakeflow pipelines → Structured Streaming / Spark APIs
- File detection: directory listing (default) vs **file notification with file events** (recommended)
- JDBC: secrets via `dbutils.secrets.get`. Parallelize with `partitionColumn` / bounds / `numPartitions`
- REST → land JSON in a **UC volume** → Auto Loader → schedule both in one Lakeflow Job

### 03 — Data Transformation and Modeling (22 %)

- `union` keeps duplicates and matches by position. `unionByName` matches by name. SQL `UNION` deduplicates
- "Latest row per key" → `ROW_NUMBER()` / `QUALIFY`, not `dropDuplicates`
- View (recomputed per query) vs **materialized view** (stored, refreshed) vs **streaming table** (incremental append) vs table
- Expectations: warn (default) / `DROP ROW` / `FAIL UPDATE`
- `spark.sql.shuffle.partitions` (200, or `auto`) for DataFrame shuffles. `spark.default.parallelism` for RDDs. Broadcast threshold 10 MB

### 04 — Working with Lakeflow Jobs (16 %)

- Task types: notebook, SQL, dashboard, pipeline. **Depends on** builds the DAG
- **If/else** (branching), **For each** (looping, concurrency default 1), **retries**, Run if **All done** for cleanup
- Quartz cron: `0 0 9 ? * MON-FRI` = weekdays at 09:00

### 05 — Implementing CI/CD (10 %)

- Git folder: Create Branch → edit → **Commit & Push** → **PR in the Git provider**
- Variable precedence: `--var` > `BUNDLE_VAR_` > `variable-overrides.json` > target `variables` > `default`
- `mode: development` = prefixed names and paused schedules. `mode: production` = branch, `run_as`, and path validations
- `databricks bundle validate` → `deploy -t prod` → `run`

### 06 — Troubleshooting, Monitoring, and Optimization (10 %)

- Duration trends → the job's **matrix view**. Blockers → the **Graph** view (`Upstream failed` points upstream)
- **Timed Out** → raise the task timeout. **Succeeded with failures** → leaf tasks succeeded
- Skew: max ≫ 75th percentile. Spill: Spill (Disk) > 0 → `auto` / more partitions or more memory
- Startup failure → event log termination code. Library conflict → notebook-scoped `%pip`, pinned versions. Driver OOM → stop collecting data to the driver

### 07 — Governance and Security (15 %)

- Managed: `DROP` deletes after the `UNDROP` window (7 days). External: `DROP` removes metadata only
- Column mask with `is_account_group_member('finance_team')`. Row filter = a `BOOLEAN` UDF with `SET ROW FILTER ... ON (cols)`
- **ABAC** = `CREATE POLICY ... FOR TABLES` with governed tags, at catalog or schema level

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| Question says "Workflows" | Read it as Lakeflow Jobs |
| Question says "DLT" or "Delta Live Tables" | Read it as Lakeflow Declarative Pipelines |
| "AQE is on, so skew is handled" on a `groupBy` | No. Salt the key |
| "Lower shuffle partitions to fix skew" | No. It makes partitions bigger |
| "Put the password in `databricks.yml`" | No. Use `BUNDLE_VAR_<name>` from CI secrets |
| "DENY blocks access in Unity Catalog" | The classic `DENY` statement is Hive-metastore only. Revoke, filter, mask, or use ABAC |
| Undo `SET MANAGED` | `UNSET MANAGED` within 14 days, not `RESTORE` |
| Files land at unpredictable times | File arrival trigger, not a polling schedule |
| Cheaper compute for a scheduled job | Jobs compute or serverless jobs, not all-purpose |

## Today's exam — 90-minute time budget

- **45 questions ÷ 90 minutes = ~2 min/question** — keep moving
- **Flag and skip** anything you can't answer in 90 seconds — return at the end
- **Re-read the scenario** before re-reading the question — most traps are in the scenario
- **Default to the simplest option** that satisfies *all* constraints; Databricks rewards "most-managed" answers (Auto Loader > custom polling, Lakeflow Jobs > custom orchestration, UC > workspace-local)
- **Don't second-guess** flagged questions on the second pass unless you find new information

## Eat. Hydrate. Breathe.

You're prepared. The work is done. Trust it. Go pass it.

---

**[← Back to Resources](./README.md)** | **[↑ Back to Data Engineer Associate](../README.md)**
