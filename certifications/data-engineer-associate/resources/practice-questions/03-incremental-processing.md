---
title: "Practice Questions: Incremental Data Processing"
type: practice-questions
tags: [data-engineer-associate, practice-questions, incremental-processing]
---

# Domain 3: Incremental Data Processing

## Question 1: COPY INTO Idempotency

**Question** *(Medium)*: Every day, a data engineer runs a command to transfer the previous day's sales data into a `transactions` table. Today, after running the command, the record count remains unchanged. Why were no new records copied?

A) The table's schema rejected the incoming data due to a type mismatch
B) The previous day's file has already been copied into the table
C) The COPY INTO command only works with streaming sources, not batch files
D) The transaction log was full and could not accept new entries

> [!success]- Answer
> **Correct Answer: B**
>
> The previous day's file has already been copied into the table.
>
> `COPY INTO` is idempotent — it maintains an internal record of which files have already been loaded. On subsequent runs, it automatically skips previously processed files, preventing duplicate ingestion. This makes it safe to rerun without creating duplicates.

---

## Question 2: Tool for Automated Data Quality Monitoring

**Question** *(Easy)*: During data ingestion, a data engineer observes that source data quality is declining. They want to automate the process of monitoring the quality level. Which tool addresses this?

A) Apache Airflow with custom validation DAGs
B) Databricks SQL Alerts with scheduled queries
C) Delta Live Tables (DLT)
D) Great Expectations library integrated with Spark

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Live Tables (DLT).
>
> DLT provides built-in data quality monitoring through expectations — declarative constraints that automatically track pass/fail metrics, record violations in the event log, and optionally drop or quarantine bad records. Quality statistics are visible per-table in the pipeline UI.

---

## Question 3: DLT Continuous Pipeline Behavior

**Question** *(Hard)*: A DLT pipeline has two datasets defined with `STREAMING LIVE TABLE` and three datasets using `LIVE TABLE`. It runs in Production mode with Continuous Pipeline Mode. What outcome should be expected after clicking Start if there is unprocessed data and all definitions are correct?

A) Only the two streaming datasets are updated continuously; the three materialized views are updated once and then stop
B) All five datasets are updated once, and then the pipeline shuts down automatically to conserve resources
C) All datasets are updated at set intervals until the pipeline is shut down. Compute resources are deployed for the update and terminated when the pipeline is stopped
D) The pipeline fails because streaming and materialized view datasets cannot coexist in Continuous mode

> [!success]- Answer
> **Correct Answer: C**
>
> All datasets are updated at set intervals until the pipeline is shut down. Compute resources are deployed for the update and terminated when the pipeline is stopped.
>
> In Continuous mode, the pipeline runs indefinitely — processing streaming tables as new data arrives and periodically refreshing materialized views. It does not shut down automatically; resources are released only when the pipeline is manually stopped.

---

## Question 4: Spark Offset Tracking Methods

**Question** *(Easy)*: To reliably monitor the precise progress of processing and manage failures through restarting or reprocessing, which two methods does Spark use to log the offset range of the data processed in each trigger?

A) Checkpointing and Write-ahead Logs (WAL)
B) Transaction logs and Delta Lake versioning
C) Spark event logs and executor heartbeats
D) Watermarking and session windows

> [!success]- Answer
> **Correct Answer: A**
>
> Checkpointing and Write-ahead Logs (WAL).
>
> The checkpoint saves the streaming query's progress (including offsets) to a durable location in cloud storage, while the WAL records each trigger's offset range before the batch is processed. Together, they enable exactly-once semantics and recovery after cluster failure.

---

## Question 5: Auto Loader Underlying Technology

**Question** *(Easy)*: Which tool does Auto Loader use to incrementally process data?

A) Apache Kafka consumer groups
B) Delta Lake Change Data Feed
C) COPY INTO with file tracking
D) Spark Structured Streaming

> [!success]- Answer
> **Correct Answer: D**
>
> Spark Structured Streaming.
>
> Auto Loader is built on top of Structured Streaming and uses it to incrementally discover and ingest new files as they arrive in cloud storage. It maintains a checkpoint to ensure exactly-once processing and scales automatically with file volume.

---

## Question 6: Micro-Batch Trigger Every 5 Seconds

**Question** *(Medium)*: A data engineer sets up a Structured Streaming job to read from a table, process the data, and subsequently write it to a new table in real-time. The code block is shown below:

```python
(spark.table("sales")
  .withColumn("avg_price", col("sales") / col("units"))
  .writeStream
  .option("checkpointLocation", checkpointPath)
  .outputMode("complete")
  ._____
  .table("new_sales"))
```

If the data engineer aims to run a micro-batch query that processes data every 5 seconds, which line of code should be used to complete the blank?

A) `.trigger(interval="5 seconds")`
B) `.trigger(processingTime="5 seconds")`
C) `.trigger(continuous="5 seconds")`
D) `.trigger(microBatch="5 seconds")`

> [!success]- Answer
> **Correct Answer: B**
>
> `.trigger(processingTime="5 seconds")`
>
> This fixed-interval trigger causes Spark to kick off a new micro-batch every 5 seconds, processing all data that arrived since the last batch. If processing takes longer than the interval, the next batch starts immediately after completion.

---

## Question 7: DLT DROP Expectation Behavior

**Question** *(Medium)*: A dataset established through Delta Live Tables has an expectations clause with `ON VIOLATION DROP ROW`. What should occur when processing a batch of data that includes entries violating these constraints?

A) Records that violate the expectation are dropped from the target dataset and recorded as invalid in the event log
B) The entire batch is rejected and the pipeline enters a failed state
C) Violating records are written to a separate quarantine table for manual review
D) The pipeline pauses and waits for manual approval before continuing

> [!success]- Answer
> **Correct Answer: A**
>
> Records that violate the expectation are dropped from the target dataset and recorded as invalid in the event log.
>
> The pipeline continues running. Dropped record counts and violation metrics are tracked in the DLT event log and displayed per-table in the pipeline UI under data quality statistics. The `FAIL UPDATE` variant would stop the pipeline instead.

---

## Question 8: CREATE STREAMING LIVE TABLE vs CREATE LIVE TABLE

**Question** *(Medium)*: When should `CREATE STREAMING LIVE TABLE` be used instead of `CREATE LIVE TABLE` for creating Delta Live Tables in SQL?

A) When the table needs to support both read and write operations simultaneously
B) When the table must be accessible from multiple workspaces
C) When the table requires ACID transaction support
D) When data needs to be processed incrementally

> [!success]- Answer
> **Correct Answer: D**
>
> `CREATE STREAMING LIVE TABLE` should be used when data needs to be processed incrementally.
>
> It reads from append-only streaming sources (Auto Loader, Kafka, Delta change data feed) and processes only new records since the last run. `CREATE LIVE TABLE` (materialized view) re-processes the full dataset on each update and is suited for static or aggregated data.

---

## Question 9: Auto Loader for New File Detection

**Question** *(Medium)*: A data engineer's source system produces files in a shared directory that accumulate over time. The engineer must recognize which files are new since the last pipeline execution and ingest only those during each run. Which tool addresses this?

A) COPY INTO with manual file listing
B) Auto Loader
C) Delta Lake MERGE with file metadata
D) Spark batch read with timestamp filtering

> [!success]- Answer
> **Correct Answer: B**
>
> Auto Loader.
>
> Auto Loader uses file notification (cloud storage events) or directory listing to detect new files incrementally. It maintains a checkpoint recording which files have been processed, so only unprocessed files are ingested on each pipeline run — without requiring manual file tracking.

---

## Question 10: Silver to Gold Streaming Query

**Question** *(Medium)*: Which type of Structured Streaming query represents the transition from a Silver table to a Gold table?

A) A query that reads raw data from cloud storage and applies schema enforcement before writing to a Silver table
B) A query that deduplicates and cleanses Bronze data before writing to a Silver table
C) A query that reads from a Silver streaming table and applies aggregations — such as `groupBy()` with `sum()`, `count()`, or `avg()` — to produce summary metrics written to a Gold table
D) A query that replicates Silver data to an external data warehouse for reporting

> [!success]- Answer
> **Correct Answer: C**
>
> A query that reads from a Silver streaming table and applies aggregations — such as `groupBy()` with `sum()`, `count()`, or `avg()` — to produce summary metrics written to a Gold table.
>
> Gold tables typically contain business-level aggregates. Transforming cleaned Silver data into aggregated Gold data is the defining characteristic of the Silver-to-Gold transition in medallion architecture.
>
> > ⚠️ *This answer was generated by AI — verify against official Databricks documentation.*

---

## Question 11: Identifying Which DLT Table Drops Records

**Question** *(Medium)*: A data engineer manages three tables in a DLT pipeline with expectations set to eliminate invalid records. They observe that data is being discarded at some stage. How can they identify which specific table is dropping the records?

A) Query the Delta transaction log of each table to find DELETE operations
B) Add explicit logging statements to each table's transformation code
C) Run DESCRIBE HISTORY on each table to check for dropped record counts
D) Navigate to the DLT pipeline page, click on each table, and view the data quality statistics

> [!success]- Answer
> **Correct Answer: D**
>
> Navigate to the DLT pipeline page, click on each table, and view the data quality statistics.
>
> The DLT pipeline UI shows per-table expectation metrics, including the number of records that passed, failed, or were dropped for each defined constraint. This makes it straightforward to pinpoint which table's expectation is causing record drops.

---

## Question 12: Streaming Write Issues

**Question** *(Medium)*: What is wrong with the following code?

```python
df = spark.read.json("data/")
df.write.save("output", format="delta")
```

A) The code saves files to a path but does not register the output as a named Delta table in the metastore
B) The `spark.read.json()` method cannot be used with Delta format output
C) The `.save()` method requires a checkpoint location for Delta format writes
D) The code is missing a schema definition, which is required for JSON reads

> [!success]- Answer
> **Correct Answer: A**
>
> The code saves files to a path but does not register the output as a named Delta table in the metastore. To create a queryable Delta table accessible via SQL, use `.write.format("delta").saveAsTable("table_name")` instead.
>
> > ⚠️ *This answer was generated by AI — verify against official Databricks documentation.*

---

## Question 13: CREATE TABLE from CSV Keyword

**Question** *(Easy)*: A data engineer needs to create a table in Databricks using data from a CSV file. They run a `CREATE TABLE` command that already specifies the CSV path and format in the statement body. Which additional line of code completes the blank?

A) `USING DELTA`
B) `FORMAT_OPTIONS('header' = 'true')`
C) No additional line is needed
D) `STORED AS TEXTFILE`

> [!success]- Answer
> **Correct Answer: C**
>
> No additional line is needed.
>
> When a `CREATE TABLE` statement already contains `USING CSV LOCATION '/path/to/csv'`, the format and location are fully specified within the command body itself. No extra keyword is required to complete the statement.
>
> > ⚠️ *This answer was generated by AI — verify against official Databricks documentation.*

---

## Question 14: Process All Available Data Trigger

**Question** *(Medium)*: A data engineer sets up a Structured Streaming job to read from a table and write results to a new table. The code block is shown below:

```python
(spark.table("transactions")
  .withColumn("total", col("price") * col("qty"))
  .writeStream
  .option("checkpointLocation", checkpointPath)
  .outputMode("append")
  ._____
  .table("transactions_gold"))
```

If the data engineer intends for the query to process all available data across as many batches as needed and then stop, which line of code should be used to complete the blank?

A) `.trigger(once=True)`
B) `.trigger(processingTime="0 seconds")`
C) `.trigger(continuous="1 second")`
D) `.trigger(availableNow=True)`

> [!success]- Answer
> **Correct Answer: D**
>
> `.trigger(availableNow=True)`
>
> This trigger processes all data that has arrived since the last checkpoint across one or more micro-batches, then shuts down automatically. It combines the efficiency of micro-batching (processing incrementally) with the convenience of a batch job (terminates when done).

---

## Question 15: Auto Loader JSON String Inference

**Question** *(Medium)*: A data engineer creates a pipeline to ingest JSON data via Auto Loader with no type inference or schema hints specified. After examining the data, all columns in the target table are of string type, even for fields containing only float or boolean values. Why does Auto Loader infer all columns as string type?

A) Auto Loader defaults to string type to prevent data loss during schema evolution
B) The checkpoint metadata overrides column types to string for safety
C) JSON data is a text-based format
D) The Delta table's schema enforcement converts all incoming types to strings

> [!success]- Answer
> **Correct Answer: C**
>
> JSON data is a text-based format.
>
> Without enabling schema inference (`cloudFiles.inferColumnTypes = true`), Auto Loader reads all JSON field values as strings by default. JSON itself does not enforce strict data types at the format level, so without explicit type hints, the safest default is to represent all values as strings.

---

## Question 16: DLT Pipeline Minimum Requirement

**Question** *(Easy)*: What needs to be specified when creating a new Delta Live Tables pipeline?

A) A target database and storage location
B) At least one notebook library to be executed
C) A cluster policy and node type configuration
D) An explicit schedule or cron expression

> [!success]- Answer
> **Correct Answer: B**
>
> At least one notebook library to be executed.
>
> A DLT pipeline must reference one or more notebooks containing the dataset definitions (`CREATE LIVE TABLE` or `CREATE STREAMING LIVE TABLE` statements). Other settings — storage location, target database, cluster configuration — are optional and can use defaults.

---

## Question 17: STREAM() Function in DLT

**Question** *(Medium)*: A data engineer joins an ongoing project and notices a `STREAM()` function wrapping a table reference in a DLT SQL query. What explains its inclusion?

A) The referenced table is a streaming live table
B) The `STREAM()` function enables parallel reads from the table across multiple clusters
C) It converts a batch table into a temporary streaming source for the current query only
D) The `STREAM()` function applies watermarking to handle late-arriving data

> [!success]- Answer
> **Correct Answer: A**
>
> The referenced table is a streaming live table.
>
> In DLT, `STREAM(table_name)` indicates that the table should be read as a streaming source — consuming only new records incrementally rather than reprocessing the full table. It is required when the source is a `STREAMING LIVE TABLE` and the consuming dataset needs to process it incrementally.

---

## Question 18: Auto Loader Compatible Workloads

**Question** *(Easy)*: What type of workloads are consistently compatible with Auto Loader?

A) Both streaming and batch workloads
B) Only batch workloads with scheduled triggers
C) Only streaming workloads with continuous triggers
D) Only interactive notebook workloads

> [!success]- Answer
> **Correct Answer: A**
>
> Both streaming and batch workloads.
>
> Auto Loader natively supports Structured Streaming for continuous incremental ingestion. It also supports triggered batch execution using `.trigger(availableNow=True)` to process all new files at once and then stop. This flexibility makes it suitable for both real-time and scheduled batch pipelines.

---

## Question 19: DLT Migration Changes

**Question** *(Medium)*: A data engineer (Python, bronze/silver) and a data analyst (SQL, gold) collaborate on a medallion pipeline with a streaming source. They plan to migrate to Delta Live Tables. What changes are necessary?

A) The Python code must be rewritten in SQL because DLT only supports SQL definitions
B) The SQL code must be rewritten in Python because DLT only supports Python definitions
C) The streaming source must be converted to a batch source before migrating to DLT
D) No changes are required

> [!success]- Answer
> **Correct Answer: D**
>
> No changes are required.
>
> DLT natively supports both Python and SQL within the same pipeline. It supports the medallion architecture (Bronze/Silver/Gold layers) and handles streaming sources directly. The existing language mix and multi-hop architecture can migrate to DLT without modification to the underlying logic.

---

## Question 20: spark.read to spark.readStream

**Question** *(Easy)*: A data engineer utilizes this code block within a batch ingestion pipeline to read from a Delta table:

```python
df = (spark.read
      .format("delta")
      .schema(schema)
      .load("/delta/transactions"))
```

What single change must be made for this code block to work correctly when the `transactions` table acts as a streaming source?

A) Replace `.format("delta")` with `.format("deltaStream")`
B) Replace `spark.read` with `spark.readStream`
C) Add `.option("streaming", "true")` to the reader chain
D) Replace `.load("/delta/transactions")` with `.stream("/delta/transactions")`

> [!success]- Answer
> **Correct Answer: B**
>
> Replace `spark.read` with `spark.readStream`.
>
> This single change converts the static batch read into an incremental streaming read that consumes new records appended to the Delta table since the last checkpoint. All subsequent transformations on the resulting DataFrame remain unchanged.

---

## Question 21: Streaming DataFrame Write API Error

**Question** *(Medium)*: Why will the following code fail?

```python
df = spark.readStream.format("delta").load("dbfs:/delta/events")
df.write.csv("output")
```

A) `df.write` must be `df.writeStream`
B) The `.csv("output")` method is not supported for Delta format reads
C) A checkpoint location must be specified before calling `.write`
D) The `readStream` API cannot read from Delta format tables

> [!success]- Answer
> **Correct Answer: A**
>
> `df.write` must be `df.writeStream`.
>
> A streaming DataFrame created with `readStream` must be written using the `writeStream` API. Using the batch `.write` API on a streaming DataFrame raises an `AnalysisException: Queries with streaming sources must be executed with writeStream.start()`.

---

## Question 22: Missing Checkpoint in Streaming Write

**Question** *(Medium)*: What is missing from this streaming write?

```python
df.writeStream.format("delta").start("output")
```

A) An output mode specification (append, complete, or update)
B) A schema definition for the output Delta table
C) A trigger interval for micro-batch processing
D) A checkpoint location is missing

> [!success]- Answer
> **Correct Answer: D**
>
> A checkpoint location is missing.
>
> Structured Streaming requires `.option("checkpointLocation", "/path/to/checkpoint")` to track query progress and enable fault-tolerance. Without a checkpoint, the query cannot recover from failures or track which data has been processed, and Spark will raise an error on startup.

---

**[← Previous: Domain 2: ELT with Spark SQL and Python](./02-elt-spark-sql-python.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 4: Production Pipelines](./04-production-pipelines.md) →**
