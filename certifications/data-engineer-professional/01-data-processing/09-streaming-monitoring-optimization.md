---
title: Streaming Monitoring & Optimization
type: topic
tags:
  - data-engineering
  - streaming
  - spark
  - monitoring
  - performance
status: published
---

# Streaming Monitoring & Optimization

This guide covers production streaming operations: back-pressure and rate limiting, monitoring and troubleshooting, state store internals, and performance tuning.

> For streaming join patterns and stateful processing, see [Streaming Joins & Stateful Operations](./08-streaming-joins-stateful.md).

## Back-Pressure and Rate Limiting

### Rate Limiting Configuration

Control how much data each micro-batch processes to prevent overwhelming downstream systems or running out of memory.

```python
# Delta / Auto Loader rate limiting
stream = (
    spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/schema/events")
    # File-level rate limiting
    .option("maxFilesPerTrigger", 100)
    # Byte-level rate limiting
    .option("maxBytesPerTrigger", "10g")
    .load("/data/raw/events")
)

# Kafka rate limiting
kafka_stream = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "broker1:9092")
    .option("subscribe", "events")
    # Offset-level rate limiting
    .option("maxOffsetsPerTrigger", 500000)
    # Min partitions for parallelism
    .option("minPartitions", 10)
    .load()
)

# Delta table source rate limiting
delta_stream = (
    spark.readStream
    .format("delta")
    .option("maxFilesPerTrigger", 1000)
    .option("maxBytesPerTrigger", "5g")
    .load("/data/source_table")
)
```text

### Rate Limiting Parameters by Source

| Source | Parameter | Default | Effect |
| :--- | :--- | :--- | :--- |
| Delta / Auto Loader | `maxFilesPerTrigger` | 1000 | Max files per micro-batch |
| Delta / Auto Loader | `maxBytesPerTrigger` | None | Max bytes per micro-batch |
| Kafka | `maxOffsetsPerTrigger` | None (all) | Max records per micro-batch |
| Kafka | `minPartitions` | Kafka partitions | Min read partitions |
| Rate source | `rowsPerSecond` | 1 | Rows generated per second |

### Detecting Back-Pressure

Back-pressure occurs when processing takes longer than the trigger interval, causing a growing backlog.

```python
# Monitor back-pressure indicators
def check_backpressure(query):
    progress = query.lastProgress
    if progress is None:
        return

    input_rate = progress.get("inputRowsPerSecond", 0)
    process_rate = progress.get("processedRowsPerSecond", 0)
    batch_duration = progress.get("batchDuration", 0)
    trigger_ms = progress.get("triggerExecution", {}).get(
        "triggerIntervalMs", 0
    )

    print(f"Input rate:    {input_rate:.0f} rows/sec")
    print(f"Process rate:  {process_rate:.0f} rows/sec")
    print(f"Batch duration: {batch_duration} ms")

    if process_rate > 0 and input_rate > process_rate:
        print("WARNING: Back-pressure detected!")
        print(f"  Ratio: {input_rate / process_rate:.2f}x")

    if trigger_ms > 0 and batch_duration > trigger_ms:
        print("WARNING: Batch duration exceeds trigger interval!")
```text

### Back-Pressure Indicators

| Metric | Healthy | Back-Pressure | Action |
| :--- | :--- | :--- | :--- |
| `inputRowsPerSecond` vs `processedRowsPerSecond` | Input <= Process | Input > Process | Reduce batch size or add resources |
| Batch duration vs trigger interval | Duration < Interval | Duration > Interval | Increase trigger interval or optimize |
| `numInputRows` trend | Stable | Growing | Check source rate, add rate limits |
| State size trend | Stable or bounded | Monotonically growing | Check watermarks, add timeouts |

### StreamingQueryListener for Monitoring

```python
from pyspark.sql.streaming import StreamingQueryListener

class BackpressureListener(StreamingQueryListener):
    def onQueryStarted(self, event):
        print(f"Query started: {event.id}")

    def onQueryProgress(self, event):
        progress = event.progress
        input_rate = progress.inputRowsPerSecond
        process_rate = progress.processedRowsPerSecond

        # Log metrics to monitoring system
        if process_rate > 0 and input_rate > process_rate * 1.5:
            print(
                f"ALERT: Query {event.progress.name} "
                f"backpressure ratio: {input_rate / process_rate:.2f}"
            )

        # Check state operator metrics
        for op in progress.stateOperators:
            if op.numRowsTotal > 1000000:
                print(
                    f"ALERT: State size {op.numRowsTotal} rows "
                    f"for operator {op.operatorName}"
                )

    def onQueryTerminated(self, event):
        print(f"Query terminated: {event.id}")
        if event.exception:
            print(f"Exception: {event.exception}")

# Register the listener
spark.streams.addListener(BackpressureListener())
```text

## Streaming Monitoring and Troubleshooting

### query.recentProgress Analysis

The `recentProgress` attribute returns the last 100 progress reports, enabling trend analysis.

```python
# Analyze recent progress for trends
progress_list = query.recentProgress

if progress_list:
    # Extract key metrics over time
    for p in progress_list[-5:]:  # Last 5 batches
        batch_id = p.get("batchId", "N/A")
        num_rows = p.get("numInputRows", 0)
        duration = p.get("batchDuration", 0)
        input_rate = p.get("inputRowsPerSecond", 0)
        process_rate = p.get("processedRowsPerSecond", 0)

        state_info = ""
        if p.get("stateOperators"):
            state_op = p["stateOperators"][0]
            state_rows = state_op.get("numRowsTotal", 0)
            state_mem = state_op.get("memoryUsedBytes", 0)
            dropped = state_op.get("numRowsDroppedByWatermark", 0)
            state_info = (
                f"  State: {state_rows} rows, "
                f"{state_mem / 1024 / 1024:.1f} MB, "
                f"{dropped} dropped"
            )

        print(
            f"Batch {batch_id}: {num_rows} rows, "
            f"{duration}ms, "
            f"in={input_rate:.0f}/s, "
            f"proc={process_rate:.0f}/s"
            f"{state_info}"
        )
```text

### Key Progress Metrics Reference

| Metric Path | Description | What to Watch |
| :--- | :--- | :--- |
| `numInputRows` | Rows in this micro-batch | Sudden spikes or drops |
| `inputRowsPerSecond` | Ingestion rate | Should match source rate |
| `processedRowsPerSecond` | Processing throughput | Must keep up with input |
| `batchDuration` | Total batch time (ms) | Should be < trigger interval |
| `stateOperators[].numRowsTotal` | Total rows in state store | Should not grow unboundedly |
| `stateOperators[].memoryUsedBytes` | State memory usage | Approaching executor memory limit |
| `stateOperators[].numRowsDroppedByWatermark` | Late events dropped | High = adjust watermark or source |
| `sources[].startOffset` | Where batch started reading | Verify expected offsets |
| `sources[].endOffset` | Where batch finished reading | Verify progress |
| `sink.numOutputRows` | Rows written to sink | Should match expected output |

### Common Failure Patterns

```mermaid
flowchart TD
    Failure[Streaming Failure] --> OOM[OutOfMemoryError]
    Failure --> Checkpoint[Checkpoint Issues]
    Failure --> Schema[Schema Mismatch]
    Failure --> Source[Source Unavailable]

    OOM --> OOM1["Unbounded state growth<br>Fix: Add watermarks"]
    OOM --> OOM2["Large micro-batches<br>Fix: Add rate limits"]
    OOM --> OOM3["Executor memory too small<br>Fix: Use RocksDB or larger nodes"]

    Checkpoint --> CP1["Checkpoint corruption<br>Fix: Start with new checkpoint"]
    Checkpoint --> CP2["Incompatible schema change<br>Fix: New checkpoint location"]
    Checkpoint --> CP3["Storage permission error<br>Fix: Check IAM / credentials"]

    Schema --> SC1["Source schema evolved<br>Fix: Use schema evolution options"]
    Schema --> SC2["Cast errors<br>Fix: Handle nulls, validate types"]

    Source --> SR1["Kafka broker down<br>Fix: Retry with failOnDataLoss=false"]
    Source --> SR2["File source empty<br>Fix: Check path, permissions"]
```text

### Checkpoint Corruption Recovery

```python
# Step 1: Check checkpoint contents
dbutils.fs.ls("/checkpoints/my_query/")
# Expected: commits/, offsets/, sources/, state/, metadata

# Step 2: Check for corrupted state
try:
    state_df = spark.read.format("statestore").load(
        "/checkpoints/my_query/state/0"
    )
    print(f"State rows: {state_df.count()}")
except Exception as e:
    print(f"State corrupted: {e}")

# Step 3: Recovery options

# Option A: Resume from last valid checkpoint (automatic)
# Spark will attempt this by default on restart

# Option B: Start fresh (loses exactly-once guarantee during transition)
# Use only if checkpoint is unrecoverable
dbutils.fs.rm("/checkpoints/my_query/", recurse=True)
# Restart query with same checkpoint path

# Option C: Start from specific offset (Kafka)
query = (
    df.writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/my_query_v2/")
    .start("/output/table")
)
```text

### Checkpoint Compatibility Rules

| Change Type | Compatible? | Action Required |
| :--- | :--- | :--- |
| Add new column to select | Yes | Resume from existing checkpoint |
| Remove column from select | Yes | Resume from existing checkpoint |
| Change filter condition | Yes | Resume from existing checkpoint |
| Change groupBy keys | **No** | New checkpoint location required |
| Change watermark delay | **No** | New checkpoint location required |
| Change join condition | **No** | New checkpoint location required |
| Change state schema | **No** | New checkpoint location required |
| Add new stateful operator | **No** | New checkpoint location required |
| Change output mode | **No** | New checkpoint location required |

### Monitoring Dashboard Checklist

```python
# Production monitoring script
def streaming_health_check():
    """Run periodic health checks on all active streams."""
    for query in spark.streams.active:
        progress = query.lastProgress
        if not progress:
            continue

        name = query.name or query.id

        # Check 1: Is batch duration reasonable?
        duration = progress.get("batchDuration", 0)
        if duration > 60000:  # > 60 seconds
            print(f"WARN [{name}]: Batch duration {duration}ms > 60s")

        # Check 2: Is state growing unboundedly?
        for op in progress.get("stateOperators", []):
            total_rows = op.get("numRowsTotal", 0)
            if total_rows > 5000000:
                print(
                    f"ALERT [{name}]: State has {total_rows} rows"
                )

        # Check 3: Are we keeping up with input?
        input_rate = progress.get("inputRowsPerSecond", 0)
        process_rate = progress.get("processedRowsPerSecond", 0)
        if process_rate > 0 and input_rate > process_rate * 2:
            print(
                f"ALERT [{name}]: Input rate {input_rate:.0f}/s "
                f">> process rate {process_rate:.0f}/s"
            )

        # Check 4: Any exceptions?
        exc = query.exception()
        if exc:
            print(f"ERROR [{name}]: {exc}")

streaming_health_check()
```text

## State Store Deep Dive

### HDFS vs RocksDB State Store

```mermaid
flowchart TD
    subgraph HDFS["HDFS State Store (Default)"]
        H1[All state in JVM heap]
        H2[Versioned as Delta-like files]
        H3[Fast for small state]
        H4[OOM risk with large state]
    end

    subgraph RocksDB["RocksDB State Store"]
        R1[State on local SSD]
        R2[Only hot data in memory]
        R3[Handles GB+ of state]
        R4[Slight latency overhead]
    end

    Decision{State Size?} -->|< 100 MB| HDFS
    Decision -->|> 100 MB| RocksDB
```text

### RocksDB Configuration

```python
# Enable RocksDB state store
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "com.databricks.sql.streaming.state.RocksDBStateStoreProvider"
)

# RocksDB tuning options
spark.conf.set(
    "spark.sql.streaming.stateStore.rocksdb.compactOnCommit", "true"
)
spark.conf.set(
    "spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled",
    "true"
)

# Changelog checkpointing: reduces checkpoint time by writing
# only changes (deltas) instead of full snapshots
# Recommended for large state stores
```text

### State Store Selection Guide

| Factor | HDFS (Default) | RocksDB |
| :--- | :--- | :--- |
| State size | < 100 MB | 100 MB to 100+ GB |
| Memory usage | All in heap | Spills to disk |
| Checkpoint speed | Fast (small state) | Fast with changelog |
| Recovery time | Fast | Slightly slower |
| Key count | < 1M keys | Millions of keys |
| Recommended for | Simple aggregations | Stream-stream joins, large dedup |

## Common Issues and Errors

### 1. Stream-Stream Join State Explosion

**Scenario:** Two streams joined without time range condition. State grows without bound even with watermarks defined.

**Fix:** Always include a time range condition in the join predicate that bounds how long events from each side need to be retained.

**Exam Context:** Questions often test whether you know that watermarks alone are not sufficient for stream-stream joins -- a time range condition in the join predicate is also required for effective state cleanup.

### 2. Outer Join Producing No NULL Results

**Scenario:** Left outer stream-stream join never emits rows with NULL right-side columns. The watermark on the right stream is too short, or the time range condition is too narrow.

**Fix:** Ensure the right-side watermark delay is large enough to allow reasonable matching time. NULL-padded rows emit only after the watermark guarantees no match can arrive.

### 3. mapGroupsWithState Timeout Not Firing

**Scenario:** State timeout configured with `ProcessingTimeTimeout` but `hasTimedOut` never returns true.

**Fix:** Timeouts only fire when there is data to process. If no new events arrive for a group, the timeout callback will not be invoked until the next micro-batch that has at least some data for any group. Ensure the stream receives regular input.

### 4. Global Watermark Too Conservative

**Scenario:** Using "min" watermark policy with two streams where one is much slower. State grows excessively because the effective watermark is held back by the slow stream.

**Fix:** Consider switching to "max" policy if some late data loss is acceptable. Alternatively, ensure both streams have similar data arrival rates.

### 5. Dedup State OOM After Hours of Running

**Scenario:** Using `dropDuplicates` without watermark or with a very wide watermark. State grows until executor runs out of memory.

**Fix:** Use `dropDuplicatesWithinWatermark` with an appropriately sized watermark, or switch to RocksDB state store for large state.

### 6. Checkpoint Incompatible After Adding Aggregation

**Scenario:** Adding a `groupBy` aggregation to an existing streaming query and trying to resume from the old checkpoint.

**Fix:** Any change to stateful operators requires a new checkpoint location. Start the modified query with a fresh checkpoint path.

### 7. StreamingQueryListener Not Receiving Events

**Scenario:** Registered listener does not receive `onQueryProgress` events.

**Fix:** Ensure the listener is registered before the query starts. Verify the listener class extends `StreamingQueryListener` and implements all three methods (`onQueryStarted`, `onQueryProgress`, `onQueryTerminated`).

## Exam Tips

1. **Stream-stream joins require watermarks on both sides** for inner joins, and on the opposite side for outer joins (left outer needs right watermark, right outer needs left watermark)
2. **Time range conditions are essential** in stream-stream join predicates for bounding state; watermarks alone are not sufficient for state cleanup
3. **Stream-static joins re-read the static side** each micro-batch; no watermark is needed on the static side
4. **`mapGroupsWithState`** emits exactly one output per group; **`flatMapGroupsWithState`** emits zero or more
5. **ProcessingTimeTimeout** is based on wall clock time; **EventTimeTimeout** is based on the watermark advancing past a set timestamp
6. **Global watermark policy "min"** (default) is conservative and retains more state; **"max"** is aggressive and drops more late data
7. **Events at exactly the watermark boundary are included** (not dropped); the condition is `event_time >= watermark`
8. **`dropDuplicatesWithinWatermark`** is more memory-efficient than `dropDuplicates` because it only tracks keys within the watermark window
9. **Checkpoint compatibility**: changing groupBy keys, watermark delay, join conditions, state schema, or output mode requires a **new checkpoint location**
10. **Back-pressure** is indicated when `inputRowsPerSecond` exceeds `processedRowsPerSecond` or batch duration exceeds the trigger interval; use `maxOffsetsPerTrigger` (Kafka) or `maxFilesPerTrigger` (files) to control intake

## Best Practices

- Always define watermarks on both sides of stream-stream joins with tight time range conditions
- Use `dropDuplicatesWithinWatermark` instead of `dropDuplicates` for streaming deduplication
- Choose RocksDB state store when state exceeds 100 MB or has high key cardinality
- Enable changelog checkpointing for RocksDB to reduce checkpoint overhead
- Implement `StreamingQueryListener` for production monitoring and alerting
- Set appropriate rate limits (`maxFilesPerTrigger`, `maxOffsetsPerTrigger`) to prevent back-pressure
- Monitor `stateOperators.numRowsTotal` to detect unbounded state growth
- Use `flatMapGroupsWithState` only when you need zero-or-many output semantics; prefer built-in aggregations when possible
- Test stateful logic with small datasets and the `rate` source before connecting production sources
- Keep checkpoint locations versioned (e.g., `/checkpoints/query_v2/`) when making incompatible query changes

## Related Topics

- [Structured Streaming](03-structured-streaming.md) - Streaming fundamentals, triggers, output modes, basic watermarking
- [Auto Loader](04-auto-loader.md) - File ingestion with schema inference and evolution
- [Performance Optimization](../08-performance-optimization/03-spark-tuning.md) - Spark tuning for streaming workloads
- [Data Deduplication](07-data-deduplication.md) - Batch and streaming dedup patterns
- [Streaming Optimization](../08-performance-optimization/07-streaming-optimization.md) - File sizing, trigger tuning, checkpoint optimization

## Official Documentation

- [Stream-Stream Joins](https://docs.databricks.com/structured-streaming/stream-stream-joins.html)
- [Stateful Streaming](https://docs.databricks.com/structured-streaming/stateful-streaming.html)
- [Watermarks](https://docs.databricks.com/structured-streaming/watermarks.html)
- [RocksDB State Store](https://docs.databricks.com/structured-streaming/rocksdb-state-store.html)
- [Streaming Deduplication](https://docs.databricks.com/structured-streaming/dedup.html)
- [StreamingQueryListener](https://docs.databricks.com/structured-streaming/streaming-query-listener.html)
- [Structured Streaming Guide](https://docs.databricks.com/structured-streaming/index.html)
