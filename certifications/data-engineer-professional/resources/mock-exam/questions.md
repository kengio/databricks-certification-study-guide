---
tags:
  - databricks
  - certification
  - data-engineer
  - mock-exam
aliases:
  - Mock Exam Questions
---

# Mock Exam — Databricks Data Engineer Professional

63 scenario-based questions matching the exam's section weights. Attempt all questions before revealing answers.

**Total: 63 questions | Time: 120 minutes | Passing: 70% (44/63)**

[← Back to Mock Exam](./README.md)

---

## Section 1: Data Processing (Questions 1–18)

## Question 1 *(Easy)*

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

## Question 2 *(Medium)*

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

## Question 3 *(Hard)*

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

## Question 4 *(Medium)*

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

## Question 5 *(Medium)*

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

## Question 6 *(Medium)*

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

## Question 7 *(Medium)*

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

## Question 8 *(Medium)*

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

## Question 9 *(Medium)*

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

## Question 10 *(Easy)*

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

## Question 11 *(Medium)*

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

## Question 12 *(Hard)*

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

## Question 13 *(Hard)*

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

## Question 14 *(Easy)*

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

## Question 15 *(Medium)*

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

## Question 16 *(Easy)*

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

## Question 17 *(Medium)*

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

## Question 18 *(Hard)*

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

## Section 2: Databricks Tooling (Questions 19–30)

## Question 19 *(Medium)*

**Scenario**: A data engineer is creating a notebook that should accept runtime parameters for the environment (dev, staging, prod) and a date range. The notebook will be called both interactively during development and by a scheduled job.

**Question**: Which approach correctly implements parameterization for both use cases?

A) Use `dbutils.widgets.text()` with defaults that can be overridden by job parameters
B) Use environment variables set at cluster startup
C) Use `spark.conf.get()` to read parameters from cluster configuration
D) Hard-code values and create separate notebooks for each environment

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.widgets` creates parameters with defaults for interactive use that can be overridden when called from jobs using the notebook task parameters. Option B requires cluster configuration. Option C requires cluster-level settings. Option D is unmaintainable.

---

## Question 20 *(Medium)*

**Scenario**: A notebook needs to execute SQL queries and store the results in a Python variable for further processing. The data engineer wants to use the most appropriate magic command.

**Question**: Which approach correctly captures SQL results in a Python variable?

A) Use `%sql` and reference the `_sqldf` variable
B) Use `%sql` with `INTO :variable_name` syntax
C) Use `spark.sql()` and assign to a variable
D) Use `%run` to execute a SQL notebook and capture results

> [!success]- Answer
> **Correct Answer: C**
>
> `spark.sql("SELECT ...")` returns a DataFrame that can be assigned to a variable for further processing in Python. This is the recommended programmatic approach. Option A's `_sqldf` does exist in Databricks notebooks (it captures the last %sql result) but is implicit and less reliable for production code. Option B has invalid syntax. Option D doesn't capture SQL results.

---

## Question 21 *(Easy)*

**Scenario**: A data engineer needs to securely access a third-party API from a Databricks notebook. The API requires an authentication token that should not be stored in code or version control.

**Question**: Which approach correctly implements secure credential management?

A) Store the token in a notebook cell and delete it after running
B) Store the token in a Delta table with restricted access
C) Use environment variables on the cluster
D) Use `dbutils.secrets.get(scope="api_scope", key="api_token")`

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Secrets provides secure credential storage with access control. Secrets are encrypted at rest and redacted in logs. Option A exposes secrets in notebook history. Option B is not designed for secrets. Option C requires cluster admin access and isn't as secure.

---

## Question 22 *(Easy)*

**Scenario**: A team maintains a library of shared utility functions used across multiple notebooks. When the library is updated, all notebooks using it should automatically get the latest version without modification.

**Question**: Which approach provides centralized code sharing with automatic updates?

A) Copy utility functions into each notebook
B) Use `%run /Workspace/Shared/utilities` at the start of each notebook
C) Package utilities as a wheel file and install via `%pip install`
D) Store utilities in a Delta table and read them at runtime

> [!success]- Answer
> **Correct Answer: B**
>
> `%run` executes another notebook in the current notebook's context, making all its functions available. Changes to the shared notebook are immediately available to all callers. Option A requires manual updates. Option C requires reinstallation for updates. Option D is impractical for code.

---

## Question 23 *(Medium)*

**Scenario**: A data engineer is configuring the Databricks CLI for a CI/CD pipeline. The pipeline runs in a containerized environment where storing credentials in `~/.databrickscfg` is not practical.

**Question**: Which authentication method is most appropriate for this CI/CD scenario?

A) OAuth user-to-machine authentication
B) Personal access token stored in `DATABRICKS_TOKEN` environment variable
C) Service principal with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET`
D) Username and password authentication

> [!success]- Answer
> **Correct Answer: C**
>
> Service principals with OAuth are the recommended approach for CI/CD automation. They provide machine identity without personal credentials and can be scoped with specific permissions. Option A requires user interaction. Option B uses personal tokens that expire. Option D is deprecated.

---

## Question 24 *(Medium)*

**Scenario**: A REST API call to create a cluster returns successfully with a cluster_id. However, a subsequent API call to run a job on that cluster fails with "Cluster not found."

**Question**: What is the most likely cause and solution?

A) The cluster creation is asynchronous; poll the cluster status until it's RUNNING
B) The API token doesn't have permission to access the cluster
C) The cluster_id was not properly formatted in the job request
D) Rate limiting is preventing the second API call

> [!success]- Answer
> **Correct Answer: A**
>
> Cluster creation via API returns immediately with a cluster_id, but the cluster takes time to provision. The job API call failed because the cluster wasn't ready yet. The solution is to poll `GET /api/2.0/clusters/get` until state is RUNNING. Options B-D are possible but less likely given the described sequence.

---

## Question 25 *(Medium)*

**Scenario**: A team is deciding between all-purpose clusters and job clusters for their production ETL workloads that run on a schedule four times daily.

**Question**: Which recommendation optimizes for cost while maintaining reliability?

A) Use all-purpose clusters with auto-termination to save costs
B) Use a shared all-purpose cluster across all jobs to maximize utilization
C) Use serverless compute for all jobs regardless of workload characteristics
D) Use job clusters which are automatically created and terminated per job run

> [!success]- Answer
> **Correct Answer: D**
>
> Job clusters are created for each job run and terminated afterward, providing cost savings (lower DBU rates) and isolation between runs. Option A still has higher DBU rates. Option B risks resource contention and failures affecting multiple jobs. Option C may not be cost-effective for predictable scheduled workloads.

---

## Question 26 *(Medium)*

**Scenario**: A data engineer needs to list all files in a Unity Catalog volume and filter for Parquet files created in the last 24 hours.

**Question**: Which approach correctly accesses Unity Catalog volumes?

A) `dbutils.fs.ls("dbfs:/Volumes/catalog/schema/volume")`
B) `dbutils.fs.ls("/Volumes/catalog/schema/volume")`
C) `spark.read.format("binaryFile").load("dbfs:/Volumes/catalog/schema/volume")`
D) `os.listdir("/dbfs/Volumes/catalog/schema/volume")`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog volumes are accessed via the `/Volumes` path without the `dbfs:` prefix. Option A uses the wrong path format. Option C reads file content, not metadata. Option D may work but `dbutils.fs` is the recommended approach for Databricks.

---

## Question 27 *(Easy)*

**Scenario**: A notebook widget is created with `dbutils.widgets.dropdown("env", "dev", ["dev", "staging", "prod"])`. When the notebook runs as part of a job, the job needs to override this value to "prod".

**Question**: How should the job task be configured to pass the parameter?

A) In the notebook task configuration, set `base_parameters: {"env": "prod"}`
B) Set cluster environment variable `ENV=prod`
C) Use `spark.conf.set("env", "prod")` in the job configuration
D) Create a separate notebook for production without widgets

> [!success]- Answer
> **Correct Answer: A**
>
> The notebook task's `base_parameters` map directly to widget values, overriding defaults when the notebook runs as a job. Option B doesn't connect to widgets. Option C sets Spark config, not widget values. Option D is unmaintainable.

---

## Question 28 *(Medium)*

**Scenario**: A data engineer is using the Jobs API 2.1 to submit a job run. The job includes a notebook task that accepts parameters. The engineer wants to pass dynamic values based on the current date.

**Question**: Which API endpoint and request body correctly submits this job run?

A) POST `/api/2.1/jobs/create` with `notebook_params` in the request
B) PUT `/api/2.1/jobs/update` with `notebook_params` in the settings
C) POST `/api/2.1/jobs/runs/submit` with `notebook_params` in the task configuration
D) POST `/api/2.1/jobs/run-now` with `notebook_params` in the request

> [!success]- Answer
> **Correct Answer: D**
>
> `run-now` triggers an existing job with parameter overrides via `notebook_params`. Option A creates a job definition but doesn't run it. Option C submits a one-time run (requires full job spec). Option B updates job definition, doesn't run it.

---

## Question 29 *(Medium)*

**Scenario**: A team is migrating from DBFS mounts to Unity Catalog external locations. Their existing code uses paths like `dbfs:/mnt/data/bronze/`.

**Question**: What is the recommended migration approach for accessing cloud storage with Unity Catalog?

A) Update all paths to use `abfss://` or `s3://` URLs directly
B) Create external locations in Unity Catalog and use `/Volumes/` paths
C) Keep using mounts but register them as external locations
D) Use storage credentials to access cloud storage via `dbutils.fs`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog volumes provide governed access to cloud storage with paths like `/Volumes/catalog/schema/volume/`. External locations and volumes replace the ungoverned mount pattern. Option A bypasses governance. Option C mixes patterns incorrectly. Option D doesn't leverage Unity Catalog.

---

## Question 30 *(Medium)*

**Scenario**: A data engineer needs to run a SQL query from the Databricks CLI and output the results as JSON for processing by another script.

**Question**: Which CLI command correctly executes a SQL query and formats output as JSON?

A) `databricks sql execute --query "SELECT * FROM table" --format JSON`
B) `databricks workspace execute-sql --statement "SELECT * FROM table" --output json`
C) `databricks sql-cli -e "SELECT * FROM table" -o json`
D) `databricks api post /api/2.0/sql/statements -d '{"statement": "SELECT * FROM table"}'`

> [!success]- Answer
> **Correct Answer: D**
>
> The Databricks CLI can make arbitrary API calls. The SQL Statement Execution API (`/api/2.0/sql/statements`) executes SQL queries programmatically. Options A-C use non-existent CLI commands. The actual implementation may vary by CLI version, but the API approach always works.

---

## Section 3: Data Modeling (Questions 31–39)

## Question 31 *(Easy)*

**Scenario**: A retail company is implementing the medallion architecture. Raw point-of-sale data arrives as JSON files with nested structures containing transaction details and line items.

**Question**: Which layer should handle flattening the nested JSON structure into a relational format?

A) Bronze layer - ingest and flatten immediately
B) Gold layer - create denormalized tables for analytics
C) Silver layer - transform raw data into cleaned, conformed structures
D) A separate staging layer before bronze

> [!success]- Answer
> **Correct Answer: C**
>
> The silver layer is responsible for data cleansing and conforming, including flattening nested structures. Bronze should preserve raw data as-is for auditability. Gold focuses on business aggregations. Option D adds unnecessary complexity.

---

## Question 32 *(Easy)*

**Scenario**: A Delta table has a column `email` defined as `STRING NOT NULL`. A new data file arrives containing records with null email values.

**Question**: What happens when this data is written to the table?

A) Null values are converted to empty strings
B) The write fails with a constraint violation error
C) Records with null emails are silently dropped
D) The NOT NULL constraint is automatically removed

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake enforces NOT NULL constraints at write time. Attempting to write null values to a NOT NULL column causes the entire write operation to fail with an error. Options A, C, and D describe behaviors that don't occur.

---

## Question 33 *(Medium)*

**Scenario**: A data engineer needs to add a new column `loyalty_tier` to an existing Delta table with millions of records. The column should be nullable and positioned after the `customer_id` column.

**Question**: Which statement correctly adds this column?

A) `ALTER TABLE customers ADD COLUMN loyalty_tier STRING AFTER customer_id`
B) `ALTER TABLE customers ADD COLUMNS (loyalty_tier STRING AFTER customer_id)`
C) `ALTER TABLE customers ADD COLUMN loyalty_tier STRING` (column position cannot be specified)
D) Table must be recreated to add a column at a specific position

> [!success]- Answer
> **Correct Answer: A**
>
> Delta Lake supports column positioning with `FIRST` or `AFTER` clauses in ADD COLUMN statements. The syntax `ALTER TABLE ADD COLUMN column_name TYPE AFTER existing_column` correctly positions the new column. Option B uses incorrect syntax (COLUMNS instead of COLUMN with positioning). Option C is incorrect because position CAN be specified. Option D is unnecessary since ADD COLUMN with AFTER is supported.

---

## Question 34 *(Easy)*

**Scenario**: A slowly changing dimension table tracks customer addresses with SCD Type 2 implementation. The table has columns: customer_id, address, start_date, end_date, is_current. A customer changes their address.

**Question**: How many rows should be affected by this single address change?

A) 1 row (update the existing record)
B) 2 rows (close old record, insert new record)
C) 3 rows (update old, insert new, update audit table)
D) Depends on the number of historical records for that customer

> [!success]- Answer
> **Correct Answer: B**
>
> SCD Type 2 handles changes by: (1) closing the current record (setting end_date and is_current=false) and (2) inserting a new record with the new address (is_current=true). This affects exactly 2 rows. Option A describes SCD Type 1. Options C and D describe non-standard implementations.

---

## Question 35 *(Hard)*

**Scenario**: A fact table containing 5 years of transaction data is partitioned by `transaction_date`. Most queries filter on `customer_id` and `product_id`, rarely filtering on date. Query performance is poor.

**Question**: What modification would most improve query performance?

A) Add more partitions by also partitioning on `customer_id`
B) Remove date partitioning and use Z-ORDER on `customer_id, product_id`
C) Keep date partitioning and add Z-ORDER on `customer_id, product_id`
D) Convert to Liquid Clustering on `customer_id, product_id`

> [!success]- Answer
> **Correct Answer: D**
>
> Liquid Clustering on the frequently filtered columns provides automatic data organization and maintenance. Since queries rarely filter on date, date partitioning provides little benefit. Option B loses time-based data management benefits. Option C combines both but has more maintenance overhead than liquid clustering. Option A creates too many small partitions.

---

## Question 36 *(Medium)*

**Scenario**: A data engineer is implementing a Delta table for product catalog data. Products are frequently updated, and analysts need to see what the catalog looked like at any point in the past 30 days.

**Question**: Which Delta Lake feature and configuration supports this requirement?

A) Enable Change Data Feed to track all changes
B) Create a separate history table with trigger-based logging
C) Time travel with default retention (30 days log retention)
D) Use Delta Lake versioning with `delta.logRetentionDuration = 30 days`

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake's time travel allows querying historical versions using `VERSION AS OF` or `TIMESTAMP AS OF`. The default 30-day log retention supports this requirement. Option A tracks changes but doesn't provide point-in-time queries. Option B is unnecessary given Delta's built-in capabilities. Option D describes the feature partially but misses that it's the default behavior.

---

## Question 37 *(Medium)*

**Scenario**: A table has schema evolution enabled with `mergeSchema = true`. The source data occasionally includes columns with names that differ from existing columns only by case (e.g., "CustomerId" vs "customerid").

**Question**: What is the default behavior in Delta Lake and how can it be controlled?

A) Delta is case-insensitive by default; both names map to the same column
B) Delta is case-sensitive by default; they become separate columns
C) Delta throws an error on case conflicts
D) Delta automatically renames conflicting columns with suffixes

> [!success]- Answer
> **Correct Answer: A**
>
> By default, Delta Lake (following Spark SQL) treats column names as case-insensitive. "CustomerId" and "customerid" refer to the same column. This behavior can be changed with `spark.sql.caseSensitive = true`. Options B, C, and D describe non-default behaviors.

---

## Question 38 *(Easy)*

**Scenario**: A deep clone of a production Delta table is created for a testing environment. After the clone, updates are made to both the production table and the clone.

**Question**: How do changes to the production table affect the cloned table?

A) Changes automatically propagate to the clone
B) Changes propagate until the clone is modified, then it becomes independent
C) Only schema changes propagate; data changes don't
D) The clone is completely independent; changes don't propagate

> [!success]- Answer
> **Correct Answer: D**
>
> Deep clone creates a completely independent copy with its own data files. After cloning, both tables evolve independently. No changes propagate between them. Option A describes linked tables, not clones. Options B and C describe behaviors that don't exist.

---

## Question 39 *(Medium)*

**Scenario**: A dimension table needs to track corrections to historical records. When an error is discovered in a past record, the correction should be applied, but there must also be an audit trail showing the original incorrect value.

**Question**: Which SCD type best supports this requirement?

A) SCD Type 1 with a separate audit log table
B) SCD Type 2 with effective dates
C) SCD Type 3 with previous value columns
D) SCD Type 6 (hybrid) with Type 1, 2, and 3 elements

> [!success]- Answer
> **Correct Answer: A**
>
> For corrections (not legitimate changes), SCD Type 1 updates the current value while a separate audit log table preserves the history of corrections. Type 2 is for legitimate business changes, not error corrections. Type 3 only tracks one previous value. Type 6 is complex and not specifically designed for corrections.

---

## Section 4: Security & Governance (Questions 40–45)

## Question 40 *(Medium)*

**Scenario**: A data engineering team needs to grant a group of analysts SELECT access to all tables in a schema, including tables that will be created in the future.

**Question**: Which Unity Catalog permission model correctly implements this requirement?

A) Grant SELECT on each table individually as they're created
B) Create a view for each table and grant SELECT on views only
C) Grant SELECT on the catalog to give access to all schemas and tables
D) Grant USE SCHEMA and SELECT on SCHEMA to give access to all current and future tables

> [!success]- Answer
> **Correct Answer: D**
>
> Granting SELECT at the schema level provides access to all current and future tables in that schema. USE SCHEMA is required to access objects within the schema. Option A requires ongoing maintenance. Option C is too broad. Option B is unnecessarily complex.

---

## Question 41 *(Medium)*

**Scenario**: A table contains employee data including salary information. The HR department should see all columns, but managers should only see employee name, department, and title--not salary.

**Question**: Which Unity Catalog feature implements this column-level security requirement?

A) Create separate tables for HR and managers with different columns
B) Use dynamic views with `is_account_group_member()` to filter columns
C) Use column masks to hide salary for non-HR users
D) Implement application-level security in the BI tool

> [!success]- Answer
> **Correct Answer: C**
>
> Column masks in Unity Catalog apply functions to column values based on the querying user's permissions, showing the real value to authorized users and masked/null values to others. Option A creates data duplication. Option B requires view maintenance. Option D doesn't protect data at the source.

---

## Question 42 *(Easy)*

**Scenario**: An organization wants to share a curated dataset with an external partner who uses Snowflake. The partner should receive daily updates but should not have direct access to the Databricks workspace.

**Question**: Which feature enables secure data sharing with external organizations?

A) Create a service principal for the partner to access via API
B) Use Delta Sharing to share data via open protocol
C) Export data daily to a shared cloud storage location
D) Create a Databricks workspace for the partner with access to the dataset

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Sharing provides an open protocol for secure data sharing across organizations and platforms. Partners can use compatible clients (including Snowflake, Spark, pandas) without Databricks access. Option A requires workspace access. Option C requires file transfer management. Option D is costly and requires Databricks licenses.

---

## Question 43 *(Easy)*

**Scenario**: A data engineer is building a notebook that needs to access credentials for an external database. The credentials are stored in Azure Key Vault, which has been configured as a secret backend.

**Question**: Which code correctly retrieves the database password?

A) `dbutils.secrets.get(scope="keyvault-scope", key="db-password")`
B) `spark.conf.get("azure.keyvault.db-password")`
C) `dbutils.credentials.get("keyvault-scope", "db-password")`
D) `%keyvault get db-password`

> [!success]- Answer
> **Correct Answer: A**
>
> When Azure Key Vault is configured as a secret scope backend, secrets are accessed through `dbutils.secrets.get()` using the scope name and key name. The Key Vault integration is transparent to the code. Options B, C, and D use invalid syntax.

---

## Question 44 *(Easy)*

**Scenario**: A Unity Catalog metastore is shared across multiple workspaces. A user has SELECT permission on a table granted in Workspace A. The same user accesses Workspace B.

**Question**: What permissions does the user have on that table in Workspace B?

A) No permissions; grants are workspace-specific
B) Same SELECT permission; Unity Catalog permissions are centralized
C) Read-only permissions with a warning about cross-workspace access
D) Permissions depend on workspace-level settings

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog provides centralized governance across all workspaces attached to the same metastore. Permissions granted on objects apply regardless of which workspace is used to access them. This is a key benefit of Unity Catalog over legacy Hive metastore.

---

## Question 45 *(Hard)*

**Scenario**: A healthcare organization needs to implement row-level security so that doctors can only see records for patients assigned to them. The patient_assignments table maps doctors to patients.

**Question**: Which approach correctly implements this row-level security in Unity Catalog?

A) Add a row filter using `ROW FILTER filter_function ON (patient_id)`
B) Create dynamic views with `WHERE doctor_id = current_user()`
C) Use column masks to hide rows from unauthorized users
D) Implement filtering in the application layer only

> [!success]- Answer
> **Correct Answer: A**
>
> Unity Catalog row filters apply a function that determines which rows each user can access based on their identity. The filter function can join with assignment tables to implement complex rules. Option B works but requires view maintenance. Option C is for column security, not row security. Option D doesn't protect data at the source.

---

## Section 5: Monitoring & Logging (Questions 46–51)

## Question 46 *(Easy)*

**Scenario**: A cost analyst needs to identify which jobs consumed the most DBUs last month to optimize spending.

**Question**: Which system table provides this billing information?

A) `system.compute.clusters`
B) `system.access.audit`
C) `system.billing.usage`
D) `system.workflow.jobs`

> [!success]- Answer
> **Correct Answer: C**
>
> The `system.billing.usage` table contains detailed DBU consumption data by workspace, cluster, and SKU. It's the primary source for cost analysis. Option A has cluster metadata. Option B has security audit logs. Option D has job definitions, not cost data.

---

## Question 47 *(Medium)*

**Scenario**: A streaming job is running slower than expected. The Spark UI shows that one task in a stage takes 10x longer than the others, while most executors sit idle.

**Question**: What does this pattern indicate and what is the recommended solution?

A) Insufficient executors; increase cluster size
B) Data skew; enable AQE skew join handling or salt the skewed key
C) Memory pressure; increase executor memory
D) Network bottleneck; check cluster networking

> [!success]- Answer
> **Correct Answer: B**
>
> One slow task with idle executors is the classic sign of data skew--one partition has much more data than others. AQE can automatically split skewed partitions, or you can manually salt keys. Option A wouldn't help if executors are idle. Options C and D show different symptoms.

---

## Question 48 *(Medium)*

**Scenario**: A Lakeflow (DLT) pipeline shows "Update Failed" status. The data engineer needs to identify which specific expectation caused the failure.

**Question**: Which approach retrieves the expectation violation details?

A) Check the cluster driver logs
B) Review the pipeline settings in the UI
C) Use `dbutils.pipelines.getLatestUpdate()` API
D) Query the pipeline's event log table for expectation metrics

> [!success]- Answer
> **Correct Answer: D**
>
> DLT stores detailed metrics including expectation results in the event log. Querying the event log with filters for the update ID shows which expectations failed and the row counts. Option A has limited detail. Option C isn't a valid API. Option B shows configuration, not runtime details.

---

## Question 49 *(Medium)*

**Scenario**: A data engineer needs to understand why a SQL query is performing a full table scan despite having filters that should enable partition pruning.

**Question**: Which tool reveals whether partition pruning is occurring?

A) Run `ANALYZE TABLE` to update statistics
B) Check the Query History for execution time breakdown
C) Run `EXPLAIN` and check for `PartitionFilters` in the plan
D) Review the table's `DESCRIBE DETAIL` output

> [!success]- Answer
> **Correct Answer: C**
>
> `EXPLAIN` shows the query execution plan including `PartitionFilters` (pruned partitions) and `PushedFilters` (filters pushed to scan). Empty `PartitionFilters` indicates no pruning occurred. Option A updates statistics but doesn't show the plan. Options B and D don't show execution details.

---

## Question 50 *(Easy)*

**Scenario**: The security team requests a report of all users who accessed a specific table containing PII data in the last 7 days.

**Question**: Which system table contains this access information?

A) `system.billing.usage`
B) `system.access.audit`
C) `system.information_schema.tables`
D) `system.compute.clusters`

> [!success]- Answer
> **Correct Answer: B**
>
> The `system.access.audit` table contains audit logs of actions including table reads, with user identity and timestamp. Filter by `action_name` and `request_params` for table access events. Option A has billing data. Option C has table metadata. Option D has cluster info.

---

## Question 51 *(Medium)*

**Scenario**: A batch job's execution time has gradually increased from 30 minutes to 2 hours over the past month. The code hasn't changed.

**Question**: Which factors should be investigated first?

A) Data volume growth and partition sizing
B) Cluster hardware degradation
C) Changes to Databricks Runtime
D) Network latency to cloud storage

> [!success]- Answer
> **Correct Answer: A**
>
> Gradual performance degradation with unchanged code typically indicates data volume growth or small file accumulation (affecting read performance). Check table sizes, file counts, and partition strategies. Option B is unlikely to be gradual. Options C and D would cause immediate changes, not gradual.

---

## Section 6: Testing & Deployment (Questions 52–57)

## Question 52 *(Easy)*

**Scenario**: A data engineering team is setting up Databricks Asset Bundles (DAB) for their project. They need separate configurations for development, staging, and production environments.

**Question**: Which `databricks.yml` structure correctly defines these environments?

A) Create separate `databricks-dev.yml`, `databricks-staging.yml`, `databricks-prod.yml` files
B) Use `environments:` section with runtime variable substitution
C) Use `targets:` section with `dev:`, `staging:`, and `prod:` subsections
D) Create separate bundles for each environment in different directories

> [!success]- Answer
> **Correct Answer: C**
>
> DAB uses a `targets:` section to define environment-specific configurations. Each target can override bundle settings like workspace host, cluster configs, and variables. Option A doesn't support DAB's inheritance model. Option B uses invalid syntax. Option D duplicates code.

---

## Question 53 *(Medium)*

**Scenario**: A CI/CD pipeline runs unit tests on PySpark code that transforms DataFrames. The tests should run quickly without requiring a Databricks cluster.

**Question**: Which testing approach is most appropriate?

A) Deploy code to a Databricks cluster and run tests remotely
B) Skip unit tests and rely on integration tests only
C) Use Nutter framework with Databricks Connect
D) Use local Spark session in pytest with mocked data

> [!success]- Answer
> **Correct Answer: D**
>
> Local Spark sessions in pytest allow fast unit tests without cluster costs or dependencies. Mock DataFrames test transformation logic efficiently. Option A is slow and costly for unit tests. Option C still requires cluster resources. Option B misses the value of unit testing.

---

## Question 54 *(Easy)*

**Scenario**: A Git folder in Databricks is configured with main branch protection. A developer tries to push directly to main and receives an error.

**Question**: What is the recommended workflow for making changes?

A) Create a feature branch, commit changes, and create a pull request
B) Disable branch protection temporarily to push changes
C) Use `%git` magic commands to force push to main
D) Make changes in a separate notebook outside Git folders

> [!success]- Answer
> **Correct Answer: A**
>
> The standard Git workflow with branch protection: create a feature branch, make changes, push, create PR for review, then merge to main after approval. This ensures code review and testing. Options B and C bypass protections. Option D loses version control benefits.

---

## Question 55 *(Medium)*

**Scenario**: A GitHub Actions workflow deploys Databricks Asset Bundles to a staging environment. The workflow needs to authenticate with Databricks.

**Question**: Which authentication method is recommended for GitHub Actions?

A) Store personal access token in GitHub Secrets
B) Configure OIDC federation between GitHub and Databricks with service principal
C) Use username and password stored in GitHub Secrets
D) Create a dedicated user account for GitHub Actions

> [!success]- Answer
> **Correct Answer: B**
>
> OIDC federation with service principals is the recommended approach for CI/CD authentication. GitHub Actions can authenticate using short-lived tokens without storing long-lived credentials. Option A uses personal tokens that expire. Option C is deprecated. Option D creates management overhead.

---

## Question 56 *(Medium)*

**Scenario**: A Nutter test notebook tests a function that reads from a Delta table. The test should verify the function handles empty tables correctly.

**Question**: Which Nutter pattern correctly implements this test case?

A) Create an empty table in `before_all()` and clean up in `after_all()`
B) Use `assertion_empty_table()` with the expected result
C) Mock the Delta table read using `unittest.mock`
D) Use Nutter's built-in empty table generator

> [!success]- Answer
> **Correct Answer: A**
>
> Nutter's `before_all()` runs setup before tests (create empty test table), and `after_all()` runs cleanup (drop table). The actual test verifies behavior with the empty table. Option B isn't a Nutter method. Option C is complex within Nutter. Option D doesn't exist.

---

## Question 57 *(Medium)*

**Scenario**: A bundle deployment fails with the error: "Resource already exists". The data engineer confirms the resource was created by a previous partial deployment.

**Question**: What is the correct approach to resolve this and complete the deployment?

A) Manually delete the resource and redeploy
B) Update the resource name in databricks.yml to avoid conflict
C) Run `databricks bundle destroy` then `databricks bundle deploy`
D) Run `databricks bundle deploy --force` to overwrite

> [!success]- Answer
> **Correct Answer: D**
>
> The `--force` flag allows DAB to take ownership of and update existing resources that match the bundle definition. This handles partial deployments gracefully. Option A risks missing dependent resources. Option C destroys everything unnecessarily. Option B changes the deployment, not fixing it.

---

## Section 7: Lakeflow Pipelines & Performance (Questions 58–63)

## Question 58 *(Medium)*

**Scenario**: A Lakeflow (DLT) pipeline has a streaming table that ingests data and a downstream materialized view that aggregates it. The materialized view is showing stale data even though the streaming table is updating.

**Question**: What is the most likely cause?

A) The pipeline is configured for triggered execution, not continuous
B) Materialized views don't automatically refresh from streaming tables
C) There's a data type mismatch between the tables
D) The materialized view requires a manual REFRESH command

> [!success]- Answer
> **Correct Answer: A**
>
> In triggered execution mode, materialized views only refresh when the pipeline runs. For near real-time updates, use continuous mode or schedule frequent pipeline runs. In continuous mode, materialized views refresh as streaming tables update. Options B and D are incorrect; DLT handles refreshes automatically within pipeline runs. Option C would cause errors, not stale data.

---

## Question 59 *(Medium)*

**Scenario**: A DLT pipeline implements CDC from a source database using APPLY CHANGES. Some records are arriving with out-of-order timestamps due to source system behavior.

**Question**: How does APPLY CHANGES handle out-of-order records by default?

A) Records are processed in arrival order, ignoring timestamps
B) Records are processed by sequence column; out-of-order records are dropped
C) Records are processed by sequence column; out-of-order records update if sequence is higher
D) The pipeline fails on out-of-order detection

> [!success]- Answer
> **Correct Answer: C**
>
> APPLY CHANGES uses the SEQUENCE BY column to determine record order. If a later-arriving record has a higher sequence value than the current record, it updates the target. Records with lower sequence values than existing records are ignored (as they represent older data). This handles out-of-order arrival correctly.

---

## Question 60 *(Medium)*

**Scenario**: A DLT pipeline has an expectation `CONSTRAINT valid_amount EXPECT (amount > 0) ON VIOLATION DROP ROW`. After processing, the engineer wants to know how many rows were dropped.

**Question**: How can the dropped row count be retrieved?

A) Check the `dropped_records` column in the target table
B) Dropped rows are not tracked; add manual logging
C) Run `DESCRIBE HISTORY` on the target table
D) Query the pipeline event log for expectation metrics

> [!success]- Answer
> **Correct Answer: D**
>
> DLT stores detailed expectation metrics in the event log including `num_dropped_records` for each expectation. Query the event log filtering for expectation events. Option A doesn't exist. Option C shows Delta operations, not expectation details. Option B is incorrect; DLT tracks this automatically.

---

## Question 61 *(Medium)*

**Scenario**: A Delta table with 2TB of data has 50,000 small files averaging 40MB each. Queries scanning the table are slow due to file listing overhead.

**Question**: What is the optimal compaction strategy?

A) Run `OPTIMIZE` to compact files to the default 1GB target size
B) Run `VACUUM` to remove small files
C) Enable auto-compaction for future writes and run `OPTIMIZE` for existing files
D) Repartition the table with `spark.sql.shuffle.partitions = 2000`

> [!success]- Answer
> **Correct Answer: C**
>
> `OPTIMIZE` compacts existing small files into larger ones (target ~1GB). Enabling auto-compaction (`spark.databricks.delta.autoCompact.enabled`) prevents small files in future writes. Option B removes old files, not compaction. Option D affects partitions in processing, not file sizes.

---

## Question 62 *(Medium)*

**Scenario**: A query joins a 500GB fact table with a 50MB dimension table. The join is running slowly with significant shuffle.

**Question**: Which optimization would most improve this join performance?

A) Increase `spark.sql.shuffle.partitions` to 1000
B) Enable broadcast join by setting `spark.sql.autoBroadcastJoinThreshold = 100MB`
C) Z-ORDER the fact table by the join key
D) Partition both tables by the join key

> [!success]- Answer
> **Correct Answer: B**
>
> A 50MB dimension table is a good candidate for broadcast join (eliminates shuffle of the large fact table). Increasing the threshold from 10MB default to 100MB enables automatic broadcast. Option A doesn't reduce shuffle. Option C helps filters, not joins. Option D requires data redistribution.

---

## Question 63 *(Medium)*

**Scenario**: A data engineer is tuning a complex aggregation query that processes 100GB of data. The query runs out of memory during the shuffle phase.

**Question**: Which configuration change most likely resolves this issue?

A) Increase `spark.sql.shuffle.partitions` to create smaller partitions
B) Decrease `spark.memory.fraction` to leave more room for user objects
C) Enable `spark.sql.adaptive.enabled` for dynamic partition coalescing
D) Set `spark.executor.memoryOverhead` to 0 for maximum heap space

> [!success]- Answer
> **Correct Answer: A**
>
> OOM during shuffle typically means individual partitions are too large. Increasing shuffle partitions creates smaller partitions that fit in memory. Option B reduces available memory. Option C helps with small partitions, not OOM. Option D can cause off-heap OOM errors.

---

[← Back to Mock Exam](./README.md)
