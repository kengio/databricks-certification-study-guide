---
title: Structured Streaming — Part 2
type: topic
tags:
  - data-engineering
  - streaming
  - spark
status: published
---

# Structured Streaming — Part 2

This part covers stream-static joins, stateful operations, state store management, query management, checkpoints, use cases, and exam tips for Structured Streaming.

> For streaming fundamentals, sources, sinks, triggers, output modes, watermarking, and windowed aggregations, see [Part 1](./03-structured-streaming-part1.md).

## Stream-Static Joins

Join a streaming DataFrame with a static (batch) DataFrame.

```python
# Static dimension table

dim_products = spark.table("catalog.schema.dim_products")

# Stream of events

events_stream = spark.readStream.format("delta").load("/events")

# Join stream with static

enriched = events_stream.join(
    dim_products,
    events_stream.product_id == dim_products.id,
    "left"
)
```

**Important**: The static DataFrame is read once at query start. Changes to the static table won't be reflected until the streaming query is restarted.

## Stateful Operations

### mapGroupsWithState

Custom stateful processing with exactly-once semantics.

```python
from pyspark.sql.streaming import GroupState, GroupStateTimeout

def update_session(key, events, state: GroupState):
    # Custom state management logic
    if state.exists:
        current_count = state.get
    else:
        current_count = 0

    new_count = current_count + len(list(events))
    state.update(new_count)

    return (key, new_count)

result = (df
    .groupByKey(lambda x: x.user_id)
    .mapGroupsWithState(
        update_session,
        outputMode="update",
        timeoutConf=GroupStateTimeout.ProcessingTimeTimeout
    ))
```

### flatMapGroupsWithState

Similar to mapGroupsWithState but can emit multiple output records.

```python
def emit_alerts(key, events, state: GroupState):
    alerts = []
    # Process events and potentially emit multiple alerts
    for event in events:
        if event.value > threshold:
            alerts.append(Alert(key, event.value, event.timestamp))
    return iter(alerts)
```

## State Store Management

Understanding state management is critical for production streaming applications.

### State Store Backends

```python
# Default: HDFS-based state store

spark.conf.get("spark.sql.streaming.stateStore.providerClass")

# org.apache.spark.sql.execution.streaming.state.HDFSBackedStateStoreProvider

# RocksDB state store (better for large state)

spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider"
)
```

| Backend | Best For | Memory Usage |
|---------|----------|--------------|
| HDFS (default) | Small to medium state | State in memory |
| RocksDB | Large state (GB+) | Spills to disk |

### When to Use RocksDB

- State size exceeds executor memory
- High-cardinality groupBy keys
- Long watermark delays
- Complex aggregations with many groups

```python
# RocksDB configuration

spark.conf.set("spark.sql.streaming.stateStore.rocksdb.compactOnCommit", "true")
spark.conf.set("spark.sql.streaming.stateStore.rocksdb.changelogCheckpointing.enabled", "true")
```

### State Monitoring

```python
# Monitor state via query progress

progress = query.lastProgress

# State metrics are in stateOperators

if progress and "stateOperators" in progress:
    for op in progress["stateOperators"]:
        print(f"Operator: {op.get('operatorName')}")
        print(f"  numRowsTotal: {op.get('numRowsTotal')}")  # Total rows in state
        print(f"  numRowsUpdated: {op.get('numRowsUpdated')}")  # Rows updated this batch
        print(f"  memoryUsedBytes: {op.get('memoryUsedBytes')}")  # Memory usage
        print(f"  numRowsDroppedByWatermark: {op.get('numRowsDroppedByWatermark')}")
```

### Key State Metrics

| Metric | Meaning | Alert If |
|--------|---------|----------|
| `numRowsTotal` | Total state size | Growing unboundedly |
| `memoryUsedBytes` | Memory for state | Approaching heap limit |
| `numRowsDroppedByWatermark` | Late events dropped | Too high (adjust watermark) |
| `customMetrics.rocksdbMemUsage` | RocksDB memory | Exceeds configured limits |

### State Timeout Configuration

```python
from pyspark.sql.streaming import GroupStateTimeout

# Processing time timeout - based on clock time

result = df.groupByKey(...).mapGroupsWithState(
    func,
    outputMode="update",
    timeoutConf=GroupStateTimeout.ProcessingTimeTimeout
)

# Event time timeout - based on watermark

result = (df.withWatermark("timestamp", "1 hour")
    .groupByKey(...).mapGroupsWithState(
        func,
        outputMode="update",
        timeoutConf=GroupStateTimeout.EventTimeTimeout
    ))

# No timeout - state never expires (dangerous!)

result = df.groupByKey(...).mapGroupsWithState(
    func,
    outputMode="update",
    timeoutConf=GroupStateTimeout.NoTimeout  # State grows forever!
)
```

| Timeout Type | Behavior | Use Case |
|--------------|----------|----------|
| `ProcessingTimeTimeout` | Expires after wall clock time | Sessions with idle timeout |
| `EventTimeTimeout` | Expires when watermark passes | Event-time based expiry |
| `NoTimeout` | Never expires | Small, bounded state only |

### State Cleanup Strategies

```python
# Use watermarks for automatic cleanup

(df.withWatermark("event_time", "1 hour")
    .groupBy(window("event_time", "10 minutes"))
    .count())  # State cleaned after watermark passes window

# Set timeout in mapGroupsWithState

def update_with_timeout(key, events, state):
    if state.hasTimedOut:
        state.remove()  # Clean up expired state
        return None
    # ... process events
    state.setTimeoutDuration("30 minutes")  # Reset timeout
```

### Debugging State Issues

```python
# Check checkpoint directory for state size

dbutils.fs.ls("/checkpoint/state/0/")

# View state schema

spark.read.format("delta").load("/checkpoint/state/0/").printSchema()

# Monitor state growth over time

progress_history = query.recentProgress
for p in progress_history:
    if p and "stateOperators" in p:
        print(f"Batch {p['batchId']}: {p['stateOperators'][0].get('numRowsTotal')} rows")
```

## Query Management

### Starting Queries

```python
# Start with path

query = (df.writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoint")
    .start("/output/path"))

# Start with table

query = (df.writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoint")
    .toTable("catalog.schema.table"))

# Named query

query = (df.writeStream
    .queryName("my_streaming_query")
    .format("delta")
    .start("/output/path"))
```

### Monitoring Queries

```python
# Get active queries

spark.streams.active

# Query status

query.status

# Last progress

query.lastProgress

# Recent progress

query.recentProgress

# Check if running

query.isActive

# Exception (if failed)

query.exception()
```

### Stopping Queries

```python
# Wait for termination

query.awaitTermination()

# Wait with timeout

query.awaitTermination(timeout=3600)  # 1 hour

# Stop query

query.stop()

# Stop all queries

for q in spark.streams.active:
    q.stop()
```

## Checkpoints

Checkpoints store query progress for fault tolerance.

```python
query = (df.writeStream
    .option("checkpointLocation", "/path/to/checkpoint")
    .start())
```

### Checkpoint Contents

| Directory | Contents |
|-----------|----------|
| `commits/` | Completed batch info |
| `offsets/` | Source offsets for each batch |
| `sources/` | Source-specific state |
| `state/` | Aggregation state |
| `metadata` | Query metadata |

### Checkpoint Best Practices

- Use cloud storage (S3, ADLS, GCS) for durability
- One checkpoint location per query
- Don't share checkpoints between different queries
- Keep checkpoints in same region as data

## Use Cases

| Scenario | Recommended Trigger/Mode | Why? |
|----------|--------------------------|------|
| **Real-time Dashboard** | Continuous / Low `processingTime` | Minimizes latency for live viewing. |
| **Daily ETL** | `availableNow=True` | Processes all data efficiently, then shuts down to save cost. |
| **Aggregates (Counts/Sums)** | `complete` Output Mode | Validates total counts, usually requires watermarking for state cleanup. |
| **De-duplication** | `dropDuplicates` + Watermark | Ensures unique records without unbounded state growth. |

## Common Issues & Errors

### AnalysisException: Append output mode not supported

**Scenario:** Trying to use `append` mode with aggregations without watermarking.

**Fix:** Add watermark or switch to `complete` or `update` mode.

**Exam Context:** Identifying incompatible source/sink/transformation combinations.

### Massive State Store Growth (OOM)

**Scenario:** Running a stream-stream join or deduplication without watermarks.

**Fix:** Define watermarks on both sides of join or on the dedup stream to allow state cleanup.

### Checkpoint Incompatibility

**Scenario:** Changing stateful operations (like grouping keys) and trying to resume from old checkpoint.

**Fix:** New query structure requires a new checkpoint location.

### Output Mode "Update" Not Supported by Sink

**Scenario:** Using `update` mode with a file sink (Parquet/ORC).

**Fix:** File sinks only support `append` mode. Use Delta sink for `delete`/`update` capabilities (via MERGE in `foreachBatch`).

## Exam Tips

1. **Triggers**: `availableNow=True` replaces deprecated `once=True` - processes all available data in multiple batches
2. **Output modes**: `append` for inserts, `complete` for aggregations, `update` for stateful
3. **Watermarks**: Required for streaming aggregations to enable state cleanup
4. **Stream-stream joins**: Both sides need watermarks for inner joins
5. **Checkpoints**: Required for exactly-once semantics and failure recovery
6. **ignoreChanges**: Use when source has updates/deletes you want to skip
7. **foreachBatch**: Enables batch operations (like MERGE) in streaming
8. **RocksDB state store**: Use for large state that exceeds memory
9. **State timeouts**: `ProcessingTimeTimeout` vs `EventTimeTimeout` vs `NoTimeout`
10. **Monitor `numRowsTotal`** in stateOperators to detect unbounded state growth

## Best Practices

- Always specify checkpoint location for production queries
- Use watermarks with streaming aggregations
- Choose appropriate trigger based on latency needs
- Monitor query progress with `lastProgress`
- Use `availableNow` for scheduled batch-style streaming
- Test with rate source before connecting production sources

## Related Topics

- [Incremental Processing](02-incremental-processing.md) - Checkpoint management
- [Auto Loader](04-auto-loader.md) - File ingestion streaming
- [Data Deduplication](07-data-deduplication.md) - Streaming dedup

## Official Documentation

- [Structured Streaming Guide](https://docs.databricks.com/structured-streaming/index.html)
- [Streaming Triggers](https://docs.databricks.com/structured-streaming/triggers.html)
- [Watermarks](https://docs.databricks.com/structured-streaming/watermarks.html)

---

**[← Previous: Structured Streaming — Part 1](./03-structured-streaming-part1.md) | [↑ Back to Data Processing](./README.md) | [Next: Auto Loader](./04-auto-loader.md) →**
