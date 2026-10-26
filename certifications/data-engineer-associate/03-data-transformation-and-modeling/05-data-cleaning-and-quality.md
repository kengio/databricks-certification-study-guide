---
title: Data Cleaning and Data Quality
type: study-material
tags:
  - data-engineer-associate
  - data-cleaning
  - data-quality
  - expectations
  - constraints
  - medallion
status: published
---

# Data Cleaning and Data Quality

## Overview

Silver tables exist to hold data that is **clean and trustworthy**. This file covers the Bronze → Silver cleaning steps the exam guide names: reading Bronze with PySpark or SQL, handling nulls, standardizing data types, deduplicating, and writing a new Silver table. It also covers the **data quality checks and validation rules** that keep Silver and Gold reliable: Delta `CHECK` and `NOT NULL` constraints, pipeline **expectations**, and quarantine patterns.

> [!abstract]
>
> - **Cleaning toolkit**: `cast` / `try_cast` for types, `coalesce` / `fillna` / `dropna` for nulls, `trim` / `lower` / `to_date` for standardizing, `dropDuplicates` or `ROW_NUMBER()` for deduplication
> - **Profiling**: `describe()` (count, mean, stddev, min, max) and `summary()` (the same plus approximate 25/50/75 % quartiles), `count_if`, `approx_count_distinct`
> - **Delta constraints** (`NOT NULL`, `CHECK`) are enforced on every write. A violation fails the transaction
> - **Expectations** in Lakeflow pipelines: warn (default), `ON VIOLATION DROP ROW`, or `ON VIOLATION FAIL UPDATE`, with metrics in the pipeline UI and event log

> [!tip] What the Exam Tests
>
> - Exam guide skills: Bronze → Silver cleaning (nulls, data types) with PySpark/SQL, deduplication and aggregates (count, approximate count distinct, mean, summary), and data quality checks and validation rules for Silver and Gold
> - Choosing between a constraint (reject the whole write) and an expectation (warn, drop, or fail per record)
> - What happens to violating records under each expectation action
> - Deduplicating "latest record per key" correctly

---

## Bronze → Silver: a cleaning recipe

```python
from pyspark.sql import functions as F
from pyspark.sql.window import Window

bronze = spark.table("main.bronze.customers_raw")

silver = (bronze
    # 1. Standardize strings
    .withColumn("email", F.lower(F.trim("email")))
    .withColumn("country", F.upper(F.trim("country")))
    # 2. Standardize data types (try_cast returns NULL instead of failing on bad values)
    .withColumn("signup_date", F.to_date("signup_date", "yyyy-MM-dd"))
    .withColumn("lifetime_value", F.expr("try_cast(lifetime_value AS DECIMAL(12,2))"))
    # 3. Handle nulls: default where business rules allow, drop where the key is missing
    .fillna({"country": "UNKNOWN", "lifetime_value": 0})
    .dropna(subset=["customer_id"])
    # 4. Rename to the Silver naming standard
    .withColumnRenamed("cust_nm", "customer_name"))

# 5. Deduplicate: keep the most recent record per customer_id
w = Window.partitionBy("customer_id").orderBy(F.col("_ingested_at").desc())
silver_dedup = (silver
    .withColumn("rn", F.row_number().over(w))
    .filter("rn = 1")
    .drop("rn"))

# 6. Write a new Silver table in Unity Catalog
silver_dedup.write.mode("overwrite").saveAsTable("main.silver.customers")
```

The same steps in SQL:

```sql
CREATE OR REPLACE TABLE main.silver.customers AS
SELECT customer_id,
       lower(trim(email))                          AS email,
       coalesce(upper(trim(country)), 'UNKNOWN')   AS country,
       to_date(signup_date, 'yyyy-MM-dd')          AS signup_date,
       coalesce(try_cast(lifetime_value AS DECIMAL(12,2)), 0) AS lifetime_value
FROM main.bronze.customers_raw
WHERE customer_id IS NOT NULL
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY _ingested_at DESC) = 1;
```

### Null-handling reference

| Need | PySpark | SQL |
| :--- | :--- | :--- |
| Drop rows with any null | `df.dropna()` (`how="any"` default) | `WHERE col1 IS NOT NULL AND ...` |
| Drop only if all columns are null | `df.dropna(how="all")` | — |
| Drop if a key column is null | `df.dropna(subset=["id"])` | `WHERE id IS NOT NULL` |
| Replace nulls with defaults | `df.fillna({"col": value})` | `coalesce(col, value)` / `nvl(col, value)` |
| Count nulls | `F.count_if(F.col("c").isNull())` (or `F.sum(F.col("c").isNull().cast("int"))`) | `count_if(c IS NULL)` |

`dropna` and `na.drop` are aliases. `dropna(how="any")` drops a row if it contains any null, and `how="all"` drops it only if every value is null ([PySpark `dropna`](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.dropna.html)).

### Deduplication options

| Method | Keeps | Use when |
| :--- | :--- | :--- |
| `df.distinct()` | One copy of each fully identical row | Exact duplicate rows |
| `df.dropDuplicates(["id"])` | An **arbitrary** row per `id` | Any copy is acceptable |
| `ROW_NUMBER() OVER (PARTITION BY id ORDER BY ts DESC) = 1` | The **latest** row per `id` | "Most recent record wins" |
| `MERGE INTO ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT` | One row per key in the target | Incremental loads that must not insert duplicates |

## Profiling before and after cleaning

```python
df = spark.table("main.silver.customers")

df.describe("lifetime_value").show()     # count, mean, stddev, min, max
df.summary().show()                      # + approximate 25%, 50%, 75% quartiles
df.summary("count", "min", "10%", "90%", "max").show()   # pick your own statistics

df.agg(
    F.count("*").alias("rows"),
    F.countDistinct("customer_id").alias("exact_customers"),
    F.approx_count_distinct("customer_id").alias("approx_customers"),   # HLL++, ~5 % default error
    F.mean("lifetime_value").alias("avg_ltv"),
).show()
```

- `summary()` with no arguments computes count, mean, stddev, min, approximate quartiles (25 %, 50 %, 75 %), and max. `describe()` computes only basic statistics ([PySpark `summary`](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.summary.html))
- `approx_count_distinct(expr [, relativeSD])` estimates distinct values with HyperLogLog++. The default maximum relative standard deviation is 5 % ([approx_count_distinct](https://docs.databricks.com/aws/en/sql/language-manual/functions/approx_count_distinct)). Use it when an exact `COUNT(DISTINCT ...)` is too expensive on very large tables

## Validation rule 1: Delta table constraints

Constraints are enforced by the table itself, on every write path: SQL, DataFrame, streaming, or `MERGE`.

```sql
ALTER TABLE main.silver.customers ALTER COLUMN customer_id SET NOT NULL;
ALTER TABLE main.silver.customers ADD CONSTRAINT valid_ltv CHECK (lifetime_value >= 0);
ALTER TABLE main.silver.customers ADD CONSTRAINT valid_country CHECK (length(country) = 2 OR country = 'UNKNOWN');
```

| Constraint | Enforced? | On violation |
| :--- | :--- | :--- |
| `NOT NULL` | Yes | "The transaction fails with an error" |
| `CHECK (expr)` | Yes | The transaction fails, so the whole write is rejected |
| `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE` | **No, informational only** | Nothing is blocked. They document relationships and can help optimization |

Source: [Constraints on Databricks](https://docs.databricks.com/aws/en/tables/constraints).

## Validation rule 2: pipeline expectations

Expectations are optional clauses on **streaming tables, materialized views, and temporary views** in a Lakeflow pipeline. Each applies a SQL Boolean check to every record ([pipeline expectations](https://docs.databricks.com/aws/en/ldp/expectations)).

```sql
CREATE OR REFRESH STREAMING TABLE main.silver.orders (
  CONSTRAINT valid_id     EXPECT (order_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT valid_amount EXPECT (amount > 0)           ON VIOLATION FAIL UPDATE,
  CONSTRAINT recent       EXPECT (order_ts > '2020-01-01')            -- warn only
)
AS SELECT * FROM STREAM(main.bronze.orders);
```

```python
from pyspark import pipelines as dp

@dp.table(name="silver_orders")
@dp.expect_or_drop("valid_id", "order_id IS NOT NULL")
@dp.expect_or_fail("valid_amount", "amount > 0")
@dp.expect("recent", "order_ts > '2020-01-01'")
def silver_orders():
    return spark.readStream.table("main.bronze.orders")
```

| Action | SQL | Python | Invalid records | Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **Warn** *(default)* | `EXPECT (...)` | `@dp.expect` | **Written** to the target; violations counted | Continues |
| **Drop** | `... ON VIOLATION DROP ROW` | `@dp.expect_or_drop` | **Removed** before writing; dropped count logged | Continues |
| **Fail** | `... ON VIOLATION FAIL UPDATE` | `@dp.expect_or_fail` | Update **fails and is rolled back** | Stops (needs intervention) |

- Grouped variants (`expect_all`, `expect_all_or_drop`, `expect_all_or_fail`) take a dictionary of name → constraint. They exist **only in Python**
- **Where to see the results**: the pipeline UI's **Data quality** tab for each dataset, covering warn and drop (fail records no metrics), or the **event log**, which is the only option for standalone SQL pipelines
- Since June 2026 you can also add expectations to **materialized views created in Databricks SQL** ([June 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/june))

> [!note] Platform update (Oct 2026)
> The exam's **Lakeflow Declarative Pipelines** is called **Lakeflow Spark Declarative Pipelines** (short form "Lakeflow pipelines") in the current docs. The rename was on Nov 12, 2025 ([release notes](https://docs.databricks.com/aws/en/release-notes/product/2025/november)). Legacy `@dlt.expect*` decorators still work, but the `pyspark.pipelines` (`dp`) module is recommended.

## Quarantine pattern

Sometimes bad records must be neither silently dropped nor allowed to block the pipeline. Route them to a separate table for review:

```sql
-- Valid rows continue to Silver
CREATE OR REFRESH STREAMING TABLE main.silver.orders_valid AS
SELECT * FROM STREAM(main.bronze.orders) WHERE order_id IS NOT NULL AND amount > 0;

-- Invalid rows are kept for investigation instead of being lost
CREATE OR REFRESH STREAMING TABLE main.silver.orders_quarantine AS
SELECT *, current_timestamp() AS quarantined_at
FROM STREAM(main.bronze.orders) WHERE NOT (order_id IS NOT NULL AND amount > 0);
```

## Validating Silver and Gold with queries

Constraints and expectations check individual rows. Some rules span the whole dataset, and are best expressed as validation queries that run as a task after the load. The task fails the job if a rule is broken:

```python
# Run as a task after the Gold refresh; raising an exception fails the task (and alerts on-call)
silver_total = spark.sql("SELECT SUM(amount) AS t FROM main.silver.orders WHERE order_date = current_date() - 1").first().t
gold_total   = spark.sql("SELECT SUM(revenue) AS t FROM main.gold.daily_revenue WHERE order_date = current_date() - 1").first().t

if silver_total is None or gold_total is None or abs(silver_total - gold_total) > 0.01:
    raise ValueError(f"Reconciliation failed: silver={silver_total} gold={gold_total}")

dupes = spark.sql("""
    SELECT COUNT(*) AS n FROM (
      SELECT customer_id FROM main.silver.customers GROUP BY customer_id HAVING COUNT(*) > 1)
""").first().n
if dupes:
    raise ValueError(f"{dupes} duplicate customer_id values in Silver")
```

Typical dataset-level rules:

| Rule | Example check |
| :--- | :--- |
| **Reconciliation** | Gold totals equal Silver totals for the same period |
| **Uniqueness** | No business key appears twice in Silver |
| **Completeness** | Yesterday's partition exists and its row count is within an expected range |
| **Freshness** | `max(event_ts)` is no older than the SLA |
| **Referential integrity** | Every `customer_id` in facts exists in the customer dimension. PK/FK constraints are informational, so check this with a query |

Schema enforcement (Delta rejecting writes whose columns or types don't match the table) is a separate, always-on safeguard. It protects the *shape* of the data, while the checks above protect its *content*.

## Constraints vs expectations: choosing

| Requirement | Use |
| :--- | :--- |
| No write path may ever insert a bad row, and the batch should fail | Delta `CHECK` / `NOT NULL` constraint |
| Keep loading good rows and discard bad ones | Expectation with `DROP ROW` |
| Track quality over time without blocking | Expectation (warn) |
| Stop the pipeline on any violation so a human can intervene | Expectation with `FAIL UPDATE` |
| Keep bad rows for review | Quarantine table |

## Use Cases

- **Customer master in Silver**: trim and lowercase emails, cast dates, keep the latest record per `customer_id`, and enforce `NOT NULL` on the key
- **Payments stream**: `FAIL UPDATE` on a negative amount stops the pipeline before bad money values reach Gold
- **IoT telemetry**: `DROP ROW` discards sensor readings outside the physical range, and the dropped counts are reviewed in the Data quality tab
- **Gold KPI guard**: a `CHECK` constraint on a Gold table rejects any refresh that would publish a negative revenue total

## Common Issues & Errors

### `dropDuplicates` Keeps an Old Record

**Scenario:** After `dropDuplicates(["customer_id"])`, some customers show an outdated address.
**Fix:** `dropDuplicates` keeps an arbitrary row. Use `ROW_NUMBER()` ordered by an update or ingestion timestamp (or `QUALIFY` in SQL) to keep the latest row.

### Write Fails With a CHECK Constraint Violation

**Scenario:** A nightly append to Silver fails because a handful of rows break `CHECK (amount > 0)`.
**Fix:** Constraints fail the whole transaction. Either clean or filter the rows before writing, or move the rule to an expectation with `DROP ROW` if dropping is acceptable.

### Bad Records Silently Reach Gold

**Scenario:** An expectation was added with no `ON VIOLATION` clause, and invalid rows still appear downstream.
**Fix:** The default action is warn: rows are written and only counted. Add `ON VIOLATION DROP ROW` or `FAIL UPDATE`.

### `CAST` Errors Stop the Load

**Scenario:** `CAST(amount AS DECIMAL(12,2))` fails on values such as `'N/A'` with ANSI mode on.
**Fix:** Use `try_cast`, which returns NULL for values it can't convert, then handle the NULLs explicitly.

## Exam Tips

> [!tip] Exam Tips
>
> - Expectations default to **warn**: rows are kept and violations counted. `DROP ROW` removes them. `FAIL UPDATE` stops and rolls back
> - Grouped `expect_all*` decorators are **Python-only**
> - Delta `CHECK` / `NOT NULL` are enforced. PK/FK/UNIQUE are **informational only**
> - "Latest record per key" → `ROW_NUMBER()` + filter (or `QUALIFY`), not `dropDuplicates`
> - `summary()` adds quartiles to what `describe()` returns. `approx_count_distinct` trades a ~5 % error for speed

## Key Takeaways

- Cleaning = standardize strings, fix types (`try_cast`), handle nulls, deduplicate, then write Silver
- Constraints protect a table on every write path. Expectations give per-record control inside pipelines
- Expectation metrics live in the pipeline's Data quality tab and event log
- Quarantine tables keep bad records visible instead of dropping them

## Related Topics

- [DataFrame Operations](./02-dataframe-operations.md)
- [Advanced Transformations (null handling, arrays)](./04-advanced-transformations.md)
- [Gold Layer Objects](./06-gold-layer-objects.md)
- [Delta Lake Fundamentals (schema enforcement)](../01-databricks-intelligence-platform/04-delta-lake-fundamentals.md)
- [Lakeflow Declarative Pipelines Quick Reference](../../../shared/cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md)

## Official Documentation

- [Manage data quality with pipeline expectations](https://docs.databricks.com/aws/en/ldp/expectations)
- [Constraints on Databricks](https://docs.databricks.com/aws/en/tables/constraints)
- [approx_count_distinct function](https://docs.databricks.com/aws/en/sql/language-manual/functions/approx_count_distinct)
- [PySpark DataFrame.summary](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.summary.html)

---

**[← Previous: Advanced Transformations](./04-advanced-transformations.md) | [↑ Back to Data Transformation and Modeling](./README.md) | [Next: Gold Layer Objects →](./06-gold-layer-objects.md)**
