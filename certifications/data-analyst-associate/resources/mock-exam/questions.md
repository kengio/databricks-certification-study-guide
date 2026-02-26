---
title: Data Analyst Associate Mock Exam 1 — Questions
type: mock-exam-questions
tags: [data-analyst-associate, mock-exam, practice]
---

# Data Analyst Associate Mock Exam 1 — Questions

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)

---

## Databricks SQL (Questions 1–10)

---

## Question 1 *(Easy)*

Which SQL warehouse type provides near-instant startup with no cold start delay?

A) Classic
B) Pro
C) Serverless
D) All warehouse types have instant startup

> [!success]- Answer
> **Correct Answer: C**
>
> Serverless SQL warehouses provide near-instant startup because Databricks manages the compute
> infrastructure in advance. Classic and Pro warehouses require 2–5 minutes to provision cluster
> nodes before queries can run.

---

## Question 2 *(Medium)*

A team needs 8 concurrent analyst sessions without queue buildup. Which warehouse configuration supports this best?

A) Classic — single cluster with extra memory
B) Pro — multi-cluster auto-scaling up to 10 clusters
C) X-Large Classic — larger size reduces queuing
D) Assign personal clusters to each analyst

> [!success]- Answer
> **Correct Answer: B**
>
> Pro SQL warehouses support multi-cluster scaling. When one cluster reaches capacity, additional
> clusters spin up automatically (up to the configured maximum of 10). Classic warehouses are
> single-cluster only — every session queues behind others when that cluster is at capacity.

---

## Question 3 *(Easy)*

What does the SQL warehouse auto-stop feature do?

A) Stops all running queries after the configured timeout
B) Shuts down warehouse compute when idle for the configured duration (default 120 minutes)
C) Stops only Serverless warehouse queries
D) Prevents a warehouse from starting if another is already running

> [!success]- Answer
> **Correct Answer: B**
>
> Auto-stop conserves cost by terminating warehouse compute when no queries have run for the
> idle timeout period. The default is 120 minutes. Running queries are never stopped by auto-stop
> — it only triggers when the warehouse is idle.

---

## Question 4 *(Easy)*

An analyst needs to connect Power BI Desktop to a Databricks SQL warehouse. Which connection protocol should they use?

A) Delta Sharing
B) ODBC or JDBC driver provided by Databricks
C) REST API with JSON output
D) Direct cloud storage access (S3/ADLS)

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks provides ODBC and JDBC drivers compatible with standard BI tools including Power BI,
> Tableau, and Excel. Delta Sharing is for cross-organization data sharing, not BI tool connectivity.

---

## Question 5 *(Easy)*

Row-level security via Unity Catalog row access policies is available on which SQL warehouse types?

A) Classic and Pro
B) Pro and Serverless
C) Classic only
D) All warehouse types equally

> [!success]- Answer
> **Correct Answer: B**
>
> Row-level security (implemented through Unity Catalog row access policies) requires Pro or
> Serverless SQL warehouses. Classic warehouses do not support Unity Catalog's fine-grained
> access controls such as row filters and column masks.

---

## Question 6 *(Medium)*

Which Databricks SQL feature helps identify the most expensive queries by cost and duration?

A) Delta transaction log
B) Query History — shows runtime, bytes scanned, and user
C) Cluster event logs
D) MLflow experiment tracking

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL Query History tracks all queries with execution time, bytes scanned, queue time,
> and the user who ran them. Admins can filter by warehouse, user, and time range to identify
> expensive or slow queries.

---

## Question 7 *(Easy)*

Partner Connect in Databricks is used to:

A) Connect multiple Databricks workspaces to each other
B) Establish pre-built integrations with partner tools like dbt, Fivetran, and Tableau with automated credential setup
C) Share data with external organizations via Delta Sharing
D) Connect to on-premises databases over a VPN

> [!success]- Answer
> **Correct Answer: B**
>
> Partner Connect provides one-click integration setup for certified Databricks partner tools. It
> automatically creates service principals, generates access tokens, and configures the partner
> tool's connection — eliminating manual credential management.

---

## Question 8 *(Medium)*

A Serverless SQL warehouse has been idle for 10 minutes with no active queries. What happens next?

A) It continues running indefinitely until manually stopped
B) It automatically scales down and stops, then restarts near-instantly on the next query
C) It generates a timeout error for the next submitted query
D) It must be restarted manually from the SQL Warehouses UI

> [!success]- Answer
> **Correct Answer: B**
>
> Serverless warehouses auto-stop when idle (default 10 minutes for Serverless vs 120 for
> Classic/Pro). Because compute is managed by Databricks, Serverless warehouses restart
> near-instantly on the next query — there is no cold-start wait as with Classic/Pro.

---

## Question 9 *(Medium)*

Which SQL warehouse size is most appropriate for a single analyst running exploratory queries on 10 GB of data?

A) 4X-Large — maximum performance ensures fast results
B) X-Small or Small — cost-efficient for single-user exploratory work
C) X-Large — minimum recommended size for any analytical query
D) Size does not affect query performance for Delta tables

> [!success]- Answer
> **Correct Answer: B**
>
> X-Small or Small warehouses are cost-efficient for individual analysts running exploratory queries
> on moderate data sizes. Larger warehouse sizes are justified for complex queries on very large
> datasets (100+ GB) or for supporting many concurrent users.

---

## Question 10 *(Medium)*

A SQL query in Databricks SQL reads from a Delta table. The identical query runs again 30 seconds later with no data changes in between. What happens?

A) The query re-executes fully on the warehouse
B) Results are returned from the query result cache, bypassing warehouse compute
C) The second query fails due to a caching conflict
D) Query caching only activates after a minimum of 5 minutes between runs

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL maintains a query result cache. When the same query runs within the cache TTL
> and the underlying Delta table version has not changed, results are returned from cache
> instantly — no compute is used. The cache is automatically invalidated when the table is written to.

---

## Data Management (Questions 11–19)

---

## Question 11 *(Easy)*

What is the Unity Catalog three-level namespace?

A) workspace.database.table
B) catalog.schema.table
C) metastore.catalog.table
D) environment.schema.table

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog uses `catalog.schema.table`. Schemas in Unity Catalog are equivalent to databases
> in the legacy two-level Hive metastore. The metastore is the top-level container that holds
> catalogs, but it is not part of the object-reference namespace.

---

## Question 12 *(Easy)*

A managed Delta table is dropped with `DROP TABLE`. What happens to the underlying data files?

A) Files remain in DBFS and must be deleted manually
B) Files are moved to a recycle bin and retained for 30 days
C) Files are permanently deleted along with the table metadata
D) Files are archived in cloud storage for 90 days

> [!success]- Answer
> **Correct Answer: C**
>
> Dropping a managed table removes both the table definition from the metastore AND the
> underlying data files from cloud storage. This operation is irreversible without a backup.
> External tables behave differently — only their metadata is removed, leaving files intact.

---

## Question 13 *(Easy)*

Which GRANT statement gives a user the ability to read data from a Delta table in Unity Catalog?

A) `GRANT READ ON TABLE catalog.schema.table TO user`
B) `GRANT VIEW ON TABLE catalog.schema.table TO user`
C) `GRANT SELECT ON TABLE catalog.schema.table TO user`
D) `GRANT ACCESS ON TABLE catalog.schema.table TO user`

> [!success]- Answer
> **Correct Answer: C**
>
> `SELECT` is the correct privilege name for read access in Unity Catalog. `READ`, `VIEW`, and
> `ACCESS` are not valid Unity Catalog privilege names. Users also typically need `USE CATALOG`
> and `USE SCHEMA` on the parent objects to resolve the table.

---

## Question 14 *(Easy)*

A data engineer appends data with new columns to an existing Delta table. Which write option enables schema evolution?

A) `.option("autoSchema", "true")`
B) `.option("mergeSchema", "true")`
C) `.option("allowNewColumns", "true")`
D) No option is needed — Delta always accepts new columns

> [!success]- Answer
> **Correct Answer: B**
>
> `mergeSchema=true` (or `spark.databricks.delta.schema.autoMerge.enabled = true` globally)
> enables schema evolution during writes. New columns in the incoming DataFrame are added to the
> Delta table schema automatically. Without this option, a write containing extra columns raises a
> schema mismatch error.

---

## Question 15 *(Easy)*

An external table pointing to `gs://bucket/data/` is dropped with `DROP TABLE`. What happens to the files in GCS?

A) Files are deleted from GCS immediately
B) Files remain in GCS — only the table metadata entry is removed
C) Files are moved to a Databricks-managed DBFS location
D) Files are archived by Databricks for 30 days

> [!success]- Answer
> **Correct Answer: B**
>
> External tables do not own their data. `DROP TABLE` on an external table removes only the
> catalog metadata entry (table definition). The actual data files in the external storage location
> are completely unaffected.

---

## Question 16 *(Easy)*

In Unity Catalog, what does `USE CATALOG my_catalog` accomplish?

A) Creates a new catalog named `my_catalog`
B) Sets `my_catalog` as the default catalog for the current session
C) Grants the current user access to `my_catalog`
D) Lists all objects in `my_catalog`

> [!success]- Answer
> **Correct Answer: B**
>
> `USE CATALOG` sets the session's default catalog. Subsequent queries that use two-level names
> (`schema.table`) or single-level names (`table`) resolve against this default catalog. It does
> not create, grant access to, or list objects in the catalog.

---

## Question 17 *(Easy)*

Which statement correctly describes Delta Lake ACID transactions?

A) Delta Lake transactions are eventually consistent, not fully ACID
B) Delta tables support Atomicity, Consistency, Isolation, and Durability for all read and write operations
C) ACID guarantees apply only to batch writes, not streaming writes
D) ACID compliance requires a Unity Catalog metastore to be attached

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake's transaction log (`_delta_log`) provides full ACID guarantees for all operations —
> batch, streaming, and concurrent reads/writes. This is a core differentiator from plain
> Parquet/CSV data lakes, which have no transactional guarantees.

---

## Question 18 *(Easy)*

What does `SHOW GRANTS ON TABLE catalog.schema.table` return?

A) The table's schema — column names and data types
B) All privileges granted on the table and the principals they are granted to
C) The table's storage location and file format
D) Recent data access history for the table

> [!success]- Answer
> **Correct Answer: B**
>
> `SHOW GRANTS ON <object>` lists all Unity Catalog privileges granted on that specific object:
> the privilege type (e.g., SELECT, MODIFY), the principal (user, group, or service principal),
> and the grantor. It is the primary tool for auditing object-level permissions.

---

## Question 19 *(Medium)*

A data engineer runs:

```sql
ALTER TABLE t SET TBLPROPERTIES (
  'delta.deletedFileRetentionDuration' = 'interval 30 days'
);
```

What does this configure?

A) VACUUM will retain deleted data files for at least 30 days before removing them
B) The table itself expires and is deleted after 30 days
C) Deleted data rows are retained for 30 days and can be restored
D) The Delta transaction log is compacted and retained for 30 days

> [!success]- Answer
> **Correct Answer: A**
>
> `delta.deletedFileRetentionDuration` sets the minimum file retention period for VACUUM.
> VACUUM will not delete files newer than this threshold, enabling time travel queries up to
> 30 days into the past. The default is 7 days.

---

## SQL Queries (Questions 20–32)

---

## Question 20 *(Easy)*

Which window function returns the value from the next row in the result set?

A) `LAG(col, 1)`
B) `LEAD(col, 1)`
C) `NEXT(col)`
D) `OFFSET(col, -1)`

> [!success]- Answer
> **Correct Answer: B**
>
> `LEAD(column, offset)` returns the value from `offset` rows ahead of the current row within
> the partition. `LAG` looks backward (previous rows). `NEXT` and `OFFSET` are not valid
> Databricks SQL window functions.

---

## Question 21 *(Medium)*

When two rows have the same value, which function produces gaps in the sequence of rank numbers?

A) `ROW_NUMBER()` — ties produce gaps
B) `RANK()` — tied rows receive the same rank; the next rank skips
C) `DENSE_RANK()` — always produces gaps between all ranks
D) Both `RANK()` and `ROW_NUMBER()` produce gaps for ties

> [!success]- Answer
> **Correct Answer: B**
>
> `RANK()` gives tied rows the same rank number and then skips the next rank value (e.g., 1, 1,
> 3). `ROW_NUMBER()` assigns unique sequential numbers regardless of ties — no gaps, no
> duplicates. `DENSE_RANK()` gives tied rows the same rank but never skips (e.g., 1, 1, 2).

---

## Question 22 *(Hard)*

A query uses `SUM(revenue) OVER (PARTITION BY region)` with no `ORDER BY` clause. What does each row receive?

A) A running total that accumulates within the region
B) The total sum for the entire region — the same value for every row in that region
C) NULL — `ORDER BY` is required for all window functions
D) Each row's individual `revenue` value unchanged

> [!success]- Answer
> **Correct Answer: B**
>
> Without `ORDER BY` in the window specification, `SUM() OVER (PARTITION BY ...)` computes the
> aggregate over the entire partition and returns that single value for every row in the partition.
> Adding `ORDER BY` changes the frame to a running (cumulative) sum from the first row to the
> current row.

---

## Question 23 *(Easy)*

Which JOIN type returns rows from the left table only when no match exists in the right table?

A) LEFT JOIN
B) LEFT JOIN with `WHERE right_key IS NULL` — this is the only way
C) LEFT ANTI JOIN
D) EXCEPT

> [!success]- Answer
> **Correct Answer: C**
>
> `LEFT ANTI JOIN` explicitly returns left-table rows where no matching right-table row exists.
> It is semantically equivalent to `LEFT JOIN ... WHERE right_key IS NULL` but more readable and
> sometimes more efficient. `EXCEPT` operates on full-row set differences, not join conditions.

---

## Question 24 *(Hard)*

An analyst writes `WHERE ROW_NUMBER() OVER (PARTITION BY id ORDER BY date DESC) = 1`. The query fails. What is the correct approach?

A) Use `HAVING` instead of `WHERE`
B) Wrap in a CTE and filter on the window result in the outer query, or use `QUALIFY`
C) Use the `FILTER` keyword directly after the window function
D) Add `GROUP BY` before the `WHERE` clause

> [!success]- Answer
> **Correct Answer: B**
>
> Window functions are evaluated after `WHERE` is applied, so you cannot filter on window
> function results in `WHERE`. Two correct approaches:
>
> - Wrap in a CTE: `WITH cte AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM t) SELECT * FROM cte WHERE rn = 1`
> - Use `QUALIFY`: `SELECT * FROM t QUALIFY ROW_NUMBER() OVER (...) = 1`

---

## Question 25 *(Medium)*

Which function flattens a nested array `[[1, 2], [3, 4]]` into `[1, 2, 3, 4]`?

A) `EXPLODE(array_col)`
B) `FLATTEN(array_col)`
C) `COLLECT_LIST(array_col)`
D) `ARRAY_UNION(array_col)`

> [!success]- Answer
> **Correct Answer: B**
>
> `FLATTEN` merges a nested array-of-arrays into a single-level array. `EXPLODE` creates one
> row per element of the outer array — it does not merge inner arrays. `COLLECT_LIST` and
> `ARRAY_UNION` are aggregation functions, not array transformation functions.

---

## Question 26 *(Easy)*

What is the difference between `COLLECT_LIST(product)` and `COLLECT_SET(product)`?

A) `COLLECT_LIST` preserves insertion order; `COLLECT_SET` sorts alphabetically
B) `COLLECT_LIST` includes duplicate values; `COLLECT_SET` returns only unique values
C) They are identical — both return all values in the group
D) `COLLECT_SET` is faster; `COLLECT_LIST` is used for large datasets only

> [!success]- Answer
> **Correct Answer: B**
>
> `COLLECT_LIST` aggregates all values including duplicates into an array.
> `COLLECT_SET` returns only distinct values. Neither guarantees a specific ordering of
> elements in the resulting array.

---

## Question 27 *(Easy)*

A CTE is defined as `WITH sales AS (SELECT ...)`. How many times can `sales` be referenced in the main query body?

A) Once only — CTEs are single-use
B) Multiple times — CTEs can be referenced as many times as needed in the same query
C) Only in the `FROM` clause, once
D) CTEs cannot be reused — use subqueries for any reuse pattern

> [!success]- Answer
> **Correct Answer: B**
>
> CTEs can be referenced multiple times within the same query body. This is a key advantage
> over inline subqueries for readability and avoiding repetition. A CTE defined in a `WITH`
> block is scoped to the single query statement.

---

## Question 28 *(Medium)*

Which of the following aggregate functions ignores NULL values?

A) `COUNT(*)` only
B) `SUM(column)`, `AVG(column)`, `MIN(column)`, `MAX(column)`, and `COUNT(column)`
C) `COUNT(*)` ignores NULLs; all other aggregates treat NULLs as zero
D) None — all aggregates in Databricks SQL include NULLs in their calculations

> [!success]- Answer
> **Correct Answer: B**
>
> `SUM`, `AVG`, `MIN`, `MAX`, and `COUNT(column)` all skip NULL values — NULLs are excluded
> from the calculation entirely. Only `COUNT(*)` counts NULLs because it counts rows, not
> column values. NULLs are never treated as 0 in standard SQL aggregation.

---

## Question 29 *(Easy)*

`DATEDIFF(end_date, start_date)` — what does this function return in Databricks SQL?

A) The number of seconds between the two dates
B) The number of calendar days from `start_date` to `end_date`
C) The number of full months between the two dates
D) A formatted string representing the interval

> [!success]- Answer
> **Correct Answer: B**
>
> `DATEDIFF(end, start)` in Databricks SQL returns the number of calendar days between the
> two dates as an integer. Note: the end date is the first argument and start date is the
> second — the reverse of some other SQL dialects.

---

## Question 30 *(Easy)*

Which SQL expression returns the current timestamp in Databricks SQL?

A) `GETDATE()`
B) `SYSDATE()`
C) `current_timestamp()`
D) `NOW()` — only this form is valid

> [!success]- Answer
> **Correct Answer: C**
>
> `current_timestamp()` is the canonical Databricks SQL function for the current timestamp.
> `NOW()` is also accepted as a synonym. `GETDATE()` is SQL Server syntax and `SYSDATE()` is
> Oracle syntax — neither is native to Databricks SQL.

---

## Question 31 *(Medium)*

Table A has 100 rows and table B has 50 rows. A `CROSS JOIN` is performed. How many rows are in the result?

A) 100 rows
B) 150 rows
C) 5,000 rows
D) 50 rows

> [!success]- Answer
> **Correct Answer: C**
>
> A `CROSS JOIN` produces the Cartesian product of both tables: every row in A is combined
> with every row in B. 100 × 50 = 5,000 rows. Cross joins are intentional when you need
> all combinations (e.g., generating date-product combinations).

---

## Question 32 *(Easy)*

An analyst needs to filter rows where a window function result equals 1. Which SQL clause is designed for this purpose?

A) `HAVING ROW_NUMBER() OVER (...) = 1`
B) `WHERE ROW_NUMBER() OVER (...) = 1`
C) `QUALIFY ROW_NUMBER() OVER (...) = 1`
D) `FILTER ROW_NUMBER() OVER (...) = 1`

> [!success]- Answer
> **Correct Answer: C**
>
> `QUALIFY` is the SQL clause specifically designed to filter on window function results. It
> evaluates after window functions are computed, allowing direct filtering on their output.
> `WHERE` and `HAVING` are evaluated before window functions — they cannot reference window
> function results. `FILTER` modifies aggregate functions, not window functions.

---

## Dashboards & Visualization (Questions 33–40)

---

## Question 33 *(Easy)*

Which dashboard widget is designed to display a single KPI value prominently, such as "Total Revenue: $1.2M"?

A) Table widget
B) Text widget
C) Counter widget
D) Pivot widget

> [!success]- Answer
> **Correct Answer: C**
>
> Counter widgets are purpose-built for displaying a single prominent metric value. They are
> typically used for KPIs like total revenue, active user count, or daily order volume. A Text
> widget displays static markdown; a Table widget shows tabular data.

---

## Question 34 *(Medium)*

When is a pie chart the most appropriate visualization choice?

A) When showing a metric trend over time
B) When showing parts of a whole that sum to 100%, with fewer than 6 slices
C) When comparing absolute values across many categories
D) When one or more values are negative

> [!success]- Answer
> **Correct Answer: B**
>
> Pie charts work best for part-to-whole relationships with few categories (typically fewer than
> 6). With more categories, slices become too small to distinguish. Pie charts are not appropriate
> for time series, negative values, or comparisons where precise magnitude matters.

---

## Question 35 *(Easy)*

How is a refresh schedule configured on a Databricks SQL dashboard?

A) In the dashboard settings, set the refresh interval and assign a SQL warehouse
B) Create a Databricks Job that calls the dashboard API at the desired interval
C) Enable auto-refresh in the notebook that provides the dashboard's data
D) Dashboards cannot have refresh schedules — only individual queries can be scheduled

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL dashboards have a built-in schedule configuration. From the dashboard settings,
> set the interval (e.g., daily at 8 AM) and select which SQL warehouse will execute the
> underlying queries. No external Job or notebook is required.

---

## Question 36 *(Easy)*

What is the `{{parameter_name}}` syntax used for in Databricks SQL queries?

A) Variable substitution in Python notebook cells
B) Query parameters — replaced with user-selected values at query runtime
C) Column aliasing in SELECT statements
D) Referencing the output of a previously run query

> [!success]- Answer
> **Correct Answer: B**
>
> Double curly braces `{{parameter_name}}` are Databricks SQL's query parameter (mustache)
> syntax. When a query containing this syntax is added to a dashboard, a corresponding filter
> widget is automatically created. The selected value is injected into the SQL at runtime.

---

## Question 37 *(Medium)*

A SQL alert has the condition `WHEN VALUE > 1000`. The query returns 850. Does the alert fire?

A) Yes — 850 is close enough to 1000 to trigger
B) No — 850 does not satisfy the condition `> 1000`
C) Yes — the alert fires whenever the scheduled query runs, regardless of the returned value
D) The alert returns an error because the threshold was not met

> [!success]- Answer
> **Correct Answer: B**
>
> The alert evaluates its threshold condition against the query result. Since 850 is not greater
> than 1000, the condition is false and no notification is sent. The alert re-evaluates on its
> next scheduled refresh.

---

## Question 38 *(Easy)*

Which notification destination is NOT natively supported by Databricks SQL alerts?

A) Email
B) Slack via webhook
C) PagerDuty
D) SMS text message

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks SQL alerts natively support email, Slack (via webhook), PagerDuty, and custom
> webhooks. SMS is not a built-in destination. SMS notifications could be achieved by routing
> through a custom webhook to an SMS gateway service.

---

## Question 39 *(Medium)*

A Lakeview Dashboard is shared with a user with "Can View" permission. What can that user do?

A) Edit the underlying query SQL
B) View the dashboard, interact with filter widgets, and export data — but not modify queries or layout
C) Create new visualization widgets on the dashboard
D) Change the dashboard's refresh schedule

> [!success]- Answer
> **Correct Answer: B**
>
> "Can View" permission allows a user to view the dashboard and interact with filter parameters.
> They can also export data from individual visualizations. They cannot edit SQL queries, change
> the layout, add widgets, or modify the refresh schedule.

---

## Question 40 *(Medium)*

An analyst creates a line chart with `date` on the X-axis and `revenue` on the Y-axis. They want separate lines per region. Which configuration achieves this?

A) Set "Group By" or "Series" to the `region` column in the chart configuration
B) Create a separate chart for each region manually
C) Write a `PIVOT` in the underlying SQL to create one column per region
D) Set the chart color scheme to map colors by `revenue` value

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL chart visualizations have a "Group By" or "Series" configuration option. Setting
> it to the `region` column automatically creates one line per distinct region value. This
> approach is more maintainable than pivoting in SQL, as new regions appear automatically.

---

## Analytics Applications (Questions 41–45)

---

## Question 41 *(Easy)*

A dashboard filter passes a selected date to all underlying queries. Which SQL snippet correctly uses this parameter?

A) `WHERE order_date = :selected_date`
B) `WHERE order_date = {{selected_date}}`
C) `WHERE order_date = @selected_date`
D) `WHERE order_date = $selected_date`

> [!success]- Answer
> **Correct Answer: B**
>
> `{{parameter_name}}` is the Databricks SQL parameter substitution syntax. The value selected
> in the dashboard filter widget is injected into the query at runtime. The colon (`:`) syntax
> is used in some other SQL tools but not Databricks SQL.

---

## Question 42 *(Medium)*

An analyst needs a summary table refreshed nightly without manually running the query. What is the most appropriate approach?

A) Open Databricks SQL each morning and run the query manually
B) Schedule the query in Databricks SQL to run nightly at midnight using a SQL warehouse
C) Write a Python script that runs on the analyst's laptop at midnight
D) Use Delta Live Tables — it is the only supported option for automated query execution

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL has built-in query scheduling. Configure a schedule (e.g., nightly at midnight),
> select a SQL warehouse, and the platform runs the query automatically. No external scripts,
> jobs, or Delta Live Tables are required for simple scheduled query execution.

---

## Question 43 *(Hard)*

A sales dashboard shows different data per sales rep based on who is logged in. This behavior is implemented with:

A) Separate dashboard copies for each sales rep
B) A dashboard parameter pre-populated with the logged-in user's name
C) A Unity Catalog row-level security policy on the underlying table
D) A Python UDF in the dashboard query that filters by session user

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog row-level security policies automatically filter rows based on the current
> user's identity at query time. The dashboard query returns data appropriate for the logged-in
> user with no dashboard-level configuration needed. This is more secure than parameter-based
> filtering, which a user could potentially bypass.

---

## Question 44 *(Medium)*

A query result cache serves stale data after an ETL pipeline writes new data to the underlying Delta table. What invalidates the cache?

A) The 24-hour cache TTL expiring
B) Writing to the underlying Delta table — cache invalidation is automatic
C) Running a manual cache clear command on the warehouse
D) Restarting the SQL warehouse

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL result cache tracks Delta table versions via the transaction log. When new data
> is written to a Delta table (a new transaction is logged), the cache for all queries touching
> that table is automatically invalidated. The next query re-executes against fresh data.

---

## Question 45 *(Hard)*

A compliance team requires that all SQL queries run on company data be logged with user identity for 90 days. Which Databricks feature best provides this?

A) Delta transaction log — records all writes with timestamps
B) SQL warehouse Query History — operational log retained up to 30 days
C) Unity Catalog audit logs in `system.access.audit`
D) MLflow experiment tracking — stores query metadata

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog's `system.access.audit` table captures all data access events including SQL
> query text, user identity, timestamp, and accessed objects. It supports configurable retention
> suitable for compliance requirements. SQL warehouse Query History is an operational tool,
> not a compliance-grade audit log, and is limited in retention duration.

---

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)
