---
tags: [glossary, reference, data-engineering]
---

# Glossary

## A

| Term           | Definition                                                              |
| -------------- | ----------------------------------------------------------------------- |
| **ACID**       | Atomicity, Consistency, Isolation, Durability - database transaction properties |
| **AQE**        | Adaptive Query Execution - Spark's runtime query optimization           |
| **Auto Loader**| Databricks feature for incrementally ingesting files from cloud storage |
| **Auto Optimize**| Automatic file compaction after writes to Delta tables                |

## B

| Term              | Definition                                                  |
| ----------------- | ----------------------------------------------------------- |
| **Broadcast Join**| Join strategy where small table is sent to all executors    |
| **Bronze Layer**  | First layer in medallion architecture; raw, unprocessed data|

## C

| Term              | Definition                                                        |
| ----------------- | ----------------------------------------------------------------- |
| **Catalog**       | Top-level container in Unity Catalog hierarchy                    |
| **Control Plane** | Databricks-managed layer handling web UI, APIs, and orchestration |
| **CDC**           | Change Data Capture - tracking and processing data changes        |
| **CDF**           | Change Data Feed - Delta Lake feature to track row-level changes  |
| **Checkpoint**    | Persistent state for streaming jobs to enable recovery            |
| **Clone**         | Copy of a Delta table (shallow or deep)                           |
| **Cluster**       | Group of compute resources for running Spark workloads            |

## D

| Term            | Definition                                                                              |
| --------------- | --------------------------------------------------------------------------------------- |
| **DAB**         | Databricks Asset Bundles - CI/CD deployment tool                                        |
| **Data Plane**  | Compute layer where clusters run and data is processed (in customer or Databricks cloud)|
| **DBFS**        | Databricks File System - distributed file system abstraction                            |
| **Delta Lake**  | Open-source storage layer providing ACID transactions                                   |
| **Delta Sharing**| Open protocol for secure data sharing                                                  |
| **DLT**         | Delta Live Tables - declarative ETL framework (now Lakeflow)                            |
| **Driver**      | Central coordinator in a Spark application                                              |

## E

| Term            | Definition                                                  |
| --------------- | ----------------------------------------------------------- |
| **Executor**    | Worker process that runs Spark tasks                        |
| **Expectations**| Data quality rules in Lakeflow/DLT pipelines                |
| **External Table**| Table where data is stored outside Unity Catalog management |

## F

| Term                   | Definition                                                  |
| ---------------------- | ----------------------------------------------------------- |
| **File Notification Mode**| Auto Loader mode using cloud events for new file detection |

## G

| Term            | Definition                                                  |
| --------------- | ----------------------------------------------------------- |
| **Git Folders** | Databricks feature for Git repository integration           |
| **Gold Layer**  | Final layer in medallion architecture; business-ready aggregates|

## I

| Term            | Definition                                                  |
| --------------- | ----------------------------------------------------------- |
| **Idempotent**  | Operation that produces same result regardless of repetition|
| **Instance Pool**| Pre-allocated VM instances for faster cluster startup      |

## J

| Term          | Definition                                              |
| ------------- | ------------------------------------------------------- |
| **Job Cluster**| Cluster created for and terminated after a specific job |

## L

| Term              | Definition                                                          |
| ----------------- | ------------------------------------------------------------------- |
| **Lakeflow**      | Databricks platform for building data pipelines (includes DLT)      |
| **Lakehouse**     | Architecture combining data lake and data warehouse benefits        |
| **Liquid Clustering**| Delta Lake feature for automatic data organization (replaces ZORDER)|

## M

| Term                   | Definition                                              |
| ---------------------- | ------------------------------------------------------- |
| **Managed Table**      | Table where data lifecycle is managed by Unity Catalog  |
| **Materialized View**  | Pre-computed query results stored as a table            |
| **Medallion Architecture**| Data organization pattern with Bronze/Silver/Gold layers|
| **MERGE**              | SQL operation combining INSERT, UPDATE, DELETE          |
| **Metastore**          | Top-level container in Unity Catalog for metadata       |
| **Micro-batch**        | Default Spark Streaming processing model                |

## O

| Term           | Definition                                          |
| -------------- | --------------------------------------------------- |
| **OPTIMIZE**   | Delta Lake command to compact small files           |
| **Output Mode**| Streaming write behavior (append, complete, update) |

## P

| Term              | Definition                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| **Partition**     | Logical division of data for parallel processing                        |
| **Partition Pruning**| Query optimization skipping irrelevant partitions                    |
| **Photon**        | Databricks vectorized query engine                                      |
| **Private Link**  | Cloud service for private network connectivity to Databricks (AWS/Azure)|

## R

| Term        | Definition                                        |
| ----------- | ------------------------------------------------- |
| **REST API**| HTTP interface for programmatic Databricks access |

## S

| Term                 | Definition                                                          |
| -------------------- | ------------------------------------------------------------------- |
| **SCD**              | Slowly Changing Dimension - data modeling pattern                   |
| **SCC**              | Secure Cluster Connectivity - clusters with no public IP addresses  |
| **Schema**           | Structure definition for data (also: database in UC)                |
| **Schema Evolution** | Automatic handling of schema changes over time                      |
| **Schema Inference** | Automatic detection of data structure                               |
| **Secret Scope**     | Secure storage for credentials and secrets                          |
| **Serverless**       | Compute resources managed by Databricks                             |
| **Shuffle**          | Data redistribution across partitions                               |
| **Silver Layer**     | Middle layer in medallion architecture; cleaned data                |
| **Spark UI**         | Web interface for monitoring Spark applications                     |
| **Spill**            | Data written to disk when memory is insufficient                    |
| **Streaming Table**  | DLT table type for incremental processing                           |
| **Structured Streaming**| Spark's stream processing API                                    |

## T

| Term             | Definition                                      |
| ---------------- | ----------------------------------------------- |
| **Time Travel**  | Delta Lake feature to query historical versions |
| **Transaction Log**| Record of all changes to a Delta table        |
| **Trigger**      | Defines when streaming batches are processed    |

## U

| Term            | Definition                                |
| --------------- | ----------------------------------------- |
| **Unity Catalog**| Databricks' unified governance solution  |
| **Upsert**      | Combined INSERT and UPDATE operation      |

## V

| Term       | Definition                                          |
| ---------- | --------------------------------------------------- |
| **VACUUM** | Delta Lake command to remove old data files         |
| **Volume** | Unity Catalog object for managing non-tabular files |

## W

| Term             | Definition                                   |
| ---------------- | -------------------------------------------- |
| **Watermark**    | Threshold for handling late data in streaming|
| **Widget**       | Notebook parameter input element             |
| **Window Function**| SQL function operating over row partitions |
| **Workspace**    | Databricks environment for notebooks and jobs|

## Z

| Term       | Definition                                          |
| ---------- | --------------------------------------------------- |
| **ZORDER** | Delta Lake data organization for query optimization |
