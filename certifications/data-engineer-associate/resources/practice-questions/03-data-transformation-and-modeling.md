---
title: "Practice Questions: Data Transformation and Modeling"
type: practice-questions
tags: [data-engineer-associate, practice-questions, data-transformation-and-modeling]
---

# Domain 3: Data Transformation and Modeling

Exam weight: **22 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: DELETE Syntax

**Question** *(Easy)*: Which code block will delete rows from the Delta table `my_table` where the `age` column value exceeds 25?

A) `REMOVE FROM my_table WHERE age > 25;`
B) `DELETE FROM my_table WHERE age > 25;`
C) `DROP ROWS FROM my_table WHERE age > 25;`
D) `TRUNCATE my_table WHERE age > 25;`

> [!success]- Answer
> **Correct Answer: B**
>
> `DELETE FROM my_table WHERE age > 25;`
>
> This standard SQL DML syntax works directly on Delta tables. Delta Lake supports full DML operations including DELETE, UPDATE, and MERGE with ACID guarantees, so the deleted rows are tracked in the transaction log and are recoverable via time travel.

---

## Question 2: PySpark Table Access

**Question** *(Easy)*: A data analyst has developed a Delta table `sales` that the entire data analysis team uses. The data engineering team prefers Python. Which command can the engineering team use to access `sales` data in PySpark?

A) `spark.read.delta("sales")`
B) `spark.load("sales")`
C) `spark.table("sales")`
D) `spark.sql.table("sales")`

> [!success]- Answer
> **Correct Answer: C**
>
> `spark.table("sales")`
>
> This loads the registered Delta table into a PySpark DataFrame, allowing the engineering team to use Python and Spark transformations on the same data the analyst queries with SQL. The table is accessible because it is registered in the shared metastore.

---

## Question 3: Indicating PII in Table Metadata

**Question** *(Medium)*: A data engineer intends to create a new table listing customers residing in France and wants to indicate the table contains PII. The incomplete SQL is shown below:

```sql
CREATE TABLE customerInFrance
_____ AS
SELECT id
      ,firstName
      ,lastName
FROM customerLocations
WHERE country = 'FRANCE';
```

Which line of code correctly fills in the blank to add a table property indicating PII?

A) `METADATA ('contains_pii' = 'true')`
B) `COMMENT 'contains_pii = true'`
C) `OPTIONS ('contains_pii' = 'true')`
D) `TBLPROPERTIES ('contains_pii' = 'true')`

> [!success]- Answer
> **Correct Answer: D**
>
> `TBLPROPERTIES ('contains_pii' = 'true')`
>
> `TBLPROPERTIES` adds structured key-value metadata directly to the table definition — these are the actual "table properties" in Databricks SQL. `COMMENT` adds a human-readable description but is not a table property. Using `TBLPROPERTIES` to tag sensitivity classifications (e.g., PII, data classification) is the standard approach for policy-driven metadata in Databricks.

---

## Question 4: Array Functions for Nested JSON

**Question** *(Easy)*: What benefits do the array functions from Spark SQL offer?

A) The ability to work with complex, nested data ingested from JSON files
B) The ability to convert JSON files into Parquet format without code
C) The ability to enforce strict schemas on semi-structured data at write time
D) The ability to automatically flatten all nested structures into separate tables

> [!success]- Answer
> **Correct Answer: A**
>
> The ability to work with complex, nested data ingested from JSON files.
>
> Functions like `explode`, `array_contains`, `transform`, and `filter` allow operations directly on nested array structures without flattening the entire schema first, making them essential for processing hierarchical JSON data at scale.

---

## Question 5: MERGE to Prevent Duplicates

**Question** *(Easy)*: What commands can be utilized to insert data into a Delta table while preventing duplicate records?

A) `INSERT DISTINCT`
B) `MERGE`
C) `COPY INTO`
D) `UPSERT`

> [!success]- Answer
> **Correct Answer: B**
>
> `MERGE`.
>
> The `MERGE INTO` statement matches source records against a target table on a key condition and conditionally inserts, updates, or skips records. This is the standard upsert pattern in Delta Lake for ensuring no duplicate rows are added.

---

## Question 6: UNION for Unique Records

**Question** *(Medium)*: A data engineering team maintains `march_transactions` (all March retail transactions) and `april_transactions` (all April retail transactions) with no overlapping records. What command creates a new table `all_transactions` containing all unique records from both?

A) `CREATE TABLE all_transactions AS SELECT * FROM march_transactions INTERSECT SELECT * FROM april_transactions;`
B) `CREATE TABLE all_transactions AS SELECT * FROM march_transactions UNION ALL SELECT * FROM april_transactions;`
C) `CREATE TABLE all_transactions AS SELECT * FROM march_transactions UNION SELECT * FROM april_transactions;`
D) `CREATE TABLE all_transactions AS SELECT * FROM march_transactions JOIN april_transactions;`

> [!success]- Answer
> **Correct Answer: C**
>
> ```sql
> CREATE TABLE all_transactions AS
> SELECT * FROM march_transactions
> UNION
> SELECT * FROM april_transactions;
> ```
>
> `UNION` (without `ALL`) removes duplicate rows across the combined result. Since the two tables share no overlapping records, all rows from both tables are included exactly once in the output.

---

## Question 7: Python Multi-Condition Control Flow

**Question** *(Medium)*: A data engineer intends to run the last block of a Python program only if `day_of_week` is set to 1 and `review_period` is `True`. The incomplete code block is shown below:

```python
day_of_week = get_day_of_week()
review_period = check_review_period()

_____
    run_final_block()
```

What control flow statement should be used to complete the blank?

A) `if day_of_week is 1 and review_period is True:`
B) `if day_of_week = 1 and review_period == "True":`
C) `if day_of_week == 1 or review_period:`
D) `if day_of_week == 1 and review_period:`

> [!success]- Answer
> **Correct Answer: D**
>
> `if day_of_week == 1 and review_period:`
>
> In Python, `==` performs equality comparison (not assignment). A boolean variable is truthy when referenced directly — wrapping it in quotes (`"True"`) would compare against the string literal, not the boolean value. Using a single `=` would cause a `SyntaxError`.

---

## Question 8: Persistent Cross-Session Data Entity

**Question** *(Medium)*: A data engineer needs a data entity built from several tables that must be accessible to other data engineers in their sessions and stored in a physical location. Which data entity should be created?

A) A table (Delta or Spark SQL table)
B) A temporary view
C) A global temporary view
D) A Common Table Expression (CTE)

> [!success]- Answer
> **Correct Answer: A**
>
> A table (Delta or Spark SQL table).
>
> Tables persist data physically at a storage location and are registered in the metastore, making them accessible across all sessions and users. Unlike temporary views (session-scoped) or views (no physical storage), tables outlive any individual session.

---

## Question 9: INSERT INTO a Delta Table

**Question** *(Easy)*: A data engineer needs to add a new record `('a1', 6, 9.4)` to the existing Delta table `my_table`. Which SQL command accomplishes this?

A) `ADD ROW my_table VALUES ('a1', 6, 9.4);`
B) `INSERT INTO my_table VALUES ('a1', 6, 9.4);`
C) `APPEND INTO my_table VALUES ('a1', 6, 9.4);`
D) `MERGE INTO my_table VALUES ('a1', 6, 9.4);`

> [!success]- Answer
> **Correct Answer: B**
>
> `INSERT INTO my_table VALUES ('a1', 6, 9.4);`
>
> `INSERT INTO ... VALUES` appends new rows to an existing Delta table without modifying existing records. Delta Lake records this as a new transaction in the log, making it reversible via time travel.

---

## Question 10: CREATE OR REPLACE TABLE

**Question** *(Easy)*: A data architect needs to create an empty Delta table in a specified format, regardless of whether a table with that name already exists. Which SQL DDL approach accomplishes this?

A) `DROP TABLE IF EXISTS table_name; CREATE TABLE table_name (...)`
B) `CREATE TABLE IF NOT EXISTS table_name (...)`
C) `CREATE OR REPLACE TABLE table_name (...column definitions...)`
D) `ALTER TABLE table_name REPLACE COLUMNS (...)`

> [!success]- Answer
> **Correct Answer: C**
>
> `CREATE OR REPLACE TABLE table_name (...column definitions...)`
>
> This atomically drops and recreates the table if it exists, or creates it new if it does not. It avoids errors from pre-existing tables and ensures the table always reflects the latest schema definition.

---

## Question 11: PIVOT for Wide Format

**Question** *(Easy)*: Which SQL keyword can transform a table from long format to wide format?

A) `UNPIVOT`
B) `LATERAL VIEW`
C) `TRANSPOSE`
D) `PIVOT`

> [!success]- Answer
> **Correct Answer: D**
>
> `PIVOT`.
>
> The `PIVOT` clause rotates distinct row values into column headers, converting a tall/long table (one row per category) into a wide/crosstab format (one column per category). This is commonly used to reshape metrics data for reporting dashboards.

---

## Question 12: Temporary View for Single-Session Use

**Question** *(Medium)*: A data engineer needs a relational object from two tables that will not be used by other engineers in different sessions. To minimize storage expenses, physical data should not be duplicated. Which relational object should be created?

A) A temporary view
B) A managed Delta table
C) An external table
D) A materialized view

> [!success]- Answer
> **Correct Answer: A**
>
> A temporary view.
>
> Temporary views exist only for the current Spark session, are not accessible to other users, and store no physical data — they are just a named query definition. This avoids both storage costs and data duplication while enabling SQL-based access within the session.

---

## Question 13: PySpark SQL Query Execution

**Question** *(Easy)*: A data analyst has created a query that operates on a Delta table. They seek assistance from the data engineering team to perform a set of tests to verify that the data returned by the query is accurate and clean. However, the data engineering team utilizes Python for their tests instead of SQL. Which operations can the data engineering team use in PySpark to execute the query and process the results?

A) `spark.query("SELECT ...")`
B) `spark.sql("SELECT ...")`
C) `spark.execute("SELECT ...")`
D) `spark.run("SELECT ...")`

> [!success]- Answer
> **Correct Answer: B**
>
> `spark.sql("SELECT ...")`
>
> `spark.sql()` accepts a SQL query string and executes it, returning the results as a PySpark DataFrame. `spark.table("table_name")` loads an entire table as a DataFrame but does not execute a specific SQL query — it is not the correct tool when the goal is to run a particular SQL statement.

---

## Question 14: count_if for NULL Values

**Question** *(Medium)*: Which command shows the count of null values in the `member_id` column?

A) `SELECT count(member_id) FROM my_table WHERE member_id IS NULL;`
B) `SELECT sum(CASE WHEN member_id IS NULL THEN 0 ELSE 1 END) FROM my_table;`
C) `SELECT count_if(member_id IS NULL) FROM my_table;`
D) `SELECT count(NULL) FROM my_table;`

> [!success]- Answer
> **Correct Answer: C**
>
> `SELECT count_if(member_id IS NULL) FROM my_table;`
>
> `count_if` counts rows that satisfy the given boolean condition. `IS NULL` evaluates to true for null values. Standard `count(member_id)` would exclude nulls, returning the opposite of what is needed.

---

## Question 15: FILTER Higher-Order Function

**Question** *(Medium)*: A data engineer needs to implement custom logic for the `employees` array column in the `stores` table to find employees with more than 5 years of experience. The result should be a new column `exp_employees` containing only matching employees for each row. The incomplete SQL query is shown below:

```sql
SELECT store_id,
       _____ AS exp_employees
FROM stores
```

Which code correctly completes the blank using the FILTER higher-order function?

A) `TRANSFORM(employees, i -> i.years_exp > 5)`
B) `ARRAY_FILTER(employees, i -> i.years_exp > 5)`
C) `SELECT_FROM_ARRAY(employees, years_exp > 5)`
D) `FILTER(employees, i -> i.years_exp > 5)`

> [!success]- Answer
> **Correct Answer: D**
>
> `FILTER(employees, i -> i.years_exp > 5)`
>
> The `FILTER` higher-order function applies a lambda predicate to each element of an array column, returning a new array containing only elements where the condition is true. The arrow syntax (`->`) defines the anonymous function.

---

## Question 16: Python Variable in SQL Query

**Question** *(Easy)*: A data engineer has a Python variable `table_name` and wants to execute a SQL query using it in PySpark. The incomplete code block is shown below:

```python
table_name = "sales"
result = _____(f"SELECT * FROM {table_name}")
```

Which method completes the blank?

A) `spark.sql`
B) `spark.read`
C) `spark.query`
D) `spark.execute`

> [!success]- Answer
> **Correct Answer: A**
>
> `spark.sql(f"SELECT * FROM {table_name}")`
>
> `spark.sql()` accepts a SQL string, and Python f-strings embed variables directly into the query using `{variable_name}` syntax. This is the standard way to dynamically reference table names or other values from Python variables in SQL queries.

---

## Question 17: Python Function Definition

**Question** *(Easy)*: A data engineer new to Python needs a function that adds two integers and returns their sum. Which code block is correct?

A) `function add_integers(x, y): return x + y`
B) `def add_integers(x, y): return x + y`
C) `def add_integers(x, y): yield x + y`
D) `def add_integers(x, y): print(x + y)`

> [!success]- Answer
> **Correct Answer: B**
>
> ```python
> def add_integers(x, y):
>     return x + y
> ```
>
> In Python, `def` defines a function and `return` outputs the result. Using `print` instead of `return` would output to the console but the function would return `None`, making it unusable in further computation. Using `function` (JavaScript syntax) would cause a `SyntaxError`.

---

## Question 18: MERGE INTO vs INSERT INTO

**Question** *(Medium)*: When should a data engineer prefer the `MERGE INTO` command over the `INSERT INTO` command?

A) When the target table needs to be completely overwritten with new data
B) When inserting data from a streaming source into a batch table
C) When the target table cannot contain duplicate records
D) When the source and target tables have different schemas

> [!success]- Answer
> **Correct Answer: C**
>
> When the target table cannot contain duplicate records.
>
> `MERGE INTO` matches source records against existing rows on a key condition and conditionally inserts, updates, or skips records. `INSERT INTO` always appends all rows regardless of existing data, which would create duplicates if records already exist.

---

## Question 19: GROUP BY Ordinal Referencing an Aggregate

**Question** *(Medium)*: What is wrong with the following SQL query?

```sql
SELECT name, count(*) FROM people GROUP BY 2
```

A) The `count(*)` function requires an alias to be used with `GROUP BY`
B) The query is missing a `HAVING` clause to filter the aggregated results
C) `GROUP BY` using a numeric ordinal position is never valid in Spark SQL
D) `GROUP BY 2` refers to `count(*)`, an aggregate expression, which can't be a grouping key

> [!success]- Answer
> **Correct Answer: D**
>
> `GROUP BY 2` refers to `count(*)`, an aggregate expression, which can't be a grouping key.
>
> Databricks SQL does allow grouping by column position (for example `GROUP BY 1` here would group by `name`). But "if a positional reference resolves to an aggregate expression, Databricks raises GROUP_BY_POS_AGGREGATE". Use `GROUP BY 1` or `GROUP BY name` ([GROUP BY clause](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-groupby)).

---

## Question 20: Tool for Automated Data Quality Monitoring

**Question** *(Easy)*: During data ingestion, a data engineer observes that source data quality is declining. They want to automate the process of monitoring the quality level. Which tool addresses this?

A) Lakeflow Declarative Pipelines (formerly DLT)
B) Databricks SQL Alerts with scheduled queries
C) Apache Airflow with custom validation DAGs
D) Great Expectations library integrated with Spark

> [!success]- Answer
> **Correct Answer: A**
>
> Lakeflow Declarative Pipelines (formerly DLT).
>
> Lakeflow Declarative Pipelines provides built-in data quality monitoring through expectations — declarative constraints that automatically track pass/fail metrics, record violations in the event log, and optionally drop or quarantine bad records. Quality statistics are visible per-table in the pipeline UI.

---

## Question 21: Lakeflow Declarative Pipelines Continuous Pipeline Behavior

**Question** *(Hard)*: A Lakeflow Declarative Pipelines pipeline has two streaming tables and three materialized views. It runs in Production mode with Continuous Pipeline Mode. What outcome should be expected after clicking Start if there is unprocessed data and all definitions are correct?

A) Only the two streaming datasets are updated continuously; the three materialized views are updated once and then stop
B) All datasets are updated at set intervals until the pipeline is shut down. Compute resources are deployed for the update and terminated when the pipeline is stopped
C) All five datasets are updated once, and then the pipeline shuts down automatically to conserve resources
D) The pipeline fails because streaming and materialized view datasets cannot coexist in Continuous mode

> [!success]- Answer
> **Correct Answer: B**
>
> All datasets are updated at set intervals until the pipeline is shut down. Compute resources are deployed for the update and terminated when the pipeline is stopped.
>
> In Continuous mode, the pipeline runs indefinitely — processing streaming tables as new data arrives and periodically refreshing materialized views. It does not shut down automatically; resources are released only when the pipeline is manually stopped.

---

## Question 22: Lakeflow Declarative Pipelines DROP Expectation Behavior

**Question** *(Medium)*: A dataset established through Lakeflow Declarative Pipelines has an expectations clause with `ON VIOLATION DROP ROW`. What should occur when processing a batch of data that includes entries violating these constraints?

A) Violating records are written to a separate quarantine table for manual review
B) The entire batch is rejected and the pipeline enters a failed state
C) Records that violate the expectation are dropped from the target dataset and recorded as invalid in the event log
D) The pipeline pauses and waits for manual approval before continuing

> [!success]- Answer
> **Correct Answer: C**
>
> Records that violate the expectation are dropped from the target dataset and recorded as invalid in the event log.
>
> The pipeline continues running. Dropped record counts and violation metrics are tracked in the Lakeflow Declarative Pipelines event log and displayed per-table in the pipeline UI under data quality statistics. The `FAIL UPDATE` variant would stop the pipeline instead.

---

## Question 23: CREATE STREAMING TABLE vs CREATE MATERIALIZED VIEW

**Question** *(Medium)*: In a Lakeflow Declarative Pipelines SQL definition, when should `CREATE OR REFRESH STREAMING TABLE` be used instead of `CREATE OR REFRESH MATERIALIZED VIEW`?

A) When the table needs to support both read and write operations simultaneously
B) When the table must be accessible from multiple workspaces
C) When the table requires ACID transaction support
D) When data needs to be processed incrementally

> [!success]- Answer
> **Correct Answer: D**
>
> When data needs to be processed incrementally.
>
> A streaming table reads append-oriented sources (Auto Loader, Kafka, `STREAM(...)` of another table) and processes only records that arrived since the last update. A materialized view stores a query result and refreshes it, incrementally when possible, otherwise by recomputing. Legacy syntax used `CREATE STREAMING LIVE TABLE` (now a streaming table) and `CREATE LIVE TABLE` (now a materialized view).

---

## Question 24: Silver to Gold Streaming Query

**Question** *(Medium)*: Which type of Structured Streaming query represents the transition from a Silver table to a Gold table?

A) A query that reads from a Silver streaming table and applies aggregations — such as `groupBy()` with `sum()`, `count()`, or `avg()` — to produce summary metrics written to a Gold table
B) A query that deduplicates and cleanses Bronze data before writing to a Silver table
C) A query that reads raw data from cloud storage and applies schema enforcement before writing to a Silver table
D) A query that replicates Silver data to an external data warehouse for reporting

> [!success]- Answer
> **Correct Answer: A**
>
> A query that reads from a Silver streaming table and applies aggregations — such as `groupBy()` with `sum()`, `count()`, or `avg()` — to produce summary metrics written to a Gold table.
>
> Gold tables typically contain business-level aggregates. Transforming cleaned Silver data into aggregated Gold data is the defining characteristic of the Silver-to-Gold transition in medallion architecture.
>
> > ⚠️ *This answer was generated by AI — verify against official Databricks documentation.*

---

## Question 25: Identifying Which Lakeflow Declarative Pipelines Table Drops Records

**Question** *(Medium)*: A data engineer manages three tables in a Lakeflow Declarative Pipelines pipeline with expectations set to eliminate invalid records. They observe that data is being discarded at some stage. How can they identify which specific table is dropping the records?

A) Query the Delta transaction log of each table to find DELETE operations
B) Navigate to the Lakeflow Declarative Pipelines pipeline page, click on each table, and view the data quality statistics
C) Run DESCRIBE HISTORY on each table to check for dropped record counts
D) Add explicit logging statements to each table's transformation code

> [!success]- Answer
> **Correct Answer: B**
>
> Navigate to the Lakeflow Declarative Pipelines pipeline page, click on each table, and view the data quality statistics.
>
> The Lakeflow Declarative Pipelines pipeline UI shows per-table expectation metrics, including the number of records that passed, failed, or were dropped for each defined constraint. This makes it straightforward to pinpoint which table's expectation is causing record drops.

---

## Question 26: Lakeflow Declarative Pipelines Pipeline Minimum Requirement

**Question** *(Easy)*: What needs to be specified when creating a new Lakeflow Declarative Pipelines pipeline?

A) A target database and storage location
B) A cluster policy and node type configuration
C) At least one source code file or notebook that defines the datasets
D) An explicit schedule or cron expression

> [!success]- Answer
> **Correct Answer: C**
>
> At least one source code file or notebook that defines the datasets.
>
> A pipeline must reference source code (notebooks or files) containing the dataset definitions, such as `CREATE OR REFRESH STREAMING TABLE` / `CREATE OR REFRESH MATERIALIZED VIEW` statements or `@dp.table` / `@dp.materialized_view` functions. Other settings — storage location, target database, cluster configuration — are optional and can use defaults.

---

## Question 27: STREAM() Function in Lakeflow Declarative Pipelines

**Question** *(Medium)*: A data engineer joins an ongoing project and notices a `STREAM()` function wrapping a table reference in a Lakeflow Declarative Pipelines SQL query. What explains its inclusion?

A) The `STREAM()` function applies watermarking to handle late-arriving data
B) The `STREAM()` function enables parallel reads from the table across multiple clusters
C) It converts a batch table into a temporary streaming source for the current query only
D) The referenced dataset is read as a streaming source (for example, a streaming table)

> [!success]- Answer
> **Correct Answer: D**
>
> The referenced dataset is read as a streaming source (for example, a streaming table).
>
> In Lakeflow Declarative Pipelines, `STREAM(table_name)` indicates that the table should be read as a streaming source — consuming only new records incrementally rather than reprocessing the full table. It is required when the source is a streaming table and the consuming dataset needs to process it incrementally.

---

## Question 28: Lakeflow Declarative Pipelines Migration Changes

**Question** *(Medium)*: A data engineer (Python, bronze/silver) and a data analyst (SQL, gold) collaborate on a medallion pipeline with a streaming source. They plan to migrate to Lakeflow Declarative Pipelines. What changes are necessary?

A) No changes are required
B) The SQL code must be rewritten in Python because Lakeflow Declarative Pipelines only supports Python definitions
C) The streaming source must be converted to a batch source before migrating to Lakeflow Declarative Pipelines
D) The Python code must be rewritten in SQL because Lakeflow Declarative Pipelines only supports SQL definitions

> [!success]- Answer
> **Correct Answer: A**
>
> No changes are required.
>
> Lakeflow Declarative Pipelines natively supports both Python and SQL within the same pipeline. It supports the medallion architecture (Bronze/Silver/Gold layers) and handles streaming sources directly. The existing language mix and multi-hop architecture can migrate to Lakeflow Declarative Pipelines without modification to the underlying logic.

---

## Question 29: Persist to Memory and Disk

**Question** *(Medium)*: Which Spark method persists data to both memory and disk when memory is insufficient?

A) `cache()` with `StorageLevel.MEMORY_ONLY`
B) `persist()` with `StorageLevel.MEMORY_AND_DISK`
C) `checkpoint()` with eager evaluation
D) `broadcast()` with local storage fallback

> [!success]- Answer
> **Correct Answer: B**
>
> `persist()` with `StorageLevel.MEMORY_AND_DISK`.
>
> `persist()` allows specifying a `StorageLevel` such as `MEMORY_AND_DISK`, which stores partitions in memory and spills excess to disk when memory is exhausted. `cache()` is a shortcut for `persist(StorageLevel.MEMORY_ONLY)` and does not spill to disk automatically.

---

## Question 30: Broadcast Join for a Small Dimension *(2026 blueprint)*

**Question** *(Medium)*: A 2 TB `sales` DataFrame is joined to a 15 MB `stores` DataFrame on `store_id`. The Spark UI shows a `SortMergeJoin` with a large shuffle of `sales`. Which change avoids shuffling the large side?

A) `sales.repartition(1).join(stores, "store_id")`
B) `sales.crossJoin(stores).filter("sales.store_id = stores.store_id")`
C) `sales.join(broadcast(stores), "store_id")`
D) Lower `spark.sql.shuffle.partitions` to 10

> [!success]- Answer
> **Correct Answer: C**
>
> `sales.join(broadcast(stores), "store_id")`.
>
> `broadcast()` marks the small DataFrame for a broadcast join, which copies it to every executor so `sales` isn't shuffled. Its size (15 MB) is above the default `spark.sql.autoBroadcastJoinThreshold` of 10 MB, which is why Spark didn't broadcast it automatically. A cross join multiplies rows. One partition removes parallelism. Fewer shuffle partitions don't remove the shuffle ([SQL performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)).

---

## Question 31: union vs unionByName *(2026 blueprint)*

**Question** *(Medium)*: Two DataFrames hold the same columns in a different order: `df_a(id, name, city)` and `df_b(city, id, name)`. Which call combines them, keeping duplicate rows and matching columns correctly?

A) `df_a.union(df_b)`
B) `df_a.join(df_b, "id", "outer")`
C) `df_a.union(df_b).distinct()`
D) `df_a.unionByName(df_b)`

> [!success]- Answer
> **Correct Answer: D**
>
> `df_a.unionByName(df_b)`.
>
> `union` resolves columns **by position**, so it would put `city` values into `id`. `unionByName` resolves them **by name**. Both keep duplicates, which is SQL `UNION ALL` semantics. Add `.distinct()` for SQL `UNION` behaviour. `allowMissingColumns=True` fills columns missing from one side with nulls ([PySpark unionByName](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.unionByName.html)).

---

## Question 32: Splitting and Exploding Columns *(2026 blueprint)*

**Question** *(Medium)*: A Silver table has a `tags` string column such as `"red,large,sale"`. Analysts need one row per tag. Which PySpark expression produces it?

A) `df.withColumn("tag", F.explode(F.split("tags", ",")))`
B) `df.withColumn("tag", F.split("tags", ","))`
C) `df.withColumn("tag", F.flatten("tags"))`
D) `df.groupBy("tags").agg(F.collect_list("tags"))`

> [!success]- Answer
> **Correct Answer: A**
>
> `df.withColumn("tag", F.explode(F.split("tags", ",")))`.
>
> `split` turns the string into an array using a (regular expression) pattern. `explode` then emits one row per array element. `split` alone leaves one row with an array. `flatten` works on arrays of arrays, and `collect_list` does the opposite of what's needed ([PySpark split](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.functions.split.html)).

---

## Question 33: Fast Distinct Counts on Huge Tables *(2026 blueprint)*

**Question** *(Easy)*: A dashboard shows the number of distinct visitors per day over billions of events. An exact `COUNT(DISTINCT visitor_id)` is too slow, and a small error is acceptable. Which function fits?

A) `count_if(visitor_id IS NOT NULL)`
B) `approx_count_distinct(visitor_id)`
C) `sum(DISTINCT visitor_id)`
D) `collect_set(visitor_id)`

> [!success]- Answer
> **Correct Answer: B**
>
> `approx_count_distinct(visitor_id)`.
>
> `approx_count_distinct` estimates the number of distinct values with HyperLogLog++. Its default maximum relative standard deviation is 5 %, and the `relativeSD` argument can tighten it. `collect_set` would build huge arrays, and the other options compute something else ([approx_count_distinct](https://docs.databricks.com/aws/en/sql/language-manual/functions/approx_count_distinct)).

---

## Question 34: Shuffle Partitions vs Default Parallelism *(2026 blueprint)*

**Question** *(Medium)*: A DataFrame `groupBy` on 40 MB of data runs 200 tiny tasks after the shuffle on classic compute. An engineer wants to tune the post-shuffle partition count and then re-measure. Which setting controls it?

A) `spark.default.parallelism`
B) `spark.executor.memory`
C) `spark.sql.shuffle.partitions`
D) `spark.sql.autoBroadcastJoinThreshold`

> [!success]- Answer
> **Correct Answer: C**
>
> `spark.sql.shuffle.partitions`.
>
> It sets the number of partitions used when shuffling data for joins or aggregations in the DataFrame and SQL engine (default 200). On Databricks, setting it to `auto` lets Spark size it from the plan and the data. `spark.default.parallelism` applies to RDD operations, memory settings size the JVMs, and the broadcast threshold controls join strategy ([AQE](https://docs.databricks.com/aws/en/optimizations/aqe), [Spark SQL tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)).

---

## Question 35: Choosing a Gold Object for a Busy Dashboard *(2026 blueprint)*

**Question** *(Medium)*: Two hundred users open a dashboard each morning that aggregates revenue by region from a large Silver table. Hourly freshness is acceptable. The team wants fast reads and doesn't want to maintain refresh code. Which Unity Catalog object should back the dashboard?

A) A standard view over the Silver table
B) A streaming table that appends Silver rows
C) A temporary view created by the dashboard query
D) A materialized view refreshed on a schedule

> [!success]- Answer
> **Correct Answer: D**
>
> A materialized view refreshed on a schedule.
>
> A materialized view stores precomputed results and refreshes them (incrementally when possible) on a schedule or when upstream data changes, so reads are cheap. A view recomputes the aggregation on every query. Temporary views are session-scoped. Streaming tables append new rows and don't recompute an aggregate ([standalone materialized views](https://docs.databricks.com/aws/en/views/materialized)).

---

**[← Previous: Domain 2: Data Ingestion and Loading](./02-data-ingestion-and-loading.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 4: Working with Lakeflow Jobs →](./04-working-with-lakeflow-jobs.md)**
