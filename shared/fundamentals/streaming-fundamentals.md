---
tags:
  - streaming
  - spark
  - fundamentals
  - data-engineering
aliases:
  - Structured Streaming
  - Streaming Fundamentals
---

# Streaming Fundamentals

Structured Streaming is Spark's unified API for processing both batch and real-time data, treating a live data stream as an unbounded table that is continuously appended.

## What is Structured Streaming?

Structured Streaming is built on the Spark SQL engine. It processes incoming data in micro-batches (or continuously with Continuous Processing mode) and produces results that update incrementally. Key guarantees:

- **Exactly-once processing** — each record is processed exactly once
- **Fault tolerance** — checkpointing enables recovery from failures without data loss or duplication
- **Unified API** — the same DataFrame/Dataset operations work for both batch and streaming

## Streaming vs Batch Processing

| Aspect | Batch | Structured Streaming |
| :--- | :--- | :--- |
| Data model | Bounded dataset | Unbounded table |
| Trigger | Scheduled (e.g., daily) | Continuous / micro-batch |
| Latency | Minutes to hours | Milliseconds to seconds |
| State management | Not needed | Stateful operations with watermarks |
| Output modes | Overwrite, append | Append, complete, update |
| Fault tolerance | Re-run the job | Checkpointing |

## Core Architecture

```mermaid
flowchart LR
    subgraph Sources["Input Sources"]
        Kafka[Apache Kafka]
        AutoLoader[Auto Loader<br>Cloud Files]
        Delta[Delta Table<br>readStream]
        Socket[Socket / Rate<br>Testing only]
    end

    subgraph Engine["Structured Streaming Engine"]
        Micro[Micro-batch<br>Trigger]
        State[State Store<br>StatefulOps]
        Watermark[Watermark<br>Late Data]
    end

    subgraph Sinks["Output Sinks"]
        DeltaSink[Delta Table]
        KafkaSink[Kafka]
        Memory[Memory<br>Testing only]
        Console[Console<br>Debugging]
    end

    Sources --> Engine --> Sinks
```

## Key Concepts

### Triggers

Triggers control how frequently a streaming query is executed.

| Trigger | Syntax | Behavior |
| :--- | :--- | :--- |
| Default (micro-batch) | `trigger(processingTime="0 seconds")` | Run as fast as possible |
| Fixed interval | `trigger(processingTime="1 minute")` | Run every 1 minute |
| Once | `trigger(once=True)` | Process all available data once, then stop |
| Available Now | `trigger(availableNow=True)` | Like Once but with multiple micro-batches |
| Continuous | `trigger(continuous="1 second")` | Low-latency, checkpoint every N seconds |

```python
# Fixed interval trigger
query = (
    df.writeStream
    .trigger(processingTime="30 seconds")
    .format("delta")
    .start("/output/path")
)

# Process available data and stop — useful for scheduled jobs
query = (
    df.writeStream
    .trigger(availableNow=True)
    .format("delta")
    .start("/output/path")
)
query.awaitTermination()
```

### Output Modes

| Mode | Description | Use Case |
| :--- | :--- | :--- |
| `append` | Only new rows added since last trigger | Non-aggregated streams, append-only |
| `complete` | Entire result table written each trigger | Aggregations where you need full state |
| `update` | Only changed rows written | Aggregations with partial updates |

```python
# Append mode — used for simple transformations
query = (
    stream_df.writeStream
    .outputMode("append")
    .format("delta")
    .start("/silver/events")
)

# Complete mode — required for aggregations without watermark
query = (
    stream_df
    .groupBy("event_type")
    .count()
    .writeStream
    .outputMode("complete")
    .format("memory")
    .queryName("event_counts")
    .start()
)
```

### Watermarks and Late Data

A **watermark** tells Spark how long to wait for late-arriving data before closing a time window and dropping late records.

```python
from pyspark.sql.functions import window, col

# Watermark: accept data up to 10 minutes late
query = (
    events_df
    .withWatermark("event_timestamp", "10 minutes")
    .groupBy(
        window("event_timestamp", "5 minutes"),
        "user_id"
    )
    .count()
    .writeStream
    .outputMode("update")
    .format("delta")
    .start("/gold/windowed_counts")
)
```

**Key rule:** In `append` output mode, results for a window are emitted only after the watermark passes the window's end time plus the watermark delay.

### Checkpointing

Checkpointing persists the query progress and state to durable storage, enabling:

- Recovery after a failure without data loss
- Exactly-once processing guarantees

```python
query = (
    df.writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/my_query")
    .start("/output/events")
)
```

**Rules:**

- Each query needs its own unique checkpoint directory
- Never share checkpoints between queries
- Store on cloud storage (ADLS, S3, GCS), not local disk

### Stateful Operations

Operations that maintain state across micro-batches:

| Operation | Description |
| :--- | :--- |
| `groupBy + agg` | Running aggregations per key |
| `dropDuplicates` | Deduplication within a watermark window |
| `join (stream-stream)` | Join two streams within a time window |
| `mapGroupsWithState` | Custom stateful logic per key |
| `flatMapGroupsWithState` | Custom stateful logic with arbitrary output |

## Common Input Sources

### Auto Loader (Cloud Files)

Auto Loader incrementally ingests new files as they arrive in cloud storage. It is the recommended pattern for Bronze ingestion.

```python
df = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/checkpoints/schema")
    .load("/landing/raw/events/")
)
```

### Kafka

```python
df = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker1:9092,broker2:9092")
    .option("subscribe", "events_topic")
    .option("startingOffsets", "latest")
    .load()
)

# Kafka value is binary — parse as JSON
from pyspark.sql.functions import from_json, col
from pyspark.sql.types import StructType, StructField, StringType

schema = StructType([
    StructField("event_id", StringType()),
    StructField("user_id", StringType()),
    StructField("event_type", StringType()),
])

parsed = df.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")
```

### Delta Table as Source

```python
# Read a Delta table as a stream
df = (
    spark.readStream
    .format("delta")
    .load("/delta/bronze_events")
)

# Or using table name
df = spark.readStream.table("bronze.events")
```

## Streaming Joins

### Stream-Static Join

Most common pattern — join a stream against a static lookup table:

```python
# Static dimension table (read once, broadcast)
users_df = spark.read.table("dim.users")

# Enrich streaming events with user data
enriched = events_stream.join(users_df, "user_id", "left")
```

### Stream-Stream Join

Join two streams within a time window. Both sides must have watermarks:

```python
impressions = (
    spark.readStream.table("bronze.impressions")
    .withWatermark("impression_time", "1 hour")
)

clicks = (
    spark.readStream.table("bronze.clicks")
    .withWatermark("click_time", "2 hours")
)

matched = impressions.join(
    clicks,
    (impressions.ad_id == clicks.ad_id) &
    (impressions.impression_time <= clicks.click_time) &
    (impressions.impression_time >= clicks.click_time - expr("INTERVAL 1 HOUR")),
    "leftOuter"
)
```

## Use Cases

| Use Case | Pattern |
| :--- | :--- |
| Real-time event ingestion | Auto Loader → Bronze Delta table |
| CDC from databases | Kafka → merge into Silver |
| Fraud detection | Stateful aggregation with short watermarks |
| Real-time dashboards | Streaming aggregation → Gold table / SQL Warehouse |
| IoT sensor processing | Kafka → windowed aggregation → alerts |

## Common Exam Pitfalls

1. **Output mode mismatch** — Aggregations with watermark can use `update` or `append`, but not `complete` (would hold all data in memory)
2. **Missing checkpointLocation** — Without checkpointing, streaming queries cannot recover from failures
3. **Auto Loader schema** — Always provide `schemaLocation` so schema is inferred once and cached; avoid re-inferring on every restart
4. **Watermark required for stream-stream joins** — Both streams in a stream-stream join must have watermarks
5. **Trigger(once) vs availableNow** — `once` processes all data in a single micro-batch; `availableNow` uses multiple micro-batches (more efficient for large backlogs)

## Practice Questions

### Question 1: Trigger Types

**Question**: A Databricks job must process all data that arrived since the last run, then stop. Which trigger should you use?

A) `trigger(processingTime="0 seconds")`
B) `trigger(once=True)`
C) `trigger(availableNow=True)`
D) `trigger(continuous="1 second")`

> [!success]- Answer
> **Correct Answer: C**
>
> `availableNow=True` processes all currently available data using multiple micro-batches
> and then stops. It is preferred over `once=True` for large backlogs because it
> distributes the work across micro-batches rather than loading everything into a single
> batch, improving stability and fault tolerance. `once=True` is still valid but
> processes everything in one micro-batch regardless of size.

---

### Question 2: Checkpointing

**Question**: A streaming query has been running for three days. The checkpoint directory is accidentally deleted. What happens when the query is restarted?

A) The query resumes from the last committed offset as if nothing happened
B) The query throws an error and cannot start
C) The query starts from the beginning of the stream, potentially reprocessing data
D) The query skips all historical data and reads only new records

> [!success]- Answer
> **Correct Answer: C**
>
> Without a checkpoint, Spark has no record of which offsets were already processed.
> The query restarts as a new stream and will re-read from the source's beginning (or
> `startingOffsets` setting). This can cause duplicate records in the sink if the sink
> does not deduplicate. Always store checkpoint directories on durable cloud storage
> (S3, ADLS, GCS) — never on ephemeral local disk.

---

### Question 3: Watermarks and Late Data

**Question**: Your streaming aggregation uses `.withWatermark("event_time", "10 minutes")` and output mode `update`. An event arrives 15 minutes after the window closes. What happens?

A) The event is processed and the window result is updated
B) The event is silently dropped and the window result is not updated
C) Spark throws a `LateDataException` and the query fails
D) The event is held in a buffer until the next trigger

> [!success]- Answer
> **Correct Answer: B**
>
> A watermark of `"10 minutes"` tells Spark to wait up to 10 minutes after the event
> time for late data. Any event arriving more than 10 minutes past the window's end
> is considered too late and is silently dropped. The watermark also allows Spark to
> safely clean up state for old windows. To capture more late data, increase the
> watermark delay — but this increases memory usage for state storage.

## Referenced By

- [Data Engineer Associate](../../certifications/data-engineer-associate/README.md)
- [Data Engineer Professional](../../certifications/data-engineer-professional/README.md)

## Related Topics

- [Structured Streaming (DE Pro)](../../certifications/data-engineer-professional/01-data-processing/03-structured-streaming-part1.md)
- [Streaming Joins & Stateful Operations (DE Pro)](../../certifications/data-engineer-professional/01-data-processing/08-streaming-joins-stateful.md)
- [Interview Prep — Streaming & CDC](../interview-prep/05-streaming-cdc.md)
- [Spark Fundamentals](spark-fundamentals.md)
