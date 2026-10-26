---
title: Understanding of Databricks Data + AI Platform Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, platform, unity-catalog, catalog-explorer, marketplace]
---

# Understanding of Databricks Data + AI Platform Practice Questions

**Exam Weight: 11 %** — Section 1 of the October 2025 exam guide

The exam guide PDF calls this domain "Understanding of Databricks Data Intelligence Platform". The certification page now uses "Databricks Data + AI Platform", which is also the name in the current docs. Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026.

[← Previous: Genie](./04-genie-agents.md) | [↑ Back to Practice Questions](./README.md) | [Next: Managing Data](./06-managing-data.md)

---

## Question 1: Connecting a BI Tool *(Easy)*

A team uses Tableau and wants to query tables through a Databricks SQL warehouse. Which connection method should they use?

A) The Delta Lake Python library  
B) Direct access to the S3 bucket  
C) The JDBC or ODBC driver with the warehouse's connection details  
D) Polling a REST API every 5 minutes  

> [!success]- Answer
> **Correct Answer: C**
>
> BI tools connect to SQL warehouses through the Databricks JDBC and ODBC drivers. The connection uses the warehouse's server hostname and HTTP path plus an authentication method such as OAuth or a personal access token.
>
> Reading cloud storage directly bypasses Unity Catalog governance (B).

---

## Question 2: Partner Connect *(Easy)*

A team wants to connect a partner ingestion tool such as Fivetran to the workspace without setting up compute and credentials by hand. Which feature helps?

A) The Databricks REST API  
B) Delta Sharing  
C) Unity Catalog external locations  
D) Partner Connect  

> [!success]- Answer
> **Correct Answer: D**
>
> Partner Connect connects the workspace to selected partner solutions from the Databricks UI. It provisions the Databricks resources the partner needs, such as a SQL warehouse, a service principal, and a personal access token.
>
> Partner Connect requires the Premium plan or above.

---

## Question 3: Dropping Managed and External Tables *(Medium)*

An analyst drops a managed Delta table and then drops an external Delta table. What happens in each case?

A) Both drops delete the data files and the metadata  
B) Both drops delete only the metadata  
C) Managed: the data and the metadata are deleted. External: only the metadata is deleted, and the files stay in storage  
D) External: the data and the metadata are deleted. Managed: only the metadata is deleted  

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog manages the storage of a managed table, so dropping the table also deletes its data. An external table only points at files you manage, so dropping it removes the table definition and leaves the files.
>
> This is why `SHOW TABLES` can stop listing a dropped external table while its files are still in cloud storage.

---

## Question 4: Metastore vs Catalog *(Medium)*

In Unity Catalog, how are a metastore and a catalog related?

A) The metastore is the top-level container for a region; catalogs are objects inside it  
B) They are two names for the same object  
C) A catalog contains several metastores  
D) Each workspace has its own metastore, and catalogs exist at the account level  

> [!success]- Answer
> **Correct Answer: A**
>
> A metastore is the top-level container of Unity Catalog metadata, created at the account level for each region. Workspaces in that region are attached to it, and it holds the catalogs, which hold schemas, which hold tables, views, volumes, and functions.

---

## Question 5: External Table Files Deleted *(Hard)*

An external table points to `s3://company-data/raw/sales/`. A faulty pipeline deletes everything under that path. What happens when analysts query the table?

A) The query fails, because the files the table points to no longer exist  
B) The table returns the last results from the cache forever  
C) Delta Lake restores the files from the transaction log automatically  
D) Unity Catalog drops the table automatically  

> [!success]- Answer
> **Correct Answer: A**
>
> An external table's data lives only at its storage path. Unity Catalog keeps the table definition, but once the files are gone there is nothing to read, so queries fail.
>
> The transaction log records changes but does not hold copies of the data, so it cannot recreate deleted files (C). Unity Catalog does not drop tables by itself (D).

---

## Question 6: Which Component Does What? *(Easy)* *(2025 blueprint)*

Which platform component adds ACID transactions and time travel to data stored in cloud object storage?

A) Delta Lake  
B) Unity Catalog  
C) Lakeflow Jobs  
D) Databricks SQL  

> [!success]- Answer
> **Correct Answer: A**
>
> Delta Lake is the open table format that adds ACID transactions, table history, and time travel on top of Parquet files in cloud storage.
>
> Unity Catalog governs access, lineage, and discovery (B). Lakeflow Jobs orchestrates tasks on a schedule or trigger (C). Databricks SQL provides SQL warehouses, the SQL editor, dashboards, and alerts (D).

---

## Question 7: Delta Live Tables Today *(Medium)* *(2025 blueprint)*

The exam guide lists "Delta Live Tables" as a platform component. What is it called in the current documentation, and what does it do?

A) Lakeflow Jobs; it schedules notebooks  
B) Delta Sharing; it shares tables with partners  
C) Photon; it speeds up queries  
D) Lakeflow Spark Declarative Pipelines; you declare tables, materialized views, and streaming tables, and the pipeline manages dependencies, refreshes, and data quality  

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Live Tables (DLT) became Lakeflow Declarative Pipelines, and on November 12, 2025 it was renamed Lakeflow Spark Declarative Pipelines. The current docs also use the short form "Lakeflow pipelines". You declare what each dataset should contain, and the pipeline works out the order, refreshes, and expectations.
>
> On the exam, expect the older name. Lakeflow Jobs is the orchestrator (A).

---

## Question 8: Orchestrating Tasks *(Easy)* *(2025 blueprint)*

A team wants to run a SQL query, then a notebook, then a pipeline refresh every night in that order, with retries and notifications. Which component should they use?

A) Unity Catalog  
B) Lakeflow Jobs  
C) Databricks Marketplace  
D) Delta Lake  

> [!success]- Answer
> **Correct Answer: B**
>
> Lakeflow Jobs orchestrates tasks such as notebooks, SQL, pipelines, and Databricks SQL alerts, with schedules, dependencies, retries, and notifications.
>
> The other components store, govern, or share data. They do not schedule work.

---

## Question 9: The Data Intelligence Engine *(Medium)* *(2025 blueprint)*

The exam guide names a "Data Intelligence Engine" as a platform component. What does it refer to?

A) The query engine that replaces Spark  
B) A separate database for AI models  
C) The AI layer, which Databricks calls DatabricksIQ, that learns the semantics of an organisation's data and fuels the rest of the platform  
D) The billing engine for DBUs  

> [!success]- Answer
> **Correct Answer: C**
>
> When Databricks introduced the Data Intelligence Platform in November 2023, it described a Data Intelligence Engine called DatabricksIQ. It uses AI models to understand the semantics of enterprise data. For example, it generates descriptions and tags in Unity Catalog that make the whole platform aware of your jargon, acronyms, and metrics.
>
> Photon is the query engine (A), not the Data Intelligence Engine.

---

## Question 10: What "Certified" Means *(Easy)* *(2025 blueprint)*

In Catalog Explorer, a table shows a certified badge (a check mark). What does that tell an analyst?

A) The table has passed an automated data quality test  
B) The table has been flagged as a trusted, recommended asset with the `system.certification_status` tag set to `certified`  
C) The table is encrypted  
D) The table is read-only  

> [!success]- Answer
> **Correct Answer: B**
>
> Certification is a system-governed tag, `system.certification_status`, with the values `certified` and `deprecated`. Certified assets show a check mark, and deprecated assets show a restricted icon, so users can tell trusted data from data they should stop using.
>
> The badge is a governance label. It does not run tests, encrypt data, or change permissions.

---

## Question 11: Viewing Lineage *(Hard)* *(2025 blueprint)*

An analyst opens a table in Catalog Explorer and wants an interactive diagram of its upstream sources and downstream consumers. What should they do, and what privilege do they need?

A) Open the History tab; MODIFY on the table  
B) Run `DESCRIBE HISTORY`; ownership of the table  
C) Open the Lineage tab and click **See Lineage Graph**; at least BROWSE on the table's parent catalog  
D) Open the Permissions tab; MANAGE on the table  

> [!success]- Answer
> **Correct Answer: C**
>
> The Lineage tab lists related tables, notebooks, jobs, and dashboards, and **See Lineage Graph** opens the interactive graph. Viewing lineage requires at least the BROWSE privilege on the parent catalog. Seeing notebooks, jobs, or dashboards in the graph also requires workspace permissions on them.
>
> `DESCRIBE HISTORY` shows table versions, not lineage (B).

---

## Question 12: Role of Databricks Marketplace *(Easy)* *(2025 blueprint)*

What is Databricks Marketplace?

A) A store for buying more DBUs  
B) A library of Spark connectors  
C) A forum for certification questions  
D) An open exchange where providers publish data products such as datasets, AI models, notebooks, and apps that consumers can access from their workspace  

> [!success]- Answer
> **Correct Answer: D**
>
> Marketplace is an open exchange for data and AI products. Listings can be free or commercial, and public or private. Some are available as soon as you request them and accept the terms, while others need the provider's approval.
>
> Marketplace uses Delta Sharing (renamed OpenSharing on June 10, 2026) for secure exchange, so the data is not copied into your workspace.

---

## Question 13: Getting Marketplace Data *(Medium)* *(2025 blueprint)*

An analyst finds a free dataset in Databricks Marketplace that is available instantly. How do they start querying it?

A) Download CSV files and upload them through the UI  
B) Ask the provider to email credentials for their database  
C) Request access from Marketplace in their Databricks workspace; the dataset is then available as a catalog they can query  
D) Run `COPY INTO` from the provider's bucket  

> [!success]- Answer
> **Correct Answer: C**
>
> Requesting data products needs a Databricks workspace. Datasets are usually delivered as catalogs of tabular data, shared live with OpenSharing (formerly Delta Sharing), so there is no ingestion pipeline to build.
>
> Browsing the public Marketplace does not require a workspace, but getting the data does.

---

**[← Previous: Genie Practice Questions](./04-genie-agents.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Managing Data Practice Questions →](./06-managing-data.md)**
