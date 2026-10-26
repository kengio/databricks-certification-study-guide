---
tags: [cheat-sheet, lakeflow-spark-declarative-pipelines, lakeflow-declarative-pipelines, dlt, data-engineering]
---

# Lakeflow Spark Declarative Pipelines Quick Reference (formerly DLT)

Quick reference for Lakeflow Spark Declarative Pipelines (formerly Lakeflow Declarative Pipelines, and before that Delta Live Tables / DLT) — dataset types, the `pyspark.pipelines` Python API, expectations, AUTO CDC (formerly APPLY CHANGES), pipeline settings, and the event log.

> [!note] Platform update (Oct 2026)
>
> - **Jun 11, 2025** — DLT was rebranded under Lakeflow (published at the time as *Lakeflow Declarative Pipelines*). **Nov 12, 2025** — "Lakeflow Declarative Pipelines has been renamed to Lakeflow Spark Declarative Pipelines." Current docs also say simply **Lakeflow pipelines** (the overview page is titled "Spark Declarative Pipelines on Lakeflow"); the open-source base is **Apache Spark Declarative Pipelines (SDP)**.
> - **Python API:** `from pyspark import pipelines as dp`. "The `dlt` module has been replaced by the `pyspark.pipelines` module. You may still use `dlt`, but Databricks recommends using `pipelines`." A legacy `dlt` → `dp` mapping is at the end of this sheet.
> - **Exam wording lags the product:** the DE Associate guide (Aug 2026) still says *Lakeflow Declarative Pipelines*, the DE Professional guide (Oct 2026) says *Lakeflow Pipelines*, and the ML Associate guide says *Delta Live Tables*. They are the same product — expect any of the names in a question stem.
> - This file keeps its `lakeflow-declarative-pipelines-quick-ref.md` name so existing links keep working.

## Dataset Types

| Type | SQL | Python (`dp`) | Behavior |
| :--- | :--- | :--- | :--- |
| Streaming table | `CREATE OR REFRESH STREAMING TABLE` | `@dp.table` returning a streaming DataFrame (or `dp.create_streaming_table()` + a flow) | Incremental — each source row is processed once; the target of AUTO CDC flows |
| Materialized view | `CREATE OR REFRESH MATERIALIZED VIEW` | `@dp.materialized_view` returning a batch DataFrame | Refreshed incrementally on serverless pipelines when possible, otherwise fully recomputed — results always equal a full recompute |
| Temporary view | `CREATE TEMPORARY VIEW` | `@dp.temporary_view` | Pipeline-scoped; not added to the catalog |
| View | `CREATE VIEW` | — | Published to the catalog (Unity Catalog pipelines in default publishing mode only) |

```sql
-- Streaming table (incremental ingestion)
CREATE OR REFRESH STREAMING TABLE raw_events
AS SELECT * FROM STREAM(source_table);

-- Materialized view (aggregation)
CREATE OR REFRESH MATERIALIZED VIEW aggregated_sales
AS SELECT region, SUM(amount) AS total
FROM sales GROUP BY region;
```

```python
from pyspark import pipelines as dp
from pyspark.sql import functions as F

@dp.table  # streaming read -> streaming table
def raw_events():
    return spark.readStream.table("source_table")

@dp.materialized_view  # batch read -> materialized view
def aggregated_sales():
    return (spark.read.table("sales")
        .groupBy("region")
        .agg(F.sum("amount").alias("total")))
```

> [!tip]
> In the legacy `dlt` module, `@dlt.table` created **both** streaming tables and materialized views (depending on whether the query was streaming). In `pyspark.pipelines`, `@dp.table` still works that way, but Databricks recommends `@dp.materialized_view` for materialized views.

## Decorator Options (`@dp.table` / `@dp.materialized_view`)

```python
@dp.table(
    name="my_table",                          # Defaults to the function name
    comment="Table description",
    spark_conf={"key": "value"},              # Spark conf for this query
    table_properties={"quality": "gold"},     # Table properties
    cluster_by=["event_date"],                # Liquid clustering keys
    schema="id INT, name STRING",             # DDL string or StructType
    private=False                             # True = not published to the catalog
)
def my_table():
    return spark.readStream.table("source_table")
```

| Parameter | Description |
| :--- | :--- |
| `name` | Table name; defaults to the function name |
| `comment` | Table description |
| `spark_conf` | Spark configurations for running this query |
| `table_properties` | Table properties |
| `path` | Storage location; if unset, the schema's managed storage location is used |
| `partition_cols` | Partition columns |
| `cluster_by` / `cluster_by_auto` | Liquid clustering keys / automatic liquid clustering |
| `schema` | SQL DDL string or `StructType`; can include generated columns, column masks, primary and foreign keys |
| `row_filter` | Row filter clause (Public Preview) |
| `private` | `True` = available to the pipeline but not published to the metastore. "Private tables were previously created with the `temporary` parameter." |

## Expectations (Data Quality)

| Action on violation | SQL | Python |
| :--- | :--- | :--- |
| Keep row, record metrics (warn) | `CONSTRAINT c EXPECT (cond)` | `@dp.expect("name", "cond")` |
| Drop row | `... ON VIOLATION DROP ROW` | `@dp.expect_or_drop("name", "cond")` |
| Fail the update | `... ON VIOLATION FAIL UPDATE` | `@dp.expect_or_fail("name", "cond")` |
| Several at once | multiple `CONSTRAINT` clauses | `@dp.expect_all({...})` / `@dp.expect_all_or_drop({...})` / `@dp.expect_all_or_fail({...})` |

`expect_or_fail` stops the update immediately; only the flow that hit the violation fails, not the other flows in the pipeline.

### SQL CONSTRAINT Examples

```sql
-- Keep the row, record the violation (default)
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

-- Fail the update on violation
CREATE OR REFRESH STREAMING TABLE critical_events (
  CONSTRAINT non_null_id EXPECT (id IS NOT NULL) ON VIOLATION FAIL UPDATE
)
AS SELECT * FROM STREAM(raw_events);
```

### Python Expectation Examples

```python
from pyspark import pipelines as dp

# Single expectation — keep row, record metrics
@dp.table
@dp.expect("valid_id", "id IS NOT NULL")
def validated_events():
    return spark.readStream.table("raw_events")

# Multiple expectations — drop the row if ANY fails
@dp.table
@dp.expect_all_or_drop({
    "valid_id": "id IS NOT NULL",
    "positive_amount": "amount > 0"
})
def clean_events():
    return spark.readStream.table("raw_events")

# Multiple expectations — fail the update if ANY fails
@dp.table
@dp.expect_all_or_fail({
    "valid_id": "id IS NOT NULL",
    "valid_date": "event_date IS NOT NULL"
})
def critical_events():
    return spark.readStream.table("raw_events")
```

## AUTO CDC (formerly APPLY CHANGES)

"The `AUTO CDC` APIs replace the `APPLY CHANGES` APIs and have the same syntax." The old names still work, but Databricks recommends AUTO CDC. AUTO CDC is a Lakeflow feature — it is not part of open-source Apache Spark.

### SQL Syntax

```sql
CREATE OR REFRESH STREAMING TABLE customers_current;

CREATE FLOW customers_cdc AS AUTO CDC INTO customers_current
FROM STREAM(cdc_source)
KEYS (customer_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY updated_at
COLUMNS * EXCEPT (operation, updated_at)
STORED AS SCD TYPE 1;
```

### Python Syntax

```python
from pyspark import pipelines as dp
from pyspark.sql import functions as F

# Declare the target streaming table first
dp.create_streaming_table("customers_current")

# SCD Type 1 — current state only
dp.create_auto_cdc_flow(
    target="customers_current",
    source="cdc_source",
    keys=["customer_id"],
    sequence_by=F.col("updated_at"),
    apply_as_deletes=F.expr("operation = 'DELETE'"),
    except_column_list=["operation"],
    stored_as_scd_type=1
)

# SCD Type 2 — full history
dp.create_streaming_table("customers_history")

dp.create_auto_cdc_flow(
    target="customers_history",
    source="cdc_source",
    keys=["customer_id"],
    sequence_by=F.col("updated_at"),
    stored_as_scd_type=2,
    track_history_column_list=["name", "email", "status"]
)
```

For sources that deliver periodic full snapshots instead of a change feed, use `dp.create_auto_cdc_from_snapshot_flow()` (AUTO CDC FROM SNAPSHOT).

### SCD Types

| Type | Behavior | Result |
| :--- | :--- | :--- |
| Type 1 | Overwrite existing rows | Current state only |
| Type 2 | Insert a new version per change | Full history with `__START_AT` / `__END_AT` columns (`__END_AT IS NULL` = current row) |

### AUTO CDC Options

| Option | Description |
| :--- | :--- |
| `target` | Target streaming table (required) |
| `source` | Source containing the CDC records (required) |
| `keys` | Column(s) that uniquely identify a row (required) |
| `sequence_by` | Column(s) that set the logical order of events (required); use `struct()` to break ties |
| `stored_as_scd_type` | `1` (default), `2`, or `"bitemporal"` |
| `ignore_null_updates` | `True` = nulls in an update keep the existing target values |
| `apply_as_deletes` | Condition that marks an event as a DELETE |
| `apply_as_truncates` | Condition that truncates the whole target — **SCD Type 1 only** |
| `column_list` / `except_column_list` | Columns to include / exclude in the target |
| `track_history_column_list` / `track_history_except_column_list` | Columns that do / don't generate SCD Type 2 history |
| `name` | Flow name (defaults to the target name) |
| `once` | One-time backfill flow; the source must be a batch DataFrame |

## Referencing Datasets

| Reference | Syntax | Notes |
| :--- | :--- | :--- |
| Batch read (Python) | `spark.read.table("name")` | Recommended over legacy `dlt.read()` |
| Streaming read (Python) | `spark.readStream.table("name")` | Recommended over legacy `dlt.read_stream()`; supports options such as `skipChangeCommits` |
| Streaming read (SQL) | `FROM STREAM(name)` | |
| Other catalogs/schemas | `catalog.schema.table` | Unqualified names resolve to the pipeline's default catalog and schema |

> [!warning] Common Mistake
> The `LIVE.` prefix (`LIVE.table_name`, `live.table_name`) is the deprecated LIVE virtual schema. "In the default publishing mode for new pipelines, this syntax is silently ignored." Only legacy-publishing-mode pipelines (tables created before Feb 5, 2025 default to it) still need it.

## Pipeline Settings

```json
{
  "name": "my_pipeline",
  "catalog": "my_catalog",
  "schema": "my_schema",
  "serverless": true,
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
| `catalog` | Default Unity Catalog catalog for the pipeline's datasets |
| `schema` | Default schema for datasets (`target` is the legacy name — "Using `schema` instead of `target` is preferred") |
| `serverless` | Use serverless compute (don't specify `clusters`) |
| `configuration` | Key-value pairs readable in code via `spark.conf.get("key")` |
| `continuous` | `true` = always running; `false` (default) = triggered |
| `development` | `true` = development mode — fast iteration, **no automatic retries**; `false` = production mode |
| `channel` | `CURRENT` (default, recommended for production) or `PREVIEW` (upcoming runtime changes) |
| `event_log` | `{name, catalog, schema}` — publish the event log as a Unity Catalog table |

## Event Log Queries

```sql
-- Events for one dataset (materialized view or streaming table)
SELECT timestamp, message, details
FROM event_log(TABLE(my_catalog.my_schema.clean_events))
WHERE level IN ('INFO', 'WARN', 'ERROR')
ORDER BY timestamp;

-- Expectation pass/fail counts for a pipeline
SELECT
  row_expectations.dataset AS dataset,
  row_expectations.name AS expectation,
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
```

`event_log()` accepts either `TABLE(<materialized view or streaming table>)` or a pipeline ID string. Databricks now also recommends the `pipeline_events` system table (Beta) for cross-pipeline monitoring.

## Legacy `dlt` → `pyspark.pipelines` Mapping

| Legacy (`import dlt`) | Current (`from pyspark import pipelines as dp`) |
| :--- | :--- |
| `@dlt.table` (streaming DataFrame) | `@dp.table` |
| `@dlt.table` (batch DataFrame) | `@dp.materialized_view` |
| `@dlt.view` | `@dp.temporary_view` |
| `@dlt.table(temporary=True)` | `@dp.table(private=True)` |
| `@dlt.append_flow` | `@dp.append_flow` |
| `dlt.create_streaming_table()` | `dp.create_streaming_table()` |
| `dlt.apply_changes()` | `dp.create_auto_cdc_flow()` (same signature) |
| `dlt.apply_changes_from_snapshot()` | `dp.create_auto_cdc_from_snapshot_flow()` |
| `@dlt.expect*` | `@dp.expect*` |
| `dlt.read("t")` / `dlt.read_stream("t")` | `spark.read.table("t")` / `spark.readStream.table("t")` |
| SQL `APPLY CHANGES INTO` | SQL `AUTO CDC INTO` |

## Exam Quick Facts

1. DLT = Lakeflow Declarative Pipelines = Lakeflow Spark Declarative Pipelines = Lakeflow pipelines — one product, several names
2. Streaming tables process each source row **once** (incremental); materialized views always return results equal to a full recompute
3. `EXPECT` → keeps the row and records metrics; `DROP ROW` → removes bad rows; `FAIL UPDATE` → stops the update
4. AUTO CDC (formerly APPLY CHANGES) implements CDC with automatic MERGE-style logic; `SEQUENCE BY` is required
5. SCD Type 1 = current state; Type 2 = full history with `__START_AT` / `__END_AT`
6. `apply_as_truncates` / `APPLY AS TRUNCATE WHEN` works with SCD Type 1 only
7. Reference datasets by name (`spark.read.table("t")`); the `LIVE.` prefix is legacy
8. Development mode skips automatic retries; production mode retries failed updates
9. `configuration` values are read with `spark.conf.get("key")`
10. The event log records expectation results, flow progress, and lineage — query it with `event_log()`

## Related Topics

- [Lakeflow Pipelines (DE Pro)](../../certifications/data-engineer-professional/01-developing-code-for-data-processing/README.md)
- [Change Data Capture](../../certifications/data-engineer-professional/02-data-ingestion-and-acquisition/04-change-data-capture-part1.md)
- [Pipelines code examples (Python)](../code-examples/python/dlt_pipelines.md)
- [Streaming Fundamentals](../fundamentals/streaming-fundamentals.md)
- Official docs: [Python language reference](https://docs.databricks.com/aws/en/ldp/developer/python-ref) · [AUTO CDC APIs](https://docs.databricks.com/aws/en/ldp/cdc) · [Expectations (Python)](https://docs.databricks.com/aws/en/ldp/developer/ldp-python-ref-expectations) · [LIVE schema (legacy)](https://docs.databricks.com/aws/en/ldp/live-schema) · [Pipeline properties](https://docs.databricks.com/aws/en/ldp/properties) · [`event_log` function](https://docs.databricks.com/aws/en/sql/language-manual/functions/event_log)
