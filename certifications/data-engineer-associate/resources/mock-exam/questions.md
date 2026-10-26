---
title: Data Engineer Associate Mock Exam 1 — Questions
type: mock-exam-questions
tags:
  - databricks
  - certification
  - data-engineer-associate
  - mock-exam
---

# Data Engineer Associate Mock Exam 1 — Questions

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)

---

> [!note] Platform update (Oct 2026)
> Questions are grouped by the 7 domains of the August 2026 exam guide. Some stems still use legacy names: **DLT / Delta Live Tables** = Lakeflow Declarative Pipelines (now **Lakeflow Spark Declarative Pipelines**, renamed Nov 12, 2025), and `@dlt.*` decorators still work, although the `pyspark.pipelines` (`dp`) module is now recommended. **Delta Sharing** is now **OpenSharing** (Jun 10, 2026).

---

## Databricks Intelligence Platform (Questions 1–3)

## Question 1 *(Medium)*

A data engineering team is evaluating whether to migrate their existing data warehouse to a Databricks Lakehouse. The primary concern is maintaining ACID guarantees for concurrent reads and writes on large tables. Which Databricks technology directly addresses this requirement?

A) Apache Parquet file format with schema enforcement  
B) Unity Catalog with row-level security  
C) Databricks SQL Serverless warehouses  
D) Delta Lake with transaction log (`_delta_log`)  

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Lake provides ACID transactions through its transaction log (`_delta_log`), which records every operation as an atomic commit. This enables concurrent readers and writers without data corruption. Parquet alone has no transaction support, Serverless warehouses are a compute option, and Unity Catalog handles governance — not storage-level ACID.

---

## Question 2 *(Medium)*

An engineer is setting up a new Databricks workspace and needs to run interactive notebooks for development while also running scheduled production jobs. Which cluster type should they use for each workload?

A) All-purpose clusters for both — they are more flexible  
B) Job clusters for both — they are cheaper and auto-terminate  
C) All-purpose clusters for interactive notebooks; job clusters for scheduled production jobs  
D) SQL warehouses for notebooks; job clusters for scheduled jobs  

> [!success]- Answer
> **Correct Answer: C**
>
> All-purpose clusters support interactive, multi-user notebook sessions and persist between runs. Job clusters are created specifically for a single job run and terminate automatically upon completion, making them more cost-effective for production pipelines. SQL warehouses are optimized for SQL queries, not general notebook workloads.

---

## Question 3 *(Medium)*

A data engineer needs to query data as it existed 7 days ago from a Delta table named `transactions`. Which command correctly retrieves this historical snapshot?

A) `SELECT * FROM transactions WHERE _commit_timestamp >= date_sub(current_date(), 7)`  
B) `SELECT * FROM transactions VERSION AS OF 7`  
C) `SELECT * FROM transactions TIMESTAMP AS OF date_sub(current_date(), 7)`  
D) `RESTORE TABLE transactions TO TIMESTAMP AS OF date_sub(current_date(), 7)`  

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake time travel using `TIMESTAMP AS OF` queries the table state at a specific point in time. `VERSION AS OF 7` queries version number 7 (the 8th commit), not 7 days ago. `RESTORE TABLE` permanently restores the table to a previous state rather than just reading it. `_commit_timestamp` is not a valid time travel filter syntax.

---

## Data Ingestion and Loading (Questions 4–12)

## Question 4 *(Medium)*

A SQL analyst runs this statement every morning:

```sql
COPY INTO main.bronze.orders
FROM '/Volumes/main/raw/landing/orders'
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true');
```

On Tuesday a vendor re-uploads Monday's file, `orders_0901.csv`, with corrected values under the same name. Tuesday's run loads 0 rows. What explains this, and how can the analyst load the corrected file?

A) `COPY INTO` is idempotent and skips files it has already loaded, even if they were modified. Re-run it with `FILES = ('orders_0901.csv')` and `COPY_OPTIONS ('force' = 'true')`  
B) `COPY INTO` only reads files written after the table's latest commit. Run `OPTIMIZE` on the table first  
C) The corrected file failed schema validation. Add `VALIDATE ALL` to load it  
D) `COPY INTO` needs a checkpoint location to track files. Add one with `COPY_OPTIONS`  

> [!success]- Answer
> **Correct Answer: A**
>
> `COPY INTO` is retriable and idempotent: files in the source location that were already loaded are skipped on later runs, even if they changed after loading.
>
> Setting `'force' = 'true'` turns idempotency off and reloads files whether or not they were loaded before. Listing just that file with `FILES` keeps the reload from duplicating every other file. `VALIDATE` only checks data without loading it, so it can't load anything. A checkpoint location belongs to Auto Loader and Structured Streaming, not `COPY INTO`, which tracks loaded files internally.

---

## Question 5 *(Medium)*

A data engineer configures Auto Loader to ingest CSV files from an S3 bucket. The pipeline runs every hour. What happens if 5 new files arrive between runs?

A) Auto Loader automatically detects and processes all 5 new files in the next trigger  
B) Only the first file is processed; subsequent files are queued for the next run  
C) Auto Loader processes files only when triggered manually  
D) Auto Loader fails if more than 1 file arrives between runs  

> [!success]- Answer
> **Correct Answer: A**
>
> Auto Loader uses cloud storage notifications or directory listing combined with a checkpoint to track which files have been processed. On the next trigger, it automatically detects all new, unprocessed files and ingests them. This checkpointing mechanism ensures exactly-once processing without manual intervention or file tracking.

---

## Question 6 *(Easy)*

A team must ingest Salesforce objects into Unity Catalog tables incrementally, with as little custom code as possible. Which option does Databricks recommend?

A) A notebook that calls the Salesforce REST API, scheduled with Lakeflow Jobs  
B) Auto Loader pointed at the Salesforce instance URL  
C) A Lakeflow Connect managed connector, which creates an ingestion pipeline that writes streaming tables  
D) A Lakehouse Federation foreign catalog, queried by every downstream job  

> [!success]- Answer
> **Correct Answer: C**
>
> SaaS applications such as Salesforce map to a Lakeflow Connect **managed connector**: no code, incremental, serverless, and governed by Unity Catalog.
>
> Databricks recommends starting with the most managed layer and moving down only when it can't meet the requirement. A hand-written REST notebook is the fallback for sources without a connector. Auto Loader reads files in cloud storage, not a SaaS API. Federation queries a source in place without ingesting it, and the requirement here is to land the data in Unity Catalog tables.

---

## Question 7 *(Medium)*

A streaming job reads from a Kafka topic and writes to a Delta table. The engineer wants the job to process all currently available data and then stop automatically. Which trigger type should they configure?

A) `trigger(processingTime="0 seconds")` for continuous mode  
B) `trigger(availableNow=True)` to process all available data then stop  
C) `trigger(continuous="10 seconds")` for low-latency micro-batch processing  
D) No trigger configuration — streaming jobs stop automatically when the source is empty  

> [!success]- Answer
> **Correct Answer: B**
>
> `trigger(availableNow=True)` (Spark 3.3+) or `trigger(once=True)` processes all currently available data in the stream source and then terminates the query. This is ideal for scheduled batch-style streaming jobs. `processingTime="0 seconds"` runs as fast as possible but never stops. Streaming jobs do not stop automatically without explicit trigger configuration.

---

## Question 8 *(Medium)*

A notebook reads a 200-million-row PostgreSQL table with `spark.read.format("jdbc")`, setting only `url`, `dbtable`, `user`, and `password`. The Spark UI shows the read running as a single task while the other cores sit idle. Which change parallelizes the read?

A) Raise `fetchSize` to 1,000,000 rows  
B) Call `.repartition(64)` right after `.load()`  
C) Switch from `spark.read` to `spark.readStream`  
D) Set `partitionColumn` (an indexed numeric column), `lowerBound`, `upperBound`, and `numPartitions`  

> [!success]- Answer
> **Correct Answer: D**
>
> A JDBC read uses one thread by default. `partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions` split the key range into parallel queries against the database.
>
> `fetchSize` only sets how many rows come back per network round trip, and a very large value can cause out-of-memory errors. `repartition` runs after the single-threaded read has finished, so the read itself stays serial. The JDBC source isn't a streaming source, so `readStream` doesn't help.

---

## Question 9 *(Hard)*

A data engineer notices that a Delta streaming job fails with `StreamingQueryException: Detected a data update in the source table`. What caused this error?

A) The source Delta table had `OPTIMIZE` run on it while the stream was reading  
B) The source Delta table had rows `UPDATE`d or `DELETE`d, which is not supported by default streaming reads  
C) The streaming job ran out of memory due to large state size  
D) The checkpoint directory was deleted, causing the stream to restart  

> [!success]- Answer
> **Correct Answer: B**
>
> By default, Delta streaming reads assume an append-only source. If the source table has `UPDATE`, `DELETE`, or `MERGE` operations on existing rows, the stream throws this exception. To handle such sources, use `.option("skipChangeCommits", "true")` (recommended on DBR 12.2 LTS+; it replaces the legacy `ignoreChanges`), or switch to Change Data Feed for CDC-aware streaming.

---

## Question 10 *(Medium)*

An Auto Loader stream feeds a Bronze table whose schema downstream teams rely on, so it must not change. The vendor sometimes adds new JSON fields. The stream must keep running when that happens, and the unexpected values must not be lost. Which `cloudFiles.schemaEvolutionMode` fits?

A) `addNewColumns`  
B) `failOnNewColumns`  
C) `none`, with no rescued data column configured  
D) `rescue`  

> [!success]- Answer
> **Correct Answer: D**
>
> In `rescue` mode the schema never evolves and the stream doesn't fail. Values for unknown columns go into the `_rescued_data` column, so nothing is lost.
>
> `addNewColumns` changes the schema, and it stops the stream with `UnknownFieldException` before picking up the new column on restart. `failOnNewColumns` stops the stream and keeps it failed until someone updates the schema. `none` ignores new columns, and without a rescued data column their values are dropped.

---

## Question 11 *(Easy)*

A business user sends a data engineer a 40 MB CSV file. The engineer wants it in Unity Catalog quickly, with no code, as a governed file that other teams can later load with `read_files` or `COPY INTO`. Which path fits?

A) **New → Add or upload data → Upload files to a volume**, which needs `WRITE VOLUME` on the target volume  
B) Mount a cloud storage bucket to DBFS and copy the file there  
C) Configure a Lakeflow Connect managed connector for the file  
D) Publish the file to a Kafka topic and read it with Structured Streaming  

> [!success]- Answer
> **Correct Answer: A**
>
> The **Add or upload data** UI can upload local files into a Unity Catalog volume (`/Volumes/<catalog>/<schema>/<volume>/...`). It needs `WRITE VOLUME` on the volume and `USE CATALOG` and `USE SCHEMA` on its parents, and UI uploads accept up to 5 GB per file. Once the file is in a volume, `read_files`, `COPY INTO`, or Auto Loader can load it.
>
> DBFS mounts are deprecated in favor of Unity Catalog volumes and external locations. Managed connectors are for SaaS applications and databases. A Kafka topic is a streaming source for events, not a way to land one file.

---

## Question 12 *(Medium)*

A Bronze table has a `STRING` column named `raw` that holds JSON documents such as `{"customer": {"id": 42}, "line_items": [{"sku": "A1"}, {"sku": "B7"}]}`. Which Databricks SQL expression returns the first item's SKU (`A1`)?

A) `raw:line_items[0].sku`  
B) `raw.line_items[0].sku`  
C) `raw:line_items[1].sku`  
D) `explode(raw.line_items)`  

> [!success]- Answer
> **Correct Answer: A**
>
> When a column holds JSON **strings**, Databricks SQL extracts fields with the `:` path syntax, and array indexes are 0-based, so `raw:line_items[0].sku` returns `A1`.
>
> Dot notation works on `STRUCT` columns, not on a plain string. Index `[1]` returns the second element (`B7`). `explode` turns an array into rows and can't run on a string field reference like this. For new tables, Databricks recommends the `VARIANT` type over JSON strings.

---

## Data Transformation and Modeling (Questions 13–22)

## Question 13 *(Easy)*

A data engineer runs the following SQL command. What is the result?

```sql
CREATE OR REPLACE TABLE sales_summary AS
SELECT region, SUM(amount) AS total_sales
FROM transactions
GROUP BY region;
```

A) Creates a new table only if it does not already exist  
B) Creates a temporary view of the aggregated results  
C) Appends aggregated results to the existing table  
D) Creates a new table or replaces the entire table if it already exists  

> [!success]- Answer
> **Correct Answer: D**
>
> `CREATE OR REPLACE TABLE ... AS SELECT` (CRAS) creates a new table with the query results. If a table with that name already exists, it is completely replaced (dropped and recreated). Use `CREATE TABLE IF NOT EXISTS` to skip creation when the table exists, or `INSERT INTO` to append rows.

---

## Question 14 *(Easy)*

A Databricks SQL query must return all rows from the `orders` table and only the matching rows from the `customers` table. Which JOIN type accomplishes this?

A) INNER JOIN  
B) RIGHT JOIN  
C) LEFT JOIN  
D) CROSS JOIN  

> [!success]- Answer
> **Correct Answer: C**
>
> A LEFT JOIN returns all rows from the left table (`orders`) and matched rows from the right table (`customers`). Unmatched rows from `customers` appear as NULL. INNER JOIN returns only matched rows from both tables. RIGHT JOIN returns all rows from `customers` and matched rows from `orders` — the inverse of what is needed.

---

## Question 15 *(Medium)*

A data engineer needs to find the top 3 highest-selling products within each product category. Which SQL feature is most appropriate?

A) GROUP BY with HAVING clause  
B) Correlated subquery with LIMIT  
C) Window function with `RANK() OVER (PARTITION BY category ORDER BY sales DESC)`  
D) PIVOT table with category as columns  

> [!success]- Answer
> **Correct Answer: C**
>
> Window functions with `RANK()` or `ROW_NUMBER()` partitioned by category and ordered by sales descending assign a rank to each product within its category. Filtering `WHERE rank <= 3` returns the top 3 per category. `GROUP BY` with `HAVING` can't retrieve individual rows within groups. Subqueries with `LIMIT` don't partition by category.

---

## Question 16 *(Medium)*

A data engineer needs to apply a custom Python function to a column in a large Spark DataFrame. The function uses a third-party library not available as a built-in Spark function. What is the recommended approach?

A) Use `df.apply()` to apply the function row by row  
B) Register the function as a Spark UDF with `spark.udf.register()` or `udf()`  
C) Export the DataFrame to Pandas, apply the function, then convert back  
D) Use `df.withColumn()` with a Python lambda directly without registration  

> [!success]- Answer
> **Correct Answer: B**
>
> Spark UDFs (User-Defined Functions) allow custom Python logic to be applied to DataFrame columns in a distributed manner. They must be registered before use. Exporting to Pandas loses distributed processing and will fail on large datasets. `withColumn()` with a lambda doesn't work — Spark columns require Spark expressions or registered UDFs.

---

## Question 17 *(Easy)*

A data engineer uses `explode()` on a column containing arrays. What does this function do?

A) Converts an array column into multiple rows, one row per array element  
B) Removes all NULL values from array columns  
C) Flattens nested structs into separate columns  
D) Converts an array column into a string by joining elements  

> [!success]- Answer
> **Correct Answer: A**
>
> `explode()` takes an array (or map) column and generates one new row per element, duplicating all other column values. This is the standard way to "unnest" array data in Spark. `flatten()` flattens nested arrays. Struct flattening uses `col("field.*")`. `array_join()` converts an array to a string.

---

## Question 18 *(Easy)*

A data engineer needs to combine two DataFrames that have the same schema, keeping all rows from both including duplicates. Which operation should they use?

A) `df1.join(df2, how="full")`  
B) `df1.union(df2)`  
C) `df1.intersect(df2)`  
D) `df1.merge(df2)`  

> [!success]- Answer
> **Correct Answer: B**
>
> `union()` appends all rows from `df2` to `df1`, preserving duplicates. It requires both DataFrames to have the same schema (same column count and order). `join()` combines rows based on a key condition. `intersect()` returns only rows present in both DataFrames. Spark DataFrames don't have a `merge()` method.

---

## Question 19 *(Easy)*

A data engineer needs to pivot sales data so that each product category becomes a separate column showing total sales. Which SQL keyword accomplishes this?

A) UNPIVOT  
B) CROSSTAB  
C) PIVOT  
D) TRANSPOSE  

> [!success]- Answer
> **Correct Answer: C**
>
> `PIVOT` in Databricks SQL rotates rows into columns. You specify the pivot column (categories) and the aggregation (SUM of sales). `UNPIVOT` does the reverse — converts columns to rows. `CROSSTAB` is not a standard SQL keyword in Databricks. `TRANSPOSE` is not a SQL operation.

---

## Question 20 *(Medium)*

A data engineer needs to upsert records into a Delta table: update existing customer records when `customer_id` matches, and insert new records when there is no match. Which clause correctly completes the MERGE statement?

```sql
MERGE INTO customers AS target
USING updates AS source
ON target.customer_id = source.customer_id
WHEN MATCHED THEN
  UPDATE SET target.name = source.name, target.email = source.email
WHEN NOT MATCHED THEN
  ___________
```

A) `INSERT VALUES (source.customer_id, source.name, source.email)`  
B) `INSERT INTO customers SELECT * FROM source`  
C) `INSERT (customer_id, name, email) VALUES (source.customer_id, source.name, source.email)`  
D) `INSERT * FROM source`  

> [!success]- Answer
> **Correct Answer: C**
>
> The correct MERGE `WHEN NOT MATCHED` syntax is `INSERT (column_list) VALUES (source.column_list)`. The column list explicitly names the target columns, and the VALUES clause provides the source values. Option A is missing the column list. Options B and D are not valid MERGE syntax.

---

## Question 21 *(Easy)*

A data engineer uses the medallion architecture. Which layer is responsible for enforcing data quality rules, deduplication, and applying business logic transformations?

A) Bronze layer — stores raw, unmodified ingested data  
B) Silver layer — stores cleaned, filtered, and enriched data with quality checks applied  
C) Gold layer — stores aggregate KPIs and metrics for reporting  
D) The medallion architecture has no dedicated quality enforcement layer  

> [!success]- Answer
> **Correct Answer: B**
>
> The Silver layer is where data quality enforcement, deduplication, schema normalization, and business logic transformations occur. Bronze stores raw data as-is for auditability and reprocessing. Gold stores aggregated, business-ready data optimized for analytics and BI reporting.

---

## Question 22 *(Medium)*

A DLT pipeline has an `EXPECT` constraint: `EXPECT (amount > 0) ON VIOLATION DROP ROW`. A batch of 1,000 records arrives and 50 have `amount <= 0`. What happens?

A) The entire batch fails and no records are written  
B) All 1,000 records are written, and the 50 violating records are flagged in the event log  
C) The 50 violating records are dropped and 950 valid records are written to the table  
D) The pipeline pauses and waits for manual intervention to resolve the violations  

> [!success]- Answer
> **Correct Answer: C**
>
> `ON VIOLATION DROP ROW` instructs DLT to discard rows that fail the expectation and continue processing valid rows. Violation counts are tracked in the DLT event log. `ON VIOLATION FAIL UPDATE` would fail the pipeline on any violation. `ON VIOLATION WARN` (the default with no modifier) writes all rows but logs violations without dropping any.

---

## Working with Lakeflow Jobs (Questions 23–29)

## Question 23 *(Medium)*

A data engineer needs to run a notebook that performs interactive EDA (exploratory data analysis) with visualizations, then automatically hand off to a scheduled production pipeline. Which Databricks features best match these two phases respectively?

A) All-purpose cluster for EDA; DLT pipeline for production  
B) Job cluster for EDA; all-purpose cluster for production  
C) SQL warehouse for EDA; serverless compute for production  
D) All-purpose cluster for EDA; job cluster with Lakeflow Jobs for production  

> [!success]- Answer
> **Correct Answer: D**
>
> All-purpose clusters support interactive notebook sessions ideal for EDA with visualizations and iterative development. Lakeflow Jobs with job clusters provide automated, scheduled, cost-efficient execution for production pipelines. Job clusters terminate after the job completes, reducing cost. SQL warehouses are optimized for SQL queries, not general notebook EDA.

---

## Question 24 *(Medium)*

A partner drops files into a Unity Catalog volume at unpredictable times, from zero to several drops a day. The team wants each drop processed within minutes and doesn't want runs that find no new data. Which Lakeflow Jobs trigger fits best?

A) A scheduled trigger that runs every 5 minutes  
B) A continuous trigger  
C) A file arrival trigger on the volume, with Auto Loader in the job to process only the new files  
D) A table update trigger on the Bronze table that the job writes to  

> [!success]- Answer
> **Correct Answer: C**
>
> A file arrival trigger monitors a Unity Catalog external location or volume and starts a run when new files land. It checks for new files about every minute, on a best-effort basis. Inside the job, Auto Loader processes exactly the new files.
>
> A 5-minute schedule starts many runs that find no data. A continuous trigger keeps a run active all the time. A table update trigger fires when a monitored table changes, but here the Bronze table is the job's own output, so it can't tell the job that new files have arrived.

---

## Question 25 *(Medium)*

A data engineer is designing a Lakeflow Job with three tasks: `ingest → transform → report`. The `report` task must only run if `transform` succeeds. How should task dependencies be configured?

A) Use a single-task job with all logic in one notebook to avoid dependency issues  
B) Set `transform` and `report` to run in parallel to reduce total execution time  
C) Use separate jobs for each task and chain them with external orchestration  
D) Configure `transform` as a dependency of `report` using the `depends_on` task setting  

> [!success]- Answer
> **Correct Answer: D**
>
> Lakeflow Jobs supports multi-task jobs with explicit task dependencies via `depends_on`. When `transform` fails, downstream tasks (`report`) don't run and are marked `Upstream failed` (default Run if: *All succeeded*). Running tasks in parallel would not enforce the required sequential dependency. Separate jobs with external orchestration adds unnecessary complexity.

---

## Question 26 *(Medium)*

A Lakeflow Job must run the same `load_table` notebook for 40 source tables, passing a different table name each time, with up to 5 loads running at once. What is the documented way to build this?

A) Add 40 notebook tasks, one per table, each with a hard-coded table name  
B) Add an If/else condition task that checks the table name  
C) Add a Run Job task that triggers the job again for each table  
D) Add a For each task over a JSON array of table names, with the notebook as its nested task and concurrency set to 5  

> [!success]- Answer
> **Correct Answer: D**
>
> The **For each** task runs one nested task once per element of an input array. Each iteration reads its value with `{{input}}` (or `{{input.<key>}}` for objects), and **concurrency** sets how many iterations run in parallel. It defaults to 1.
>
> Forty copied tasks work, but every change has to be repeated 40 times. If/else branches on a condition. It doesn't loop. A Run Job task triggers another job as a step, which isn't a loop over inputs.

---

## Question 27 *(Medium)*

A production job fails intermittently due to transient cloud API errors. What built-in Lakeflow Jobs feature can automatically retry failed tasks without manual intervention?

A) Task timeout configuration — the task retries when it exceeds the timeout  
B) Per-task retry policy with configurable maximum retries and retry interval  
C) Workflow-level SLA notifications that page the on-call engineer  
D) Databricks auto-recovers all failed tasks by default with no configuration needed  

> [!success]- Answer
> **Correct Answer: B**
>
> Lakeflow Jobs allows configuring a retry policy per task, specifying the maximum number of retry attempts and the interval between retries. This handles transient failures automatically. Timeout configuration controls how long a task runs before being killed, not whether it retries. Auto-recovery is not enabled by default.

---

## Question 28 *(Medium)*

The last task of a job, `cleanup`, drops staging tables. It depends on the `transform` task and uses the default dependency settings. Whenever `transform` fails, `cleanup` is skipped and marked `Upstream failed`. Which setting makes `cleanup` run whatever happens upstream?

A) Set `cleanup`'s **Run if** condition to **All done**  
B) Add a retry policy to `transform`  
C) Set `cleanup`'s **Run if** condition to **At least one succeeded**  
D) Raise the timeout on `cleanup`  

> [!success]- Answer
> **Correct Answer: A**
>
> **All done** runs a task once all its dependencies have finished, whatever their outcome, which is the documented choice for cleanup tasks. The default, **All succeeded**, marks the task `Upstream failed` when a dependency fails.
>
> **At least one succeeded** still skips `cleanup` here, because its only dependency failed. Retries make `transform` more likely to succeed, but `cleanup` is still skipped if every attempt fails. A timeout limits how long a task runs. It doesn't decide whether the task starts.

---

## Question 29 *(Medium)*

A data engineer configures a Lakeflow Job with a schedule of `0 0 8 * * ?` (Quartz cron format). When does this job run?

A) Every 8 minutes  
B) Every hour at minute 8  
C) At 8:00 AM every day  
D) At 8:00 AM on the 8th of every month  

> [!success]- Answer
> **Correct Answer: C**
>
> In Quartz cron format, fields are: second minute hour day-of-month month day-of-week. So `0 0 8 * * ?` means second=0, minute=0, hour=8, every day, every month. This fires at exactly 8:00:00 AM daily. `0 8 * * * ?` would run every hour at minute 8. `0 0 0 8 * ?` would run at midnight on the 8th of each month.

---

## Implementing CI/CD (Questions 30–34)

## Question 30 *(Easy)*

An engineer deploys a bundle with `databricks bundle deploy -t dev`. The `dev` target sets `mode: development`. The deployed job has a daily schedule in its YAML, but the schedule never fires. Why?

A) Development mode pauses schedules and triggers on deployed resources  
B) Bundles can't deploy job schedules. Schedules must be added in the Jobs UI  
C) Scheduled jobs deployed from a bundle must run as a service principal  
D) The schedule fires only after the bundle is also deployed to the `prod` target  

> [!success]- Answer
> **Correct Answer: A**
>
> `mode: development` pauses schedules and triggers on the resources it deploys. It also prefixes their names with `[dev <user>]`, so personal copies don't run on their own or clash with shared ones.
>
> Run the job with `databricks bundle run`, or unpause it explicitly in dev. Bundles do deploy schedules (`schedule.quartz_cron_expression` in the job YAML), and in `mode: production` they stay active. A service principal is recommended for production deployments, but it isn't why a dev schedule is paused.

---

## Question 31 *(Easy)*

An engineer has committed and pushed the branch `feature/orders-dedup` from a Databricks Git folder. The team requires a review before any change is merged into `main`. Where is the pull request opened, reviewed, and merged?

A) In the Git folder, with **Merge** from the Git dialog's kebab menu  
B) In the notebook's revision history  
C) By running `databricks bundle deploy -t prod`  
D) In the Git provider's interface, such as GitHub, GitLab, or Azure DevOps  

> [!success]- Answer
> **Correct Answer: D**
>
> Git folders handle branches, commits, pushes, and pulls in the workspace. The Databricks docs say to use your Git provider's interface to create a pull request and merge it into the default branch, where branch protection and reviews are enforced.
>
> Merging locally from the Git dialog skips the review the team requires. Notebook revision history has no branches or pull requests. Deploying a bundle releases code. It doesn't review or merge it.

---

## Question 32 *(Medium)*

A bundle needs a source database password at deploy time. A reviewer finds the password set as the `default` of a variable in `databricks.yml`. What is the recommended fix?

A) Base64-encode the password before saving it as the default  
B) Move the password under `targets.prod.variables` so it only applies to production  
C) Store the password in a notebook widget's default value instead  
D) Remove the default, rotate the password, and have the CI runner export `BUNDLE_VAR_db_password` from its secret store  

> [!success]- Answer
> **Correct Answer: D**
>
> Secrets never belong in bundle YAML or notebooks, because both are committed to Git. Declare the variable with no default and let CI supply it as the `BUNDLE_VAR_<name>` environment variable from its secret store, so the value never touches the repository. A password that was committed should also be rotated.
>
> Base64 is an encoding, not encryption. A target-level value and a widget default are both still in Git. At run time, notebooks can read credentials with `dbutils.secrets.get`.

---

## Question 33 *(Medium)*

A team's GitHub Actions workflow should fail a pull request check when the bundle configuration is malformed, without deploying anything. Which command should the workflow run?

A) `databricks bundle validate`  
B) `databricks bundle summary`  
C) `databricks bundle destroy`  
D) `databricks bundle generate`  

> [!success]- Answer
> **Correct Answer: A**
>
> `databricks bundle validate` checks that the bundle configuration files are syntactically correct, which makes it the standard first step of a CI pipeline before `deploy -t <target>`.
>
> `summary` lists the bundle's identity and already deployed resources. `destroy` deletes previously deployed jobs, pipelines, and artifacts. `generate` writes bundle YAML for a resource that already exists in the workspace.

---

## Question 34 *(Medium)*

Two engineers work on the same feature branch, each in their own Git folder. Engineer B has pushed new commits. Engineer A has no local changes and wants B's commits in their Git folder. Which Git folder operation should A use?

A) **Pull**  
B) **Reset**  
C) **Rebase**  
D) **Commit & Push**  

> [!success]- Answer
> **Correct Answer: A**
>
> **Pull** updates the Git folder's notebooks and files to the remote version. It also clears notebook state, so cells need to be re-run.
>
> **Reset** is the equivalent of `git reset --hard` plus `git push --force`, and it discards both uncommitted and committed changes on the local and the remote branch. **Rebase** ends with a force push that rewrites history for collaborators. **Commit & Push** sends local changes to the remote, and there aren't any here.

---

## Troubleshooting, Monitoring, and Optimization (Questions 35–38)

## Question 35 *(Hard)*

A data engineer writes a SQL query joining three large tables. The query is slow and the Spark UI shows excessive shuffle volume. Which optimization should they apply first?

A) Increase the number of shuffle partitions with `spark.sql.shuffle.partitions`  
B) Use broadcast join hints for small dimension tables: `/*+ BROADCAST(dim) */`  
C) Convert all joins to CROSS JOINs for performance  
D) Add more worker nodes to the cluster  

> [!success]- Answer
> **Correct Answer: B**
>
> If one or more tables are small enough to fit in memory (~200MB or less), a broadcast join eliminates the shuffle entirely by sending the small table to every executor. This is the most impactful optimization for join-heavy queries. Increasing shuffle partitions only changes partition count, not the total shuffle volume. Adding nodes doesn't eliminate the shuffle.

---

## Question 36 *(Easy)*

A Delta table has accumulated many small Parquet files over several months of streaming ingestion. A data engineer runs `OPTIMIZE` on the table. What is the primary effect?

A) Rewrites small Parquet files into larger, more efficient files to improve read performance  
B) Deletes files marked for deletion by previous VACUUM operations  
C) Recalculates column statistics and updates the transaction log  
D) Converts the table from Parquet format to a different columnar format  

> [!success]- Answer
> **Correct Answer: A**
>
> `OPTIMIZE` compacts small files into larger files (typically targeting 1GB) to reduce the overhead of reading many small files and improve scan efficiency. It does not delete files — `VACUUM` handles that. Statistics updates are a secondary benefit. Delta Lake always uses Parquet as its underlying storage format.

---

## Question 37 *(Medium)*

A data engineer runs `VACUUM transactions RETAIN 168 HOURS`. What is the effect on time travel capabilities?

A) No effect — VACUUM only removes duplicated data, not historical versions  
B) Historical data files older than 168 hours (7 days) are permanently deleted and time travel to those versions is no longer possible  
C) Delta Lake automatically creates a backup before running VACUUM  
D) VACUUM retains exactly 168 versions of the table, not based on time  

> [!success]- Answer
> **Correct Answer: B**
>
> `VACUUM` removes data files no longer referenced by the transaction log that are older than the retention period. Once vacuumed, time travel queries to those older versions fail because the underlying Parquet files are deleted. The default retention is 7 days (168 hours). Delta Lake does not automatically create backups before VACUUM.

---

## Question 38 *(Medium)*

A data engineer wants to Z-ORDER a Delta table by the `customer_id` column to improve query performance. When does Z-ORDER provide the most benefit?

A) When queries always perform full table scans without any filters  
B) Z-ORDER provides no benefit on Delta tables; use partitioning for all performance needs  
C) When the table has fewer than 10 files and is already compact  
D) When queries frequently filter on `customer_id`, enabling Delta's data skipping to skip entire files  

> [!success]- Answer
> **Correct Answer: D**
>
> Z-ORDER co-locates related values within the same set of files, enabling Delta Lake's data skipping to skip entire files that don't contain queried `customer_id` values. This is most beneficial for high-cardinality columns frequently used in `WHERE` clauses. If queries always scan the full table, or the table is very small, Z-ORDER provides no benefit.

---

## Governance and Security (Questions 39–45)

## Question 39 *(Medium)*

An analyst needs to access data stored in an external S3 bucket from a Databricks cluster without hardcoding credentials in notebooks. Which approach is most appropriate?

A) Store credentials in a notebook cell marked as hidden  
B) Use Databricks Secrets with `dbutils.secrets.get()` to retrieve credentials at runtime  
C) Export credentials as environment variables in the cluster init script  
D) Pass credentials as job parameters in the Lakeflow Jobs UI  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Secrets provides a secure vault for storing sensitive values. `dbutils.secrets.get()` retrieves them at runtime and the values are never shown in logs or notebook output. Hardcoding in notebooks or init scripts exposes credentials in version control and logs. Job parameters are visible in the UI and logs.

---

## Question 40 *(Medium)*

Members of the `emea_sales` group must see only the EMEA rows of `main.silver.orders`, and members of `admins` must see every row. Which Unity Catalog implementation fits?

A) A SQL UDF that returns `BOOLEAN` using `is_account_group_member()`, attached with `ALTER TABLE main.silver.orders SET ROW FILTER <function> ON (region)`  
B) A column mask on the `region` column that returns `NULL` for non-EMEA values  
C) `DENY SELECT ON TABLE main.silver.orders TO emea_sales`  
D) A separate copy of the table for each region, with `SELECT` granted per group  

> [!success]- Answer
> **Correct Answer: A**
>
> A **row filter** is a SQL UDF that returns `BOOLEAN` for each row. For example, `is_account_group_member('admins') OR (is_account_group_member('emea_sales') AND region = 'EMEA')`, attached with `SET ROW FILTER ... ON (region)`. Unity Catalog applies it to every query on the table.
>
> A column mask changes the values in a column but returns every row. The classic `DENY` statement works only on the legacy Hive metastore, and it would hide the whole table anyway. Per-region copies duplicate data and drift out of sync.

---

## Question 41 *(Hard)*

A data engineer needs to grant a user access to query a specific table in Unity Catalog without giving access to the entire schema. What is the minimum set of privileges required?

A) `GRANT SELECT ON TABLE catalog.schema.table TO user` only  
B) `GRANT SELECT ON SCHEMA catalog.schema TO user` only  
C) `USE CATALOG` on the catalog + `USE SCHEMA` on the schema + `SELECT` on the table  
D) `GRANT ALL PRIVILEGES ON TABLE catalog.schema.table TO user`  

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog uses hierarchical privilege inheritance. To query a table, a user needs: `USE CATALOG` on the parent catalog, `USE SCHEMA` on the parent schema, and `SELECT` on the specific table. Without the `USE` privileges at each level, the user cannot navigate to the table even if `SELECT` is granted on the table itself. Granting `ALL PRIVILEGES` is overly permissive.

---

## Question 42 *(Medium)*

A company wants to share a Delta table with an external partner organization that uses a different cloud provider, without copying the underlying data. Which Databricks feature enables this?

A) External Location with cross-account IAM role  
B) DBFS mount with public access enabled  
C) Unity Catalog data lineage export  
D) Delta Sharing — an open protocol for sharing live data across organizations  

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Sharing is an open, REST-based protocol that enables sharing live Delta Lake data with external organizations without copying data or requiring the recipient to use Databricks. Recipients access shared data using open-source Delta Sharing clients in Python, Spark, or pandas. External Locations manage access to cloud storage within the same organization, not across organizations.

---

## Question 43 *(Hard)*

In a Unity Catalog-enabled workspace, an engineer runs `DENY SELECT ON TABLE prod.gold.revenue TO contractors`, and the statement fails. Contractors must not read the table. What is the correct approach?

A) Run the same `DENY` statement as the table owner, because `DENY` requires ownership  
B) `REVOKE SELECT ON TABLE prod.gold.revenue FROM contractors` (and from any groups that give them access), or don't grant it at all  
C) Apply the `DENY` at the catalog level instead, so it is inherited by the table  
D) Run `ALTER TABLE prod.gold.revenue SET DENY SELECT FOR contractors`  

> [!success]- Answer
> **Correct Answer: B**
>
> The classic `DENY` statement is a legacy Hive metastore feature. In Unity Catalog, users can read a table only with an explicit or inherited `SELECT` grant, so you remove access with `REVOKE`, including from the groups the contractors belong to, or by never granting it. Partial access is handled with row filters, column masks, or ABAC policies.
>
> Unity Catalog's only deny mechanism is the ABAC DENY policy (Beta), which currently covers just `MANAGE ACCESS CONTROL`, not `SELECT`. `SET DENY` is not valid syntax.

---

## Question 44 *(Hard)*

A data engineering team creates Unity Catalog external tables pointing to existing data in S3. Which Unity Catalog objects must be configured, and in what order?

A) Storage Credential only — it automatically creates External Locations for referenced paths  
B) External Location only — it includes embedded credential configuration  
C) Catalog first, then Schema, then External Location  
D) Storage Credential first (defines the IAM identity), then External Location (maps the cloud path to the credential)  

> [!success]- Answer
> **Correct Answer: D**
>
> Configuring external storage access in Unity Catalog requires two objects in order: (1) a **Storage Credential** that holds the IAM role or service principal identity with cloud storage permissions, and (2) an **External Location** that maps a specific cloud storage path (e.g., `s3://bucket/prefix`) to that credential. External tables can then reference paths within registered External Locations.

---

## Question 45 *(Medium)*

A data engineer wants to audit who accessed a specific Unity Catalog table and when. Which Databricks feature provides this capability?

A) Delta Lake transaction log (`_delta_log`) — records all read and write operations  
B) Databricks system tables (`system.access.audit`) — captures access events including table reads  
C) Unity Catalog lineage graph — shows data flow but not individual user access events  
D) Spark UI history server — stores query history with user attribution  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks system tables include audit logs in `system.access.audit` that record who accessed what resources and when. The Delta transaction log records write operations (inserts, updates, deletes) but not reads. Lineage shows data flow between datasets. The Spark UI history tracks queries but is not designed for security auditing and has limited retention.

---

## Answer Key

| # | Answer | # | Answer | # | Answer |
|---|--------|---|--------|---|--------|
| 1 | D | 16 | B | 31 | D |
| 2 | C | 17 | A | 32 | D |
| 3 | C | 18 | B | 33 | A |
| 4 | A | 19 | C | 34 | A |
| 5 | A | 20 | C | 35 | B |
| 6 | C | 21 | B | 36 | A |
| 7 | B | 22 | C | 37 | B |
| 8 | D | 23 | D | 38 | D |
| 9 | B | 24 | C | 39 | B |
| 10 | D | 25 | D | 40 | A |
| 11 | A | 26 | D | 41 | C |
| 12 | A | 27 | B | 42 | D |
| 13 | D | 28 | A | 43 | B |
| 14 | C | 29 | C | 44 | D |
| 15 | C | 30 | A | 45 | B |

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

| Domain (Aug 2026 weight) | Questions | Your Score | Percentage |
| ------ | --------- | ---------- | ---------- |
| Databricks Intelligence Platform (6 %) | 1–3 (3 questions) | ___/3 | ___% |
| Data Ingestion and Loading (21 %) | 4–12 (9 questions) | ___/9 | ___% |
| Data Transformation and Modeling (22 %) | 13–22 (10 questions) | ___/10 | ___% |
| Working with Lakeflow Jobs (16 %) | 23–29 (7 questions) | ___/7 | ___% |
| Implementing CI/CD (10 %) | 30–34 (5 questions) | ___/5 | ___% |
| Troubleshooting, Monitoring, and Optimization (10 %) | 35–38 (4 questions) | ___/4 | ___% |
| Governance and Security (15 %) | 39–45 (7 questions) | ___/7 | ___% |
| **Total** | **45 questions** | **___/45** | **___%** |

---

[← Back to Mock Exam](./README.md) | [Try Mock Exam 2](../mock-exam-2/README.md)
