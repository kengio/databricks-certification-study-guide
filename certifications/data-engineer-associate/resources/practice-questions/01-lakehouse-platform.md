# Domain 1: Databricks Lakehouse Platform

## Question 1: Lakehouse as a Unified Source of Truth

**Question**: A leader in data organization is frustrated because the reports from the data analysis team differ from those of the data engineering team. How might a data lakehouse resolve this issue?

> [!success]- Answer
> Both teams would utilize the same source of truth for their tasks.
>
> A data lakehouse provides a single, unified platform where all teams access the same underlying data, eliminating discrepancies caused by siloed data systems or separate copies of data maintained by different teams.

---

## Question 2: Control Plane Components

**Question**: Which option is entirely hosted within the control plane of the classic Databricks architecture?

> [!success]- Answer
> The Databricks web application.
>
> The control plane hosts the Databricks web UI, REST APIs, notebook server, and cluster manager — all infrastructure managed by Databricks. Worker nodes and driver nodes reside in the customer's data plane (their cloud account).

---

## Question 3: Delta Lake Advantage for Workloads

**Question**: Which of the following advantages associated with the Databricks Lakehouse Platform is offered by Delta Lake?

> [!success]- Answer
> The ability to support both batch and streaming workloads.
>
> Delta Lake's transaction log and Structured Streaming integration allow the same Delta tables to be read and written by both batch jobs and streaming pipelines, eliminating the need for separate storage systems for each workload type.

---

## Question 4: Delta Table Storage Organization

**Question**: What describes how a Delta table is organized for storage?

> [!success]- Answer
> Delta tables are stored in a collection of files that contain data, history, metadata, and other attributes.
>
> Data is stored in Parquet files, and the `_delta_log` directory contains JSON transaction log files and checkpoint files that track all changes, schema, and table properties.

---

## Question 5: VACUUM and Time Travel

**Question**: A data engineer discovered an error while updating a table daily and needs to use Delta time travel to revert the table to a version from three days ago. However, when they try to access the older version, the data files are absent. What explains the absence of the data files?

> [!success]- Answer
> The VACUUM command was run on the table.
>
> `VACUUM` permanently deletes data files that are outside the retention threshold (default 7 days). Once vacuumed, older versions cannot be restored via time travel because the underlying Parquet files no longer exist.

---

## Question 6: Data Quality Feature of a Lakehouse

**Question**: Which feature of a data lakehouse enhances data quality compared to a traditional data lake?

> [!success]- Answer
> A data lakehouse supports ACID-compliant transactions.
>
> Traditional data lakes lack transactional guarantees, which can lead to partial writes, inconsistent reads, and data corruption. ACID transactions in Delta Lake ensure atomicity, consistency, isolation, and durability for all operations.

---

## Question 7: Gold vs Silver Table Relationship

**Question**: What best explains the connection between Gold tables and Silver tables?

> [!success]- Answer
> Gold tables are more likely to contain aggregations than Silver tables.
>
> Gold tables represent business-level aggregates and metrics built for consumption in dashboards and reports. Silver tables contain cleaned and enriched data, but are typically at row-level granularity without the summarizations found in Gold.

---

## Question 8: Bronze vs Raw Data Relationship

**Question**: What characterizes the connection between Bronze tables and raw data?

> [!success]- Answer
> Bronze tables contain raw data with a schema applied.
>
> Bronze is the first layer in the medallion architecture. Data is ingested from source systems with minimal transformation, but is captured in a structured Delta table format with metadata columns added (e.g., ingestion timestamp, source file).

---

## Question 9: Open-Source Technology Advantage

**Question**: What is one advantage of the Databricks Lakehouse Platform utilizing open-source technologies?

> [!success]- Answer
> Avoiding vendor lock-in.
>
> By building on open standards and formats — Delta Lake (open format), Apache Spark, MLflow — organizations retain the ability to move data and workloads across clouds and platforms without being tied to proprietary, closed formats.

---

## Question 10: Delta Lake Underlying File Format

**Question**: Which file formats are primarily used to store data from Delta Lake tables?

> [!success]- Answer
> Parquet.
>
> Delta Lake stores all data in Parquet files, an open columnar format that provides efficient compression and predicate pushdown. The `_delta_log` directory stores transaction metadata as JSON and Parquet checkpoint files, but data itself is always Parquet.

---

## Question 11: Customer Cloud Account Contents

**Question**: What is stored in the cloud account of the Databricks customer?

> [!success]- Answer
> Data.
>
> The customer's cloud account (AWS S3, Azure ADLS, GCP GCS) stores the actual data files. Databricks infrastructure — including the web application, cluster management metadata, repos, and notebooks — is managed in the Databricks-controlled plane, not the customer's account.

---

## Question 12: Streamlining Data Architectures

**Question**: What methods can help streamline and integrate distinct data architectures tailored for particular applications?

> [!success]- Answer
> A data lakehouse.
>
> The lakehouse architecture unifies the flexibility of a data lake (support for unstructured data, low-cost storage, ML workloads) with the reliability and governance of a data warehouse (ACID transactions, SQL support, schema enforcement) into a single platform.

---

**[↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 2: ELT with Spark SQL and Python](./02-elt-spark-sql-python.md) →**
