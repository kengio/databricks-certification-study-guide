---
tags: [interview-prep, associate, fundamentals]
---

# Interview Questions — Associate Fundamentals

---

## Question 1: What Is a Data Lakehouse?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Explain what a data lakehouse is and why an organization would choose it over a traditional data warehouse or a data lake.

> [!success]- Answer Framework
>
> **Short Answer**: A data lakehouse combines the low-cost, open-format storage of a data lake with the reliability, performance, and governance features of a data warehouse — primarily through Delta Lake's ACID transactions, schema enforcement, and time travel on top of cloud object storage.
>
> ### Key Points to Cover
>
> - Data lakes store raw data cheaply but lack reliability (no ACID, no schema enforcement)
> - Data warehouses provide strong governance and performance but are expensive and proprietary
> - A lakehouse sits on open-format storage (Parquet/Delta) but adds warehouse-like guarantees
> - Delta Lake provides ACID transactions, schema enforcement, time travel, and unified batch/streaming
> - Single copy of data serves both BI/SQL analytics and ML/data science workloads
> - Eliminates the need to copy data between a lake and a warehouse
>
> ### Example Answer
>
> A data lakehouse is an architecture that brings data warehouse reliability to data lake economics. Traditionally, organizations maintained both a data lake for raw storage and cheap ML workloads, and a data warehouse for reliable BI queries. The problem is you end up with two copies of data, complex ETL between them, and governance headaches.
>
> The lakehouse solves this by storing everything in an open format like Delta Lake on cloud object storage. Delta Lake adds ACID transactions, schema enforcement, and time travel — features you'd expect from a warehouse — directly on top of Parquet files. This means a single copy of data can serve SQL analysts running dashboards and data scientists training models.
>
> On Databricks, the lakehouse is built around Delta Lake for storage, Unity Catalog for governance, and SQL Warehouses or clusters for compute — giving you warehouse performance with lake flexibility.
>
> ### Follow-up Questions
>
> - What specific problems does ACID solve that a plain data lake cannot?
> - How does Delta Lake's transaction log enable time travel?
> - When might you still use a separate data warehouse alongside a lakehouse?

---

## Question 2: Explain the Medallion Architecture

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Walk me through the medallion architecture (Bronze, Silver, Gold). Why do teams use this pattern, and what happens at each layer?

> [!success]- Answer Framework
>
> **Short Answer**: The medallion architecture organizes data into three layers — Bronze (raw ingestion), Silver (cleaned and validated), Gold (business-level aggregates) — to incrementally improve data quality and make pipelines easier to debug, audit, and maintain.
>
> ### Key Points to Cover
>
> - **Bronze**: Raw data as-is from source systems; append-only; preserves full history for reprocessing
> - **Silver**: Cleaned, deduplicated, schema-enforced; joins reference data; represents the "single source of truth"
> - **Gold**: Business-level aggregations, KPI tables, feature tables; optimized for specific consumers (dashboards, ML models)
> - Each layer is a Delta table — you can query, audit, and time-travel at every stage
> - If something breaks, you replay from Bronze rather than re-extracting from source systems
> - Decouples ingestion speed from transformation complexity
>
> ### Example Answer
>
> The medallion architecture is a data design pattern with three layers. **Bronze** is your raw landing zone — data arrives exactly as the source system produced it. You might ingest JSON from Kafka or CSV from a vendor, and you store it as-is in a Delta table with metadata columns like ingestion timestamp and source file name. The key principle is append-only: never modify raw data.
>
> **Silver** is where you apply business logic. You parse the raw data, enforce schema, deduplicate, handle nulls, and join with reference tables. Silver tables represent your "single source of truth" — clean, validated, queryable by analysts and data scientists.
>
> **Gold** tables are purpose-built for specific consumers. A finance dashboard might need daily revenue aggregates; an ML model might need a feature table with user-level metrics. Gold tables are pre-aggregated and optimized for fast reads.
>
> The reason teams use this pattern is debuggability and resilience. If a Silver transformation has a bug, you fix the logic and replay from Bronze — you don't need to re-extract from the source system. Each layer is a Delta table, so you get time travel, audit history, and schema enforcement at every stage.
>
> ### Follow-up Questions
>
> - How would you handle late-arriving data in this architecture?
> - Should Silver tables be overwritten or incrementally updated?
> - What types of tests would you add between layers?

---

## Question 3: Delta Lake vs Plain Parquet

**Level**: Associate
**Type**: Comparison

**Scenario / Question**:
Your team currently stores data as Parquet files. Someone suggests migrating to Delta Lake. What are the key differences, and what problems does Delta Lake solve that Parquet alone cannot?

> [!success]- Answer Framework
>
> **Short Answer**: Parquet is a file format; Delta Lake is a storage layer on top of Parquet that adds a transaction log for ACID guarantees, schema enforcement, time travel, and efficient upserts — features that plain Parquet files cannot provide.
>
> ### Key Points to Cover
>
> - Parquet is a columnar file format — efficient for reads, but has no built-in transaction support
> - Delta Lake stores data as Parquet files plus a `_delta_log/` directory containing JSON transaction logs
> - ACID transactions prevent partial writes, concurrent write corruption, and dirty reads
> - Schema enforcement rejects writes that don't match the table schema
> - Time travel lets you query historical versions of a table
> - `MERGE` (upsert) operations are native — Parquet requires read-all/rewrite-all
> - `OPTIMIZE` and `VACUUM` manage file compaction and cleanup
> - Delta Lake is the default format in Databricks
>
> ### Example Answer
>
> Parquet is a great columnar format — it gives you efficient compression and predicate pushdown for reads. But it's just a file format. If two jobs write to the same Parquet directory at the same time, you can get corrupted data. There's no way to do an atomic upsert — you'd have to read all the data, merge in memory, and rewrite everything. And if a write fails halfway, you're left with partial files.
>
> Delta Lake wraps Parquet with a transaction log (`_delta_log/`). Every write — whether it's an append, update, or delete — is recorded as a JSON commit in this log. This gives you ACID transactions: writes are atomic (all-or-nothing), concurrent readers see consistent snapshots, and failed writes don't leave partial data.
>
> Beyond ACID, Delta Lake adds schema enforcement (rejects bad data at write time), time travel (query any historical version with `VERSION AS OF`), and native `MERGE` for upserts. You also get `OPTIMIZE` for compacting small files and `VACUUM` for cleaning up old versions.
>
> The migration is straightforward since Delta Lake stores data as Parquet under the hood — you're adding capabilities without changing the underlying file format.
>
> ### Follow-up Questions
>
> - How does the transaction log handle concurrent writes?
> - What is the default retention period for time travel, and what affects it?
> - When would you use `CONVERT TO DELTA` vs creating a new Delta table?

---

## Question 4: How Does Unity Catalog Manage Data Access?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Explain how Unity Catalog organizes and secures data. How would you grant a data analyst access to a specific table?

> [!success]- Answer Framework
>
> **Short Answer**: Unity Catalog uses a three-level namespace (`catalog.schema.table`) with an allow-only privilege model. To grant access, you assign `USE CATALOG` on the catalog, `USE SCHEMA` on the schema, and `SELECT` on the table — all three are required for a user to query data.
>
> ### Key Points to Cover
>
> - Three-level namespace: **catalog** > **schema** > **table/view/function**
> - Centralized metastore shared across workspaces
> - Allow-only model — no `DENY` statements; remove access by revoking grants
> - Privileges don't inherit downward: `USE CATALOG` alone doesn't grant `SELECT` on tables
> - Parent permissions (`USE CATALOG`, `USE SCHEMA`) are required to "see through" to child objects
> - Common privilege chain: `USE CATALOG` + `USE SCHEMA` + `SELECT`
> - Supports groups for scalable access management
> - Data lineage is automatically tracked across tables and notebooks
>
> ### Example Answer
>
> Unity Catalog organizes all data assets into a three-level namespace: catalog, schema, and object (table, view, or function). Think of it like a folder hierarchy — the catalog is the top-level container (often per environment or business unit), schemas group related tables, and then you have the actual tables.
>
> The security model is allow-only — there's no `DENY` command. You grant permissions explicitly, and if someone doesn't have a grant, they can't access the object. Importantly, permissions don't cascade downward. Giving someone `USE CATALOG` on a catalog doesn't automatically let them query every table inside it. They also need `USE SCHEMA` on the specific schema and `SELECT` on the table.
>
> So to grant a data analyst access to `analytics_catalog.sales.revenue`, I would run:
>
> ```sql
> GRANT USE CATALOG ON CATALOG analytics_catalog TO analyst_group;
> GRANT USE SCHEMA ON SCHEMA analytics_catalog.sales TO analyst_group;
> GRANT SELECT ON TABLE analytics_catalog.sales.revenue TO analyst_group;
> ```
>
> I'd assign these to a group rather than individual users, which scales better. Unity Catalog also automatically tracks lineage — you can see which notebooks and jobs read from or write to each table, which is valuable for auditing and impact analysis.
>
> ### Follow-up Questions
>
> - What happens if a user has `SELECT` on a table but not `USE SCHEMA` on the parent schema?
> - How would you handle access for a team that needs read access to an entire schema?
> - What is the difference between `OWNER` and `ALL PRIVILEGES`?

---

## Question 5: Databricks Compute — Clusters vs SQL Warehouses

**Level**: Associate
**Type**: Comparison

**Scenario / Question**:
When would you use an all-purpose cluster vs a job cluster vs a SQL warehouse? Walk me through the trade-offs.

> [!success]- Answer Framework
>
> **Short Answer**: All-purpose clusters are for interactive development (notebooks, exploration); job clusters are ephemeral compute spun up for scheduled production workloads and terminated after; SQL warehouses are optimized specifically for SQL queries, dashboards, and BI tool connectivity — each has different cost, performance, and use-case profiles.
>
> ### Key Points to Cover
>
> - **All-purpose clusters**: Interactive development, shared by multiple users, kept running, more expensive per DBU
> - **Job clusters**: Created per job run, terminated on completion, cheaper per DBU, used for production pipelines
> - **SQL warehouses**: Optimized for SQL workloads, auto-scaling, BI tool connectivity (JDBC/ODBC), Photon engine enabled by default
> - Job clusters avoid paying for idle compute — critical for cost optimization
> - SQL warehouses support serverless option (no infrastructure management, faster startup)
> - All-purpose clusters support Python, Scala, R, SQL; SQL warehouses are SQL-only
> - Cluster pools can reduce startup time for job clusters
>
> ### Example Answer
>
> There are three main compute types in Databricks, each designed for different workloads.
>
> **All-purpose clusters** are what data engineers and scientists use day-to-day for interactive notebook development. They stay running while you explore data, iterate on code, and debug. They support Python, Scala, R, and SQL. The trade-off is cost — you're paying for the cluster the entire time it's running, even when you're reading documentation between queries.
>
> **Job clusters** are ephemeral — Databricks creates one when a scheduled job starts and terminates it when the job finishes. This is what you use for production pipelines. They're cheaper per DBU because you only pay for actual compute time. The trade-off is startup latency (a few minutes to provision), which you can mitigate with cluster pools that keep warm instances ready.
>
> **SQL warehouses** are purpose-built for SQL workloads. They're what your data analysts and BI tools connect to. They auto-scale based on query load, support JDBC/ODBC for tools like Tableau and Power BI, and run the Photon engine for faster SQL execution. The serverless option eliminates infrastructure management entirely — Databricks handles provisioning. The trade-off is they only support SQL, not Python or Scala.
>
> The general pattern is: develop on all-purpose clusters, deploy to job clusters, serve dashboards and analyst queries from SQL warehouses.
>
> ### Follow-up Questions
>
> - How does auto-termination work on all-purpose clusters, and why is it important?
> - What is Photon and why is it enabled by default on SQL warehouses?
> - How would you decide between a serverless SQL warehouse and a classic one?

---

## Question 6: What Is Structured Streaming and How Does It Work?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Explain Databricks Structured Streaming in simple terms. How does it process real-time data, and how is it different from batch processing?

> [!success]- Answer Framework
>
> **Short Answer**: Structured Streaming treats a live data stream as an unbounded table that grows as new data arrives. You write the same DataFrame/SQL transformations as batch, but Spark executes them incrementally — processing only new rows each micro-batch rather than reprocessing everything.
>
> ### Key Points to Cover
>
> - Streaming query = batch query that runs continuously on new data
> - Uses **micro-batch** processing by default (checks for new data at configurable intervals)
> - Checkpointing records progress so a failed stream can resume without reprocessing
> - Trigger modes: `availableNow` (process all pending, then stop), `processingTime` (fixed interval), continuous (experimental low-latency)
> - Output modes: append (new rows only), complete (full result), update (changed rows)
> - Auto Loader (`cloudFiles`) is the recommended source for file-based streaming ingestion
> - Exactly-once semantics when paired with a Delta Lake sink and checkpoint
>
> ### Example Answer
>
> Structured Streaming is Spark's API for processing data as it arrives in real time. The core idea is that you write transformations exactly like a batch job — selecting columns, filtering, aggregating — and Spark handles running those transformations incrementally on only the new data.
>
> Under the hood, Spark uses micro-batches by default. It checks the source (Kafka topic, cloud storage folder, etc.) for new data at a configurable interval, processes just those new rows, and writes the results to the sink. It records progress to a checkpoint directory, so if the stream crashes, it picks up exactly where it left off — giving you exactly-once processing guarantees when writing to Delta Lake.
>
> There are different trigger modes depending on your latency needs. `processingTime("10 seconds")` runs a micro-batch every 10 seconds. `availableNow` processes everything that's pending and then stops — useful for scheduled "catch-up" streaming in production jobs.
>
> The big advantage over batch is latency — you process data within seconds or minutes of arrival rather than waiting for a full batch run. And because the API is the same as batch, there's no learning curve for engineers who already know Spark DataFrames.
>
> ### Follow-up Questions
>
> - What happens if a streaming job fails and restarts — how does it avoid duplicate processing?
> - What is Auto Loader and why would you use it instead of a regular `readStream` on files?
> - When would you choose `trigger(availableNow=True)` over a continuous trigger?

---

## Question 7: What Are DLT / LakeFlow Pipelines?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Your team is building a new data pipeline. A colleague suggests using Delta Live Tables (DLT). What is DLT, how does it differ from a regular notebook-based pipeline, and when would you recommend it?

> [!success]- Answer Framework
>
> **Short Answer**: DLT (now called LakeFlow Pipelines) is a declarative framework where you define *what* your tables should contain using Python or SQL, and Databricks manages the *how* — dependency resolution, execution order, infrastructure, error handling, and data quality enforcement through expectations.
>
> ### Key Points to Cover
>
> - **Declarative vs imperative**: You define tables with `@dlt.table` decorators or `CREATE LIVE TABLE` SQL — no manual orchestration
> - Databricks automatically resolves dependencies between tables and executes them in the right order
> - Built-in **data quality expectations**: `@dlt.expect`, `@dlt.expect_or_drop`, `@dlt.expect_or_fail`
> - Manages infrastructure: auto-scaling, retries, cluster lifecycle
> - **APPLY CHANGES** API for CDC / SCD patterns (SCD Type 1 and Type 2)
> - Two table types: **streaming tables** (incremental, append-only) and **materialized views** (fully recomputed)
> - Event log captures data quality metrics, pipeline lineage, and runtime stats
>
> ### Example Answer
>
> DLT, now called LakeFlow Pipelines, is Databricks' declarative approach to building data pipelines. Instead of writing imperative notebook code that manually reads, transforms, and writes data in sequence, you define tables declaratively. You say "this table should contain *this* query" and DLT figures out the execution order, manages the compute, handles retries, and tracks data quality.
>
> For example, in a regular notebook pipeline, you'd write `spark.readStream.load(...)`, transform the data, then `writeStream.toTable(...)`, and manually handle checkpoints and error recovery. In DLT, you just write:
>
> ```python
> @dlt.table
> def silver_orders():
>     return dlt.read_stream("bronze_orders").filter("amount > 0")
> ```
>
> DLT automatically knows that `silver_orders` depends on `bronze_orders` and runs them in the right order.
>
> The killer feature is **expectations** — built-in data quality checks. You can annotate tables with rules like `@dlt.expect_or_drop("valid_amount", "amount > 0")`, and DLT will either warn, drop bad rows, or fail the pipeline depending on the severity you choose. All quality metrics are logged to the event log for monitoring.
>
> I'd recommend DLT when you want managed infrastructure, built-in data quality, and you're building a medallion-style pipeline with clear Bronze → Silver → Gold flow. For ad-hoc exploration or very custom logic, regular notebooks may be more flexible.
>
> ### Follow-up Questions
>
> - What is the difference between a streaming table and a materialized view in DLT?
> - How do DLT expectations compare to writing manual data quality checks?
> - How would you handle SCD Type 2 in a DLT pipeline?

---

## Question 8: How Does Databricks Handle Data Sharing?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
A partner organization needs access to some of your data, but they don't use Databricks. How would you share data with them securely?

> [!success]- Answer Framework
>
> **Short Answer**: Databricks supports **Delta Sharing** — an open protocol for securely sharing live data across organizations without copying it. The provider creates a share containing specific tables/partitions, generates a credential file, and the recipient reads the data using any compatible client (Spark, pandas, Power BI, Tableau) — no Databricks account required.
>
> ### Key Points to Cover
>
> - **Delta Sharing** is an open-source protocol — recipients don't need Databricks
> - Provider creates a **share** (collection of tables or partitions) and a **recipient** (gets a credential file)
> - Data stays in the provider's storage — no copying, no data duplication
> - Recipients get read-only access to the latest version of the shared data
> - Can share specific partitions rather than full tables for fine-grained access
> - Unity Catalog manages shares — you can grant/revoke access with SQL
> - Databricks-to-Databricks sharing uses native Unity Catalog integration (no credential file needed)
>
> ### Example Answer
>
> The recommended approach is Delta Sharing, which is an open protocol built into Databricks. The key selling point is that the recipient doesn't need a Databricks account — they just need a client that supports the Delta Sharing protocol.
>
> Here's how it works: As the data provider, I would create a share in Unity Catalog — essentially a named collection of tables or table partitions I want to expose. Then I create a recipient, which generates a credential file (an activation link). I send that link securely to the partner, and they use it to connect from their tool of choice — pandas, Spark, Power BI, Tableau, or any Delta Sharing-compatible client.
>
> The important thing is that data never leaves my storage. The recipient's client reads directly from my cloud storage using time-limited credentials. I control exactly which tables and even which partitions they can see. If I need to revoke access, I just drop the recipient in Unity Catalog.
>
> ```sql
> -- Provider side
> CREATE SHARE partner_share;
> ALTER SHARE partner_share ADD TABLE analytics.sales.monthly_summary;
> CREATE RECIPIENT partner_org;
> ```
>
> For Databricks-to-Databricks sharing, it's even simpler — you can share directly through Unity Catalog without generating credential files.
>
> ### Follow-up Questions
>
> - How does Delta Sharing differ from simply giving someone access to your S3 bucket?
> - Can you share views or only tables?
> - How would you share only a subset of rows (e.g., region-specific data)?

---

## Question 9: How Do Databricks Jobs and Workflows Work?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
You've built a data pipeline in notebooks and need to run it on a daily schedule in production. Walk me through how Databricks Jobs and Workflows handle this.

> [!success]- Answer Framework
>
> **Short Answer**: A Databricks Job defines one or more tasks (notebooks, Python scripts, SQL queries, DLT pipelines) that run on a schedule or trigger. Tasks can have dependencies forming a DAG, run on ephemeral job clusters (cheaper than all-purpose), and include built-in retries, alerts, and monitoring.
>
> ### Key Points to Cover
>
> - A **job** contains one or more **tasks** arranged as a DAG (directed acyclic graph)
> - Tasks can be: notebooks, Python scripts, SQL queries, DLT pipelines, JAR files, or dbt models
> - **Job clusters** are created per run and terminated after — cost-efficient for production
> - Scheduling options: cron-based, file arrival triggers, continuous
> - Tasks can pass data to downstream tasks via **task values** (`dbutils.jobs.taskValues`)
> - Built-in retry policies: max retries, retry on timeout, retry on failure
> - Alerts via email, Slack, or webhooks on success/failure/duration threshold
> - Run history and logs are available in the Jobs UI for debugging
>
> ### Example Answer
>
> Databricks Jobs is the built-in orchestrator for scheduling and running production workloads. You create a job, define one or more tasks, set dependencies between them, and attach a schedule.
>
> For example, say I have a medallion pipeline with three notebooks: ingest (Bronze), transform (Silver), and aggregate (Gold). I'd create a job with three tasks arranged in sequence — ingest runs first, transform depends on ingest, aggregate depends on transform. This forms a DAG, and Databricks handles the execution order.
>
> Each task runs on a **job cluster** — an ephemeral cluster that Databricks creates when the job starts and terminates when it finishes. This is significantly cheaper than all-purpose clusters because you only pay for actual compute time.
>
> For scheduling, I'd set a cron expression like "run daily at 6:00 AM UTC." I can also configure retry policies — if the ingest task fails due to a transient error, retry up to 3 times with a 5-minute delay. And I'd set up alerts to send a Slack notification if the job fails or runs longer than expected.
>
> Tasks can also pass values to downstream tasks using `dbutils.jobs.taskValues.set()` and `dbutils.jobs.taskValues.get()` — for example, the ingest task could pass the number of rows loaded so the transform task can validate it.
>
> ### Follow-up Questions
>
> - What is the difference between a job cluster and an all-purpose cluster for production pipelines?
> - How would you handle a scenario where Task B should only run if Task A processes more than 1,000 rows?
> - How do you monitor job costs and optimize job cluster sizing?

---

## Question 10: Spark SQL Basics — How Does Spark Process a Query?

**Level**: Associate
**Type**: Conceptual

**Scenario / Question**:
Explain at a high level how Apache Spark processes a SQL query or DataFrame transformation. What are the key stages from when you write `spark.sql("SELECT ...")` to when you get results?

> [!success]- Answer Framework
>
> **Short Answer**: Spark uses lazy evaluation — transformations build a logical plan without executing. When an action triggers execution, Spark's Catalyst optimizer creates an optimized physical plan, which the scheduler divides into stages and tasks distributed across cluster workers.
>
> ### Key Points to Cover
>
> - **Lazy evaluation**: Transformations (select, filter, join) build a plan; nothing executes until an action (count, show, write)
> - **Catalyst optimizer**: Converts logical plan → optimized logical plan → physical plan (predicate pushdown, column pruning, join reordering)
> - **Stages**: Physical plan is split into stages at **shuffle boundaries** (wide transformations like groupBy, join)
> - **Tasks**: Each stage is divided into tasks — one task per partition — distributed across executors
> - **Narrow vs wide transformations**: Narrow (map, filter) don't require shuffle; wide (groupBy, join) require data redistribution
> - **Actions vs transformations**: Transformations are lazy; actions trigger execution
> - **Adaptive Query Execution (AQE)**: Runtime optimization that can change join strategies, coalesce partitions, and handle skew based on actual data statistics
>
> ### Example Answer
>
> When you write `spark.sql("SELECT customer, SUM(amount) FROM orders WHERE region = 'North' GROUP BY customer")`, Spark doesn't immediately execute anything. This is lazy evaluation — Spark builds a logical plan representing the operations: scan the table, filter by region, group by customer, aggregate the sum.
>
> Next, the Catalyst optimizer takes that logical plan and optimizes it. For example, it pushes the `WHERE region = 'North'` filter down as close to the data source as possible (predicate pushdown), so Spark reads fewer files. It prunes columns it doesn't need. It might reorder joins in more complex queries.
>
> The optimized plan becomes a physical plan — the actual execution strategy. This plan is divided into **stages**, split at shuffle boundaries. In our query, there would be at least two stages: one to scan and filter the data (narrow transformations), and another after the shuffle required by `GROUP BY` to aggregate results.
>
> Each stage is divided into **tasks** — one per data partition — and those tasks are distributed across executor nodes in the cluster. Executors process their partitions in parallel and send results back.
>
> Databricks adds **Adaptive Query Execution** (AQE) on top, which makes runtime adjustments — like switching from a sort-merge join to a broadcast join if one side of the join turns out to be small, or coalescing too-small shuffle partitions.
>
> ### Follow-up Questions
>
> - What is a shuffle and why is it expensive?
> - Give an example of a narrow transformation and a wide transformation.
> - How would you use `EXPLAIN` to see the query plan for a slow query?

---

## Question 11: SQL Warehouse Types — Classic vs Pro vs Serverless

**Level**: Associate
**Type**: Comparison

**Scenario / Question**:
Your organization is setting up Databricks SQL for its analytics team. There are three SQL warehouse types — Classic, Pro, and Serverless. How do you choose?

> [!success]- Answer Framework
>
> **Short Answer**: Classic warehouses offer basic SQL analytics at the lowest DBU cost; Pro adds Unity Catalog fine-grained access control, predictive optimization, and query federation; Serverless eliminates infrastructure management with instant startup and auto-scaling but at the highest DBU cost. Choose based on governance needs, operational overhead tolerance, and cost sensitivity.
>
> ### Key Points to Cover
>
> - **Classic**: Basic SQL analytics, lowest DBU rate, manual cluster management, limited governance features
> - **Pro**: Adds Unity Catalog fine-grained access (row/column-level security), predictive optimization support, query federation to external databases, higher DBU rate than Classic
> - **Serverless**: Instant startup (seconds vs minutes), fully managed infrastructure, auto-scaling with no idle cost between queries, highest DBU rate but zero operational overhead
> - Decision framework: governance requirements, operational maturity, workload predictability, budget constraints
> - All three support Photon engine for accelerated SQL execution
> - Serverless is ideal for bursty or unpredictable query patterns; Classic/Pro for steady, predictable workloads
>
> ### Example Answer
>
> The three SQL warehouse types represent a spectrum from more control and lower unit cost to less management and higher unit cost. The right choice depends on your organization's priorities.
>
> **Classic SQL Warehouses** are the baseline option. They provide standard SQL analytics with Photon acceleration at the lowest DBU rate. You manage the cluster configuration — instance type, min/max clusters for concurrency scaling, auto-stop timeout. Classic is suitable for teams that have simple governance needs (workspace-level access control is sufficient) and predictable query patterns where you can right-size the warehouse.
>
> **Pro SQL Warehouses** add enterprise governance and advanced features on top of Classic:
>
> - **Fine-grained access control** via Unity Catalog — row-level and column-level security, dynamic data masking
> - **Predictive optimization** — Databricks automatically runs `OPTIMIZE` and `VACUUM` on your tables based on usage patterns
> - **Query federation** — query external databases (PostgreSQL, MySQL, SQL Server) directly from Databricks SQL without moving data
>
> The DBU rate is higher than Classic, but for any organization using Unity Catalog for governance, Pro is effectively required.
>
> **Serverless SQL Warehouses** remove infrastructure management entirely:
>
> - **Instant startup** — queries begin executing in seconds, no cluster warm-up
> - **Auto-scaling** — Databricks manages capacity based on concurrent query load
> - **No idle cost** — the warehouse scales to zero between queries (you only pay for actual query execution time)
> - **No configuration** — no instance types, no cluster sizing, no auto-stop settings
>
> The DBU rate is the highest of the three, but total cost can be lower for bursty workloads because you eliminate idle compute.
>
> Here is a comparison across key dimensions:
>
> | Dimension | Classic | Pro | Serverless |
> | --------- | ------- | --- | ---------- |
> | DBU cost per unit | Lowest | Medium | Highest |
> | Startup time | 5-10 min | 5-10 min | Seconds |
> | Row/column security | No | Yes | Yes |
> | Query federation | No | Yes | Yes |
> | Predictive optimization | No | Yes | Yes |
> | Infrastructure management | Manual | Manual | None |
> | Idle cost | Yes (until auto-stop) | Yes (until auto-stop) | No |
> | Best for | Simple analytics, tight budgets | Governed analytics, enterprise | Bursty workloads, zero-ops teams |
>
> **Decision framework**: If you need Unity Catalog fine-grained access control, eliminate Classic. If your team wants zero operational overhead and has unpredictable query volumes, choose Serverless. If you have predictable, steady workloads and want to minimize DBU spend while still getting governance features, choose Pro.
>
> ### Follow-up Questions
>
> - When would the total cost of Serverless actually be lower than Pro despite the higher DBU rate?
> - How does concurrency scaling work on Classic and Pro warehouses?
> - What is predictive optimization and how does it reduce manual maintenance?

---

## Question 12: Materialized Views vs Regular Views vs Live Tables

**Level**: Associate
**Type**: Comparison

**Scenario / Question**:
A colleague asks: "Why not just use a regular VIEW instead of creating a Gold Delta table?" Explain the options and when to use each.

> [!success]- Answer Framework
>
> **Short Answer**: Regular views store only the SQL definition and re-execute the query on every read — cheap to create but expensive at query time for large data. Materialized views pre-compute and store results, auto-refreshing when underlying data changes — fast to query but consume storage. DLT live/streaming tables are pipeline-managed Delta tables for production ETL. Choose based on query frequency, data freshness needs, and compute-vs-storage cost trade-offs.
>
> ### Key Points to Cover
>
> - **Regular views**: Stored SQL definition only, re-executed on every query, zero storage cost, always fresh, expensive for complex queries over large data
> - **Materialized views**: Pre-computed results stored as Delta tables, auto-refreshed (incrementally when possible, full recompute otherwise), fast reads, consume storage
> - **DLT streaming tables**: Pipeline-managed, incremental processing, append-only, designed for Bronze/Silver ingestion
> - **DLT materialized views (in DLT context)**: Fully recomputed on each pipeline update, used for Gold aggregations within DLT
> - **Gold Delta tables**: Explicitly written by pipeline code (notebook or DLT), full control over write logic, most common production pattern
> - `CREATE MATERIALIZED VIEW` syntax in Databricks SQL
> - Refresh behavior: incremental refresh when the optimizer can determine the delta, full recompute otherwise
>
> ### Example Answer
>
> This is a common question that reveals important trade-offs between compute cost, query latency, and data freshness. There are four main options, each suited to different scenarios.
>
> **Regular Views** are the simplest option. A view is just a saved SQL query — no data is stored. Every time someone queries the view, the underlying SQL runs against the base tables:
>
> ```sql
> CREATE VIEW gold.daily_revenue AS
> SELECT
>     date,
>     region,
>     SUM(amount) AS total_revenue,
>     COUNT(DISTINCT customer_id) AS unique_customers
> FROM silver.transactions
> GROUP BY date, region;
> ```
>
> This is perfectly fine when:
>
> - The underlying data is small (< 1 GB)
> - The query is simple (no expensive joins or aggregations)
> - The view is queried infrequently
> - You need guaranteed real-time freshness (every query sees the latest data)
>
> The problem is when the view sits on top of a 500 GB Silver table with complex joins. Every dashboard refresh re-executes that expensive query, consuming cluster resources and making users wait.
>
> **Materialized Views** solve the performance problem by pre-computing and storing the result:
>
> ```sql
> CREATE MATERIALIZED VIEW gold.daily_revenue AS
> SELECT
>     date,
>     region,
>     SUM(amount) AS total_revenue,
>     COUNT(DISTINCT customer_id) AS unique_customers
> FROM silver.transactions
> GROUP BY date, region;
> ```
>
> The results are stored as a Delta table. When users query the materialized view, they read from the pre-computed result — instant response, no re-execution of the aggregation. Databricks handles refreshing the materialized view when the underlying `silver.transactions` table changes.
>
> The refresh behavior is important to understand:
>
> - **Incremental refresh**: When the optimizer can determine what changed (e.g., new rows appended to the source), it processes only the delta — fast and cheap
> - **Full recompute**: When changes are complex (e.g., updates or deletes in the source, or the query uses non-incremental operations), the entire materialized view is recomputed
> - Refresh can be triggered manually with `REFRESH MATERIALIZED VIEW gold.daily_revenue` or happens automatically based on the warehouse's refresh schedule
>
> **DLT Streaming Tables and Materialized Views** are the DLT (LakeFlow) equivalents, managed within a pipeline:
>
> ```python
> # DLT streaming table — incremental, append-only (Bronze/Silver)
> @dlt.table
> def silver_transactions():
>     return dlt.read_stream("bronze_transactions").filter("amount > 0")
>
> # DLT materialized view — fully recomputed each pipeline run (Gold)
> @dlt.table
> def gold_daily_revenue():
>     return (
>         dlt.read("silver_transactions")
>         .groupBy("date", "region")
>         .agg(
>             sum("amount").alias("total_revenue"),
>             countDistinct("customer_id").alias("unique_customers")
>         )
>     )
> ```
>
> In DLT, a streaming table processes only new data (incremental), while a materialized view is fully recomputed on each pipeline update. Both are managed by DLT — you define the logic, DLT handles execution, dependencies, and data quality.
>
> **Explicitly Written Gold Delta Tables** are the most common production pattern. Your pipeline code (notebook or DLT) writes the results to a Delta table using `MERGE`, `INSERT OVERWRITE`, or `APPEND`:
>
> ```sql
> -- Explicit Gold table written by a scheduled job
> INSERT OVERWRITE gold.daily_revenue
> SELECT
>     date,
>     region,
>     SUM(amount) AS total_revenue,
>     COUNT(DISTINCT customer_id) AS unique_customers
> FROM silver.transactions
> WHERE date >= current_date() - INTERVAL 7 DAYS
> GROUP BY date, region;
> ```
>
> This gives you full control over refresh timing, partitioning, and write strategy, but you must manage the orchestration yourself (via Databricks Jobs).
>
> **When to use each**:
>
> | Option | Best for | Trade-off |
> | ------ | -------- | --------- |
> | Regular view | Small data, infrequent queries, must be real-time fresh | Expensive at query time for large data |
> | Materialized view | Frequently queried aggregations, dashboard backing | Storage cost, slight staleness between refreshes |
> | DLT streaming table | Incremental ingestion (Bronze/Silver) | Requires DLT pipeline infrastructure |
> | Gold Delta table | Custom write logic, full control over refresh schedule | Manual orchestration required |
>
> ### Follow-up Questions
>
> - How does Databricks decide whether to incrementally refresh or fully recompute a materialized view?
> - Can you create a materialized view on top of a streaming table?
> - What are the storage and compute cost implications of materialized views vs regular views?

---

**[↑ Back to Interview Prep](./README.md) | [Next: File Formats & Spark Internals →](./02-file-formats-spark-internals.md)**
