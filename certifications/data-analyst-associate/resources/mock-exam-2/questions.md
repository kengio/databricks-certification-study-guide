---
title: Data Analyst Associate Mock Exam 2 — Questions
type: mock-exam-questions
tags: [data-analyst-associate, mock-exam, practice]
---

# Data Analyst Associate Mock Exam 2 — Questions

[← Back to Mock Exam 2](./README.md) | [Practice Questions](../practice-questions/README.md)

---

> [!note] Platform update (Oct 2026)
> Questions are grouped by the nine domains of the October 2025 exam guide. Genie Spaces were renamed **Genie Agents** on July 8, 2026, and **Delta Sharing** is now **OpenSharing** (Jun 10, 2026). The exam still uses the original names. **Delta Live Tables** is now **Lakeflow Spark Declarative Pipelines**.

---

## Executing Queries Using Databricks SQL and Warehouses (Questions 1–9)

## Question 1 *(Hard)*

A Pro SQL warehouse is configured with `max clusters = 3`. When does a third cluster spin up?

A) When both existing clusters are fully utilized and new queries are waiting in queue  
B) When the first query is submitted  
C) When the warehouse has been running for more than 1 hour  
D) When any query takes longer than 60 seconds  

> [!success]- Answer
> **Correct Answer: A**
>
> Multi-cluster scaling in Pro warehouses is demand-driven. A new cluster spins up only when
> existing clusters are at capacity and queries are queuing. With `max clusters = 3`, the third
> cluster starts when both the first and second clusters are fully loaded. Clusters scale back
> down when demand decreases.

---

## Question 2 *(Easy)*

What does Databricks SQL query federation enable?

A) Running the same query on multiple SQL warehouses simultaneously  
B) Sharing queries between different Databricks workspaces  
C) Federating access control between multiple Unity Catalog metastores  
D) Querying external data sources (e.g., MySQL, PostgreSQL) directly from Databricks SQL without copying data  

> [!success]- Answer
> **Correct Answer: D**
>
> Query federation allows Databricks SQL to query external databases (MySQL, PostgreSQL,
> Snowflake, etc.) directly via a connection object defined in Unity Catalog. Data is not
> copied into Databricks — queries push down to the source where possible and retrieve
> results on demand.

---

## Question 3 *(Medium)*

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

## Question 4 *(Hard)*

A SQL warehouse is configured with auto-stop set to 30 minutes. A long-running query has been executing for 25 minutes. What happens at the 30-minute mark?

A) The warehouse stops and the query is terminated  
B) The query is paused and resumed when the warehouse restarts  
C) The auto-stop timer does not apply to active queries — the warehouse stops only after the query completes and the idle period begins  
D) The warehouse sends a warning but continues running for another 30 minutes  

> [!success]- Answer
> **Correct Answer: C**
>
> Auto-stop only triggers when the warehouse is idle — no active queries running. If a query is
> in progress, the idle timer resets. The warehouse will not stop while queries are executing,
> regardless of the configured auto-stop duration.

---

## Question 5 *(Easy)*

Which SQL syntax queries a Delta table as it existed at a specific version?

A) `SELECT * FROM table VERSION AS OF 5`  
B) `SELECT * FROM table AT VERSION = 5`  
C) `SELECT * FROM table WHERE _version = 5`  
D) `SELECT * FROM table SNAPSHOT VERSION 5`  

> [!success]- Answer
> **Correct Answer: A**
>
> `VERSION AS OF <n>` is the Delta Lake time travel syntax for querying a specific version.
> The equivalent timestamp syntax is `TIMESTAMP AS OF '<timestamp>'`. Both are standard
> Delta Lake time travel expressions supported in Databricks SQL.

---

## Question 6 *(Hard)*

A window function uses the frame clause `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. What does this compute?

A) The aggregate over the entire partition, ignoring the current row's position  
B) The aggregate between the first and last rows of the entire result set  
C) The aggregate over a 30-day rolling window  
D) A running (cumulative) aggregate from the first row of the partition to the current row  

> [!success]- Answer
> **Correct Answer: D**
>
> `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` defines a frame that starts at the
> first row of the partition and ends at the current row. Combined with `SUM` or `COUNT`,
> this produces a running (cumulative) total. `UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`
> would span the entire partition.

---

## Question 7 *(Medium)*

`NTILE(4) OVER (ORDER BY revenue DESC)` — what does this function do?

A) Returns the top 4 rows by revenue  
B) Returns the revenue values at the 25th, 50th, 75th, and 100th percentiles  
C) Divides the result set into 4 equal-sized buckets and assigns each row a bucket number (1–4)  
D) Counts the number of distinct revenue values in each quartile  

> [!success]- Answer
> **Correct Answer: C**
>
> `NTILE(n)` divides the ordered result set into `n` equal-sized buckets and assigns each row
> a bucket number from 1 to n. With `NTILE(4)` ordered by `revenue DESC`, bucket 1 contains
> the top quartile earners and bucket 4 contains the bottom quartile. Rows are distributed as
> evenly as possible across buckets.

---

## Question 8 *(Hard)*

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

## Question 9 *(Hard)*

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

## Creating Dashboards and Visualizations (Questions 10–16)

## Question 10 *(Easy)*

A Databricks SQL dashboard contains a Text widget with markdown content. What is the primary use case for a Text widget?

A) Adding static documentation, instructions, section headings, or context to a dashboard  
B) Displaying a live query result in formatted text  
C) Showing the last refresh timestamp automatically  
D) Embedding an external URL in the dashboard  

> [!success]- Answer
> **Correct Answer: A**
>
> Text widgets render static markdown content — headings, explanatory text, instructions, or
> links. They are used to add context and documentation to dashboards. Text widgets do not
> execute queries or display live data. For a live single-metric display, use a Counter widget.

---

## Question 11 *(Medium)*

A dashboard schedule has a Microsoft Teams channel as a subscriber. What does the channel receive on each scheduled run?

A) Nothing; Teams cannot subscribe to dashboards  
B) The dashboard's SQL text  
C) Only a CSV export of every dataset  
D) A PNG snapshot in the channel, a link to the dashboard, and a PDF  

> [!success]- Answer
> **Correct Answer: D**
>
> Slack and Microsoft Teams destinations (set up by a workspace admin) receive a PNG snapshot,
> a link, and a PDF. Email subscribers receive a PDF snapshot, optionally with CSV, TSV, or
> Excel attachments.

---

## Question 12 *(Hard)*

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

## Question 13 *(Easy)*

A dashboard filter needs to let users pick a date range (start date and end date). How does an AI/BI dashboard dataset use a date range parameter?

A) It cannot — a date range must be two separate text parameters  
B) Only serverless SQL warehouses support date ranges  
C) A date range parameter exposes `.min` and `.max`, for example `WHERE order_date BETWEEN :date_range.min AND :date_range.max`  
D) A date range needs a custom dropdown with hard-coded values  

> [!success]- Answer
> **Correct Answer: C**
>
> Date range parameters in AI/BI dashboards create `.min` and `.max` values used with named
> parameter markers. Adding `OR :date_range IS NULL` handles the "All" selection. Dashboards do
> not support the legacy mustache (`{{ }}`) syntax.

---

## Question 14 *(Medium)*

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

## Question 15 *(Medium)*

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

## Question 16 *(Medium)*

A manager wants to receive a daily email snapshot of a Databricks SQL dashboard at 9 AM, without needing to log in. Which feature provides this?

A) SQL alert with a daily schedule  
B) Partner Connect integration with an email tool  
C) Scheduled query that emails results as a CSV attachment  
D) Dashboard subscription — delivers an email with a dashboard screenshot on a schedule  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks SQL dashboards support subscriptions: recipients are emailed a rendered image
> (screenshot) of the dashboard on a configured schedule. Recipients do not need to log in
> to Databricks to receive the snapshot. This is distinct from SQL alerts, which fire only
> when a threshold condition is met.

---

## Analyzing Queries (Questions 17–23)

## Question 17 *(Easy)*

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

## Question 18 *(Medium)*

A query that calls a Python UDF runs on a SQL warehouse. Its query profile shows that only a small share of task time was spent in Photon. Which statement is correct?

A) Photon doesn't support UDFs, so those operations fall back to the Spark runtime and the results stay correct  
B) The query returned wrong results because Photon couldn't process the UDF  
C) Photon was turned off on the warehouse by an admin  
D) Rewriting the query as a dashboard dataset makes Photon run the UDF  

> [!success]- Answer
> **Correct Answer: A**
>
> Photon is the default engine on every SQL warehouse, but it doesn't support UDFs, RDD APIs, Dataset APIs, or stateful streaming. Unsupported operations fall back to the Spark runtime, and the results stay correct.
>
> The query profile shows the percentage of task time spent in Photon, and Photon operators are colored differently. A low percentage means part of the plan ran outside Photon. It doesn't mean results are wrong or that Photon was disabled. A dashboard runs the same SQL on the same engine.

---

## Question 19 *(Medium)*

What is the difference between Query Profile and `EXPLAIN` in Databricks SQL?

A) `EXPLAIN` shows the logical/physical query plan before execution; Query Profile shows actual runtime metrics (rows processed, time per stage) after execution  
B) They are identical — both show the query execution plan  
C) Query Profile works only for streaming queries; `EXPLAIN` works for batch only  
D) `EXPLAIN` requires admin privileges; Query Profile is available to all users  

> [!success]- Answer
> **Correct Answer: A**
>
> `EXPLAIN` outputs the query plan (logical, analyzed, optimized, or physical) before the query
> runs — it is a planning-time tool. Query Profile (available in Query History) shows actual
> runtime metrics after execution: rows read per node, execution time per stage, bytes shuffled,
> and skew information. Both are useful for optimization but serve different purposes.

---

## Question 20 *(Easy)*

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

## Question 21 *(Easy)*

An analyst tunes a query and re-runs it to measure the improvement. It returns in a few milliseconds every time, which seems too fast to be real. What should the analyst run before timing the query?

A) Run the query several times and keep the fastest time  
B) Switch to a larger warehouse size  
C) `SET use_cached_result = false`  
D) `EXPLAIN` on the query  

> [!success]- Answer
> **Correct Answer: C**
>
> An unchanged query on unchanged tables is answered from a result cache, so its timing says nothing about the tuning. `SET use_cached_result = false` turns off result caching for the session. Use it for testing and benchmarking only.
>
> Keeping the fastest of several runs measures the cache, not the query. Switching to a larger warehouse changes the test conditions instead of turning the cache off. `EXPLAIN` shows the plan without running the query, so it can't measure runtime.

---

## Question 22 *(Hard)*

A query uses `WHERE product_id NOT IN (SELECT product_id FROM returns)`. The `returns` table contains one NULL in `product_id`. What result does the main query return?

A) All rows where `product_id` is not in the non-NULL values of `returns`  
B) The same result as using `NOT EXISTS`  
C) An error — NULL values are not permitted in `NOT IN` subqueries  
D) Zero rows — `NOT IN` with a subquery containing NULL always returns an empty result  

> [!success]- Answer
> **Correct Answer: D**
>
> This is a classic SQL null-trap. `NOT IN` evaluates as `value != x AND value != y AND value != NULL`.
> Since any comparison with NULL returns UNKNOWN (not TRUE), the entire `NOT IN` condition
> becomes UNKNOWN for every row — and only TRUE rows pass the WHERE filter. The result is zero
> rows. Use `NOT EXISTS` or filter NULLs from the subquery to avoid this behavior.

---

## Question 23 *(Medium)*

An analyst runs `ALTER TABLE main.sales.events CLUSTER BY (country)` on a large liquid-clustered table. Queries that filter on `country` are no faster the next day. What explains this?

A) Liquid clustering keys can only be set when the table is created  
B) Liquid clustering works only for tables with fewer than four columns  
C) The `ALTER` must be followed by a `VACUUM` before the keys take effect  
D) Changing clustering keys doesn't rewrite existing data. It is clustered when `OPTIMIZE` runs (or `OPTIMIZE ... FULL`, or predictive optimization)  

> [!success]- Answer
> **Correct Answer: D**
>
> Liquid clustering keys can be changed at any time, but the `ALTER` doesn't rewrite existing files. Clustering happens when you run `OPTIMIZE`, which works incrementally, or `OPTIMIZE ... FULL`, which reclusters everything, or automatically through predictive optimization.
>
> The limit of four applies to the number of clustering keys, not to the table's columns. `VACUUM` removes old, unreferenced files and doesn't cluster data.

---

## Developing, Sharing, and Maintaining AI/BI Genie Spaces (Questions 24–28)

## Question 24 *(Medium)*

The finance team asks a Genie space "What is revenue for EMEA?", "What is revenue for APAC?", and so on every week. The CFO wants these answers to come from logic the data team has verified, not from freshly generated SQL each time.

What should the space author add?

A) A text instruction: "Revenue for a region is SUM(invoice_total) filtered on region"  
B) A parameterized example query titled "What is revenue for a region?" using `:region_name`, so it becomes a trusted asset  
C) A benchmark question for each region  
D) A Field SQL expression that returns the region name  

> [!success]- Answer
> **Correct Answer: B**
>
> Trusted assets are parameterized example queries and Unity Catalog SQL functions whose exact logic an author verified; answers built on them come from that verified logic. Parameters use the `:name` syntax. A text instruction (A) is the documented last resort and does not produce verified answers. Benchmarks (C) only score accuracy — they never feed Genie's context. A Field SQL expression (D) defines a per-row value, not a verified answer.

---

## Question 25 *(Medium)*

A team builds a Databricks App that uses a Genie space as an app resource. Questions asked through the app return no rows, while the space's author sees full results in the Genie UI. The app doesn't use user authorization. What is the most likely fix?

A) Grant the app's service principal `SELECT` on the Unity Catalog tables the space uses  
B) Give the app's service principal `CAN MANAGE` on the SQL warehouse  
C) Re-create the space inside the app's workspace folder  
D) Turn off Unity Catalog row filters for the app  

> [!success]- Answer
> **Correct Answer: A**
>
> Every Genie integration answers with SQL that Unity Catalog checks against the identity making the call. For a Databricks App resource that is the app's **service principal**, unless the app uses user authorization. The app needs `Can run` on the space, and the service principal needs `SELECT` on the data.
>
> Warehouse permissions don't grant data access. Moving the space changes nothing about permissions. Turning off row filters would weaken security instead of granting the access the app is missing.

---

## Question 26 *(Medium)*

An analyst shared a Genie space with the operations group at `CAN RUN`. Operations users can open the space, but every answer comes back empty. The space author sees full results for the same questions.

What is the most likely cause?

A) Operations users lack `CAN USE` on the SQL warehouse  
B) Operations users lack `SELECT` on the Unity Catalog tables the space uses  
C) `CAN RUN` does not allow asking questions; they need `CAN MANAGE`  
D) Genie caches results per author  

> [!success]- Answer
> **Correct Answer: B**
>
> Sharing the space does not share the data. Genie runs queries with the author's embedded warehouse credentials, so consumers need **no** warehouse permission (A is wrong), but every query is checked against the asking user's Unity Catalog permissions — without `SELECT` they get no rows. `CAN RUN` (or `CAN VIEW`) is enough to use a space (C), and results are not cached per author (D).

---

## Question 27 *(Easy)*

A curator must edit a Genie space's instructions, add trusted assets, and run benchmarks, but shouldn't manage who the space is shared with. Which permission level is the minimum for this work?

A) `CAN VIEW`  
B) `CAN RUN`  
C) `CAN EDIT`  
D) `CAN MANAGE`  

> [!success]- Answer
> **Correct Answer: C**
>
> `CAN EDIT` is the minimum level to edit the space, add or remove trusted assets, and run benchmarks.
>
> `CAN VIEW` and `CAN RUN` let consumers use the space, provided they have `SELECT` on the data. `CAN MANAGE` goes to the owner or lead analyst and is needed for tasks such as embedding the space and deleting conversations from the monitoring page.

---

## Question 28 *(Medium)*

The source system changed order status values from `CXL` to `CANCELLED`. Since the change, Genie answers "How many cancelled orders last week?" with zero, even though the data is correct. The `status` column has entity matching enabled and an outdated column comment.

Which maintenance steps fix this in the documented way?

A) Increase the SQL warehouse size and re-run the question  
B) Update the `status` column comment in Unity Catalog, run **Refresh prompt matching** for the column, and re-run the benchmarks  
C) Add a text instruction that says "CXL means cancelled"  
D) Delete the space's conversation history  

> [!success]- Answer
> **Correct Answer: B**
>
> The exam's optimisation skill includes refreshing Unity Catalog metadata and validating with benchmarks. Entity matching stores representative column values, so after the values change you refresh them with **Refresh prompt matching**; updating the UC comment fixes the description for every consumer; benchmarks confirm the fix. Compute size (A) does not affect interpretation, an instruction about the old code (C) is now wrong, and deleting history (D) only removes evidence.

---

## Understanding of Databricks Data + AI Platform (Questions 29–33)

## Question 29 *(Medium)*

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

## Question 30 *(Medium)*

What does "attaching a workspace to a Unity Catalog metastore" mean?

A) Linking the workspace so that it uses the specified metastore for all catalog, schema, and table metadata — enabling Unity Catalog governance  
B) Connecting the workspace's network to the metastore's VNet  
C) Granting the workspace admin access to all catalogs in the metastore  
D) Copying the workspace's existing Hive metastore tables into Unity Catalog  

> [!success]- Answer
> **Correct Answer: A**
>
> A Unity Catalog metastore is a regional metadata store. Attaching a workspace to a metastore
> means the workspace uses that metastore for all Unity Catalog objects. Multiple workspaces in
> the same region can share a single metastore, enabling cross-workspace data governance and
> sharing through a unified catalog.

---

## Question 31 *(Easy)*

Before building a dashboard, an analyst finds several similarly named `orders` tables and must pick the trusted one. What should the analyst check in Catalog Explorer?

A) The table with the most recent `OPTIMIZE` in its history  
B) The table with the largest storage size  
C) The table whose name appears first in the schema list  
D) The **Certified** badge on the table, and its **Lineage** tab to confirm its upstream sources  

> [!success]- Answer
> **Correct Answer: D**
>
> Catalog Explorer shows a **Certified** badge (the system-governed tag `system.certification_status` set to `certified`) or a **deprecated** badge. The **Lineage** tab shows the upstream and downstream tables, notebooks, jobs, and dashboards, and viewing it needs at least `BROWSE` on the parent catalog.
>
> Size, maintenance history, and name order say nothing about whether a table is trusted.

---

## Question 32 *(Medium)*

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

## Question 33 *(Easy)*

Which Databricks Intelligence Platform component provides declarative ETL, where you define tables, materialized views, and streaming tables and the platform handles dependencies, refreshes, and data quality expectations? The exam guide calls it Delta Live Tables.

A) Lakeflow Spark Declarative Pipelines  
B) Lakeflow Jobs  
C) Unity Catalog  
D) Databricks SQL  

> [!success]- Answer
> **Correct Answer: A**
>
> Delta Live Tables became Lakeflow Declarative Pipelines and was renamed **Lakeflow Spark Declarative Pipelines** on November 12, 2025. It is the declarative ETL component that manages dependencies, refreshes, and expectations.
>
> **Lakeflow Jobs** orchestrates notebooks, SQL, and pipelines on schedules or triggers. **Unity Catalog** governs data and AI. **Databricks SQL** provides SQL warehouses, the SQL editor, dashboards, and alerts.

---

## Managing Data (Questions 34–37)

## Question 34 *(Easy)*

Which SQL command lists all tables visible in the current schema within Unity Catalog?

A) `LIST TABLES`  
B) `DESCRIBE SCHEMA`  
C) `SHOW TABLES`  
D) `SELECT * FROM information_schema.tables LIMIT 10`  

> [!success]- Answer
> **Correct Answer: C**
>
> `SHOW TABLES` (optionally `SHOW TABLES IN schema_name`) lists all tables and views in the
> current or specified schema. `DESCRIBE SCHEMA` shows schema metadata, not its table contents.
> `INFORMATION_SCHEMA.TABLES` also works but requires a full SELECT query.

---

## Question 35 *(Medium)*

What is the difference between a `SHALLOW CLONE` and a `DEEP CLONE` of a Delta table?

A) Shallow clone copies all data files; deep clone copies only metadata  
B) Shallow clone supports time travel; deep clone does not  
C) They are identical — both copy all data and metadata  
D) Shallow clone copies only metadata and references the source data files; deep clone copies both metadata and all data files  

> [!success]- Answer
> **Correct Answer: D**
>
> `SHALLOW CLONE` creates a new table with its own transaction log but references the original
> data files — no data is physically copied. It is fast and storage-efficient but depends on the
> source files remaining available. `DEEP CLONE` copies all data files and the transaction log,
> creating a fully independent copy suitable for backup or migration.

---

## Question 36 *(Easy)*

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

## Question 37 *(Medium)*

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

## Securing Data (Questions 38–41)

## Question 38 *(Medium)*

In Unity Catalog, what does `GRANT USE SCHEMA ON SCHEMA catalog.schema TO user` allow the user to do?

A) Resolve and access objects within the schema — required before any table-level privilege takes effect  
B) Create new tables in the schema  
C) Delete the schema and its contents  
D) Grant other users access to the schema  

> [!success]- Answer
> **Correct Answer: A**
>
> `USE SCHEMA` is a prerequisite privilege in Unity Catalog. Without it, a user cannot resolve
> any objects within the schema even if they have SELECT on individual tables. `USE CATALOG`
> on the parent catalog is also required. These privileges form a hierarchy: catalog → schema
> → table.

---

## Question 39 *(Hard)*

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

## Question 40 *(Medium)*

The owner of `main.finance.ledger` has left the company, and the table must stay manageable. What is the recommended fix?

A) Grant `ALL PRIVILEGES` on the table to the departed owner's manager  
B) Drop the table and re-create it under a new owner  
C) A metastore admin, the owner of the parent schema, or a user with `MANAGE` runs `ALTER TABLE main.finance.ledger OWNER TO` a group such as `finance-owners`  
D) Wait for the workspace admin to become the owner automatically  

> [!success]- Answer
> **Correct Answer: C**
>
> Every object has one owner, who has all privileges on it. Ownership can be transferred by the current owner, a metastore admin, the owner of the parent container, or a user with `MANAGE`. Transferring it to a **group** means a future leaver won't strand the table again.
>
> `ALL PRIVILEGES` doesn't include `MANAGE` and doesn't transfer ownership. Dropping and re-creating the table risks data loss and throws away its history and grants. Ownership never moves automatically.

---

## Question 41 *(Medium)*

An analyst shares a saved query with a colleague using "Can View" access. What can the colleague do with the query?

A) Edit the SQL and save changes  
B) Delete the query  
C) Share the query further with additional users  
D) Run the query and view results, but not modify the SQL or save changes  

> [!success]- Answer
> **Correct Answer: D**
>
> "Can View" on a saved query allows the recipient to open and read the SQL, run the query,
> and view results. They cannot modify the SQL, rename, delete, or share the query further.
> "Can Edit" permission is required to make and save changes to the query.

---

## Importing Data (Questions 42–43)

## Question 42 *(Easy)*

A partner organization on Databricks shares live tables with your team through Delta Sharing. How does your team start querying them?

A) Download the partner's Parquet files and load them with `COPY INTO`  
B) Ask the partner for a JDBC connection string to their SQL warehouse  
C) Set up a Lakeflow Connect managed connector to the partner's workspace  
D) A user with `CREATE CATALOG` and `USE PROVIDER` (or a metastore admin) creates a catalog from the share, then grants access to the team. The shared data is read-only  

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Sharing (now called OpenSharing) shares a read-only collection of tables from a provider to a recipient with no replication, so recipients see the provider's updates in near real time. In Databricks-to-Databricks sharing, a user with `CREATE CATALOG` and `USE PROVIDER` creates a catalog from the share and grants access to their users.
>
> Copying files or connecting over JDBC gives up the live, governed share and creates copies that have to be kept in sync. Managed connectors ingest from SaaS applications and databases, not from another organization's share.

---

## Question 43 *(Medium)*

An application must push individual records directly into a Unity Catalog managed Delta table, with no message bus and no landing files. Which ingestion path fits?

A) Zerobus Ingest  
B) Databricks Marketplace  
C) Lakehouse Federation  
D) A scheduled `COPY INTO`  

> [!success]- Answer
> **Correct Answer: A**
>
> **Zerobus Ingest**, part of Lakeflow Connect, is a push-based streaming API that writes records into Unity Catalog managed Delta tables, with no file landing zone or message bus in between.
>
> Marketplace delivers third-party data products as shared catalogs. Lakehouse Federation queries an external database in place. `COPY INTO` loads files from cloud storage, so it needs the landing files this scenario rules out.

---

## Data Modeling with Databricks SQL (Questions 44–45)

## Question 44 *(Easy)*

In a Data Vault model, which table type holds the descriptive attributes of a business entity, along with their history?

A) Hub  
B) Link  
C) Satellite  
D) Fact table  

> [!success]- Answer
> **Correct Answer: C**
>
> **Satellites** hold the descriptive attributes of a hub or link, with their history.
>
> A **hub** holds a core business entity keyed by its business key. A **link** holds only the keys that relate hubs, like a factless fact table. Fact tables belong to dimensional (star or snowflake) models, not Data Vault.

---

## Question 45 *(Medium)*

According to Databricks guidance, where do Data Vault models and Kimball-style star schemas usually sit in the medallion architecture?

A) Both belong in Bronze  
B) Star schemas in Silver, and Data Vault in Gold  
C) Data Vault in Bronze, and star schemas in Silver  
D) Data Vault in Silver, and star schemas in Gold  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks places Data Vault hub, link, and satellite tables in the **Silver** layer, next to 3NF-like models, and Kimball star schemas and data marts in the **Gold** layer.
>
> Bronze holds source-shaped landing and staging tables. Data Vault is write-optimized and needs many joins to answer business questions, so teams publish star schemas on top of it in Gold for BI.

---

## Answer Key

| # | Answer | # | Answer | # | Answer |
|---|--------|---|--------|---|--------|
| 1 | A | 16 | D | 31 | D |
| 2 | D | 17 | B | 32 | B |
| 3 | C | 18 | A | 33 | A |
| 4 | C | 19 | A | 34 | C |
| 5 | A | 20 | C | 35 | D |
| 6 | D | 21 | C | 36 | B |
| 7 | C | 22 | D | 37 | B |
| 8 | D | 23 | D | 38 | A |
| 9 | B | 24 | B | 39 | B |
| 10 | A | 25 | A | 40 | C |
| 11 | D | 26 | B | 41 | D |
| 12 | B | 27 | C | 42 | D |
| 13 | C | 28 | B | 43 | A |
| 14 | B | 29 | C | 44 | C |
| 15 | A | 30 | A | 45 | D |

## Section Performance Tracker

| Domain (Oct 2025 weight) | Questions | Your Score | Percentage |
| ------ | --------- | ---------- | ---------- |
| Executing Queries Using Databricks SQL and Warehouses (20 %) | 1–9 (9 questions) | ___/9 | ___% |
| Creating Dashboards and Visualizations (16 %) | 10–16 (7 questions) | ___/7 | ___% |
| Analyzing Queries (15 %) | 17–23 (7 questions) | ___/7 | ___% |
| Developing, Sharing, and Maintaining AI/BI Genie Spaces (12 %) | 24–28 (5 questions) | ___/5 | ___% |
| Understanding of Databricks Data + AI Platform (11 %) | 29–33 (5 questions) | ___/5 | ___% |
| Managing Data (8 %) | 34–37 (4 questions) | ___/4 | ___% |
| Securing Data (8 %) | 38–41 (4 questions) | ___/4 | ___% |
| Importing Data (5 %) | 42–43 (2 questions) | ___/2 | ___% |
| Data Modeling with Databricks SQL (5 %) | 44–45 (2 questions) | ___/2 | ___% |
| **Total** | **45 questions** | **___/45** | **___%** |

---

**[← Back to Mock Exam](./README.md)** | **[← Back to Resources](../README.md)** | **[← Back to Data Analyst Associate](../../README.md)**
