---
tags: [cheat-sheet, dlt, lakeflow-pipelines, data-engineer-professional]
---

# DLT (Lakeflow Pipelines) Quick Reference

## Table Types

| Type | Keyword | Description | Use Case |
|------|---------|-------------|----------|
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
        .groupBy("region").agg(sum("amount").alias("total")))
```

## DLT Decorator Options

```python
@dlt.table(
    name="my_table",                    # Table name
    comment="Table description",         # Documentation
    spark_conf={"key": "value"},        # Spark config
    table_properties={"quality": "gold"}, # Delta properties
    path="/custom/path",                 # Storage location
    partition_cols=["date"],            # Partitioning
    schema="id INT, name STRING"        # Explicit schema
)
def my_table():
    return df
```

| Parameter | Description |
|-----------|-------------|
| `name` | Override function name as table name |
| `comment` | Table description |
| `spark_conf` | Spark configurations |
| `table_properties` | Delta table properties |
| `path` | Custom storage path |
| `partition_cols` | Partitioning columns |
| `schema` | Explicit schema (string or StructType) |
| `temporary` | True for temp tables (not materialized) |

## Expectations (Data Quality)

### Syntax

| Action | SQL | Python |
|--------|-----|--------|
| Warn (log) | `EXPECT (condition)` | `@dlt.expect("name", "condition")` |
| Drop row | `EXPECT (condition) ON VIOLATION DROP ROW` | `@dlt.expect_or_drop("name", "condition")` |
| Fail | `EXPECT (condition) ON VIOLATION FAIL UPDATE` | `@dlt.expect_or_fail("name", "condition")` |

### SQL Examples

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
  CONSTRAINT valid_id EXPECT (id IS NOT NULL) ON VIOLATION FAIL UPDATE
)
AS SELECT * FROM STREAM(raw_events);
```

### Python Examples

```python
# Warn only

@dlt.table
@dlt.expect("valid_id", "id IS NOT NULL")
@dlt.expect("positive_amount", "amount > 0")
def validated_events():
    return spark.readStream.table("live.raw_events")

# Drop invalid rows

@dlt.table
@dlt.expect_or_drop("valid_id", "id IS NOT NULL")
def clean_events():
    return spark.readStream.table("live.raw_events")

# Fail pipeline

@dlt.table
@dlt.expect_or_fail("valid_id", "id IS NOT NULL")
def critical_events():
    return spark.readStream.table("live.raw_events")

# Multiple expectations

@dlt.table
@dlt.expect_all({
    "valid_id": "id IS NOT NULL",
    "valid_date": "event_date IS NOT NULL"
})
def multi_validated():
    return spark.readStream.table("live.raw_events")

# Multiple with drop

@dlt.table
@dlt.expect_all_or_drop({
    "valid_id": "id IS NOT NULL",
    "positive_amount": "amount > 0"
})
def multi_clean():
    return spark.readStream.table("live.raw_events")
```

## APPLY CHANGES (CDC)

### SQL Syntax

```sql
-- Basic CDC
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
from pyspark.sql.functions import *

# Create target table

dlt.create_streaming_table("target")

# Apply changes

dlt.apply_changes(
    target="target",
    source="cdc_source",
    keys=["id"],
    sequence_by="timestamp",
    stored_as_scd_type=1  # or 2
)
```

### SCD Types

| Type | Behavior | Result |
|------|----------|--------|
| Type 1 | Overwrite | Current state only |
| Type 2 | Preserve history | All versions with `__START_AT`, `__END_AT` |

```python
# SCD Type 2 with history

dlt.apply_changes(
    target="customers_history",
    source="customers_cdc",
    keys=["customer_id"],
    sequence_by="updated_at",
    stored_as_scd_type=2,
    track_history_column_list=["name", "email", "status"]
)
```

### APPLY CHANGES Options

| Option | Description |
|--------|-------------|
| `target` | Target table name |
| `source` | Source table/stream |
| `keys` | Primary key columns |
| `sequence_by` | Column for ordering changes |
| `stored_as_scd_type` | 1 or 2 |
| `ignore_null_updates` | Skip null values in updates |
| `apply_as_deletes` | Expression for delete operations |
| `apply_as_truncates` | Expression for truncate operations |
| `track_history_column_list` | Columns to track for SCD Type 2 |

## Pipeline Settings

```json
{
  "name": "my_pipeline",
  "target_schema": "my_schema",
  "catalog": "my_catalog",
  "configuration": {
    "env": "production"
  },
  "continuous": false,
  "development": false,
  "channel": "CURRENT"
}
```

| Setting | Description |
|---------|-------------|
| `target_schema` | Output schema |
| `catalog` | Unity Catalog catalog |
| `continuous` | Continuous vs triggered mode |
| `development` | Dev mode (relaxed expectations) |
| `channel` | CURRENT or PREVIEW |

## Referencing Tables

```python
# Reference another DLT table

@dlt.table
def silver_events():
    return spark.read.table("live.bronze_events")

# Reference streaming table

@dlt.table
def silver_events_stream():
    return spark.readStream.table("live.bronze_events")
```

| Reference | Syntax | Use |
|-----------|--------|-----|
| DLT table | `live.table_name` | Same pipeline |
| External | `catalog.schema.table` | Other tables |

## Event Log Queries

```sql
-- Query expectations results
SELECT
  details:flow_name AS flow,
  details:expectation:name AS expectation,
  details:expectation:passed_records AS passed,
  details:expectation:failed_records AS failed
FROM event_log(TABLE(my_catalog.my_schema.__dlt_event_log))
WHERE event_type = 'flow_progress'
  AND details:expectation IS NOT NULL;
```

## Common Exam Tips

1. Streaming tables = append-only, incremental processing
2. Materialized views = full recompute on each refresh
3. `EXPECT` logs only; `DROP ROW` removes bad data; `FAIL UPDATE` stops pipeline
4. `APPLY CHANGES` for CDC with automatic MERGE logic
5. SCD Type 1 = current state; Type 2 = full history
6. Use `live.table_name` to reference tables in same pipeline
7. `sequence_by` required for APPLY CHANGES (determines latest)
8. Dev mode relaxes expectations (warn instead of fail)
9. Event log tracks expectations results and pipeline metrics
10. Continuous mode = always running; Triggered = on-demand refresh
