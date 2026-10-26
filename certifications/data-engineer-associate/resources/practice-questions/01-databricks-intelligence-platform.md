---
title: "Practice Questions: Databricks Intelligence Platform"
type: practice-questions
tags: [data-engineer-associate, practice-questions, databricks-intelligence-platform]
---

# Domain 1: Databricks Intelligence Platform

Exam weight: **6 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: Lakehouse as a Unified Source of Truth

**Question** *(Medium)*: A leader in data organization is frustrated because the reports from the data analysis team differ from those of the data engineering team. How might a data lakehouse resolve this issue?

A) Each team would maintain separate copies of data optimized for their specific workloads
B) Both teams would utilize the same source of truth for their tasks
C) The data lakehouse would automatically reconcile differences between team reports
D) A dedicated ETL pipeline would synchronize data between team-specific databases

> [!success]- Answer
> **Correct Answer: B**
>
> Both teams would utilize the same source of truth for their tasks.
>
> A data lakehouse provides a single, unified platform where all teams access the same underlying data, eliminating discrepancies caused by siloed data systems or separate copies of data maintained by different teams.

---

## Question 2: Control Plane Components

**Question** *(Easy)*: Which option is entirely hosted within the control plane of the classic Databricks architecture?

A) Worker nodes and executor processes
B) Customer-managed cloud storage buckets
C) The Databricks web application
D) Driver nodes and cluster compute resources

> [!success]- Answer
> **Correct Answer: C**
>
> The Databricks web application.
>
> The control plane hosts the Databricks web UI, REST APIs, notebook server, and cluster manager — all infrastructure managed by Databricks. Worker nodes and driver nodes reside in the customer's data plane (their cloud account).

---

## Question 3: Delta Lake Advantage for Workloads

**Question** *(Easy)*: Which of the following advantages associated with the Databricks Lakehouse Platform is offered by Delta Lake?

A) The ability to run SQL queries without requiring a compute cluster
B) Automatic migration of legacy Hive tables to cloud-native formats
C) Built-in machine learning model training on raw data files
D) The ability to support both batch and streaming workloads

> [!success]- Answer
> **Correct Answer: D**
>
> The ability to support both batch and streaming workloads.
>
> Delta Lake's transaction log and Structured Streaming integration allow the same Delta tables to be read and written by both batch jobs and streaming pipelines, eliminating the need for separate storage systems for each workload type.

---

## Question 4: Delta Table Storage Organization

**Question** *(Easy)*: What describes how a Delta table is organized for storage?

A) Delta tables are stored in a collection of files that contain data, history, metadata, and other attributes
B) Delta tables are stored as a single monolithic binary file containing all rows and metadata
C) Delta tables are stored exclusively in the Databricks control plane with pointers to cloud storage
D) Delta tables are stored as CSV files with a separate JSON manifest tracking schema changes

> [!success]- Answer
> **Correct Answer: A**
>
> Delta tables are stored in a collection of files that contain data, history, metadata, and other attributes.
>
> Data is stored in Parquet files, and the `_delta_log` directory contains JSON transaction log files and checkpoint files that track all changes, schema, and table properties.

---

## Question 5: VACUUM and Time Travel

**Question** *(Medium)*: A data engineer discovered an error while updating a table daily and needs to use Delta time travel to revert the table to a version from three days ago. However, when they try to access the older version, the data files are absent. What explains the absence of the data files?

A) The table was converted from Parquet to Delta, erasing its version history
B) The OPTIMIZE command was run, which compacted and removed older file versions
C) The VACUUM command was run on the table
D) The Delta transaction log automatically purges entries older than 24 hours

> [!success]- Answer
> **Correct Answer: C**
>
> The VACUUM command was run on the table.
>
> `VACUUM` permanently deletes data files that are outside the retention threshold (default 7 days). Once vacuumed, older versions cannot be restored via time travel because the underlying Parquet files no longer exist.

---

## Question 6: Data Quality Feature of a Lakehouse

**Question** *(Easy)*: Which feature of a data lakehouse enhances data quality compared to a traditional data lake?

A) Native support for unstructured binary file formats
B) A data lakehouse supports ACID-compliant transactions
C) Automatic data replication across multiple cloud regions
D) Built-in data visualization and dashboarding tools

> [!success]- Answer
> **Correct Answer: B**
>
> A data lakehouse supports ACID-compliant transactions.
>
> Traditional data lakes lack transactional guarantees, which can lead to partial writes, inconsistent reads, and data corruption. ACID transactions in Delta Lake ensure atomicity, consistency, isolation, and durability for all operations.

---

## Question 7: Gold vs Silver Table Relationship

**Question** *(Easy)*: What best explains the connection between Gold tables and Silver tables?

A) Gold tables store raw data while Silver tables store transformed data
B) Gold tables are temporary views derived from permanent Silver tables
C) Gold tables and Silver tables always share the same schema and row count
D) Gold tables are more likely to contain aggregations than Silver tables

> [!success]- Answer
> **Correct Answer: D**
>
> Gold tables are more likely to contain aggregations than Silver tables.
>
> Gold tables represent business-level aggregates and metrics built for consumption in dashboards and reports. Silver tables contain cleaned and enriched data, but are typically at row-level granularity without the summarizations found in Gold.

---

## Question 8: Bronze vs Raw Data Relationship

**Question** *(Easy)*: What characterizes the connection between Bronze tables and raw data?

A) Bronze tables contain only validated and schema-enforced records from source systems
B) Bronze tables are external tables pointing directly to raw source files without any transformation
C) Bronze tables contain raw data with a schema applied
D) Bronze tables store aggregated summaries of raw data for downstream consumption

> [!success]- Answer
> **Correct Answer: C**
>
> Bronze tables contain raw data with a schema applied.
>
> Bronze is the first layer in the medallion architecture. Data is ingested from source systems with minimal transformation, but is captured in a structured Delta table format with metadata columns added (e.g., ingestion timestamp, source file).

---

## Question 9: Open-Source Technology Advantage

**Question** *(Easy)*: What is one advantage of the Databricks Lakehouse Platform utilizing open-source technologies?

A) Avoiding vendor lock-in
B) Eliminating the need for cloud infrastructure providers
C) Guaranteeing backward compatibility with all legacy data systems
D) Providing free unlimited compute resources for open-source users

> [!success]- Answer
> **Correct Answer: A**
>
> Avoiding vendor lock-in.
>
> By building on open standards and formats — Delta Lake (open format), Apache Spark, MLflow — organizations retain the ability to move data and workloads across clouds and platforms without being tied to proprietary, closed formats.

---

## Question 10: Delta Lake Underlying File Format

**Question** *(Easy)*: Which file formats are primarily used to store data from Delta Lake tables?

A) Avro
B) ORC
C) CSV
D) Parquet

> [!success]- Answer
> **Correct Answer: D**
>
> Parquet.
>
> Delta Lake stores all data in Parquet files, an open columnar format that provides efficient compression and predicate pushdown. The `_delta_log` directory stores transaction metadata as JSON and Parquet checkpoint files, but data itself is always Parquet.

---

## Question 11: Customer Cloud Account Contents

**Question** *(Easy)*: What is stored in the cloud account of the Databricks customer?

A) The Databricks web application and REST APIs
B) Data
C) Cluster management metadata and job configurations
D) Notebook source code and revision history

> [!success]- Answer
> **Correct Answer: B**
>
> Data.
>
> The customer's cloud account (AWS S3, Azure ADLS, GCP GCS) stores the actual data files. Databricks infrastructure — including the web application, cluster management metadata, repos, and notebooks — is managed in the Databricks-controlled plane, not the customer's account.

---

## Question 12: Streamlining Data Architectures

**Question** *(Medium)*: What methods can help streamline and integrate distinct data architectures tailored for particular applications?

A) A data lakehouse
B) Deploying separate data warehouses for each business unit
C) Using a message queue to synchronize data between independent databases
D) Building custom ETL pipelines between each pair of data systems

> [!success]- Answer
> **Correct Answer: A**
>
> A data lakehouse.
>
> The lakehouse architecture unifies the flexibility of a data lake (support for unstructured data, low-cost storage, ML workloads) with the reliability and governance of a data warehouse (ACID transactions, SQL support, schema enforcement) into a single platform.

---

## Question 13: When to Use Cluster Pools

**Question** *(Medium)*: When would a data team use cluster pools?

A) When clusters need to share data between concurrent jobs
B) When an automated report needs to be refreshed as quickly as possible
C) When reducing cloud storage costs for intermediate data is the priority
D) When enforcing uniform cluster configurations across all team members

> [!success]- Answer
> **Correct Answer: B**
>
> When an automated report needs to be refreshed as quickly as possible.
>
> Cluster pools maintain a set of pre-warmed, idle VM instances that can be assigned to clusters immediately on startup. This eliminates the VM provisioning delay (which can take several minutes), reducing cluster startup time to seconds for time-sensitive jobs.

---

## Question 14: SQL Warehouse Scaling for Concurrent Queries

**Question** *(Medium)*: A data analysis team's Databricks SQL queries perform poorly when multiple members execute small queries simultaneously on an always-on SQL warehouse. All queries use the same endpoint. What strategy improves performance?

A) Increase the maximum bound of the SQL warehouse's scaling range
B) Switch from a Pro to a Classic SQL warehouse type
C) Increase the size (T-shirt size) of each individual cluster in the endpoint
D) Enable query result caching on the SQL warehouse

> [!success]- Answer
> **Correct Answer: A**
>
> Increase the maximum bound of the SQL warehouse's scaling range.
>
> A SQL warehouse (warehouse) can auto-scale by adding more clusters when concurrent query load increases. Raising the maximum cluster count allows the endpoint to serve more parallel queries simultaneously, reducing wait times during peak concurrent usage.

---

## Question 15: Reducing SQL Warehouse Cost on a Daily Dashboard

**Question** *(Medium)*: A data engineer sets a Databricks SQL dashboard to refresh daily and wants the related SQL warehouse to run only when needed. What strategy reduces the overall running time of the SQL warehouse?

A) Downgrade the SQL warehouse to a smaller cluster size
B) Configure the SQL warehouse to start only during business hours
C) Switch the dashboard to use a shared all-purpose cluster instead
D) Turn on the Auto Stop feature for the SQL warehouse

> [!success]- Answer
> **Correct Answer: D**
>
> Turn on the Auto Stop feature for the SQL warehouse.
>
> Auto Stop automatically terminates the SQL warehouse after a configurable idle period. After the dashboard refresh completes, the endpoint shuts down automatically — avoiding continuous compute charges during the long idle period between daily refreshes.

---

## Question 16: Faster Cluster Startup for Nightly Jobs

**Question** *(Easy)*: A data engineer manages a nightly job with several tasks that run slowly due to long cluster startup times. What action improves cluster startup time?

A) Increase the driver node memory allocation
B) Switch to a single-node cluster to avoid worker provisioning
C) Use clusters from a cluster pool
D) Enable autoscaling with a higher maximum worker count

> [!success]- Answer
> **Correct Answer: C**
>
> Use clusters from a cluster pool.
>
> Cluster pools pre-provision and maintain idle instances that are immediately available for cluster creation. Tasks using pool-backed clusters skip the VM provisioning step, reducing startup from several minutes to a few seconds.

---

## Question 17: Minimizing SQL Warehouse Runtime on an Hourly Dashboard

**Question** *(Medium)*: A data engineer has an hourly Databricks SQL dashboard whose underlying data is managed by an automated Databricks Job. How can they minimize the total running time of the SQL warehouse during the dashboard's hourly refresh?

A) Reduce the SQL warehouse cluster size to the smallest available
B) Use a shared all-purpose cluster instead of a SQL warehouse
C) Pre-compute dashboard results in the Databricks Job and cache them
D) Turn on the Auto Stop feature for the SQL warehouse

> [!success]- Answer
> **Correct Answer: D**
>
> Turn on the Auto Stop feature for the SQL warehouse.
>
> Auto Stop shuts down the SQL warehouse after a defined idle period following the last query. Since the dashboard only needs the endpoint during the brief refresh window each hour, Auto Stop ensures the endpoint is off for the remaining idle time between refreshes.

---

## Question 18: When to Use a Single-Node Cluster

**Question** *(Medium)*: What scenario would prompt a data engineer to use a single-node cluster?

A) When running a distributed join across tables with billions of rows
B) When deploying a production Lakeflow Declarative Pipelines pipeline with multiple streaming sources
C) When working interactively with a small amount of data
D) When maximizing parallelism for a large-scale ETL workload

> [!success]- Answer
> **Correct Answer: C**
>
> When working interactively with a small amount of data.
>
> Single-node clusters run both the driver and executor on the same machine, making them suitable for development, exploratory data analysis on small datasets, and libraries that do not support distributed execution (e.g., some scikit-learn workflows). They are not appropriate for large-scale production jobs.

---

## Question 19: Using SQL in a Python Notebook Cell

**Question** *(Easy)*: A data engineer is working in a Python notebook on Databricks but needs to use SQL for one specific cell. They prefer that all other cells remain Python. How can they incorporate SQL into only that cell?

A) Add `%sql` to the first line of the cell
B) Wrap the SQL query in `spark.sql()` and assign it to a variable
C) Change the notebook's default language to SQL and then switch back
D) Import the `sql` module and call `sql.execute()`

> [!success]- Answer
> **Correct Answer: A**
>
> Add `%sql` to the first line of the cell.
>
> Databricks magic commands (`%sql`, `%python`, `%scala`, `%r`) override the cell language for that individual cell only. All other cells continue using the notebook's default language. This allows mixing languages within a single notebook without changing the global setting.

---

## Question 20: Compute for Concurrent Ad Hoc SQL *(2026 blueprint)*

**Question** *(Medium)*: Throughout the day, dozens of business analysts run short, ad hoc SQL queries against curated Gold tables. The team wants fast startup, good performance as concurrency rises, and no paying for a large cluster that sits idle overnight. Which compute should they use?

A) An all-purpose cluster with a fixed 20 workers, shared by all analysts
B) A serverless SQL warehouse with autoscaling (maximum clusters raised) and auto stop
C) A jobs compute cluster created for each query
D) A single-node cluster per analyst

> [!success]- Answer
> **Correct Answer: B**
>
> A serverless SQL warehouse with autoscaling (maximum clusters raised) and auto stop.
>
> Serverless SQL warehouses start in about 2–6 seconds, scale out by adding clusters as queries queue, and auto stop after idle time (10 minutes by default). A fixed all-purpose cluster pays for peak capacity all day. Jobs compute exists only for scheduled job runs. Single-node clusters don't share capacity or scale for concurrency ([SQL warehouse types](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-types)).

---

## Question 21: Characteristics of Serverless Compute *(2026 blueprint)*

**Question** *(Easy)*: Which statement about serverless compute for notebooks and jobs is correct?

A) You choose the Databricks Runtime version and instance types for each serverless job
B) Serverless compute supports setting any Spark configuration and custom init scripts
C) Serverless workloads always run on the latest runtime version, and compute is managed by Databricks
D) Serverless compute is available only in workspaces that use the legacy Hive metastore

> [!success]- Answer
> **Correct Answer: C**
>
> Serverless workloads always run on the latest runtime version, and compute is managed by Databricks.
>
> Serverless is versionless and Databricks-managed, so you don't pick runtimes or instance types. Only a short list of Spark properties can be set (for example `spark.sql.shuffle.partitions`), and dependencies are managed with environments. Workspaces without Unity Catalog must upgrade before they can use serverless ([Connect to serverless compute](https://docs.databricks.com/aws/en/compute/serverless/), [Spark configuration](https://docs.databricks.com/aws/en/spark/conf)).

---

**[↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 2: Data Ingestion and Loading →](./02-data-ingestion-and-loading.md)**
