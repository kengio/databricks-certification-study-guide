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

## Databricks Lakehouse Platform (Questions 1–11)

---

## Question 1 *(Medium)*

A data engineering team is evaluating whether to migrate their existing data warehouse to a Databricks Lakehouse. The primary concern is maintaining ACID guarantees for concurrent reads and writes on large tables. Which Databricks technology directly addresses this requirement?

A) Apache Parquet file format with schema enforcement
B) Delta Lake with transaction log (`_delta_log`)
C) Databricks SQL Serverless warehouses
D) Unity Catalog with row-level security

> [!success]- Answer
> **Correct Answer: B**
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

A company wants to reduce cluster startup time for their machine learning jobs that run every 30 minutes. The jobs require identical cluster configurations each time. Which Databricks feature should they configure?

A) Autoscaling enabled on job clusters
B) Instance pools with pre-warmed instances
C) Photon engine acceleration
D) Serverless compute for ML workloads

> [!success]- Answer
> **Correct Answer: B**
>
> Instance pools maintain a set of idle, pre-warmed virtual machines that clusters can acquire immediately, drastically reducing startup time from minutes to seconds. Autoscaling adjusts the number of workers during a run but doesn't reduce initial startup time. Photon accelerates query execution. Serverless compute is currently available for SQL and Delta Live Tables, not general ML jobs.

---

## Question 4 *(Easy)*

A team member asks about the difference between the Databricks Control Plane and the Data Plane. Which statement correctly describes this architecture?

A) The Control Plane stores all data; the Data Plane manages cluster configuration
B) The Control Plane is managed by Databricks in its cloud account; the Data Plane runs in the customer's cloud account and processes data
C) The Control Plane and Data Plane are both in the customer's cloud account for security
D) The Data Plane manages the web UI; the Control Plane runs Spark jobs

> [!success]- Answer
> **Correct Answer: B**
>
> The Control Plane (web UI, job scheduler, cluster manager) runs in Databricks' cloud account. The Data Plane (clusters, DBFS, customer data) runs in the customer's own cloud account. This architecture ensures that sensitive data never leaves the customer's environment, while Databricks manages the platform overhead.

---

## Question 5 *(Medium)*

An analyst needs to access data stored in an external S3 bucket from a Databricks cluster without hardcoding credentials in notebooks. Which approach is most appropriate?

A) Store credentials in a notebook cell marked as hidden
B) Use Databricks Secrets with `dbutils.secrets.get()` to retrieve credentials at runtime
C) Export credentials as environment variables in the cluster init script
D) Pass credentials as job parameters in the Workflows UI

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Secrets provides a secure vault for storing sensitive values. `dbutils.secrets.get()` retrieves them at runtime and the values are never shown in logs or notebook output. Hardcoding in notebooks or init scripts exposes credentials in version control and logs. Job parameters are visible in the UI and logs.

---

## Question 6 *(Medium)*

A data engineer is comparing Databricks Photon engine to standard Spark. In which scenario does Photon provide the greatest performance benefit?

A) Python UDFs running complex custom logic
B) SQL queries on Delta Lake tables with aggregations and joins
C) Streaming jobs using foreachBatch sinks
D) Machine learning model training with MLlib

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is a native vectorized query engine written in C++ that accelerates SQL workloads on Delta Lake, especially aggregations, joins, and scans. It does not accelerate Python UDFs (which require serialization between JVM and Python), and provides limited benefit for MLlib model training or streaming micro-batch logic.

---

## Question 7 *(Medium)*

A Databricks cluster is configured with a driver node (16 cores) and 4 worker nodes (8 cores each). A user runs a SQL query. What is the total parallelism available for task execution?

A) 16 cores (driver only coordinates)
B) 32 cores (workers only)
C) 48 cores (driver + workers)
D) Depends on the number of partitions in the data

> [!success]- Answer
> **Correct Answer: B**
>
> In Spark, the driver node coordinates tasks but does not execute them. Task execution happens exclusively on worker nodes. With 4 workers × 8 cores = 32 cores available for parallel task execution. The number of partitions determines how many tasks run simultaneously, but available parallelism is capped by worker cores.

---

## Question 8 *(Easy)*

A team wants to use Databricks Runtime for Machine Learning (ML Runtime) instead of the standard Databricks Runtime. What is the primary reason to choose the ML Runtime?

A) ML Runtime supports Delta Lake operations; standard Runtime does not
B) ML Runtime includes pre-installed ML libraries such as TensorFlow, PyTorch, and scikit-learn
C) ML Runtime enables GPU acceleration automatically on all node types
D) ML Runtime provides faster SQL query execution via Photon

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Runtime for Machine Learning comes pre-installed with popular ML libraries (TensorFlow, PyTorch, scikit-learn, XGBoost, etc.) so teams don't need to install them manually. Both runtimes support Delta Lake. GPU acceleration requires GPU-enabled instance types regardless of runtime. Photon is available on the standard runtime.

---

## Question 9 *(Medium)*

A data engineer wants to understand the Lakehouse architecture. Which statement best describes what differentiates a Lakehouse from a traditional two-tier Lambda architecture (data lake + data warehouse)?

A) A Lakehouse stores data only in columnar formats, while Lambda uses row-based storage
B) A Lakehouse consolidates storage and compute so that BI tools can query data directly from cloud storage with ACID guarantees
C) A Lakehouse requires all data to be structured; Lambda architecture supports unstructured data
D) A Lakehouse eliminates the need for data transformation; Lambda requires full ETL pipelines

> [!success]- Answer
> **Correct Answer: B**
>
> The Lakehouse pattern eliminates the costly ETL copy step from data lake to data warehouse by adding metadata layers (like Delta Lake) that bring ACID transactions, schema enforcement, and performance optimizations directly to cloud storage. BI and ML tools can query the same data store. It supports both structured and unstructured data, and transformation is still required.

---

## Question 10 *(Medium)*

An organization runs a multi-tenant Databricks workspace. A cluster policy is configured with `spark.executor.memory` set as a fixed value. What is the effect of this policy on users?

A) Users can override the fixed value by setting it in their notebook
B) Users cannot change the fixed value when creating clusters governed by this policy
C) The fixed value applies only to SQL warehouse clusters, not all-purpose clusters
D) Cluster policies only restrict admin users; regular users are unaffected

> [!success]- Answer
> **Correct Answer: B**
>
> Cluster policies enforce configuration constraints. When a value is set as "fixed" in a policy, users cannot override it — the UI hides the field or makes it read-only. This ensures cost control and security compliance. Policies apply to any cluster type the policy is assigned to, not only warehouses.

---

## Question 11 *(Medium)*

A data engineer needs to run a notebook that performs interactive EDA (exploratory data analysis) with visualizations, then automatically hand off to a scheduled production pipeline. Which Databricks features best match these two phases respectively?

A) All-purpose cluster for EDA; DLT pipeline for production
B) Job cluster for EDA; all-purpose cluster for production
C) SQL warehouse for EDA; serverless compute for production
D) All-purpose cluster for EDA; job cluster with Workflows for production

> [!success]- Answer
> **Correct Answer: D**
>
> All-purpose clusters support interactive notebook sessions ideal for EDA with visualizations and iterative development. Databricks Workflows with job clusters provide automated, scheduled, cost-efficient execution for production pipelines. Job clusters terminate after the job completes, reducing cost. SQL warehouses are optimized for SQL queries, not general notebook EDA.

---

## ELT with Spark SQL and Python (Questions 12–24)

---

## Question 12 *(Easy)*

A data engineer runs the following SQL command. What is the result?

```sql
CREATE OR REPLACE TABLE sales_summary AS
SELECT region, SUM(amount) AS total_sales
FROM transactions
GROUP BY region;
```

A) Creates a new table only if it does not already exist
B) Creates a new table or replaces the entire table if it already exists
C) Appends aggregated results to the existing table
D) Creates a temporary view of the aggregated results

> [!success]- Answer
> **Correct Answer: B**
>
> `CREATE OR REPLACE TABLE ... AS SELECT` (CRAS) creates a new table with the query results. If a table with that name already exists, it is completely replaced (dropped and recreated). Use `CREATE TABLE IF NOT EXISTS` to skip creation when the table exists, or `INSERT INTO` to append rows.

---

## Question 13 *(Easy)*

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

## Question 14 *(Medium)*

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

## Question 15 *(Medium)*

A data engineer writes the following PySpark code. What does it accomplish?

```python
(df.filter(col("status") == "active")
   .groupBy("department")
   .agg(avg("salary").alias("avg_salary"))
   .orderBy("avg_salary", ascending=False))
```

A) Updates salaries for active employees grouped by department
B) Returns the average salary per department for active employees, sorted highest to lowest
C) Deletes inactive employees and calculates department headcount
D) Creates a new Delta table with department salary averages

> [!success]- Answer
> **Correct Answer: B**
>
> The code filters rows where `status == "active"`, groups by `department`, calculates the average salary as `avg_salary`, and sorts descending. It is a read-only transformation — no writes or deletes occur. `write()` or `save()` would be needed to persist results to storage.

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

A) Removes all NULL values from array columns
B) Converts an array column into multiple rows, one row per array element
C) Flattens nested structs into separate columns
D) Converts an array column into a string by joining elements

> [!success]- Answer
> **Correct Answer: B**
>
> `explode()` takes an array (or map) column and generates one new row per element, duplicating all other column values. This is the standard way to "unnest" array data in Spark. `flatten()` flattens nested arrays. Struct flattening uses `col("field.*")`. `array_join()` converts an array to a string.

---

## Question 18 *(Easy)*

A data engineer needs to add a column to an existing Delta table without rewriting the data. Which SQL command accomplishes this?

A) `UPDATE table_name SET new_col = NULL`
B) `ALTER TABLE table_name ADD COLUMN new_col STRING`
C) `INSERT INTO table_name SELECT *, NULL AS new_col FROM table_name`
D) `CREATE OR REPLACE TABLE table_name AS SELECT *, NULL AS new_col FROM table_name`

> [!success]- Answer
> **Correct Answer: B**
>
> `ALTER TABLE ... ADD COLUMN` adds a new column to the Delta table schema without rewriting existing data files — the new column returns NULL for existing rows until populated. `UPDATE` modifies existing rows. `INSERT INTO` adds new rows. `CREATE OR REPLACE` rewrites the entire table, which is expensive and unnecessary.

---

## Question 19 *(Hard)*

A data engineer writes SQL to calculate a running total of sales by date using the following window specification. What does it return?

```sql
SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

A) This syntax is invalid — `ROWS BETWEEN` is not supported
B) The cumulative sum of `amount` from the earliest date up to and including the current row
C) The total sum of all rows repeated for every date (grand total)
D) The sum of only the current row and the immediately following row

> [!success]- Answer
> **Correct Answer: B**
>
> `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` defines a window that starts at the very first row (in `ORDER BY date` order) and ends at the current row, producing a cumulative running total. `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` would return the grand total for every row.

---

## Question 20 *(Easy)*

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

## Question 21 *(Easy)*

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

## Question 22 *(Medium)*

A data engineer wants to select only distinct combinations of `customer_id` and `product_id` from a table with millions of rows. Which approach is most efficient?

A) `SELECT DISTINCT customer_id, product_id FROM orders`
B) `SELECT customer_id, product_id FROM orders GROUP BY ALL`
C) Both A and B produce identical results and the Spark optimizer handles them the same way
D) Use `dropDuplicates()` in PySpark only — `DISTINCT` is not supported in Databricks SQL

> [!success]- Answer
> **Correct Answer: C**
>
> `SELECT DISTINCT col1, col2` and `GROUP BY col1, col2` with no aggregation are logically and physically equivalent in Spark's optimizer. Both generate the same query plan. `DISTINCT` is fully supported in Databricks SQL. Either syntax is valid — the choice is stylistic.

---

## Question 23 *(Hard)*

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

## Question 24 *(Medium)*

A data engineer uses higher-order functions to work with an array column. Which function filters array elements based on a lambda condition?

A) `array_contains(arr, value)`
B) `filter(arr, x -> x > 100)`
C) `transform(arr, x -> x * 2)`
D) `aggregate(arr, 0, (acc, x) -> acc + x)`

> [!success]- Answer
> **Correct Answer: B**
>
> `filter(array, lambda)` applies a boolean lambda to each array element and returns only elements where the condition is true. `array_contains()` checks if a specific value exists (returns boolean, not an array). `transform()` applies a transformation to every element (equivalent to map). `aggregate()` reduces an array to a single value (equivalent to fold/reduce).

---

## Incremental Data Processing / Delta Lake (Questions 25–34)

---

## Question 25 *(Medium)*

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

## Question 26 *(Medium)*

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

## Question 27 *(Medium)*

A data engineer configures Auto Loader to ingest CSV files from an S3 bucket. The pipeline runs every hour. What happens if 5 new files arrive between runs?

A) Only the first file is processed; subsequent files are queued for the next run
B) Auto Loader automatically detects and processes all 5 new files in the next trigger
C) Auto Loader processes files only when triggered manually
D) Auto Loader fails if more than 1 file arrives between runs

> [!success]- Answer
> **Correct Answer: B**
>
> Auto Loader uses cloud storage notifications or directory listing combined with a checkpoint to track which files have been processed. On the next trigger, it automatically detects all new, unprocessed files and ingests them. This checkpointing mechanism ensures exactly-once processing without manual intervention or file tracking.

---

## Question 28 *(Medium)*

A data engineer enables Change Data Feed (CDF) on a Delta table. What additional metadata columns does CDF expose when reading changes?

A) The Spark execution plan for each change operation
B) Columns `_change_type`, `_commit_version`, and `_commit_timestamp` showing what changed and when
C) A separate audit log table in the same database
D) A JSON file in the `_delta_log` directory with changed row details

> [!success]- Answer
> **Correct Answer: B**
>
> Change Data Feed adds three metadata columns: `_change_type` (insert, update_preimage, update_postimage, delete), `_commit_version` (Delta version number), and `_commit_timestamp` (when the change occurred). These are read using `.option("readChangeFeed", "true")`. CDF data is stored within the Delta table, not a separate table or JSON file.

---

## Question 29 *(Easy)*

A Delta table has accumulated many small Parquet files over several months of streaming ingestion. A data engineer runs `OPTIMIZE` on the table. What is the primary effect?

A) Deletes files marked for deletion by previous VACUUM operations
B) Rewrites small Parquet files into larger, more efficient files to improve read performance
C) Recalculates column statistics and updates the transaction log
D) Converts the table from Parquet format to a different columnar format

> [!success]- Answer
> **Correct Answer: B**
>
> `OPTIMIZE` compacts small files into larger files (typically targeting 1GB) to reduce the overhead of reading many small files and improve scan efficiency. It does not delete files — `VACUUM` handles that. Statistics updates are a secondary benefit. Delta Lake always uses Parquet as its underlying storage format.

---

## Question 30 *(Medium)*

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

## Question 31 *(Medium)*

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

## Question 32 *(Easy)*

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

## Question 33 *(Medium)*

A data engineer wants to Z-ORDER a Delta table by the `customer_id` column to improve query performance. When does Z-ORDER provide the most benefit?

A) When queries always perform full table scans without any filters
B) When queries frequently filter on `customer_id`, enabling Delta's data skipping to skip entire files
C) When the table has fewer than 10 files and is already compact
D) Z-ORDER provides no benefit on Delta tables; use partitioning for all performance needs

> [!success]- Answer
> **Correct Answer: B**
>
> Z-ORDER co-locates related values within the same set of files, enabling Delta Lake's data skipping to skip entire files that don't contain queried `customer_id` values. This is most beneficial for high-cardinality columns frequently used in `WHERE` clauses. If queries always scan the full table, or the table is very small, Z-ORDER provides no benefit.

---

## Question 34 *(Hard)*

A data engineer notices that a Delta streaming job fails with `StreamingQueryException: Detected a data update in the source table`. What caused this error?

A) The source Delta table had `OPTIMIZE` run on it while the stream was reading
B) The source Delta table had rows `UPDATE`d or `DELETE`d, which is not supported by default streaming reads
C) The streaming job ran out of memory due to large state size
D) The checkpoint directory was deleted, causing the stream to restart

> [!success]- Answer
> **Correct Answer: B**
>
> By default, Delta streaming reads assume an append-only source. If the source table has `UPDATE`, `DELETE`, or `MERGE` operations on existing rows, the stream throws this exception. To handle such sources, use `.option("ignoreChanges", "true")` or `.option("ignoreDeletes", "true")`, or switch to Change Data Feed for CDC-aware streaming.

---

## Production Pipelines (Questions 35–41)

---

## Question 35 *(Medium)*

A data engineer is designing a Databricks Workflow with three tasks: `ingest → transform → report`. The `report` task must only run if `transform` succeeds. How should task dependencies be configured?

A) Use a single-task job with all logic in one notebook to avoid dependency issues
B) Configure `transform` as a dependency of `report` using the `depends_on` task setting
C) Use separate jobs for each task and chain them with external orchestration
D) Set `transform` and `report` to run in parallel to reduce total execution time

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Workflows supports multi-task jobs with explicit task dependencies via `depends_on`. When `transform` fails, downstream tasks (`report`) are automatically skipped or marked as failed. Running tasks in parallel would not enforce the required sequential dependency. Separate jobs with external orchestration adds unnecessary complexity.

---

## Question 36 *(Medium)*

A production job fails intermittently due to transient cloud API errors. What built-in Databricks Workflows feature can automatically retry failed tasks without manual intervention?

A) Task timeout configuration — the task retries when it exceeds the timeout
B) Per-task retry policy with configurable maximum retries and retry interval
C) Workflow-level SLA notifications that page the on-call engineer
D) Databricks auto-recovers all failed tasks by default with no configuration needed

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks Workflows allows configuring a retry policy per task, specifying the maximum number of retry attempts and the interval between retries. This handles transient failures automatically. Timeout configuration controls how long a task runs before being killed, not whether it retries. Auto-recovery is not enabled by default.

---

## Question 37 *(Easy)*

A data engineer uses Delta Live Tables (DLT) to build a pipeline. Which Python decorator defines a table that is computed and materialized from a query?

A) `@dlt.table`
B) `@dlt.view`
C) `@dlt.materialized_view`
D) `@dlt.expect`

> [!success]- Answer
> **Correct Answer: A**
>
> In Delta Live Tables, `@dlt.table` defines a materialized table that DLT computes and stores. When the query uses `spark.readStream`, DLT creates a streaming table; otherwise it creates a batch materialized table. `@dlt.view` creates a virtual, non-materialized view. `@dlt.expect` is not a table decorator — it adds data quality expectations to tables decorated with `@dlt.table`.

---

## Question 38 *(Medium)*

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

## Question 39 *(Medium)*

A data engineer configures a Databricks Workflow job with a schedule of `0 0 8 * * ?` (Quartz cron format). When does this job run?

A) Every 8 minutes
B) Every hour at minute 8
C) At 8:00 AM every day
D) At 8:00 AM on the 8th of every month

> [!success]- Answer
> **Correct Answer: C**
>
> In Quartz cron format, fields are: second minute hour day-of-month month day-of-week. So `0 0 8 * * ?` means second=0, minute=0, hour=8, every day, every month. This fires at exactly 8:00:00 AM daily. `0 8 * * * ?` would run every hour at minute 8. `0 0 0 8 * ?` would run at midnight on the 8th of each month.

---

## Question 40 *(Medium)*

A data engineer wants job clusters to start quickly for scheduled jobs without paying for always-running compute. Which Databricks feature achieves fast startup while keeping costs low?

A) All-purpose cluster shared via cluster ID
B) Job cluster without any optimization — they always start from scratch
C) Interactive cluster attached to the job
D) Instance pool that job clusters acquire for fast startup, then release after the job completes

> [!success]- Answer
> **Correct Answer: D**
>
> Instance pools maintain pre-warmed instances that job clusters can acquire instantly, reducing startup time to seconds. The pool persists between runs while the job cluster itself is created and destroyed per run, maintaining cost isolation. All-purpose clusters are not managed by Workflows and incur continuous cost.

---

## Question 41 *(Medium)*

A DLT pipeline is configured in `CONTINUOUS` mode. How does this differ from `TRIGGERED` mode?

A) Continuous mode runs the pipeline once and exits; Triggered mode runs indefinitely
B) Triggered mode processes data on a schedule or manually and then stops; Continuous mode streams with minimal latency
C) Continuous mode only supports SQL; Triggered mode supports both SQL and Python
D) There is no functional difference; the setting only affects UI display

> [!success]- Answer
> **Correct Answer: B**
>
> In Continuous mode, DLT keeps the pipeline running indefinitely, processing new data as it arrives with low latency (true streaming). In Triggered mode, the pipeline runs when scheduled or triggered manually, processes all available data, and then stops — suitable for batch workloads. Both modes support SQL and Python.

---

## Data Governance (Questions 42–45)

---

## Question 42 *(Hard)*

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

## Question 43 *(Medium)*

A company wants to share a Delta table with an external partner organization that uses a different cloud provider, without copying the underlying data. Which Databricks feature enables this?

A) External Location with cross-account IAM role
B) Delta Sharing — an open protocol for sharing live data across organizations
C) Unity Catalog data lineage export
D) DBFS mount with public access enabled

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Sharing is an open, REST-based protocol that enables sharing live Delta Lake data with external organizations without copying data or requiring the recipient to use Databricks. Recipients access shared data using open-source Delta Sharing clients in Python, Spark, or pandas. External Locations manage access to cloud storage within the same organization, not across organizations.

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
| 1 | B | 16 | B | 31 | B |
| 2 | C | 17 | B | 32 | B |
| 3 | B | 18 | B | 33 | B |
| 4 | B | 19 | B | 34 | B |
| 5 | B | 20 | B | 35 | B |
| 6 | B | 21 | C | 36 | B |
| 7 | B | 22 | C | 37 | A |
| 8 | B | 23 | B | 38 | C |
| 9 | B | 24 | B | 39 | C |
| 10 | B | 25 | C | 40 | D |
| 11 | D | 26 | C | 41 | B |
| 12 | B | 27 | B | 42 | C |
| 13 | C | 28 | B | 43 | B |
| 14 | C | 29 | B | 44 | D |
| 15 | B | 30 | B | 45 | B |

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

[← Back to Mock Exam](./README.md) | [Try Mock Exam 2](../mock-exam-2/README.md)
