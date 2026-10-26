---
title: "Lab 03 — Lakeflow Spark Declarative Pipelines"
type: lab
tags:
  - labs
  - lakeflow-pipelines
  - lakeflow-spark-declarative-pipelines
  - dlt
  - expectations
  - apply-changes
  - auto-cdc
status: published
---

# Lab 03 — Lakeflow Spark Declarative Pipelines

Build a complete declarative pipeline in **Lakeflow Spark Declarative Pipelines** (formerly Lakeflow Declarative Pipelines / Delta Live Tables) that ingests a CDC change feed, applies an **AUTO CDC** flow (formerly `APPLY CHANGES`) for SCD Type 2, and enforces data-quality expectations. Inspect the pipeline event log to confirm everything worked.

> [!abstract]
>
> - Define **streaming tables** with `@dp.table` and **materialized views** with `@dp.materialized_view`
> - Add **expectations** with `expect_or_drop`, `expect_or_fail`, `expect`
> - Use **AUTO CDC** (`dp.create_auto_cdc_flow`, formerly `dlt.apply_changes` / `APPLY CHANGES INTO`) for SCD Type 2
> - Query the **pipeline event log** for expectation metrics + flow progress

> [!tip] What you'll exercise
>
> - The `from pyspark import pipelines as dp` decorator pattern (Python)
> - `expect_or_drop` vs `expect_or_fail` vs `expect` semantics
> - AUTO CDC with `sequence_by` for ordered CDC
> - The `event_log()` table-valued function every pipeline can be queried with

> [!note] Platform update (Oct 2026)
> The product was renamed **Lakeflow Spark Declarative Pipelines** on Nov 12, 2025 (the docs also say "Lakeflow pipelines"), and the Python API moved from `import dlt` to `from pyspark import pipelines as dp`. The old `dlt` names still run, so you may still see `@dlt.table` and `APPLY CHANGES INTO` in exam stems — the [pipelines cheat sheet](../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md) maps old names to new.

---

## Setup — landing zone and CDC source

```python
# Notebook cell: synthesise a CDC stream
import json
from datetime import datetime, timezone, timedelta

cdc_path = "/Volumes/main/bronze/landing/customers_cdc/"
dbutils.fs.mkdirs(cdc_path)

events = [
    # __START_AT, __END_AT not relevant for source-side CDC
    {"customer_id": 1, "name": "Alice",  "tier": "STD",  "_op": "INSERT", "_ts": "2026-01-01T10:00:00Z"},
    {"customer_id": 2, "name": "Bob",    "tier": "STD",  "_op": "INSERT", "_ts": "2026-01-01T10:01:00Z"},
    {"customer_id": 3, "name": "Carla",  "tier": "GOLD", "_op": "INSERT", "_ts": "2026-01-01T10:02:00Z"},
    {"customer_id": 1, "name": "Alice",  "tier": "GOLD", "_op": "UPDATE", "_ts": "2026-01-02T09:00:00Z"},
    {"customer_id": 2, "name": "Bobby",  "tier": "GOLD", "_op": "UPDATE", "_ts": "2026-01-03T09:00:00Z"},
    {"customer_id": 3, "name": "Carla",  "tier": "PLAT", "_op": "UPDATE", "_ts": "2026-01-04T09:00:00Z"},
    # A row with a bad tier — will be DROPPED by an expectation
    {"customer_id": 4, "name": "Diego",  "tier": "BOGUS","_op": "INSERT", "_ts": "2026-01-05T09:00:00Z"},
]

for i, evt in enumerate(events):
    dbutils.fs.put(f"{cdc_path}part_{i:03d}.json", json.dumps(evt), overwrite=True)

print(dbutils.fs.ls(cdc_path))
```

## Step 1 — Author the pipeline (one Python source file)

> [!note]
> The code below is a pipeline **source file** (for example `transformations/customers_cdc.py`) that you add in the Lakeflow Pipelines Editor in Step 2. It is not run like a notebook cell — the pipeline parses the `@dp.*` decorators and builds the DAG.

```python
from pyspark import pipelines as dp
from pyspark.sql import functions as F

# Bronze: stream raw JSON files (the pipeline manages Auto Loader's schema + checkpoint locations)
@dp.table(
    name="customers_bronze",
    comment="Raw CDC events landed as JSON",
)
def customers_bronze():
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .load("/Volumes/main/bronze/landing/customers_cdc/")
    )

# Silver-staging: validate + transform (temporary view — not published to the catalog)
@dp.temporary_view(name="customers_silver_staging")
@dp.expect_or_drop("valid_tier", "tier IN ('STD', 'GOLD', 'PLAT')")
@dp.expect_or_fail("non_null_id", "customer_id IS NOT NULL")
def customers_silver_staging():
    return (
        spark.readStream.table("customers_bronze")
        .withColumn("event_ts", F.to_timestamp("_ts"))
        .select("customer_id", "name", "tier", "_op", "event_ts")
    )

# Silver: SCD Type 2 history using an AUTO CDC flow (formerly APPLY CHANGES)
dp.create_streaming_table(
    name="customers_silver",
    comment="SCD Type 2 customer history",
)

dp.create_auto_cdc_flow(
    target="customers_silver",
    source="customers_silver_staging",
    keys=["customer_id"],
    sequence_by="event_ts",
    apply_as_deletes=F.expr("_op = 'DELETE'"),
    stored_as_scd_type=2,    # full history with __START_AT / __END_AT columns
    except_column_list=["_op"],
)

# Gold: current-state materialized view
@dp.materialized_view(
    name="customers_gold_current",
    comment="Current customer state (no history)",
)
def customers_gold_current():
    return (
        spark.read.table("customers_silver")
        .where("__END_AT IS NULL")  # SCD2 current rows
        .select("customer_id", "name", "tier", F.col("__START_AT").alias("effective_from"))
    )
```

## Step 2 — Create + run the pipeline

In the workspace (Lakeflow Pipelines Editor):

1. Click **New** → **ETL pipeline** and rename the pipeline `customers-cdc`
2. Next to the name, choose a default **catalog + schema** you can write to (e.g. `main` / `silver`) — unqualified dataset names are published there
3. In the asset browser, **Add** a transformation file and paste the code from Step 1
4. Leave the pipeline **triggered** (not continuous) for this lab — it's cheaper; use continuous mode only when you need always-on low latency
5. Click **Run pipeline** and watch the pipeline graph fill in

## Step 3 — Verify

```sql
-- Bronze: how many raw events landed?
SELECT count(*) FROM main.silver.customers_bronze;

-- The staging dataset is a temporary view, so it can't be queried from outside the pipeline.
-- Use the event log (Step 4) to confirm the BOGUS-tier row was dropped.

-- Silver: SCD2 should show history rows + a current row per customer (customer 4 never arrives)
SELECT customer_id, name, tier, __START_AT, __END_AT
FROM main.silver.customers_silver
ORDER BY customer_id, __START_AT;

-- Gold: current state only
SELECT * FROM main.silver.customers_gold_current ORDER BY customer_id;
```

## Step 4 — Query the pipeline event log

Query the event log with the `event_log()` table-valued function — pass either `TABLE(<streaming table or materialized view>)` or the pipeline ID (shown on the pipeline's page in the UI).

```sql
-- Expectation pass/fail counts per dataset + expectation
SELECT
  row_expectations.dataset AS dataset,
  row_expectations.name    AS expectation,
  SUM(row_expectations.passed_records) AS passing_records,
  SUM(row_expectations.failed_records) AS failing_records
FROM (
  SELECT explode(
    from_json(
      details:flow_progress.data_quality.expectations,
      "array<struct<name: string, dataset: string, passed_records: int, failed_records: int>>"
    )
  ) AS row_expectations
  FROM event_log('<pipeline-id>')
  WHERE event_type = 'flow_progress'
)
GROUP BY row_expectations.dataset, row_expectations.name;

-- Recent events for one published dataset
SELECT timestamp, event_type, message
FROM event_log(TABLE(main.silver.customers_silver))
ORDER BY timestamp DESC;
```

You should see `failing_records = 1` on the `valid_tier` expectation — that's our Diego/BOGUS row.

## Step 5 — Watch the expectation modes

| Mode | Effect on the failing row | Effect on the pipeline |
| :--- | :--- | :--- |
| `expect_or_drop` | Row is dropped from the output | Pipeline succeeds; failed-records counter increments |
| `expect_or_fail` | The update **stops** for that flow | Only the flow that hit the violation fails; fix the data, then re-run |
| `expect` | Row is **kept**; only metric recorded | Pipeline succeeds; useful for SLO tracking |

> [!tip]
> Choose `expect_or_drop` for "garbage in" cases where you want a clean Silver, and `expect_or_fail` for invariants that must never be violated (e.g., NULL primary keys, negative amounts).

## Cleanup

Delete the pipeline from the UI, then drop anything that remains:

```sql
DROP MATERIALIZED VIEW IF EXISTS main.silver.customers_gold_current;
DROP TABLE IF EXISTS main.silver.customers_silver;
DROP TABLE IF EXISTS main.silver.customers_bronze;
```

```python
# Remove the synthesized source files
dbutils.fs.rm("/Volumes/main/bronze/landing/customers_cdc/", recurse=True)
```

## Related Study Material

- [Lakeflow Spark Declarative Pipelines cheat sheet (shared, formerly DLT)](../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md)
- [Pipelines code examples (shared)](../shared/code-examples/python/dlt_pipelines.md)
- [DE Pro — Declarative Pipelines](../certifications/data-engineer-professional/01-developing-code-for-data-processing/06-declarative-pipelines.md)
- [DE Pro — Expectations and Data Quality](../certifications/data-engineer-professional/03-data-manipulation/06-expectations-data-quality.md)
- [DE Pro — AUTO CDC (`APPLY CHANGES INTO`)](../certifications/data-engineer-professional/01-developing-code-for-data-processing/07-auto-cdc-api.md)

---

**[← Previous: Unity Catalog setup](./02-unity-catalog-setup.md) | [↑ Back to Labs](./README.md) | [Next: MLflow tracking →](./04-mlflow-tracking.md)**
