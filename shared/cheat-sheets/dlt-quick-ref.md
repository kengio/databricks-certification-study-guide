---
tags: [cheat-sheet, dlt, lakeflow-pipelines, delta-live-tables, data-engineering]
---

# DLT (Lakeflow Pipelines) Quick Reference

Quick reference for Delta Live Tables (now called Lakeflow Pipelines) — table types, expectations, APPLY CHANGES, and pipeline settings.

## Table Types

| Type | Keyword | Description | Use Case |
| :--- | :--- | :--- | :--- |
| Streaming Table | `STREAMING` | Append-only, incremental | Raw data ingestion |
| Materialized View | (default) | Recomputed on refresh | Aggregations, transforms |

```sql
-- Streaming table (append-only)
CREATE OR REFRESH STREAMING TABLE raw_events
AS SELECT * FROM STREAM(source_table);

-- Materialized view (full recompute)
CREATE OR REFRESH MATERIALIZED VIEW aggregated_sales
AS SELECT region, SUM(amount) as total
FROM sales GROUP BY region;
```

```python
import dlt

# Streaming table
@dlt.table
def raw_events():
    return spark.readStream.table("source_table")

# Materialized view
@dlt.table
def aggregated_sales():
    return (spark.read.table("live.sales")
        .groupBy("region").agg({"amount": "sum"}))
```

## DLT Decorator Options

```python
@dlt.table(
    name="my_table",
    comment="Table description",
    spark_conf={"key": "value"},
    table_properties={"quality": "gold"},
    partition_cols=["date"],
    schema="id INT, name STRING"
)
def my_table():
    return df
```

## Expectations (Data Quality)

| Action | SQL | Python |
| :--- | :--- | :--- |
| Warn (log) | `EXPECT (condition)` | `@dlt.expect("name", "condition")` |
| Drop row | `EXPECT ... ON VIOLATION DROP ROW` | `@dlt.expect_or_drop("name", "condition")` |
| Fail pipeline | `EXPECT ... ON VIOLATION FAIL UPDATE` | `@dlt.expect_or_fail("name", "condition")` |

```python
# Multiple expectations (drop if ANY fail)
@dlt.table
@dlt.expect_all_or_drop({
    "valid_id": "id IS NOT NULL",
    "positive_amount": "amount > 0"
})
def clean_events():
    return spark.readStream.table("live.raw_events")
```

## APPLY CHANGES (CDC)

```sql
-- SCD Type 1 (current state only)
CREATE OR REFRESH STREAMING TABLE target;

APPLY CHANGES INTO live.target
FROM STREAM(live.cdc_source)
KEYS (id)
SEQUENCE BY timestamp
STORED AS SCD TYPE 1;
```

```python
import dlt

# Create target table
dlt.create_streaming_table("target")

# Apply changes
dlt.apply_changes(
    target="target",
    source="cdc_source",
    keys=["id"],
    sequence_by="timestamp",
    stored_as_scd_type=2,
    track_history_column_list=["name", "email", "status"]
)
```

### SCD Types

| Type | Behavior | Result |
| :--- | :--- | :--- |
| Type 1 | Overwrite existing rows | Current state only |
| Type 2 | Insert new versions | Full history with `__START_AT`, `__END_AT` |

### APPLY CHANGES Key Options

| Option | Description |
| :--- | :--- |
| `keys` | Primary key columns |
| `sequence_by` | Column that determines which record is most recent |
| `stored_as_scd_type` | `1` or `2` |
| `ignore_null_updates` | Skip null values in updates |
| `apply_as_deletes` | Expression for delete operations |
| `track_history_column_list` | Columns tracked for SCD Type 2 history |

## Referencing Tables

| Reference | Syntax | Notes |
| :--- | :--- | :--- |
| DLT table (batch) | `spark.read.table("live.table_name")` | Same pipeline |
| DLT table (streaming) | `spark.readStream.table("live.table_name")` | Same pipeline |
| External table | `catalog.schema.table` | Other catalogs/schemas |

## Pipeline Settings

| Setting | Description |
| :--- | :--- |
| `catalog` | Unity Catalog catalog |
| `target_schema` | Output schema for all tables |
| `continuous` | True = always running; False = triggered on-demand |
| `development` | True = dev mode (relaxed expectations, lower cost) |
| `channel` | `CURRENT` (stable) or `PREVIEW` (latest features) |

## Event Log Queries

```sql
-- Query expectation results
SELECT
  details:flow_name AS flow,
  details:expectation:name AS expectation,
  details:expectation:passed_records AS passed,
  details:expectation:failed_records AS failed
FROM event_log(TABLE(my_catalog.my_schema.__dlt_event_log))
WHERE event_type = 'flow_progress'
  AND details:expectation IS NOT NULL;
```

## Exam Quick Facts

1. Streaming tables = **append-only**, incremental processing
2. Materialized views = **full recompute** on each refresh
3. `EXPECT` → logs only; `DROP ROW` → removes bad data; `FAIL UPDATE` → stops pipeline
4. `APPLY CHANGES` implements CDC with automatic MERGE logic
5. SCD Type 1 = current state; Type 2 = full history
6. Use `live.table_name` to reference tables in the same pipeline
7. `sequence_by` is required for APPLY CHANGES — determines the latest version
8. Dev mode relaxes expectations (warn instead of fail)
9. Continuous mode = always running; Triggered = on-demand

## Related Topics

- [Lakeflow Pipelines (DE Pro)](../../certifications/data-engineer-professional/07-lakeflow-pipelines/README.md)
- [Change Data Capture](../../certifications/data-engineer-professional/01-data-processing/05-change-data-capture.md)
- [Streaming Fundamentals](../fundamentals/streaming-fundamentals.md)
