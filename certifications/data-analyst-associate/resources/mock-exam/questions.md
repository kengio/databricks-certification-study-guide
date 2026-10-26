---
title: Data Analyst Associate Mock Exam 1 — Questions
type: mock-exam-questions
tags: [data-analyst-associate, mock-exam, practice]
---

# Data Analyst Associate Mock Exam 1 — Questions

[← Back to Mock Exam](./README.md) | [Practice Questions](../practice-questions/README.md)

---

> [!note] Platform update (Oct 2026)
> Questions are grouped by the nine domains of the October 2025 exam guide. Genie Spaces were renamed **Genie Agents** on July 8, 2026, and **Delta Sharing** is now **OpenSharing** (Jun 10, 2026). The exam still uses the original names. **Delta Live Tables** is now **Lakeflow Spark Declarative Pipelines**.

---

## Executing Queries Using Databricks SQL and Warehouses (Questions 1–9)

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

A team needs 8 concurrent analyst sessions plus bursts of dashboard traffic without queue buildup. Which warehouse configuration supports this best?

A) Classic warehouse with Scaling set to a minimum and maximum of 1 cluster  
B) A warehouse whose Scaling maximum allows more than one cluster, so it adds clusters under load  
C) An X-Large warehouse with 1 cluster, because a larger size removes queuing  
D) A personal all-purpose cluster for each analyst  

> [!success]- Answer
> **Correct Answer: B**
>
> Scaling (minimum and maximum number of clusters) controls concurrency. Pro and classic warehouses
> add clusters when queued load grows, and serverless warehouses scale with Intelligent Workload
> Management. Databricks recommends about one cluster per 10 concurrent queries. A larger size
> lowers each query's latency but does not add concurrency (C).

---

## Question 3 *(Easy)*

Which SQL warehouse types can run Lakehouse Federation queries against a foreign catalog?

A) Classic and Pro  
B) All warehouse types equally  
C) Classic only  
D) Pro and Serverless  

> [!success]- Answer
> **Correct Answer: D**
>
> Lakehouse Federation requires a pro or serverless SQL warehouse (version 2023.40 or above).
> Classic warehouses cannot run federated queries.

---

## Question 4 *(Medium)*

When two rows have the same value, which function produces gaps in the sequence of rank numbers?

A) `RANK()` — tied rows receive the same rank; the next rank skips  
B) `ROW_NUMBER()` — ties produce gaps  
C) `DENSE_RANK()` — always produces gaps between all ranks  
D) Both `RANK()` and `ROW_NUMBER()` produce gaps for ties  

> [!success]- Answer
> **Correct Answer: A**
>
> `RANK()` gives tied rows the same rank number and then skips the next rank value (e.g., 1, 1,
> 3). `ROW_NUMBER()` assigns unique sequential numbers regardless of ties — no gaps, no
> duplicates. `DENSE_RANK()` gives tied rows the same rank but never skips (e.g., 1, 1, 2).

---

## Question 5 *(Hard)*

A query uses `SUM(revenue) OVER (PARTITION BY region)` with no `ORDER BY` clause. What does each row receive?

A) A running total that accumulates within the region  
B) Each row's individual `revenue` value unchanged  
C) NULL — `ORDER BY` is required for all window functions  
D) The total sum for the entire region — the same value for every row in that region  

> [!success]- Answer
> **Correct Answer: D**
>
> Without `ORDER BY` in the window specification, `SUM() OVER (PARTITION BY ...)` computes the
> aggregate over the entire partition and returns that single value for every row in the partition.
> Adding `ORDER BY` changes the frame to a running (cumulative) sum from the first row to the
> current row.

---

## Question 6 *(Easy)*

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

## Question 7 *(Easy)*

What is the difference between `COLLECT_LIST(product)` and `COLLECT_SET(product)`?

A) `COLLECT_LIST` includes duplicate values; `COLLECT_SET` returns only unique values  
B) `COLLECT_LIST` preserves insertion order; `COLLECT_SET` sorts alphabetically  
C) They are identical — both return all values in the group  
D) `COLLECT_SET` is faster; `COLLECT_LIST` is used for large datasets only  

> [!success]- Answer
> **Correct Answer: A**
>
> `COLLECT_LIST` aggregates all values including duplicates into an array.
> `COLLECT_SET` returns only distinct values. Neither guarantees a specific ordering of
> elements in the resulting array.

---

## Question 8 *(Medium)*

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

## Question 9 *(Medium)*

An analyst needs a summary table refreshed nightly without manually running the query. What is the most appropriate approach?

A) Open Databricks SQL each morning and run the query manually  
B) Create a materialized view with a nightly `SCHEDULE CRON` refresh  
C) Write a Python script that runs on the analyst's laptop at midnight  
D) Use Lakeflow Spark Declarative Pipelines — it is the only supported option for automated refreshes  

> [!success]- Answer
> **Correct Answer: B**
>
> A materialized view can be created from a SQL warehouse with a `SCHEDULE` clause, and
> Databricks runs the refresh automatically. Lakeflow Jobs can also schedule SQL, so pipelines
> (the exam's "Delta Live Tables", now Lakeflow Spark Declarative Pipelines) are not the only
> option (D).

---

## Creating Dashboards and Visualizations (Questions 10–16)

## Question 10 *(Easy)*

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

## Question 11 *(Medium)*

When is a pie chart the most appropriate visualization choice?

A) When showing parts of a whole that sum to 100%, with fewer than 6 slices  
B) When showing a metric trend over time  
C) When comparing absolute values across many categories  
D) When one or more values are negative  

> [!success]- Answer
> **Correct Answer: A**
>
> Pie charts work best for part-to-whole relationships with few categories (typically fewer than
> 6). With more categories, slices become too small to distinguish. Pie charts are not appropriate
> for time series, negative values, or comparisons where precise magnitude matters.

---

## Question 12 *(Easy)*

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

## Question 13 *(Easy)*

An alert author wants a SQL alert to post to a Slack channel, but no Slack option appears in the alert's notification list. What is needed?

A) Paste the Slack channel password into the alert query  
B) Convert the alert to a dashboard  
C) Slack is never supported; use SMS  
D) A workspace admin must first create a Slack notification destination  

> [!success]- Answer
> **Correct Answer: D**
>
> Workspace admins set up notification destinations (such as Slack, Microsoft Teams, and
> webhooks). Alert authors then select users or destinations in the alert's notification
> settings.

---

## Question 14 *(Medium)*

An AI/BI dashboard is shared with a user who has CAN VIEW / CAN RUN permission. What can that user do?

A) Edit the dataset SQL  
B) View the published dashboard and interact with its filters, but not edit the draft  
C) Add new visualization widgets  
D) Change who else can access the dashboard  

> [!success]- Answer
> **Correct Answer: B**
>
> Viewers of a published AI/BI dashboard (formerly a Lakeview dashboard) can open it and use its
> filters. Editing the draft needs CAN EDIT, and changing permissions needs CAN MANAGE.

---

## Question 15 *(Easy)*

A dashboard filter passes a selected date to an AI/BI dashboard dataset. Which SQL snippet correctly uses this parameter?

A) `WHERE order_date = :selected_date`  
B) `WHERE order_date = {{selected_date}}`  
C) `WHERE order_date = @selected_date`  
D) `WHERE order_date = $selected_date`  

> [!success]- Answer
> **Correct Answer: A**
>
> AI/BI dashboards use named parameter markers (`:name`). Dashboards do not support the legacy
> mustache syntax (`{{ }}`), which works only in the legacy SQL editor and must be converted
> before use in a dashboard.

---

## Question 16 *(Medium)*

An analyst needs to notify the operations team when the daily backlog of unprocessed orders exceeds 10,000. The notification should fire within minutes of crossing the threshold and go to a Slack channel.

Which feature fits best?

A) Schedule the dashboard to refresh hourly and rely on team members to check it  
B) Create a SQL alert on a query that returns `unprocessed_order_count` and configure it to evaluate every 5 minutes with a threshold of `> 10000`; route to a Slack webhook destination  
C) Build a dashboard with a red KPI tile that turns red when the count exceeds 10,000  
D) Use a Lakeflow Job that runs the SQL nightly and emails a digest  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL Alerts are the documented path for threshold-based notifications: they evaluate a query result on a schedule (down to 1 minute), apply a comparator (`>`, `<`, `==`), and route to email, Slack, or any webhook destination. A and C are passive — they require someone to look. D is too slow (nightly) and not threshold-based.

---

## Analyzing Queries (Questions 17–23)

## Question 17 *(Medium)*

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

## Question 18 *(Medium)*

After an analyst adds a join to a `customers` table, a dashboard query slows down and its revenue totals are higher than expected. In the query profile, the join operator outputs about 50 times more rows than the `orders` input. What is the most likely cause?

A) Photon is turned off on the warehouse  
B) The query result cache returned stale results  
C) The warehouse is too small for the join  
D) An exploding join: the join key isn't unique on the `customers` side, so each order matches many rows  

> [!success]- Answer
> **Correct Answer: D**
>
> When the rows coming out of a join far exceed its inputs, the join is "exploding". Duplicate keys on the right side multiply rows, which inflates both the runtime and the totals. Fix the join keys, for example by joining on the complete key or deduplicating the dimension first.
>
> Databricks names exploding joins and full table scans as common problems that the query profile helps you find. Turning Photon off or using a small warehouse changes speed, but neither one creates extra rows. A cached result would be faster, not slower, and is invalidated when the tables change.

---

## Question 19 *(Medium)*

A SQL query in Databricks SQL reads from a Delta table. The identical query runs again 30 seconds later with no data changes in between. What happens?

A) Results are returned from the query result cache, bypassing warehouse compute  
B) The query re-executes fully on the warehouse  
C) The second query fails due to a caching conflict  
D) Query caching only activates after a minimum of 5 minutes between runs  

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL maintains a query result cache. When the same query runs within the cache TTL
> and the underlying Delta table version has not changed, results are returned from cache
> instantly — no compute is used. The cache is automatically invalidated when the table is written to.

---

## Question 20 *(Hard)*

An analyst writes `WHERE ROW_NUMBER() OVER (PARTITION BY id ORDER BY date DESC) = 1`. The query fails. What is the correct approach?

A) Use `HAVING` instead of `WHERE`  
B) Add `GROUP BY` before the `WHERE` clause  
C) Use the `FILTER` keyword directly after the window function  
D) Wrap in a CTE and filter on the window result in the outer query, or use `QUALIFY`  

> [!success]- Answer
> **Correct Answer: D**
>
> Window functions are evaluated after `WHERE` is applied, so you cannot filter on window
> function results in `WHERE`. Two correct approaches:
>
> - Wrap in a CTE: `WITH cte AS (SELECT *, ROW_NUMBER() OVER (...) AS rn FROM t) SELECT * FROM cte WHERE rn = 1`
> - Use `QUALIFY`: `SELECT * FROM t QUALIFY ROW_NUMBER() OVER (...) = 1`

---

## Question 21 *(Easy)*

Rows disappeared overnight from `main.sales.orders`. The analyst needs to see which user ran which operation and when, along with metrics such as the number of rows deleted. Which command shows this?

A) `DESCRIBE HISTORY main.sales.orders`  
B) `DESCRIBE TABLE EXTENDED main.sales.orders`  
C) `SHOW GRANTS ON TABLE main.sales.orders`  
D) `SHOW TBLPROPERTIES main.sales.orders`  

> [!success]- Answer
> **Correct Answer: A**
>
> `DESCRIBE HISTORY` returns one row per write: the version, timestamp, user, operation (`WRITE`, `MERGE`, `DELETE`, ...), `operationParameters` such as a `DELETE` predicate, and `operationMetrics` such as rows deleted. History is kept for 30 days by default.
>
> `DESCRIBE TABLE EXTENDED` shows the schema and table metadata. `SHOW GRANTS` lists privileges, and `SHOW TBLPROPERTIES` lists table properties. None of them records who changed the data.

---

## Question 22 *(Easy)*

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

## Question 23 *(Medium)*

A query result cache serves stale data after an ETL pipeline writes new data to the underlying Delta table. What invalidates the cache?

A) The 24-hour cache TTL expiring  
B) Restarting the SQL warehouse  
C) Running a manual cache clear command on the warehouse  
D) Writing to the underlying Delta table — cache invalidation is automatic  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks SQL result cache tracks Delta table versions via the transaction log. When new data
> is written to a Delta table (a new transaction is logged), the cache for all queries touching
> that table is automatically invalidated. The next query re-executes against fresh data.

---

## Developing, Sharing, and Maintaining AI/BI Genie Spaces (Questions 24–28)

## Question 24 *(Medium)*

An analytics team has been asked to give the customer-success organisation a self-serve way to ask plain-English questions over a curated set of UC tables. The CS users do not write SQL. The team also needs to ensure that CS users cannot see PII columns even though those columns exist in the underlying tables.

Which approach is the documented and safest fit?

A) Build a Streamlit app that calls a fine-tuned LLM trained on the schema and let CS users authenticate with PATs  
B) Create an AI/BI Genie Space scoped to the curated UC tables; rely on UC column masks and row filters to enforce PII restrictions; grant the CS group access to the space  
C) Schedule daily exports of the curated tables to a separate UC schema with PII columns dropped, then grant access to that schema  
D) Use Mosaic AI Vector Search to embed each row and let CS users query semantically  

> [!success]- Answer
> **Correct Answer: B**
>
> Genie Spaces is the documented natural-language analytics surface for exactly this use case. UC permissions, including column masks and row filters, apply to every Genie-generated SQL query — so CS users physically cannot see PII columns they're not granted on, regardless of how Genie phrases the question. Option A reinvents Genie poorly. Option C duplicates data and creates a refresh / drift problem. Option D is a retrieval-augmentation pattern over *unstructured* data — vector search returns similar rows by embedding distance, which is the wrong tool for structured analytic queries (counts, aggregates, joins).

---

## Question 25 *(Medium)*

An analyst tries to create a Genie space on the team's classic SQL warehouse, but can't select it. What does a Genie space require?

A) An all-purpose cluster with Photon enabled  
B) Any SQL warehouse, as long as the author has `CAN MANAGE` on it  
C) A dedicated model serving endpoint for the space  
D) A pro or serverless SQL warehouse (serverless is recommended for performance)  

> [!success]- Answer
> **Correct Answer: D**
>
> Genie spaces (now called Genie Agents) run their generated SQL on a **pro or serverless** SQL warehouse. Classic warehouses aren't supported, and serverless is recommended for performance.
>
> The author needs `CAN USE` on the warehouse, the Databricks SQL entitlement, and `SELECT` on the data, but no permission level makes a classic warehouse work. The documented requirement is a pro or serverless SQL warehouse, not an all-purpose cluster or a serving endpoint.

---

## Question 26 *(Medium)*

A Genie Space frequently misinterprets the term "revenue" — sometimes summing `invoice_total`, sometimes `paid_amount`. The data team wants the space to *always* use `SUM(invoice_total)` for any question about revenue.

Which curation lever is the *officially recommended first choice* per Databricks best practice?

A) Add a free-text instruction: "Revenue means invoice_total"  
B) Add a **SQL expression** named `revenue` defined as `SUM(invoice_total)` so Genie can call it directly  
C) Train a custom embedding model on the team's vocabulary  
D) Add a column comment on `invoice_total` saying "this is revenue"  

> [!success]- Answer
> **Correct Answer: B**
>
> The official Databricks Genie best-practice guidance is to **prefer SQL expressions over text instructions** when both could express the rule. A named SQL expression is exact and deterministic — Genie will compose it into the generated query verbatim. Free-text instructions (Option A) are the documented *last resort*. Option C is irrelevant — Genie generates SQL, not embeddings. Option D (column comments / metadata) is a complementary lever but less precise than a SQL expression for an aggregation rule.

---

## Question 27 *(Medium)*

A team builds one Genie space over 40 tables that cover sales, support, and HR. Users report frequent wrong answers caused by incorrect joins. What does the Databricks curation guidance recommend?

A) Add a text instruction that lists every valid join between the 40 tables  
B) Increase the SQL warehouse size so Genie can consider more tables  
C) Scope each space narrowly, aiming for five or fewer tables, and prejoin related tables into views or metric views  
D) Add all remaining tables in the catalog so Genie has the full context  

> [!success]- Answer
> **Correct Answer: C**
>
> The official guidance is to "aim for five or fewer tables" and include only the tables needed for the questions the space should answer. When a topic needs more, prejoin tables into views or metric views, or split a broad domain into several focused spaces.
>
> Too many tables dilute Genie's context and make wrong joins more likely. More tables make that worse, and warehouse size affects speed, not how Genie interprets a question. Text instructions are the documented last resort.

---

## Question 28 *(Medium)*

A Genie Space has been live for three months. Usage analytics show 15 % of user questions get answers that the data team manually verifies as incorrect. The lead analyst wants to systematically improve accuracy.

Which workflow best addresses recurring incorrect answers?

A) Increase the model temperature so Genie produces more varied answers  
B) Review the questions, ratings, and "Fix it" / review requests in the space's **Monitor** tab, add a SQL expression, example query, or trusted asset for each recurring failure, add the failing questions as benchmarks, and re-run the benchmarks  
C) Disable Genie and replace it with hand-curated DBSQL dashboards  
D) Train a custom embedding model on the team's vocabulary  

> [!success]- Answer
> **Correct Answer: B**
>
> The documented optimisation loop is: track user questions, accuracy, and feedback (the **Monitor** tab shows every question and answer, with user feedback and a Weekly digest) → curate (SQL expressions and example SQL are preferred over text instructions) → validate with **benchmarks**. Each fix should become a benchmark so a later change cannot silently break it. A makes answers worse, not better (temperature is for creativity, not accuracy). C abandons the value of natural-language analytics. D doesn't apply — Genie generates SQL, not embeddings.

---

## Understanding of Databricks Data + AI Platform (Questions 29–33)

## Question 29 *(Easy)*

An analyst needs to connect Power BI Desktop to a Databricks SQL warehouse. Which connection protocol should they use?

A) Delta Sharing  
B) Direct cloud storage access (S3/ADLS)  
C) REST API with JSON output  
D) ODBC or JDBC driver provided by Databricks  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks provides ODBC and JDBC drivers compatible with standard BI tools including Power BI,
> Tableau, and Excel. Delta Sharing is for cross-organization data sharing, not BI tool connectivity.

---

## Question 30 *(Easy)*

A team requests a third-party reference dataset from Databricks Marketplace. How does the data typically reach their workspace?

A) Through Delta Sharing (now OpenSharing), usually as a catalog of tables, so there is no copy pipeline to build  
B) As CSV files that each user downloads to their laptop and uploads again  
C) Through an Auto Loader pipeline the team must build against the provider's storage bucket  
D) It can't: Marketplace lists only AI models and apps, not datasets  

> [!success]- Answer
> **Correct Answer: A**
>
> Marketplace is an open exchange where providers publish datasets, AI models, notebooks, apps, and MCP servers. Datasets are delivered through Delta Sharing (renamed OpenSharing on June 10, 2026) and usually arrive as catalogs of tabular data, so consumers query them without building ingestion.
>
> Anyone can browse the Open Marketplace, but requesting a product needs a Databricks workspace. Some listings are instant, and others need the provider's approval.

---

## Question 31 *(Easy)*

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

## Question 32 *(Easy)*

In Unity Catalog, what does `USE CATALOG my_catalog` accomplish?

A) Creates a new catalog named `my_catalog`  
B) Lists all objects in `my_catalog`  
C) Grants the current user access to `my_catalog`  
D) Sets `my_catalog` as the default catalog for the current session  

> [!success]- Answer
> **Correct Answer: D**
>
> `USE CATALOG` sets the session's default catalog. Subsequent queries that use two-level names
> (`schema.table`) or single-level names (`table`) resolve against this default catalog. It does
> not create, grant access to, or list objects in the catalog.

---

## Question 33 *(Easy)*

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

## Managing Data (Questions 34–37)

## Question 34 *(Easy)*

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

## Question 35 *(Easy)*

A data engineer appends data with new columns to an existing Delta table. Which write option enables schema evolution?

A) `.option("autoSchema", "true")`  
B) `.option("allowNewColumns", "true")`  
C) `.option("mergeSchema", "true")`  
D) No option is needed — Delta always accepts new columns  

> [!success]- Answer
> **Correct Answer: C**
>
> `mergeSchema=true` (or `spark.databricks.delta.schema.autoMerge.enabled = true` globally)
> enables schema evolution during writes. New columns in the incoming DataFrame are added to the
> Delta table schema automatically. Without this option, a write containing extra columns raises a
> schema mismatch error.

---

## Question 36 *(Easy)*

An external table pointing to `gs://bucket/data/` is dropped with `DROP TABLE`. What happens to the files in GCS?

A) Files are deleted from GCS immediately  
B) Files are archived by Databricks for 30 days  
C) Files are moved to a Databricks-managed DBFS location  
D) Files remain in GCS — only the table metadata entry is removed  

> [!success]- Answer
> **Correct Answer: D**
>
> External tables do not own their data. `DROP TABLE` on an external table removes only the
> catalog metadata entry (table definition). The actual data files in the external storage location
> are completely unaffected.

---

## Question 37 *(Medium)*

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

## Securing Data (Questions 38–41)

## Question 38 *(Easy)*

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

## Question 39 *(Easy)*

What does `SHOW GRANTS ON TABLE catalog.schema.table` return?

A) All privileges granted on the table and the principals they are granted to  
B) The table's schema — column names and data types  
C) The table's storage location and file format  
D) Recent data access history for the table  

> [!success]- Answer
> **Correct Answer: A**
>
> `SHOW GRANTS ON <object>` lists all Unity Catalog privileges granted on that specific object:
> the privilege type (e.g., SELECT, MODIFY), the principal (user, group, or service principal),
> and the grantor. It is the primary tool for auditing object-level permissions.

---

## Question 40 *(Hard)*

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

## Question 41 *(Hard)*

A compliance team needs a SQL-queryable record of who accessed company data, and when. Which Databricks feature best provides this?

A) The Delta transaction log, which records writes to one table  
B) Opening the Query History page in the UI each day  
C) Audit logs in the `system.access.audit` system table  
D) MLflow experiment tracking  

> [!success]- Answer
> **Correct Answer: C**
>
> Audit logs record account and workspace events, including data access, with the user
> identity and time, and the `system.access.audit` system table lets admins analyse them with
> SQL. The Delta log covers only changes to one table (A), and browsing query history in the UI
> is not a governed audit record (B). For query-level analysis, `system.query.history` is the
> companion system table.

---

## Importing Data (Questions 42–43)

## Question 42 *(Easy)*

An analyst tries to create a table with **Create or modify a table** by uploading 12 CSV files that total 3 GB, and the upload is rejected. What should the analyst do?

A) Upload the files to a Unity Catalog volume, then create the table from the volume (for example with `COPY INTO`)  
B) Compress the files into one zip archive and upload that instead  
C) Convert the files to Excel format first  
D) Ask an admin to raise the workspace upload limit  

> [!success]- Answer
> **Correct Answer: A**
>
> The **Create or modify a table** upload accepts up to 10 files at a time, under 2 GB in total, in CSV, TSV, JSON, Avro, Parquet, or text format. Zip and tar archives are not supported.
>
> **Upload files to a volume** accepts any format, up to 5 GB per file, with `WRITE VOLUME`. From the volume, the analyst can click **Create table** or load the files with `COPY INTO`.

---

## Question 43 *(Medium)*

Event files land in an S3 bucket every few minutes, and the bucket will hold millions of files within a year. The schema changes from time to time. The analyst works only in SQL. Which ingestion approach fits best?

A) A `COPY INTO` statement scheduled every few minutes  
B) Upload the files through the **Create or modify a table** UI each morning  
C) A Lakehouse Federation connection to the bucket  
D) A streaming table defined with `STREAM read_files`, which uses Auto Loader  

> [!success]- Answer
> **Correct Answer: D**
>
> Auto Loader is the documented choice for millions of files and frequently evolving schemas. In SQL, a streaming table with `STREAM read_files` uses Auto Loader underneath, for example `CREATE OR REFRESH STREAMING TABLE ... AS SELECT * FROM STREAM read_files(...)`.
>
> Databricks guidance points to `COPY INTO` for files in the thousands. The UI upload is for one-off local files. Lakehouse Federation queries external databases in place and doesn't ingest files from S3.

---

## Data Modeling with Databricks SQL (Questions 44–45)

## Question 44 *(Medium)*

An analyst builds a daily revenue dashboard that runs an aggregate query over a Silver `orders` Delta table (~500 GB). The aggregate takes 90 seconds and the dashboard is viewed by 50+ users per day. The analyst wants sub-second dashboard loads.

Which approach is the documented best fit?

A) Standard view: `CREATE VIEW gold.daily_revenue AS SELECT date, SUM(amount) ... GROUP BY date`  
B) Materialized view: `CREATE MATERIALIZED VIEW gold.daily_revenue AS ...` with an hourly refresh schedule  
C) Pin the dashboard to a Pro SQL Warehouse with result caching enabled  
D) Convert the orders table to bucketing on date  

> [!success]- Answer
> **Correct Answer: B**
>
> Materialised views (MVs) pre-compute the aggregate and persist it as Delta data; subsequent dashboard reads are reads of the materialised result (sub-second). For a 90-second aggregate that's read 50+ times/day, MV is the canonical pattern — storage cost is trivial compared to the compute saved. A re-runs the aggregate on every read. C helps a bit (result cache returns cached results when query+data hash matches), but cache is invalidated on every write to `orders` and doesn't help the *first* viewer of each day. D is irrelevant (bucketing is for joins).

---

## Question 45 *(Medium)*

A team is designing the Gold layer that feeds BI dashboards. Analysts want simple queries with as few joins as possible and fast response times. Which model fits best?

A) A snowflake schema with fully normalized dimension tables  
B) A Data Vault model of hubs, links, and satellites  
C) Querying the Bronze tables directly to avoid modeling work  
D) A star schema: a central fact table joined to denormalized dimension tables  

> [!success]- Answer
> **Correct Answer: D**
>
> A **star schema** needs one join per dimension, so queries are simpler and faster. It is the BI default and the typical Gold-layer model.
>
> A **snowflake** schema normalizes dimensions into more tables, which means more joins and slower queries. Choose it when normalization is critical. **Data Vault** is write-optimized and usually sits in Silver, with star schemas published on top for BI. **Bronze** holds raw, unvalidated data that analysts rarely query directly.

---

## Answer Key

| # | Answer | # | Answer | # | Answer |
|---|--------|---|--------|---|--------|
| 1 | C | 16 | B | 31 | B |
| 2 | B | 17 | B | 32 | D |
| 3 | D | 18 | D | 33 | B |
| 4 | A | 19 | A | 34 | C |
| 5 | D | 20 | D | 35 | C |
| 6 | C | 21 | A | 36 | D |
| 7 | A | 22 | C | 37 | A |
| 8 | C | 23 | D | 38 | C |
| 9 | B | 24 | B | 39 | A |
| 10 | C | 25 | D | 40 | C |
| 11 | A | 26 | B | 41 | C |
| 12 | A | 27 | C | 42 | A |
| 13 | D | 28 | B | 43 | D |
| 14 | B | 29 | D | 44 | B |
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
