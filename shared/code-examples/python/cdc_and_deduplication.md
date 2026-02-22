---
tags:
  - code-examples
  - python
  - cdc
  - delta-lake
  - deduplication
  - data-engineering
---

# CDC and Deduplication — Python

PySpark examples for Change Data Feed, SCD patterns, and deduplication strategies.

## Change Data Feed — Enable and Read

```python
# Enable CDF on an existing table
spark.sql("""
    ALTER TABLE my_catalog.bronze.orders
    SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")

# Enable at creation time
spark.sql("""
    CREATE TABLE my_catalog.bronze.orders (
        order_id   INT,
        customer_id INT,
        amount     DOUBLE,
        updated_at TIMESTAMP
    )
    TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')
""")
```

```python
# Batch CDF read — by version range
cdf_df = (spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 5)
    .option("endingVersion", 10)
    .table("my_catalog.bronze.orders"))

# Batch CDF read — by timestamp range
cdf_df = (spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingTimestamp", "2024-01-01")
    .option("endingTimestamp", "2024-01-31")
    .table("my_catalog.bronze.orders"))

# Streaming CDF read
cdf_stream = (spark.readStream.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("my_catalog.bronze.orders"))
```

## CDF Metadata Columns

Every CDF read includes these metadata columns:

```python
from pyspark.sql.functions import col

cdf_df = (spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("my_catalog.bronze.orders"))

# Show metadata alongside data
cdf_df.select(
    "order_id",
    "amount",
    col("_change_type"),       # insert | update_preimage | update_postimage | delete
    col("_commit_version"),    # Delta table version of the change
    col("_commit_timestamp")   # Timestamp when change was committed
).show()

# Filter by change type
inserts    = cdf_df.filter(col("_change_type") == "insert")
updates    = cdf_df.filter(col("_change_type") == "update_postimage")
pre_images = cdf_df.filter(col("_change_type") == "update_preimage")
deletes    = cdf_df.filter(col("_change_type") == "delete")

# Typical propagation pattern: apply inserts + updates (after-image only)
to_apply = cdf_df.filter(
    col("_change_type").isin("insert", "update_postimage"))
```

| `_change_type` Value | Description |
| :--- | :--- |
| `insert` | New row inserted |
| `update_preimage` | Row value **before** the update |
| `update_postimage` | Row value **after** the update |
| `delete` | Row that was deleted |

## SCD Type 1 MERGE — Overwrite (PySpark)

```python
from delta.tables import DeltaTable

source_df = spark.table("my_catalog.bronze.customers_cdc")

target = DeltaTable.forName(spark, "my_catalog.silver.customers")

(target.alias("t")
    .merge(source_df.alias("s"), "t.customer_id = s.customer_id")
    .whenMatchedUpdateAll()      # Update all columns when key matches
    .whenNotMatchedInsertAll()   # Insert when no match found
    .execute())
```

```python
# SCD Type 1 with soft-delete and timestamp guard
(target.alias("t")
    .merge(source_df.alias("s"), "t.customer_id = s.customer_id")
    .whenMatchedUpdate(
        condition="s.updated_at > t.updated_at",  # Only apply newer records
        set={
            "name":       "s.name",
            "email":      "s.email",
            "is_deleted": "s.is_deleted",
            "updated_at": "s.updated_at"
        })
    .whenNotMatchedInsertAll()
    .execute())
```

## SCD Type 2 MERGE — Full History (PySpark)

```python
from pyspark.sql.functions import current_timestamp, lit, col

# Step 1: Expire current records that have changed
target = DeltaTable.forName(spark, "my_catalog.silver.customers_history")

(target.alias("t")
    .merge(
        source_df.alias("s"),
        "t.customer_id = s.customer_id AND t.is_current = true"
    )
    .whenMatchedUpdate(
        condition="t.email <> s.email OR t.name <> s.name",
        set={
            "is_current": lit(False),
            "__END_AT":   current_timestamp()
        })
    .execute())

# Step 2: Insert new versions of changed records
new_versions = (source_df
    .join(
        target.toDF().filter(col("is_current") == False),
        "customer_id",
        "inner"  # Only records that were just expired
    )
    .select(
        source_df["*"],
        lit(True).alias("is_current"),
        current_timestamp().alias("__START_AT"),
        lit(None).cast("timestamp").alias("__END_AT")
    ))

new_versions.write.format("delta").mode("append").saveAsTable(
    "my_catalog.silver.customers_history")
```

## Deduplication Strategies

### Batch Deduplication — Keep Latest Record

```python
from pyspark.sql.functions import row_number, col
from pyspark.sql.window import Window

df = spark.table("my_catalog.bronze.events")

# Keep the latest record per event_id
window = Window.partitionBy("event_id").orderBy(col("updated_at").desc())

deduped = (df
    .withColumn("rn", row_number().over(window))
    .filter(col("rn") == 1)
    .drop("rn"))
```

### Streaming Deduplication — Bounded State

```python
# GOOD: bounded state with watermark
deduped_stream = (spark.readStream
    .format("delta")
    .table("my_catalog.bronze.events")
    .withWatermark("event_time", "1 hour")
    .dropDuplicatesWithinWatermark(["event_id"]))

# WARNING: unbounded state — dangerous for long-running streams
# deduped = stream_df.dropDuplicates(["event_id"])  # state grows forever
```

### Idempotent foreachBatch + MERGE

```python
from delta.tables import DeltaTable

def idempotent_upsert(batch_df, batch_id):
    """Safe to retry — MERGE is idempotent when checkpoint is intact."""
    # First deduplicate within the batch
    batch_deduped = batch_df.dropDuplicates(["event_id"])

    target = DeltaTable.forName(spark, "my_catalog.silver.events")

    (target.alias("t")
        .merge(batch_deduped.alias("s"), "t.event_id = s.event_id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute())

(spark.readStream
    .format("delta")
    .table("my_catalog.bronze.events")
    .writeStream
    .foreachBatch(idempotent_upsert)
    .option("checkpointLocation", "/tmp/checkpoints/dedup_merge")
    .trigger(availableNow=True)
    .start()
    .awaitTermination())
```

## Row Tracking (Delta 3.2+)

Row tracking assigns a stable `_row_id` to each row, even across MERGE operations:

```python
# Enable row tracking on a table
spark.sql("""
    ALTER TABLE my_catalog.silver.customers
    SET TBLPROPERTIES ('delta.enableRowTracking' = 'true')
""")

# Read row tracking metadata
df = (spark.read
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .format("delta")
    .table("my_catalog.silver.customers"))

df.select(
    "customer_id",
    col("_row_id"),            # Stable unique row identifier
    col("_row_commit_version") # Version when this row was last written
).show()
```

Row tracking is useful for audit trails — `_row_id` persists across updates (postimage has same `_row_id` as preimage).

## Identity Columns (GENERATED ALWAYS AS IDENTITY)

```python
# Create table with auto-incrementing surrogate key
spark.sql("""
    CREATE TABLE my_catalog.silver.orders_with_sk (
        order_sk   BIGINT GENERATED ALWAYS AS IDENTITY,
        order_id   INT,
        customer_id INT,
        amount     DOUBLE
    )
""")

# Insert — do NOT include the identity column
spark.sql("""
    INSERT INTO my_catalog.silver.orders_with_sk (order_id, customer_id, amount)
    SELECT order_id, customer_id, amount
    FROM my_catalog.bronze.orders
""")

# Read surrogate key
spark.table("my_catalog.silver.orders_with_sk").select(
    "order_sk", "order_id", "customer_id").show()
```

Identity columns are monotonically increasing but not guaranteed to be contiguous (gaps are allowed by the spec). For a strict sequence, use an external generator.
