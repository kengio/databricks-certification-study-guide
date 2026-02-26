---
tags:
  - databricks
  - code-examples
  - dlt
  - lakeflow-pipelines
  - python
---

# DLT / LakeFlow Pipelines — Python

Declarative pipeline examples using Delta Live Tables (DLT), now called LakeFlow Pipelines.
These examples run inside a DLT pipeline — not a regular notebook. Create a DLT pipeline in
the Databricks Workflows UI and attach a notebook containing these cells.

## Bronze — Ingest Raw Data with Auto Loader

```python
import dlt
from pyspark.sql.functions import current_timestamp, input_file_name

@dlt.table(
    comment="Raw orders ingested from cloud storage"
)
def bronze_orders():
    return (
        spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.inferColumnTypes", "true")
        .option("cloudFiles.schemaLocation", "/mnt/checkpoints/bronze_orders_schema")
        .load("/mnt/landing/orders/")
        .select("*",
            current_timestamp().alias("_ingested_at"),
            input_file_name().alias("_source_file")
        )
    )
```

## Bronze — Ingest from Kafka

```python
import dlt

@dlt.table(
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
import dlt
from pyspark.sql.functions import col, from_json, to_date
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType

order_schema = StructType([
    StructField("order_id", IntegerType(), False),
    StructField("customer_id", IntegerType(), True),
    StructField("product", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("order_date", StringType(), True)
])

@dlt.table(
    comment="Cleaned orders with schema enforcement"
)
@dlt.expect_or_drop("valid_amount", "amount > 0")
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect("valid_date", "order_date IS NOT NULL")
def silver_orders():
    return (
        dlt.read_stream("bronze_orders")
        .select(from_json(col("raw_json"), order_schema).alias("parsed"))
        .select("parsed.*")
        .withColumn("order_date", to_date(col("order_date"), "yyyy-MM-dd"))
        .dropDuplicates(["order_id"])
    )
```

## Silver — SCD Type 1 with APPLY CHANGES

```python
import dlt

dlt.create_streaming_table("silver_customers")

dlt.apply_changes(
    target="silver_customers",
    source="bronze_customer_cdc",
    keys=["customer_id"],
    sequence_by=col("updated_at"),
    apply_as_deletes=expr("operation = 'DELETE'"),
    except_column_list=["operation", "_ingested_at", "_source_file"],
    stored_as_scd_type=1
)
```

## Silver — SCD Type 2 with APPLY CHANGES

```python
import dlt

dlt.create_streaming_table("silver_customers_history")

dlt.apply_changes(
    target="silver_customers_history",
    source="bronze_customer_cdc",
    keys=["customer_id"],
    sequence_by=col("updated_at"),
    apply_as_deletes=expr("operation = 'DELETE'"),
    except_column_list=["operation", "_ingested_at"],
    stored_as_scd_type=2
)
# Adds __START_AT, __END_AT, __IS_CURRENT columns automatically
```

## Gold — Business Aggregation

```python
import dlt
from pyspark.sql.functions import sum, count, avg, col

@dlt.table(
    comment="Daily revenue summary by product"
)
def gold_daily_revenue():
    return (
        dlt.read("silver_orders")
        .groupBy("order_date", "product")
        .agg(
            sum("amount").alias("total_revenue"),
            count("order_id").alias("order_count"),
            avg("amount").alias("avg_order_value")
        )
    )
```

## Data Quality — Expectations

```python
import dlt

# Warn only (log to event log, keep row)
@dlt.expect("valid_email", "email IS NOT NULL AND email LIKE '%@%'")

# Drop invalid rows silently
@dlt.expect_or_drop("positive_quantity", "quantity > 0")

# Fail the entire pipeline on violation
@dlt.expect_or_fail("valid_currency", "currency IN ('USD', 'EUR', 'GBP')")

# Multiple expectations on one table
@dlt.table
@dlt.expect("not_null_id", "id IS NOT NULL")
@dlt.expect_or_drop("valid_status", "status IN ('active', 'inactive', 'pending')")
@dlt.expect("reasonable_amount", "amount BETWEEN 0 AND 1000000")
def validated_transactions():
    return dlt.read_stream("bronze_transactions")
```

## Materialized View vs Streaming Table

```python
import dlt

# Streaming table — append-only, processes new data incrementally
@dlt.table
def streaming_orders():
    return dlt.read_stream("bronze_orders")

# Materialized view — fully recomputed on each pipeline update
@dlt.table
def mv_customer_summary():
    return (
        dlt.read("silver_orders")
        .groupBy("customer_id")
        .agg(
            count("*").alias("total_orders"),
            sum("amount").alias("lifetime_value")
        )
    )
```

## Parameterized Pipelines

```python
import dlt

# Access pipeline parameters set in the DLT UI or JSON config
env = spark.conf.get("mypipeline.environment", "dev")
catalog = spark.conf.get("mypipeline.catalog", f"{env}_catalog")

@dlt.table(
    name=f"{catalog}.sales.bronze_orders",
    comment=f"Bronze orders for {env} environment"
)
def bronze_orders():
    return spark.readStream.format("cloudFiles").load(f"/mnt/{env}/orders/")
```

## Querying DLT Event Log

```python
# Run this in a REGULAR notebook (not inside DLT)
# Check data quality metrics from the most recent pipeline update

event_log = spark.read.format("delta").load(
    "/pipelines/<pipeline-id>/system/events"
)

# Filter for data quality expectation results
(event_log
    .filter("event_type = 'flow_progress'")
    .selectExpr(
        "timestamp",
        "details:flow_progress:data_quality:expectations AS expectations"
    )
    .display()
)
```

## Notes

- `dlt.read_stream()` creates a streaming dependency (incremental); `dlt.read()` creates a batch dependency (full recompute)
- Expectations are logged to the DLT event log — use the event log query above to review quality metrics
- `APPLY CHANGES` is the DLT equivalent of `MERGE INTO` for CDC processing
- Pipeline parameters are accessed via `spark.conf.get()`, not Python environment variables
