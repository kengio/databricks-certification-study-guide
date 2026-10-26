---
title: Analyzing Queries Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, photon, query-profile, query-history, liquid-clustering, delta-history]
---

# Analyzing Queries Practice Questions

**Exam Weight: 15 %** — Section 5 of the October 2025 exam guide

Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026.

[← Previous: Creating Dashboards and Visualizations](./02-dashboards-visualizations.md) | [↑ Back to Practice Questions](./README.md) | [Next: Genie](./04-genie-agents.md)

---

## Question 1: Diagnosing a Slow Query *(Medium)*

A query in Databricks SQL runs slower than expected. Which feature helps the analyst diagnose it?

A) MLflow experiment logs  
B) Cluster event logs  
C) The Delta transaction log  
D) Query history, which shows the query's duration, rows, and I/O, with a link to its query profile  

> [!success]- Answer
> **Correct Answer: D**
>
> Query history lists each query with its status, duration, rows returned, and I/O details. **See query profile** opens the execution plan with metrics for each operator.
>
> MLflow tracks ML experiments (A), and the Delta log records table changes, not query performance (C).

---

## Question 2: Filtering on a Window Function *(Hard)*

An analyst wants only the top product by revenue in each category. Which clause filters on a window function result without a subquery?

A) `HAVING rn = 1`  
B) `WHERE ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) = 1`  
C) `QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) = 1`  
D) `FILTER (WHERE rn = 1)`  

> [!success]- Answer
> **Correct Answer: C**
>
> `QUALIFY` filters on window function results, just as `HAVING` filters on aggregates.
>
> `WHERE` is evaluated before window functions, so it cannot reference them (B). `HAVING` filters groups after `GROUP BY` (A). `FILTER (WHERE ...)` applies to an aggregate's input rows (D).

---

## Question 3: Aggregate in WHERE *(Medium)*

An analyst writes `SELECT region, COUNT(*) FROM orders WHERE COUNT(*) > 5 GROUP BY region` and gets an error. What fixes the query?

A) Replace `WHERE` with `QUALIFY`  
B) Move the condition to `HAVING COUNT(*) > 5` after `GROUP BY`  
C) Replace `COUNT(*)` with `SUM(1)` in the `WHERE` clause  
D) Add `ORDER BY COUNT(*)`  

> [!success]- Answer
> **Correct Answer: B**
>
> `WHERE` filters rows before aggregation, so it cannot contain aggregate functions. `HAVING` filters after `GROUP BY` and accepts aggregates.
>
> `QUALIFY` is for window functions (A), and `SUM(1)` is still an aggregate (C).

---

## Question 4: Off-by-One SUBSTR *(Hard)*

`product_code` values look like `XABCDE99`. An analyst needs characters 2 through 5 (`ABCD`) but writes `SUBSTR(product_code, 2, 5)` and gets `ABCDE`. What is the correct expression?

A) `SUBSTR(product_code, 2, 4)`  
B) `LEFT(product_code, 5)`  
C) `SUBSTR(product_code, 1, 5)`  
D) `SUBSTR(product_code, 5, 2)`  

> [!success]- Answer
> **Correct Answer: A**
>
> `SUBSTR(str, pos, len)` starts at a 1-based position and returns `len` characters. Starting at 2 with length 4 returns characters 2, 3, 4, and 5.
>
> The third argument is a length, not an end position, which is why length 5 returned one character too many. `LEFT(..., 5)` returns `XABCD` (B).

---

## Question 5: Viewing a Query Plan *(Easy)*

Which statement shows the execution plan of a query without running it?

A) `EXPLAIN SELECT ...`  
B) `DESCRIBE my_table`  
C) `PROFILE SELECT ...`  
D) `SHOW PLAN SELECT ...`  

> [!success]- Answer
> **Correct Answer: A**
>
> `EXPLAIN` returns the logical and physical plan of a statement. After a query runs, its query profile shows actual runtime metrics for each operator.
>
> `DESCRIBE` describes table schemas (B). Options C and D are not Databricks SQL statements.

---

## Question 6: Above-Average Salaries *(Medium)*

Which query returns employees who earn more than the average salary?

A) `SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)`  
B) `SELECT * FROM employees WHERE salary > AVG(salary)`  
C) `SELECT * FROM employees HAVING salary > AVG(salary)`  
D) `SELECT * FROM employees WHERE salary > MEAN(salary)`  

> [!success]- Answer
> **Correct Answer: A**
>
> Aggregates cannot appear directly in `WHERE`. A scalar subquery computes the average once and compares each row to it.
>
> `MEAN` is a synonym for `AVG` in Databricks SQL, but it is still an aggregate, so option D fails for the same reason as option B.

---

## Question 7: When the Result Cache Is Not Used *(Medium)*

Databricks SQL query result caches can return results without running the query again. In which case is a cached result NOT used?

A) The query ran an hour ago on the same warehouse  
B) The query text is identical  
C) The underlying Delta table has been updated since the result was cached  
D) The warehouse was already running  

> [!success]- Answer
> **Correct Answer: C**
>
> Result caches are invalidated when the underlying tables are updated, so the query runs again against current data.
>
> The local result cache lives in a cluster's memory. The remote result cache (serverless only) is shared by all warehouses in a workspace. Both keep entries for up to 24 hours.

---

## Question 8: What Photon Is *(Easy)* *(2025 blueprint)*

What is Photon?

A) A BI tool for building dashboards  
B) A file format that replaces Parquet  
C) A scheduler for SQL queries  
D) The Databricks-native vectorized query engine, which is the default engine for all SQL warehouses  

> [!success]- Answer
> **Correct Answer: D**
>
> Photon is the Databricks-native vectorized query engine. It speeds up SQL and DataFrame workloads, joins, aggregations, scans, and Delta and Parquet writes without code changes, and it is the default engine on every SQL warehouse.
>
> It is not a file format (B) or a scheduler (C).

---

## Question 9: Photon and UDFs *(Medium)* *(2025 blueprint)*

A query on a SQL warehouse calls a user-defined function (UDF). What happens to the parts of the query that Photon does not support?

A) The query fails  
B) They fall back to the Spark runtime and the results stay correct  
C) Photon rewrites the UDF automatically  
D) The warehouse restarts without Photon  

> [!success]- Answer
> **Correct Answer: B**
>
> Photon does not support UDFs, RDD APIs, or Dataset APIs. Unsupported operations fall back to the standard Spark runtime, and results remain correct. Only that part of the query loses the Photon speed-up.
>
> Photon also gives little benefit to queries that already finish in under about two seconds.

---

## Question 10: Did the Query Use Photon? *(Medium)* *(2025 blueprint)*

How can an analyst see how much of a query's work ran in Photon?

A) Run `DESCRIBE HISTORY` on the table  
B) Check the warehouse size  
C) Open the query profile; its execution details show the percentage of task time spent in Photon  
D) Look for the word "Photon" in the result set  

> [!success]- Answer
> **Correct Answer: C**
>
> The query profile's execution details show the share of task time spent in Photon. In the plan, Photon operators are shown in a different colour from standard Spark operators.
>
> `DESCRIBE HISTORY` lists table versions, not query execution (A).

---

## Question 11: Spotting an Exploding Join *(Medium)* *(2025 blueprint)*

A query that joins two tables returns hundreds of millions of rows and runs for a long time. Which tool shows where the row count explodes?

A) The Catalog Explorer lineage graph  
B) The dashboard schedule history  
C) `SHOW TABLES`  
D) The query profile, which shows rows, time, and memory for each operator  

> [!success]- Answer
> **Correct Answer: D**
>
> The query profile shows each operator with metrics such as time spent, rows, and peak memory. Databricks names exploding joins and full table scans as common mistakes it helps you find. Filter icons show the percentage of data pruned during scans.
>
> Where available, performance insights in the query details panel also suggest fixes, and **Optimize** opens Genie Code (formerly Databricks Assistant) to rewrite the query.

---

## Question 12: Finding Failed Queries *(Easy)* *(2025 blueprint)*

An analyst needs every query that a colleague ran yesterday that failed. What is the fastest way?

A) Search the notebook revision history  
B) Open query history and filter by user, date range, and status  
C) Read the Delta transaction log of each table  
D) Ask a workspace admin to export the audit logs  

> [!success]- Answer
> **Correct Answer: B**
>
> Query history can be filtered by user, date range, compute, duration, query status, statement type, statement ID, and query tags.
>
> With serverless compute enabled, it also includes SQL and Python queries run on serverless compute for notebooks and jobs.

---

## Question 13: Account-Wide Query Analysis *(Medium)* *(2025 blueprint)*

A platform team wants to write SQL that finds the slowest queries across all warehouses in the account. Which source should they query?

A) `system.query.history`  
B) `information_schema.tables`  
C) `DESCRIBE HISTORY`  
D) The warehouse's local result cache  

> [!success]- Answer
> **Correct Answer: A**
>
> The `system.query.history` system table holds query records across the account. By default, only admins can access system tables, so others need to be granted access.
>
> `information_schema.tables` lists table metadata (B), and `DESCRIBE HISTORY` covers one table's changes (C).

---

## Question 14: Fast Result After a Restart *(Hard)* *(2025 blueprint)*

On a serverless SQL warehouse, an analyst runs a query, the warehouse stops and starts again, and the same query then returns instantly. No tables changed. Which cache explains this?

A) The local result cache in the cluster's memory  
B) The disk cache on the cluster's SSDs  
C) The remote result cache, which persists across warehouse restarts and is shared by all warehouses in the workspace  
D) The browser cache  

> [!success]- Answer
> **Correct Answer: C**
>
> The remote result cache is available only on serverless warehouses. It is a persistent cache shared by all warehouses in a workspace, it survives stops and restarts, and it keeps entries for 24 hours.
>
> The local result cache and the disk cache are cleared when the cluster stops (A, B). A query checks the local cache first, then the remote cache, and runs only when neither holds the result.

---

## Question 15: Benchmarking Without the Cache *(Easy)* *(2025 blueprint)*

An analyst wants to time a query honestly and must stop Databricks SQL from returning a cached result. What should they run first?

A) `DROP CACHE`  
B) `OPTIMIZE my_table`  
C) `SET use_cached_result = false`  
D) `REFRESH TABLE my_table`  

> [!success]- Answer
> **Correct Answer: C**
>
> `SET use_cached_result = false` turns off the result cache for the session. Databricks advises using it only for testing or benchmarking.
>
> `OPTIMIZE` rewrites data files and does not affect result caching (B).

---

## Question 16: Who Deleted the Rows? *(Easy)* *(2025 blueprint)*

Rows disappeared from a Delta table overnight. Which command shows which operation ran, who ran it, and when?

A) `DESCRIBE DETAIL orders`  
B) `SHOW GRANTS ON TABLE orders`  
C) `DESCRIBE HISTORY orders`  
D) `SELECT * FROM orders VERSION AS OF 0`  

> [!success]- Answer
> **Correct Answer: C**
>
> `DESCRIBE HISTORY` returns each write to the table in reverse order, with the operation, user, timestamp, `operationParameters`, and `operationMetrics` (such as the number of deleted rows).
>
> `DESCRIBE DETAIL` shows current table metadata such as location and size (A). Option D reads the first version of the data but does not say who changed it.

---

## Question 17: Rows Changed Between Versions *(Medium)* *(2025 blueprint)*

An analyst wants the rows that are in version 12 of the `orders` table but were not in version 10. Which query returns them?

A) `SELECT * FROM orders VERSION AS OF 12 EXCEPT SELECT * FROM orders VERSION AS OF 10`  
B) `DESCRIBE HISTORY orders LIMIT 2`  
C) `RESTORE TABLE orders TO VERSION AS OF 10`  
D) `SELECT * FROM orders WHERE version BETWEEN 10 AND 12`  

> [!success]- Answer
> **Correct Answer: A**
>
> Time travel can read two versions of the same table, and `EXCEPT` returns the rows of the first query that are missing from the second. This is a quick way to validate a load or compare results over time.
>
> `RESTORE` rolls the table back and changes it (C). Tables have no `version` column (D).

---

## Question 18: Enabling Liquid Clustering *(Easy)* *(2025 blueprint)*

Which statement creates a table that uses liquid clustering on `customer_id`?

A) `CREATE TABLE sales (...) PARTITIONED BY (customer_id)`  
B) `CREATE TABLE sales (...) ZORDER BY (customer_id)`  
C) `CREATE TABLE sales (...) BUCKET BY (customer_id)`  
D) `CREATE TABLE sales (...) CLUSTER BY (customer_id)`  

> [!success]- Answer
> **Correct Answer: D**
>
> `CLUSTER BY` enables liquid clustering. For an existing table, use `ALTER TABLE ... CLUSTER BY (...)`. Databricks recommends liquid clustering for all new tables, including streaming tables and materialized views.
>
> Liquid clustering replaces partitioning and `ZORDER` and cannot be combined with them (A, B).

---

## Question 19: Choosing Clustering Keys *(Medium)* *(2025 blueprint)*

A 2 TB table is usually queried with `WHERE event_date = ...` and `WHERE country = ...`. Which columns should be the liquid clustering keys?

A) The primary key column, whatever the queries filter on  
B) Every column in the table  
C) `event_date` and `country`, the columns most often used in filters  
D) A random hash column  

> [!success]- Answer
> **Correct Answer: C**
>
> Choose clustering keys from the columns most often used in query filters. You can specify up to four keys.
>
> Clustering on columns that queries do not filter on does not help data skipping (A, D), and more than four keys is not allowed (B).

---

## Question 20: Changing Clustering Keys *(Hard)* *(2025 blueprint)*

An analyst runs `ALTER TABLE sales CLUSTER BY (country)` on a table that already holds years of data. What happens to the existing data?

A) The whole table is rewritten immediately during the `ALTER`  
B) The command fails because clustering keys cannot change  
C) The keys change without rewriting existing data; `OPTIMIZE` clusters data incrementally, and `OPTIMIZE ... FULL` reclusters all of it  
D) The table converts to a partitioned table  

> [!success]- Answer
> **Correct Answer: C**
>
> Liquid clustering keys can be redefined without rewriting existing data. `OPTIMIZE` is incremental and rewrites only what it needs. `OPTIMIZE table_name FULL` reclusters all records. Predictive optimization can run `OPTIMIZE` automatically on enabled tables.
>
> Keys can change at any time (B), and liquid clustering is not partitioning (D).

---

## Question 21: Automatic Liquid Clustering *(Medium)* *(2025 blueprint)*

What does `CLUSTER BY AUTO` do, and what does it require?

A) Databricks chooses the clustering keys based on how the table is queried; it requires a Unity Catalog managed table and predictive optimization  
B) It clusters by every column; it works on any table  
C) It disables clustering  
D) It partitions the table by date automatically  

> [!success]- Answer
> **Correct Answer: A**
>
> Automatic liquid clustering lets Databricks choose and change clustering keys to improve query performance. It works on Unity Catalog managed tables and needs predictive optimization for key selection and clustering, which run asynchronously.

---

## Question 22: Missing Column in GROUP BY *(Easy)* *(2025 blueprint)*

`SELECT region, product, SUM(sales) FROM orders GROUP BY region` fails. Why?

A) `SUM` cannot be used with `GROUP BY`  
B) `product` is selected but is neither grouped nor aggregated  
C) `GROUP BY` must come before `FROM`  
D) `region` must be aggregated  

> [!success]- Answer
> **Correct Answer: B**
>
> Every non-aggregated column in the `SELECT` list must appear in `GROUP BY`. Add `product` to `GROUP BY` (or use `GROUP BY ALL`), or remove it from the `SELECT` list.

---

## Question 23: Comparing to NULL *(Medium)* *(2025 blueprint)*

`SELECT * FROM orders WHERE discount = NULL` returns no rows, even though many orders have no discount. What is the fix?

A) `WHERE discount IS NULL`  
B) `WHERE discount == NULL`  
C) `WHERE discount = 'NULL'`  
D) `WHERE NOT discount`  

> [!success]- Answer
> **Correct Answer: A**
>
> Comparing anything to NULL with `=` returns NULL, not TRUE, so no rows pass the filter. Use `IS NULL` or `IS NOT NULL`.
>
> Option C compares to the text `'NULL'`, which is a different value.

---

## Question 24: LEFT JOIN That Behaves Like an INNER JOIN *(Hard)* *(2025 blueprint)*

An analyst wants every customer with their 2026 orders, including customers with no 2026 orders. The query is:

`SELECT c.id, o.amount FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.order_year = 2026`

Customers without 2026 orders are missing. What fixes it?

A) Change to `RIGHT JOIN`  
B) Add `DISTINCT`  
C) Change to `CROSS JOIN`  
D) Move the condition into the join: `ON c.id = o.customer_id AND o.order_year = 2026`  

> [!success]- Answer
> **Correct Answer: D**
>
> For customers with no matching order, `o.order_year` is NULL, so the `WHERE` filter removes them and the outer join acts like an inner join. Filtering the right table in the `ON` clause keeps every customer.

---

**[← Previous: Creating Dashboards and Visualizations Practice Questions](./02-dashboards-visualizations.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Genie Practice Questions →](./04-genie-agents.md)**
