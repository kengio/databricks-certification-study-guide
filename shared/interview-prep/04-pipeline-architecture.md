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

## Question 7: Multi-Task Job DAG Design

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
You need to design a Databricks Workflow with 8 tasks that have complex dependencies — some tasks run in parallel, some require outputs from upstream tasks. How do you structure the DAG, handle data passing between tasks, and manage cluster allocation?

> [!success]- Answer Framework
>
> **Short Answer**: Define task dependencies using `depends_on` to build the DAG, use `dbutils.jobs.taskValues.set()` and `.get()` to pass small data between tasks, and allocate a shared job cluster for tightly coupled tasks while isolating resource-heavy tasks on dedicated clusters to balance cost and stability.
>
> ### Key Points to Cover
>
> - Task dependencies via `depends_on` — determines execution order and parallelism
> - Shared job cluster vs per-task clusters (cost savings vs isolation)
> - `dbutils.jobs.taskValues.set()` / `.get()` for passing small values (file paths, row counts) between tasks
> - Conditional branching with if/else tasks and `run_if` conditions
> - Error handling with task-level retries and `max_retries`
> - DAB (Databricks Asset Bundles) for defining jobs as code
>
> ### Example Answer
>
> **Structuring the DAG**: The key principle is to maximize parallelism while respecting true data dependencies. For an 8-task pipeline, a typical pattern looks like:
>
> - **Layer 1** (parallel): Ingest tasks for independent data sources (e.g., `ingest_orders`, `ingest_customers`, `ingest_products`)
> - **Layer 2** (parallel, depends on Layer 1): Transformation tasks that join/enrich data (e.g., `transform_order_details` depends on both `ingest_orders` and `ingest_products`)
> - **Layer 3**: Aggregation and Gold table creation
> - **Layer 4**: Data quality validation and notification
>
> **Data passing between tasks**: Use `taskValues` for lightweight metadata — never for large datasets. Tasks should write results to Delta tables and pass only references:
>
> ```python
> # In upstream task: save a reference
> row_count = df.count()
> output_path = "catalog.schema.silver_orders"
> dbutils.jobs.taskValues.set(key="order_count", value=row_count)
> dbutils.jobs.taskValues.set(key="output_table", value=output_path)
>
> # In downstream task: retrieve the reference
> order_count = dbutils.jobs.taskValues.get(
>     taskKey="ingest_orders",
>     key="order_count",
>     default=0
> )
> output_table = dbutils.jobs.taskValues.get(
>     taskKey="ingest_orders",
>     key="output_table"
> )
> ```
>
> **Cluster allocation strategy**: Use a shared job cluster for lightweight tasks that run sequentially (saves cluster startup time), and dedicated clusters for memory-intensive or GPU tasks:
>
> - **Shared job cluster**: ingestion tasks, validation tasks, notification tasks
> - **Dedicated cluster**: large joins, ML inference, tasks requiring different Spark configs
>
> **DAB definition with dependencies**:
>
> ```yaml
> resources:
>   jobs:
>     daily_pipeline:
>       name: "Daily Order Pipeline"
>       job_clusters:
>         - job_cluster_key: shared_etl
>           new_cluster:
>             spark_version: "15.4.x-scala2.12"
>             num_workers: 4
>             node_type_id: "i3.xlarge"
>       tasks:
>         - task_key: ingest_orders
>           job_cluster_key: shared_etl
>           notebook_task:
>             notebook_path: ./notebooks/ingest_orders
>           max_retries: 2
>
>         - task_key: ingest_customers
>           job_cluster_key: shared_etl
>           notebook_task:
>             notebook_path: ./notebooks/ingest_customers
>           max_retries: 2
>
>         - task_key: transform_order_details
>           job_cluster_key: shared_etl
>           depends_on:
>             - task_key: ingest_orders
>             - task_key: ingest_customers
>           notebook_task:
>             notebook_path: ./notebooks/transform_order_details
>
>         - task_key: validate_quality
>           job_cluster_key: shared_etl
>           depends_on:
>             - task_key: transform_order_details
>           notebook_task:
>             notebook_path: ./notebooks/validate_quality
> ```
>
> **Conditional branching**: Use if/else tasks to handle success vs failure paths — for example, if `validate_quality` reports failures above a threshold, route to an alerting task instead of the publish task.
>
> ### Follow-up Questions
>
> - What is the maximum size of data you can pass through `dbutils.jobs.taskValues`? What happens if you exceed it?
> - How do you handle a scenario where one parallel task fails but the others succeed?
> - When would you use a for-each task in a Workflow DAG?

---

## Question 8: File Arrival Triggers vs Cron vs API-Triggered Jobs

**Level**: Both
**Type**: Comparison

**Scenario / Question**:
Your team is building a data pipeline that processes files from an upstream system. Sometimes files arrive every 15 minutes, sometimes there is a 6-hour gap. How do you decide between file arrival triggers, cron schedules, and API-triggered runs?

> [!success]- Answer Framework
>
> **Short Answer**: Use file arrival triggers when processing is event-driven and file delivery is unpredictable, cron schedules when data lands on a fixed cadence and you want simplicity, and API-triggered runs when an external system (CI/CD, microservice, orchestrator) should control execution timing.
>
> ### Key Points to Cover
>
> - File arrival triggers: monitor a cloud storage path, fire when new files detected
> - Cron schedules: fixed intervals (every hour, daily at midnight), predictable but may waste resources or miss data
> - API-triggered: external system calls the Jobs API to start a run on demand
> - `availableNow` trigger: a hybrid — streaming trigger that processes all available data then stops (batch semantics with streaming efficiency)
> - Event-driven beats time-driven when file delivery is unpredictable
>
> ### Example Answer
>
> **Cron Schedule** (simplest):
>
> Run the pipeline every hour regardless of whether new data arrived. This works well when upstream delivers data on a predictable schedule:
>
> - **Pros**: Simple to set up, predictable compute costs, easy to monitor
> - **Cons**: Wastes compute if no data arrived; may process stale data if files arrive mid-interval; latency = up to 1 full interval
>
> **File Arrival Trigger** (event-driven):
>
> The Workflow monitors a cloud storage path and triggers a run when new files appear. Ideal for your scenario with unpredictable file arrival:
>
> - **Pros**: Processes data as soon as it arrives, no wasted runs, handles irregular schedules
> - **Cons**: Requires cloud event configuration (S3 Event Notifications, Azure Event Grid), potential for many small runs if files arrive frequently
> - Configure a minimum wait time and batch window to avoid triggering on every single file
>
> **API-Triggered** (orchestrator-driven):
>
> An external system (Airflow, ADF, a microservice, or CI/CD) calls the Databricks Jobs API to start a run:
>
> - **Pros**: Full control from the orchestrator, can pass dynamic parameters, integrates with multi-system pipelines
> - **Cons**: Requires external infrastructure, adds a dependency on the calling system
>
> **`availableNow` trigger** (hybrid):
>
> A streaming job with `.trigger(availableNow=True)` processes all files that have arrived since the last run, then stops. Schedule this with cron for batch-like behavior with Auto Loader's incremental tracking:
>
> ```python
> (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "parquet")
>     .load("s3://bucket/landing/")
>     .writeStream
>     .format("delta")
>     .trigger(availableNow=True)
>     .option("checkpointLocation", "/checkpoints/orders")
>     .toTable("bronze.orders"))
> ```
>
> **Decision framework:**
>
> | Factor | Cron | File Arrival | API-Triggered | availableNow |
> | ------ | ---- | ------------ | ------------- | ------------ |
> | File arrival pattern | Predictable | Unpredictable | External event | Any |
> | Latency requirement | Minutes–hours | Near-real-time | Depends on caller | Minutes |
> | Setup complexity | Low | Medium | Medium | Low |
> | Wasted compute | Possible | None | None | None |
> | Multi-system orchestration | No | No | Yes | No |
>
> For your scenario with unpredictable 15-min to 6-hour gaps, I would use a **file arrival trigger** with a 5-minute batch window to group closely arriving files into a single run.
>
> ### Follow-up Questions
>
> - How does the file arrival trigger handle a burst of 1,000 files arriving in one minute?
> - Can you combine a cron schedule with `availableNow` trigger? What are the benefits?
> - What happens if the API-triggered job is already running when a second trigger arrives?

---

## Question 9: Workflows vs Airflow vs Azure Data Factory

**Level**: Professional
**Type**: Comparison

**Scenario / Question**:
Your team is debating whether to use Databricks Workflows natively or bring in Apache Airflow or Azure Data Factory for orchestration. What is your framework for deciding?

> [!success]- Answer Framework
>
> **Short Answer**: Use Databricks Workflows for Databricks-native DAGs with the lowest operational overhead, Airflow for multi-system orchestration with complex branching and open-source flexibility, and ADF/Step Functions for cloud-native pipelines tightly integrated with other cloud services — the decision hinges on the scope of orchestration, team skills, and existing infrastructure.
>
> ### Key Points to Cover
>
> - Databricks Workflows: lowest overhead for Databricks-centric pipelines, built-in retry/alerting, DAB-managed
> - Airflow: best for multi-system orchestration (Databricks + Snowflake + APIs + dbt), rich operator ecosystem, open-source
> - ADF / Step Functions: cloud-native, deep integration with Azure/AWS services, low-code UI
> - Decision factors: scope of orchestration, team expertise, existing infrastructure, vendor lock-in tolerance
> - Hybrid approach: Airflow/ADF as outer orchestrator, Databricks Workflows for inner DAGs
>
> ### Example Answer
>
> **Databricks Workflows** (best for Databricks-native):
>
> - **Strengths**: Zero additional infrastructure, tight integration with Databricks (clusters, Unity Catalog, DLT), task dependencies, shared job clusters, built-in monitoring, managed via Databricks Asset Bundles
> - **Weaknesses**: Cannot orchestrate non-Databricks systems (APIs, Snowflake, dbt Cloud), limited branching compared to Airflow, vendor lock-in
> - **Best for**: Teams where 80%+ of the pipeline runs inside Databricks
>
> **Apache Airflow** (best for multi-system orchestration):
>
> - **Strengths**: Rich operator ecosystem (DatabricksSubmitRunOperator, SnowflakeOperator, HTTP, S3, dbt), complex branching (BranchPythonOperator, trigger rules), open-source, runs anywhere, large community
> - **Weaknesses**: Requires infrastructure to run (self-hosted or managed like MWAA/Astronomer), steeper learning curve, DAG parsing overhead at scale
> - **Best for**: Pipelines spanning multiple platforms (Databricks + Snowflake + REST APIs + dbt)
>
> **Azure Data Factory / AWS Step Functions** (cloud-native):
>
> - **Strengths**: Tight integration with respective cloud ecosystems, low-code UI for non-engineers, managed infrastructure, built-in connectors for 100+ services
> - **Weaknesses**: Limited expressiveness for complex logic, cloud vendor lock-in, harder to version control
> - **Best for**: Cloud-native shops with non-engineering stakeholders building pipelines
>
> **Decision framework:**
>
> | Factor | Databricks Workflows | Airflow | ADF / Step Functions |
> | ------ | -------------------- | ------- | -------------------- |
> | Orchestration scope | Databricks only | Multi-system | Cloud ecosystem |
> | Infrastructure overhead | None | Medium–High | None |
> | Complex branching | Basic | Advanced | Basic |
> | Version control / IaC | DABs, Terraform | DAGs as code | ARM/Bicep, Terraform |
> | Team skills required | Databricks | Python + Airflow | Cloud platform |
> | Vendor lock-in | Databricks | None (open-source) | Cloud provider |
>
> **Hybrid pattern**: Many mature teams use Airflow or ADF as the outer orchestrator (triggering Databricks jobs via API) while using Databricks Workflows for the inner DAG within Databricks. This gives you multi-system orchestration at the top level and Databricks-native features at the task level.
>
> ### Follow-up Questions
>
> - If you choose Airflow, how does `DatabricksSubmitRunOperator` differ from `DatabricksRunNowOperator`?
> - How would you handle a pipeline that needs to run a dbt model, then a Databricks notebook, then call a REST API?
> - What monitoring and alerting capabilities does each orchestrator provide out of the box?

---

## Question 10: Parameterization and Environment Promotion

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your data engineering team has dev, staging, and prod environments. How do you promote a pipeline from dev to staging to prod without changing any code? What tools and patterns do you use?

> [!success]- Answer Framework
>
> **Short Answer**: Use Databricks Asset Bundles with `variables:` for environment-specific values and `targets:` for environment definitions (dev, staging, prod), so the same code deploys to different catalogs, schemas, and clusters by simply changing the deployment target — never hardcode catalog names, paths, or cluster IDs in notebook code.
>
> ### Key Points to Cover
>
> - Databricks Asset Bundles: `variables:` and `targets:` in `databricks.yml` for environment abstraction
> - `dbutils.widgets` for notebook-level parameters passed from Workflows
> - Task parameters in Workflow definitions (key-value pairs)
> - Anti-pattern: hardcoded catalog/schema/path names in code
> - CI/CD integration: deploy to staging on PR merge, prod on release tag
>
> ### Example Answer
>
> **The anti-pattern** — hardcoded environments:
>
> ```python
> # BAD: changing environments requires code changes
> df = spark.table("prod.sales.orders")
> df.write.save("s3://prod-bucket/gold/orders")
> ```
>
> **The solution** — parameterized code with Databricks Asset Bundles:
>
> **Step 1 — Define variables and targets in `databricks.yml`**:
>
> ```yaml
> variables:
>   catalog:
>     description: "Target Unity Catalog"
>   schema:
>     description: "Target schema"
>   storage_path:
>     description: "Cloud storage base path"
>
> targets:
>   dev:
>     workspace:
>       host: https://dev.cloud.databricks.com
>     variables:
>       catalog: dev_catalog
>       schema: dev_sales
>       storage_path: s3://dev-bucket
>
>   staging:
>     workspace:
>       host: https://staging.cloud.databricks.com
>     variables:
>       catalog: staging_catalog
>       schema: staging_sales
>       storage_path: s3://staging-bucket
>
>   prod:
>     workspace:
>       host: https://prod.cloud.databricks.com
>     variables:
>       catalog: prod_catalog
>       schema: prod_sales
>       storage_path: s3://prod-bucket
>     run_as:
>       service_principal_name: prod-pipeline-sp
> ```
>
> **Step 2 — Reference variables in job definitions**:
>
> ```yaml
> resources:
>   jobs:
>     order_pipeline:
>       name: "Order Pipeline - ${var.catalog}"
>       tasks:
>         - task_key: ingest_orders
>           notebook_task:
>             notebook_path: ./notebooks/ingest_orders
>             base_parameters:
>               catalog: ${var.catalog}
>               schema: ${var.schema}
>               storage_path: ${var.storage_path}
> ```
>
> **Step 3 — Read parameters in notebook code**:
>
> ```python
> # Notebook code — environment-agnostic
> catalog = dbutils.widgets.get("catalog")
> schema = dbutils.widgets.get("schema")
> storage_path = dbutils.widgets.get("storage_path")
>
> spark.sql(f"USE CATALOG {catalog}")
> spark.sql(f"USE SCHEMA {schema}")
>
> df = spark.table("raw_orders")
> df.write.format("delta").save(f"{storage_path}/gold/orders")
> ```
>
> **Step 4 — Deploy to different environments**:
>
> ```text
> # Deploy to dev (interactive development)
> databricks bundle deploy -t dev
>
> # Deploy to staging (CI/CD on PR merge)
> databricks bundle deploy -t staging
>
> # Deploy to prod (CI/CD on release tag)
> databricks bundle deploy -t prod
> ```
>
> The same notebooks, the same job definitions, deployed to different environments by changing only the target flag. No code changes required.
>
> **Additional parameterization patterns**:
>
> - **DLT pipelines**: Use the `configuration` block to pass catalog/schema as pipeline settings
> - **SQL warehouses**: Use `spark.conf.get("pipeline.catalog")` in SQL notebooks
> - **Secrets**: Use `dbutils.secrets.get(scope, key)` — scope names can vary per environment
>
> ### Follow-up Questions
>
> - How do you handle schema migrations (e.g., adding a column) across dev/staging/prod?
> - What is the role of `run_as` and service principals in environment promotion?
> - How do you prevent a developer from accidentally deploying to prod from their local machine?

---

**[← Previous: Delta Lake Internals](./03-delta-lake-internals.md) | [↑ Back to Interview Prep](./README.md) | [Next: Streaming & CDC →](./05-streaming-cdc.md)**
