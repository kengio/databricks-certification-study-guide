---
tags: [interview-prep, system-design]
---

# Interview Questions — System Design

---

## Question 1: High-Volume IoT Ingestion Pipeline

**Level**: Both
**Type**: System Design

**Scenario / Question**:
Your team needs to ingest 10TB of raw IoT sensor data per day from thousands of devices into a Databricks lakehouse. Devices emit JSON events in real time via a message queue. Walk me through how you would design this end-to-end pipeline.

> [!success]- Answer Framework
>
> **Short Answer**: Stream IoT events from Kafka using Structured Streaming into an append-only Bronze Delta table (raw JSON + metadata columns), parse and deduplicate in Silver with watermarking for late data, then pre-aggregate device metrics in Gold; use checkpointing for fault tolerance and `autoCompact`/`optimizeWrite` to prevent small file accumulation.
>
> ### Key Points to Cover
>
> - Ingest from Kafka/Event Hubs using Structured Streaming into Bronze
> - Store raw JSON in Bronze (append-only, schema-on-read) with metadata columns
> - Auto Loader or Spark Structured Streaming for incremental ingestion
> - Silver layer: parse, validate, deduplicate with watermarking for late data
> - Gold layer: device aggregations, alerts, time-series summaries
> - Checkpointing for fault tolerance; OPTIMIZE + auto-compact for streaming tables
>
> ### Example Answer
>
> I'd implement this as a three-layer medallion pipeline. At the **Bronze** layer, I'd use Structured Streaming to consume from Kafka with `readStream.format("kafka")`, writing raw JSON as a string column into a Delta table. I'd add metadata columns like `_ingestion_timestamp`, `_kafka_partition`, and `_kafka_offset` at this stage. Bronze is append-only — we never modify raw data.
>
> ```python
> bronze_stream = (spark.readStream
>     .format("kafka")
>     .option("kafka.bootstrap.servers", "broker:9092")
>     .option("subscribe", "iot-events")
>     .load()
>     .select(
>         col("value").cast("string").alias("raw_json"),
>         col("timestamp").alias("_kafka_timestamp"),
>         col("partition").alias("_kafka_partition"),
>         col("offset").alias("_kafka_offset"),
>         current_timestamp().alias("_ingestion_timestamp")
>     )
>     .writeStream
>     .format("delta")
>     .outputMode("append")
>     .option("checkpointLocation", "/checkpoints/bronze/iot")
>     .trigger(processingTime="1 minute")
>     .toTable("bronze.iot_events"))
> ```
>
> At the **Silver** layer, I'd read from Bronze, parse the JSON schema (using `from_json`), deduplicate on `device_id + event_time`, cast types, and apply watermarking for late data (e.g., 2 hours). This layer writes via MERGE to handle exactly-once semantics.
>
> At the **Gold** layer, I'd pre-aggregate device metrics by hour — rolling averages, anomaly flags, device health KPIs — optimized for dashboard queries and ML feature ingestion.
>
> For operations: I'd enable `autoCompact` and `optimizeWrite` on streaming tables to avoid small file problems, set up checkpoints for recovery, and configure dead-letter queues for malformed records.
>
> ### Follow-up Questions
>
> - How would you handle devices that occasionally send duplicate events?
> - Your IoT stream suddenly spikes to 5x normal volume. What fails first and how do you handle it?
> - How would you monitor the pipeline's health and detect data freshness issues?
> - What checkpointing strategy ensures your Silver stream recovers cleanly after a 6-hour outage?

---

## Question 2: CDC Pipeline from Transactional Database

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
You need to replicate changes from a PostgreSQL OLTP database (orders table, ~100M rows, high write throughput) into a Databricks Delta lakehouse in near-real time. How would you architect this?

> [!success]- Answer Framework
>
> **Short Answer**: Use Debezium to read PostgreSQL's WAL into Kafka, store raw CDC events in an append-only Bronze table as your audit log, then apply `APPLY CHANGES INTO` (DLT) or a manual MERGE in Silver to maintain current row state; handle deletes explicitly and add SCD Type 2 columns if historical state tracking is required.
>
> ### Key Points to Cover
>
> - Debezium (or similar CDC tool) reading PostgreSQL WAL into Kafka
> - Bronze: raw CDC events (insert/update/delete) as append-only log
> - Silver: apply MERGE using APPLY CHANGES (DLT) or manual MERGE logic
> - Handle deletes explicitly — soft delete vs. hard delete strategy
> - Exactly-once semantics via checkpoint + idempotent MERGE on primary key
> - SCD Type 2 considerations for history tracking
>
> ### Example Answer
>
> I'd use **Debezium** connected to PostgreSQL's logical replication (WAL) to capture every insert, update, and delete as a Kafka message. Each message contains the before/after state of the row plus the operation type (`c`=create, `u`=update, `d`=delete).
>
> **Bronze** stores the raw CDC events verbatim — this is your audit log and replay source. I'd partition by date and retain for 30+ days.
>
> **Silver** applies changes to produce the current state of each row. Using DLT's `APPLY CHANGES INTO` is the cleanest approach:
>
> ```sql
> APPLY CHANGES INTO silver.orders
> FROM STREAM(bronze.orders_cdc)
> KEYS (order_id)
> SEQUENCE BY _commit_timestamp
> APPLY AS DELETE WHEN operation = 'd'
> STORED AS SCD TYPE 1;
> ```
>
> If not using DLT, I'd implement a manual MERGE that handles deletes by checking the operation column:
>
> ```sql
> MERGE INTO silver.orders AS target
> USING (
>   SELECT * FROM bronze.orders_cdc
>   WHERE _commit_version > (SELECT MAX(last_synced_version) FROM watermark_table)
> ) AS source
> ON target.order_id = source.order_id
> WHEN MATCHED AND source.operation = 'd' THEN DELETE
> WHEN MATCHED THEN UPDATE SET *
> WHEN NOT MATCHED THEN INSERT *;
> ```
>
> For history (SCD Type 2), I'd add `valid_from`, `valid_to`, and `is_current` columns and use `APPLY CHANGES` with `STORED AS SCD TYPE 2`.
>
> ### Follow-up Questions
>
> - How do you handle the initial backfill of 100M existing rows before starting the CDC stream?
> - What happens if Debezium falls behind and your Kafka topic starts losing messages?
> - How would you validate that Silver is perfectly in sync with the source database?
> - The product team wants to query historical states of orders. How does SCD Type 2 change your design?

---

## Question 3: Multi-Tenant Data Platform with Unity Catalog

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
Your company has 8 business domains (Sales, Marketing, Finance, HR, Legal, Engineering, Operations, Data Science), each with their own data team. Design a Unity Catalog structure that provides isolation between domains while allowing cross-domain access where needed.

> [!success]- Answer Framework
>
> **Short Answer**: Use a domain-per-catalog pattern — one catalog per business domain plus a shared catalog for cross-domain certified data; enforce isolation via group-based RBAC where each domain owns its catalog, and cross-domain access requires explicit GRANT SELECT on tables in the shared catalog.
>
> ### Key Points to Cover
>
> - One metastore per region; catalogs for domain isolation
> - Domain-owned catalogs (sales, marketing, finance, etc.) + shared catalog
> - Schemas within each catalog for environment (prod/dev) or medallion layers
> - Group-based RBAC: domain owners, domain readers, shared readers
> - Shared catalog for cross-domain certified data
> - Data contracts / interface tables in shared catalog
>
> ### Example Answer
>
> I'd use a **domain-per-catalog** pattern within a single regional metastore. Each business domain owns a catalog (`sales`, `marketing`, `finance`, `hr`, `legal`, `engineering`, `ops`, `data_science`) plus a `shared` catalog for certified cross-domain data.
>
> Within each domain catalog, I'd use schemas for the medallion layers:
>
> ```text
> sales/
> ├── bronze/     (raw ingested data, domain engineers only)
> ├── silver/     (cleansed data, domain analysts + read from shared)
> └── gold/       (business metrics, domain consumers)
>
> shared/
> ├── certified/  (approved cross-domain tables)
> └── reference/  (lookup tables: currencies, regions, etc.)
> ```
>
> **RBAC model:**
>
> - `sales_engineers` group: `USE CATALOG`, `USE SCHEMA`, `SELECT`, `MODIFY` on `sales.*`
> - `sales_analysts` group: `USE CATALOG`, `USE SCHEMA`, `SELECT` on `sales.gold.*`
> - `marketing_engineers` group: needs `SELECT` on `shared.certified.customers` (cross-domain)
> - `data_governance` group: metastore admin for policy enforcement
>
> For cross-domain access, I'd publish interface tables to `shared.certified` with explicit `GRANT SELECT` to the consuming domain group. Direct cross-catalog reads are allowed but must be documented via data contracts.
>
> ### Follow-up Questions
>
> - HR data contains PII. How does your design enforce that only authorized users see name and email fields?
> - Two domains want to join their gold tables. Should they do that join in their own catalog or in shared?
> - How would you handle a new domain being onboarded — what's the provisioning checklist?

---

## Question 4: Near-Real-Time Fraud Detection Pipeline

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
A payments company needs to flag potentially fraudulent transactions within 5 seconds of them occurring. They process 50,000 transactions per second at peak. Walk me through a Databricks architecture for this.

> [!success]- Answer Framework
>
> **Short Answer**: Route transactions from Kafka into a hot path (Structured Streaming with ~500ms micro-batches, feature lookup from Online Tables, ML model broadcast to executors, results to a fraud_alerts topic) and a warm path (rolling feature aggregations updated every 60 seconds); keeping the end-to-end budget under 5 seconds requires pre-computing features rather than computing them at scoring time.
>
> ### Key Points to Cover
>
> - Kafka as the streaming backbone for low-latency ingest
> - Structured Streaming with low trigger interval (continuous or sub-second micro-batch)
> - Stateful operations: session windows, joins with feature store
> - ML model serving via Databricks Model Serving (online endpoint) or broadcast of lightweight model
> - Output to Kafka/Redis/Delta for downstream action
> - Latency budget: ingest → feature computation → scoring → output < 5s
>
> ### Example Answer
>
> With a 5-second SLA and 50K TPS, this requires careful latency budgeting. I'd split it into two paths: a **hot path** for real-time scoring and a **warm path** for feature computation.
>
> **Hot path** (latency target: < 2 seconds):
> Transactions flow from Kafka → Spark Structured Streaming with `trigger(processingTime="500ms")`. For each transaction, I'd look up pre-computed features (customer spend velocity, device fingerprint score) from an online feature store (Redis or Databricks Online Tables). The transaction + features get scored by a lightweight ML model broadcast to all executors:
>
> ```python
> # Broadcast model to all executors to avoid serialization overhead
> model_broadcast = spark.sparkContext.broadcast(loaded_model)
>
> @udf(returnType=DoubleType())
> def score_transaction(features):
>     return float(model_broadcast.value.predict_proba([features])[0][1])
> ```
>
> Transactions scored above the threshold get written to a `fraud_alerts` Kafka topic for immediate action by the payments system.
>
> **Warm path** (feature refresh, < 60 second lag):
> A separate streaming job aggregates transaction history into rolling windows (1-min, 5-min, 1-hour spend velocity per customer/device) and writes to Delta + Online Tables for feature lookup.
>
> **Operational concerns:** I'd monitor end-to-end latency with Spark Streaming metrics, set up alerts if processing time exceeds 3 seconds (giving 2-second buffer), and run chaos tests for Kafka consumer group failures.
>
> ### Follow-up Questions
>
> - Your fraud model needs to be retrained daily. How do you deploy a new version without dropping transactions?
> - One customer has an unusually high transaction rate — how does data skew affect your streaming job?
> - How do you measure the pipeline's false positive rate and feed that signal back to retrain the model?

---

## Question 5: Hive Metastore to Unity Catalog Migration

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
Your company has been running Databricks for 3 years with a legacy Hive metastore containing 2,000 tables across 40 databases. You've been asked to migrate everything to Unity Catalog. How would you plan and execute this?

> [!success]- Answer Framework
>
> **Short Answer**: Inventory all 2,000 tables (managed vs external, owners, consumers), map Hive databases to UC catalogs and schemas, migrate in domain waves using CTAS or in-place upgrade commands, recreate ACLs as group-based UC GRANTs, then validate with row counts and schema diffs before cutting over — keeping the Hive metastore readable for 30 days as a rollback option.
>
> ### Key Points to Cover
>
> - Discovery: catalog all tables (managed vs external, size, owner, consumers)
> - Mapping Hive databases → UC catalogs/schemas
> - Migration approaches: CTAS, SYNC, or upgrade-in-place
> - Access control migration: recreate ACLs as UC GRANTs on groups
> - Cutover strategy: pilot domain first, then wave-based migration
> - Validation: row counts, schema comparison, query regression testing
>
> ### Example Answer
>
> I'd approach this in four phases: **Discover, Design, Migrate, Validate**.
>
> **Phase 1 — Discover**: Use `SHOW DATABASES`, `SHOW TABLES IN db`, and `DESCRIBE EXTENDED` to inventory all 2,000 tables. Classify each as managed or external, identify owners via `system.information_schema`, and identify downstream consumers via query history (`system.access.audit`).
>
> **Phase 2 — Design**: Map Hive databases to UC namespace. For example:
>
> - `hive_metastore.sales` → `prod.sales` (catalog.schema)
> - `hive_metastore.bronze_orders` → `prod.bronze` (schema per layer)
>
> Design group-based RBAC to replace table-level ACLs.
>
> **Phase 3 — Migrate**: For external tables (data not moving), use `CREATE TABLE ... LOCATION` to register in UC. For managed tables, use `CREATE TABLE AS SELECT` or the UC table upgrade command:
>
> ```sql
> -- Upgrade managed table in place (converts metadata, data stays)
> ALTER TABLE hive_metastore.sales.orders
> SET TBLPROPERTIES ('upgraded_to' = 'prod.sales.orders');
> ```
>
> I'd run the migration in waves by domain, starting with low-risk tables (Gold read-only) before higher-risk Silver/Bronze.
>
> **Phase 4 — Validate**: Run row count checks, schema diffs, and replay sample queries against both the old and new tables. Keep Hive metastore readable for 30 days post-cutover as a rollback option.
>
> ### Follow-up Questions
>
> - Some legacy jobs reference Hive tables by `hive_metastore.db.table` hardcoded in notebooks. How do you handle that?
> - How do you ensure no jobs are broken during the migration without testing every one of 500 notebooks?
> - What's your rollback plan if a critical downstream dashboard breaks after cutover?

---

**[← Previous: Data Compliance & Quality](./12-data-compliance-quality.md) | [↑ Back to Interview Prep](./README.md) | [Next: ML System Design →](./14-ml-system-design.md)**
