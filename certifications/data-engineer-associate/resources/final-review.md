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

- **Lakeflow Jobs** is the current name; Workflows is the legacy term — both may appear in stems
- **Lakeflow Declarative Pipelines** is the current name; "Delta Live Tables / DLT" is legacy
- **`COPY INTO` is idempotent** — re-running skips already-loaded files automatically
- **Auto Loader (`cloudFiles`)** = incremental file ingestion; default `schemaEvolutionMode = addNewColumns`
- **Delta `MERGE INTO`** = single atomic upsert (insert + update + delete via `WHEN MATCHED` / `NOT MATCHED`)
- **Liquid Clustering** (`CLUSTER BY` + `OPTIMIZE table FULL`) is the modern alternative to Z-ORDER for new tables
- **Unity Catalog three-level namespace**: `catalog.schema.object`
- **GRANT cascades** from catalog → schema → table; **DENY overrides GRANT**; **REVOKE only removes a prior GRANT**
- **UC volumes** (`/Volumes/...`) are the modern path for non-tabular file storage; DBFS mounts are deprecated for new work
- **Databricks Asset Bundles** = YAML-driven deployment unit; `mode: development` prefixes resource names + pauses schedules; `mode: production` runs as the configured service principal
- **System tables**: `system.lakeflow.*` (jobs), `system.access.*` (audit, lineage), `system.billing.*` (DBU usage)

## 5-minute per-domain quick-fire

### 01 — Lakehouse Platform

- **Databricks Runtime** versions: standard, ML, Photon-enabled
- **SQL Warehouses**: Pro (modern, Photon, Predictive I/O), Serverless (fastest provisioning), Classic (legacy)
- **All-purpose** clusters = shared interactive (more expensive per DBU); **Job clusters** = ephemeral, cheaper

### 02 — ETL with Spark SQL and Python

- **DataFrame**: lazy until an action (`show`, `count`, `write`)
- **Joins**: inner / outer / cross / semi / anti; broadcast small tables with `broadcast()`
- **Aggregations**: `GROUP BY` / `GROUPING SETS` / `ROLLUP` / `CUBE`
- **Window functions**: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`; frame clauses control range

### 03 — Delta Lake

- **ACID** transactions on object storage
- **Time travel**: `VERSION AS OF n` or `TIMESTAMP AS OF '2026-01-01'`
- **OPTIMIZE** compacts small files; **VACUUM** drops tombstoned files (default 7-day retention)
- **Change Data Feed** (CDF) tracks per-row insert/update/delete via `TBLPROPERTIES(delta.enableChangeDataFeed=true)`

### 04 — Workflows & Orchestration (Lakeflow Jobs)

- **Lakeflow Jobs** = DAGs of tasks (notebook / Python wheel / Lakeflow pipeline / SQL / dbt)
- **Repair run** = re-run only the failed tasks (+ descendants), cheaper than full re-run
- **Notifications**: email + webhook on success / failure / duration

### 05 — Data Governance

- **Unity Catalog** is the single governance plane
- **Managed vs External** tables: managed = UC owns storage; external = UC owns metadata only
- **Delta Sharing** = open cross-org sharing of Delta tables (D2D uses sharing identifier; open Delta Sharing uses bearer tokens)
- **Row filters** + **column masks** = SQL UDFs attached to columns/tables, enforced at query time

### 06 — CI/CD and Monitoring *(new in May 2026)*

- **Databricks Asset Bundles** = `databricks.yml` + `resources/*.yml` + source code; deploy with `databricks bundle deploy --target <name>`
- **Git folders** are the workspace's view of a Git repo (formerly Repos)
- **Spark UI**: Stages tab first — sort by Duration to find the slowest stage; check Shuffle Read/Write for skew
- **System tables** refresh on a delay (minutes to ~1 hour) — don't expect real-time

## Common-trap reminders

| Trap | Right answer |
| :--- | :--- |
| Question says "Workflows" | Read it as Lakeflow Jobs |
| Question says "DLT" or "Delta Live Tables" | Read it as Lakeflow Declarative Pipelines |
| Question asks about cross-org Delta data sharing | Delta Sharing (NOT Lakehouse Federation) |
| Question asks about querying external (non-Delta) databases | Lakehouse Federation (NOT Delta Sharing) |
| Question asks "what blocks access even if granted?" | DENY (not REVOKE) |
| Question asks the cheaper compute for a scheduled job | Job cluster (not all-purpose) |
| Question asks how to dedupe an incremental load | Use `MERGE INTO` with `WHEN MATCHED` semantics or row-number → filter pattern |

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
