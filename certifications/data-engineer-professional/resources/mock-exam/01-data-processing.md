# Mock Exam - Section 1: Data Processing (Questions 1-18)

## Question 1

**Scenario**: A data engineering team is building an ingestion pipeline that reads JSON files from cloud storage. The source system occasionally adds new fields to the JSON schema without notice. The team needs to automatically capture all fields while maintaining schema consistency in the Delta table.

**Question**: Which Auto Loader configuration will automatically detect and add new columns to the target Delta table?

A) `cloudFiles.inferColumnTypes = true`
B) `cloudFiles.format = json` with `rescuedDataColumn`
C) `cloudFiles.schemaLocation` with `mergeSchema = true`
D) `cloudFiles.schemaEvolutionMode = addNewColumns`

> [!success]- Answer
> **Correct Answer: D**
>
> `cloudFiles.schemaEvolutionMode = addNewColumns` is the Auto Loader configuration that automatically detects and adds new columns to the target schema. Option A only controls type inference, not schema evolution. Option C uses `schemaLocation` for storing schema but `mergeSchema` is a Delta write option, not Auto Loader. Option B captures unparseable data but doesn't handle schema evolution.

---

## Question 2

**Scenario**: A streaming pipeline processes clickstream data with an average of 50,000 events per second. The pipeline writes to a Delta table that downstream analysts query frequently. The team notices query performance degrading due to many small files.

**Question**: Which trigger configuration balances latency and file size for this workload?

A) `trigger(availableNow=True)`
B) `trigger(processingTime="1 second")`
C) `trigger(processingTime="1 minute")`
D) `trigger(once=True)`

> [!success]- Answer
> **Correct Answer: C**
>
> A 1-minute processing time trigger allows sufficient data to accumulate for larger file writes while maintaining reasonable latency. Option A processes all available data at once (batch-like). Option B writes too frequently, creating small files. Option D is for one-time batch processing, not continuous streaming.

---

## Question 3

**Scenario**: A data engineer needs to implement a pipeline that captures both current and historical versions of customer records. When a customer's address changes, the old record should be marked as inactive with an end date, and a new active record should be inserted.

**Question**: Which approach correctly implements this SCD Type 2 pattern using Delta Lake?

A) Use `MERGE INTO` with `WHEN MATCHED AND target.is_current = true THEN UPDATE` to close the old record, then `INSERT` the new record
B) Use `MERGE INTO` with `WHEN MATCHED THEN UPDATE` to update the existing record
C) Use `INSERT OVERWRITE` to replace all records for the customer
D) Use `DELETE` followed by `INSERT` to replace the customer record

> [!success]- Answer
> **Correct Answer: A**
>
> SCD Type 2 requires closing the current record (setting end_date and is_current=false) and inserting a new record. The MERGE statement with a condition on `is_current = true` ensures only the active record is updated. Options B and D implement SCD Type 1 (overwrite). Option C would lose history.

---

## Question 4

**Scenario**: A pipeline uses Auto Loader to ingest JSON files. The data engineer wants to ensure that the inferred schema is persisted and reused across stream restarts, and that any data not matching the schema is captured for later analysis rather than causing failures.

**Question**: Which Auto Loader configuration achieves both requirements?

A) Set `cloudFiles.schemaLocation` and `cloudFiles.schemaEvolutionMode = rescue`
B) Set `cloudFiles.inferColumnTypes = true` and `badRecordsPath`
C) Set `cloudFiles.schemaHints` with all expected columns
D) Set `cloudFiles.format = json` with `mode = PERMISSIVE`

> [!success]- Answer
> **Correct Answer: A**
>
> `cloudFiles.schemaLocation` persists the inferred schema to a directory so it's reused across restarts. `schemaEvolutionMode = rescue` captures data that doesn't match the schema into a `_rescued_data` column instead of failing. Option B's `badRecordsPath` is for batch reads. Option C provides hints but doesn't persist schema or rescue data. Option D uses invalid configuration syntax.

---

## Question 5

**Scenario**: A streaming pipeline processes transaction data and must ensure exactly-once semantics when writing to a Delta table. The pipeline occasionally fails and restarts from checkpoints.

**Question**: Which combination ensures exactly-once processing guarantees?

A) `outputMode("append")` with checkpointing enabled
B) `outputMode("complete")` with `foreachBatch()` and manual deduplication
C) `outputMode("append")` with checkpointing and idempotent Delta writes
D) `outputMode("update")` with watermarking

> [!success]- Answer
> **Correct Answer: C**
>
> Exactly-once semantics require checkpointing (for tracking progress) combined with idempotent writes (Delta Lake's transaction log ensures writes are atomic and can be retried safely). Option A lacks idempotency mention. Option B requires manual handling. Option D is for stateful aggregations.

---

## Question 6

**Scenario**: A data engineer is building a Change Data Feed (CDF) pipeline to propagate changes from a bronze table to silver. The bronze table has CDF enabled. The engineer needs to read only the changes since the last pipeline run.

**Question**: Which code correctly reads incremental changes from the CDF-enabled table?

A) `spark.read.format("delta").option("readChangeFeed", "true").table("bronze")`
B) `spark.readStream.format("delta").option("ignoreChanges", "true").table("bronze")`
C) `spark.read.format("delta").option("startingVersion", last_version).table("bronze")`
D) `spark.readStream.format("delta").option("readChangeFeed", "true").table("bronze")`

> [!success]- Answer
> **Correct Answer: D**
>
> Using `readStream` with `readChangeFeed = true` creates a streaming source that automatically tracks progress and reads only new changes. Option A is batch read (would need version parameters). Option C reads snapshots, not change records. Option B ignores changes rather than reading them.

---

## Question 7

**Scenario**: A MERGE operation is taking longer than expected when updating a large Delta table with 500 million rows. The merge condition uses `customer_id` which is not the partition column. Analysis shows the merge scans nearly all files in the table.

**Question**: What is the most effective optimization for this MERGE operation?

A) Increase `spark.sql.shuffle.partitions` to 1000
B) Add a Z-ORDER on `customer_id`
C) Partition the table by `customer_id`
D) Enable `spark.databricks.delta.merge.enableLowShuffle`

> [!success]- Answer
> **Correct Answer: B**
>
> Z-ORDER on `customer_id` co-locates data with similar customer_id values, enabling file pruning during MERGE and dramatically reducing files scanned. Option A adds parallelism but doesn't reduce data scanned. Option C is impractical for high-cardinality columns. Option D is not a valid configuration.

---

## Question 8

**Scenario**: A streaming pipeline uses watermarking to handle late-arriving data. The watermark is set to 10 minutes. A data quality check shows that some events arriving 15 minutes late are being dropped.

**Question**: What is the expected behavior and how should the engineer address this?

A) Increase the watermark to 20 minutes to capture more late data
B) This is expected behavior; events beyond the watermark are intentionally dropped
C) Set `spark.sql.streaming.stateStore.providerClass` to handle late data
D) Use `outputMode("complete")` to include all data

> [!success]- Answer
> **Correct Answer: B**
>
> Watermarking intentionally drops data arriving after the threshold to bound state store size. Events 15 minutes late with a 10-minute watermark will be dropped by design. Option A could work but increases state size. Options C and D don't address late data handling. The engineer should evaluate if 10 minutes is the right threshold for their use case.

---

## Question 9

**Scenario**: A data engineer needs to implement a pipeline that reads from multiple Kafka topics with different schemas. Each topic should be written to its own Delta table while maintaining streaming progress.

**Question**: Which approach correctly handles multiple topics with independent schemas?

A) Read all topics in one stream and use `filter()` to split by topic before writing
B) Use `foreachBatch()` to route records to different tables based on topic
C) Create separate streaming queries for each topic with independent checkpoints
D) Use `readStream.format("kafka").option("subscribe", "topic1,topic2")` with schema registry

> [!success]- Answer
> **Correct Answer: C**
>
> Separate streaming queries with independent checkpoints provide isolation for different schemas and independent failure handling. Option A requires a common schema. Option B complicates checkpoint management. Option D subscribes to multiple topics but doesn't handle different schemas well.

---

## Question 10

**Scenario**: A table uses `DELETE` operations to remove records that are older than 90 days for compliance. After running deletes for several weeks, the table's storage size hasn't decreased despite fewer rows.

**Question**: What must be done to reclaim storage space after DELETE operations?

A) Run `OPTIMIZE` to compact files
B) Recreate the table using `CREATE TABLE AS SELECT`
C) Run `FSCK REPAIR TABLE` to fix storage
D) Run `VACUUM` with an appropriate retention period

> [!success]- Answer
> **Correct Answer: D**
>
> DELETE in Delta Lake marks records as removed but doesn't physically delete files (to support time travel). VACUUM removes files older than the retention period that are no longer referenced. Option A compacts but doesn't remove old files. Option C checks table integrity. Option B is inefficient.

---

## Question 11

**Scenario**: A streaming pipeline aggregates hourly sales totals. The source data sometimes arrives out of order, with events from previous hours arriving in the current batch. The pipeline uses `groupBy(window(timestamp, "1 hour"))`.

**Question**: Which configuration ensures accurate aggregations while bounding state store growth?

A) Set `outputMode("complete")` to recompute all windows
B) Add `withWatermark("timestamp", "2 hours")` before the aggregation
C) Use `outputMode("append")` without watermarking
D) Set `spark.sql.streaming.stateStore.maintenanceInterval` to "1 hour"

> [!success]- Answer
> **Correct Answer: B**
>
> Watermarking allows Spark to handle late data within the threshold (2 hours) while cleaning up state for windows that can no longer receive updates. Option A recomputes but doesn't bound state. Option C would drop late data immediately. Option D controls maintenance frequency, not late data handling.

---

## Question 12

**Scenario**: A data engineer is debugging a streaming pipeline that stopped processing data. The query shows `ACTIVE` status but the `processedRowsPerSecond` metric shows 0. New files are continuously arriving in the source location.

**Question**: What is the most likely cause of this issue?

A) The checkpoint location is full
B) Auto Loader's `cloudFiles.maxFilesPerTrigger` is set too low
C) The source files are being written to a different path than configured
D) The stream is waiting for the trigger interval

> [!success]- Answer
> **Correct Answer: C**
>
> A stream showing ACTIVE with 0 rows processed while files are arriving typically indicates the configured source path doesn't match where files are being written. Option A would cause errors, not zero processing. Option B would limit throughput but not stop it entirely. Option D wouldn't show persistent zero processing.

---

## Question 13

**Scenario**: A MERGE operation needs to handle duplicate keys in the source data. The business rule states that when duplicates exist, the record with the latest timestamp should be used.

**Question**: Which approach correctly handles this deduplication requirement?

A) Use `dropDuplicates()` on the source DataFrame before MERGE
B) Use multiple MERGE statements with different conditions
C) Set `spark.databricks.delta.merge.repartitionBeforeWrite.enabled = true`
D) Deduplicate within the MERGE using `ROW_NUMBER()` in a subquery

> [!success]- Answer
> **Correct Answer: D**
>
> Using `ROW_NUMBER()` partitioned by key and ordered by timestamp DESC in a subquery, then filtering for row_number = 1, deduplicates source data correctly within the MERGE while ensuring the latest record is kept. Option A (`dropDuplicates()`) is non-deterministic and doesn't guarantee keeping the record with the latest timestamp. Option C affects write performance, not deduplication. Option B is unnecessarily complex.

---

## Question 14

**Scenario**: A pipeline processes IoT sensor data using Auto Loader. The sensors occasionally send malformed JSON that causes parsing errors. The team wants to capture bad records for analysis without failing the pipeline.

**Question**: Which configuration captures malformed records while allowing the pipeline to continue?

A) Set `cloudFiles.ignoreCorruptFiles = true`
B) Set `badRecordsPath` to a storage location
C) Use `cloudFiles.rescuedDataColumn` to capture unparseable data
D) Wrap the read in a try-catch block

> [!success]- Answer
> **Correct Answer: C**
>
> `rescuedDataColumn` creates a column containing data that couldn't be parsed according to the schema, allowing analysis of bad records. Option A ignores corrupt files entirely. Option B is for batch operations. Option D doesn't work with streaming transformations.

---

## Question 15

**Scenario**: A batch ETL job reads from a Delta table and writes to another Delta table. The job runs daily and should only process records that changed since the last run. The source table has Change Data Feed enabled.

**Question**: Which code pattern correctly implements incremental processing using CDF?

A) Read with `option("readChangeFeed", "true").option("startingVersion", last_processed_version)`
B) Read with `option("versionAsOf", last_processed_version)` and compare with current version
C) Use `CHANGES` table-valued function in SQL
D) Read the `_delta_log` directly to find changed files

> [!success]- Answer
> **Correct Answer: A**
>
> Reading CDF with `startingVersion` returns all changes (inserts, updates, deletes) since that version, including `_change_type` column. Option B reads snapshots, not changes. Option C is not valid syntax. Option D is fragile and not recommended.

---

## Question 16

**Scenario**: A streaming pipeline writes to a Delta table that is also queried by a BI dashboard. Users report seeing inconsistent results during pipeline runs, with some queries returning partial batches.

**Question**: How does Delta Lake ensure consistent reads during concurrent writes?

A) Delta uses table-level locks to prevent reads during writes
B) Delta uses snapshot isolation; readers see consistent snapshots regardless of concurrent writes
C) Delta queues read requests until writes complete
D) Configure `delta.isolationLevel = serializable` to ensure consistency

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake provides snapshot isolation by default. Readers see a consistent snapshot based on the transaction log at query start time, regardless of concurrent writes. Option A is incorrect; Delta doesn't use table locks. Option C is incorrect; reads aren't queued. Option D is not a valid setting.

---

## Question 17

**Scenario**: A data engineer needs to implement conditional updates in a MERGE operation. Records should only be updated if the source timestamp is newer than the target timestamp. Otherwise, the source record should be ignored.

**Question**: Which MERGE clause correctly implements this conditional update logic?

A) `WHEN MATCHED AND source.timestamp > target.timestamp THEN UPDATE SET *`
B) `WHEN MATCHED THEN UPDATE SET * WHERE source.timestamp > target.timestamp`
C) `WHEN MATCHED THEN UPDATE SET target.* = source.* IF source.timestamp > target.timestamp`
D) `WHEN MATCHED THEN UPDATE SET * HAVING source.timestamp > target.timestamp`

> [!success]- Answer
> **Correct Answer: A**
>
> The condition in `WHEN MATCHED AND condition` filters which matched rows receive the update. Rows not meeting the condition are skipped. Option B has invalid syntax (WHERE after UPDATE SET). Options C and D use invalid syntax.

---

## Question 18

**Scenario**: A streaming pipeline uses `foreachBatch()` to write to multiple Delta tables. The engineer wants to ensure atomicity across all writes within each batch--either all tables are updated or none are.

**Question**: How can the engineer achieve atomic writes across multiple tables in `foreachBatch()`?

A) Wrap all writes in a single Spark transaction using `spark.sql("BEGIN TRANSACTION")`
B) Use Delta Lake's multi-table transactions with `spark.databricks.delta.multiTableTransaction.enabled`
C) This cannot be achieved directly; implement idempotent writes with manual rollback logic
D) Use `foreachPartition()` instead for transactional guarantees

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake doesn't support multi-table transactions. The recommended approach is to make each write idempotent (using merge keys or batch IDs) so failed batches can be safely reprocessed. Options A and B describe non-existent features. Option D doesn't provide multi-table atomicity.

---

**[↑ Back to Full-Length Practice Exam](./README.md) | [Next: Mock Exam - Section 2: Databricks Tooling](./02-databricks-tooling.md) →**
