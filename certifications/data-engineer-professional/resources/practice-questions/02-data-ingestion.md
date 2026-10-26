---
title: "Practice Questions: Data Ingestion & Acquisition"
type: practice-questions
tags: [data-engineer-professional, practice-questions, data-ingestion]
---

# Section 2: Data Ingestion & Acquisition (12 %)

Practice questions for Section 2 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 2 folder](../../02-data-ingestion-and-acquisition/README.md).

---

## Question 1: Auto Loader Schema Evolution

**Question** *(Easy)*: A data engineering team ingests JSON files from cloud storage using Auto Loader. New fields are occasionally added to the source data. Which configuration ensures new columns are automatically added to the target table schema?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`  
B) `cloudFiles.schemaEvolutionMode = "rescue"`  
C) `cloudFiles.inferColumnTypes = "true"`  
D) `cloudFiles.mergeSchema = "true"`  

> [!success]- Answer
> **Correct Answer: A**
>
> `schemaEvolutionMode = "addNewColumns"` automatically adds new columns to the schema. Option B rescues unexpected data to a separate column. Option C enables type inference but not schema evolution. Option D is not a valid Auto Loader option (that's for Delta writes).

---

## Question 2: OpenSharing

**Question** *(Easy)*: A company needs to share data with an external partner who uses Snowflake. Which statement about OpenSharing is correct?

A) The recipient must have a Databricks workspace  
B) The recipient can read shared data using any OpenSharing client  
C) Data is physically copied to the recipient's storage  
D) OpenSharing only works within the same cloud provider  

> [!success]- Answer
> **Correct Answer: B**
>
> OpenSharing is an open protocol. Recipients can use any compatible client (Spark, pandas, Power BI, Snowflake, etc.) without needing Databricks. Data is read in place, not copied. It works across cloud providers.

---

## Question 3: Iceberg Readers for a CDC Target *(2026 blueprint)*

**Question** *(Hard)*: An AUTO CDC flow in a Lakeflow pipeline maintains an SCD Type 1 streaming table. An external engine using an Iceberg v3 REST catalog client must read this table with read-after-write freshness and **without** a separate data copy. What should the engineer do?

A) Add the table properties `delta.columnMapping.mode = 'name'`, `delta.enableRowTracking = 'true'`, `delta.enableIcebergCompatV3 = 'true'`, `delta.universalFormat.enabledFormats = 'iceberg'`, and `pipelines.externalMetadata.enabled = 'true'` to the streaming table, then run the pipeline  
B) Declare the target as `CREATE OR REFRESH STREAMING TABLE ... USING ICEBERG`  
C) Set `delta.enableIcebergCompatV2 = 'true'` on the streaming table  
D) Enable compatibility mode for the streaming table  

> [!success]- Answer
> **Correct Answer: A**
>
> External data access with UniForm Iceberg v3 properties publishes Iceberg metadata for pipeline datasets without copying data.
>
> B is wrong because for pipeline streaming tables the only `USING` option is `DELTA`. C is wrong because Iceberg reads with IcebergCompatV2 cannot be enabled on streaming tables or materialized views. D is wrong because compatibility mode creates a copy that refreshes on a schedule (hourly by default), which breaks both requirements.

---

## Question 4: Managed Iceberg Gold Object *(2026 blueprint)*

**Question** *(Medium)*: In a Lakeflow pipeline, a gold aggregate computed from a CDC-maintained silver table must be created as an object that external Iceberg readers can read. The workspace has the managed Iceberg materialized view preview enabled. Which definition fits?

A) `STORED AS ICEBERG` added to the AUTO CDC flow that writes the silver table  
B) A sink created with `dp.create_sink` using an Iceberg format  
C) `CREATE OR REFRESH MATERIALIZED VIEW gold_summary USING ICEBERG AS SELECT ...`, followed by `REPAIR TABLE gold_summary SYNC METADATA`  
D) Legacy change data feed on the silver table so Iceberg readers can consume its changes  

> [!success]- Answer
> **Correct Answer: C**
>
> Materialized views accept `USING ICEBERG` (managed Iceberg MVs, Public Preview); after creation you run `REPAIR TABLE ... SYNC METADATA`.
>
> A is wrong because `STORED AS` only accepts `SCD TYPE 1`, `SCD TYPE 2`, or `BITEMPORAL`. B is wrong because pipeline sinks support Delta, Kafka, Event Hubs, and custom Python data sources, not Iceberg. D is wrong because legacy CDF supports only Delta tables, and change data feed is not part of the Iceberg spec.

---

## Question 5: Kafka Starting Offsets *(2026 blueprint)*

**Question** *(Medium)*: A new Structured Streaming query reads an existing Kafka topic with `spark.readStream.format("kafka")` and writes to a Delta table, but the first run ingests none of the messages already in the topic. The engineer then sets `startingOffsets` to `earliest` and restarts the query with the same checkpoint, yet historical messages are still missing. What explains both behaviors?

A) Kafka streaming reads default to `earliest`, so the topic must have been compacted  
B) Streaming reads default to `latest`, and `startingOffsets` only applies when a query starts with a new checkpoint  
C) `startingOffsets` is ignored unless `maxOffsetsPerTrigger` is also set  
D) Delta sinks discard records older than the table's creation time  

> [!success]- Answer
> **Correct Answer: B**
>
> Kafka streaming reads default to `startingOffsets = latest`, and the option is honored only for a new query, not one resuming from a checkpoint.
>
> The Spark options reference states the default is `latest` for streaming (`earliest` for batch) and that resumed queries always use the checkpoint, so a fresh checkpoint location is needed. A is wrong because the streaming default is `latest`. C is wrong because `maxOffsetsPerTrigger` only caps batch size. D is wrong because Delta sinks have no such filter.

---

## Question 6: Binary Files with Auto Loader *(2026 blueprint)*

**Question** *(Easy)*: A team must incrementally ingest PNG images that land in a Unity Catalog volume alongside other file types, storing each image's path, size, and raw bytes in a Delta table. Which configuration fits?

A) Auto Loader with `cloudFiles.format` set to `binaryFile` and `pathGlobFilter` set to `*.png`  
B) Auto Loader with `cloudFiles.format` set to `parquet` and `cloudFiles.inferColumnTypes` set to `true`  
C) `spark.readStream.format("delta")` pointed at the volume path  
D) `COPY INTO` with `FILEFORMAT = ICEBERG`  

> [!success]- Answer
> **Correct Answer: A**
>
> Auto Loader supports `binaryFile`, which returns `path`, `modificationTime`, `length`, and `content` per file, and `pathGlobFilter` selects the suffix.
>
> The Auto Loader patterns docs show exactly this `binaryFile` + `pathGlobFilter` combination because the path is only a prefix filter. B is wrong because images are not Parquet. C is wrong because the volume contains raw files, not a Delta table. D is wrong because Iceberg is a table format, not a file format for `COPY INTO`.

---

## Question 7: Choosing a CDC Ingestion Approach *(2026 blueprint)*

**Question** *(Medium)*: An operational SQL Server database must be continuously replicated into Unity Catalog, including updates and deletes, with minimal custom code and full row history kept for a customer dimension table. Which approach meets the requirement?

A) A nightly JDBC full-table read that overwrites the target table  
B) A Lakehouse Federation foreign catalog queried by a materialized view  
C) A Lakeflow Connect SQL Server connector with CDC enabled on the source table and `scd_type` set to `SCD_TYPE_2`  
D) A Lakeflow Connect SQL Server connector using change tracking with `scd_type` set to `SCD_TYPE_2`  

> [!success]- Answer
> **Correct Answer: C**
>
> The managed SQL Server connector with source CDC enabled and `SCD_TYPE_2` replicates changes continuously and keeps history.
>
> Lakeflow Connect docs note that SCD type 2 requires CDC on the source and that change tracking does not support `SCD_TYPE_2`, which rules out D. A misses changes between runs and keeps no history. B queries the source live without replicating changes or history.

---

## Question 8: Ingestion Gateway Behavior *(2026 blueprint)*

**Question** *(Hard)*: A team uses a gateway-based Lakeflow Connect PostgreSQL pipeline. To save money, an engineer stops the ingestion gateway each night and restarts it in the morning, while the ingestion pipeline runs hourly on serverless. What is the main risk?

A) The serverless ingestion pipeline cannot start while the gateway is stopped  
B) Changes can be lost to source log retention, forcing a full refresh of affected tables  
C) The staging volume is deleted whenever the gateway stops  
D) The destination streaming tables lose their change data feed  

> [!success]- Answer
> **Correct Answer: B**
>
> The gateway must run continuously to capture changes before the source truncates its change logs; stopping it can drop changes and require full refreshes.
>
> The docs warn not to stop the gateway, which runs on classic compute as a continuous pipeline. A is wrong because the ingestion pipeline can run on its own schedule from staging data. C is wrong because staged data is purged after 30 days, not on stop. D is wrong because CDF is enabled on all target tables regardless.

---

## Question 9: D2D Recipient Setup *(2026 blueprint)*

**Question** *(Medium)*: A provider wants to share curated tables, a Unity Catalog volume, and a notebook with a partner whose Databricks workspace is enabled for Unity Catalog in another account, without managing any tokens. What should the provider do?

A) Run `CREATE RECIPIENT partner USING ID '<cloud>:<region>:<uuid>'` with the partner's sharing identifier, then `GRANT SELECT ON SHARE s TO RECIPIENT partner`  
B) Run `CREATE RECIPIENT partner` and send the activation link for the credential file  
C) Grant `USE CATALOG` on the source catalog directly to the partner's account users  
D) Create an OIDC federation recipient and share the volume through an Iceberg REST client  

> [!success]- Answer
> **Correct Answer: A**
>
> A Databricks-to-Databricks recipient identified by the partner metastore's sharing identifier needs no tokens and supports volumes and notebooks.
>
> The OpenSharing docs say D2D supports notebook, volume, and model sharing, which Databricks-to-Open does not. B creates a token-based Databricks-to-Open recipient that cannot receive volumes or notebooks. C does not work across metastores in different accounts. D is a Databricks-to-Open method and still cannot carry volumes.

---

## Question 10: Sharing a Table Subset *(2026 blueprint)*

**Question** *(Medium)*: A provider has one share for many regional partners and wants each recipient to see only rows for its own country from a partitioned table, without creating a separate share per partner. Which approach works?

A) `ALTER SHARE s ADD TABLE t WITH PARTITION (country = 'US')` for each partner  
B) Set a `country` recipient property and add the table with `PARTITION (country = CURRENT_RECIPIENT().country)`  
C) Add row filters to the source table and share it directly  
D) Share the table `WITHOUT HISTORY` so recipients only see current rows  

> [!success]- Answer
> **Correct Answer: B**
>
> Recipient properties referenced with `CURRENT_RECIPIENT()` in the partition spec let one share filter partitions per recipient.
>
> The `ALTER SHARE` reference documents `PARTITION (column = CURRENT_RECIPIENT().<property-key>)`. A uses invalid `WITH PARTITION` syntax and still needs per-partner shares. C fails because tables with row filters or column masks cannot be shared. D controls history, not row visibility.

---

## Question 11: Clean Room vs Share *(2026 blueprint)*

**Question** *(Medium)*: An advertiser and a publisher, both on Databricks with Unity Catalog, want to compute audience overlap on hashed emails. Neither may see the other's rows, and both want to review any code before it touches their data. What should they use?

A) A Databricks-to-Databricks OpenSharing share in each direction  
B) A Databricks clean room with notebooks approved by the other collaborator and run by a designated runner  
C) Lakehouse Federation from each workspace into the other  
D) A Databricks Marketplace private exchange  

> [!success]- Answer
> **Correct Answer: B**
>
> Clean Rooms share data only into a central clean room, expose only metadata to collaborators, and run only notebooks approved by every other collaborator.
>
> The Clean Rooms docs describe this no-trust model. A gives each recipient read access to the other's rows. C also exposes the data for direct querying. D distributes data products and gives no code approval or row protection.

---

## Question 12: Clean Room Output *(2026 blueprint)*

**Question** *(Hard)*: In an approval-based clean room, a notebook run writes results with `cr_output_catalog` and `cr_output_schema`. The other collaborator complains they cannot read the results. What explains this, and what fixes it for future runs?

A) Output tables are readable only by the runner by default; create a new clean room with shared output enabled and write to `cr_shared_output_schema`  
B) Output tables expire after one hour; rerun the notebook more often  
C) The collaborator lacks `MODIFY CLEAN ROOM`; grant it on the clean room  
D) Output tables are views; convert them to tables with `CREATE TABLE AS SELECT`  

> [!success]- Answer
> **Correct Answer: A**
>
> By default only the runner can read output tables; shared output, set when the clean room is created, lets all collaborators read tables in `cr_shared_output_schema`.
>
> The output-tables docs state shared output can't be changed after creation, so a new clean room is required. B is wrong because outputs are kept 30 days. C is wrong because `MODIFY CLEAN ROOM` manages assets, not output access. D is wrong because only tables are supported as output.

---

## Question 13: Federation Privileges *(2026 blueprint)*

**Question** *(Medium)*: An admin created a Unity Catalog connection to a PostgreSQL database with credentials stored through `secret()`. A data engineer must now create a foreign catalog from it, and analysts must only query one table. Which grants are needed?

A) Engineer: `USE CONNECTION` on the connection; analysts: the PostgreSQL password  
B) Engineer: `CREATE CATALOG` on the metastore and `CREATE FOREIGN CATALOG` on the connection; analysts: `USE CATALOG`, `USE SCHEMA`, and `SELECT` on the foreign objects  
C) Engineer: `CREATE CONNECTION` on the metastore; analysts: `USE CONNECTION` on the connection  
D) Engineer: `ALL PRIVILEGES` on the metastore; analysts: `BROWSE` on the connection  

> [!success]- Answer
> **Correct Answer: B**
>
> Creating a foreign catalog requires `CREATE CATALOG` on the metastore plus `CREATE FOREIGN CATALOG` on the connection, and readers need normal UC data privileges.
>
> Query federation docs list these requirements, and credentials come from the connection so readers never need them. A exposes credentials and `USE CONNECTION` doesn't allow catalog creation. C's `CREATE CONNECTION` creates connections, not catalogs, and `USE CONNECTION` doesn't grant table reads. D over-grants and `BROWSE` doesn't allow querying.

---

## Question 14: Query vs Catalog Federation *(2026 blueprint)*

**Question** *(Medium)*: A company is migrating tables registered in AWS Glue to Unity Catalog incrementally. During the migration, users must query Glue tables through Unity Catalog with UC access control, running only on Databricks compute and reading files directly from S3. Which approach fits?

A) Query federation over JDBC to Glue  
B) Catalog federation with a Glue connection, external locations, and a foreign catalog with authorized paths  
C) A Lakeflow Connect database connector for Glue  
D) An OpenSharing share from Glue  

> [!success]- Answer
> **Correct Answer: B**
>
> Catalog federation reads foreign tables directly from object storage on Databricks compute and is documented for Glue-based incremental migrations.
>
> Setup needs a connection, external locations for the table paths, and a foreign catalog with authorized paths. A describes query federation, which pushes SQL to a database engine and doesn't apply to Glue. C is wrong because Lakeflow Connect database connectors read relational change logs. D is wrong because Glue is not an OpenSharing provider.

---

**[← Previous: Developing Code for Data Processing using Python and SQL](./01-developing-code.md) | [↑ Back to Practice Questions](./README.md) | [Next: Data Manipulation →](./03-data-manipulation.md)**
