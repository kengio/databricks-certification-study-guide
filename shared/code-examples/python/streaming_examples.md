---
tags:
  - databricks
  - code-examples
  - structured-streaming
  - auto-loader
  - python
---

# Structured Streaming & Auto Loader — Python

PySpark examples for Structured Streaming and Auto Loader. Run in a Databricks notebook;
replace catalog and schema names with your actual values.

## Basic Structured Streaming (Rate Source)

```python
# Generate test stream
stream_df = (
    spark.readStream
    .format("rate")
    .option("rowsPerSecond", 10)
    .load()
)

# Write to Delta table
query = (
    stream_df.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/rate_stream")
    .toTable("my_catalog.my_schema.rate_events")
)

query.stop()
```

## Auto Loader (cloudFiles)

```python
auto_loader_df = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/tmp/schema/events")
    .option("cloudFiles.inferColumnTypes", "true")
    .load("/path/to/landing/events/")
)

query = (
    auto_loader_df.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/events_bronze")
    .option("mergeSchema", "true")
    .toTable("my_catalog.bronze.events")
)

query.stop()
```

## Auto Loader with Schema Evolution

Schema evolution modes:

- `addNewColumns` — add new columns to schema
- `rescue` — send unexpected data to `_rescued_data` column
- `failOnNewColumns` — fail on new columns (default)
- `none` — ignore new columns

```python
auto_loader_evolve = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/tmp/schema/events_v2")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("/path/to/landing/events/")
)
```

## Trigger Modes

```python
stream_source = spark.readStream.format("delta").table("my_catalog.bronze.events")

# Continuous processing — process as data arrives
query_continuous = (
    stream_source.writeStream
    .format("delta")
    .trigger(processingTime="10 seconds")
    .option("checkpointLocation", "/tmp/checkpoints/continuous")
    .toTable("my_catalog.silver.events_continuous")
)

# Available Now — process all available data then stop (replaces trigger once)
query_available = (
    stream_source.writeStream
    .format("delta")
    .trigger(availableNow=True)
    .option("checkpointLocation", "/tmp/checkpoints/available")
    .toTable("my_catalog.silver.events_batch")
)

# Once (deprecated) — process one micro-batch then stop
query_once = (
    stream_source.writeStream
    .format("delta")
    .trigger(once=True)
    .option("checkpointLocation", "/tmp/checkpoints/once")
    .toTable("my_catalog.silver.events_once")
)

# Stop / await completion
query_continuous.stop()              # stop() sends signal to halt continuous stream
query_available.awaitTermination()   # awaitTermination() blocks until availableNow finishes
query_once.awaitTermination()        # awaitTermination() blocks until trigger-once finishes
```

## Watermarking (Late Data Handling)

```python
from pyspark.sql.functions import window, col, count

events = spark.readStream.format("delta").table("my_catalog.bronze.events")

# Allow up to 10 minutes of late data
windowed_counts = (
    events
    .withWatermark("event_time", "10 minutes")
    .groupBy(
        window("event_time", "5 minutes"),
        col("event_type")
    ).agg(count("*").alias("event_count"))
)

query = (
    windowed_counts.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/watermark")
    .toTable("my_catalog.gold.event_counts")
)

query.stop()
```

## Streaming with foreachBatch (Custom Logic)

```python
from delta.tables import DeltaTable

def upsert_to_silver(batch_df, batch_id):
    """Merge each micro-batch into the silver table."""
    target = DeltaTable.forName(spark, "my_catalog.silver.events")

    target.alias("t").merge(
        batch_df.alias("s"),
        "t.event_id = s.event_id"
    ).whenMatchedUpdateAll(
    ).whenNotMatchedInsertAll(
    ).execute()

query = (
    spark.readStream
    .format("delta")
    .table("my_catalog.bronze.events")
    .writeStream
    .foreachBatch(upsert_to_silver)
    .option("checkpointLocation", "/tmp/checkpoints/foreach")
    .start()
)

query.stop()
```

## Streaming from Change Data Feed

```python
cdf_stream = (
    spark.readStream
    .format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("my_catalog.bronze.orders")
)

# Process only inserts and updates
filtered = cdf_stream.filter(
    col("_change_type").isin("insert", "update_postimage")
)

query = (
    filtered.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/cdf_stream")
    .toTable("my_catalog.silver.orders")
)

query.stop()
```

## Stream-Stream Join with Watermarks

Both streams require watermarks; a time-range condition keeps state bounded:

```python
from pyspark.sql.functions import expr

# Two streaming sources
orders = (spark.readStream.format("delta")
    .table("my_catalog.bronze.orders")
    .withWatermark("order_time", "10 minutes"))

payments = (spark.readStream.format("delta")
    .table("my_catalog.bronze.payments")
    .withWatermark("payment_time", "10 minutes"))

# Inner join — payment must occur within 1 hour of order
joined = orders.join(
    payments,
    expr("""
        order_id = payment_order_id AND
        payment_time >= order_time AND
        payment_time <= order_time + INTERVAL 1 HOUR
    """),
    "inner"
)

query = (joined.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/stream_join")
    .toTable("my_catalog.silver.fulfilled_orders"))

query.awaitTermination()
```

## Deduplication with dropDuplicatesWithinWatermark

```python
from pyspark.sql.functions import col

events = (spark.readStream.format("delta")
    .table("my_catalog.bronze.events"))

# GOOD: bounded state — expires after watermark
deduped = (events
    .withWatermark("event_time", "1 hour")
    .dropDuplicatesWithinWatermark(["event_id"]))

# BAD: unbounded state — state grows forever (OOM risk)
# deduped = events.dropDuplicates(["event_id"])

query = (deduped.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/checkpoints/dedup")
    .toTable("my_catalog.silver.events_deduped"))

query.awaitTermination()
```

`dropDuplicatesWithinWatermark` drops duplicates within the watermark window only.
State is cleaned up once the watermark passes the event time — critical for long-running streams.

## Exactly-Once Sink with foreachBatch + MERGE

Use this pattern when writing to a sink that is not natively idempotent:

```python
from delta.tables import DeltaTable

def idempotent_upsert(batch_df, batch_id):
    """
    Exactly-once upsert pattern.
    batch_id is stable across retries — safe to re-run.
    """
    # Deduplicate within the batch first
    batch_deduped = batch_df.dropDuplicates(["event_id"])

    target = DeltaTable.forName(spark, "my_catalog.silver.events")

    (target.alias("t")
        .merge(batch_deduped.alias("s"), "t.event_id = s.event_id")
        .whenMatchedUpdate(condition="s.updated_at > t.updated_at",
                           set={"*": "s.*"})
        .whenNotMatchedInsertAll()
        .execute())

query = (spark.readStream
    .format("delta")
    .table("my_catalog.bronze.events")
    .writeStream
    .foreachBatch(idempotent_upsert)
    .option("checkpointLocation", "/tmp/checkpoints/idempotent")
    .trigger(availableNow=True)
    .start())

query.awaitTermination()
```

## CDF Full Change Type Reference

CDF produces four `_change_type` values. Handle each explicitly:

```python
from pyspark.sql.functions import col

# Read CDF as a stream
cdf_stream = (spark.readStream
    .format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 0)
    .table("my_catalog.bronze.customers"))

# Insert: new records
inserts = cdf_stream.filter(col("_change_type") == "insert")

# Update (before image): previous value of updated row
update_before = cdf_stream.filter(col("_change_type") == "update_preimage")

# Update (after image): new value of updated row — use this for propagation
update_after = cdf_stream.filter(col("_change_type") == "update_postimage")

# Delete: rows that were removed
deletes = cdf_stream.filter(col("_change_type") == "delete")

# Typical propagation: apply inserts + updates (after image)
to_apply = cdf_stream.filter(
    col("_change_type").isin("insert", "update_postimage"))

# Metadata columns always present with CDF
# _change_type        : change operation
# _commit_version     : Delta table version of the change
# _commit_timestamp   : Timestamp of the change
```

## Monitoring Streams

```python
# Check all active streams
for stream in spark.streams.active:
    print(f"Stream: {stream.name}, ID: {stream.id}, Status: {stream.status}")

# Per-query metrics
# query.lastProgress     — latest micro-batch stats
# query.recentProgress   — recent micro-batch stats
# query.status           — current status
```
