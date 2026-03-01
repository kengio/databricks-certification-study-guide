---
title: "Practice Questions: Lakehouse Platform"
type: practice-questions
tags: [data-engineer-associate, practice-questions, lakehouse-platform]
---

# Domain 1: Databricks Lakehouse Platform

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

**[↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 2: ELT with Spark SQL and Python](./02-elt-spark-sql-python.md) →**
