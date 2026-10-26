---
title: "Practice Questions: Data Ingestion and Loading"
type: practice-questions
tags: [data-engineer-associate, practice-questions, data-ingestion-and-loading]
---

# Domain 2: Data Ingestion and Loading

Exam weight: **21 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: JDBC Format for SQLite

**Question** *(Easy)*: A data engineer needs to create a table in Databricks using data from the organization's SQLite database. They set up a JDBC connection. Which format string correctly identifies the JDBC data source?

A) `"sqlite"`
B) `"jdbc"`
C) `"database"`
D) `"odbc"`

> [!success]- Answer
> **Correct Answer: B**
>
> `"jdbc"`
>
> This is the format string used with Spark's DataFrameReader to connect to any JDBC-compatible database (including SQLite, MySQL, PostgreSQL). It is specified as `.format("jdbc")` in the DataFrameReader chain, followed by `.option()` calls for the connection URL, driver, and table name.

---

## Question 2: Parquet Advantage Over CSV

**Question** *(Medium)*: What advantage does creating an external table using Parquet have over CSV in a `CREATE TABLE AS SELECT` statement?

A) Parquet files are human-readable and can be edited with a text editor
B) Parquet files have a well-defined schema
C) Parquet files support row-level locking for concurrent writes
D) Parquet files are smaller because they use row-based compression

> [!success]- Answer
> **Correct Answer: B**
>
> Parquet files have a well-defined schema.
>
> Unlike CSV (a schema-less text format requiring manual type inference), Parquet embeds column names and data types directly in the file metadata. This enables schema enforcement, efficient columnar reads, and predicate pushdown without a separate schema definition.

---

## Question 3: COPY INTO Idempotency

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
  .outputMode("append")
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

## Question 7: Auto Loader for New File Detection

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

## Question 8: Writing to a Path vs a Table

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

## Question 9: CREATE TABLE from CSV Keyword

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

## Question 10: Process All Available Data Trigger

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

## Question 11: Auto Loader JSON String Inference

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

## Question 12: Auto Loader Compatible Workloads

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

## Question 13: spark.read to spark.readStream

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

## Question 14: Streaming DataFrame Write API Error

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

## Question 15: Missing Checkpoint in Streaming Write

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

## Question 16: Ingesting a SaaS Source With Least Overhead *(2026 blueprint)*

**Question** *(Easy)*: Sales leadership wants Salesforce accounts and opportunities in Unity Catalog, refreshed hourly. The data team has no capacity to write or maintain custom API code. Which approach fits best?

A) A notebook that calls the Salesforce REST API, scheduled hourly with Lakeflow Jobs
B) The Lakeflow Connect managed Salesforce connector with an hourly schedule
C) Auto Loader reading Salesforce export files from a volume
D) A JDBC read of the Salesforce database every hour

> [!success]- Answer
> **Correct Answer: B**
>
> The Lakeflow Connect managed Salesforce connector with an hourly schedule.
>
> Managed connectors are fully managed ingestion pipelines for popular SaaS apps and databases. They run on serverless compute, write to UC streaming tables, ingest incrementally, and Lakeflow Connect creates a job for each schedule. Databricks recommends starting with the most managed layer. Custom REST code adds maintenance, and Auto Loader needs files that someone else would have to export ([Lakeflow Connect](https://docs.databricks.com/aws/en/ingestion/overview)).

---

## Question 17: Components of a Managed Database Connector *(2026 blueprint)*

**Question** *(Medium)*: A team configures a Lakeflow Connect managed connector to replicate a SQL Server database with change data capture. Which component exists only for database connectors, and runs continuously to stage changes?

A) The Unity Catalog connection
B) The ingestion gateway
C) The destination streaming tables
D) The Lakeflow Jobs schedule

> [!success]- Answer
> **Correct Answer: B**
>
> The ingestion gateway.
>
> Database connectors include "an ingestion gateway and staging storage to support continuous change capture". The gateway runs as a continuous task in its own job. Every managed connector uses a UC **connection** (credentials), an **ingestion pipeline**, and **streaming tables** as destinations ([connector concepts](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/)).

---

## Question 18: Standard vs Managed Connectors *(2026 blueprint)*

**Question** *(Medium)*: Which source is a typical case for a Lakeflow Connect **standard** (customizable) connector rather than a managed connector?

A) Workday reports for an HR dashboard
B) Events from an Apache Kafka topic that need custom parsing in Structured Streaming
C) HubSpot CRM objects
D) A MySQL database replicated with CDC

> [!success]- Answer
> **Correct Answer: B**
>
> Events from an Apache Kafka topic that need custom parsing in Structured Streaming.
>
> Standard connectors are the customizable SQL and Spark ingestion paths for cloud object storage (Auto Loader, `read_files`), message buses (Kafka, Kinesis, Pub/Sub), and SFTP. Managed connectors cover SaaS apps (Workday, HubSpot, Salesforce) and databases (MySQL, PostgreSQL, SQL Server) with no ingestion code ([Ingest with SQL and Spark APIs](https://docs.databricks.com/aws/en/ingestion/)).

---

## Question 19: Auto Loader Schema Evolution Without Failures *(2026 blueprint)*

**Question** *(Hard)*: An Auto Loader stream lands vendor JSON in a Bronze table whose schema downstream teams depend on. New fields occasionally appear. The stream must never stop because of them, the table schema must not change, and the unexpected values must be kept for review. Which setting meets this?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`
B) `cloudFiles.schemaEvolutionMode = "rescue"`
C) `cloudFiles.schemaEvolutionMode = "failOnNewColumns"`
D) `cloudFiles.inferColumnTypes = "true"`

> [!success]- Answer
> **Correct Answer: B**
>
> `cloudFiles.schemaEvolutionMode = "rescue"`.
>
> In `rescue` mode the schema never evolves and the stream doesn't fail. New columns are written to the `_rescued_data` column. `addNewColumns` evolves the schema and stops the stream with `UnknownFieldException` until it's restarted. `failOnNewColumns` stops until someone fixes the schema. `inferColumnTypes` only affects type inference ([schema inference and evolution](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema)).

---

## Question 20: Auto Loader File Discovery Mode *(2026 blueprint)*

**Question** *(Medium)*: An Auto Loader stream reads a Unity Catalog external location that receives hundreds of thousands of files per day. Directory listing has become slow. What does Databricks recommend?

A) Enable `cloudFiles.useIncrementalListing`
B) Switch to file notification mode with file events enabled on the external location
C) Reduce `cloudFiles.maxFilesPerTrigger` to 10
D) Replace Auto Loader with a scheduled `spark.read` of the whole directory

> [!success]- Answer
> **Correct Answer: B**
>
> Switch to file notification mode with file events enabled on the external location.
>
> Directory listing is the default mode. Databricks recommends file notification mode with **file events** for most workloads, as it's more performant and scalable, and needs no extra permissions once file events are enabled on the external location (DBR 14.3 LTS+). `cloudFiles.useIncrementalListing` is deprecated. You can switch modes across restarts and keep exactly-once processing ([file detection modes](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/file-detection-modes)).

---

## Question 21: Forcing a COPY INTO Reload *(2026 blueprint)*

**Question** *(Medium)*: After fixing a parsing bug, a data engineer truncates a Bronze table and re-runs the same `COPY INTO` statement. Zero rows are loaded. What explains this, and how should they reload the files?

A) `COPY INTO` caches query results. Run `REFRESH TABLE` first
B) `COPY INTO` is idempotent and skips files it already loaded. Add `COPY_OPTIONS ('force' = 'true')`
C) The files were deleted by `COPY INTO` after the first load. Re-upload them
D) `COPY INTO` only loads files newer than the table's last `OPTIMIZE`

> [!success]- Answer
> **Correct Answer: B**
>
> `COPY INTO` is idempotent and skips files it already loaded. Add `COPY_OPTIONS ('force' = 'true')`.
>
> "Files in the source location that have already been loaded are skipped", and truncating the target doesn't reset that tracking. `'force' = 'true'` disables idempotency, so the files load again ([COPY INTO reference](https://docs.databricks.com/aws/en/sql/language-manual/delta-copy-into)).

---

## Question 22: Parallelizing a JDBC Read *(2026 blueprint)*

**Question** *(Medium)*: A notebook reads a 300-million-row PostgreSQL table with `spark.read.format("jdbc")`, and the read runs for hours while most cluster cores sit idle. What change parallelizes the read?

A) Set `fetchSize` to 1
B) Add `partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions` on an indexed numeric column
C) Call `.repartition(64)` after `.load()`
D) Increase `spark.sql.shuffle.partitions`

> [!success]- Answer
> **Correct Answer: B**
>
> Add `partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions` on an indexed numeric column.
>
> A JDBC read uses one thread by default. The partitioning options split the read into parallel range queries. Repartitioning after `load()` only redistributes data that was already read serially. Shuffle partitions don't affect the read ([Query databases using JDBC](https://docs.databricks.com/aws/en/connect/external-systems/jdbc)).

---

## Question 23: Landing REST API Data *(2026 blueprint)*

**Question** *(Medium)*: A vendor exposes order data only through a REST API. The team wants an immutable raw copy for replay, schema-drift handling, and a nightly schedule. Which design fits?

A) Call the API from a notebook, write the raw JSON responses to a Unity Catalog volume, ingest them with Auto Loader, and schedule both tasks in one Lakeflow Job
B) Call the API from a notebook and `collect()` the results into a pandas DataFrame on the driver
C) Create a Lakehouse Federation connection that queries the REST API in place
D) Store the API token in the notebook and write directly to DBFS root

> [!success]- Answer
> **Correct Answer: A**
>
> Call the API from a notebook, write the raw JSON responses to a Unity Catalog volume, ingest them with Auto Loader, and schedule both tasks in one Lakeflow Job.
>
> Landing raw files in a governed volume keeps a replayable copy, and Auto Loader handles incremental loading and schema evolution. Lakeflow Jobs schedules and retries the tasks. The token belongs in Databricks secrets (`dbutils.secrets.get`). DBFS root is deprecated for data ([What is DBFS?](https://docs.databricks.com/aws/en/dbfs/)).

---

## Question 24: Querying Nested JSON Strings *(2026 blueprint)*

**Question** *(Easy)*: A Bronze column `raw` holds JSON strings such as `{"customer": {"id": 42}, "total": "19.99"}`. Which Databricks SQL expression returns the customer ID?

A) `raw.customer.id`
B) `raw:customer.id`
C) `get_json(raw, 'customer', 'id')`
D) `raw['customer']['id']::json`

> [!success]- Answer
> **Correct Answer: B**
>
> `raw:customer.id`.
>
> For JSON **strings**, Databricks SQL uses `<column>:<path>`, with dot notation or brackets for nested fields and `::` for casting (for example `raw:total::double`). Dot notation without the colon works on **struct** columns, not on strings ([Query JSON strings](https://docs.databricks.com/aws/en/semi-structured/json)). For new semi-structured data, Databricks recommends the `VARIANT` type over JSON strings.

---

**[← Previous: Domain 1: Databricks Intelligence Platform](./01-databricks-intelligence-platform.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 3: Data Transformation and Modeling →](./03-data-transformation-and-modeling.md)**
