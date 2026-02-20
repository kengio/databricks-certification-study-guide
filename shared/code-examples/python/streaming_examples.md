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
```text

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
```text

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
```text

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
```text

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
```text

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
```text

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
```text

## Monitoring Streams

```python
# Check all active streams
for stream in spark.streams.active:
    print(f"Stream: {stream.name}, ID: {stream.id}, Status: {stream.status}")

# Per-query metrics
# query.lastProgress     — latest micro-batch stats
# query.recentProgress   — recent micro-batch stats
# query.status           — current status
```text
