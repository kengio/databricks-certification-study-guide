---
title: Databricks SQL Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, databricks-sql]
---

# Databricks SQL Practice Questions

[← Back to Practice Questions](./README.md) | [Next: Data Management](./02-data-management.md)

---

## Question 1: SQL Warehouse Type for High Concurrency *(Medium)*

A team has 50 analysts running simultaneous queries at unpredictable times. Which SQL warehouse type best handles this?

A) Classic warehouse — most cost-effective
B) Pro warehouse — supports up to 10 clusters for auto-scaling
C) Serverless warehouse — instant start, auto-scales compute
D) Personal cluster — dedicated resources per user

> [!success]- Answer
> **Correct Answer: C**
>
> Serverless warehouses auto-scale compute instantly based on demand, with no cold start delay
> and per-second billing. Ideal for bursty, unpredictable analyst workloads.

---

## Question 2: Serverless vs Pro Warehouse — Start Time *(Easy)*

A product team needs a SQL warehouse that starts within seconds for morning dashboards. Which type should they choose?

A) Classic — standard option
B) Pro — fastest of the dedicated types
C) Serverless — starts in seconds, no warmup needed
D) All warehouse types start in seconds

> [!success]- Answer
> **Correct Answer: C**
>
> Serverless warehouses are instantly available because compute is managed by Databricks
> infrastructure. Classic and Pro warehouses take 2-5 minutes to start.

---

## Question 3: SQL Warehouse Auto-Stop Default *(Easy)*

What is the default auto-stop idle time for a Databricks SQL warehouse?

A) 30 minutes
B) 60 minutes
C) 120 minutes
D) Auto-stop is disabled by default

> [!success]- Answer
> **Correct Answer: C**
>
> The default idle auto-stop time is 120 minutes (2 hours). Admins can configure this value
> or disable it for always-on warehouses.

---

## Question 4: Connecting External BI Tools *(Easy)*

A team uses Tableau to connect to Databricks SQL data. Which connection method should they use?

A) JDBC/ODBC driver with warehouse connection details
B) Delta Lake Python SDK
C) Direct S3 bucket access
D) REST API polling every 5 minutes

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL provides JDBC and ODBC drivers for standard BI tool connectivity. The
> connection string includes warehouse hostname, HTTP path, and authentication token.

---

## Question 5: Query History Purpose *(Medium)*

A data engineer notices a query is running slower than expected in Databricks SQL. Which feature helps diagnose the performance issue?

A) MLflow experiment logs
B) Query History — shows query duration, rows processed, and a visual query plan
C) Cluster event logs
D) Delta transaction log

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL Query History provides execution time, rows scanned, the executed SQL, and
> a link to the query plan for performance analysis.

---

## Question 6: Pro Warehouse Unique Feature *(Medium)*

Which capability is available in Pro and Serverless SQL warehouses but NOT in Classic warehouses?

A) SQL query execution
B) Delta Lake integration
C) Row-level security and column masking via Unity Catalog
D) Auto-stop configuration

> [!success]- Answer
> **Correct Answer: C**
>
> Row-level security (row access policies) and column masking policies in Unity Catalog
> require Pro or Serverless SQL warehouses. Classic warehouses don't support these
> fine-grained data access controls.

---

## Question 7: Partner Connect *(Easy)*

A team wants to connect a third-party ETL tool directly to Databricks without manual credential setup. Which feature should they use?

A) Databricks REST API
B) Partner Connect — pre-built integrations with one-click setup
C) Delta Sharing
D) Unity Catalog External Locations

> [!success]- Answer
> **Correct Answer: B**
>
> Partner Connect provides pre-built, guided integrations with partner tools (dbt, Fivetran,
> Tableau, etc.), automating credential setup and warehouse configuration.

---

## Question 8: Multi-Cluster Warehouse *(Medium)*

A Classic SQL warehouse is overloaded during peak hours, causing queue buildup. What change would allow multiple concurrent query streams?

A) Increase warehouse size (Small → Large)
B) Upgrade to Pro warehouse and enable auto-scaling with Max Clusters > 1
C) Enable query caching
D) Add a second Classic warehouse

> [!success]- Answer
> **Correct Answer: B**
>
> Classic warehouses are single-cluster. Pro warehouses support multi-cluster auto-scaling
> (1 to 10 clusters), allowing multiple concurrent query streams without queue buildup.

---

## Question 9: Serverless Warehouse Billing *(Easy)*

Which billing model applies to Serverless SQL warehouses?

A) Per DBU-hour — billed for the full hour whenever active
B) Per DBU-second — billed only for actual compute seconds used
C) Flat monthly fee
D) Per query executed

> [!success]- Answer
> **Correct Answer: B**
>
> Serverless warehouses bill per DBU-second, making them cost-efficient for intermittent
> workloads. Classic and Pro warehouses bill per DBU-hour (rounded up).

---

## Question 10: Warehouse Size Selection *(Medium)*

A data analyst runs complex aggregate queries over 500 GB of Delta Lake data daily. Which warehouse size is most appropriate?

A) X-Small — smallest cost
B) Small — good for individual users
C) Large or X-Large — complex queries over large data benefit from more cores
D) Size doesn't matter — all sizes produce the same result

> [!success]- Answer
> **Correct Answer: C**
>
> Larger warehouse sizes have more CPU and memory. For complex aggregation over large
> datasets, a larger size reduces query time significantly. X-Small is suitable for light,
> exploratory queries only.

---

**[↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Data Management Practice Questions](./02-data-management.md) →**
