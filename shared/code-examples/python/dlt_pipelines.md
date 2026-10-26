---
tags:
  - databricks
  - code-examples
  - dlt
  - lakeflow-pipelines
  - lakeflow-spark-declarative-pipelines
  - python
---

# Lakeflow Spark Declarative Pipelines — Python (formerly DLT)

Declarative pipeline examples for **Lakeflow Spark Declarative Pipelines** (formerly Lakeflow Declarative Pipelines, and before that Delta Live Tables / DLT), using the current `pyspark.pipelines` API.
These examples run inside a pipeline — not as a regular notebook. Create one with **New → ETL pipeline**, pick a default catalog and schema, and add this code as a pipeline source file (`.py`).

> [!note] Platform update (Oct 2026)
> "The `dlt` module has been replaced by the `pyspark.pipelines` module. You may still use `dlt`, but Databricks recommends using `pipelines`." Every example below uses `from pyspark import pipelines as dp`. If you meet the older style (`import dlt`, `@dlt.table`, `dlt.apply_changes`, `dlt.read`) in exam stems or older code, see the legacy mapping table at the end of the [pipelines cheat sheet](../../cheat-sheets/lakeflow-declarative-pipelines-quick-ref.md).

## Bronze — Ingest Raw Data with Auto Loader

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import col, current_timestamp

@dp.table(
    comment="Raw orders ingested from cloud storage"
)
def bronze_orders():
    # Inside a pipeline, Auto Loader's schema and checkpoint locations are managed for you
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.inferColumnTypes", "true")
        .load("/Volumes/main/landing/raw/orders/")
        .select(
            "*",
            current_timestamp().alias("_ingested_at"),
            col("_metadata.file_path").alias("_source_file"),  # input_file_name() is not supported on Unity Catalog
        )
    )
```

## Bronze — Ingest from Kafka

```python
from pyspark import pipelines as dp

@dp.table(
    comment="Raw events from Kafka topic"
)
def bronze_events():
    return (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", "broker:9092")
        .option("subscribe", "clickstream")
        .option("startingOffsets", "earliest")
        .load()
        .selectExpr(
            "CAST(key AS STRING) AS event_key",
            "CAST(value AS STRING) AS event_json",
            "topic",
            "partition",
            "offset",
            "timestamp AS kafka_timestamp"
        )
    )
```

## Silver — Clean and Validate

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import col, to_date

@dp.table(
    comment="Cleaned orders with data-quality expectations"
)
@dp.expect_or_drop("valid_amount", "amount > 0")
@dp.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dp.expect("valid_date", "order_date IS NOT NULL")
def silver_orders():
    return (
        spark.readStream.table("bronze_orders")
        .select("order_id", "customer_id", "product", "amount", "order_date")
        .withColumn("order_date", to_date(col("order_date"), "yyyy-MM-dd"))
        .dropDuplicates(["order_id"])  # unbounded state on a stream — add a watermark in production
    )
```

## Silver — SCD Type 1 with AUTO CDC (formerly APPLY CHANGES)

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import col, expr

dp.create_streaming_table("silver_customers")

dp.create_auto_cdc_flow(
    target="silver_customers",
    source="bronze_customer_cdc",
    keys=["customer_id"],
    sequence_by=col("updated_at"),
    apply_as_deletes=expr("operation = 'DELETE'"),
    except_column_list=["operation", "_ingested_at", "_source_file"],
    stored_as_scd_type=1
)
```

## Silver — SCD Type 2 with AUTO CDC

```python
from pyspark import pipelines as dp
from pyspark.sql.functions import col, expr

dp.create_streaming_table("silver_customers_history")

dp.create_auto_cdc_flow(
    target="silver_customers_history",
    source="bronze_customer_cdc",
    keys=["customer_id"],
    sequence_by=col("updated_at"),
    apply_as_deletes=expr("operation = 'DELETE'"),
    except_column_list=["operation", "_ingested_at"],
    stored_as_scd_type=2
)
# Adds __START_AT and __END_AT columns; the current version of each key has __END_AT IS NULL
```

## Gold — Business Aggregation (Materialized View)

```python
from pyspark import pipelines as dp
from pyspark.sql import functions as F

@dp.materialized_view(
    comment="Daily revenue summary by product"
)
def gold_daily_revenue():
    return (
        spark.read.table("silver_orders")
        .groupBy("order_date", "product")
        .agg(
            F.sum("amount").alias("total_revenue"),
            F.count("order_id").alias("order_count"),
            F.avg("amount").alias("avg_order_value")
        )
    )
```

## Data Quality — Expectations

```python
from pyspark import pipelines as dp

# Expectation decorators sit between the dataset decorator and the function:
#   @dp.expect(...)          keep the row, record pass/fail metrics
#   @dp.expect_or_drop(...)  drop the row before it is written
#   @dp.expect_or_fail(...)  stop the update (only this flow fails)

@dp.table
@dp.expect("not_null_id", "id IS NOT NULL")
@dp.expect_or_drop("valid_status", "status IN ('active', 'inactive', 'pending')")
@dp.expect_or_fail("valid_currency", "currency IN ('USD', 'EUR', 'GBP')")
@dp.expect("reasonable_amount", "amount BETWEEN 0 AND 1000000")
def validated_transactions():
    return spark.readStream.table("bronze_transactions")
```

## Materialized View vs Streaming Table

```python
from pyspark import pipelines as dp
from pyspark.sql import functions as F

# Streaming table — processes only new rows from the source on each update
@dp.table
def streaming_orders():
    return spark.readStream.table("bronze_orders")

# Materialized view — incrementally refreshed on serverless when possible,
# otherwise fully recomputed; results always equal a full recompute
@dp.materialized_view
def mv_customer_summary():
    return (
        spark.read.table("silver_orders")
        .groupBy("customer_id")
        .agg(
            F.count("*").alias("total_orders"),
            F.sum("amount").alias("lifetime_value")
        )
    )
```

## Parameterized Pipelines

```python
from pyspark import pipelines as dp

# Read key-value parameters set in the pipeline's configuration
env = spark.conf.get("mypipeline.environment", "dev")
catalog = spark.conf.get("mypipeline.catalog", f"{env}_catalog")

@dp.table(
    name=f"{catalog}.sales.bronze_orders",
    comment=f"Bronze orders for {env} environment"
)
def bronze_orders():
    return (spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .load(f"/Volumes/{catalog}/landing/raw/orders/"))
```

## Querying the Pipeline Event Log

```python
# Run this in a REGULAR notebook or SQL warehouse (not inside the pipeline).
# event_log() takes TABLE(<streaming table or materialized view>) or a pipeline ID.
expectations = spark.sql("""
    SELECT
      timestamp,
      details:flow_progress.data_quality.expectations AS expectations
    FROM event_log(TABLE(main.sales.silver_orders))
    WHERE event_type = 'flow_progress'
      AND details:flow_progress.data_quality.expectations IS NOT NULL
    ORDER BY timestamp DESC
""")
display(expectations)
```

## Notes

- Read pipeline datasets with `spark.readStream.table()` (streaming dependency) or `spark.read.table()` (batch dependency); the legacy `dlt.read_stream()` / `dlt.read()` still work but don't accept read options such as `skipChangeCommits`
- Expectation results are written to the pipeline event log — query them with `event_log()` as shown above
- AUTO CDC (`dp.create_auto_cdc_flow`, formerly `dlt.apply_changes`) is the declarative equivalent of a hand-written `MERGE INTO` for CDC processing
- Pipeline parameters are read with `spark.conf.get()`, not Python environment variables
- Don't call actions such as `collect()`, `count()`, `toPandas()`, `save()`, or `saveAsTable()` inside dataset functions — the pipeline evaluates them multiple times while planning

## Official Documentation

- [Python language reference (`pyspark.pipelines`)](https://docs.databricks.com/aws/en/ldp/developer/python-ref)
- [The AUTO CDC APIs](https://docs.databricks.com/aws/en/ldp/cdc)
- [Load data in pipelines — dataset definition functions](https://docs.databricks.com/aws/en/ldp/developer/definition-function)
- [`event_log` table-valued function](https://docs.databricks.com/aws/en/sql/language-manual/functions/event_log)
- [File metadata column (`_metadata`)](https://docs.databricks.com/aws/en/ingestion/file-metadata-column)
