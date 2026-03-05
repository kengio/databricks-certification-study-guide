---
tags: [interview-prep, streaming, cdc]
---

# Interview Questions — Streaming & CDC

---

## Question 1: Watermarking in Structured Streaming

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Explain watermarking in Spark Structured Streaming. Why is it necessary, what problem does it solve, and what are the trade-offs of setting the watermark too tight vs. too loose?

> [!success]- Answer Framework
>
> **Short Answer**: A watermark bounds state memory by telling Spark to finalize and discard any time window whose end is older than `max(event_time) − threshold`; setting it too tight drops late events (incorrect aggregations), while setting it too loose keeps all late events but grows state indefinitely — calibrate to the 99th percentile of your observed event lateness.
>
> ### Key Points to Cover
>
> - Watermark defines how long to wait for late events before closing a time window
> - Without watermark, state grows unbounded (memory leak)
> - Watermark = max observed event time − threshold
> - Too tight: late events dropped, incorrect aggregations
> - Too loose: state grows large, memory pressure, output delayed
> - Watermark applies to stateful operations (windowed aggregations, stream-stream joins)
>
> ### Example Answer
>
> **Why watermarking is necessary**: In real-world streaming, events arrive out of order. A sensor might emit an event at 10:00 AM, but due to network delay, it arrives at the stream processor at 10:45 AM. Without watermarking, Spark must keep the state (aggregation buffers) for every possible time window forever — the state would grow without bound and eventually cause OOM.
>
> **How watermarking works**: The watermark is `max(observed event_time) − threshold`. Spark advances the watermark as newer events arrive, and finalizes (emits and discards state for) any window whose end time is below the current watermark.
>
> ```python
> (spark.readStream
>     .table("bronze.sensor_events")
>     .withWatermark("event_time", "30 minutes")  # wait up to 30 min for late events
>     .groupBy(
>         window("event_time", "10 minutes"),  # 10-minute tumbling window
>         "sensor_id"
>     )
>     .agg(avg("reading").alias("avg_reading"))
>     .writeStream
>     .format("delta")
>     .outputMode("append")  # watermark required for append mode on windowed agg
>     .option("checkpointLocation", "/checkpoints/sensor_agg")
>     .toTable("silver.sensor_hourly"))
> ```
>
> **Trade-offs:**
>
> | Setting | Effect |
> | ------- | ------ |
> | Too tight (5 min, actual lateness 30 min) | Late events dropped → incorrect aggregations; small state → fast |
> | Too loose (24 hours, actual lateness 30 min) | All late events included → correct; large state in memory/disk |
> | Well-calibrated (35 min for 30 min lateness) | Minimal dropped events; bounded state size |
>
> **How to calibrate**: Monitor `eventTime.watermark` in Spark Streaming metrics and measure actual event lateness distribution from your Bronze layer. Set the watermark at the 99th percentile of observed lateness plus a small buffer.
>
> ### Follow-up Questions
>
> - What output mode must you use with windowed aggregations when a watermark is set?
> - If the streaming job restarts after 2 hours of downtime, how does the watermark behave?
> - Can you use watermarking with stream-stream joins? What additional constraint applies?

---

## Question 2: Stateful Streaming Operations

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
What is stateful streaming in Spark, and what operational challenges come with running stateful streaming jobs in production? How do you manage state at scale?

> [!success]- Answer Framework
>
> **Short Answer**: Stateful streaming operations (windowed aggregations, stream-stream joins, custom state) maintain data across micro-batches in RocksDB (Databricks default) per executor; the key operational challenges are unbounded state growth without watermarks or TTL, checkpoint incompatibility when query logic changes, and slow recovery time from large state checkpoints after failure.
>
> ### Key Points to Cover
>
> - Stateful: operations that maintain state across micro-batches (windowed agg, stream-stream join, `mapGroupsWithState`)
> - State stored in RocksDB (Databricks) or in-memory (default) per executor
> - State can grow unbounded without watermarking or explicit eviction
> - Checkpointing persists state to cloud storage for fault tolerance
> - Operational challenges: state size growth, rebalancing issues, checkpoint storage costs
> - `StateStoreSizeBytes` metric for monitoring state health
>
> ### Example Answer
>
> **Stateful operations** maintain data across micro-batches:
>
> - **Windowed aggregations**: count/sum events within a time window
> - **Stream-stream joins**: match events from two streams that may arrive at different times
> - **`flatMapGroupsWithState`**: custom stateful logic (session detection, fraud patterns, etc.)
>
> The **state** is stored in a StateStore. By default, this is an in-memory hash map. Databricks uses **RocksDB** (enabled by default) for production, which spills state to disk when it exceeds memory — critical for long-running jobs with large state.
>
> ```python
> # Enable RocksDB state store (Databricks default)
> spark.conf.set(
>     "spark.sql.streaming.stateStore.providerClass",
>     "com.databricks.sql.streaming.state.RocksDBStateStoreProvider"
> )
> ```
>
> **Operational challenges:**
>
> 1. **State growth**: Without watermarking or TTL, state grows indefinitely. One customer session per key × millions of users = OOM. Always set watermarks or use `GroupState.setTimeoutDuration()` for custom state.
>
> 2. **Checkpoint compatibility**: Checkpoints are tied to the query schema and code. If you change the streaming query (add a column, change aggregation), the checkpoint may be incompatible and you must restart from scratch — losing state history.
>
> 3. **Rebalancing**: When you add executors to scale up, state is not automatically redistributed. Some executors end up with uneven state load until the next checkpoint cycle.
>
> 4. **Recovery time**: After a failure, the job must restore state from the checkpoint (potentially reading GBs of RocksDB snapshots from cloud storage). Monitor `stateStoreLoadLatency` to detect slow recovery.
>
> **Monitoring state health**:
>
> ```python
> # Track StateStoreSizeBytes in Spark streaming metrics
> # Alert if state grows beyond expected bounds
> ```
>
> ### Follow-up Questions
>
> - You need to update the stateful streaming logic in production. How do you do this without losing the accumulated state?
> - How does RocksDB state store differ from the in-memory store in terms of performance and durability?
> - Your streaming job processes session data with `flatMapGroupsWithState`. A session can last up to 30 days. What does this mean for your state size?

---

## Question 3: Exactly-Once Semantics

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
How does Spark Structured Streaming achieve exactly-once end-to-end semantics? What components must all be in place for this guarantee to hold?

> [!success]- Answer Framework
>
> **Short Answer**: Exactly-once requires three components working together — a replayable source (Kafka offsets, Auto Loader file tracking), an idempotent sink (Delta Lake deduplicates writes by batch ID in the transaction log), and checkpointing (records committed offsets and state so restarts resume from the right place with no skipped or double-processed batches).
>
> ### Key Points to Cover
>
> - Three guarantees: at-most-once, at-least-once, exactly-once
> - Exactly-once requires: replayable sources + idempotent sinks + checkpointing
> - Checkpointing: records source offsets and state after each batch commit
> - Delta Lake as sink: idempotent writes via transaction log (same batch ID = no duplicate write)
> - If sink is not idempotent (e.g., plain JDBC append), you only get at-least-once
> - Kafka source: offsets tracked in checkpoint; replay from last committed offset on restart
>
> ### Example Answer
>
> "Exactly-once" means every event is processed and written to the sink exactly one time — no duplicates, no data loss — even across failures and restarts.
>
> It requires three components working together:
>
> **1. Replayable source**: The source must allow re-reading from a specific offset after a failure. Kafka is replayable — offsets are stored in the checkpoint, and on restart Spark re-reads from the last committed offset. File sources (Auto Loader, COPY INTO) are also replayable. A WebSocket or non-offset source is NOT replayable and can only provide at-least-once.
>
> **2. Idempotent sink**: The sink must handle duplicate writes without creating duplicates in the output. Delta Lake achieves this via the transaction log: each streaming micro-batch is assigned a unique batch ID, and Delta will reject a write with the same batch ID if it was already committed (idempotent write). If you write to a plain JDBC table with `INSERT INTO`, you get at-least-once (duplicates on retry).
>
> **3. Checkpointing**: The checkpoint records: (a) the source offsets consumed in the last committed batch, and (b) the state of stateful operations. On restart, Spark reads the checkpoint to determine where to resume, ensuring no batch is silently skipped.
>
> ```python
> (df.writeStream
>     .format("delta")
>     .option("checkpointLocation", "/checkpoints/my_stream")  # required
>     .trigger(processingTime="1 minute")
>     .toTable("silver.orders"))
> ```
>
> **What breaks exactly-once**:
>
> - Deleting or corrupting the checkpoint directory
> - Writing to a non-idempotent sink (JDBC, Kafka without transactions)
> - Changing the streaming query (adds/removes operations) with an incompatible checkpoint
>
> ### Follow-up Questions
>
> - Delta as a streaming sink gives exactly-once. What about Kafka as a streaming sink?
> - What happens if the checkpoint directory is accidentally deleted? What options do you have?
> - If a micro-batch writes to Delta and the job crashes before updating the checkpoint, what happens on restart?

---

## Question 4: Trigger Types and When to Use Each

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Explain the four Structured Streaming trigger types — `processingTime`, `once`, `availableNow`, and `continuous`. For each, describe the right use case and any important caveats.

> [!success]- Answer Framework
>
> **Short Answer**: Use `processingTime` for continuous low-latency streaming, `availableNow` for scheduled batch-like streaming (processes all backlog across multiple micro-batches then stops — the preferred replacement for the deprecated `once`), and `continuous` only for sub-millisecond stateless pipelines; `once` is deprecated since Spark 3.3.
>
> ### Key Points to Cover
>
> - `processingTime`: periodic micro-batch on a schedule; most common
> - `once`: deprecated; processes one micro-batch and stops
> - `availableNow`: processes all available data in micro-batches, then stops; replacement for `once`
> - `continuous`: experimental low-latency mode; ms-level latency but limited operations
> - `availableNow` is preferred over `once` for scheduled batch-like streaming
>
> ### Example Answer
>
> **`trigger(processingTime="1 minute")`**: Runs a micro-batch every minute regardless of whether new data has arrived. If no data arrives, it runs a no-op batch. Use this for **continuous streaming** where you want consistent latency.
>
> ```python
> .trigger(processingTime="30 seconds")  # batch every 30 seconds
> ```
>
> **`trigger(once=True)`**: Processes exactly one micro-batch (all available data at that moment) and stops. **Deprecated as of Spark 3.3** — use `availableNow` instead. Behavior: only processes data available at the moment of the first batch, even if more arrives mid-run.
>
> **`trigger(availableNow=True)`**: Processes ALL currently available data across multiple micro-batches (respecting data ordering and rate limits) and then stops the stream cleanly. This is the **preferred trigger for scheduled batch-like streaming** — run it via Databricks Workflows every hour to process the hourly backlog:
>
> ```python
> (spark.readStream
>     .table("bronze.orders")
>     .writeStream
>     .format("delta")
>     .option("checkpointLocation", "/checkpoints/orders")
>     .trigger(availableNow=True)  # process all backlog, then stop
>     .toTable("silver.orders"))
> ```
>
> Unlike `once`, `availableNow` correctly handles schema evolution and processes data in multiple batches if needed.
>
> **`trigger(continuous="1 second")`**: Experimental mode with ~1ms end-to-end latency. Instead of micro-batches, tasks run continuously. **Limitations**: only supports simple stateless operations (map, filter, basic projections); no aggregations, no joins, no watermarking. Use only when sub-second latency is critical and your pipeline is stateless.
>
> **Decision guide:**
>
> | Need | Trigger |
> | ---- | ------- |
> | Continuous low latency (seconds) | `processingTime="10 seconds"` |
> | Scheduled batch processing | `availableNow=True` |
> | Sub-millisecond latency, stateless | `continuous` |
> | One-time backfill | `availableNow=True` |
>
> ### Follow-up Questions
>
> - `availableNow` vs `processingTime` for an hourly batch job — what are the cost implications?
> - If you use `availableNow` and a new file arrives mid-run, is it processed in the current run?
> - `continuous` trigger doesn't support aggregations. What does this mean architecturally?

---

## Question 5: Monitoring and Recovering a Failed Streaming Job

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
A critical Silver-layer streaming job has been failing silently for 3 hours — the job shows as "running" but no new data has been written. How would you diagnose this, and how do you design for resilience going forward?

> [!success]- Answer Framework
>
> **Short Answer**: Check the Spark Streaming UI for a stuck micro-batch (batch started 3 hours ago, still running) and executor logs for OOM/lock/schema errors; the job can resume cleanly from checkpoint without data loss — then add proactive resilience: alert on `batchDuration > threshold`, monitor data freshness (`MAX(_ingestion_timestamp)`), track Kafka consumer lag, and route bad records to a dead-letter table.
>
> ### Key Points to Cover
>
> - Silent failure symptoms: job running, no data written, no error in UI
> - Check: Spark Streaming UI for batch processing time, input/output rates
> - Check: Databricks job run history for exceptions in logs
> - Check: `processingTimestamp` metric — is the watermark advancing?
> - Check: source queue (Kafka lag) vs. stream throughput
> - Resilience: SLA alerts on `batchDuration`, data freshness checks, dead-letter queue for bad records
>
> ### Example Answer
>
> **Diagnosis:**
>
> **Step 1 — Spark Streaming UI**: Open the Spark UI → Structured Streaming tab. Look at `Input Rate` and `Processing Rate`. If input rate is > 0 but processing rate is 0, the job is reading data but not writing it — likely an exception in processing. If both are 0, the source may be empty or the job is stuck.
>
> **Step 2 — Check batch duration**: In the Streaming UI, each micro-batch shows its processing time. If the last batch started 3 hours ago and is still "running", the job is stuck — likely a long-running lock, OOM, or executor failure.
>
> **Step 3 — Check Databricks job logs**: Go to the Workflow run → log output. Search for `ERROR` or `Exception`. Common culprits:
>
> - `OutOfMemoryError`: state grew too large, executor killed
> - `ConcurrentModificationException`: conflicting write on the Delta sink
> - Schema mismatch: source schema changed, breaking the streaming read
>
> **Step 4 — Check data freshness metric**: If you have a monitoring query:
>
> ```sql
> SELECT MAX(_ingestion_timestamp) FROM silver.orders;
> ```
>
> Compare to `current_timestamp()`. A 3-hour gap confirms the problem.
>
> **Step 5 — Recovery**: Restart the job — Structured Streaming will resume from the checkpoint (no data loss). If the root cause was OOM, increase cluster memory or reduce state. If schema mismatch, update the stream to handle schema evolution.
>
> **Resilience design going forward:**
>
> 1. **Alert on batch duration**: Set a Databricks alert if `batchDuration > 5 minutes` for a job with a 1-minute trigger.
> 2. **Alert on data freshness**: Monitor `MAX(processing_time)` in Silver; alert if it's > 10 minutes stale.
> 3. **Alert on Kafka consumer lag**: Monitor the consumer group offset lag in Kafka; if lag grows, the stream is falling behind.
> 4. **Dead-letter queue**: Route records that cause processing errors to a quarantine table instead of crashing the stream.
> 5. **Auto-restart policy**: Configure Databricks job to automatically restart on failure with exponential backoff.
>
> ### Follow-up Questions
>
> - The job restarted from checkpoint and resumed, but you notice a 3-hour gap in Silver data. How do you backfill it without duplicating records?
> - How do you implement a dead-letter queue in a Structured Streaming job?
> - If the checkpoint is corrupted, what are your options and what data might you lose?

---

**[← Previous: Pipeline Architecture](./04-pipeline-architecture.md) | [↑ Back to Interview Prep](./README.md) | [Next: Data Modeling →](./06-data-modeling.md)**
