---
tags: [cheat-sheet, streaming, structured-streaming, spark, data-engineering]
---

# Structured Streaming Quick Reference

Quick reference for Structured Streaming — triggers, output modes, watermarks, stateful operations, exactly-once semantics, and monitoring.

## Basic Streaming Read

```python
# Read from Delta table
df = spark.readStream.format("delta").table("source_table")

# Read with Auto Loader (cloudFiles)
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
# Write to Delta table (append)
(df.writeStream
    .format("delta")
    .outputMode("append")
    .option("checkpointLocation", "/checkpoint/path")
    .toTable("target_table"))

# Write with trigger
(df.writeStream
    .format("delta")
    .outputMode("append")
    .trigger(availableNow=True)
    .option("checkpointLocation", "/checkpoint/path")
    .toTable("target_table"))
```

## Trigger Types

| Trigger | Syntax | Behavior |
| :--- | :--- | :--- |
| Default (micro-batch) | None | Process as fast as possible |
| Fixed interval | `trigger(processingTime='10 seconds')` | Wait between batches |
| Once (deprecated) | `trigger(once=True)` | Single batch then stop |
| Available now | `trigger(availableNow=True)` | All available data then stop |
| Continuous | `trigger(continuous='1 second')` | Low-latency, experimental |

`availableNow` is the preferred replacement for `once` — it processes all backlog in multiple batches before stopping.

## Output Modes

| Mode | Description | Requires |
| :--- | :--- | :--- |
| `append` | Only new rows added to result table | No aggregation, or aggregation with watermark |
| `complete` | Entire result table rewritten each batch | Aggregation |
| `update` | Only changed rows written | Aggregation or stateful ops |

## Watermarking

Watermarks bound the state size for late-arriving data:

```python
from pyspark.sql.functions import window

# Define watermark (accept events up to 10 min late)
(df.withWatermark("event_time", "10 minutes")
    .groupBy(window("event_time", "5 minutes"))
    .count())
```

| Watermark delay | Effect |
| :--- | :--- |
| `"0 seconds"` | No late data; state cleaned aggressively |
| `"10 minutes"` | State kept for 10 min after max seen event time |
| `"1 hour"` | Large state window; more memory usage |

Without a watermark, stateful aggregations keep state forever → OOM risk.

## Window Functions

```python
from pyspark.sql.functions import window, session_window

# Tumbling window (non-overlapping, fixed size)
df.groupBy(window("timestamp", "10 minutes")).count()

# Sliding window (overlapping: every 5 min, window of 10 min)
df.groupBy(window("timestamp", "10 minutes", "5 minutes")).count()

# Session window (dynamic gap-based)
df.groupBy(session_window("timestamp", "10 minutes")).count()
```

## Stream-Stream Joins

Both streams must have watermarks. A time-range condition keeps state bounded:

```python
from pyspark.sql.functions import expr

orders = (orders_df
    .withWatermark("order_time", "10 minutes"))
payments = (payments_df
    .withWatermark("payment_time", "10 minutes"))

# Inner join with time-range condition
joined = orders.join(
    payments,
    expr("""
        order_id = payment_order_id AND
        payment_time >= order_time AND
        payment_time <= order_time + INTERVAL 1 HOUR
    """),
    "inner"
)
```

Outer join types (left/right/full) require additional watermarks and may produce null rows when state expires.

## Stateful Aggregations

```python
# Streaming deduplication — bounded state with watermark
(df.withWatermark("event_time", "1 hour")
    .dropDuplicatesWithinWatermark(["event_id"]))

# vs. unbounded dedup (dangerous without watermark)
df.dropDuplicates(["event_id"])  # State grows forever

# Stateful aggregation with state cleanup
(df.withWatermark("event_time", "1 hour")
    .groupBy(window("event_time", "5 minutes"), "user_id")
    .agg({"amount": "sum"}))
```

`dropDuplicatesWithinWatermark` is preferred — it expires state after the watermark passes, keeping memory bounded.

## Exactly-Once Semantics

Exactly-once delivery requires:

1. **Checkpointing** — saves progress and state (required)
2. **Idempotent sink** — Delta Lake supports this natively for append
3. **`foreachBatch` + MERGE** — for non-idempotent sinks

```python
from delta.tables import DeltaTable

def upsert_batch(batch_df, batch_id):
    target = DeltaTable.forName(spark, "target_table")
    (target.alias("t")
        .merge(batch_df.alias("s"), "t.id = s.id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute())

(df.writeStream
    .foreachBatch(upsert_batch)
    .option("checkpointLocation", "/checkpoint/stream")
    .trigger(availableNow=True)
    .start())
```

## Checkpoint Management

```python
# Checkpoint location is required for exactly-once and restart recovery
.option("checkpointLocation", "/mnt/checkpoint/stream_name")
```

**Rules:**

- Never change the checkpoint location for a running stream
- To restart fresh (schema change, logic change), delete the checkpoint first
- Checkpoint + idempotent sink = exactly-once end-to-end guarantee

## foreachBatch

```python
def process_batch(batch_df, batch_id):
    # batch_df is a regular DataFrame — use any batch API
    batch_df.write.format("delta").mode("append").save("/path")
    batch_df.write.format("jdbc").mode("append").save()  # Non-Delta sinks

(df.writeStream
    .foreachBatch(process_batch)
    .option("checkpointLocation", "/checkpoint")
    .start())
```

## Monitoring

```python
# Start and monitor
query = df.writeStream.format("delta").start()

query.status           # Current status dict
query.lastProgress     # Last batch metrics
query.recentProgress   # List of recent batch metrics

# Useful fields in lastProgress
query.lastProgress["numInputRows"]
query.lastProgress["inputRowsPerSecond"]
query.lastProgress["processedRowsPerSecond"]

query.stop()           # Stop stream
query.awaitTermination()  # Block until done or error
```

## Key Concepts

| Concept | Description |
| :--- | :--- |
| Micro-batch | Default model; data processed in discrete batches |
| Watermark | Threshold for accepting late data; bounds state size |
| State store | Persists aggregation/join state across batches |
| Checkpoint | Saves progress metadata for restart recovery |
| Exactly-once | Guaranteed with checkpoint + idempotent sink |
| `availableNow` | Process all backlog in multiple batches, then stop |

## Related Topics

- [Auto Loader Quick Reference](./auto-loader-quick-ref.md)
- [Streaming Examples (Python)](../code-examples/python/streaming_examples.md)
- [Streaming Fundamentals](../fundamentals/streaming-fundamentals.md)
- [Structured Streaming (DE Pro)](../../certifications/data-engineer-professional/01-data-processing/03-structured-streaming-part1.md)
