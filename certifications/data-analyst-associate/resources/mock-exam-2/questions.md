---
title: Data Analyst Associate Mock Exam 2 — Questions
type: mock-exam-questions
tags: [data-analyst-associate, mock-exam, practice]
---

# Data Analyst Associate Mock Exam 2 — Questions

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## Databricks SQL (Questions 1–10)

---

## Question 1 *(Medium)*

An analyst uses Python to programmatically query Databricks SQL and retrieve results as a DataFrame. Which connection method is most appropriate for this use case?

A) ODBC driver — best for interactive desktop BI tools
B) JDBC driver — best for Java-based applications
C) Databricks SQL Connector for Python (`databricks-sql-connector`) via the Python driver
D) Delta Sharing — enables programmatic data access

> [!success]- Answer
> **Correct Answer: C**
>
> The Databricks SQL Connector for Python (`databricks-sql-connector`) is the recommended driver
> for Python applications querying Databricks SQL. It uses the Thrift protocol over HTTPS and
> returns results as Python data structures compatible with pandas. ODBC and JDBC are typically
> used by BI tools and JVM-based apps, not Python scripts.

---

## Question 2 *(Hard)*

A Pro SQL warehouse is configured with `max clusters = 3`. When does a third cluster spin up?

A) When the first query is submitted
B) When both existing clusters are fully utilized and new queries are waiting in queue
C) When the warehouse has been running for more than 1 hour
D) When any query takes longer than 60 seconds

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-cluster scaling in Pro warehouses is demand-driven. A new cluster spins up only when
> existing clusters are at capacity and queries are queuing. With `max clusters = 3`, the third
> cluster starts when both the first and second clusters are fully loaded. Clusters scale back
> down when demand decreases.

---

## Question 3 *(Easy)*

What does Photon acceleration do in Databricks SQL?

A) Compresses Delta table files to reduce storage costs
B) Replaces the JVM-based Spark SQL engine with a native C++ vectorized execution engine for faster query performance
C) Caches query results in memory for instant replay
D) Accelerates only Python notebook cells, not SQL queries

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is Databricks' native C++ vectorized query engine that replaces parts of the JVM-based
> Spark execution engine. It is optimized for analytical SQL workloads and significantly improves
> performance for scans, aggregations, joins, and sort operations on large datasets. Photon is
> enabled by default on Serverless and Pro warehouses.

---

## Question 4 *(Easy)*

What does Databricks SQL query federation enable?

A) Running the same query on multiple SQL warehouses simultaneously
B) Querying external data sources (e.g., MySQL, PostgreSQL) directly from Databricks SQL without copying data
C) Federating access control between multiple Unity Catalog metastores
D) Sharing queries between different Databricks workspaces

> [!success]- Answer
> **Correct Answer: B**
>
> Query federation allows Databricks SQL to query external databases (MySQL, PostgreSQL,
> Snowflake, etc.) directly via a connection object defined in Unity Catalog. Data is not
> copied into Databricks — queries push down to the source where possible and retrieve
> results on demand.

---

## Question 5 *(Medium)*

A Serverless SQL warehouse is idle with no queries running. Does it incur compute charges during this idle period?

A) Yes — Serverless warehouses charge continuously once started
B) No — Serverless warehouses auto-stop when idle and billing pauses; charges resume only when queries run
C) Yes — Serverless warehouses charge a reduced standby rate while idle
D) No — Serverless warehouses are always free during idle periods regardless of configuration

> [!success]- Answer
> **Correct Answer: B**
>
> Serverless SQL warehouses auto-stop when idle (default 10 minutes). Once stopped, no compute
> charges accrue. Billing resumes only when the next query arrives and the warehouse wakes up.
> This pay-per-use model is a primary cost advantage of Serverless over Classic/Pro warehouses,
> which charge for the full uptime even when idle.

---

## Question 6 *(Medium)*

Who can create a new SQL warehouse?

A) Any authenticated user  
B) Users with the CAN USE permission on an existing warehouse  
C) Workspace admins, or users with unrestricted cluster creation permission  
D) Only account admins  

> [!success]- Answer
> **Correct Answer: C**
>
> Creating a SQL warehouse requires being a workspace admin or having unrestricted cluster
> creation permission. CAN USE only lets a user run queries on an existing warehouse (B).
---

## Question 7 *(Medium)*

What is the difference between Query Profile and `EXPLAIN` in Databricks SQL?

A) They are identical — both show the query execution plan
B) `EXPLAIN` shows the logical/physical query plan before execution; Query Profile shows actual runtime metrics (rows processed, time per stage) after execution
C) Query Profile works only for streaming queries; `EXPLAIN` works for batch only
D) `EXPLAIN` requires admin privileges; Query Profile is available to all users

> [!success]- Answer
> **Correct Answer: B**
>
> `EXPLAIN` outputs the query plan (logical, analyzed, optimized, or physical) before the query
> runs — it is a planning-time tool. Query Profile (available in Query History) shows actual
> runtime metrics after execution: rows read per node, execution time per stage, bytes shuffled,
> and skew information. Both are useful for optimization but serve different purposes.

---

## Question 8 *(Easy)*

How long are query results cached in Databricks SQL by default?

A) 5 minutes
B) 1 hour
C) 24 hours
D) Until the SQL warehouse is restarted

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks SQL caches query results for up to 24 hours by default. The cache is invalidated
> earlier if the underlying Delta table is written to (a new transaction is logged). This ensures
> that cached results are never served for tables with new data, regardless of the TTL.

---

## Question 9 *(Hard)*

A SQL warehouse is configured with auto-stop set to 30 minutes. A long-running query has been executing for 25 minutes. What happens at the 30-minute mark?

A) The warehouse stops and the query is terminated
B) The auto-stop timer does not apply to active queries — the warehouse stops only after the query completes and the idle period begins
C) The query is paused and resumed when the warehouse restarts
D) The warehouse sends a warning but continues running for another 30 minutes

> [!success]- Answer
> **Correct Answer: B**
>
> Auto-stop only triggers when the warehouse is idle — no active queries running. If a query is
> in progress, the idle timer resets. The warehouse will not stop while queries are executing,
> regardless of the configured auto-stop duration.

---

## Question 10 *(Medium)*

What is a key difference between Databricks SQL and running SQL in a Databricks notebook?

A) Notebooks support Delta tables; Databricks SQL does not
B) Databricks SQL provides a purpose-built interface with query history, dashboards, alerts, and scheduled queries — notebooks require custom code for these capabilities
C) Notebooks use the Unity Catalog; Databricks SQL uses only the Hive metastore
D) Databricks SQL only supports SELECT statements; notebooks support all SQL commands

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL is a purpose-built analytics interface with built-in query history, result
> caching, dashboarding, alerting, and scheduled query execution. SQL in notebooks requires
> custom code or Jobs to replicate these capabilities. Both interfaces support the same
> underlying Delta tables and Unity Catalog.

---

## Data Management (Questions 11–19)

---

## Question 11 *(Easy)*

Which SQL command lists all tables visible in the current schema within Unity Catalog?

A) `LIST TABLES`
B) `SHOW TABLES`
C) `DESCRIBE SCHEMA`
D) `SELECT * FROM information_schema.tables LIMIT 10`

> [!success]- Answer
> **Correct Answer: B**
>
> `SHOW TABLES` (optionally `SHOW TABLES IN schema_name`) lists all tables and views in the
> current or specified schema. `DESCRIBE SCHEMA` shows schema metadata, not its table contents.
> `INFORMATION_SCHEMA.TABLES` also works but requires a full SELECT query.

---

## Question 12 *(Hard)*

A data engineer wants analysts to read the `email` column of a table but never see the real `ssn` values. Which Unity Catalog approach enables this?

A) A row filter on the table  
B) A column mask on `ssn` (or a view that excludes `ssn`, with `SELECT` granted on the view)  
C) A table clone that copies all columns  
D) Hiding the `ssn` column in a dashboard  

> [!success]- Answer
> **Correct Answer: B**
>
> Column-level protection in Unity Catalog uses column masks (a SQL UDF attached with
> `ALTER TABLE ... ALTER COLUMN ... SET MASK`) or views that expose only allowed columns. A row
> filter limits rows, not columns (A). Hiding a column in one tool does not protect it (D).
---

## Question 13 *(Easy)*

Which SQL syntax queries a Delta table as it existed at a specific version?

A) `SELECT * FROM table AT VERSION = 5`
B) `SELECT * FROM table VERSION AS OF 5`
C) `SELECT * FROM table WHERE _version = 5`
D) `SELECT * FROM table SNAPSHOT VERSION 5`

> [!success]- Answer
> **Correct Answer: B**
>
> `VERSION AS OF <n>` is the Delta Lake time travel syntax for querying a specific version.
> The equivalent timestamp syntax is `TIMESTAMP AS OF '<timestamp>'`. Both are standard
> Delta Lake time travel expressions supported in Databricks SQL.

---

## Question 14 *(Medium)*

In Unity Catalog, what does `GRANT USE SCHEMA ON SCHEMA catalog.schema TO user` allow the user to do?

A) Create new tables in the schema
B) Resolve and access objects within the schema — required before any table-level privilege takes effect
C) Delete the schema and its contents
D) Grant other users access to the schema

> [!success]- Answer
> **Correct Answer: B**
>
> `USE SCHEMA` is a prerequisite privilege in Unity Catalog. Without it, a user cannot resolve
> any objects within the schema even if they have SELECT on individual tables. `USE CATALOG`
> on the parent catalog is also required. These privileges form a hierarchy: catalog → schema
> → table.

---

## Question 15 *(Easy)*

A schema named `analytics` does not yet exist. Which SQL statement creates it only if it is absent, without raising an error?

A) `CREATE SCHEMA analytics IGNORE IF EXISTS`
B) `CREATE SCHEMA IF NOT EXISTS analytics`
C) `CREATE OR REPLACE SCHEMA analytics`
D) `UPSERT SCHEMA analytics`

> [!success]- Answer
> **Correct Answer: B**
>
> `CREATE SCHEMA IF NOT EXISTS schema_name` creates the schema only if it does not already
> exist. Without `IF NOT EXISTS`, the command raises an error if the schema already exists.
> `CREATE OR REPLACE` is valid for views and functions, not schemas.

---

## Question 16 *(Medium)*

What is the difference between a `SHALLOW CLONE` and a `DEEP CLONE` of a Delta table?

A) Shallow clone copies all data files; deep clone copies only metadata
B) Shallow clone copies only metadata and references the source data files; deep clone copies both metadata and all data files
C) They are identical — both copy all data and metadata
D) Shallow clone supports time travel; deep clone does not

> [!success]- Answer
> **Correct Answer: B**
>
> `SHALLOW CLONE` creates a new table with its own transaction log but references the original
> data files — no data is physically copied. It is fast and storage-efficient but depends on the
> source files remaining available. `DEEP CLONE` copies all data files and the transaction log,
> creating a fully independent copy suitable for backup or migration.

---

## Question 17 *(Easy)*

When is `CONVERT TO DELTA` needed?

A) When upgrading from Delta Lake version 1 to version 3
B) When converting an existing Parquet table (or Parquet-based Hive table) to Delta format
C) When migrating from Hive metastore to Unity Catalog
D) When enabling Photon on a Delta table

> [!success]- Answer
> **Correct Answer: B**
>
> `CONVERT TO DELTA parquet.'/path/to/table'` converts an existing Parquet table to Delta
> format in-place — it adds the Delta transaction log (`_delta_log`) without rewriting data
> files. This is the standard migration path for teams moving from plain Parquet to Delta Lake.

---

## Question 18 *(Medium)*

What does "attaching a workspace to a Unity Catalog metastore" mean?

A) Connecting the workspace's network to the metastore's VNet
B) Linking the workspace so that it uses the specified metastore for all catalog, schema, and table metadata — enabling Unity Catalog governance
C) Granting the workspace admin access to all catalogs in the metastore
D) Copying the workspace's existing Hive metastore tables into Unity Catalog

> [!success]- Answer
> **Correct Answer: B**
>
> A Unity Catalog metastore is a regional metadata store. Attaching a workspace to a metastore
> means the workspace uses that metastore for all Unity Catalog objects. Multiple workspaces in
> the same region can share a single metastore, enabling cross-workspace data governance and
> sharing through a unified catalog.

---

## Question 19 *(Easy)*

What information is available in `INFORMATION_SCHEMA.COLUMNS` for a Unity Catalog schema?

A) The current row count for each table
B) Column names, data types, nullability, and ordinal position for all tables in the schema
C) The access history for each column
D) Column-level statistics used by the query optimizer

> [!success]- Answer
> **Correct Answer: B**
>
> `INFORMATION_SCHEMA.COLUMNS` is a standard SQL information schema view that lists all columns
> across tables in the schema, including column name, data type, ordinal position, and whether
> the column is nullable. It is the standard way to programmatically inspect table schemas in
> Unity Catalog.

---

## SQL Queries (Questions 20–32)

---

## Question 20 *(Hard)*

A window function uses the frame clause `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. What does this compute?

A) The aggregate over the entire partition, ignoring the current row's position
B) A running (cumulative) aggregate from the first row of the partition to the current row
C) The aggregate over a 30-day rolling window
D) The aggregate between the first and last rows of the entire result set

> [!success]- Answer
> **Correct Answer: B**
>
> `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` defines a frame that starts at the
> first row of the partition and ends at the current row. Combined with `SUM` or `COUNT`,
> this produces a running (cumulative) total. `UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`
> would span the entire partition.

---

## Question 21 *(Medium)*

`NTILE(4) OVER (ORDER BY revenue DESC)` — what does this function do?

A) Returns the top 4 rows by revenue
B) Divides the result set into 4 equal-sized buckets and assigns each row a bucket number (1–4)
C) Returns the revenue values at the 25th, 50th, 75th, and 100th percentiles
D) Counts the number of distinct revenue values in each quartile

> [!success]- Answer
> **Correct Answer: B**
>
> `NTILE(n)` divides the ordered result set into `n` equal-sized buckets and assigns each row
> a bucket number from 1 to n. With `NTILE(4)` ordered by `revenue DESC`, bucket 1 contains
> the top quartile earners and bucket 4 contains the bottom quartile. Rows are distributed as
> evenly as possible across buckets.

---

## Question 22 *(Medium)*

What does `LPAD('42', 6, '0')` return?

A) `'420000'`
B) `'000042'`
C) `'42    '`
D) `'42'`

> [!success]- Answer
> **Correct Answer: B**
>
> `LPAD(string, target_length, pad_character)` left-pads the string to the target length using
> the pad character. `LPAD('42', 6, '0')` produces `'000042'` — four zeros prepended to make
> the total length 6. `RPAD` would pad on the right instead.

---

## Question 23 *(Hard)*

Which operator tests for equality between two values including the case where both are NULL?

A) `=`
B) `IS NOT DISTINCT FROM`
C) `<=>`
D) Both B and C are correct

> [!success]- Answer
> **Correct Answer: D**
>
> Standard `=` returns NULL (not TRUE) when either operand is NULL, so `NULL = NULL` evaluates
> to NULL (not TRUE). Both `<=>` (null-safe equality, Spark SQL) and `IS NOT DISTINCT FROM`
> (standard SQL) return TRUE when both sides are NULL. In Databricks SQL, both syntaxes are
> supported.

---

## Question 24 *(Medium)*

What is the difference between `COALESCE(a, b, c)` and `IFNULL(a, b)`?

A) They are identical — `IFNULL` is just an alias for `COALESCE`
B) `COALESCE` accepts two or more arguments and returns the first non-NULL; `IFNULL` accepts exactly two arguments and returns the second if the first is NULL
C) `IFNULL` is for numeric types only; `COALESCE` works on all types
D) `COALESCE` short-circuits evaluation; `IFNULL` always evaluates all arguments

> [!success]- Answer
> **Correct Answer: B**
>
> `COALESCE(a, b, c, ...)` accepts two or more arguments and returns the first non-NULL value
> in the list. `IFNULL(a, b)` is a two-argument shorthand that returns `b` when `a` is NULL.
> `IFNULL(a, b)` is functionally equivalent to `COALESCE(a, b)`. `NVL` (Oracle-derived) is
> another synonym for the two-argument form, also supported in Databricks SQL.

---

## Question 25 *(Easy)*

What does `SPLIT('hello,world,foo', ',')` return?

A) The number of commas in the string
B) An array: `['hello', 'world', 'foo']`
C) A single string with commas removed: `'helloworldfoo'`
D) Three separate rows: `'hello'`, `'world'`, `'foo'`

> [!success]- Answer
> **Correct Answer: B**
>
> `SPLIT(string, delimiter)` returns an array of strings split by the delimiter. To convert the
> array into separate rows, use `EXPLODE(SPLIT(...))`. `SPLIT` alone returns a single array
> value in one row.

---

## Question 26 *(Medium)*

`DATE_TRUNC('month', '2025-07-15')` — what does this return?

A) `'2025-07-15'` — no change for a date value
B) `'2025-07-01'` — truncates to the first day of the month
C) `'2025-01-01'` — truncates to the first month of the year
D) `'2025-07-31'` — rounds to the last day of the month

> [!success]- Answer
> **Correct Answer: B**
>
> `DATE_TRUNC(unit, date)` truncates a date or timestamp to the specified unit. Truncating to
> `'month'` sets the day to 1 and (for timestamps) clears time components. The result is
> `2025-07-01`. Common units: `'year'`, `'quarter'`, `'month'`, `'week'`, `'day'`, `'hour'`.

---

## Question 27 *(Medium)*

An analyst needs to count orders where `status = 'completed'` within a larger aggregation query. Which SQL expression achieves this without a subquery?

A) `COUNT(*) FILTER (WHERE status = 'completed')`
B) `SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`
C) Both A and B are correct
D) `COUNT_IF(status = 'completed')`

> [!success]- Answer
> **Correct Answer: C**
>
> All three approaches produce the same result. `SUM(CASE WHEN ...)` is the most portable
> across SQL dialects. `FILTER (WHERE ...)` is ANSI SQL standard and supported in Databricks
> SQL. `COUNT_IF(condition)` is a Databricks-specific shorthand. All avoid subqueries and
> work inline with other aggregations in the same `SELECT`.

---

## Question 28 *(Medium)*

An analyst uses a `CROSS JOIN` between a `products` table (500 rows) and a `dates` table (365 rows) to generate all product-date combinations. How many rows does the result contain?

A) 865 rows (500 + 365)
B) 182,500 rows (500 × 365)
C) 500 rows — the larger table determines row count
D) 365 rows — the smaller table determines row count

> [!success]- Answer
> **Correct Answer: B**
>
> A `CROSS JOIN` produces the Cartesian product of both tables: every row in `products` paired
> with every row in `dates`. 500 × 365 = 182,500 rows. Generating all product-date combinations
> for a sales grid or template table is a classic valid use case for `CROSS JOIN`.

---

## Question 29 *(Hard)*

A query uses `WHERE product_id NOT IN (SELECT product_id FROM returns)`. The `returns` table contains one NULL in `product_id`. What result does the main query return?

A) All rows where `product_id` is not in the non-NULL values of `returns`
B) Zero rows — `NOT IN` with a subquery containing NULL always returns an empty result
C) An error — NULL values are not permitted in `NOT IN` subqueries
D) The same result as using `NOT EXISTS`

> [!success]- Answer
> **Correct Answer: B**
>
> This is a classic SQL null-trap. `NOT IN` evaluates as `value != x AND value != y AND value != NULL`.
> Since any comparison with NULL returns UNKNOWN (not TRUE), the entire `NOT IN` condition
> becomes UNKNOWN for every row — and only TRUE rows pass the WHERE filter. The result is zero
> rows. Use `NOT EXISTS` or filter NULLs from the subquery to avoid this behavior.

---

## Question 30 *(Easy)*

What does the `INTERSECT` set operator return?

A) All rows from both queries combined, with duplicates removed
B) Only rows that appear in both query result sets
C) Rows from the first query that do not appear in the second query
D) All rows from both queries, including duplicates

> [!success]- Answer
> **Correct Answer: B**
>
> `INTERSECT` returns only rows that appear in both query results (the set intersection).
> `UNION` combines all rows (removing duplicates), `UNION ALL` combines with duplicates,
> and `EXCEPT` (or `MINUS`) returns rows in the first set not in the second.

---

## Question 31 *(Easy)*

What does the `EXCEPT` set operator return?

A) Rows that appear in either the first or second query, but not both
B) Rows from the first query result that do not appear in the second query result
C) Rows from the second query result that do not appear in the first query result
D) The symmetric difference of both result sets

> [!success]- Answer
> **Correct Answer: B**
>
> `EXCEPT` returns rows present in the first query's result but absent from the second query's
> result. It removes duplicates by default (use `EXCEPT ALL` to retain them). This is equivalent
> to a `LEFT ANTI JOIN` on the full set of columns.

---

## Question 32 *(Hard)*

An analyst writes: `SELECT region, revenue, DENSE_RANK() OVER (ORDER BY revenue DESC) AS dr FROM sales QUALIFY dr <= 3`. What does this return?

A) The top 3 revenue rows only
B) All rows where the dense rank of revenue is 1, 2, or 3 — multiple rows per rank if tied
C) An error — `QUALIFY` cannot be used with `DENSE_RANK()`
D) The top 3 distinct revenue values with one row each

> [!success]- Answer
> **Correct Answer: B**
>
> `DENSE_RANK()` assigns the same rank to tied rows and never skips rank numbers. `QUALIFY dr <= 3`
> keeps all rows where the dense rank is 1, 2, or 3. If three rows share rank 1, all three are
> returned. This pattern is useful for returning the top-N ranked groups including all ties.

---

## Dashboards & Visualization (Questions 33–40)

---

## Question 33 *(Easy)*

A Databricks SQL dashboard contains a Text widget with markdown content. What is the primary use case for a Text widget?

A) Displaying a live query result in formatted text
B) Adding static documentation, instructions, section headings, or context to a dashboard
C) Showing the last refresh timestamp automatically
D) Embedding an external URL in the dashboard

> [!success]- Answer
> **Correct Answer: B**
>
> Text widgets render static markdown content — headings, explanatory text, instructions, or
> links. They are used to add context and documentation to dashboards. Text widgets do not
> execute queries or display live data. For a live single-metric display, use a Counter widget.

---

## Question 34 *(Medium)*

A dashboard has four permission levels. Which level allows a user to run queries and see updated results, but not change query SQL or dashboard layout?

A) Can View
B) Can Run
C) Can Edit
D) Owner

> [!success]- Answer
> **Correct Answer: B**
>
> "Can Run" allows a user to trigger a dashboard refresh (re-execute underlying queries) and
> view the updated results. "Can View" shows the last cached results only — no refresh capability.
> "Can Edit" allows modifying queries and layout. "Owner" has full control including deletion.

---

## Question 35 *(Medium)*

A single SQL query returns columns for `region`, `product`, and `revenue`. An analyst wants both a bar chart and a table visualization from this same query result. What should they do?

A) Run the query twice and create one visualization from each run
B) Add multiple visualizations to the same query — Databricks SQL allows multiple visualizations per query result
C) Create two separate queries with identical SQL
D) Use a UNION to combine the data for the chart and the table

> [!success]- Answer
> **Correct Answer: B**
>
> In Databricks SQL, a single query can have multiple visualizations attached to it. Each
> visualization (bar chart, table, pie chart, counter, etc.) draws from the same query result.
> When the query refreshes, all visualizations update together. This avoids duplicating query
> logic.

---

## Question 36 *(Easy)*

Which export options are available from a Databricks SQL dashboard visualization?

A) PDF of the full dashboard page
B) CSV download of the underlying query result for individual visualizations
C) Excel (.xlsx) format only
D) Both A and B are available

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks SQL supports downloading individual visualization data as CSV (from the
> visualization's kebab menu) and downloading a PDF snapshot of the full dashboard. This
> enables analysts to share static snapshots or extract data for external use.

---

## Question 37 *(Medium)*

When configuring a Databricks SQL alert, which field allows customizing the email subject line?

A) Alerts do not support custom email subjects — a system-generated subject is always used
B) The "Custom subject" field in the alert notification settings
C) The alert name automatically becomes the email subject
D) Email subjects can only be customized via a webhook integration

> [!success]- Answer
> **Correct Answer: B**
>
> When configuring an alert's notification destinations, Databricks SQL provides a "Custom
> subject" field for email notifications. This allows the alert creator to specify a descriptive
> subject line such as "ALERT: Revenue dropped below threshold" instead of the default
> system-generated subject.

---

## Question 38 *(Medium)*

A dashboard schedule has a Microsoft Teams channel as a subscriber. What does the channel receive on each scheduled run?

A) Nothing; Teams cannot subscribe to dashboards  
B) A PNG snapshot in the channel, a link to the dashboard, and a PDF  
C) Only a CSV export of every dataset  
D) The dashboard's SQL text  

> [!success]- Answer
> **Correct Answer: B**
>
> Slack and Microsoft Teams destinations (set up by a workspace admin) receive a PNG snapshot,
> a link, and a PDF. Email subscribers receive a PDF snapshot, optionally with CSV, TSV, or
> Excel attachments.
---

## Question 39 *(Hard)*

An analyst creates a bar chart and wants the bars for `revenue > 1,000,000` to appear in green and all others in gray. How is this achieved?

A) This conditional coloring is not supported — all bars use a single color
B) Use a `CASE WHEN` in SQL to add a category column, then use that column as the "Color" or "Group By" dimension in the chart
C) Write a Python script to post-process the chart colors
D) Use the chart's "Threshold" option to set color ranges

> [!success]- Answer
> **Correct Answer: B**
>
> To achieve conditional coloring, add a computed category column in SQL:
> `CASE WHEN revenue > 1000000 THEN 'High' ELSE 'Normal' END AS revenue_tier`.
> Set the chart's "Color" or "Group By" to `revenue_tier` and assign colors per category
> in the chart configuration. This is the standard pattern for conditional visualization
> styling in Databricks SQL.

---

## Question 40 *(Hard)*

A team wants to schedule one dashboard to refresh every hour on a high-capacity warehouse during business hours and use a smaller warehouse for the nightly refresh to save cost. How can this be achieved?

A) This is not possible — a dashboard can only have one schedule and one assigned warehouse
B) Create two separate schedule entries on the dashboard, each with a different time window and a different assigned warehouse
C) Use a Databricks Job with two tasks to swap the warehouse assignment before each run
D) Configure warehouse auto-scaling to switch sizes based on time of day

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL dashboard scheduling supports only one active refresh schedule per dashboard,
> with a single assigned warehouse. To use different warehouses at different times, you would
> need to manage this through the Databricks REST API or Jobs — not through the dashboard
> scheduling UI directly. Awareness of this limitation is important for exam scenarios
> involving cost optimization and scheduling.

---

## Analytics Applications (Questions 41–45)

---

## Question 41 *(Easy)*

A dashboard filter needs to let users pick a date range (start date and end date). How does an AI/BI dashboard dataset use a date range parameter?

A) It cannot — a date range must be two separate text parameters  
B) A date range parameter exposes `.min` and `.max`, for example `WHERE order_date BETWEEN :date_range.min AND :date_range.max`  
C) Only serverless SQL warehouses support date ranges  
D) A date range needs a custom dropdown with hard-coded values  

> [!success]- Answer
> **Correct Answer: B**
>
> Date range parameters in AI/BI dashboards create `.min` and `.max` values used with named
> parameter markers. Adding `OR :date_range IS NULL` handles the "All" selection. Dashboards do
> not support the legacy mustache (`{{ }}`) syntax.
---

## Question 42 *(Medium)*

A dashboard dataset uses the parameter `:min_revenue`. The author wants viewers to see data filtered to `100000` until they change the filter. How is this configured?

A) Default values cannot be set — viewers must always pick a value first  
B) In the dataset editor, type `100000` in the field under the parameter name and run the query; that value becomes the default  
C) Hard-code `100000` in the SQL and keep `:min_revenue` in a comment  
D) Use `COALESCE(:min_revenue, 100000)` and leave the parameter without a default  

> [!success]- Answer
> **Correct Answer: B**
>
> To test a dashboard parameter, you type a value under the parameter name and run the query.
> Running the query also saves that value as the parameter's default, so the dashboard opens
> with it.
---

## Question 43 *(Medium)*

An analyst shares a saved query with a colleague using "Can View" access. What can the colleague do with the query?

A) Edit the SQL and save changes
B) Run the query and view results, but not modify the SQL or save changes
C) Share the query further with additional users
D) Delete the query

> [!success]- Answer
> **Correct Answer: B**
>
> "Can View" on a saved query allows the recipient to open and read the SQL, run the query,
> and view results. They cannot modify the SQL, rename, delete, or share the query further.
> "Can Edit" permission is required to make and save changes to the query.

---

## Question 44 *(Medium)*

Which states can a latest-version Databricks SQL alert evaluate to?

A) OK, TRIGGERED, ERROR  
B) OK, TRIGGERED, UNKNOWN only  
C) GREEN, YELLOW, RED  
D) RUNNING and STOPPED  

> [!success]- Answer
> **Correct Answer: A**
>
> Each evaluation resolves to OK, TRIGGERED, or ERROR. The latest alerts no longer use the
> UNKNOWN status from legacy alerts.
---

## Question 45 *(Medium)*

A manager wants to receive a daily email snapshot of a Databricks SQL dashboard at 9 AM, without needing to log in. Which feature provides this?

A) SQL alert with a daily schedule
B) Dashboard subscription — delivers an email with a dashboard screenshot on a schedule
C) Scheduled query that emails results as a CSV attachment
D) Partner Connect integration with an email tool

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL dashboards support subscriptions: recipients are emailed a rendered image
> (screenshot) of the dashboard on a configured schedule. Recipients do not need to log in
> to Databricks to receive the snapshot. This is distinct from SQL alerts, which fire only
> when a threshold condition is met.

---

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## New questions for the October 2025 blueprint refresh

The questions below cover the newly added **Developing, Sharing, and Maintaining AI/BI Genie Spaces** domain (12 %). Genie Spaces were renamed **Genie Agents** on July 8, 2026; the exam still uses the original name.

### Question GS-1 *(Medium — AI/BI Genie Spaces)*

**Scenario**: The finance team asks a Genie space "What is revenue for EMEA?", "What is revenue for APAC?", and so on every week. The CFO wants these answers to come from logic the data team has verified, not from freshly generated SQL each time.

**Question**: What should the space author add?

A) A text instruction: "Revenue for a region is SUM(invoice_total) filtered on region"  
B) A parameterized example query titled "What is revenue for a region?" using `:region_name`, so it becomes a trusted asset  
C) A benchmark question for each region  
D) A Field SQL expression that returns the region name  

> [!success]- Answer
> **Correct Answer: B**
>
> Trusted assets are parameterized example queries and Unity Catalog SQL functions whose exact logic an author verified; answers built on them come from that verified logic. Parameters use the `:name` syntax. A text instruction (A) is the documented last resort and does not produce verified answers. Benchmarks (C) only score accuracy — they never feed Genie's context. A Field SQL expression (D) defines a per-row value, not a verified answer.

---

### Question GS-2 *(Medium — AI/BI Genie Spaces)*

**Scenario**: An analyst shared a Genie space with the operations group at `CAN RUN`. Operations users can open the space, but every answer comes back empty. The space author sees full results for the same questions.

**Question**: What is the most likely cause?

A) Operations users lack `CAN USE` on the SQL warehouse  
B) Operations users lack `SELECT` on the Unity Catalog tables the space uses  
C) `CAN RUN` does not allow asking questions; they need `CAN MANAGE`  
D) Genie caches results per author  

> [!success]- Answer
> **Correct Answer: B**
>
> Sharing the space does not share the data. Genie runs queries with the author's embedded warehouse credentials, so consumers need **no** warehouse permission (A is wrong), but every query is checked against the asking user's Unity Catalog permissions — without `SELECT` they get no rows. `CAN RUN` (or `CAN VIEW`) is enough to use a space (C), and results are not cached per author (D).

---

### Question GS-3 *(Medium — AI/BI Genie Spaces)*

**Scenario**: The source system changed order status values from `CXL` to `CANCELLED`. Since the change, Genie answers "How many cancelled orders last week?" with zero, even though the data is correct. The `status` column has entity matching enabled and an outdated column comment.

**Question**: Which maintenance steps fix this in the documented way?

A) Increase the SQL warehouse size and re-run the question  
B) Update the `status` column comment in Unity Catalog, run **Refresh prompt matching** for the column, and re-run the benchmarks  
C) Add a text instruction that says "CXL means cancelled"  
D) Delete the space's conversation history  

> [!success]- Answer
> **Correct Answer: B**
>
> The exam's optimisation skill includes refreshing Unity Catalog metadata and validating with benchmarks. Entity matching stores representative column values, so after the values change you refresh them with **Refresh prompt matching**; updating the UC comment fixes the description for every consumer; benchmarks confirm the fix. Compute size (A) does not affect interpretation, an instruction about the old code (C) is now wrong, and deleting history (D) only removes evidence.

---

---

### Question DASH-1 *(Medium — Creating Dashboards and Visualizations)*

**Scenario**: An analyst needs to notify the operations team when the daily backlog of unprocessed orders exceeds 10,000. The notification should fire within minutes of crossing the threshold and go to a Slack channel.

**Question**: Which feature fits best?

A) Schedule the dashboard to refresh hourly and rely on team members to check it  
B) Create a SQL alert on a query that returns `unprocessed_order_count` and configure it to evaluate every 5 minutes with a threshold of `> 10000`; route to a Slack webhook destination  
C) Build a dashboard with a red KPI tile that turns red when the count exceeds 10,000  
D) Use a Lakeflow Job that runs the SQL nightly and emails a digest  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL Alerts are the documented path for threshold-based notifications: they evaluate a query result on a schedule (down to 1 minute), apply a comparator (`>`, `<`, `==`), and route to email, Slack, or any webhook destination. A and C are passive — they require someone to look. D is too slow (nightly) and not threshold-based.

---

---

### Question DM-1 *(Medium — Data Modeling with Databricks SQL)*

**Scenario**: An analyst builds a daily revenue dashboard that runs an aggregate query over a Silver `orders` Delta table (~500 GB). The aggregate takes 90 seconds and the dashboard is viewed by 50+ users per day. The analyst wants sub-second dashboard loads.

**Question**: Which approach is the documented best fit?

A) Standard view: `CREATE VIEW gold.daily_revenue AS SELECT date, SUM(amount) ... GROUP BY date`  
B) Materialized view: `CREATE MATERIALIZED VIEW gold.daily_revenue AS ...` with an hourly refresh schedule  
C) Pin the dashboard to a Pro SQL Warehouse with result caching enabled  
D) Convert the orders table to bucketing on date  

> [!success]- Answer
> **Correct Answer: B**
>
> Materialised views (MVs) pre-compute the aggregate and persist it as Delta data; subsequent dashboard reads are reads of the materialised result (sub-second). For a 90-second aggregate that's read 50+ times/day, MV is the canonical pattern — storage cost is trivial compared to the compute saved. A re-runs the aggregate on every read. C helps a bit (result cache returns cached results when query+data hash matches), but cache is invalidated on every write to `orders` and doesn't help the *first* viewer of each day. D is irrelevant (bucketing is for joins).

---

**[← Back to Mock Exam](./README.md)** | **[← Back to Resources](../README.md)** | **[← Back to Data Analyst Associate](../../README.md)**
