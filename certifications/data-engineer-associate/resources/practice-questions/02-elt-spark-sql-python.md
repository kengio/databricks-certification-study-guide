---
title: "Practice Questions: ELT with Spark SQL and Python"
type: practice-questions
tags: [data-engineer-associate, practice-questions, elt-spark-sql]
---

# Domain 2: ELT with Spark SQL and Python

## Question 1: DELETE Syntax

**Question** *(Easy)*: Which code block will delete rows from the Delta table `my_table` where the `age` column value exceeds 25?

A) `REMOVE FROM my_table WHERE age > 25;`
B) `DROP ROWS FROM my_table WHERE age > 25;`
C) `DELETE FROM my_table WHERE age > 25;`
D) `TRUNCATE my_table WHERE age > 25;`

> [!success]- Answer
> **Correct Answer: C**
>
> `DELETE FROM my_table WHERE age > 25;`
>
> This standard SQL DML syntax works directly on Delta tables. Delta Lake supports full DML operations including DELETE, UPDATE, and MERGE with ACID guarantees, so the deleted rows are tracked in the transaction log and are recoverable via time travel.

---

## Question 2: PySpark Table Access

**Question** *(Easy)*: A data analyst has developed a Delta table `sales` that the entire data analysis team uses. The data engineering team prefers Python. Which command can the engineering team use to access `sales` data in PySpark?

A) `spark.read.delta("sales")`
B) `spark.table("sales")`
C) `spark.load("sales")`
D) `spark.sql.table("sales")`

> [!success]- Answer
> **Correct Answer: B**
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

A) `TBLPROPERTIES ('contains_pii' = 'true')`
B) `COMMENT 'contains_pii = true'`
C) `OPTIONS ('contains_pii' = 'true')`
D) `METADATA ('contains_pii' = 'true')`

> [!success]- Answer
> **Correct Answer: A**
>
> `TBLPROPERTIES ('contains_pii' = 'true')`
>
> `TBLPROPERTIES` adds structured key-value metadata directly to the table definition — these are the actual "table properties" in Databricks SQL. `COMMENT` adds a human-readable description but is not a table property. Using `TBLPROPERTIES` to tag sensitivity classifications (e.g., PII, data classification) is the standard approach for policy-driven metadata in Databricks.

---

## Question 4: Array Functions for Nested JSON

**Question** *(Easy)*: What benefits do the array functions from Spark SQL offer?

A) The ability to automatically flatten all nested structures into separate tables
B) The ability to convert JSON files into Parquet format without code
C) The ability to enforce strict schemas on semi-structured data at write time
D) The ability to work with complex, nested data ingested from JSON files

> [!success]- Answer
> **Correct Answer: D**
>
> The ability to work with complex, nested data ingested from JSON files.
>
> Functions like `explode`, `array_contains`, `transform`, and `filter` allow operations directly on nested array structures without flattening the entire schema first, making them essential for processing hierarchical JSON data at scale.

---

## Question 5: MERGE to Prevent Duplicates

**Question** *(Easy)*: What commands can be utilized to insert data into a Delta table while preventing duplicate records?

A) `INSERT DISTINCT`
B) `UPSERT`
C) `COPY INTO`
D) `MERGE`

> [!success]- Answer
> **Correct Answer: D**
>
> `MERGE`.
>
> The `MERGE INTO` statement matches source records against a target table on a key condition and conditionally inserts, updates, or skips records. This is the standard upsert pattern in Delta Lake for ensuring no duplicate rows are added.

---

## Question 6: JDBC Format for SQLite

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

## Question 7: UNION for Unique Records

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

## Question 8: Python Multi-Condition Control Flow

**Question** *(Medium)*: A data engineer intends to run the last block of a Python program only if `day_of_week` is set to 1 and `review_period` is `True`. The incomplete code block is shown below:

```python
day_of_week = get_day_of_week()
review_period = check_review_period()

_____
    run_final_block()
```

What control flow statement should be used to complete the blank?

A) `if day_of_week == 1 and review_period:`
B) `if day_of_week = 1 and review_period == "True":`
C) `if day_of_week == 1 or review_period:`
D) `if day_of_week is 1 and review_period is True:`

> [!success]- Answer
> **Correct Answer: A**
>
> `if day_of_week == 1 and review_period:`
>
> In Python, `==` performs equality comparison (not assignment). A boolean variable is truthy when referenced directly — wrapping it in quotes (`"True"`) would compare against the string literal, not the boolean value. Using a single `=` would cause a `SyntaxError`.

---

## Question 9: External Table Data Retention After DROP

**Question** *(Medium)*: A data engineer drops `my_table` with `DROP TABLE IF EXISTS my_table`. The object no longer appears in `SHOW TABLES`, but the data files still exist on the filesystem. What explains this?

A) The DROP command failed silently due to insufficient permissions
B) The table had active streaming readers that prevented file deletion
C) The table was an external table
D) The VACUUM command needs to be run separately to remove data files

> [!success]- Answer
> **Correct Answer: C**
>
> The table was an external table.
>
> When an external table is dropped, Databricks removes only the metadata entry from the metastore. The underlying data files are stored at a user-defined location and are not managed by Databricks, so they remain intact after the table is dropped.

---

## Question 10: Persistent Cross-Session Data Entity

**Question** *(Medium)*: A data engineer needs a data entity built from several tables that must be accessible to other data engineers in their sessions and stored in a physical location. Which data entity should be created?

A) A temporary view
B) A table (Delta or Spark SQL table)
C) A global temporary view
D) A Common Table Expression (CTE)

> [!success]- Answer
> **Correct Answer: B**
>
> A table (Delta or Spark SQL table).
>
> Tables persist data physically at a storage location and are registered in the metastore, making them accessible across all sessions and users. Unlike temporary views (session-scoped) or views (no physical storage), tables outlive any individual session.

---

## Question 11: INSERT INTO a Delta Table

**Question** *(Easy)*: A data engineer needs to add a new record `('a1', 6, 9.4)` to the existing Delta table `my_table`. Which SQL command accomplishes this?

A) `INSERT INTO my_table VALUES ('a1', 6, 9.4);`
B) `ADD ROW my_table VALUES ('a1', 6, 9.4);`
C) `APPEND INTO my_table VALUES ('a1', 6, 9.4);`
D) `MERGE INTO my_table VALUES ('a1', 6, 9.4);`

> [!success]- Answer
> **Correct Answer: A**
>
> `INSERT INTO my_table VALUES ('a1', 6, 9.4);`
>
> `INSERT INTO ... VALUES` appends new rows to an existing Delta table without modifying existing records. Delta Lake records this as a new transaction in the log, making it reversible via time travel.

---

## Question 12: CREATE OR REPLACE TABLE

**Question** *(Easy)*: A data architect needs to create an empty Delta table in a specified format, regardless of whether a table with that name already exists. Which SQL DDL approach accomplishes this?

A) `DROP TABLE IF EXISTS table_name; CREATE TABLE table_name (...)`
B) `CREATE TABLE IF NOT EXISTS table_name (...)`
C) `ALTER TABLE table_name REPLACE COLUMNS (...)`
D) `CREATE OR REPLACE TABLE table_name (...column definitions...)`

> [!success]- Answer
> **Correct Answer: D**
>
> `CREATE OR REPLACE TABLE table_name (...column definitions...)`
>
> This atomically drops and recreates the table if it exists, or creates it new if it does not. It avoids errors from pre-existing tables and ensures the table always reflects the latest schema definition.

---

## Question 13: PIVOT for Wide Format

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

## Question 14: Parquet Advantage Over CSV

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

## Question 15: Temporary View for Single-Session Use

**Question** *(Medium)*: A data engineer needs a relational object from two tables that will not be used by other engineers in different sessions. To minimize storage expenses, physical data should not be duplicated. Which relational object should be created?

A) A materialized view
B) A managed Delta table
C) An external table
D) A temporary view

> [!success]- Answer
> **Correct Answer: D**
>
> A temporary view.
>
> Temporary views exist only for the current Spark session, are not accessible to other users, and store no physical data — they are just a named query definition. This avoids both storage costs and data duplication while enabling SQL-based access within the session.

---

## Question 16: PySpark SQL Query Execution

**Question** *(Easy)*: A data analyst has created a query that operates on a Delta table. They seek assistance from the data engineering team to perform a set of tests to verify that the data returned by the query is accurate and clean. However, the data engineering team utilizes Python for their tests instead of SQL. Which operations can the data engineering team use in PySpark to execute the query and process the results?

A) `spark.sql("SELECT ...")`
B) `spark.query("SELECT ...")`
C) `spark.execute("SELECT ...")`
D) `spark.run("SELECT ...")`

> [!success]- Answer
> **Correct Answer: A**
>
> `spark.sql("SELECT ...")`
>
> `spark.sql()` accepts a SQL query string and executes it, returning the results as a PySpark DataFrame. `spark.table("table_name")` loads an entire table as a DataFrame but does not execute a specific SQL query — it is not the correct tool when the goal is to run a particular SQL statement.

---

## Question 17: count_if for NULL Values

**Question** *(Medium)*: Which command shows the count of null values in the `member_id` column?

A) `SELECT count_if(member_id IS NULL) FROM my_table;`
B) `SELECT sum(CASE WHEN member_id IS NULL THEN 0 ELSE 1 END) FROM my_table;`
C) `SELECT count(member_id) FROM my_table WHERE member_id IS NULL;`
D) `SELECT count(NULL) FROM my_table;`

> [!success]- Answer
> **Correct Answer: A**
>
> `SELECT count_if(member_id IS NULL) FROM my_table;`
>
> `count_if` counts rows that satisfy the given boolean condition. `IS NULL` evaluates to true for null values. Standard `count(member_id)` would exclude nulls, returning the opposite of what is needed.

---

## Question 18: FILTER Higher-Order Function

**Question** *(Medium)*: A data engineer needs to implement custom logic for the `employees` array column in the `stores` table to find employees with more than 5 years of experience. The result should be a new column `exp_employees` containing only matching employees for each row. The incomplete SQL query is shown below:

```sql
SELECT store_id,
       _____ AS exp_employees
FROM stores
```

Which code correctly completes the blank using the FILTER higher-order function?

A) `FILTER(employees, i -> i.years_exp > 5)`
B) `ARRAY_FILTER(employees, i -> i.years_exp > 5)`
C) `SELECT_FROM_ARRAY(employees, years_exp > 5)`
D) `TRANSFORM(employees, i -> i.years_exp > 5)`

> [!success]- Answer
> **Correct Answer: A**
>
> `FILTER(employees, i -> i.years_exp > 5)`
>
> The `FILTER` higher-order function applies a lambda predicate to each element of an array column, returning a new array containing only elements where the condition is true. The arrow syntax (`->`) defines the anonymous function.

---

## Question 19: Python Variable in SQL Query

**Question** *(Easy)*: A data engineer has a Python variable `table_name` and wants to execute a SQL query using it in PySpark. The incomplete code block is shown below:

```python
table_name = "sales"
result = _____(f"SELECT * FROM {table_name}")
```

Which method completes the blank?

A) `spark.read`
B) `spark.sql`
C) `spark.query`
D) `spark.execute`

> [!success]- Answer
> **Correct Answer: B**
>
> `spark.sql(f"SELECT * FROM {table_name}")`
>
> `spark.sql()` accepts a SQL string, and Python f-strings embed variables directly into the query using `{variable_name}` syntax. This is the standard way to dynamically reference table names or other values from Python variables in SQL queries.

---

## Question 20: Default Database Storage Location

**Question** *(Easy)*: A data engineer has established a new database with this command:

```sql
CREATE DATABASE IF NOT EXISTS customer360;
```

Where will the `customer360` database be situated?

A) `dbfs:/user/hive/warehouse/customer360.db`
B) `dbfs:/user/hive/warehouse/`
C) `dbfs:/databricks/databases/customer360/`
D) `dbfs:/mnt/default/customer360.db`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbfs:/user/hive/warehouse/customer360.db`
>
> When a database is created without specifying a `LOCATION`, Databricks stores it in the default Hive warehouse directory at `dbfs:/user/hive/warehouse/`. A subdirectory named `<database_name>.db` is automatically created for it. Specifying only `dbfs:/user/hive/warehouse` (without the `.db` suffix) is incorrect — that is the parent warehouse directory, not the database's own location.

---

## Question 21: DESCRIBE DATABASE Location

**Question** *(Easy)*: Which command retrieves the location of the `customer360` database?

A) `SHOW DATABASE LOCATION customer360;`
B) `SELECT location FROM information_schema.databases WHERE name = 'customer360';`
C) `DESCRIBE DATABASE customer360;`
D) `LIST DATABASE customer360;`

> [!success]- Answer
> **Correct Answer: C**
>
> `DESCRIBE DATABASE customer360;`
>
> This command returns database metadata including the storage location path, owner, comment, and custom properties. It is the standard way to inspect database-level information in Spark SQL and Databricks.

---

## Question 22: Managed Table File Deletion After DROP

**Question** *(Medium)*: A data engineer drops `my_table` and observes that both data files and metadata files are deleted from the filesystem. What explains the complete deletion?

A) The VACUUM command was automatically triggered after the DROP
B) The table was stored in a temporary storage location
C) The table was a managed table
D) The table had a retention policy set to zero days

> [!success]- Answer
> **Correct Answer: C**
>
> The table was a managed table.
>
> When a managed (internal) table is dropped, Databricks deletes both the metastore entry and the underlying data files, because Databricks controls the full lifecycle of managed table data. This is the opposite behavior from external tables.

---

## Question 23: Python Function Definition

**Question** *(Easy)*: A data engineer new to Python needs a function that adds two integers and returns their sum. Which code block is correct?

A) `function add_integers(x, y): return x + y`
B) `def add_integers(x, y): print(x + y)`
C) `def add_integers(x, y): yield x + y`
D) `def add_integers(x, y): return x + y`

> [!success]- Answer
> **Correct Answer: D**
>
> ```python
> def add_integers(x, y):
>     return x + y
> ```
>
> In Python, `def` defines a function and `return` outputs the result. Using `print` instead of `return` would output to the console but the function would return `None`, making it unusable in further computation. Using `function` (JavaScript syntax) would cause a `SyntaxError`.

---

## Question 24: MERGE INTO vs INSERT INTO

**Question** *(Medium)*: When should a data engineer prefer the `MERGE INTO` command over the `INSERT INTO` command?

A) When the target table needs to be completely overwritten with new data
B) When the target table cannot contain duplicate records
C) When inserting data from a streaming source into a batch table
D) When the source and target tables have different schemas

> [!success]- Answer
> **Correct Answer: B**
>
> When the target table cannot contain duplicate records.
>
> `MERGE INTO` matches source records against existing rows on a key condition and conditionally inserts, updates, or skips records. `INSERT INTO` always appends all rows regardless of existing data, which would create duplicates if records already exist.

---

## Question 25: GROUP BY Numeric Position in Spark SQL

**Question** *(Medium)*: What is wrong with the following SQL query?

```sql
SELECT name, count(*) FROM people GROUP BY 2
```

A) The `count(*)` function requires an alias to be used with `GROUP BY`
B) The `SELECT` clause must include all non-aggregated columns after the aggregate function
C) `GROUP BY` using a numeric ordinal position is not valid in Spark SQL
D) The query is missing a `HAVING` clause to filter the aggregated results

> [!success]- Answer
> **Correct Answer: C**
>
> `GROUP BY` using a numeric ordinal position is not valid in Spark SQL.
>
> Unlike some other SQL dialects (e.g., standard PostgreSQL), Spark SQL requires explicit column names in `GROUP BY` clauses. The correct query is `SELECT name, count(*) FROM people GROUP BY name`. Using column position `2` will raise an `AnalysisException`.

---

## Question 26: OPTIMIZE for File Compaction

**Question** *(Easy)*: A data engineer has discovered that the data files related to a Delta table are quite small. They aim to merge these small files into larger ones to enhance performance. Which keywords can be utilized to compact the small files?

A) VACUUM
B) OPTIMIZE
C) COMPACT
D) DEFRAGMENT

> [!success]- Answer
> **Correct Answer: B**
>
> `OPTIMIZE`.
>
> The `OPTIMIZE` command compacts small files in a Delta table into larger ones, improving read performance by reducing the number of files that need to be scanned. This is different from `VACUUM`, which removes old data files no longer referenced by the transaction log.

---

**[← Previous: Domain 1: Databricks Lakehouse Platform](./01-lakehouse-platform.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 3: Incremental Data Processing](./03-incremental-processing.md) →**
