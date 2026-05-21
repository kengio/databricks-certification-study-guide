---
title: "Lab 03 — Lakeflow Declarative Pipelines"
type: lab
tags:
  - labs
  - lakeflow-pipelines
  - dlt
  - expectations
  - apply-changes
status: published
---

# Lab 03 — Lakeflow Declarative Pipelines

Build a complete declarative pipeline that ingests a CDC change feed, applies `APPLY CHANGES INTO` for SCD Type 2, and enforces data-quality expectations. Inspect the pipeline event log to confirm everything worked.

> [!abstract]
>
> - Define **streaming tables** and **materialized views** with `@dlt.table`
> - Add **expectations** with `expect_or_drop`, `expect_or_fail`, `expect`
> - Use **`APPLY CHANGES INTO`** for SCD Type 1 + Type 2
> - Query the **pipeline event log** for expectation metrics + flow progress

> [!tip] What you'll exercise
>
> - The `@dlt.table` decorator pattern (Python)
> - `expect_or_drop` vs `expect_or_fail` vs `expect` semantics
> - `APPLY CHANGES INTO` with `SEQUENCE BY` for ordered CDC
> - The event-log Delta table that every pipeline writes

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

## Step 1 — Author the pipeline (single Python notebook)

> [!note]
> The code below lives in a notebook that you'll select when **creating** a pipeline. It is not run directly — Lakeflow Declarative Pipelines parses the `@dlt.*` decorators and builds the DAG.

> [!tip]
> **API naming.** The `import dlt` + `@dlt.table` names work and are still widely used, but the *current* Databricks naming is `from pyspark import pipelines as dp` with `@dp.table` and `dp.create_auto_cdc_flow(...)` (the new name for `dlt.apply_changes`). Both styles work; use either consistently.

```python
import dlt
from pyspark.sql import functions as F

# Bronze: stream raw JSON files
@dlt.table(
    name="customers_bronze",
    comment="Raw CDC events landed as JSON",
)
def customers_bronze():
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.schemaLocation", "/Volumes/main/bronze/landing/_schema/customers_cdc/")
        .load("/Volumes/main/bronze/landing/customers_cdc/")
    )

# Silver-staging: validate + transform
@dlt.view(name="customers_silver_staging")
@dlt.expect_or_drop("valid_tier", "tier IN ('STD', 'GOLD', 'PLAT')")
@dlt.expect_or_fail("non_null_id", "customer_id IS NOT NULL")
def customers_silver_staging():
    return (
        dlt.read_stream("customers_bronze")
        .withColumn("event_ts", F.to_timestamp("_ts"))
        .select("customer_id", "name", "tier", "_op", "event_ts")
    )

# Silver: SCD Type 2 history using APPLY CHANGES INTO
dlt.create_streaming_table(
    name="customers_silver",
    comment="SCD Type 2 customer history",
)

dlt.apply_changes(
    target="customers_silver",
    source="customers_silver_staging",
    keys=["customer_id"],
    sequence_by="event_ts",
    apply_as_deletes=F.expr("_op = 'DELETE'"),
    stored_as_scd_type=2,    # full history with __START_AT / __END_AT columns
    except_column_list=["_op"],
)

# Gold: current-state materialized view
@dlt.table(
    name="customers_gold_current",
    comment="Current customer state (no history)",
)
def customers_gold_current():
    return (
        dlt.read("customers_silver")
        .where("__END_AT IS NULL")  # SCD2 current rows
        .select("customer_id", "name", "tier", F.col("__START_AT").alias("effective_from"))
    )
```

## Step 2 — Create + run the pipeline

In the Lakeflow Pipelines UI:

1. **Create Pipeline** → name `customers-cdc`
2. **Source code**: point at the notebook containing the code above
3. **Storage**: choose a UC catalog + schema (e.g. `main.silver`)
4. **Target**: leave blank — schema set above is used
5. **Pipeline mode**: **Triggered** for this lab (cheaper); use Continuous in production
6. **Run** the pipeline

## Step 3 — Verify

```sql
-- Bronze: how many raw events landed?
SELECT count(*) FROM main.silver.customers_bronze;

-- Silver staging: should have 6 events (the BOGUS-tier row was dropped by the expectation)
SELECT count(*) FROM main.silver.customers_silver_staging;

-- Silver: SCD2 should show history rows + a current row per customer
SELECT customer_id, name, tier, __START_AT, __END_AT
FROM main.silver.customers_silver
ORDER BY customer_id, __START_AT;

-- Gold: current state only
SELECT * FROM main.silver.customers_gold_current ORDER BY customer_id;
```

## Step 4 — Query the pipeline event log

The event log is a regular Delta table under the pipeline's storage location.

```python
# Find the pipeline's event-log location from the UI's Configuration tab, then:
event_log_path = "<copy from UI>/system/events"

events = spark.read.format("delta").load(event_log_path)
events.createOrReplaceTempView("pipeline_events")
```

```sql
-- Expectation metrics
SELECT
  timestamp,
  details:flow_definition.flow_name AS flow,
  details:expectation_metrics.expectation_name AS exp,
  details:expectation_metrics.passed_records   AS passed,
  details:expectation_metrics.failed_records   AS failed
FROM pipeline_events
WHERE event_type = 'flow_progress'
  AND details:expectation_metrics IS NOT NULL
ORDER BY timestamp DESC;

-- Look for the BOGUS-tier drop event
SELECT *
FROM pipeline_events
WHERE event_type = 'flow_progress'
  AND details:expectation_metrics.expectation_name = 'valid_tier';
```

You should see `failed_records = 1` on the `valid_tier` expectation — that's our Diego/BOGUS row.

## Step 5 — Watch the expectation modes

| Mode | Effect on the failing row | Effect on the pipeline |
| :--- | :--- | :--- |
| `expect_or_drop` | Row is dropped from the output | Pipeline succeeds; failed-records counter increments |
| `expect_or_fail` | Pipeline run is **aborted** | Subsequent updates blocked until source is fixed |
| `expect` | Row is **kept**; only metric recorded | Pipeline succeeds; useful for SLO tracking |

> [!tip]
> Choose `expect_or_drop` for "garbage in" cases where you want a clean Silver, and `expect_or_fail` for invariants that must never be violated (e.g., NULL primary keys, negative amounts).

## Cleanup

Delete the pipeline from the UI, then:

```sql
DROP TABLE IF EXISTS main.silver.customers_gold_current;
DROP TABLE IF EXISTS main.silver.customers_silver;
DROP VIEW  IF EXISTS main.silver.customers_silver_staging;
DROP TABLE IF EXISTS main.silver.customers_bronze;
-- Remove the synthesized source files
dbutils.fs.rm("/Volumes/main/bronze/landing/customers_cdc/", recurse=True)
```

## Related Study Material

- [DLT / Lakeflow Declarative Pipelines cheat sheet (shared)](../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md)
- [DE Pro — Declarative Pipelines](../certifications/data-engineer-professional/01-developing-code-for-data-processing/06-declarative-pipelines.md)
- [DE Pro — Expectations and Data Quality](../certifications/data-engineer-professional/03-data-transformation-cleansing-quality/03-expectations-data-quality.md)
- [DE Pro — `APPLY CHANGES INTO`](../certifications/data-engineer-professional/03-data-transformation-cleansing-quality/04-apply-changes-api.md)

---

**[← Previous: Unity Catalog setup](./02-unity-catalog-setup.md) | [↑ Back to Labs](./README.md) | [Next: MLflow tracking →](./04-mlflow-tracking.md)**
