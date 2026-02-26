---
title: "Practice Questions: Data Processing"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-processing]
---

# Practice Questions - Section 01: Data Processing (30%)

## Question 1.1: Auto Loader Schema Evolution

**Scenario**: A data engineering team ingests JSON files from cloud storage using Auto Loader. New fields are occasionally added to the source data.

**Question** *(Easy)*: Which configuration ensures new columns are automatically added to the target table schema?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`
B) `cloudFiles.schemaEvolutionMode = "rescue"`
C) `cloudFiles.inferColumnTypes = "true"`
D) `cloudFiles.mergeSchema = "true"`

> [!success]- Answer
> **Correct Answer: A**
>
> `schemaEvolutionMode = "addNewColumns"` automatically adds new columns to the schema. Option B rescues unexpected data to a separate column. Option C enables type inference but not schema evolution. Option D is not a valid Auto Loader option (that's for Delta writes).

---

## Question 1.2: Streaming Triggers

**Scenario**: A streaming job processes data from a message queue. The business requires the job to process all available data once per hour and then stop.

**Question** *(Medium)*: Which trigger configuration should be used?

A) `trigger(processingTime='1 hour')`
B) `trigger(once=True)`
C) `trigger(availableNow=True)`
D) `trigger(continuous='1 hour')`

> [!success]- Answer
> **Correct Answer: C**
>
> `availableNow=True` processes all available data and stops, making it ideal for scheduled batch-like streaming. `processingTime` runs continuously. `once=True` is deprecated and only processes one batch. `continuous` is for low-latency and doesn't stop.

---

## Question 1.3: MERGE Operation

**Scenario**: A data engineer needs to update existing records and insert new ones from a source table into a target Delta table.

**Question** *(Easy)*: Which MERGE clause handles records that exist in the source but not in the target?

A) `WHEN MATCHED THEN UPDATE`
B) `WHEN NOT MATCHED THEN INSERT`
C) `WHEN MATCHED THEN INSERT`
D) `WHEN NOT MATCHED BY SOURCE THEN DELETE`

> [!success]- Answer
> **Correct Answer: B**
>
> `WHEN NOT MATCHED THEN INSERT` handles source records that don't have a matching key in the target. `WHEN MATCHED` handles existing records. Option C is invalid syntax. Option D handles records in target not in source.

---

## Question 1.4: Change Data Feed

**Scenario**: A data engineer needs to track all changes (inserts, updates, deletes) to a Delta table for downstream CDC processing.

**Question** *(Easy)*: Which statement correctly enables this capability?

A) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataCapture' = true)`
B) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataFeed' = true)`
C) `ALTER TABLE orders ENABLE CHANGE TRACKING`
D) `CREATE TABLE orders WITH (CDC = ENABLED)`

> [!success]- Answer
> **Correct Answer: B**
>
> `delta.enableChangeDataFeed = true` enables Change Data Feed (CDF) on a Delta table. This allows reading changes using `table_changes()` function or `readChangeData` option. The other options use incorrect syntax.

---

## Question 1.5: Watermarking in Streaming

**Scenario**: A streaming aggregation job groups events by a 10-minute window. Events can arrive up to 30 minutes late.

**Question** *(Medium)*: Which watermark configuration is correct?

A) `withWatermark("event_time", "10 minutes")`
B) `withWatermark("event_time", "30 minutes")`
C) `withWatermark("event_time", "40 minutes")`
D) `withWatermark("processing_time", "30 minutes")`

> [!success]- Answer
> **Correct Answer: B**
>
> The watermark should match the maximum expected lateness (30 minutes). This tells Spark to wait 30 minutes before finalizing windows. Using event_time (not processing_time) is required for event-time processing.

---

## Question 1.6: Incremental Processing with readStream

**Scenario**: A pipeline reads from a Delta table that receives both inserts and updates. Only new and updated records should be processed.

**Question** *(Medium)*: Which configuration enables this?

A) `spark.readStream.option("ignoreChanges", "true").table("source")`
B) `spark.readStream.option("readChangeData", "true").table("source")`
C) `spark.readStream.option("readChangeFeed", "true").table("source")`
D) `spark.readStream.option("skipChangeCommits", "true").table("source")`

> [!success]- Answer
> **Correct Answer: C**
>
> `readChangeFeed = true` (with CDF enabled on the table) reads the change data feed which includes inserts, updates, and deletes. Option A ignores updates/deletes. Option B uses the wrong option name (`readChangeData` is not valid; the correct name is `readChangeFeed`). Option D is not a valid option.

---

## Question 1.7: Stream-Stream Join

**Scenario**: A data engineer needs to join two streaming sources - clickstream events and ad impressions - to calculate ad conversion rates. Both streams have event timestamps.

**Question** *(Medium)*: What is required when performing a stream-stream join?

A) Both streams must use the same checkpoint location
B) Both streams must have identical schemas
C) A time-range condition (watermark) must be defined on both streams
D) One stream must be converted to a static DataFrame first

> [!success]- Answer
> **Correct Answer: C**
>
> Stream-stream joins require watermarks on both streams to define a time-range condition. This allows Spark to know when old state can be discarded. Checkpoint locations are per-stream. Schemas don't need to match. Both sides remain streaming.

---

## Question 1.8: Stream-Static Join

**Scenario**: A streaming pipeline enriches real-time transaction data with customer details from a slowly-changing dimension table.

**Question** *(Medium)*: What happens to the static DataFrame in a stream-static join when it's updated?

A) The static side is re-read for each micro-batch, picking up changes
B) The static side is cached at query start and never refreshed
C) The query fails if the static table changes during execution
D) Updates to the static table require restarting the streaming query

> [!success]- Answer
> **Correct Answer: A**
>
> In a stream-static join, the static DataFrame is re-read for each micro-batch. This means updates to the dimension table are automatically picked up without restarting the query. This makes it ideal for slowly-changing dimensions.

---

## Question 1.9: Stateful Streaming Operations

**Scenario**: A real-time fraud detection system needs to maintain custom state per user session, tracking cumulative transaction amounts and flagging when thresholds are exceeded within a rolling time window.

**Question** *(Hard)*: Which Spark streaming operation provides the most flexibility for this use case?

A) Window aggregation with `groupBy(window(...)).sum()`
B) `dropDuplicatesWithinWatermark()` with session tracking
C) `foreachBatch()` with manual state management
D) `flatMapGroupsWithState()` with GroupStateTimeout

> [!success]- Answer
> **Correct Answer: D**
>
> `flatMapGroupsWithState()` provides arbitrary stateful processing with full control over state shape, timeout behavior, and output. Window aggregations are limited to predefined aggregation functions. `foreachBatch()` doesn't maintain state across batches. `dropDuplicatesWithinWatermark()` is for dedup only.

---

## Question 1.10: Advanced Watermarking

**Scenario**: A streaming aggregation uses a 10-minute watermark. An event arrives with a timestamp 15 minutes behind the current watermark.

**Question** *(Medium)*: How does Spark handle this late event?

A) The event is added to the appropriate window and triggers a recomputation
B) The event is silently dropped and not included in any aggregation
C) The event is placed in a special "late data" output stream
D) The query throws a StreamingQueryException for the late data

> [!success]- Answer
> **Correct Answer: B**
>
> Events arriving after the watermark threshold has passed are silently dropped. Spark does not re-open completed windows. There is no "late data" output stream or exception. The watermark defines the boundary for acceptable lateness.

---

## Question 1.11: Streaming Deduplication

**Scenario**: An IoT pipeline receives duplicate sensor readings due to at-least-once delivery. Each reading has a `device_id`, `reading_id`, and `event_time`. The pipeline uses a 1-hour watermark.

**Question** *(Hard)*: Which approach correctly deduplicates the stream while managing state?

A) `dropDuplicatesWithinWatermark("device_id", "reading_id")` with the existing watermark
B) `dropDuplicates("device_id", "reading_id")` without any watermark
C) `MERGE INTO target USING stream ON target.reading_id = stream.reading_id`
D) `groupBy("device_id", "reading_id").count().filter("count = 1")`

> [!success]- Answer
> **Correct Answer: A**
>
> `dropDuplicatesWithinWatermark()` uses the existing watermark to bound state size - it only tracks duplicates within the watermark window. `dropDuplicates()` without watermark keeps all keys in state forever, causing unbounded state growth. MERGE is for batch. GroupBy-count doesn't actually deduplicate the output.

---

## Question 1.12: Back-Pressure and Rate Limiting

**Scenario**: A streaming query reads from Kafka and the processing time per micro-batch is consistently exceeding the trigger interval, causing increasing latency.

**Question** *(Medium)*: Which configuration limits the amount of data processed per micro-batch?

A) `trigger(processingTime="10 seconds")` to increase batch frequency
B) `spark.sql.streaming.stateStore.maintenanceInterval` to reduce state overhead
C) `spark.sql.shuffle.partitions` to increase parallelism
D) `maxOffsetsPerTrigger` to limit records consumed from Kafka per batch

> [!success]- Answer
> **Correct Answer: D**
>
> `maxOffsetsPerTrigger` controls the maximum number of offsets (records) read from Kafka per trigger, providing back-pressure control. Changing the trigger interval doesn't reduce per-batch data. State maintenance affects state cleanup, not ingestion. Shuffle partitions affect parallelism, not input volume.

---

## Question 1.13: State Store Configuration

**Scenario**: A stateful streaming query tracking millions of user sessions is running out of executor memory due to the state store size.

**Question** *(Hard)*: Which state store backend should be used for large state volumes?

A) HDFS state store with increased `spark.executor.memory`
B) RocksDB state store backend with `spark.sql.streaming.stateStore.providerClass`
C) Delta Lake state store for ACID guarantees on state
D) Redis-backed state store for distributed state management

> [!success]- Answer
> **Correct Answer: B**
>
> RocksDB state store uses local disk (SSD) instead of JVM heap memory, allowing much larger state without OOM errors. Configure via `spark.sql.streaming.stateStore.providerClass=com.databricks.sql.streaming.state.RocksDBStateStoreProvider`. The default HDFS backend stores state in JVM memory. Delta Lake and Redis state stores are not available in Spark.

---

**[↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 02: Databricks Tooling](./02-databricks-tooling.md) →**
