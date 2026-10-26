---
title: Executing Queries Using Databricks SQL and SQL Warehouses Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, databricks-sql, sql-warehouses, joins, aggregations]
---

# Executing Queries Using Databricks SQL and SQL Warehouses Practice Questions

**Exam Weight: 20 %** — Section 4 of the October 2025 exam guide

Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026.

[← Back to Practice Questions](./README.md) | [Next: Creating Dashboards and Visualizations](./02-dashboards-visualizations.md)

---

## Question 1: SQL Warehouse Type for Unpredictable Concurrency *(Medium)*

A team has 50 analysts who run queries at unpredictable times, with sudden bursts of activity. Which SQL warehouse type best handles this workload?

A) Serverless warehouse, because it starts in seconds and uses Intelligent Workload Management to scale  
B) Classic warehouse, because it is the lowest-cost option  
C) Pro warehouse, because it adds clusters after queries have queued for several minutes  
D) An all-purpose cluster for each analyst  

> [!success]- Answer
> **Correct Answer: A**
>
> Serverless SQL warehouses start in about 2–6 seconds and use Intelligent Workload Management (IWM) to start queries immediately when capacity exists and to add clusters quickly when queues grow.
>
> Pro and classic warehouses also autoscale, but they add clusters based on the estimated load and take about 4 minutes to start, so they respond more slowly to bursts. Per-analyst clusters are not SQL warehouses and waste compute.

---

## Question 2: Serverless vs Pro Warehouse — Start Time *(Easy)*

A product team needs a SQL warehouse that is ready within seconds when the first dashboard query of the morning arrives. Which type should they choose?

A) Serverless  
B) Classic  
C) Pro  
D) Any type — all warehouse types start in seconds  

> [!success]- Answer
> **Correct Answer: A**
>
> Serverless warehouses typically start in 2–6 seconds because Databricks manages the compute.
>
> Pro and classic warehouses typically take about 4 minutes to start (D).

---

## Question 3: Serverless Auto Stop Default *(Easy)*

A workspace admin creates a serverless SQL warehouse in the UI and leaves **Auto stop** at its default value. After how many idle minutes does the warehouse stop?

A) 5 minutes  
B) 10 minutes  
C) 45 minutes  
D) 120 minutes  

> [!success]- Answer
> **Correct Answer: B**
>
> For serverless warehouses the default auto stop is 10 minutes, and the UI minimum is 5 minutes.
>
> Pro and classic warehouses default to 45 minutes, with a 10-minute minimum. 120 minutes is not a current default. Auto stop only starts counting once no queries are running.

---

## Question 4: Warehouse Queues at Peak *(Medium)*

A pro SQL warehouse is configured with **Scaling** set to a minimum and maximum of 1 cluster. During peak hours, queries wait in the queue even though each query finishes quickly once it starts. Which change addresses this?

A) Increase the warehouse size from Small to Large  
B) Turn off the query result cache  
C) Raise the maximum number of clusters so the warehouse can add clusters under load  
D) Convert the warehouse to classic  

> [!success]- Answer
> **Correct Answer: C**
>
> Scaling sets the minimum and maximum number of clusters. More clusters let the warehouse run more queries at the same time. Databricks recommends about one cluster for every 10 concurrent queries.
>
> A larger size reduces the latency of each query but does not add concurrency (A). Turning off the cache only adds work (B). Classic offers no concurrency advantage over pro (D).

---

## Question 5: Serverless-Only Capability *(Medium)*

Which capability does a serverless SQL warehouse have that pro and classic warehouses do NOT have?

A) Photon  
B) Predictive I/O  
C) Auto stop  
D) Intelligent Workload Management  

> [!success]- Answer
> **Correct Answer: D**
>
> Intelligent Workload Management (IWM) is available only on serverless warehouses.
>
> Photon runs on all three types (A). Predictive I/O runs on pro and serverless (B). Auto stop is available on every type (C).

---

## Question 6: Default Warehouse Type *(Easy)* *(2025 blueprint)*

In a workspace that supports serverless compute, an analyst creates a SQL warehouse in the UI and does not change the type. What type is created?

A) Classic  
B) Pro  
C) The type of the most recently used warehouse  
D) Serverless  

> [!success]- Answer
> **Correct Answer: D**
>
> In the UI, the default SQL warehouse type is serverless for eligible workspaces.
>
> Through the API with default parameters, the default is classic. That difference is a common trap.

---

## Question 7: Warehouse Size Selection *(Medium)*

An analyst runs complex aggregate queries over 500 GB of Delta Lake data every day. Which warehouse size is most appropriate?

A) Large or X-Large, because complex queries over large data benefit from more workers  
B) 2X-Small, because it costs the least  
C) Small, because it is designed for individual users  
D) Size doesn't matter, because every size returns the same result just as fast  

> [!success]- Answer
> **Correct Answer: A**
>
> Each larger size doubles the number of workers. Increasing the size reduces the latency of heavy queries.
>
> The smallest sizes suit light, exploratory work. All sizes return the same result, but not in the same time (D).

---

## Question 8: CREATE TABLE in Unity Catalog *(Medium)*

Which statement creates a managed table named `transactions` in the `gold` schema of the `ml_catalog` catalog?

A) `CREATE TABLE gold.transactions AS SELECT ...` with no catalog set  
B) `CREATE TABLE ml_catalog.gold.transactions AS SELECT ...`  
C) `USE CATALOG ml_catalog; CREATE TABLE gold.transactions AS SELECT ...`  
D) Both B and C  

> [!success]- Answer
> **Correct Answer: D**
>
> A fully qualified three-level name (B) and a `USE CATALOG` statement followed by a two-level name (C) both create the table in `ml_catalog.gold`.
>
> Without a catalog set (A), the two-level name resolves against the current default catalog, which may not be `ml_catalog`.

---

## Question 9: INNER JOIN vs LEFT JOIN *(Medium)*

A query must return all employees and their department names, including employees who have no department. Which join type should be used?

A) LEFT JOIN from employees to departments  
B) INNER JOIN  
C) CROSS JOIN  
D) LEFT SEMI JOIN  

> [!success]- Answer
> **Correct Answer: A**
>
> A LEFT JOIN keeps every row from the left table (employees). Employees without a department get NULL in the department columns.
>
> An INNER JOIN drops employees without a match. A CROSS JOIN returns every combination. A SEMI JOIN returns only matching left rows and no right-side columns.

---

## Question 10: Joining on a Composite Key *(Hard)* *(2025 blueprint)*

The `order_lines` and `shipments` tables are both identified by `order_id` and `line_number`. An analyst joins them with `ON o.order_id = s.order_id` and sees far more rows than expected. What is the fix?

A) Replace the INNER JOIN with a FULL OUTER JOIN  
B) Add `DISTINCT` to the outer `SELECT`  
C) Join on both keys: `ON o.order_id = s.order_id AND o.line_number = s.line_number`  
D) Add `ORDER BY order_id`  

> [!success]- Answer
> **Correct Answer: C**
>
> When the key has two columns, joining on only one of them matches every line of an order to every shipment of that order, which multiplies rows.
>
> A full outer join adds even more rows (A). `DISTINCT` can hide the symptom but still pairs the wrong lines (B). Sorting does not change which rows match (D).

---

## Question 11: Anti Join *(Medium)*

A query must return all customers who have NOT made a purchase. Which approaches work?

A) `customers LEFT JOIN purchases ... WHERE purchases.purchase_id IS NULL`  
B) `customers LEFT ANTI JOIN purchases ON ...`  
C) Both A and B  
D) `customers FULL OUTER JOIN purchases ... WHERE purchases.purchase_id IS NOT NULL`  

> [!success]- Answer
> **Correct Answer: C**
>
> `LEFT ANTI JOIN` returns only left rows that have no match. A `LEFT JOIN` filtered to rows where the right key `IS NULL` produces the same result.
>
> Option D keeps rows that do have purchases, which is the opposite of what is needed.

---

## Question 12: Semi Join *(Medium)*

A query must return each product that has at least one review, once per product. Which join is most appropriate?

A) INNER JOIN to reviews  
B) LEFT JOIN to reviews  
C) LEFT SEMI JOIN to reviews  
D) CROSS JOIN to reviews  

> [!success]- Answer
> **Correct Answer: C**
>
> A `LEFT SEMI JOIN` returns left rows where a match exists and never duplicates them.
>
> An INNER JOIN returns one row per matching review, so products with many reviews appear many times. A LEFT JOIN also keeps products with no reviews.

---

## Question 13: UNION vs UNION ALL *(Easy)* *(2025 blueprint)*

Table `a` contains the values 1, 2, 2 and table `b` contains 2, 3. What does `SELECT x FROM a UNION SELECT x FROM b` return?

A) 1, 2, 2, 2, 3  
B) 2  
C) 1, 2, 3  
D) 1  

> [!success]- Answer
> **Correct Answer: C**
>
> `UNION` defaults to `DISTINCT`, so duplicate rows are removed and the result is 1, 2, 3.
>
> `UNION ALL` keeps duplicates and would return 1, 2, 2, 2, 3 (A). Option B is what `INTERSECT` returns. Option D is what `EXCEPT` returns.

---

## Question 14: Customers Lost Between Years *(Medium)* *(2025 blueprint)*

An analyst needs the customer IDs that bought in 2024 but not in 2025. Which query returns them?

A) `SELECT customer_id FROM sales_2024 UNION SELECT customer_id FROM sales_2025`  
B) `SELECT customer_id FROM sales_2024 INTERSECT SELECT customer_id FROM sales_2025`  
C) `SELECT customer_id FROM sales_2024 EXCEPT SELECT customer_id FROM sales_2025`  
D) `SELECT customer_id FROM sales_2024 UNION ALL SELECT customer_id FROM sales_2025`  

> [!success]- Answer
> **Correct Answer: C**
>
> `EXCEPT` returns the rows of the first query that do not appear in the second. Databricks SQL also accepts `MINUS` as a synonym.
>
> `INTERSECT` returns customers who bought in both years (B). `UNION` and `UNION ALL` combine both lists (A, D). Every set operation needs the same number of columns on both sides.

---

## Question 15: Approximate Distinct Count *(Easy)* *(2025 blueprint)*

A dashboard tile shows the number of distinct visitors over billions of page views. An estimate within a few percent is acceptable if it is faster. Which function fits?

A) `count(DISTINCT visitor_id)`  
B) `approx_count_distinct(visitor_id)`  
C) `count(visitor_id)`  
D) `sum(DISTINCT visitor_id)`  

> [!success]- Answer
> **Correct Answer: B**
>
> `approx_count_distinct` returns an estimated distinct count as a `BIGINT`. It uses the HyperLogLog++ algorithm and is accurate within 5 % by default. An optional `relativeSD` argument sets the allowed error.
>
> `count(DISTINCT ...)` is exact but more expensive (A). `count(col)` counts non-NULL values, not distinct ones (C). Option D adds up distinct IDs, which is meaningless (D).

---

## Question 16: Summary Statistics in a Notebook *(Easy)* *(2025 blueprint)*

An analyst wants to see summary statistics for every column of a DataFrame from Python code in a notebook. Which command does this?

A) `dbutils.data.summarize(df)`  
B) `df.printSchema()`  
C) `spark.sql("DESCRIBE HISTORY my_table")`  
D) `df.count()`  

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.data.summarize` calculates and displays summary statistics for a Spark or pandas DataFrame. In the notebook UI, the data profile on a result table gives the same kind of view, including histograms. Some statistics are approximate unless you pass `precise=True`.
>
> `printSchema` shows only column names and types (B). `DESCRIBE HISTORY` lists table versions (C). `count()` returns only the row count (D).

---

## Question 17: Window Function — ROW_NUMBER *(Medium)*

A query must return exactly one row per customer: the purchase with the highest amount. Which window function guarantees a unique number per row within each customer?

A) `RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC)`  
B) `DENSE_RANK() OVER (PARTITION BY customer_id ORDER BY amount DESC)`  
C) `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY amount DESC)`  
D) `NTILE(1) OVER (PARTITION BY customer_id ORDER BY amount DESC)`  

> [!success]- Answer
> **Correct Answer: C**
>
> `ROW_NUMBER()` numbers rows 1, 2, 3… with no ties, so filtering on `= 1` returns exactly one row per customer.
>
> `RANK()` and `DENSE_RANK()` give tied rows the same number, so `= 1` can return several rows. `NTILE(1)` puts every row in bucket 1.

---

## Question 18: RANK vs DENSE_RANK *(Hard)*

Sales figures are Alice = 100, Bob = 100, and Carol = 90, ordered by sales descending. What are Carol's values from `RANK()` and `DENSE_RANK()`?

A) `RANK()` = 3, `DENSE_RANK()` = 2  
B) `RANK()` = 2, `DENSE_RANK()` = 2  
C) `RANK()` = 2, `DENSE_RANK()` = 3  
D) `RANK()` = 3, `DENSE_RANK()` = 3  

> [!success]- Answer
> **Correct Answer: A**
>
> Alice and Bob tie at 1 in both functions. `RANK()` leaves a gap after a tie, so Carol is 3. `DENSE_RANK()` leaves no gaps, so Carol is 2.

---

## Question 19: LAG Function *(Medium)*

A query calculates the change in monthly sales compared with the previous month. Which expression returns the previous month's value?

A) `PREV(sales) OVER (ORDER BY month)`  
B) `LAG(sales, 1) OVER (ORDER BY month)`  
C) `LEAD(sales, 1) OVER (ORDER BY month)`  
D) `FIRST_VALUE(sales) OVER (ORDER BY month)`  

> [!success]- Answer
> **Correct Answer: B**
>
> `LAG(column, offset)` returns the value from `offset` rows before the current row.
>
> `LEAD` looks forward, not backward (C). `FIRST_VALUE` returns the first value in the window, not the previous one (D). `PREV` is not a Databricks SQL function (A).

---

## Question 20: Running Total *(Medium)*

An analyst needs a running total of sales by date within each region. Which expression computes it?

A) `SUM(sales) OVER (PARTITION BY region)`  
B) `SUM(sales)` with `GROUP BY region, sale_date`  
C) `CUMSUM(sales) OVER (PARTITION BY region ORDER BY sale_date)`  
D) `SUM(sales) OVER (PARTITION BY region ORDER BY sale_date)`  

> [!success]- Answer
> **Correct Answer: D**
>
> Adding `ORDER BY` inside `OVER` makes the window grow row by row, which produces a cumulative sum within each region.
>
> Without `ORDER BY`, every row gets the partition's total (A). `GROUP BY` returns one total per region and date, not a running total (B). `CUMSUM` is not a Databricks SQL function (C).

---

## Question 21: CTE vs Subquery *(Easy)*

Which statement about common table expressions (CTEs) is TRUE?

A) CTEs are always faster than equivalent subqueries  
B) CTEs name an intermediate result, which improves readability, and the name can be referenced more than once in the query  
C) CTEs cannot be used in `SELECT` statements  
D) CTEs are stored as tables after the query finishes  

> [!success]- Answer
> **Correct Answer: B**
>
> A CTE (`WITH name AS (...)`) names an intermediate result for the duration of one statement. You can reference it several times without repeating the logic.
>
> CTEs are a readability tool, not a guaranteed speed-up (A), and nothing is persisted after the statement ends (D).

---

## Question 22: One Row per Array Element *(Easy)*

A table has a `tags` column of type `ARRAY<STRING>`. A query needs one output row per tag. Which function produces this?

A) `FLATTEN(tags)`  
B) `ARRAY_JOIN(tags, ',')`  
C) `SPLIT(tags, ',')`  
D) `EXPLODE(tags)`  

> [!success]- Answer
> **Correct Answer: D**
>
> `EXPLODE` is a generator function that returns one row per array element.
>
> `FLATTEN` merges nested arrays into one array without adding rows (A). `ARRAY_JOIN` concatenates the elements into a single string (B). `SPLIT` turns a string into an array, which is the opposite direction (C).

---

## Question 23: Aggregating Values into an Array *(Easy)*

Which aggregate function collects the values of many rows into one array per group?

A) `COLLECT_LIST` (or its synonym `ARRAY_AGG`)  
B) `CONCAT_WS`  
C) `EXPLODE`  
D) `COUNT`  

> [!success]- Answer
> **Correct Answer: A**
>
> `COLLECT_LIST` returns an array of the group's values. `ARRAY_AGG` is the SQL-standard name for the same aggregate.
>
> `CONCAT_WS` joins strings with a separator but is not an aggregate (B). `EXPLODE` does the reverse, turning one array into many rows (C).

---

## Question 24: Pivoting Months into Columns *(Medium)*

An analyst wants monthly sales as columns (Jan, Feb, Mar), one row per product. Which clause does this most concisely?

A) `PIVOT (SUM(sales) FOR month IN ('Jan', 'Feb', 'Mar'))`  
B) `CASE WHEN month = 'Jan' THEN sales END` in the `SELECT` list, with no aggregation  
C) `GROUP BY month HAVING month IN ('Jan', 'Feb', 'Mar')`  
D) `TRANSPOSE(sales, month)`  

> [!success]- Answer
> **Correct Answer: A**
>
> `PIVOT` turns the distinct values of one column into columns and aggregates a measure for each: `FROM t PIVOT (agg(col) FOR pivot_col IN (values))`.
>
> Conditional aggregation can produce the same shape, but only with `SUM(CASE ...)` and `GROUP BY product`. Without aggregation, option B returns one row per input row. Option C keeps the months as rows, and `TRANSPOSE` is not a Databricks SQL function.

---

## Question 25: Days Between Two Dates *(Easy)*

Which expression returns the number of days from `order_date` to today as a positive number for past orders?

A) `datediff(order_date, current_date())`  
B) `datediff(current_date(), order_date)`  
C) `months_between(current_date(), order_date)`  
D) `date_sub(current_date(), order_date)`  

> [!success]- Answer
> **Correct Answer: B**
>
> `datediff(endDate, startDate)` returns the number of days from `startDate` to `endDate` as an `INTEGER`. The end date comes first.
>
> Swapping the arguments returns a negative number for past orders (A). `months_between` measures months (C). `date_sub` subtracts a number of days from a date and returns a date (D).

---

## Question 26: Sorting with NULLs *(Medium)* *(2025 blueprint)*

An analyst runs `SELECT * FROM products ORDER BY price ASC`. Some prices are NULL. Where do those rows appear, and how can the analyst move them to the end?

A) Last by default; nothing to change  
B) They are excluded from sorted results; add `WHERE price IS NULL`  
C) First by default; add `NULLS LAST`  
D) First by default; add `DESC`  

> [!success]- Answer
> **Correct Answer: C**
>
> In Databricks SQL, NULLs sort first for `ASC` and last for `DESC` unless you say otherwise. `ORDER BY price ASC NULLS LAST` keeps ascending order and moves NULLs to the end.
>
> Sorting never removes rows (B). Switching to `DESC` moves the NULLs but reverses the order of the prices (D).

---

## Question 27: Diagnosing an Error with the Assistant *(Easy)* *(2025 blueprint)*

A SQL cell in a notebook fails with an error. The analyst wants Databricks Assistant to propose a corrected version of the code. Which command should they use?

A) `/explain`  
B) `/doc`  
C) `/findTables`  
D) `/fix`  

> [!success]- Answer
> **Correct Answer: D**
>
> `/fix` proposes fixes for code errors in a diff view. The **Diagnose error** button that appears under a failed cell runs `/fix` automatically.
>
> `/explain` describes what code does (A). `/doc` adds comments (B). `/findTables` searches Unity Catalog metadata for relevant tables (C). Databricks Assistant was renamed **Genie Code** on March 11, 2026, and these commands still work under the new name.

---

## Question 28: Federated Join *(Medium)* *(2025 blueprint)*

An analyst must join a Unity Catalog Delta table `main.sales.orders` with a `customers` table that lives in an operational PostgreSQL database. Copying the PostgreSQL data is not allowed. What is the Databricks approach?

A) Use Lakehouse Federation: create a connection and a foreign catalog for PostgreSQL, then join the foreign table to the Delta table using three-level names  
B) Load the PostgreSQL table with `COPY INTO` and then join it  
C) Ask the PostgreSQL team to send the data through Delta Sharing  
D) Export the PostgreSQL table to CSV and upload it through the UI  

> [!success]- Answer
> **Correct Answer: A**
>
> Lakehouse Federation gives governed, read-only access to external databases through Unity Catalog foreign catalogs. Queries are pushed down to the source over JDBC, so the data stays where it is. A query can join a foreign table to a Delta table like any other two tables.
>
> Options B and D copy the data. Delta Sharing (now called OpenSharing) shares data between platforms and is not a way to query a PostgreSQL database (C).

---

## Question 29: Warehouse for Federated Queries *(Medium)* *(2025 blueprint)*

A federated query against a foreign catalog fails on one SQL warehouse but works on another. Which warehouse type cannot run Lakehouse Federation queries?

A) Classic  
B) Serverless  
C) Pro  
D) All types can run them  

> [!success]- Answer
> **Correct Answer: A**
>
> Lakehouse Federation needs a pro or serverless SQL warehouse (version 2023.40 or above). Clusters need Databricks Runtime 13.3 LTS or above in standard or dedicated access mode.
>
> Foreign catalogs are read-only, so federated sources can be queried and joined but not written to.

---

## Question 30: Streaming Table vs Materialized View *(Medium)* *(2025 blueprint)*

New JSON files land in a Unity Catalog volume every few minutes. An analyst wants a table that loads only the new files on each refresh. Which object fits?

A) A streaming table: `CREATE OR REFRESH STREAMING TABLE ... AS SELECT * FROM STREAM read_files(...)`  
B) A standard view over `read_files`  
C) A materialized view that re-reads every file on each refresh  
D) A temporary view  

> [!success]- Answer
> **Correct Answer: A**
>
> A streaming table processes only the rows that arrived since the last update and appends them. With `STREAM read_files`, it uses Auto Loader to pick up new files incrementally.
>
> Materialized views fit complex queries such as aggregations and joins whose results are precomputed and refreshed (C). Standard and temporary views store nothing and re-read the source each time (B, D).

---

## Question 31: View vs Materialized View *(Medium)* *(2025 blueprint)*

What is the key difference between a standard (or dynamic) view and a materialized view in Databricks SQL?

A) A standard view runs its query every time it is read; a materialized view stores the results and updates them on refresh  
B) A standard view stores its results; a materialized view runs its query every time it is read  
C) Only materialized views can be granted to other users  
D) Only standard views can be used in dashboards  

> [!success]- Answer
> **Correct Answer: A**
>
> A materialized view is a Unity Catalog managed table that stores a query's results and updates them on refresh, incrementally when possible. A standard view stores only the query text. A dynamic view is a standard view that uses functions such as `is_account_group_member()` to filter rows or mask columns for each user.
>
> Both kinds can be granted (C) and used in dashboards (D).

---

## Question 32: Refresh When the Source Changes *(Medium)* *(2025 blueprint)*

An analyst wants a materialized view to refresh automatically whenever its source table is updated, without managing a schedule. Which clause should they use?

A) `SCHEDULE EVERY 1 HOUR`  
B) `REFRESH ASYNC`  
C) `WITH CONTINUOUS STREAMING`  
D) `TRIGGER ON UPDATE`  

> [!success]- Answer
> **Correct Answer: D**
>
> `CREATE OR REPLACE MATERIALIZED VIEW mv TRIGGER ON UPDATE AS SELECT ...` refreshes the view automatically when the source table is updated.
>
> `SCHEDULE EVERY` or `SCHEDULE CRON` refreshes on a timetable (A). `REFRESH MATERIALIZED VIEW mv ASYNC` starts one manual refresh without waiting for it (B). Option C is not valid syntax.

---

## Question 33: Pre-computing a Slow Dashboard Query *(Hard)*

Every time someone opens a dashboard, the same heavy aggregation runs over a large fact table. The data changes once per night. Which approach cuts load time most while keeping the numbers current?

A) Let each dashboard query run the aggregation when the dashboard opens  
B) Move the dashboard to a larger SQL warehouse  
C) Rely only on the query result cache  
D) Create a materialized view with the aggregation, refreshed on a nightly schedule, and point the dashboard dataset at it  

> [!success]- Answer
> **Correct Answer: D**
>
> A materialized view runs the expensive aggregation once per refresh and stores the result, so every dashboard read is a cheap scan. Scheduling the refresh after the nightly load keeps it current.
>
> A larger warehouse still repeats the heavy query for every session (B). The result cache is invalidated when the tables change and only helps identical repeated queries (C).

---

## Question 34: Unified Table from Files and Delta *(Hard)* *(2025 blueprint)*

Customer data arrives as CSV files in a volume and product data as Parquet files. Orders are already in a Delta table. An analyst wants one managed table that joins all three. Which statement does this in SQL?

A) `CREATE VIEW unified AS SELECT * FROM csv.customers, parquet.products`  
B) `CREATE TABLE unified AS SELECT ... FROM read_files('/Volumes/main/raw/customers', format => 'csv') c JOIN read_files('/Volumes/main/raw/products', format => 'parquet') p ON ... JOIN main.sales.orders o ON ...`  
C) `COPY INTO unified FROM main.sales.orders`  
D) `CREATE EXTERNAL TABLE unified USING CSV, PARQUET, DELTA`  

> [!success]- Answer
> **Correct Answer: B**
>
> `read_files` reads CSV, JSON, Parquet, Avro, ORC, XML, text, and binary files as a table. Used inside `CREATE TABLE ... AS SELECT`, it can be joined with Delta tables to create a new managed table.
>
> `COPY INTO` loads files, not Delta tables (C). A table has one format, so option D is invalid, and option A is not valid syntax for reading files.

---

## Question 35: Time Travel to Yesterday *(Medium)* *(2025 blueprint)*

An analyst needs the `orders` table as it was at midnight on October 25, 2026. Which query works?

A) `SELECT * FROM orders AS OF DATE '2026-10-25'`  
B) `SELECT * FROM orders TIMESTAMP AS OF '2026-10-25'`  
C) `SELECT * FROM orders WHERE _version_date = '2026-10-25'`  
D) `SELECT * FROM orders HISTORY '2026-10-25'`  

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Lake time travel uses `TIMESTAMP AS OF <timestamp>` or `VERSION AS OF <version>`. You can also write `orders@v123` for a version.
>
> Use `DESCRIBE HISTORY orders` to find the version numbers and timestamps that exist. The other options are not valid syntax.

---

## Question 36: Time Travel Fails for an Old Version *(Hard)* *(2025 blueprint)*

A Delta table uses the default retention settings, and `VACUUM` runs on it every week. `DESCRIBE HISTORY` still lists a version from 20 days ago, but `SELECT ... VERSION AS OF` that version fails. Why?

A) History is kept for only 7 days by default  
B) Time travel works only on external tables  
C) The table was optimized with liquid clustering  
D) `VACUUM` deleted the data files that the old version needs; by default it removes files that have been unreferenced for more than 7 days  

> [!success]- Answer
> **Correct Answer: D**
>
> Table history is kept for 30 days by default (`logRetentionDuration`), so the version still appears. `VACUUM` deletes unreferenced data files older than `deletedFileRetentionDuration`, which defaults to 7 days. Once those files are gone, you cannot read or restore that version.
>
> Time travel works on managed and external Delta tables (B). Clustering does not remove history (C).

---

## Question 37: Replace a Table Safely *(Medium)* *(2025 blueprint)*

An analyst must rebuild `warehouse_db.product_inventory` with a new definition. Users already have `SELECT` on the table and rely on its history. Which approach keeps both?

A) `DROP TABLE warehouse_db.product_inventory;` then `CREATE TABLE ...`  
B) `CREATE TABLE IF NOT EXISTS warehouse_db.product_inventory (...)`  
C) `CREATE OR REPLACE TABLE IF NOT EXISTS warehouse_db.product_inventory (...)`  
D) `CREATE OR REPLACE TABLE warehouse_db.product_inventory (...)`  

> [!success]- Answer
> **Correct Answer: D**
>
> For Delta tables, `REPLACE` keeps the table history and the granted privileges, row filters, and column masks. Databricks strongly recommends `REPLACE` over dropping and re-creating a table.
>
> Dropping loses the history and grants (A). `IF NOT EXISTS` does nothing when the table exists (B). `OR REPLACE` and `IF NOT EXISTS` cannot be combined (C).

---

**[↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Creating Dashboards and Visualizations Practice Questions →](./02-dashboards-visualizations.md)**
