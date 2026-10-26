---
tags: [cheat-sheet, dlt, lakeflow-pipelines, data-engineer-professional]
---

# Lakeflow Pipelines Quick Reference

> [!note] Platform update (Oct 2026)
> The exam says **Lakeflow Pipelines** and **AUTO CDC APIs (formerly APPLY CHANGES)**. The docs call the product **Lakeflow Spark Declarative Pipelines** (renamed from Lakeflow Declarative Pipelines on Nov 12, 2025; formerly DLT) and also use "Lakeflow pipelines". The Python `dlt` module has been replaced by `pyspark.pipelines` — `import dlt` still works, but `from pyspark import pipelines as dp` is recommended. Sources: [November 2025 release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november), [Python language reference](https://docs.databricks.com/aws/en/ldp/developer/python-ref)

Full study notes: [Declarative Pipelines](../../01-developing-code-for-data-processing/06-declarative-pipelines.md) · [AUTO CDC API](../../01-developing-code-for-data-processing/07-auto-cdc-api.md) · [Expectations](../../03-data-manipulation/06-expectations-data-quality.md)

## Dataset Types

| Type | SQL | Python | Processing | Use for |
| :--- | :--- | :--- | :--- | :--- |
| Streaming table | `CREATE OR REFRESH STREAMING TABLE` | `@dp.table` returning a streaming DataFrame | Each source row processed **once** (append-only source) | Ingestion (Auto Loader, Kafka), AUTO CDC targets, lowest latency |
| Materialized view | `CREATE OR REFRESH MATERIALIZED VIEW` | `@dp.materialized_view` returning a batch DataFrame | Result always equals the query; **incremental refresh on serverless** when possible, full recompute otherwise | Joins and aggregates that must reflect late updates/deletes; gold tables |
| Temporary view | `CREATE TEMPORARY VIEW` | `@dp.temporary_view` | Not persisted | Intermediate logic inside one pipeline |

```sql
-- Streaming table: Auto Loader via read_files with STREAM
CREATE OR REFRESH STREAMING TABLE bronze_orders
AS SELECT * FROM STREAM read_files('/Volumes/main/landing/orders/', format => 'json');

-- Materialized view: refreshed incrementally on serverless when the query allows
CREATE OR REFRESH MATERIALIZED VIEW gold_daily_totals
AS SELECT order_date, SUM(amount) AS total_amount
FROM silver_orders
GROUP BY order_date;
```

```python
from pyspark import pipelines as dp

@dp.table
def bronze_orders():
    return (spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .load("/Volumes/main/landing/orders/"))

@dp.materialized_view
def gold_daily_totals():
    return (spark.read.table("silver_orders")
        .groupBy("order_date")
        .sum("amount"))
```

### Streaming table or materialized view?

| Scenario | Choose |
| :--- | :--- |
| Ingest files or Kafka events exactly once | Streaming table |
| Aggregate must reflect **late-arriving updates to prior days** or upstream deletes | Materialized view |
| Join where dimension changes must update old results | Materialized view |
| Sub-minute latency in a continuous pipeline | Streaming table |
| Apply inserts / updates / deletes from a CDC feed | Streaming table + AUTO CDC flow |

## AUTO CDC (formerly APPLY CHANGES)

| Older material | Current |
| :--- | :--- |
| `APPLY CHANGES INTO LIVE.target FROM STREAM(LIVE.src) ...` | `CREATE FLOW f AS AUTO CDC INTO target FROM STREAM(src) ...` |
| `dlt.apply_changes(...)` | `dp.create_auto_cdc_flow(...)` (same arguments) |
| `dlt.apply_changes_from_snapshot(...)` | `dp.create_auto_cdc_from_snapshot_flow(...)` |
| `dlt.create_streaming_table(...)` | `dp.create_streaming_table(...)` |

```sql
CREATE OR REFRESH STREAMING TABLE customers_current;

CREATE FLOW customers_current_cdc AS AUTO CDC INTO customers_current
FROM STREAM(main.cdc.customers_feed)
KEYS (customer_id)
APPLY AS DELETE WHEN operation = 'DELETE'
SEQUENCE BY event_ts
COLUMNS * EXCEPT (operation, event_ts)
STORED AS SCD TYPE 1;
```

```python
from pyspark import pipelines as dp

dp.create_streaming_table("customers_history")

dp.create_auto_cdc_flow(
    target="customers_history",
    source="customers_cdc",
    keys=["customer_id"],
    sequence_by="event_ts",
    apply_as_deletes="operation = 'DELETE'",
    except_column_list=["operation", "event_ts"],
    stored_as_scd_type=2,
    track_history_column_list=["address", "email"],
)
```

| Argument / clause | Meaning |
| :--- | :--- |
| `keys` / `KEYS` | Columns that identify a row (required) |
| `sequence_by` / `SEQUENCE BY` | Logical order of events; resolves out-of-order arrivals (required) |
| `stored_as_scd_type` / `STORED AS` | `1` (default, latest value) or `2` (history with `__START_AT` / `__END_AT`) |
| `apply_as_deletes` | Condition that turns an event into a delete |
| `apply_as_truncates` | Condition that truncates the target — **SCD Type 1 only** |
| `track_history_column_list` | SCD Type 2: only changes to these columns open a new history row |
| `except_column_list` / `COLUMNS * EXCEPT` | Drop operational columns from the target |

Current rows in an SCD Type 2 target have `__END_AT IS NULL`. `__START_AT` / `__END_AT` hold the `SEQUENCE BY` value, with the same data type.

## Expectations

| Action | SQL | Python | Invalid rows | Update |
| :--- | :--- | :--- | :--- | :--- |
| Warn (default) | `CONSTRAINT c EXPECT (cond)` | `@dp.expect("c", "cond")` | Kept, counted | Succeeds |
| Drop | `... ON VIOLATION DROP ROW` | `@dp.expect_or_drop("c", "cond")` | Dropped, counted | Succeeds |
| Fail | `... ON VIOLATION FAIL UPDATE` | `@dp.expect_or_fail("c", "cond")` | — | Flow update fails and is rolled back |

Several rules at once: `@dp.expect_all({...})`, `@dp.expect_all_or_drop({...})`, `@dp.expect_all_or_fail({...})`. **Quarantine** = keep bad rows with a warn expectation, flag them, and route them to a separate table for review.

```sql
CREATE OR REFRESH STREAMING TABLE silver_orders (
  CONSTRAINT valid_id EXPECT (order_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT positive_amount EXPECT (amount > 0) ON VIOLATION FAIL UPDATE
)
AS SELECT * FROM STREAM(bronze_orders);
```

## Event Log

```sql
-- Expectation pass / fail counts per dataset
SELECT
  row_expectations.dataset AS dataset,
  row_expectations.name AS expectation,
  SUM(row_expectations.passed_records) AS passing_records,
  SUM(row_expectations.failed_records) AS failing_records
FROM (
  SELECT explode(
    from_json(
      details:flow_progress:data_quality:expectations,
      "array<struct<name: string, dataset: string, passed_records: int, failed_records: int>>"
    )
  ) AS row_expectations
  FROM event_log(<pipeline-id>)
  WHERE event_type = 'flow_progress'
)
GROUP BY row_expectations.dataset, row_expectations.name;
```

More queries: [Lakeflow Event Logs](../../04-monitoring-and-alerting/02-lakeflow-event-logs.md).

## Common Exam Tips

1. Streaming table = each appended row processed once; materialized view = always equals the query, incremental on serverless
2. Late updates to already-aggregated days → materialized view
3. `EXPECT` warns, `DROP ROW` removes, `FAIL UPDATE` stops and rolls back that flow's update
4. AUTO CDC (formerly APPLY CHANGES): `KEYS` + `SEQUENCE BY` are required; `STORED AS` defaults to SCD Type 1
5. SCD Type 2 current rows: `__END_AT IS NULL`; `apply_as_truncates` is SCD Type 1 only
6. Reference tables by name (`spark.read.table("silver_orders")`); the `LIVE.` prefix is legacy
7. Expectation metrics live in `flow_progress` events of the pipeline event log
8. Triggered mode processes available data and stops; continuous mode keeps running for low latency
9. Python dataset functions return DataFrames — never call `writeStream`, `save()` or `collect()` inside them

---

**[← Back to Cheat Sheets](./README.md)**
