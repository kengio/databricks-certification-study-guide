---
title: Data Engineer Associate Mock Exam 2 — Questions
type: mock-exam-questions
tags:
  - databricks
  - certification
  - data-engineer-associate
  - mock-exam
---

# Data Engineer Associate Mock Exam 2 — Questions

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## Databricks Lakehouse Platform (Questions 1–11)

---

## Question 1 *(Easy)*

A data engineer needs to store a small reference file that will be accessed by Spark jobs in a Databricks workspace. The file must be accessible from any cluster without additional mount configuration. Which storage location is most appropriate?

A) Cloud object storage (S3/ADLS) with manual mount configuration per cluster
B) DBFS (Databricks File System) root — automatically available on all clusters
C) Local disk of the driver node — fastest access for small files
D) Unity Catalog external volume with IAM role configuration

> [!success]- Answer
> **Correct Answer: B**
>
> DBFS (Databricks File System) is a distributed file system mounted on every Databricks cluster automatically. Files stored in DBFS root are accessible from any cluster in the workspace without additional configuration. Local driver disk is ephemeral and not accessible from other nodes. External volumes require Unity Catalog configuration.

---

## Question 2 *(Medium)*

A data engineer is choosing between a single-node cluster and a standard multi-node cluster for a machine learning training workload. When is a single-node cluster the appropriate choice?

A) When training large neural networks that require GPU acceleration
B) When running distributed Spark ML pipelines on terabyte-scale datasets
C) When using single-machine ML libraries like scikit-learn or running small experiments
D) When running production streaming pipelines that require high availability

> [!success]- Answer
> **Correct Answer: C**
>
> Single-node clusters run the Spark driver and executor on the same machine with no worker nodes. They are appropriate for single-machine libraries like scikit-learn, pandas, or small exploratory ML experiments that don't benefit from Spark's distributed processing. Large-scale Spark ML, streaming pipelines, and GPU workloads requiring failover all need multi-node clusters.

---

## Question 3 *(Easy)*

A data engineer wants to version control notebooks using Git and collaborate with teammates via pull requests. Which Databricks feature supports this workflow?

A) Databricks Archives — export notebooks to ZIP format for external storage
B) Databricks Repos — connects workspace folders to a remote Git repository
C) Databricks File System — stores notebook files in DBFS with version history
D) Databricks Workflows — tracks job run history as a proxy for code versions

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Repos integrates workspace folders directly with remote Git repositories (GitHub, GitLab, Azure DevOps, etc.). Engineers can commit, push, pull, create branches, and collaborate via pull requests without leaving the Databricks interface. DBFS does not provide version control. Workflows tracks job runs, not code changes.

---

## Question 4 *(Medium)*

An analyst notices that a Databricks SQL warehouse is taking 3 minutes to run the first query of the day but subsequent queries run in seconds. What is the most likely cause?

A) The warehouse is running out of memory after the first query
B) The warehouse has a cold start delay because the compute nodes were terminated during the idle period
C) The first query always runs as a dry run without caching
D) The SQL optimizer is recomputing all table statistics for the first query

> [!success]- Answer
> **Correct Answer: B**
>
> SQL warehouses auto-stop after an idle timeout (default 120 minutes) to save cost, which terminates the underlying compute. When a new query arrives, the warehouse must provision new compute nodes — a process that takes 2–5 minutes. Serverless SQL warehouses eliminate this cold start. Subsequent queries run fast because the cluster is already running.

---

## Question 5 *(Medium)*

A data engineer configures an all-purpose cluster with autoscaling between 2 and 8 workers. What determines when Databricks adds or removes worker nodes?

A) A fixed schedule defined by the engineer in cluster settings
B) Spark task queue depth — workers are added when tasks are pending and removed when idle
C) Memory usage only — workers are added when memory exceeds 80%
D) The engineer manually adjusts the worker count through the cluster UI

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks autoscaling monitors the Spark task queue and executor utilization. Workers are added when tasks are queued and waiting for executors. Workers are removed (scale down) after a period of executor idleness. Memory usage alone does not trigger autoscaling — it is based on task scheduling pressure.

---

## Question 6 *(Easy)*

A data engineer uses the `%run` magic command in a Databricks notebook. What does this command do?

A) Runs a shell command on the driver node
B) Executes another notebook in the current notebook's context, importing its variables and functions
C) Runs the current notebook as a background job
D) Executes SQL against the currently attached SQL warehouse

> [!success]- Answer
> **Correct Answer: B**
>
> `%run ./path/to/notebook` executes another notebook inline within the current notebook's execution context. All variables, functions, and classes defined in the called notebook become available in the calling notebook. This is commonly used to load utility functions or shared configurations. `%sh` runs shell commands. `%sql` executes SQL.

---

## Question 7 *(Medium)*

A Databricks SQL Pro warehouse is configured with a minimum of 1 cluster and a maximum of 5 clusters. A sudden spike brings 50 concurrent analysts running queries. What happens?

A) The warehouse queues all queries until the single cluster finishes current work
B) The warehouse scales up to 5 clusters to handle concurrent load, then scales down when demand drops
C) The warehouse fails with a capacity error and all 50 sessions are disconnected
D) Each analyst is automatically assigned a dedicated Classic warehouse

> [!success]- Answer
> **Correct Answer: B**
>
> Pro SQL warehouses support multi-cluster scaling. When one cluster reaches capacity, additional clusters spin up (up to the configured maximum of 5 clusters) to absorb concurrent load. When demand drops, excess clusters terminate automatically. Classic warehouses are single-cluster only. Serverless also supports auto-scaling.

---

## Question 8 *(Medium)*

A data engineer uses `dbutils.widgets.text("start_date", "2024-01-01")` in a notebook. What is the purpose of this widget?

A) Displays a text message at the top of the notebook output
B) Creates a parameterized input that can be overridden when running the notebook as a job
C) Creates a permanent database variable that persists across cluster restarts
D) Logs the value `"2024-01-01"` to the Databricks audit trail

> [!success]- Answer
> **Correct Answer: B**
>
> `dbutils.widgets` creates interactive input controls (text boxes, dropdowns, etc.) in the notebook UI. When the notebook is run as a Databricks Workflow job, the widget value can be overridden via job parameters or the `notebookParams` API. This makes notebooks parameterizable and reusable across different date ranges or environments.

---

## Question 9 *(Hard)*

A data engineer examines the Spark UI after a job completes and sees one task taking 10× longer than all other tasks. What does this indicate?

A) The cluster ran out of memory and had to spill to disk
B) A data skew problem — one partition contains significantly more data than others
C) The Photon engine failed to accelerate that specific task
D) Network latency caused a delay in fetching data from cloud storage

> [!success]- Answer
> **Correct Answer: B**
>
> A single slow task (stragglers) in the Spark UI typically indicates data skew — one partition has significantly more rows than others, causing one executor to do disproportionately more work. Solutions include salting keys, using `skewHint`, or repartitioning. Memory spill shows in the Spark UI as shuffle spill metrics, not as a single slow task.

---

## Question 10 *(Medium)*

A company migrates from an existing Hive metastore to Unity Catalog. What is the key advantage of Unity Catalog over the workspace-level Hive metastore?

A) Unity Catalog stores data in a different file format for better performance
B) Unity Catalog provides centralized governance, fine-grained access control, and data lineage across multiple workspaces
C) Unity Catalog eliminates the need for any access control configuration
D) Unity Catalog is faster because it uses an in-memory metadata cache

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog provides a centralized governance layer that spans multiple Databricks workspaces and accounts. It offers fine-grained table, column, and row-level security, automated data lineage tracking, and audit logs — none of which are available in the per-workspace Hive metastore. The metastore stores metadata; performance depends on the underlying data files.

---

## Question 11 *(Easy)*

A data engineer needs to run a Python script on a Databricks cluster that monitors a directory and triggers processing when new files arrive. Which `dbutils` module is used to interact with the file system?

A) `dbutils.secrets`
B) `dbutils.jobs`
C) `dbutils.fs`
D) `dbutils.notebook`

> [!success]- Answer
> **Correct Answer: C**
>
> `dbutils.fs` provides file system utilities for listing, moving, copying, and deleting files in DBFS and cloud storage paths. Common operations: `dbutils.fs.ls()`, `dbutils.fs.cp()`, `dbutils.fs.rm()`. `dbutils.secrets` manages credentials. `dbutils.notebook` runs and exits notebooks. `dbutils.jobs` is not a valid module.

---

## ELT with Spark SQL and Python (Questions 12–24)

---

## Question 12 *(Medium)*

A data engineer needs to replace all data in a partition of a Delta table with new data, without affecting other partitions. Which SQL command accomplishes this?

A) `DELETE FROM table WHERE partition_col = 'value'` followed by `INSERT INTO`
B) `INSERT OVERWRITE table PARTITION (partition_col = 'value') SELECT ...`
C) `TRUNCATE TABLE table` then `INSERT INTO table SELECT ...`
D) `CREATE OR REPLACE TABLE table AS SELECT ...`

> [!success]- Answer
> **Correct Answer: B**
>
> `INSERT OVERWRITE ... PARTITION (...)` replaces data in the specified partition atomically while leaving other partitions untouched. `TRUNCATE TABLE` removes all data from all partitions. `CREATE OR REPLACE TABLE` replaces the entire table. The `DELETE` + `INSERT` approach works but is not atomic — `INSERT OVERWRITE` is preferred for partition replacement.

---

## Question 13 *(Medium)*

A data engineer must choose between COPY INTO and Auto Loader for ingesting files from cloud storage. Which statement correctly describes when to use each?

A) COPY INTO is for structured files; Auto Loader is for unstructured files
B) COPY INTO is idempotent and suits smaller, known file sets; Auto Loader suits continuous, large-scale ingestion with automatic file tracking
C) Auto Loader is deprecated; COPY INTO is the only recommended approach
D) Both are equivalent — the choice is purely based on personal preference

> [!success]- Answer
> **Correct Answer: B**
>
> COPY INTO is a SQL command that idempotently loads files into a Delta table (skipping already-loaded files) — suitable for smaller or periodic batch loads from a known set of files. Auto Loader uses checkpointing and cloud notifications to efficiently handle millions of files continuously at scale, making it the recommended approach for streaming ingestion pipelines.

---

## Question 14 *(Easy)*

A data engineer has a column `price` stored as `STRING` type and needs to cast it to `DOUBLE` for calculations. Which SQL expression correctly performs this conversion?

A) `CONVERT(price, DOUBLE)`
B) `price::DOUBLE`
C) `CAST(price AS DOUBLE)`
D) `TO_DOUBLE(price)`

> [!success]- Answer
> **Correct Answer: C**
>
> `CAST(column AS type)` is the standard SQL syntax for type conversion in Databricks SQL and Spark SQL. Databricks also supports the shorthand `column::type` (PostgreSQL-style). `CONVERT()` is valid in some SQL dialects but not Databricks SQL. `TO_DOUBLE()` is not a Databricks function.

---

## Question 15 *(Medium)*

A data engineer writes `SELECT * FROM orders WHERE discount IS NOT NULL AND discount != 0`. A row with `discount = NULL` — will it be returned?

A) Yes — `IS NOT NULL` matches NULL values
B) No — `IS NOT NULL` excludes NULL values; rows with NULL discount are filtered out
C) Yes — `discount != 0` returns all non-zero values including NULL
D) A SQL error occurs because you cannot compare NULL with `!=`

> [!success]- Answer
> **Correct Answer: B**
>
> `IS NOT NULL` filters out rows where the column contains NULL. Since both conditions are joined with `AND`, a row with `NULL` discount fails the `IS NOT NULL` check and is excluded. In SQL, `NULL != 0` evaluates to NULL (not TRUE), so NULL values are also excluded by the `!=` comparison — but `IS NOT NULL` already removes them first.

---

## Question 16 *(Medium)*

A data engineer writes Delta table data using `df.write.format("delta").mode("append").save(path)`. What happens if the path already contains a Delta table with a different schema?

A) The write succeeds and merges the schemas automatically
B) The write fails with a `AnalysisException` due to schema mismatch unless `mergeSchema` is enabled
C) The existing table is overwritten with the new schema
D) The new data is silently dropped and the existing table is unchanged

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake enforces schema consistency by default. Appending data with a different schema throws an `AnalysisException`. To allow schema evolution during appends, enable `.option("mergeSchema", "true")` which adds new columns from the source. Overwriting behavior requires `.mode("overwrite")`, not `"append"`.

---

## Question 17 *(Medium)*

A data engineer calls `df.cache()` on a large DataFrame and then performs three different filter operations on it. What is the primary benefit of caching here?

A) Caching compresses the DataFrame to reduce memory usage
B) The cached DataFrame is stored in memory so subsequent operations avoid re-reading from disk/cloud storage
C) Caching enables parallel writes to multiple Delta tables simultaneously
D) Caching forces the DataFrame to be computed immediately (eager evaluation)

> [!success]- Answer
> **Correct Answer: B**
>
> `cache()` (or `persist()`) stores the DataFrame in memory after the first computation. Subsequent actions on the cached DataFrame skip re-reading from cloud storage and re-applying upstream transformations, significantly speeding up iterative operations like multiple filters on the same base dataset. Spark is still lazy — `cache()` itself doesn't trigger computation.

---

## Question 18 *(Medium)*

A data engineer needs to share a large lookup dictionary across all tasks in a Spark job without sending it with every task. Which Spark mechanism is designed for this?

A) Accumulators — distributed variables that collect values from executors
B) Broadcast variables — distributes a read-only variable to all executors once
C) Checkpointing — saves the variable to a reliable storage location
D) DataFrames — the correct way to share data between Spark tasks

> [!success]- Answer
> **Correct Answer: B**
>
> Broadcast variables distribute a read-only value (like a lookup dictionary) to each executor once rather than sending it with every task. This is far more efficient than including it in task closures or joining DataFrames when one side is small. Accumulators collect values FROM executors to the driver (e.g., counters). Checkpointing is for fault-tolerant state storage.

---

## Question 19 *(Easy)*

A data engineer defines a complex PySpark transformation pipeline with multiple `.filter()`, `.select()`, and `.groupBy()` calls. When does Spark actually execute these transformations?

A) Each transformation executes immediately when the line of code runs
B) Transformations execute when the Python interpreter compiles the script
C) Transformations are lazy — they execute only when an action like `.count()`, `.show()`, or `.write()` is triggered
D) Transformations execute in the background as soon as the cluster accepts the job

> [!success]- Answer
> **Correct Answer: C**
>
> Spark uses lazy evaluation — transformations (filter, select, groupBy, join, etc.) build a logical plan but execute nothing. Only when an action (count, show, collect, write, save) is called does Spark optimize and execute the full plan. This enables the Catalyst optimizer to combine and reorder operations for maximum efficiency.

---

## Question 20 *(Medium)*

A data engineer writes `df = spark.read.format("delta").load("/path/to/table")`. What is the difference if they use `spark.readStream` instead of `spark.read`?

A) `readStream` reads the entire table into memory at once; `read` reads in chunks
B) `readStream` returns a streaming DataFrame that only processes new files/rows added since the last checkpoint
C) There is no difference — both return identical DataFrames
D) `readStream` automatically converts the Delta table to a Kafka stream

> [!success]- Answer
> **Correct Answer: B**
>
> `spark.readStream.format("delta").load(path)` creates a streaming DataFrame that treats the Delta table as a streaming source. It processes only new data (rows appended after the checkpoint) in each micro-batch. `spark.read` returns a static (batch) DataFrame representing the full table at the time of reading. The two APIs have fundamentally different execution semantics.

---

## Question 21 *(Easy)*

A data engineer queries a table with millions of rows and needs to know the count of distinct values in a column. Which function returns this?

A) `COUNT(column)`
B) `COUNT(DISTINCT column)`
C) `SUM(DISTINCT column)`
D) `APPROX_COUNT_DISTINCT(column)`

> [!success]- Answer
> **Correct Answer: B**
>
> `COUNT(DISTINCT column)` returns the exact number of distinct non-NULL values in the column. `COUNT(column)` counts non-NULL rows including duplicates. `SUM(DISTINCT column)` sums distinct numeric values, not counts. `APPROX_COUNT_DISTINCT()` uses HyperLogLog for an approximate count — faster for very large datasets but not exact.

---

## Question 22 *(Medium)*

A data engineer uses `collect_list()` and `collect_set()` in a GROUP BY aggregation. What is the difference between these two functions?

A) `collect_list` returns a sorted array; `collect_set` returns an unsorted array
B) `collect_list` preserves duplicates in the array; `collect_set` returns only distinct values
C) `collect_set` works on numeric types only; `collect_list` works on any type
D) Both functions are identical — the names are aliases for the same behavior

> [!success]- Answer
> **Correct Answer: B**
>
> `collect_list(col)` aggregates all values into an array including duplicates, preserving order. `collect_set(col)` aggregates into an array of unique values, with no guaranteed ordering. Use `collect_list` when duplicates and order matter; use `collect_set` when you only need distinct values.

---

## Question 23 *(Medium)*

A data engineer receives a DataFrame with a column containing nested arrays of arrays (e.g., `[[1,2],[3,4]]`). Which function flattens this into a single-level array (e.g., `[1,2,3,4]`)?

A) `explode()`
B) `flatten()`
C) `array_join()`
D) `transform()`

> [!success]- Answer
> **Correct Answer: B**
>
> `flatten(array_of_arrays)` converts a nested array (array of arrays) into a single flat array by concatenating the inner arrays. `explode()` creates one row per element — it doesn't flatten, it unnests. `array_join()` converts an array to a string. `transform()` applies a lambda to each element, producing an array of the same depth.

---

## Question 24 *(Medium)*

A data engineer uses `dbutils.notebook.run("./child_notebook", timeout_seconds=300, arguments={"date": "2024-01-15"})`. What does this accomplish?

A) Runs the child notebook asynchronously in a separate Databricks job
B) Runs the child notebook synchronously in the current cluster, passing the date argument as a widget value
C) Schedules the child notebook to run at the specified timeout in 300 seconds
D) Creates a permanent link between the parent and child notebook that runs on every commit

> [!success]- Answer
> **Correct Answer: B**
>
> `dbutils.notebook.run()` executes another notebook synchronously on the current cluster with a timeout. The `arguments` dictionary sets widget values in the child notebook. It blocks until the child completes or times out. Unlike `%run`, the child notebook runs in an isolated scope and its variables are not imported into the parent.

---

## Incremental Data Processing / Delta Lake (Questions 25–34)

---

## Question 25 *(Easy)*

A data engineer runs `DESCRIBE HISTORY transactions` on a Delta table. What information does this return?

A) The table schema (column names, types, and nullability)
B) A log of all operations performed on the table including version, timestamp, operation, and user
C) The current partition layout and file sizes
D) The table's Z-ORDER configuration and data skipping statistics

> [!success]- Answer
> **Correct Answer: B**
>
> `DESCRIBE HISTORY` returns the Delta transaction log as a table, showing each commit's version number, timestamp, operation type (WRITE, MERGE, DELETE, OPTIMIZE, etc.), the user who performed it, and operation parameters. `DESCRIBE TABLE` or `DESCRIBE DETAIL` shows schema and partition info. Data skipping stats are in `DESCRIBE DETAIL`.

---

## Question 26 *(Medium)*

A data engineer accidentally ran `DELETE FROM customers WHERE 1=1` which deleted all rows. The table is named `customers` in Delta format. How can they recover the data?

A) `INSERT INTO customers SELECT * FROM customers VERSION AS OF previous_version`
B) `RESTORE TABLE customers TO VERSION AS OF previous_version`
C) Contact Databricks Support — deleted data cannot be recovered from Delta tables
D) Rerun the original data ingestion pipeline to recreate the data

> [!success]- Answer
> **Correct Answer: B**
>
> `RESTORE TABLE ... TO VERSION AS OF` (or `TIMESTAMP AS OF`) is the correct command to restore a Delta table to a previous version. It is an atomic operation that restores the table by re-referencing the old data files. This works as long as `VACUUM` has not deleted the files for that version. Option A creates a new table rather than restoring in-place.

---

## Question 27 *(Medium)*

A data engineer needs a copy of a Delta table to test schema changes without affecting production. They need the copy to be fast and space-efficient, sharing underlying files with the source. Which clone type should they use?

A) Deep clone — copies all data files to a new location
B) Shallow clone — creates a copy that references the source table's data files without copying them
C) CTAS (CREATE TABLE AS SELECT) — creates an independent copy with full data duplication
D) Databricks snapshot — an automatic backup created by the platform

> [!success]- Answer
> **Correct Answer: B**
>
> Shallow clone creates a Delta table that references the source's data files without copying them, making it fast and storage-efficient. Schema and metadata are independent, so changes to the clone don't affect the source. Deep clone physically copies all data files to a new location — useful for true independence. CTAS also copies all data.

---

## Question 28 *(Medium)*

A data engineer configures Auto Loader with `cloudFiles.schemaEvolutionMode = "addNewColumns"`. A new column appears in incoming JSON files. What happens?

A) Auto Loader fails with a schema mismatch error
B) The new column is silently ignored and not written to the Delta table
C) Auto Loader automatically adds the new column to the target Delta table schema
D) Auto Loader quarantines files with new columns for manual review

> [!success]- Answer
> **Correct Answer: C**
>
> `schemaEvolutionMode = "addNewColumns"` instructs Auto Loader to automatically detect new columns in the source data and add them to the target Delta table schema via `mergeSchema`. Files with the new column are processed normally. The default mode `"rescue"` puts unexpected columns into a rescue column instead of evolving the schema.

---

## Question 29 *(Hard)*

A data engineer sets a watermark on a streaming query: `withWatermark("event_time", "10 minutes")`. What is the purpose of this watermark?

A) Ensures that data older than 10 minutes is deleted from the Delta table
B) Defines the maximum tolerated lateness for event-time-based aggregations, allowing late data up to 10 minutes after the window closes
C) Buffers all incoming data for exactly 10 minutes before writing to the sink
D) Limits the streaming query to process at most 10 minutes of historical data

> [!success]- Answer
> **Correct Answer: B**
>
> Watermarks in Spark Structured Streaming define how late data can arrive and still be included in aggregations. A 10-minute watermark means data with an event_time up to 10 minutes behind the current watermark is included; older data is dropped. This allows Spark to bound the state size by eventually discarding old windows.

---

## Question 30 *(Medium)*

A data engineer compares two streaming trigger settings: `trigger(processingTime="1 minute")` and `trigger(availableNow=True)`. Which scenario is best suited for each?

A) `processingTime` for one-time batch runs; `availableNow` for continuous low-latency streams
B) `processingTime` for continuous micro-batch streaming on a 1-minute interval; `availableNow` for scheduled jobs that process all pending data then stop
C) Both are equivalent — the difference is only in the polling interval
D) `processingTime` is deprecated; use `availableNow` for all streaming jobs

> [!success]- Answer
> **Correct Answer: B**
>
> `trigger(processingTime="1 minute")` runs micro-batches on a fixed 1-minute interval indefinitely — suitable for continuous, near-real-time streaming. `trigger(availableNow=True)` processes all currently available data and terminates — suitable for scheduled pipeline runs where a streaming source needs batch-style processing. Neither is deprecated.

---

## Question 31 *(Hard)*

A data engineer needs to delete records from a Delta table where a customer opted out, and also update other customers' status in the same operation. Which SQL command handles both in a single atomic operation?

A) Run `DELETE` and `UPDATE` as separate transactions in sequence
B) `MERGE INTO customers USING opt_outs ON ... WHEN MATCHED AND condition THEN DELETE WHEN MATCHED AND other_condition THEN UPDATE SET ...`
C) `TRUNCATE TABLE customers` then reinsert only the retained records
D) Use a Python loop to delete and update records one by one

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake's `MERGE` statement supports multiple `WHEN MATCHED` clauses with different conditions — one can trigger `DELETE` and another can trigger `UPDATE SET`. This executes atomically in a single pass over the data. Running `DELETE` and `UPDATE` as separate transactions is correct but not atomic as a combined unit. `TRUNCATE` and reinsert is expensive and error-prone.

---

## Question 32 *(Medium)*

A data engineer wants to enable Change Data Feed (CDF) on an existing Delta table. Which command accomplishes this?

A) `ALTER TABLE customers SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')`
B) `CREATE TABLE customers USING DELTA WITH (enableCDF = true)`
C) `SET spark.databricks.delta.changeDataFeed.enabled = true`
D) CDF is enabled by default on all Delta tables; no action is needed

> [!success]- Answer
> **Correct Answer: A**
>
> Change Data Feed is enabled per-table using `ALTER TABLE ... SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')`. For new tables, use `CREATE TABLE ... TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true')`. The Spark config in option C sets a workspace-level default but does not retroactively enable CDF on existing tables. CDF is not on by default.

---

## Question 33 *(Hard)*

A data engineer runs `OPTIMIZE transactions ZORDER BY (customer_id, transaction_date)`. How does Z-ORDER with multiple columns differ from Z-ORDER with a single column?

A) Z-ORDER with multiple columns is invalid — only one column is allowed
B) Z-ORDER with multiple columns co-locates data that shares similar values across all specified columns, optimizing queries filtering on any combination of those columns
C) Z-ORDER applies the first column's ordering first; the second column only applies within ties
D) Each column is independently Z-ORDERed in separate file groups

> [!success]- Answer
> **Correct Answer: B**
>
> Z-ORDER with multiple columns uses a space-filling curve to interleave the sort dimensions, co-locating rows that are similar in all specified columns simultaneously. This enables data skipping for queries filtering on `customer_id`, `transaction_date`, or both together. Option C describes a lexicographic sort, which is not how Z-ORDER works.

---

## Question 34 *(Medium)*

A data engineer has a CSV directory and wants to convert it to a managed Delta table in Unity Catalog. Which approach creates a properly managed Delta table?

A) `CONVERT TO DELTA parquet.'/path/to/csv/'` — converts any format to Delta
B) `CREATE TABLE catalog.schema.table USING DELTA AS SELECT * FROM csv.'/path/'`
C) `ALTER TABLE csv_table SET TYPE DELTA`
D) Delta tables can only be created from Parquet format; CSV must first be converted to Parquet

> [!success]- Answer
> **Correct Answer: B**
>
> `CREATE TABLE ... USING DELTA AS SELECT * FROM csv.'/path/'` reads the CSV files and creates a new managed Delta table with the query results. `CONVERT TO DELTA` works only on Parquet-formatted directories (not CSV). `ALTER TABLE SET TYPE` is not valid Databricks SQL syntax. Delta tables can be created from any format via CTAS.

---

## Production Pipelines (Questions 35–41)

---

## Question 35 *(Medium)*

A DLT pipeline runs a full refresh. How does a full refresh differ from a standard pipeline update?

A) A full refresh only processes files added in the last 24 hours
B) A full refresh truncates all materialized tables and recomputes them from scratch using all source data
C) A full refresh updates only the tables with failed expectations from the previous run
D) A full refresh is identical to a standard update — the terminology is interchangeable

> [!success]- Answer
> **Correct Answer: B**
>
> A full refresh in Delta Live Tables drops all data in the pipeline's materialized tables and recomputes everything from the original sources. This is useful after fixing pipeline logic or recovering from data corruption. A standard update (incremental) processes only new data since the last checkpoint. Full refreshes are more expensive since they reprocess all historical data.

---

## Question 36 *(Medium)*

A DLT pipeline has an `EXPECT` constraint with no `ON VIOLATION` modifier. A record fails the constraint. What is the default behavior?

A) The pipeline fails and stops processing
B) The violating record is dropped silently
C) The violating record is written to the output table and the violation is logged in the event log as a warning
D) The violating record is written to a quarantine table for review

> [!success]- Answer
> **Correct Answer: C**
>
> The default behavior of `EXPECT` without an `ON VIOLATION` modifier is `WARN` — all records (including violating ones) are written to the output table, and the number of violations is tracked in the DLT event log as metrics. To drop records, use `ON VIOLATION DROP ROW`. To fail the pipeline, use `ON VIOLATION FAIL UPDATE`.

---

## Question 37 *(Easy)*

A data engineer wants to receive an email when a Databricks Workflow job fails. Where is this configured?

A) In the cluster configuration under "Termination Notifications"
B) In the job's "Notifications" settings, where email addresses can be added for failure, success, or start events
C) Through a separate alerting notebook that monitors job status via the Jobs API
D) In the Databricks workspace admin settings under "Global Notifications"

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Workflows has a built-in "Notifications" section in the job configuration where you can specify email addresses to notify on job start, job success, job failure, and task failure events. This is configured per-job, not globally. A separate monitoring notebook is an alternative but unnecessary when built-in notifications are available.

---

## Question 38 *(Medium)*

A data engineer uses task values to pass a dynamically computed date from Task A to Task B in a multi-task Databricks Workflow. Which `dbutils` functions are used to set and retrieve the value?

A) `dbutils.jobs.set("key", value)` in Task A; `dbutils.jobs.get("key")` in Task B
B) `dbutils.taskValues.set("key", value)` in Task A; `dbutils.taskValues.get("taskName", "key")` in Task B
C) `dbutils.widgets.set("key", value)` in Task A; `dbutils.widgets.get("key")` in Task B
D) Write the value to DBFS in Task A; read from DBFS in Task B

> [!success]- Answer
> **Correct Answer: B**
>
> `dbutils.taskValues.set(key, value)` sets a value in the current task's output. Downstream tasks retrieve it with `dbutils.taskValues.get(taskName, key)` where `taskName` is the name of the upstream task that set the value. Widgets are for parameterizing notebooks, not passing values between tasks. DBFS would work but is an anti-pattern compared to the built-in task values API.

---

## Question 39 *(Medium)*

A production Databricks Workflow job runs a task that occasionally takes much longer than usual due to data volume spikes. To prevent the job from running indefinitely, which configuration should the engineer set?

A) Retry policy with maximum retries set to 1
B) Task timeout — the maximum time in seconds a task is allowed to run before it is cancelled
C) Cluster autotermination minutes on the job cluster
D) Maximum concurrent runs set to 1

> [!success]- Answer
> **Correct Answer: B**
>
> Task timeout defines the maximum wall-clock time a task is allowed to run before Databricks automatically cancels it and marks the task as failed. This prevents runaway jobs from consuming resources indefinitely. Retry policy controls what happens after failure. Autotermination applies to idle clusters, not running tasks. Max concurrent runs controls parallel job instances.

---

## Question 40 *(Medium)*

A Databricks Workflow multi-task job has tasks A → B → C (sequential dependency). Task B fails. What is the default behavior for Task C?

A) Task C runs anyway, using the last successful output from Task B
B) Task C is skipped and marked as `SKIPPED` because its upstream dependency failed
C) Task C waits indefinitely for Task B to be manually retried
D) The entire job reruns from Task A automatically

> [!success]- Answer
> **Correct Answer: B**
>
> When an upstream task fails in a Databricks Workflow, all downstream tasks that depend on it are automatically marked as `SKIPPED`. Databricks does not run dependent tasks if their dependencies failed. If the job has retry configured, the failed task is retried first. Task C is not retried or rerun automatically.

---

## Question 41 *(Hard)*

A data engineer needs to query the Delta Live Tables event log to find pipeline runs where expectations failed. Which system table or approach provides this information?

A) `DESCRIBE HISTORY pipeline_name` — shows all pipeline execution history
B) Query the DLT event log table stored at the pipeline's storage location, filtering for `eventType = 'flow_progress'` records
C) `SELECT * FROM system.pipelines.events` in Unity Catalog
D) The DLT UI shows expectation violations but there is no queryable log

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Live Tables stores detailed event logs as a Delta table at `<pipeline_storage>/system/events`. Engineers can query this table to analyze pipeline runs, including `flow_progress` events which contain `data_quality` metrics showing expectation pass/fail counts. The UI visualizes this data, but the underlying table is also directly queryable for custom analysis.

---

## Data Governance (Questions 42–45)

---

## Question 42 *(Easy)*

A data engineer creates a new Delta table in Unity Catalog using `CREATE TABLE catalog.schema.table`. Who automatically becomes the table owner?

A) The workspace admin who configured Unity Catalog
B) The metastore admin
C) The user who created the table (the current session's identity)
D) Ownership is not assigned until explicitly set with `ALTER TABLE ... OWNER TO`

> [!success]- Answer
> **Correct Answer: C**
>
> In Unity Catalog, the user who creates an object (table, schema, catalog) automatically becomes its owner. Owners have full control over the object, including the ability to grant privileges to others and transfer ownership. Ownership can be transferred using `ALTER TABLE ... OWNER TO new_owner`.

---

## Question 43 *(Medium)*

A data engineer needs to restrict certain users from seeing the full value of a `ssn` (social security number) column, showing only the last 4 digits instead. Which Unity Catalog feature implements this?

A) Row-level security policy with a `WHERE` clause filter
B) Column masking policy that replaces the column value with a masked version based on user identity
C) Dynamic view with `CASE WHEN current_user() = 'admin' THEN ssn ELSE NULL END`
D) Remove the column from the table and create a separate table for privileged users

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog column masking policies apply a transformation function to a column's value based on the requesting user's identity or group membership. For example, showing only `'***-**-' || RIGHT(ssn, 4)` to non-privileged users while showing the full value to authorized users. Dynamic views (option C) also work but require maintaining a separate view object. Column masking is the purpose-built Unity Catalog feature.

---

## Question 44 *(Medium)*

A data engineer creates an external table in Unity Catalog pointing to an S3 path. What happens to the underlying data files when the table is dropped with `DROP TABLE`?

A) The data files are deleted along with the table metadata
B) The data files are retained in cloud storage; only the table metadata (catalog registration) is removed
C) The data files are moved to a Unity Catalog-managed trash location for 30 days
D) `DROP TABLE` fails on external tables — you must use `DROP EXTERNAL TABLE`

> [!success]- Answer
> **Correct Answer: B**
>
> External tables in Unity Catalog (and Databricks in general) only store metadata — the table definition pointing to an external cloud storage location. When dropped, only the metadata registration is removed. The underlying data files in S3 or ADLS are untouched. This is the key difference from managed tables, where dropping the table also deletes the data files.

---

## Question 45 *(Medium)*

A data engineer queries `SELECT * FROM system.access.audit LIMIT 100` and sees events with `actionName = 'getTable'`. What do these events represent?

A) Metadata queries where a user read the table's schema or properties
B) Full table scans where all rows were returned to the user
C) Table creation events logged when a new table is registered
D) Failed access attempts where permission was denied

> [!success]- Answer
> **Correct Answer: A**
>
> In Databricks audit logs, `getTable` action events are recorded when a user reads a table's metadata (schema, properties, statistics) — this includes actions like `DESCRIBE TABLE` or when a BI tool queries the catalog for table info. Full data reads are logged as `commandSubmit`/`commandFinish` events. Permission denials are recorded as separate audit events with error details.

---

## Answer Key

| # | Answer | # | Answer | # | Answer |
|---|--------|---|--------|---|--------|
| 1 | B | 16 | B | 31 | B |
| 2 | C | 17 | B | 32 | A |
| 3 | B | 18 | B | 33 | B |
| 4 | B | 19 | C | 34 | B |
| 5 | B | 20 | B | 35 | B |
| 6 | B | 21 | B | 36 | C |
| 7 | B | 22 | B | 37 | B |
| 8 | B | 23 | B | 38 | B |
| 9 | B | 24 | B | 39 | B |
| 10 | B | 25 | B | 40 | B |
| 11 | C | 26 | B | 41 | B |
| 12 | B | 27 | B | 42 | C |
| 13 | B | 28 | C | 43 | B |
| 14 | C | 29 | B | 44 | B |
| 15 | B | 30 | B | 45 | A |

---

## Score Interpretation

| Score | Percentage | Assessment |
| ----- | ---------- | ---------- |
| 40–45 | 89–100% | Excellent — well prepared, schedule your exam |
| 35–39 | 78–87% | Good — review weak areas before scheduling |
| 32–34 | 71–76% | Borderline — significant review recommended |
| 27–31 | 60–69% | Needs Work — focus on weak domains |
| Below 27 | Below 60% | Not Ready — comprehensive study required |

## Section Performance Tracker

| Domain | Questions | Your Score | Percentage |
| ------ | --------- | ---------- | ---------- |
| Lakehouse Platform | 1–11 (11 questions) | ___/11 | ___% |
| ELT with Spark SQL and Python | 12–24 (13 questions) | ___/13 | ___% |
| Incremental Data Processing | 25–34 (10 questions) | ___/10 | ___% |
| Production Pipelines | 35–41 (7 questions) | ___/7 | ___% |
| Data Governance | 42–45 (4 questions) | ___/4 | ___% |
| **Total** | **45 questions** | **___/45** | **___%** |

---

[← Back to Mock Exam 2](./README.md) | [Compare with Mock Exam 1](../mock-exam/README.md)
