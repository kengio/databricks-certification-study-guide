---
tags: [cheat-sheet, streaming, data-engineer-professional]
---

# Structured Streaming Quick Reference

## Basic Streaming Read

```python
# Read from Delta

df = spark.readStream.format("delta").table("source_table")

# Read from Auto Loader

df = (spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema/path")
    .load("/data/path"))

# Read from Kafka

df = (spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", "host:port")
    .option("subscribe", "topic")
    .load())
```

## Basic Streaming Write

```python
# Write to Delta

(df.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/checkpoint/path")
    .toTable("target_table"))

# Write to Delta with trigger

(df.writeStream
    .format("delta")
    .outputMode("append")
    .trigger(availableNow=True)
    .option("checkpointLocation", "/checkpoint/path")
    .toTable("target_table"))
```

## Trigger Types

| Trigger | Syntax | Behavior |
|---------|--------|----------|
| Default (micro-batch) | None | Process as fast as possible |
| Processing time | `trigger(processingTime='10 seconds')` | Fixed interval |
| Once | `trigger(once=True)` | Single batch, then stop |
| Available now | `trigger(availableNow=True)` | All available data, then stop |
| Continuous | `trigger(continuous='1 second')` | Low-latency (experimental) |

```python
# Processing time trigger

.trigger(processingTime='30 seconds')

# Once trigger (deprecated, use availableNow)

.trigger(once=True)

# Available now (preferred for batch-like streaming)

.trigger(availableNow=True)
```

## Output Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `append` | Only new rows | Immutable data |
| `complete` | Entire result table | Aggregations |
| `update` | Only changed rows | Stateful operations |

## Watermarking

```python
# Define watermark for late data

(df.withWatermark("event_time", "10 minutes")
    .groupBy(window("event_time", "5 minutes"))
    .count())
```

| Watermark | Meaning |
|-----------|---------|
| `"10 minutes"` | Accept data up to 10 min late |
| `"1 hour"` | Accept data up to 1 hour late |
| `"0 seconds"` | No late data allowed |

## Window Functions

```python
# Tumbling window (non-overlapping)

df.groupBy(window("timestamp", "10 minutes"))

# Sliding window (overlapping)

df.groupBy(window("timestamp", "10 minutes", "5 minutes"))

# Session window

df.groupBy(session_window("timestamp", "10 minutes"))
```

## Auto Loader Options

| Option | Description |
|--------|-------------|
| `cloudFiles.format` | Source file format (json, csv, parquet) |
| `cloudFiles.schemaLocation` | Schema inference storage |
| `cloudFiles.inferColumnTypes` | Infer column types |
| `cloudFiles.schemaEvolutionMode` | addNewColumns, rescue, failOnNewColumns |
| `cloudFiles.useNotifications` | Use file notifications (vs directory listing) |

```python
(spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .option("cloudFiles.inferColumnTypes", "true")
    .load("/data/path"))
```

## Stream-Stream Joins

```python
# Inner join with watermarks

ordersWithWatermark = orders.withWatermark("orderTime", "10 minutes")
paymentsWithWatermark = payments.withWatermark("paymentTime", "10 minutes")

ordersWithWatermark.join(
    paymentsWithWatermark,
    expr("""
        orderId = paymentOrderId AND
        paymentTime >= orderTime AND
        paymentTime <= orderTime + interval 1 hour
    """),
    "inner"
)
```

## Checkpoint Management

```python
# Checkpoint location (required for exactly-once)

.option("checkpointLocation", "/mnt/checkpoint/stream_name")
```

**Important**: Never change checkpoint location for a running stream. To restart fresh, delete the checkpoint.

## foreachBatch

```python
def process_batch(batch_df, batch_id):
    # Custom processing per micro-batch
    batch_df.write.format("delta").mode("append").save("/path")

(df.writeStream
    .foreachBatch(process_batch)
    .option("checkpointLocation", "/checkpoint")
    .start())
```

## Monitoring

```python
# Get current stream status

query = df.writeStream...start()
query.status
query.lastProgress
query.recentProgress

# Stop stream

query.stop()

# Await termination

query.awaitTermination()
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| Micro-batch | Default processing model, batches of data |
| Exactly-once | Guaranteed with checkpointing |
| Idempotent | Same input produces same output |
| State store | Persists aggregation state |
