# Mock Exam 2 - Section 1: Data Processing (Questions 1-18)

[Back to Exam Overview](./README.md) | [Next: Databricks Tooling](02-databricks-tooling.md)

---

### Question 1

**Scenario**: A data engineering team ingests millions of small JSON files per day from a cloud storage landing zone. The files are uploaded by thousands of IoT devices. Using Auto Loader with directory listing mode, the pipeline takes over 40 minutes just to discover new files before any processing begins.

**Question**: Which Auto Loader configuration change will most effectively reduce the file discovery time for this pipeline?

A) Set `cloudFiles.maxFilesPerTrigger` to a higher value to process more files per batch
B) Switch to `cloudFiles.useIncrementalListing = true` to use sorted directory listing
C) Switch to `cloudFiles.useNotifications = true` to use file notification mode
D) Set `cloudFiles.schemaLocation` to a faster storage tier for schema caching

> [!success]- Answer
> **Correct Answer: C**
>
> File notification mode uses cloud-native event notifications (e.g., AWS SNS/SQS, Azure Event Grid) to detect new files, eliminating the need to list the entire directory. This is dramatically faster than directory listing mode when dealing with millions of files. Option A increases batch size but does not speed up file discovery. Option B improves directory listing but still requires listing operations that are slow at scale.

---

### Question 2

**Scenario**: A streaming pipeline uses Auto Loader to ingest Parquet files with a defined schema stored at a checkpoint location. After a deployment, the upstream system adds two new required columns to the Parquet files. The pipeline is restarted and immediately fails with an `AnalysisException` indicating the new columns are missing from the existing schema.

**Question**: What happens when Auto Loader encounters schema changes after recovering from a checkpoint?

A) Auto Loader uses the previously inferred schema from the schema location and rejects files that do not match, causing a `UnknownFieldException` that stops the stream unless schema evolution is configured
B) Auto Loader automatically adds the new columns and backfills existing data with null values
C) Auto Loader ignores the new columns and continues processing with the original schema only
D) Auto Loader restarts from the beginning of the source directory, re-reading all files with the new schema

> [!success]- Answer
> **Correct Answer: A**
>
> Auto Loader persists the inferred schema to the schema location and reuses it across restarts. When new columns appear, the behavior depends on `cloudFiles.schemaEvolutionMode`. Without explicit configuration, unexpected schema changes cause the stream to fail. Options B and C describe behaviors that only occur with specific `schemaEvolutionMode` settings (`addNewColumns` or `none` respectively).

---

### Question 3

**Scenario**: A retail company needs to implement SCD Type 2 on a `dim_customer` table. When a customer updates their address, the current record must be closed (set `end_date` and `is_current = false`) and a new record must be inserted with `is_current = true`. The source data arrives as a staging table with only the latest state per customer.

**Question**: Which MERGE implementation correctly handles SCD Type 2 for this use case?

A) A single MERGE with `WHEN MATCHED THEN UPDATE SET end_date = current_date(), is_current = false` and `WHEN NOT MATCHED THEN INSERT` -- this handles both closing old records and inserting new ones
B) Two separate SQL statements: first an UPDATE to close changed records, then an INSERT for the new versions, wrapped in a transaction
C) A single MERGE with `WHEN MATCHED AND target.is_current = true AND target.address <> source.address THEN UPDATE SET *` and `WHEN NOT MATCHED THEN INSERT *`
D) A single MERGE with `WHEN MATCHED AND target.is_current = true AND target.address <> source.address THEN UPDATE SET end_date = current_date(), is_current = false` combined with a separate INSERT statement for new active records using a UNION of the matched changes

> [!success]- Answer
> **Correct Answer: D**
>
> SCD Type 2 requires two operations for changed records: closing the existing record and inserting a new active version. A single MERGE cannot both update and insert for the same matched key, so the correct pattern uses MERGE to close the old record and a separate INSERT for the new version. Option A only closes old records but never inserts the new active version. Option C overwrites the record entirely (SCD Type 1 behavior).

---

### Question 4

**Scenario**: A data engineer needs to join two streaming DataFrames: `orders` (with `order_time`) and `shipments` (with `ship_time`). The business rule states that a shipment must occur within 7 days of the order to be considered valid. Both streams have watermarks defined.

**Question**: Which join condition correctly implements this time-bounded stream-stream join?

A) `orders.order_id == shipments.order_id` with a post-join filter `shipments.ship_time - orders.order_time <= interval 7 days`
B) `orders.order_id == shipments.order_id AND shipments.ship_time BETWEEN orders.order_time AND orders.order_time + interval 7 days`
C) `orders.order_id == shipments.order_id` with watermarks set to 7 days on both streams
D) `orders.order_id == shipments.order_id AND shipments.ship_time - orders.order_time <= 7` with implicit day conversion

> [!success]- Answer
> **Correct Answer: B**
>
> The time-range condition must be part of the join condition (not a post-join filter) so that Spark can use it along with watermarks to determine when old state can be discarded. The `BETWEEN` clause clearly expresses the valid time window. Option A applies the filter after the join, which prevents Spark from optimizing state cleanup. Option C defines watermarks but lacks the required time-range join condition. Option D uses an integer comparison rather than an interval expression.

---

### Question 5

**Scenario**: A data engineer uses `foreachBatch()` to write streaming micro-batches to both a Delta table and an external PostgreSQL database. If the pipeline fails mid-batch and restarts, some records may be written to PostgreSQL twice.

**Question**: Which pattern ensures exactly-once semantics for the PostgreSQL writes within `foreachBatch()`?

A) Use the `batchId` parameter to track which batches have been committed in a metadata table in PostgreSQL, and skip re-processing of already-committed batch IDs
B) Use `outputMode("append")` with checkpointing, which guarantees exactly-once writes to all sinks automatically
C) Deduplicate the PostgreSQL table after each batch using a `DELETE` of duplicate rows based on primary key
D) Write to PostgreSQL first and Delta second so that the checkpoint only advances after both succeed

> [!success]- Answer
> **Correct Answer: A**
>
> The `batchId` provided to the `foreachBatch` function is guaranteed to be the same for a replayed batch after failure recovery. By recording the committed `batchId` in PostgreSQL and checking it before writing, the pipeline achieves idempotent writes and exactly-once semantics. Option B only guarantees exactly-once for Delta sinks, not external databases. Option C creates a window of inconsistency and is not truly idempotent.

---

### Question 6

**Scenario**: A data engineer reads the Change Data Feed from a Delta table and needs to process the different types of row-level changes separately. The engineer writes a filter condition to isolate updated records but is unsure of the exact column values.

**Question**: Which set of values does the `_change_type` column contain in a Change Data Feed?

A) `insert`, `update`, `delete`
B) `added`, `modified`, `removed`
C) `insert`, `update_preimage`, `update_postimage`, `delete`
D) `create`, `update_before`, `update_after`, `drop`

> [!success]- Answer
> **Correct Answer: C**
>
> The `_change_type` column in CDF contains four possible values: `insert` for new rows, `update_preimage` for the row state before an update, `update_postimage` for the row state after an update, and `delete` for removed rows. The pre/post image distinction for updates is critical for CDC pipelines that need to detect exactly which columns changed.

---

### Question 7

**Scenario**: A data engineering team manages hundreds of Delta tables across multiple schemas. They spend significant time manually running `OPTIMIZE` and `VACUUM` operations and tuning Z-ORDER columns. The team wants to automate these maintenance tasks.

**Question**: What does Databricks predictive optimization automate when enabled on a Unity Catalog metastore?

A) It automates only `VACUUM` operations based on storage usage thresholds
B) It automates only `OPTIMIZE` operations by monitoring query patterns
C) It automates `OPTIMIZE` and `VACUUM` but requires manual Z-ORDER column specification
D) It automates `OPTIMIZE`, `VACUUM`, and `ZORDERING` by analyzing query patterns and table statistics to determine when and how to run maintenance

> [!success]- Answer
> **Correct Answer: D**
>
> Predictive optimization is a Unity Catalog feature that automatically runs `OPTIMIZE` (including file compaction), `VACUUM` (file cleanup), and `ZORDERING` (based on observed query predicates) without manual intervention. It uses table access patterns and statistics to determine the optimal schedule and configuration. Options A through C each describe only a subset of what predictive optimization handles.

---

### Question 8

**Scenario**: An IoT streaming pipeline receives sensor readings that occasionally include duplicates due to at-least-once delivery. The pipeline uses a 2-hour watermark on `event_time`. A data engineer uses `dropDuplicates("sensor_id", "reading_id")` to remove duplicates but notices that state size grows unboundedly over days of continuous operation.

**Question**: Which approach resolves the unbounded state growth while still deduplicating records?

A) Reduce the watermark to 30 minutes so state expires faster
B) Replace `dropDuplicates()` with `dropDuplicatesWithinWatermark("sensor_id", "reading_id")` which uses the existing watermark to bound deduplication state
C) Add a `DISTINCT` clause in a downstream SQL query instead of deduplicating in the stream
D) Increase executor memory to accommodate the growing state

> [!success]- Answer
> **Correct Answer: B**
>
> `dropDuplicatesWithinWatermark()` leverages the existing watermark to automatically expire deduplication state for events older than the watermark threshold. In contrast, `dropDuplicates()` retains all seen keys in state indefinitely because it has no time bound. Option A changes the late-data tolerance and does not fix the root cause since `dropDuplicates` ignores the watermark entirely.

---

### Question 9

**Scenario**: A data engineer configures Auto Loader with `cloudFiles.schemaEvolutionMode = "rescue"` to ingest CSV files. After several weeks, the team notices a `_rescued_data` column in the target table contains non-null JSON strings for some rows.

**Question**: What does the `_rescued_data` column contain?

A) A JSON string containing column values that did not conform to the expected schema, including columns with unexpected names or data that failed type casting
B) The complete original raw record as a single string for any row that had at least one parsing warning
C) Only the column names that were added since the schema was first inferred
D) A binary-encoded copy of the entire source file that contained the mismatched record

> [!success]- Answer
> **Correct Answer: A**
>
> The `_rescued_data` column captures a JSON map of any data that could not be parsed into the expected schema. This includes columns with unexpected names not in the schema and values that failed type casting (e.g., a string in an integer column). It does not store the entire raw record or file, only the specific fields that did not fit the defined schema.

---

### Question 10

**Scenario**: A data analyst needs to query a Delta table as it existed at a specific point in time for a compliance audit. The analyst knows the exact timestamp of the end-of-day snapshot they need, but does not know which Delta version corresponds to that timestamp. Another analyst needs to reproduce a specific report that was generated from a known Delta version.

**Question**: When is it more appropriate to use `TIMESTAMP AS OF` versus `VERSION AS OF` for Delta time travel?

A) `TIMESTAMP AS OF` is for streaming queries; `VERSION AS OF` is for batch queries
B) `VERSION AS OF` should always be preferred because timestamps can be ambiguous across time zones
C) `TIMESTAMP AS OF` works only with dates, not datetime values; `VERSION AS OF` supports both
D) `TIMESTAMP AS OF` is ideal when querying by a business point-in-time (e.g., end-of-day), while `VERSION AS OF` is ideal for reproducibility when the exact commit version is known

> [!success]- Answer
> **Correct Answer: D**
>
> `TIMESTAMP AS OF` maps a datetime to the latest Delta version committed at or before that timestamp, making it natural for business-time queries like audits. `VERSION AS OF` uses the exact commit version number, ensuring deterministic reproducibility when the specific version is tracked (e.g., in a report metadata table). Both work in batch and streaming contexts, and timestamps support full datetime precision.

---

### Question 11

**Scenario**: A data engineer implements a custom stateful streaming operation using `flatMapGroupsWithState()` to track user sessions. Sessions should expire if no event is received within 30 minutes. The engineer needs to choose between `ProcessingTimeTimeout` and `EventTimeTimeout`.

**Question**: What is the key difference between `ProcessingTimeTimeout` and `EventTimeTimeout` in stateful streaming?

A) `ProcessingTimeTimeout` triggers based on the event timestamp column, while `EventTimeTimeout` triggers based on wall-clock time
B) `ProcessingTimeTimeout` is more accurate for out-of-order data because it accounts for late-arriving events
C) `EventTimeTimeout` triggers when the watermark advances past the timeout timestamp, providing deterministic timeout behavior based on data timestamps rather than wall-clock time
D) There is no functional difference; they are aliases for the same timeout mechanism

> [!success]- Answer
> **Correct Answer: C**
>
> `EventTimeTimeout` is driven by the watermark, so the timeout fires when the watermark (derived from event timestamps across all partitions) advances past the configured timeout timestamp. This makes it deterministic and reproducible during reprocessing. `ProcessingTimeTimeout` uses the system clock, so timeouts depend on when micro-batches execute, which is non-deterministic and not reproducible.

---

### Question 12

**Scenario**: A data engineer is tasked with running `VACUUM` on a large Delta table to reclaim storage. The engineer considers setting the retention period to 0 hours to remove all historical files immediately.

**Question**: Why is running `VACUUM` with a retention period less than 7 days considered dangerous?

A) It will permanently delete the Delta transaction log, making the table unreadable
B) It may remove files that are still needed by concurrent readers or writers that started before the VACUUM, leading to query failures with `FileNotFoundException`
C) It converts the Delta table to a plain Parquet table by removing all metadata files
D) It triggers a full table rewrite that doubles the storage usage temporarily

> [!success]- Answer
> **Correct Answer: B**
>
> VACUUM with a short retention period can delete data files that are still referenced by long-running queries or streaming jobs that hold an older table snapshot. These queries will fail with `FileNotFoundException` when they attempt to read the removed files. The 7-day default retention provides a safety buffer for concurrent operations. The transaction log (`_delta_log`) is not affected by VACUUM.

---

### Question 13

**Scenario**: A data engineer builds a streaming pipeline that computes a running count of events per product category using `groupBy("category").count()`. The engineer tries to use `outputMode("append")` but the query fails at runtime.

**Question**: Which output mode correctly supports streaming aggregations with `groupBy`?

A) `outputMode("complete")` outputs the entire aggregation result table after each micro-batch, replacing all previous output
B) `outputMode("append")` writes only new rows and is the only mode that supports aggregations
C) `outputMode("update")` is required because it is the only mode that works with stateful operations
D) Both `outputMode("append")` and `outputMode("update")` work equally well for aggregations without watermarks

> [!success]- Answer
> **Correct Answer: A**
>
> For streaming aggregations without a watermark, `complete` mode is required because the aggregation results change with every micro-batch and must be fully rewritten. `append` mode fails because Spark cannot determine when an aggregation result is finalized without a watermark. With a watermark defined, `append` and `update` modes also become available, but without one, only `complete` works.

---

### Question 14

**Scenario**: A data engineer configures Auto Loader to read JSON files using `format("cloudFiles")` and sets both `cloudFiles.format` and the top-level `.format()` in the DataStreamReader chain. The engineer is confused about which setting takes precedence.

**Question**: How does the configuration hierarchy work for Auto Loader's file format setting?

A) The top-level `.format("json")` call on the DataStreamReader overrides `cloudFiles.format`
B) The two settings are independent: `.format()` sets the stream source type and `cloudFiles.format` sets the file parsing format
C) Setting both causes an `IllegalArgumentException` at runtime because they conflict
D) `.format("cloudFiles")` is required to activate Auto Loader as the stream source, and `cloudFiles.format` separately specifies the data file format (e.g., JSON, CSV, Parquet) to parse within Auto Loader

> [!success]- Answer
> **Correct Answer: D**
>
> Auto Loader requires `.format("cloudFiles")` on the DataStreamReader to identify the source as Auto Loader. The `cloudFiles.format` option then tells Auto Loader which file format parser to use for the actual data files. These are not competing settings but operate at different levels: one selects the streaming source, the other configures it. Using `.format("json")` directly would bypass Auto Loader entirely and use the standard file stream source.

---

### Question 15

**Scenario**: A multi-hop (Bronze/Silver/Gold) architecture ingests raw event data into Bronze, then applies transformations and quality checks into Silver. Some records arrive with missing required fields, malformed timestamps, or unexpected data types. The team wants to avoid data loss while maintaining data quality in downstream layers.

**Question**: Where in the multi-hop architecture should malformed data be handled to balance data quality and completeness?

A) At the Gold layer, since business logic determines what is valid
B) At the Bronze-to-Silver transition, where data quality rules quarantine bad records to a separate "quarantine" table while valid records proceed to Silver
C) At ingestion into Bronze, rejecting any records that do not pass schema validation
D) Malformed data should be silently dropped at every layer to maintain clean tables

> [!success]- Answer
> **Correct Answer: B**
>
> The Bronze-to-Silver transition is the standard point for data quality enforcement in a multi-hop architecture. Bronze stores raw data as-is for auditability and replay. At the Silver layer, quality rules validate, clean, and route malformed records to a quarantine table for investigation. Option C risks data loss at ingestion, and Option D provides no visibility into data quality issues.

---

### Question 16

**Scenario**: A data engineer adds a `CHECK` constraint to an existing Delta table with 500 million rows: `ALTER TABLE orders ADD CONSTRAINT positive_amount CHECK (amount > 0)`. The table currently contains 200 rows where `amount` is 0 or negative.

**Question**: What happens when this `ALTER TABLE ADD CONSTRAINT` statement is executed?

A) The constraint is added and the 200 violating rows are automatically deleted
B) The constraint is added successfully but only enforced on future writes; existing rows are not validated
C) The statement fails because existing rows violate the constraint, and the constraint is not added until all violating data is removed or corrected
D) The constraint is added and the 200 violating rows are quarantined to a separate error table

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake validates all existing data against the CHECK constraint before adding it. If any rows violate the constraint, the `ALTER TABLE` statement fails and the constraint is not created. The engineer must first clean or remove the violating rows before the constraint can be added. This prevents the table from entering an inconsistent state with a constraint that existing data already violates.

---

### Question 17

**Scenario**: A data engineer is designing a streaming pipeline that reads from Kafka and writes to a Delta table. The team needs to understand the exactly-once guarantees provided by Structured Streaming with Delta Lake as the sink.

**Question**: What level of delivery guarantee does Structured Streaming provide with checkpointing and a Delta Lake sink?

A) Exactly-once end-to-end: Structured Streaming's checkpointing tracks offsets, and Delta Lake's transaction log ensures each micro-batch is committed atomically and idempotently, so replayed batches produce no duplicates
B) At-least-once: checkpointing tracks offsets but Delta Lake may write duplicate rows if a batch is replayed after a partial commit
C) At-most-once: if a failure occurs, the uncommitted batch is lost and processing resumes from the next offset
D) Exactly-once only if `foreachBatch()` is used with manual deduplication logic

> [!success]- Answer
> **Correct Answer: A**
>
> Structured Streaming with checkpointing and a Delta Lake sink provides exactly-once end-to-end guarantees. The checkpoint records which offsets have been processed, and Delta Lake's transaction log ensures that write operations are atomic and idempotent. If a micro-batch is replayed after failure, Delta detects the duplicate commit and does not write the data again.

---

### Question 18

**Scenario**: A daily batch pipeline uses `MERGE` to upsert fact records from a staging table into a target fact table. The fact table joins to a `dim_product` dimension table. Occasionally, new products appear in the fact staging data before they have been added to the dimension table, causing foreign key mismatches.

**Question**: What is the recommended pattern for handling late-arriving dimension data in an incremental batch pipeline?

A) Delay the fact table MERGE until all dimension tables are fully loaded, using a job dependency that blocks the fact pipeline
B) Reject fact records with unknown dimension keys by filtering them out before the MERGE, accepting the data loss
C) Use a surrogate key of -1 for unknown dimensions and update the fact records later when the dimension arrives, but this requires a second pass over the data
D) Insert fact records with the unknown dimension key, place those records into an "early-arriving facts" holding table, and reprocess them in the next pipeline run after the dimension has been loaded

> [!success]- Answer
> **Correct Answer: D**
>
> The early-arriving facts pattern captures fact records whose dimension keys are not yet available in a holding (or error) table, then reprocesses them in subsequent runs once the dimension data has arrived. This avoids data loss (Option B), avoids tight pipeline coupling and delays (Option A), and avoids the complexity of placeholder surrogate keys that must be corrected later (Option C).

---

[Back to Exam Overview](./README.md) | [Next: Databricks Tooling](02-databricks-tooling.md)
