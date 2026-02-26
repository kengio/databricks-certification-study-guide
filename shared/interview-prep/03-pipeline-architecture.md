---
tags: [interview-prep, pipeline-architecture]
---

# Interview Questions — Pipeline Architecture

---

## Question 1: Medallion Architecture Trade-offs

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Explain the medallion (Bronze/Silver/Gold) architecture. A colleague argues it adds latency and duplicates storage — how would you respond? When would you skip a layer?

> [!success]- Answer Framework
>
> **Short Answer**: Bronze preserves raw data for replay and audit, Silver provides a single cleansed row-level source of truth, and Gold pre-aggregates for query performance; the storage and latency cost is worth it for any non-trivial pipeline because Bronze alone eliminates the need to re-pull from source systems when bugs occur downstream.
>
> ### Key Points to Cover
>
> - Bronze: raw append-only, source of truth for reprocessing; schema-on-read
> - Silver: cleansed, deduplicated, schema-on-write; single source of truth for analysts
> - Gold: aggregated, denormalized, use-case specific; query-optimized
> - Trade-off: storage cost + latency vs. data quality + reprocessability
> - When to skip: tiny datasets, real-time with no quality issues, simple pass-through
> - Each layer is independently queryable → enables multiple Gold tables from one Silver
>
> ### Example Answer
>
> Your colleague raises a valid concern — medallion does add storage overhead and pipeline stages. But the benefits usually outweigh the costs for any non-trivial data platform.
>
> **Why keep Bronze?** It's your insurance policy. When a bug in your Silver transformation corrupts data, you can replay from Bronze without re-pulling from the source system. For compliance-heavy industries, Bronze is also your audit log — the raw record of exactly what arrived and when. Skipping Bronze means a source system bug or schema change could destroy data you can never recover.
>
> **Why keep Silver?** Multiple downstream teams (analysts, data scientists, Gold pipelines) all read Silver. Without it, every consumer would need to re-implement deduplication and cleaning independently — and they'd disagree. Silver is the "single source of truth" at row level.
>
> **Why keep Gold?** Pre-aggregating expensive computations in Gold means dashboard queries run in milliseconds instead of scanning billions of Silver rows. Without Gold, every dashboard query is a full scan.
>
> **When to skip a layer:**
>
> - **Skip Gold**: If your consumers query Silver directly with good performance (small dataset, simple queries)
> - **Skip Silver → direct Bronze to Gold**: For reference data or lookup tables with no quality issues
> - **Collapse all three**: For very small, infrequent pipelines where maintenance overhead > benefit
>
> The latency concern is real — each layer adds processing time. For near-real-time requirements (< 5 min), you can run all three as streaming jobs with small trigger intervals.
>
> ### Follow-up Questions
>
> - If a Silver transformation bug corrupts data, how do you fix Silver without re-ingesting from the source?
> - When should data scientists work off Silver vs Gold?
> - How would you version your Silver table schema when the business changes a business rule?

---

## Question 2: Delta Live Tables vs Notebook-Based Pipelines

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You're starting a new data engineering project. When would you choose Delta Live Tables (LakeFlow Pipelines) over a traditional Databricks Workflow with notebooks? What are the trade-offs?

> [!success]- Answer Framework
>
> **Short Answer**: Choose DLT for declarative medallion pipelines that need built-in data quality expectations, automatic dependency resolution, and lineage; choose Notebooks + Workflows for complex custom logic, ML pipelines, or when you need fine-grained control and easier interactive debugging.
>
> ### Key Points to Cover
>
> - DLT: declarative, managed execution, automatic dependency resolution
> - DLT: built-in data quality (expectations), lineage, retries
> - DLT: harder to debug, less control over execution order
> - Notebooks/Workflows: imperative, full control, easier to debug step by step
> - DLT: better for medallion pipelines with clear data quality requirements
> - Notebooks: better for complex custom logic, ML pipelines, one-off transformations
>
> ### Example Answer
>
> **Choose DLT when:**
>
> - You're building a **medallion pipeline** with multiple dependent tables — DLT automatically resolves dependencies and determines execution order
> - You need **data quality enforcement with expectations** — `@expect`, `@expect_or_drop`, `@expect_or_fail` give you declarative quality rules with built-in monitoring
> - You want **automatic retries and incremental processing** without writing boilerplate checkpoint management
> - You want pipeline-level **lineage** visualized in the UI automatically
>
> ```python
> import dlt
> from pyspark.sql.functions import col
>
> @dlt.table(comment="Raw orders from Kafka")
> def bronze_orders():
>     return (spark.readStream.format("kafka")
>         .option("kafka.bootstrap.servers", "broker:9092")
>         .option("subscribe", "orders").load())
>
> @dlt.expect("valid_order_id", "order_id IS NOT NULL")
> @dlt.expect_or_drop("positive_amount", "amount > 0")
> @dlt.table(comment="Cleansed orders")
> def silver_orders():
>     return (dlt.read_stream("bronze_orders")
>         .select("order_id", "customer_id", col("amount").cast("double")))
> ```
>
> **Choose notebooks + Workflows when:**
>
> - You need **fine-grained control** over execution (custom retry logic, conditional branching)
> - The pipeline involves **non-tabular outputs** (file generation, API calls, ML model training)
> - You need **easier local debugging** — notebooks are simpler to run interactively than DLT pipelines
> - You have **complex business logic** not easily expressed in the DLT declarative model
>
> **Key trade-offs:**
>
> | Aspect | DLT | Notebooks + Workflows |
> | ------ | --- | --------------------- |
> | Development speed | Faster for standard ETL | Faster for custom logic |
> | Debugging | Harder (pipeline-level logs) | Easier (cell-by-cell) |
> | Data quality | Built-in expectations | Manual implementation |
> | Cost | DLT overhead on compute | Pay only for what you use |
> | Flexibility | Less | More |
>
> ### Follow-up Questions
>
> - What happens to records that fail a `@expect_or_drop` expectation in DLT?
> - Can you mix DLT tables and regular Delta tables in the same pipeline?
> - How does DLT handle schema evolution differently from a manually written pipeline?

---

## Question 3: Auto Loader vs COPY INTO for Incremental Ingestion

**Level**: Associate
**Type**: Deep Dive

**Scenario / Question**:
You need to incrementally ingest Parquet files that land in cloud storage every hour. Your manager asks whether to use Auto Loader or COPY INTO. How do you choose?

> [!success]- Answer Framework
>
> **Short Answer**: Use COPY INTO for SQL-friendly scheduled batch loads with a moderate file volume (< 10,000 files/day) where idempotency and simplicity matter; use Auto Loader for high-volume or near-real-time ingestion (> 10,000 files/day) because it uses cloud file notifications instead of directory listing, scales to millions of files, and handles schema evolution automatically.
>
> ### Key Points to Cover
>
> - Auto Loader: streaming, file notification via cloud events (or directory listing), handles millions of files
> - COPY INTO: SQL command, idempotent batch loads, remembers which files were loaded
> - Auto Loader scales better for high file volume; COPY INTO simpler for moderate volume
> - Auto Loader supports schema inference and evolution natively
> - COPY INTO is synchronous/SQL-friendly; Auto Loader requires streaming context
>
> ### Example Answer
>
> Both are designed for incremental file ingestion, but they have different strengths.
>
> **COPY INTO** is a SQL command that idempotently loads new files from a directory, tracking which files have already been processed:
>
> ```sql
> COPY INTO prod.bronze.orders
> FROM 's3://my-bucket/landing/orders/'
> FILEFORMAT = PARQUET
> COPY_OPTIONS ('mergeSchema' = 'true');
> ```
>
> It's great for **scheduled batch jobs** (hourly, daily), SQL-friendly environments, and tables receiving a moderate number of files. The downside: it lists the entire directory on every run, which gets slow with millions of files.
>
> **Auto Loader** uses cloud file notification services (S3 Event Notifications, Azure Event Grid) to detect new files as they arrive, avoiding full directory listings:
>
> ```python
> (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "parquet")
>     .option("cloudFiles.schemaLocation", "/checkpoints/schema/orders")
>     .load("s3://my-bucket/landing/orders/")
>     .writeStream
>     .format("delta")
>     .option("checkpointLocation", "/checkpoints/orders")
>     .trigger(processingTime="1 hour")
>     .toTable("prod.bronze.orders"))
> ```
>
> Auto Loader excels at **high-volume ingestion** (millions of files), near-real-time landing detection, and automatic schema evolution with `schemaEvolutionMode`.
>
> **Decision guide:**
>
> | Factor | Choose COPY INTO | Choose Auto Loader |
> | ------ | ---------------- | ------------------ |
> | Files per day | < 10,000 | > 10,000 |
> | Trigger | Scheduled batch | Continuous or scheduled |
> | Schema evolution | Manual | Automatic |
> | SQL-only environment | Yes | No (requires Python/Scala) |
> | DLT integration | Supported | Preferred |
>
> ### Follow-up Questions
>
> - How does Auto Loader's `schemaEvolutionMode = "rescue"` differ from `"addNewColumns"`?
> - If Auto Loader fails mid-run and you restart it, will it reprocess files?
> - What happens in COPY INTO if you accidentally drop and recreate the target table?

---

## Question 4: Handling Late-Arriving Data

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
Your Silver layer pipeline processes sensor events. Due to network issues, some events arrive 4–6 hours late. Your Gold aggregations are running hourly. How do you design the pipeline to handle late data without recomputing all historical Gold tables?

> [!success]- Answer Framework
>
> **Short Answer**: Set a 6-hour watermark in the streaming Silver job to bound state and produce eventually-consistent Gold aggregations, then run a separate daily batch correction job that re-aggregates the last 24 hours from Bronze and MERGEs corrections into affected Gold time windows — giving you sub-minute freshness with full accuracy applied daily.
>
> ### Key Points to Cover
>
> - Watermarking in streaming: drop data older than the watermark threshold
> - Separate late-arrival reconciliation job (batch correction)
> - Incremental Gold using `MERGE` on affected time windows
> - Event time vs processing time — always use event time for aggregations
> - "Lambda architecture" pattern: streaming for speed, batch for accuracy
>
> ### Example Answer
>
> I'd handle this with a two-track strategy: **streaming for freshness** and **batch correction for accuracy**.
>
> **Track 1 — Streaming with watermarking** (Silver):
> Set a watermark of 6 hours to handle the maximum expected lateness. Events older than 6 hours from the latest event time are dropped from state:
>
> ```python
> silver_stream = (spark.readStream
>     .table("bronze.sensor_events")
>     .withWatermark("event_time", "6 hours")
>     .groupBy(
>         window("event_time", "1 hour"),
>         "sensor_id"
>     )
>     .agg(avg("reading").alias("avg_reading")))
> ```
>
> This means Gold aggregations built from this stream will be **eventually consistent** — they may be slightly understated initially if late events haven't arrived yet.
>
> **Track 2 — Late arrival correction job** (batch, runs daily):
> A separate job looks back at the last 24 hours of Bronze events, re-aggregates by hour, and uses MERGE to update Gold rows that changed:
>
> ```sql
> MERGE INTO gold.hourly_sensor_metrics AS target
> USING (
>   SELECT
>     date_trunc('hour', event_time) AS hour_bucket,
>     sensor_id,
>     AVG(reading) AS avg_reading,
>     COUNT(*) AS event_count
>   FROM bronze.sensor_events
>   WHERE event_time >= current_timestamp() - INTERVAL 24 HOURS
>   GROUP BY 1, 2
> ) AS source
> ON target.hour_bucket = source.hour_bucket
>   AND target.sensor_id = source.sensor_id
> WHEN MATCHED THEN UPDATE SET
>   target.avg_reading = source.avg_reading,
>   target.event_count = source.event_count,
>   target.last_updated = current_timestamp()
> WHEN NOT MATCHED THEN INSERT *;
> ```
>
> This gives you sub-minute Gold freshness via streaming, with full accuracy corrections applied daily.
>
> ### Follow-up Questions
>
> - If late data arrives 3 days late (not 6 hours), how does your design break and how do you fix it?
> - How would you monitor the rate of late-arriving events to know if your 6-hour watermark is sufficient?
> - In the batch correction job, how do you avoid recomputing Gold for time windows with no late arrivals?

---

## Question 5: Idempotent Data Ingestion

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your ingestion job runs every hour but occasionally gets triggered twice (duplicate runs). How do you design the Bronze ingestion to be idempotent — so running it twice produces the same result as running it once?

> [!success]- Answer Framework
>
> **Short Answer**: Idempotency means running the job twice produces the same result as running it once — achieve this by using Auto Loader or COPY INTO (file-level deduplication), MERGE on a business key (record-level deduplication), or INSERT OVERWRITE on a partition; never use plain `INSERT INTO` (append) without deduplication, as duplicate runs will double-count data.
>
> ### Key Points to Cover
>
> - COPY INTO / Auto Loader: inherently idempotent (track processed files)
> - MERGE with natural key: idempotent for upserts (same row applied twice = same result)
> - INSERT OVERWRITE partitions: idempotent for partition-scoped writes
> - Add a deduplication step using `dropDuplicates` on business key + event time
> - Avoid plain `INSERT INTO` (append) without deduplication — will double-count
>
> ### Example Answer
>
> Idempotency means: running the job multiple times with the same input produces the same output. Several patterns achieve this:
>
> **Pattern 1 — Use COPY INTO or Auto Loader**: Both track which files have been loaded and skip already-processed files. Re-running = no new data ingested = idempotent by design.
>
> **Pattern 2 — MERGE on business key**: Instead of `INSERT INTO`, use MERGE. If the same record arrives twice, it updates (same result) rather than duplicating:
>
> ```sql
> MERGE INTO bronze.orders AS target
> USING incoming_batch AS source
> ON target.order_id = source.order_id
>   AND target.event_time = source.event_time
> WHEN NOT MATCHED THEN INSERT *;
> ```
>
> **Pattern 3 — INSERT OVERWRITE partition**: For daily batch jobs, overwrite only the target partition. Running twice overwrites the same partition with the same data:
>
> ```python
> (daily_df.write
>     .format("delta")
>     .mode("overwrite")
>     .option("replaceWhere", "event_date = '2026-02-18'")
>     .save(bronze_path))
> ```
>
> **Pattern 4 — Deduplication before write**: If you must use append, deduplicate on business key + timestamp before writing:
>
> ```python
> deduped_df = incoming_df.dropDuplicates(["order_id", "event_time"])
> deduped_df.write.format("delta").mode("append").save(bronze_path)
> ```
>
> For most production pipelines, I combine Auto Loader (file-level idempotency) with MERGE (record-level idempotency) for defense in depth.
>
> ### Follow-up Questions
>
> - What is `replaceWhere` in Delta and how does it differ from `overwrite` mode?
> - If your job is idempotent, does that mean you still need deduplication in Silver? Why or why not?
> - How do you test idempotency in a CI/CD pipeline for your ingestion job?

---

## Question 6: DLT Expectations and Quarantine Tables

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You're building a DLT pipeline for financial transaction data. Compliance requires that all records are accounted for — even invalid ones. How would you use DLT expectations and quarantine tables to satisfy this requirement?

> [!success]- Answer Framework
>
> **Short Answer**: Use `@expect_or_drop` on the Silver table to pass only valid records, and define a separate quarantine table that reads from Bronze and filters for the same invalid conditions — this guarantees every Bronze record lands in exactly one place (Silver or Quarantine) and DLT's event log automatically provides an audit trail of all violations.
>
> ### Key Points to Cover
>
> - `@expect`: track violations as metrics, keep all rows
> - `@expect_or_drop`: remove invalid rows, send to quarantine table
> - `@expect_or_fail`: halt pipeline on violation
> - Quarantine pattern: use `@expect_or_drop` on Silver + separate quarantine table reading Bronze with failed rows
> - DLT event log: all expectation results stored for auditing
>
> ### Example Answer
>
> DLT provides three enforcement levels for data quality expectations:
>
> - **`@expect`**: rows pass through regardless; violation counts are tracked as metrics
> - **`@expect_or_drop`**: invalid rows are dropped from the table (but counted in metrics)
> - **`@expect_or_fail`**: any violation halts the entire pipeline
>
> For compliance use cases where **all records must be accounted for**, the quarantine pattern is the right approach:
>
> ```python
> import dlt
> from pyspark.sql.functions import col
>
> # Silver: valid transactions only
> @dlt.expect_or_drop("valid_amount", "amount > 0")
> @dlt.expect_or_drop("valid_account", "account_id IS NOT NULL")
> @dlt.table(comment="Validated financial transactions")
> def silver_transactions():
>     return dlt.read_stream("bronze_transactions")
>
> # Quarantine: rows that failed any expectation
> @dlt.table(comment="Invalid transactions for review and remediation")
> def quarantine_transactions():
>     return (dlt.read_stream("bronze_transactions")
>         .filter(
>             (col("amount") <= 0) |
>             col("account_id").isNull()
>         )
>         .withColumn("_quarantine_reason",
>             when(col("amount") <= 0, "invalid_amount")
>             .when(col("account_id").isNull(), "missing_account_id")
>             .otherwise("unknown")))
> ```
>
> This ensures: every Bronze record goes to exactly one of Silver (valid) or Quarantine (invalid). Compliance can audit the quarantine table, remediate records, and reprocess them back through the pipeline.
>
> DLT also logs all expectation results in the **event log** (`system.events`), providing a full audit trail of how many records were dropped, when, and why — without any custom logging code.
>
> ### Follow-up Questions
>
> - How do you reprocess quarantined records once they've been corrected?
> - What's the difference between using `@expect_or_drop` and manually filtering with `.filter()` in DLT?
> - If a production pipeline fails due to `@expect_or_fail`, how do you investigate and resume it?

---

**[← Previous: Interview Questions — Delta Lake Internals](./02-delta-lake-internals.md) | [↑ Back to Databricks Interview Prep](./README.md) | [Next: Interview Questions — Performance Optimization](./04-performance-optimization.md) →**
