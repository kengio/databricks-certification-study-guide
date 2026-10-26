---
title: Importing Data Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, importing-data, copy-into, auto-loader, delta-sharing, marketplace]
---

# Importing Data Practice Questions

**Exam Weight: 5 %** — Section 3 of the October 2025 exam guide

Every question here targets the October 2025 exam guide and is marked *(2025 blueprint)*. All questions were checked against the Databricks documentation on October 26, 2026. The exam says **Delta Sharing**; Databricks renamed it **OpenSharing** on June 10, 2026.

[← Previous: Securing Data](./07-securing-data.md) | [↑ Back to Practice Questions](./README.md) | [Next: Data Modeling with Databricks SQL](./09-data-modeling.md)

---

## Question 1: Uploading a Small File *(Easy)* *(2025 blueprint)*

An analyst has a 40 MB CSV file on their laptop and wants it as a table. Which path is quickest?

A) Write an Auto Loader stream  
B) **New** > **Add or upload data** > **Create or modify a table**, then upload the file  
C) Ask an admin to create an external location  
D) Use Lakehouse Federation  

> [!success]- Answer
> **Correct Answer: B**
>
> The file upload UI creates or overwrites a managed Delta table from small local files. It accepts CSV, TSV, JSON, Avro, Parquet, and text files, up to 10 files at a time with a combined size under 2 GB. It needs a running compute resource and permission to create tables in the target schema.
>
> Auto Loader and external locations are for files already in cloud storage (A, C). Federation queries external databases (D).

---

## Question 2: Files That Are Not Tables Yet *(Easy)* *(2025 blueprint)*

An analyst wants to upload a set of PDF and JSON files so a team can process them later. Where should they go?

A) Into a managed table, using the table upload UI  
B) Into the SQL editor  
C) Into a dashboard dataset  
D) Into a Unity Catalog volume, using **Upload files to a volume**  

> [!success]- Answer
> **Correct Answer: D**
>
> Volumes govern files of any format. The UI upload limit is 5 GB per file, and uploading requires `WRITE VOLUME` on the volume. Later, you can select files in the volume and click **Create table** to build a managed table from them.
>
> The table upload UI accepts only tabular formats (A).

---

## Question 3: Re-running a Load *(Easy)* *(2025 blueprint)*

A scheduled `COPY INTO` statement loads files from cloud storage into a Delta table. It runs again before any new files arrive. What happens?

A) Every file is loaded a second time  
B) The statement fails  
C) The table is truncated and reloaded  
D) Files that were already loaded are skipped, so no duplicates are created  

> [!success]- Answer
> **Correct Answer: D**
>
> `COPY INTO` is idempotent. It skips files in the source location that it has already loaded, so it is safe to schedule.
>
> `COPY_OPTIONS ('mergeSchema' = 'true')` lets the load evolve the table schema.

---

## Question 4: COPY INTO or Auto Loader? *(Medium)* *(2025 blueprint)*

A source bucket will receive millions of files over time, and their schema changes often. Which ingestion method does Databricks recommend?

A) `COPY INTO`  
B) The file upload UI  
C) `INSERT INTO ... VALUES`  
D) Auto Loader  

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks suggests `COPY INTO` for files in the thousands and Auto Loader for files in the millions or more. Auto Loader also handles frequently evolving schemas better. `COPY INTO` is easier when you need to reload a subset of re-uploaded files.

---

## Question 5: Auto Loader from SQL *(Medium)* *(2025 blueprint)*

A SQL-only analyst wants new JSON files from a volume loaded incrementally into a table every hour. Which statement uses Auto Loader?

A) `CREATE VIEW events AS SELECT * FROM json.'/Volumes/main/raw/events'`  
B) `CREATE TABLE events AS SELECT * FROM read_files('/Volumes/main/raw/events')`, re-run each hour  
C) `CREATE OR REFRESH STREAMING TABLE events SCHEDULE EVERY 1 hour AS SELECT * FROM STREAM read_files('/Volumes/main/raw/events', format => 'json')`  
D) `COPY events FROM '/Volumes/main/raw/events'`  

> [!success]- Answer
> **Correct Answer: C**
>
> In a streaming table, `STREAM read_files(...)` uses Auto Loader, so each refresh processes only new files. `SCHEDULE EVERY` sets the refresh schedule.
>
> Re-running a plain CTAS rereads and rewrites everything each time (B). Option D is not valid syntax.

---

## Question 6: Auto Loader Guarantees *(Medium)* *(2025 blueprint)*

Why can Auto Loader resume after a failure without loading files twice?

A) It deletes source files after reading them  
B) It records discovered files in its checkpoint, which ensures each file is processed exactly once  
C) It reloads the whole directory each time and removes duplicates  
D) It loads only files whose names contain a date  

> [!success]- Answer
> **Correct Answer: B**
>
> Auto Loader (the `cloudFiles` source) stores discovered file metadata in a key-value store in its checkpoint location. That ensures exactly-once processing, and after a failure it resumes from the checkpoint.
>
> It can also detect schema changes and rescue unexpected data instead of losing it. It never deletes source files (A).

---

## Question 7: Sharing with a Partner That Does Not Use Databricks *(Medium)* *(2025 blueprint)*

A company must give a partner live, read-only access to three tables. The partner does not use Databricks. What should the company use?

A) Lakehouse Federation  
B) Delta Sharing (now OpenSharing) with the open sharing protocol  
C) A weekly CSV export by email  
D) Partner Connect  

> [!success]- Answer
> **Correct Answer: B**
>
> With OpenSharing (formerly Delta Sharing), a provider shares tables in a read-only share. The Databricks-to-Open protocol serves recipients on any platform, authenticated with bearer tokens or OIDC federation. Data is not replicated, so recipients see updates in near real time.
>
> Lakehouse Federation is for reading external databases into Databricks, not for sharing out (A).

---

## Question 8: Receiving a Share *(Hard)* *(2025 blueprint)*

Another Databricks customer shares tables with your account through Databricks-to-Databricks sharing. How do your analysts start querying them?

A) Run `COPY INTO` from the provider's storage  
B) Ask the provider for a JDBC URL  
C) A user with `CREATE CATALOG` and `USE PROVIDER` (or a metastore admin) creates a catalog from the share, then grants access to the analysts  
D) Upload the provider's files through the UI  

> [!success]- Answer
> **Correct Answer: C**
>
> A recipient creates a catalog from the share in Catalog Explorer, with the CLI, or with SQL. Data in a shared catalog is read-only, and you cannot grant write privileges on it.
>
> Shared data updates in near real time, so no copy or upload is needed (A, D).

---

## Question 9: Pushing Events Through an API *(Medium)* *(2025 blueprint)*

An application team wants to push event records from their service straight into a Unity Catalog Delta table over an API, without running a message bus. Which Databricks capability is built for this?

A) The file upload UI  
B) Zerobus Ingest  
C) Lakehouse Federation  
D) Databricks Marketplace  

> [!success]- Answer
> **Correct Answer: B**
>
> Zerobus Ingest, part of Lakeflow Connect, is a push-based streaming API that writes records directly into Unity Catalog managed Delta tables. Clients use SDKs over gRPC, a REST API, or other supported protocols.
>
> The upload UI is for manual files (A), and federation reads external databases (C).

---

## Question 10: Getting Third-Party Data *(Easy)* *(2025 blueprint)*

An analyst needs a public weather dataset to enrich sales data, without building an ingestion pipeline. Where should they look first?

A) Partner Connect  
B) The query history  
C) Databricks Marketplace  
D) Auto Loader  

> [!success]- Answer
> **Correct Answer: C**
>
> Marketplace lists free and commercial data products from providers. Datasets usually arrive as catalogs of tabular data shared with OpenSharing (formerly Delta Sharing), so there is nothing to copy or schedule.

---

## Question 11: Reading Files from S3 with Governance *(Hard)* *(2025 blueprint)*

An analyst wants to load CSV files from `s3://acme-raw/orders/` with `COPY INTO`, governed by Unity Catalog. What must exist first?

A) Nothing, any S3 path can be read by any user  
B) A Lakehouse Federation connection to S3  
C) A Unity Catalog external location (or an external volume) that covers the path, with privileges granted to the analyst  
D) A Marketplace listing  

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog governs access to cloud storage through external locations, which pair a path with a storage credential, and through volumes. `COPY INTO` can load from S3, ADLS, GCS, or Unity Catalog volumes.
>
> Lakehouse Federation connects to external databases and catalogs, not to raw file paths (B).

---

**[← Previous: Securing Data Practice Questions](./07-securing-data.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Data Modeling with Databricks SQL Practice Questions →](./09-data-modeling.md)**
