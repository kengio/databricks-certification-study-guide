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

> [!note] Platform update (Oct 2026)
> Questions are grouped by the 7 domains of the August 2026 exam guide. Some stems still use legacy names: **DLT / Delta Live Tables** = Lakeflow Declarative Pipelines (now **Lakeflow Spark Declarative Pipelines**, renamed Nov 12, 2025), and `@dlt.*` decorators still work, although the `pyspark.pipelines` (`dp`) module is now recommended. **Delta Sharing** is now **OpenSharing** (Jun 10, 2026).

---

## Databricks Intelligence Platform (Questions 1–3)

## Question 1 *(Medium)*

An analyst notices that a Databricks SQL warehouse is taking 3 minutes to run the first query of the day but subsequent queries run in seconds. What is the most likely cause?

A) The warehouse has a cold start delay because the compute nodes were terminated during the idle period  
B) The warehouse is running out of memory after the first query  
C) The first query always runs as a dry run without caching  
D) The SQL optimizer is recomputing all table statistics for the first query  

> [!success]- Answer
> **Correct Answer: A**
>
> SQL warehouses auto-stop after an idle period (defaults: 10 minutes for serverless, 45 minutes for pro and classic) to save cost. When a new query arrives, a stopped pro or classic warehouse must start again, which takes about 4 minutes. Serverless SQL warehouses start in about 2–6 seconds. Subsequent queries run fast because the cluster is already running.

---

## Question 2 *(Medium)*

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

## Question 3 *(Medium)*

A data engineer needs a copy of a Delta table to test schema changes without affecting production. They need the copy to be fast and space-efficient, sharing underlying files with the source. Which clone type should they use?

A) Deep clone — copies all data files to a new location  
B) Databricks snapshot — an automatic backup created by the platform  
C) CTAS (CREATE TABLE AS SELECT) — creates an independent copy with full data duplication  
D) Shallow clone — creates a copy that references the source table's data files without copying them  

> [!success]- Answer
> **Correct Answer: D**
>
> Shallow clone creates a Delta table that references the source's data files without copying them, making it fast and storage-efficient. Schema and metadata are independent, so changes to the clone don't affect the source. Deep clone physically copies all data files to a new location — useful for true independence. CTAS also copies all data.

---

## Data Ingestion and Loading (Questions 4–12)

## Question 4 *(Medium)*

A data engineer must choose between COPY INTO and Auto Loader for ingesting files from cloud storage. Which statement correctly describes when to use each?

A) COPY INTO is for structured files; Auto Loader is for unstructured files  
B) Auto Loader is deprecated; COPY INTO is the only recommended approach  
C) COPY INTO is idempotent and suits smaller, known file sets; Auto Loader suits continuous, large-scale ingestion with automatic file tracking  
D) Both are equivalent — the choice is purely based on personal preference  

> [!success]- Answer
> **Correct Answer: C**
>
> COPY INTO is a SQL command that idempotently loads files into a Delta table (skipping already-loaded files) — suitable for smaller or periodic batch loads from a known set of files. Auto Loader uses checkpointing and cloud notifications to efficiently handle millions of files continuously at scale, making it the recommended approach for streaming ingestion pipelines.

---

## Question 5 *(Easy)*

An Auto Loader stream ingests JSON files with `cloudFiles.schemaLocation` set and no other schema options. Every column in the Bronze table, including `amount` and `event_ts`, ends up as `STRING`. What explains this?

A) For JSON, CSV, and XML, Auto Loader infers columns as strings unless `cloudFiles.inferColumnTypes` is `true` or `cloudFiles.schemaHints` sets the types  
B) Auto Loader always writes `STRING` columns to Bronze tables, and types are applied only in Silver  
C) The schema location is corrupt, so Auto Loader fell back to strings  
D) JSON files can't carry numeric or timestamp values, so strings are the only option  

> [!success]- Answer
> **Correct Answer: A**
>
> When Auto Loader infers a schema for JSON, CSV, or XML, it reads every column as a string by default. Setting `cloudFiles.inferColumnTypes` to `true` infers real types, and `cloudFiles.schemaHints` (SQL DDL such as `amount DECIMAL(10,2)`) overrides or adds specific types.
>
> Avro and Parquet carry their types in the files, so they don't need this option. Nothing forces Bronze columns to be strings, and the behavior here is the documented default, not a fallback after an error.

---

## Question 6 *(Medium)*

A data engineer writes `df = spark.read.format("delta").load("/path/to/table")`. What is the difference if they use `spark.readStream` instead of `spark.read`?

A) `readStream` reads the entire table into memory at once; `read` reads in chunks  
B) `readStream` automatically converts the Delta table to a Kafka stream  
C) There is no difference — both return identical DataFrames  
D) `readStream` returns a streaming DataFrame that only processes new files/rows added since the last checkpoint  

> [!success]- Answer
> **Correct Answer: D**
>
> `spark.readStream.format("delta").load(path)` creates a streaming DataFrame that treats the Delta table as a streaming source. It processes only new data (rows appended after the checkpoint) in each micro-batch. `spark.read` returns a static (batch) DataFrame representing the full table at the time of reading. The two APIs have fundamentally different execution semantics.

---

## Question 7 *(Medium)*

A data engineer configures Auto Loader with `cloudFiles.schemaEvolutionMode = "addNewColumns"`. A new column appears in incoming JSON files. What happens?

A) The stream fails and can't restart until the schema is manually updated  
B) The new column is silently ignored and not written to the Delta table  
C) The stream stops with an `UnknownFieldException` after recording the new column. When restarted, it adds the column to the schema and continues  
D) Auto Loader quarantines files with new columns for manual review  

> [!success]- Answer
> **Correct Answer: C**
>
> With `addNewColumns` (the default when no schema is provided), Auto Loader stops the stream with `UnknownFieldException`, saves the evolved schema, and picks up the new column on restart. That's why Databricks recommends running these streams in Lakeflow Jobs with retries. `failOnNewColumns` is the mode that stays failed until the schema is fixed, and `rescue` puts unexpected columns into `_rescued_data` ([schema evolution](https://docs.databricks.com/aws/en/ingestion/cloud-object-storage/auto-loader/schema)).

---

## Question 8 *(Hard)*

A data engineer sets a watermark on a streaming query: `withWatermark("event_time", "10 minutes")`. What is the purpose of this watermark?

A) Defines the maximum tolerated lateness for event-time-based aggregations, allowing late data up to 10 minutes after the window closes  
B) Ensures that data older than 10 minutes is deleted from the Delta table  
C) Buffers all incoming data for exactly 10 minutes before writing to the sink  
D) Limits the streaming query to process at most 10 minutes of historical data  

> [!success]- Answer
> **Correct Answer: A**
>
> Watermarks in Spark Structured Streaming define how late data can arrive and still be included in aggregations. A 10-minute watermark means data with an event_time up to 10 minutes behind the current watermark is included; older data is dropped. This allows Spark to bound the state size by eventually discarding old windows.

---

## Question 9 *(Medium)*

An Auto Loader stream reads a landing directory that holds millions of files. Each micro-batch spends most of its time listing the directory. Which change does Databricks recommend for most workloads?

A) Set `cloudFiles.useIncrementalListing` to `true`  
B) Raise `cloudFiles.maxFilesPerTrigger` to 100,000  
C) Replace Auto Loader with a scheduled `COPY INTO`  
D) Use file notification mode with file events enabled on the Unity Catalog external location  

> [!success]- Answer
> **Correct Answer: D**
>
> Directory listing, the default mode, lists the input directory on every micro-batch, which gets slow as the directory grows. Databricks recommends **file notification with file events**, enabled on the Unity Catalog external location, as more performant and scalable. You can switch modes across stream restarts and keep exactly-once processing.
>
> `cloudFiles.useIncrementalListing` is deprecated. `maxFilesPerTrigger` caps how many files each micro-batch takes, but discovery still has to list the directory. `COPY INTO` is meant for modest, known file sets, not millions of files.

---

## Question 10 *(Medium)*

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

## Question 11 *(Medium)*

A data engineer has a CSV directory and wants to convert it to a managed Delta table in Unity Catalog. Which approach creates a properly managed Delta table?

A) `CONVERT TO DELTA parquet.'/path/to/csv/'` — converts any format to Delta  
B) Delta tables can only be created from Parquet format; CSV must first be converted to Parquet  
C) `ALTER TABLE csv_table SET TYPE DELTA`  
D) `CREATE TABLE catalog.schema.table USING DELTA AS SELECT * FROM csv.'/path/'`  

> [!success]- Answer
> **Correct Answer: D**
>
> `CREATE TABLE ... USING DELTA AS SELECT * FROM csv.'/path/'` reads the CSV files and creates a new managed Delta table with the query results. `CONVERT TO DELTA` works only on Parquet-formatted directories (not CSV). `ALTER TABLE SET TYPE` is not valid Databricks SQL syntax. Delta tables can be created from any format via CTAS.

---

## Question 12 *(Medium)*

A team sets up a Lakeflow Connect managed connector for continuous change data capture from SQL Server. Which component runs continuously in its own job and stages the change data before it is written to the destination?

A) The Unity Catalog connection  
B) The destination streaming tables  
C) The ingestion gateway  
D) The ingestion pipeline  

> [!success]- Answer
> **Correct Answer: C**
>
> Database connectors add an **ingestion gateway**. It runs as a continuous task in its own job and stages change data for continuous change capture.
>
> The **connection** is a Unity Catalog securable that stores the source's authentication details. The **ingestion pipeline** reads the staged changes and writes them to the destination, and the destination tables are **streaming tables** in the catalog and schema you pick.

---

## Data Transformation and Modeling (Questions 13–22)

## Question 13 *(Medium)*

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
B) Yes — `discount != 0` returns all non-zero values including NULL  
C) No — `IS NOT NULL` excludes NULL values; rows with NULL discount are filtered out  
D) A SQL error occurs because you cannot compare NULL with `!=`  

> [!success]- Answer
> **Correct Answer: C**
>
> `IS NOT NULL` filters out rows where the column contains NULL. Since both conditions are joined with `AND`, a row with `NULL` discount fails the `IS NOT NULL` check and is excluded. In SQL, `NULL != 0` evaluates to NULL (not TRUE), so NULL values are also excluded by the `!=` comparison — but `IS NOT NULL` already removes them first.

---

## Question 16 *(Medium)*

A data engineer writes Delta table data using `df.write.format("delta").mode("append").save(path)`. What happens if the path already contains a Delta table with a different schema?

A) The write succeeds and merges the schemas automatically  
B) The new data is silently dropped and the existing table is unchanged  
C) The existing table is overwritten with the new schema  
D) The write fails with a `AnalysisException` due to schema mismatch unless `mergeSchema` is enabled  

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Lake enforces schema consistency by default. Appending data with a different schema throws an `AnalysisException`. To allow schema evolution during appends, enable `.option("mergeSchema", "true")` which adds new columns from the source. Overwriting behavior requires `.mode("overwrite")`, not `"append"`.

---

## Question 17 *(Easy)*

A data engineer queries a table with millions of rows and needs to know the count of distinct values in a column. Which function returns this?

A) `COUNT(DISTINCT column)`  
B) `COUNT(column)`  
C) `SUM(DISTINCT column)`  
D) `APPROX_COUNT_DISTINCT(column)`  

> [!success]- Answer
> **Correct Answer: A**
>
> `COUNT(DISTINCT column)` returns the exact number of distinct non-NULL values in the column. `COUNT(column)` counts non-NULL rows including duplicates. `SUM(DISTINCT column)` sums distinct numeric values, not counts. `APPROX_COUNT_DISTINCT()` uses HyperLogLog for an approximate count — faster for very large datasets but not exact.

---

## Question 18 *(Medium)*

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

## Question 19 *(Medium)*

A data engineer receives a DataFrame with a column containing nested arrays of arrays (e.g., `[[1,2],[3,4]]`). Which function flattens this into a single-level array (e.g., `[1,2,3,4]`)?

A) `explode()`  
B) `transform()`  
C) `array_join()`  
D) `flatten()`  

> [!success]- Answer
> **Correct Answer: D**
>
> `flatten(array_of_arrays)` converts a nested array (array of arrays) into a single flat array by concatenating the inner arrays. `explode()` creates one row per element — it doesn't flatten, it unnests. `array_join()` converts an array to a string. `transform()` applies a lambda to each element, producing an array of the same depth.

---

## Question 20 *(Hard)*

A data engineer needs to delete records from a Delta table where a customer opted out, and also update other customers' status in the same operation. Which SQL command handles both in a single atomic operation?

A) Run `DELETE` and `UPDATE` as separate transactions in sequence  
B) `TRUNCATE TABLE customers` then reinsert only the retained records  
C) `MERGE INTO customers USING opt_outs ON ... WHEN MATCHED AND condition THEN DELETE WHEN MATCHED AND other_condition THEN UPDATE SET ...`  
D) Use a Python loop to delete and update records one by one  

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake's `MERGE` statement supports multiple `WHEN MATCHED` clauses with different conditions — one can trigger `DELETE` and another can trigger `UPDATE SET`. This executes atomically in a single pass over the data. Running `DELETE` and `UPDATE` as separate transactions is correct but not atomic as a combined unit. `TRUNCATE` and reinsert is expensive and error-prone.

---

## Question 21 *(Medium)*

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

## Question 22 *(Medium)*

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

## Working with Lakeflow Jobs (Questions 23–29)

## Question 23 *(Medium)*

A data engineer uses `dbutils.widgets.text("start_date", "2024-01-01")` in a notebook. What is the purpose of this widget?

A) Displays a text message at the top of the notebook output  
B) Logs the value `"2024-01-01"` to the Databricks audit trail  
C) Creates a permanent database variable that persists across cluster restarts  
D) Creates a parameterized input that can be overridden when running the notebook as a job  

> [!success]- Answer
> **Correct Answer: D**
>
> `dbutils.widgets` creates interactive input controls (text boxes, dropdowns, etc.) in the notebook UI. When the notebook is run as a Lakeflow Job, the widget value can be overridden via job parameters or the `notebookParams` API. This makes notebooks parameterizable and reusable across different date ranges or environments.

---

## Question 24 *(Medium)*

In a Lakeflow Job, the `ingest` task publishes the number of new rows with `dbutils.jobs.taskValues.set(key="rows_loaded", value=rows)`. The `transform` task should run only when `rows_loaded` is greater than 0, and a `notify_no_data` task should run otherwise. How should the job be built?

A) Add an If/else condition task after `ingest` that compares `{{tasks.ingest.values.rows_loaded}}` `>` `0`. Make `transform` depend on its `(true)` outcome and `notify_no_data` on its `(false)` outcome  
B) Make both tasks depend on `ingest`, and have `transform` exit early in code when no rows were loaded  
C) Use a For each task over `rows_loaded`  
D) Set `notify_no_data`'s **Run if** to **At least one failed**, and make `ingest` fail when no rows are loaded  

> [!success]- Answer
> **Correct Answer: A**
>
> The **If/else condition** task branches a job on a boolean expression. Operands can be literals, job parameters, or task values such as `{{tasks.ingest.values.rows_loaded}}`, and downstream tasks depend on its `(true)` or `(false)` outcome. `>` compares numbers, while `==` and `!=` compare strings.
>
> An early exit in code still starts `transform` and hides the branch from the job graph. For each loops over an array of inputs. It doesn't branch. Making a task fail on purpose to drive control flow turns a normal empty day into a failed run.

---

## Question 25 *(Medium)*

A data engineer uses `dbutils.notebook.run("./child_notebook", timeout_seconds=300, arguments={"date": "2024-01-15"})`. What does this accomplish?

A) Runs the child notebook synchronously in the current cluster, passing the date argument as a widget value  
B) Runs the child notebook asynchronously in a separate Databricks job  
C) Schedules the child notebook to run at the specified timeout in 300 seconds  
D) Creates a permanent link between the parent and child notebook that runs on every commit  

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.notebook.run()` executes another notebook synchronously on the current cluster with a timeout. The `arguments` dictionary sets widget values in the child notebook. It blocks until the child completes or times out. Unlike `%run`, the child notebook runs in an isolated scope and its variables are not imported into the parent.

---

## Question 26 *(Medium)*

A data engineer uses task values to pass a dynamically computed date from Task A to Task B in a multi-task Lakeflow Job. Which `dbutils` functions are used to set and retrieve the value?

A) `dbutils.jobs.set("key", value)` in Task A; `dbutils.jobs.get("key")` in Task B  
B) `dbutils.jobs.taskValues.set(key="key", value=value)` in Task A; `dbutils.jobs.taskValues.get(taskKey="task_a", key="key")` in Task B  
C) `dbutils.widgets.set("key", value)` in Task A; `dbutils.widgets.get("key")` in Task B  
D) Write the value to DBFS in Task A; read from DBFS in Task B  

> [!success]- Answer
> **Correct Answer: B**
>
> `dbutils.jobs.taskValues.set(key=..., value=...)` publishes a value from the current task. Downstream tasks read it with `dbutils.jobs.taskValues.get(taskKey=..., key=...)`, or reference it as `{{tasks.<task>.values.<key>}}` ([task values](https://docs.databricks.com/aws/en/jobs/task-values)). Widgets are for parameterizing notebooks, not passing values between tasks. DBFS would work but is an anti-pattern compared to the built-in task values API.

---

## Question 27 *(Medium)*

A Gold job reads `main.silver.orders`, which Team A refreshes, and `main.silver.customers`, which Team B refreshes. Both teams finish at different, unpredictable times. The Gold job should run once both tables have been refreshed, with no polling. Which trigger fits?

A) A scheduled trigger at 06:00 every day  
B) A table update trigger on both tables with **Any table is updated**  
C) A file arrival trigger on the Silver schema's storage location  
D) A table update trigger on both tables with **All tables are updated**  

> [!success]- Answer
> **Correct Answer: D**
>
> A **table update trigger** starts a run when monitored Unity Catalog tables change, with no compute running in between. When it monitors several tables, **All tables are updated** waits until every one of them has changed, which suits a job that needs every input fresh.
>
> **Any table is updated** would start after the first team finishes, with the other input still stale. A fixed 06:00 schedule can run before either team is done. File arrival triggers watch for new files in a volume or external location, not table refreshes. The job's **Run as** principal needs `SELECT` on each table, plus `USE CATALOG` and `USE SCHEMA`, or the trigger can't evaluate.

---

## Question 28 *(Medium)*

A production Lakeflow Job runs a task that occasionally takes much longer than usual due to data volume spikes. To prevent the job from running indefinitely, which configuration should the engineer set?

A) Retry policy with maximum retries set to 1  
B) Task timeout — the maximum time in seconds a task is allowed to run before it is cancelled  
C) Cluster autotermination minutes on the job cluster  
D) Maximum concurrent runs set to 1  

> [!success]- Answer
> **Correct Answer: B**
>
> Task timeout defines the maximum wall-clock time a task is allowed to run before Databricks automatically cancels it and marks the task as failed. This prevents runaway jobs from consuming resources indefinitely. Retry policy controls what happens after failure. Autotermination applies to idle clusters, not running tasks. Max concurrent runs controls parallel job instances.

---

## Question 29 *(Medium)*

A Lakeflow Job multi-task job has tasks A → B → C (sequential dependency). Task B fails. What is the default behavior for Task C?

A) Task C runs anyway, using the last successful output from Task B  
B) Task C doesn't run and is marked `Upstream failed` because its dependency failed  
C) Task C waits indefinitely for Task B to be manually retried  
D) The entire job reruns from Task A automatically  

> [!success]- Answer
> **Correct Answer: B**
>
> When an upstream task fails in a Lakeflow Job, downstream tasks with the default Run if condition (*All succeeded*) are marked `Upstream failed`. Databricks does not run dependent tasks if their dependencies failed. If the job has retry configured, the failed task is retried first. Task C is not retried or rerun automatically.

---

## Implementing CI/CD (Questions 30–34)

## Question 30 *(Easy)*

A data engineer wants to version control notebooks using Git and collaborate with teammates via pull requests. Which Databricks feature supports this workflow?

A) Databricks Archives — export notebooks to ZIP format for external storage  
B) Lakeflow Jobs — tracks job run history as a proxy for code versions  
C) Databricks File System — stores notebook files in DBFS with version history  
D) Databricks Git folders (formerly Repos) — connects workspace folders to a remote Git repository  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Git folders (formerly Repos) integrates workspace folders directly with remote Git repositories (GitHub, GitLab, Azure DevOps, etc.). Engineers can commit, push, pull, create branches, and collaborate via pull requests without leaving the Databricks interface. DBFS does not provide version control. Workflows tracks job runs, not code changes.

---

## Question 31 *(Hard)*

A bundle declares the variable `catalog` with `default: dev`, and the `prod` target sets `variables.catalog: prod`. The CI runner exports `BUNDLE_VAR_catalog=staging` and then runs `databricks bundle deploy -t prod` with no `--var` option. Which value does `${var.catalog}` resolve to?

A) `staging`  
B) `prod`  
C) `dev`  
D) The deploy fails because the variable is defined in two places  

> [!success]- Answer
> **Correct Answer: A**
>
> Bundle variables are resolved at deploy time, in this order of precedence: the `--var` CLI option, then the `BUNDLE_VAR_<name>` environment variable, then `.databricks/bundle/<target>/variable-overrides.json`, then the value under the target, and last the top-level `default`.
>
> No `--var` was passed, so the environment variable wins over the target-level `prod` value. This is a common reason a target's value seems to be ignored. Defining a value in several places is normal, and precedence decides which one is used.

---

## Question 32 *(Easy)*

A CI step runs `databricks bundle deploy` with no `-t` option. The bundle defines `dev`, `test`, and `prod` targets, and the code ends up in the dev workspace instead of prod. Why?

A) Without `-t`, the bundle deploys to the target marked `default: true`  
B) Without `-t`, the bundle deploys to every target in alphabetical order  
C) `databricks bundle deploy` always deploys to dev, and prod requires `databricks bundle run`  
D) The CI runner's service principal can access only the dev workspace  

> [!success]- Answer
> **Correct Answer: A**
>
> When no target is given, the CLI uses the target marked `default: true`, which is usually `dev`. CI pipelines should always pass `-t <target>` explicitly.
>
> A deploy goes to one target, not to all of them. `deploy` works for any target, and `run` starts a deployed job, pipeline, app, or script. Nothing in the scenario points to a permission problem: the deploy succeeded, just to the wrong target.

---

## Question 33 *(Medium)*

Which behavior applies to a bundle target set to `mode: production`?

A) Resource names get a `[dev <user>]` prefix, and schedules and triggers are paused  
B) Clusters can be overridden with `--cluster-id` so production runs can reuse a developer's cluster  
C) Validations check `run_as` and permissions, reject cluster overrides, and require the Git branch to match the target's configured branch  
D) The deployment lock is disabled so several pipelines can deploy at once  

> [!success]- Answer
> **Correct Answer: C**
>
> `mode: production` adds safety checks: it validates `run_as`, `permissions`, and that paths aren't user-specific, doesn't allow a `cluster_id` override, and requires the Git branch to match the target's configured branch (`--force` overrides that check). A service principal is the recommended identity.
>
> The name prefix, paused schedules, and allowed cluster overrides all belong to `mode: development`. The deployment lock is enabled in production mode and disabled in development mode.

---

## Question 34 *(Medium)*

A production Lakeflow Job points at a notebook inside an engineer's personal Git folder. After the engineer switches to a branch that doesn't contain the notebook and then switches back, the job fails because the notebook now has a new ID. What is the recommended practice?

A) Pin the job to the notebook's old URL  
B) Forbid branch switching in that Git folder  
C) Have every engineer share one Git folder for production  
D) Have CI deploy a bundle from the merged `main` branch to the production workspace, run as a service principal  

> [!success]- Answer
> **Correct Answer: D**
>
> Switching branches can delete workspace assets that the new branch doesn't contain. Switching back recreates them with new IDs and URLs, so any job that points at a personal Git folder is fragile.
>
> Production jobs should run from a bundle that CI deploys from the merged branch, using a service principal. The old URL no longer exists. Blocking branch switches defeats the purpose of Git folders, and the docs advise against sharing one Git folder between people.

---

## Troubleshooting, Monitoring, and Optimization (Questions 35–38)

## Question 35 *(Hard)*

A data engineer examines the Spark UI after a job completes and sees one task taking 10× longer than all other tasks. What does this indicate?

A) The cluster ran out of memory and had to spill to disk  
B) The Photon engine failed to accelerate that specific task  
C) A data skew problem — one partition contains significantly more data than others  
D) Network latency caused a delay in fetching data from cloud storage  

> [!success]- Answer
> **Correct Answer: C**
>
> A single slow task (stragglers) in the Spark UI typically indicates data skew — one partition has significantly more rows than others, causing one executor to do disproportionately more work. Solutions include salting keys, using `skewHint`, or repartitioning. Memory spill shows in the Spark UI as shuffle spill metrics, not as a single slow task.

---

## Question 36 *(Hard)*

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

## Question 37 *(Easy)*

A data engineer wants to receive an email when a Lakeflow Job fails. Where is this configured?

A) In the cluster configuration under "Termination Notifications"  
B) In the Databricks workspace admin settings under "Global Notifications"  
C) Through a separate alerting notebook that monitors job status via the Jobs API  
D) In the job's "Notifications" settings, where email addresses can be added for failure, success, or start events  

> [!success]- Answer
> **Correct Answer: D**
>
> Lakeflow Jobs has a built-in "Notifications" section in the job configuration where you can specify email addresses to notify on job start, job success, job failure, and task failure events. This is configured per-job, not globally. A separate monitoring notebook is an alternative but unnecessary when built-in notifications are available.

---

## Question 38 *(Hard)*

A data engineer needs to query the Delta Live Tables event log to find pipeline runs where expectations failed. Which system table or approach provides this information?

A) `DESCRIBE HISTORY pipeline_name` — shows all pipeline execution history  
B) Query the DLT event log table stored at the pipeline's storage location, filtering for `eventType = 'flow_progress'` records  
C) `SELECT * FROM system.pipelines.events` in Unity Catalog  
D) The DLT UI shows expectation violations but there is no queryable log  

> [!success]- Answer
> **Correct Answer: B**
>
> Every pipeline has an event log. For Unity Catalog pipelines, query it with `SELECT * FROM event_log(<pipeline_id>)`, or publish it to a named table. Legacy Hive metastore pipelines stored it under the pipeline's storage location. Engineers can query it to analyze pipeline runs, including `flow_progress` events which contain `data_quality` metrics showing expectation pass/fail counts. The UI visualizes this data, but the underlying table is also directly queryable for custom analysis.

---

## Governance and Security (Questions 39–45)

## Question 39 *(Easy)*

A data engineer needs to store a small reference file that will be accessed by Spark jobs in a Databricks workspace. The file must be governed by Unity Catalog and accessible from any Unity Catalog-enabled compute without mount configuration. Which storage location is most appropriate?

A) Cloud object storage (S3/ADLS) with manual mount configuration per cluster  
B) DBFS root, which is mounted on every cluster automatically  
C) Local disk of the driver node — fastest access for small files  
D) A Unity Catalog volume, referenced by a path such as `/Volumes/main/ref/files/lookup.csv`  

> [!success]- Answer
> **Correct Answer: D**
>
> Unity Catalog volumes govern non-tabular files with UC privileges (`READ VOLUME` / `WRITE VOLUME`) and are reachable from UC-enabled compute through `/Volumes/...` paths. DBFS root and mounts are deprecated, and Databricks recommends UC volumes, external locations, or workspace files instead ([What is DBFS?](https://docs.databricks.com/aws/en/dbfs/)). Local driver disk is ephemeral and not shared with other nodes.

---

## Question 40 *(Medium)*

A company migrates from an existing Hive metastore to Unity Catalog. What is the key advantage of Unity Catalog over the workspace-level Hive metastore?

A) Unity Catalog provides centralized governance, fine-grained access control, and data lineage across multiple workspaces  
B) Unity Catalog stores data in a different file format for better performance  
C) Unity Catalog eliminates the need for any access control configuration  
D) Unity Catalog is faster because it uses an in-memory metadata cache  

> [!success]- Answer
> **Correct Answer: A**
>
> Unity Catalog provides a centralized governance layer that spans multiple Databricks workspaces and accounts. It offers fine-grained table, column, and row-level security, automated data lineage tracking, and audit logs — none of which are available in the per-workspace Hive metastore. The metastore stores metadata; performance depends on the underlying data files.

---

## Question 41 *(Easy)*

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

## Question 42 *(Medium)*

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

## Question 43 *(Hard)*

Hundreds of tables across the schema `main.silver` have email columns tagged with the governed tag `pii = email`, and new tables are added every week. The governance team wants every tagged email column masked for the `analysts` group, now and in future tables, using one definition that table owners can't remove. What should they create?

A) An ABAC policy created with `CREATE POLICY ... ON SCHEMA main.silver COLUMN MASK <function> TO analysts FOR TABLES MATCH COLUMNS has_tag_value('pii', 'email')`  
B) A dynamic view over each table that hides the email column  
C) A column mask on each email column, applied with `ALTER TABLE ... ALTER COLUMN ... SET MASK`  
D) A row filter on each table that returns `FALSE` for the `analysts` group  

> [!success]- Answer
> **Correct Answer: A**
>
> **ABAC policies** evaluate governed tags. One policy attached to a catalog or schema masks every matching column in current and future tables, and because higher-level admins define it, table owners can't override or remove it. ABAC needs Databricks Runtime 16.4+ or serverless compute.
>
> Per-column masks and dynamic views have to be repeated for every new table, and owners can change them. A row filter removes whole rows instead of masking a column.

---

## Question 44 *(Medium)*

A data engineer creates an external table in Unity Catalog pointing to an S3 path. What happens to the underlying data files when the table is dropped with `DROP TABLE`?

A) The data files are deleted along with the table metadata  
B) The data files are moved to a Unity Catalog-managed trash location for 30 days  
C) The data files are retained in cloud storage; only the table metadata (catalog registration) is removed  
D) `DROP TABLE` fails on external tables — you must use `DROP EXTERNAL TABLE`  

> [!success]- Answer
> **Correct Answer: C**
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
| 1 | A | 16 | D | 31 | A |
| 2 | B | 17 | A | 32 | A |
| 3 | D | 18 | B | 33 | C |
| 4 | C | 19 | D | 34 | D |
| 5 | A | 20 | C | 35 | C |
| 6 | D | 21 | B | 36 | B |
| 7 | C | 22 | C | 37 | D |
| 8 | A | 23 | D | 38 | B |
| 9 | D | 24 | A | 39 | D |
| 10 | B | 25 | A | 40 | A |
| 11 | D | 26 | B | 41 | C |
| 12 | C | 27 | D | 42 | B |
| 13 | B | 28 | B | 43 | A |
| 14 | C | 29 | B | 44 | C |
| 15 | C | 30 | D | 45 | A |

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

[← Back to Mock Exam 2](./README.md) | [Compare with Mock Exam 1](../mock-exam/README.md)
