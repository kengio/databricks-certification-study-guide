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
| View | `LIVE.` prefix | Temporary, no storage | In-pipeline transforms |

```sql
-- Streaming table (append-only)
CREATE OR REFRESH STREAMING TABLE raw_events
AS SELECT * FROM STREAM(source_table);

-- Materialized view (full recompute)
CREATE OR REFRESH MATERIALIZED VIEW aggregated_sales
AS SELECT region, SUM(amount) AS total
FROM sales GROUP BY region;
```

```python
import dlt

@dlt.table
def raw_events():
    return spark.readStream.table("source_table")

@dlt.table
def aggregated_sales():
    return (spark.read.table("live.sales")
        .groupBy("region").agg({"amount": "sum"}))
```

## DLT Decorator Options

```python
@dlt.table(
    name="my_table",                      # Override function name
    comment="Table description",           # Documentation
    spark_conf={"key": "value"},          # Spark config
    table_properties={"quality": "gold"}, # Delta properties
    path="/custom/path",                   # Storage location
    partition_cols=["date"],              # Partitioning
    schema="id INT, name STRING",         # Explicit schema
    temporary=True                         # Not persisted in catalog
)
def my_table():
    return df
```

| Parameter | Description |
| :--- | :--- |
| `name` | Override function name as table name |
| `comment` | Table description |
| `spark_conf` | Spark configurations for this table |
| `table_properties` | Delta table properties |
| `path` | Custom storage path (external location) |
| `partition_cols` | Partitioning columns |
| `schema` | Explicit schema (string or StructType) |
| `temporary` | `True` = temp table, not materialized in catalog |

## Expectations (Data Quality)

| Action | SQL | Python |
| :--- | :--- | :--- |
| Warn (log) | `EXPECT (condition)` | `@dlt.expect("name", "condition")` |
| Drop row | `EXPECT ... ON VIOLATION DROP ROW` | `@dlt.expect_or_drop("name", "condition")` |
| Fail pipeline | `EXPECT ... ON VIOLATION FAIL UPDATE` | `@dlt.expect_or_fail("name", "condition")` |

### SQL CONSTRAINT Examples

```sql
-- Warn only (default)
CREATE OR REFRESH STREAMING TABLE validated_events (
  CONSTRAINT valid_id EXPECT (id IS NOT NULL),
  CONSTRAINT valid_amount EXPECT (amount > 0)
)
AS SELECT * FROM STREAM(raw_events);

-- Drop invalid rows
CREATE OR REFRESH STREAMING TABLE clean_events (
  CONSTRAINT valid_id EXPECT (id IS NOT NULL) ON VIOLATION DROP ROW
)
AS SELECT * FROM STREAM(raw_events);

-- Fail pipeline on violation
CREATE OR REFRESH STREAMING TABLE critical_events (
  CONSTRAINT non_null_id EXPECT (id IS NOT NULL) ON VIOLATION FAIL UPDATE
)
AS SELECT * FROM STREAM(raw_events);
```

### Python Expectation Examples

```python
# Single expectation — warn
@dlt.table
@dlt.expect("valid_id", "id IS NOT NULL")
def validated_events():
    return spark.readStream.table("live.raw_events")

# Multiple expectations — drop if ANY fail
@dlt.table
@dlt.expect_all_or_drop({
    "valid_id": "id IS NOT NULL",
    "positive_amount": "amount > 0"
})
def clean_events():
    return spark.readStream.table("live.raw_events")

# Multiple expectations — fail if ANY fail
@dlt.table
@dlt.expect_all_or_fail({
    "valid_id": "id IS NOT NULL",
    "valid_date": "event_date IS NOT NULL"
})
def critical_events():
    return spark.readStream.table("live.raw_events")

# Multiple expectations — warn only (log all failures)
@dlt.table
@dlt.expect_all({
    "valid_id": "id IS NOT NULL",
    "valid_amount": "amount > 0"
})
def monitored_events():
    return spark.readStream.table("live.raw_events")
```

## APPLY CHANGES (CDC)

### SQL Syntax

```sql
CREATE OR REFRESH STREAMING TABLE target;

APPLY CHANGES INTO live.target
FROM STREAM(live.cdc_source)
KEYS (id)
SEQUENCE BY timestamp
COLUMNS * EXCEPT (_commit_version, _commit_timestamp)
STORED AS SCD TYPE 1;
```

### Python Syntax

```python
import dlt

# Create target table first
dlt.create_streaming_table("target")

# SCD Type 1 — current state only
dlt.apply_changes(
    target="target",
    source="cdc_source",
    keys=["id"],
    sequence_by="timestamp",
    stored_as_scd_type=1
)

# SCD Type 2 — full history
dlt.apply_changes(
    target="customers_history",
    source="customers_cdc",
    keys=["customer_id"],
    sequence_by="updated_at",
    stored_as_scd_type=2,
    track_history_column_list=["name", "email", "status"]
)
```

### SCD Types

| Type | Behavior | Result |
| :--- | :--- | :--- |
| Type 1 | Overwrite existing rows | Current state only |
| Type 2 | Insert new versions | Full history with `__START_AT`, `__END_AT` |

### APPLY CHANGES Options

| Option | Description |
| :--- | :--- |
| `target` | Target table name |
| `source` | Source table or stream |
| `keys` | Primary key columns |
| `sequence_by` | Column that determines most recent record |
| `stored_as_scd_type` | `1` (overwrite) or `2` (full history) |
| `ignore_null_updates` | Skip null values in updates |
| `apply_as_deletes` | Expression for delete operations |
| `apply_as_truncates` | Expression for full truncate operations |
| `track_history_column_list` | Columns tracked for SCD Type 2 |
| `except_column_list` | Columns to exclude from target |

## Referencing Tables

| Reference | Syntax | Notes |
| :--- | :--- | :--- |
| DLT table (batch) | `spark.read.table("live.table_name")` | Same pipeline |
| DLT table (streaming) | `spark.readStream.table("live.table_name")` | Same pipeline |
| DLT in SQL | `STREAM(LIVE.table_name)` | Streaming read |
| External table | `catalog.schema.table` | Other catalogs/schemas |

## Pipeline Settings

```json
{
  "name": "my_pipeline",
  "target_schema": "my_schema",
  "catalog": "my_catalog",
  "configuration": {
    "env": "production",
    "start_date": "2024-01-01"
  },
  "continuous": false,
  "development": false,
  "channel": "CURRENT"
}
```

| Setting | Description |
| :--- | :--- |
| `target_schema` | Output schema for all tables |
| `catalog` | Unity Catalog catalog |
| `configuration` | Key-value pairs passed as `spark.conf.get()` in notebooks |
| `continuous` | `true` = always running; `false` = triggered |
| `development` | `true` = dev mode (relaxed expectations, lower cost) |
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

-- Pipeline status summary
SELECT event_type, COUNT(*) AS count
FROM event_log(TABLE(my_catalog.my_schema.__dlt_event_log))
GROUP BY event_type
ORDER BY count DESC;
```

## Exam Quick Facts

1. Streaming tables = **append-only**, incremental processing
2. Materialized views = **full recompute** on each refresh
3. `EXPECT` → logs only; `DROP ROW` → removes bad data; `FAIL UPDATE` → stops pipeline
4. `APPLY CHANGES` implements CDC with automatic MERGE logic
5. SCD Type 1 = current state; Type 2 = full history with `__START_AT`/`__END_AT`
6. Use `live.table_name` to reference tables in the same pipeline
7. `sequence_by` is required for APPLY CHANGES — determines the latest version
8. Dev mode relaxes expectations (warn instead of fail) and uses single-node cluster
9. `configuration` values in pipeline settings are accessible via `spark.conf.get("key")`
10. Event log stores expectation results, pipeline metrics, and flow progress

## Related Topics

- [Lakeflow Pipelines (DE Pro)](../../certifications/data-engineer-professional/07-lakeflow-pipelines/README.md)
- [Change Data Capture](../../certifications/data-engineer-professional/01-data-processing/05-change-data-capture-part1.md)
- [Streaming Fundamentals](../fundamentals/streaming-fundamentals.md)
