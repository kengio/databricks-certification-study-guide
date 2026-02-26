---
tags:
  - databricks
  - certification
  - data-engineer
  - mock-exam
aliases:
  - Mock Exam 2 Questions
---

# Mock Exam 2 — Databricks Data Engineer Professional

60 scenario-based questions focusing on advanced topics and scenario-based reasoning. Attempt all questions before revealing answers.

**Total: 60 questions | Time: 120 minutes | Passing: 70% (42/60)**

[← Back to Mock Exam 2](./README.md)

---

## Section 1: Data Processing (Questions 1–18)

## Question 1 *(Medium)*

**Scenario**: A data engineering team ingests millions of small JSON files per day from a cloud storage landing zone. The files are uploaded by thousands of IoT devices. Using Auto Loader with directory listing mode, the pipeline takes over 40 minutes just to discover new files before any processing begins.

**Question**: Which Auto Loader configuration change will most effectively reduce the file discovery time for this pipeline?

A) Set `cloudFiles.maxFilesPerTrigger` to a higher value to process more files per batch
B) Switch to `cloudFiles.useIncrementalListing = true` to use sorted directory listing
C) Switch to `cloudFiles.useNotifications = true` to use file notification mode
D) Set `cloudFiles.schemaLocation` to a faster storage tier for schema caching

> [!success]- Answer
> **Correct Answer: C**
>
> File notification mode uses cloud-native event notifications (e.g., AWS SNS/SQS, Azure Event Grid) to detect new files, eliminating the need to list the entire directory. This is dramatically faster than directory listing mode when dealing with millions of files. Option A increases batch size but does not speed up file discovery. Option B improves directory listing but still requires listing operations that are slow at scale.

---

## Question 2 *(Hard)*

**Scenario**: A streaming pipeline uses Auto Loader to ingest Parquet files with a defined schema stored at a checkpoint location. After a deployment, the upstream system adds two new required columns to the Parquet files. The pipeline is restarted and immediately fails with an `AnalysisException` indicating the new columns are missing from the existing schema.

**Question**: What happens when Auto Loader encounters schema changes after recovering from a checkpoint?

A) Auto Loader uses the previously inferred schema from the schema location and rejects files that do not match, causing a `UnknownFieldException` that stops the stream unless schema evolution is configured
B) Auto Loader automatically adds the new columns and backfills existing data with null values
C) Auto Loader ignores the new columns and continues processing with the original schema only
D) Auto Loader restarts from the beginning of the source directory, re-reading all files with the new schema

> [!success]- Answer
> **Correct Answer: A**
>
> Auto Loader persists the inferred schema to the schema location and reuses it across restarts. When new columns appear, the behavior depends on `cloudFiles.schemaEvolutionMode`. Without explicit configuration, unexpected schema changes cause the stream to fail. Options B and C describe behaviors that only occur with specific `schemaEvolutionMode` settings (`addNewColumns` or `none` respectively).

---

## Question 3 *(Hard)*

**Scenario**: A retail company needs to implement SCD Type 2 on a `dim_customer` table. When a customer updates their address, the current record must be closed (set `end_date` and `is_current = false`) and a new record must be inserted with `is_current = true`. The source data arrives as a staging table with only the latest state per customer.

**Question**: Which MERGE implementation correctly handles SCD Type 2 for this use case?

A) A single MERGE with `WHEN MATCHED THEN UPDATE SET end_date = current_date(), is_current = false` and `WHEN NOT MATCHED THEN INSERT` -- this handles both closing old records and inserting new ones
B) Two separate SQL statements: first an UPDATE to close changed records, then an INSERT for the new versions, wrapped in a transaction
C) A single MERGE with `WHEN MATCHED AND target.is_current = true AND target.address <> source.address THEN UPDATE SET *` and `WHEN NOT MATCHED THEN INSERT *`
D) A single MERGE with `WHEN MATCHED AND target.is_current = true AND target.address <> source.address THEN UPDATE SET end_date = current_date(), is_current = false` combined with a separate INSERT statement for new active records using a UNION of the matched changes

> [!success]- Answer
> **Correct Answer: D**
>
> SCD Type 2 requires two operations for changed records: closing the existing record and inserting a new active version. A single MERGE cannot both update and insert for the same matched key, so the correct pattern uses MERGE to close the old record and a separate INSERT for the new version. Option A only closes old records but never inserts the new active version. Option C overwrites the record entirely (SCD Type 1 behavior).

---

## Question 4 *(Hard)*

**Scenario**: A data engineer needs to join two streaming DataFrames: `orders` (with `order_time`) and `shipments` (with `ship_time`). The business rule states that a shipment must occur within 7 days of the order to be considered valid. Both streams have watermarks defined.

**Question**: Which join condition correctly implements this time-bounded stream-stream join?

A) `orders.order_id == shipments.order_id` with a post-join filter `shipments.ship_time - orders.order_time <= interval 7 days`
B) `orders.order_id == shipments.order_id AND shipments.ship_time BETWEEN orders.order_time AND orders.order_time + interval 7 days`
C) `orders.order_id == shipments.order_id` with watermarks set to 7 days on both streams
D) `orders.order_id == shipments.order_id AND shipments.ship_time - orders.order_time <= 7` with implicit day conversion

> [!success]- Answer
> **Correct Answer: B**
>
> The time-range condition must be part of the join condition (not a post-join filter) so that Spark can use it along with watermarks to determine when old state can be discarded. The `BETWEEN` clause clearly expresses the valid time window. Option A applies the filter after the join, which prevents Spark from optimizing state cleanup. Option C defines watermarks but lacks the required time-range join condition. Option D uses an integer comparison rather than an interval expression.

---

## Question 5 *(Hard)*

**Scenario**: A data engineer uses `foreachBatch()` to write streaming micro-batches to both a Delta table and an external PostgreSQL database. If the pipeline fails mid-batch and restarts, some records may be written to PostgreSQL twice.

**Question**: Which pattern ensures exactly-once semantics for the PostgreSQL writes within `foreachBatch()`?

A) Use the `batchId` parameter to track which batches have been committed in a metadata table in PostgreSQL, and skip re-processing of already-committed batch IDs
B) Use `outputMode("append")` with checkpointing, which guarantees exactly-once writes to all sinks automatically
C) Deduplicate the PostgreSQL table after each batch using a `DELETE` of duplicate rows based on primary key
D) Write to PostgreSQL first and Delta second so that the checkpoint only advances after both succeed

> [!success]- Answer
> **Correct Answer: A**
>
> The `batchId` provided to the `foreachBatch` function is guaranteed to be the same for a replayed batch after failure recovery. By recording the committed `batchId` in PostgreSQL and checking it before writing, the pipeline achieves idempotent writes and exactly-once semantics. Option B only guarantees exactly-once for Delta sinks, not external databases. Option C creates a window of inconsistency and is not truly idempotent.

---

## Question 6 *(Medium)*

**Scenario**: A data engineer reads the Change Data Feed from a Delta table and needs to process the different types of row-level changes separately. The engineer writes a filter condition to isolate updated records but is unsure of the exact column values.

**Question**: Which set of values does the `_change_type` column contain in a Change Data Feed?

A) `insert`, `update`, `delete`
B) `added`, `modified`, `removed`
C) `insert`, `update_preimage`, `update_postimage`, `delete`
D) `create`, `update_before`, `update_after`, `drop`

> [!success]- Answer
> **Correct Answer: C**
>
> The `_change_type` column in CDF contains four possible values: `insert` for new rows, `update_preimage` for the row state before an update, `update_postimage` for the row state after an update, and `delete` for removed rows. The pre/post image distinction for updates is critical for CDC pipelines that need to detect exactly which columns changed.

---

## Question 7 *(Medium)*

**Scenario**: A data engineering team manages hundreds of Delta tables across multiple schemas. They spend significant time manually running `OPTIMIZE` and `VACUUM` operations and tuning Z-ORDER columns. The team wants to automate these maintenance tasks.

**Question**: What does Databricks predictive optimization automate when enabled on a Unity Catalog metastore?

A) It automates only `VACUUM` operations based on storage usage thresholds
B) It automates only `OPTIMIZE` operations by monitoring query patterns
C) It automates `OPTIMIZE` and `VACUUM` but requires manual Z-ORDER column specification
D) It automates `OPTIMIZE`, `VACUUM`, and `ZORDERING` by analyzing query patterns and table statistics to determine when and how to run maintenance

> [!success]- Answer
> **Correct Answer: D**
>
> Predictive optimization is a Unity Catalog feature that automatically runs `OPTIMIZE` (including file compaction), `VACUUM` (file cleanup), and `ZORDERING` (based on observed query predicates) without manual intervention. It uses table access patterns and statistics to determine the optimal schedule and configuration. Options A through C each describe only a subset of what predictive optimization handles.

---

## Question 8 *(Hard)*

**Scenario**: An IoT streaming pipeline receives sensor readings that occasionally include duplicates due to at-least-once delivery. The pipeline uses a 2-hour watermark on `event_time`. A data engineer uses `dropDuplicates("sensor_id", "reading_id")` to remove duplicates but notices that state size grows unboundedly over days of continuous operation.

**Question**: Which approach resolves the unbounded state growth while still deduplicating records?

A) Reduce the watermark to 30 minutes so state expires faster
B) Replace `dropDuplicates()` with `dropDuplicatesWithinWatermark("sensor_id", "reading_id")` which uses the existing watermark to bound deduplication state
C) Add a `DISTINCT` clause in a downstream SQL query instead of deduplicating in the stream
D) Increase executor memory to accommodate the growing state

> [!success]- Answer
> **Correct Answer: B**
>
> `dropDuplicatesWithinWatermark()` leverages the existing watermark to automatically expire deduplication state for events older than the watermark threshold. In contrast, `dropDuplicates()` retains all seen keys in state indefinitely because it has no time bound. Option A changes the late-data tolerance and does not fix the root cause since `dropDuplicates` ignores the watermark entirely.

---

## Question 9 *(Medium)*

**Scenario**: A data engineer configures Auto Loader with `cloudFiles.schemaEvolutionMode = "rescue"` to ingest CSV files. After several weeks, the team notices a `_rescued_data` column in the target table contains non-null JSON strings for some rows.

**Question**: What does the `_rescued_data` column contain?

A) A JSON string containing column values that did not conform to the expected schema, including columns with unexpected names or data that failed type casting
B) The complete original raw record as a single string for any row that had at least one parsing warning
C) Only the column names that were added since the schema was first inferred
D) A binary-encoded copy of the entire source file that contained the mismatched record

> [!success]- Answer
> **Correct Answer: A**
>
> The `_rescued_data` column captures a JSON map of any data that could not be parsed into the expected schema. This includes columns with unexpected names not in the schema and values that failed type casting (e.g., a string in an integer column). It does not store the entire raw record or file, only the specific fields that did not fit the defined schema.

---

## Question 10 *(Medium)*

**Scenario**: A data analyst needs to query a Delta table as it existed at a specific point in time for a compliance audit. The analyst knows the exact timestamp of the end-of-day snapshot they need, but does not know which Delta version corresponds to that timestamp. Another analyst needs to reproduce a specific report that was generated from a known Delta version.

**Question**: When is it more appropriate to use `TIMESTAMP AS OF` versus `VERSION AS OF` for Delta time travel?

A) `TIMESTAMP AS OF` is for streaming queries; `VERSION AS OF` is for batch queries
B) `VERSION AS OF` should always be preferred because timestamps can be ambiguous across time zones
C) `TIMESTAMP AS OF` works only with dates, not datetime values; `VERSION AS OF` supports both
D) `TIMESTAMP AS OF` is ideal when querying by a business point-in-time (e.g., end-of-day), while `VERSION AS OF` is ideal for reproducibility when the exact commit version is known

> [!success]- Answer
> **Correct Answer: D**
>
> `TIMESTAMP AS OF` maps a datetime to the latest Delta version committed at or before that timestamp, making it natural for business-time queries like audits. `VERSION AS OF` uses the exact commit version number, ensuring deterministic reproducibility when the specific version is tracked (e.g., in a report metadata table). Both work in batch and streaming contexts, and timestamps support full datetime precision.

---

## Question 11 *(Hard)*

**Scenario**: A data engineer implements a custom stateful streaming operation using `flatMapGroupsWithState()` to track user sessions. Sessions should expire if no event is received within 30 minutes. The engineer needs to choose between `ProcessingTimeTimeout` and `EventTimeTimeout`.

**Question**: What is the key difference between `ProcessingTimeTimeout` and `EventTimeTimeout` in stateful streaming?

A) `ProcessingTimeTimeout` triggers based on the event timestamp column, while `EventTimeTimeout` triggers based on wall-clock time
B) `ProcessingTimeTimeout` is more accurate for out-of-order data because it accounts for late-arriving events
C) `EventTimeTimeout` triggers when the watermark advances past the timeout timestamp, providing deterministic timeout behavior based on data timestamps rather than wall-clock time
D) There is no functional difference; they are aliases for the same timeout mechanism

> [!success]- Answer
> **Correct Answer: C**
>
> `EventTimeTimeout` is driven by the watermark, so the timeout fires when the watermark (derived from event timestamps across all partitions) advances past the configured timeout timestamp. This makes it deterministic and reproducible during reprocessing. `ProcessingTimeTimeout` uses the system clock, so timeouts depend on when micro-batches execute, which is non-deterministic and not reproducible.

---

## Question 12 *(Medium)*

**Scenario**: A data engineer is tasked with running `VACUUM` on a large Delta table to reclaim storage. The engineer considers setting the retention period to 0 hours to remove all historical files immediately.

**Question**: Why is running `VACUUM` with a retention period less than 7 days considered dangerous?

A) It will permanently delete the Delta transaction log, making the table unreadable
B) It may remove files that are still needed by concurrent readers or writers that started before the VACUUM, leading to query failures with `FileNotFoundException`
C) It converts the Delta table to a plain Parquet table by removing all metadata files
D) It triggers a full table rewrite that doubles the storage usage temporarily

> [!success]- Answer
> **Correct Answer: B**
>
> VACUUM with a short retention period can delete data files that are still referenced by long-running queries or streaming jobs that hold an older table snapshot. These queries will fail with `FileNotFoundException` when they attempt to read the removed files. The 7-day default retention provides a safety buffer for concurrent operations. The transaction log (`_delta_log`) is not affected by VACUUM.

---

## Question 13 *(Medium)*

**Scenario**: A data engineer builds a streaming pipeline that computes a running count of events per product category using `groupBy("category").count()`. The engineer tries to use `outputMode("append")` but the query fails at runtime.

**Question**: Which output mode correctly supports streaming aggregations with `groupBy`?

A) `outputMode("complete")` outputs the entire aggregation result table after each micro-batch, replacing all previous output
B) `outputMode("append")` writes only new rows and is the only mode that supports aggregations
C) `outputMode("update")` is required because it is the only mode that works with stateful operations
D) Both `outputMode("append")` and `outputMode("update")` work equally well for aggregations without watermarks

> [!success]- Answer
> **Correct Answer: A**
>
> For streaming aggregations without a watermark, `complete` mode is required because the aggregation results change with every micro-batch and must be fully rewritten. `append` mode fails because Spark cannot determine when an aggregation result is finalized without a watermark. With a watermark defined, `append` and `update` modes also become available, but without one, only `complete` works.

---

## Question 14 *(Medium)*

**Scenario**: A data engineer configures Auto Loader to read JSON files using `format("cloudFiles")` and sets both `cloudFiles.format` and the top-level `.format()` in the DataStreamReader chain. The engineer is confused about which setting takes precedence.

**Question**: How does the configuration hierarchy work for Auto Loader's file format setting?

A) The top-level `.format("json")` call on the DataStreamReader overrides `cloudFiles.format`
B) The two settings are independent: `.format()` sets the stream source type and `cloudFiles.format` sets the file parsing format
C) Setting both causes an `IllegalArgumentException` at runtime because they conflict
D) `.format("cloudFiles")` is required to activate Auto Loader as the stream source, and `cloudFiles.format` separately specifies the data file format (e.g., JSON, CSV, Parquet) to parse within Auto Loader

> [!success]- Answer
> **Correct Answer: D**
>
> Auto Loader requires `.format("cloudFiles")` on the DataStreamReader to identify the source as Auto Loader. The `cloudFiles.format` option then tells Auto Loader which file format parser to use for the actual data files. These are not competing settings but operate at different levels: one selects the streaming source, the other configures it. Using `.format("json")` directly would bypass Auto Loader entirely and use the standard file stream source.

---

## Question 15 *(Medium)*

**Scenario**: A multi-hop (Bronze/Silver/Gold) architecture ingests raw event data into Bronze, then applies transformations and quality checks into Silver. Some records arrive with missing required fields, malformed timestamps, or unexpected data types. The team wants to avoid data loss while maintaining data quality in downstream layers.

**Question**: Where in the multi-hop architecture should malformed data be handled to balance data quality and completeness?

A) At the Gold layer, since business logic determines what is valid
B) At the Bronze-to-Silver transition, where data quality rules quarantine bad records to a separate "quarantine" table while valid records proceed to Silver
C) At ingestion into Bronze, rejecting any records that do not pass schema validation
D) Malformed data should be silently dropped at every layer to maintain clean tables

> [!success]- Answer
> **Correct Answer: B**
>
> The Bronze-to-Silver transition is the standard point for data quality enforcement in a multi-hop architecture. Bronze stores raw data as-is for auditability and replay. At the Silver layer, quality rules validate, clean, and route malformed records to a quarantine table for investigation. Option C risks data loss at ingestion, and Option D provides no visibility into data quality issues.

---

## Question 16 *(Hard)*

**Scenario**: A data engineer adds a `CHECK` constraint to an existing Delta table with 500 million rows: `ALTER TABLE orders ADD CONSTRAINT positive_amount CHECK (amount > 0)`. The table currently contains 200 rows where `amount` is 0 or negative.

**Question**: What happens when this `ALTER TABLE ADD CONSTRAINT` statement is executed?

A) The constraint is added and the 200 violating rows are automatically deleted
B) The constraint is added successfully but only enforced on future writes; existing rows are not validated
C) The statement fails because existing rows violate the constraint, and the constraint is not added until all violating data is removed or corrected
D) The constraint is added and the 200 violating rows are quarantined to a separate error table

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake validates all existing data against the CHECK constraint before adding it. If any rows violate the constraint, the `ALTER TABLE` statement fails and the constraint is not created. The engineer must first clean or remove the violating rows before the constraint can be added. This prevents the table from entering an inconsistent state with a constraint that existing data already violates.

---

## Question 17 *(Medium)*

**Scenario**: A data engineer is designing a streaming pipeline that reads from Kafka and writes to a Delta table. The team needs to understand the exactly-once guarantees provided by Structured Streaming with Delta Lake as the sink.

**Question**: What level of delivery guarantee does Structured Streaming provide with checkpointing and a Delta Lake sink?

A) Exactly-once end-to-end: Structured Streaming's checkpointing tracks offsets, and Delta Lake's transaction log ensures each micro-batch is committed atomically and idempotently, so replayed batches produce no duplicates
B) At-least-once: checkpointing tracks offsets but Delta Lake may write duplicate rows if a batch is replayed after a partial commit
C) At-most-once: if a failure occurs, the uncommitted batch is lost and processing resumes from the next offset
D) Exactly-once only if `foreachBatch()` is used with manual deduplication logic

> [!success]- Answer
> **Correct Answer: A**
>
> Structured Streaming with checkpointing and a Delta Lake sink provides exactly-once end-to-end guarantees. The checkpoint records which offsets have been processed, and Delta Lake's transaction log ensures that write operations are atomic and idempotent. If a micro-batch is replayed after failure, Delta detects the duplicate commit and does not write the data again.

---

## Question 18 *(Hard)*

**Scenario**: A daily batch pipeline uses `MERGE` to upsert fact records from a staging table into a target fact table. The fact table joins to a `dim_product` dimension table. Occasionally, new products appear in the fact staging data before they have been added to the dimension table, causing foreign key mismatches.

**Question**: What is the recommended pattern for handling late-arriving dimension data in an incremental batch pipeline?

A) Delay the fact table MERGE until all dimension tables are fully loaded, using a job dependency that blocks the fact pipeline
B) Reject fact records with unknown dimension keys by filtering them out before the MERGE, accepting the data loss
C) Use a surrogate key of -1 for unknown dimensions and update the fact records later when the dimension arrives, but this requires a second pass over the data
D) Insert fact records with the unknown dimension key, place those records into an "early-arriving facts" holding table, and reprocess them in the next pipeline run after the dimension has been loaded

> [!success]- Answer
> **Correct Answer: D**
>
> The early-arriving facts pattern captures fact records whose dimension keys are not yet available in a holding (or error) table, then reprocesses them in subsequent runs once the dimension data has arrived. This avoids data loss (Option B), avoids tight pipeline coupling and delays (Option A), and avoids the complexity of placeholder surrogate keys that must be corrected later (Option C).

---

## Section 2: Databricks Tooling (Questions 19–30)

## Question 19 *(Medium)*

**Scenario**: A data engineering team builds a notebook that generates reports for different business units. The notebook must allow users to select a business unit from a predefined list when running interactively, and the same notebook must accept the business unit as a parameter when triggered by a scheduled job. The engineer uses `dbutils.widgets.dropdown("business_unit", "finance", ["finance", "marketing", "operations", "engineering"])` to create the parameter.

**Question**: When the scheduled job needs to generate the report for the "operations" business unit, how should the job task be configured to override the widget default?

A) Set a cluster environment variable `BUSINESS_UNIT=operations` and modify the notebook to read from `os.environ`
B) In the notebook task configuration, set `base_parameters: {"business_unit": "operations"}` to override the widget default
C) Create a separate copy of the notebook with the dropdown default changed to "operations"
D) Use `spark.conf.set("business_unit", "operations")` in an init script attached to the job cluster

> [!success]- Answer
> **Correct Answer: B**
>
> The `base_parameters` field in a notebook task directly maps to widget names and overrides their default values at runtime. This is the intended mechanism for parameterizing notebooks across interactive and job contexts. Options A and D bypass the widget system entirely, and Option C creates maintenance overhead with duplicated notebooks.

---

## Question 20 *(Medium)*

**Scenario**: A platform team is migrating their deployment pipelines from the legacy Databricks CLI (version 0.x) to Databricks Asset Bundles (DABs) using the new Databricks CLI (version 0.200+). They currently use JSON template files and shell scripts to deploy jobs, clusters, and notebooks. A team member asks what key difference they should expect during the migration.

**Question**: Which statement correctly describes a key difference between Databricks Asset Bundles and the legacy CLI approach?

A) Asset Bundles require all resources to be defined in Python rather than YAML or JSON
B) Asset Bundles only support job deployments and cannot manage clusters or permissions
C) Asset Bundles use declarative YAML configuration files (`databricks.yml`) that define resources, environments, and deployment targets in a single project structure
D) Asset Bundles replace the REST API entirely and cannot be used alongside direct API calls

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Asset Bundles introduce a declarative, project-based approach using `databricks.yml` files where resources (jobs, pipelines, etc.), environment-specific overrides, and deployment targets are defined together. This replaces the imperative scripting approach of the legacy CLI. Option A is wrong because DABs use YAML, Option B understates their capabilities, and Option D is incorrect since the API and bundles can coexist.

---

## Question 21 *(Medium)*

**Scenario**: A data engineer needs to create a multi-task job using the REST API (Jobs 2.1) where Task B and Task C both depend on Task A completing successfully, and Task D depends on both Task B and Task C completing. The engineer constructs the JSON payload for the `POST /api/2.1/jobs/create` endpoint.

**Question**: Which JSON structure correctly defines the task dependency graph for this job?

A) Define each task with a `depends_on` array referencing parent task keys, such as Task B having `"depends_on": [{"task_key": "task_a"}]` and Task D having `"depends_on": [{"task_key": "task_b"}, {"task_key": "task_c"}]`
B) Set a single `execution_order` array at the job level listing tasks in sequential order: `["task_a", "task_b", "task_c", "task_d"]`
C) Use `run_after` fields on each task with a single string value referencing one parent, requiring a separate mechanism for multi-parent dependencies
D) Define a `dag` object at the job level with an adjacency list of task edges separate from the task definitions

> [!success]- Answer
> **Correct Answer: A**
>
> The Jobs API 2.1 uses a `depends_on` array within each task definition to specify upstream dependencies by `task_key`. This allows expressing complex DAGs including fan-out and fan-in patterns directly within the task list. Option B would enforce purely sequential execution, Option C incorrectly limits dependencies to a single parent, and Option D describes a structure not used by the Jobs API.

---

## Question 22 *(Hard)*

**Scenario**: A startup runs ad hoc data exploration notebooks during business hours and nightly batch ETL pipelines. The exploration workloads are unpredictable in timing and size, often sitting idle between queries. The nightly ETL pipelines are well-characterized with stable resource requirements and run for approximately 2 hours each night. The team wants to minimize cost while maintaining fast startup times for interactive work.

**Question**: Which compute configuration best balances cost and responsiveness for these two workload types?

A) Use a single large all-purpose cluster for both workloads with auto-scaling enabled
B) Use job clusters for interactive exploration and serverless compute for nightly ETL
C) Use all-purpose clusters with auto-termination for both workloads to ensure resources are freed
D) Use serverless compute for ad hoc exploration notebooks and job clusters for the nightly ETL pipelines

> [!success]- Answer
> **Correct Answer: D**
>
> Serverless compute eliminates startup latency and charges only for active usage, making it ideal for unpredictable, bursty interactive workloads. Job clusters are cost-optimized for scheduled batch work since they offer lower DBU rates and auto-terminate after each run. Option A wastes resources during idle periods, Option B reverses the optimal assignment, and Option C still incurs higher DBU rates for production workloads.

---

## Question 23 *(Medium)*

**Scenario**: A data engineering team runs 50 scheduled jobs throughout the day, each creating a new job cluster. They notice that cluster startup time averages 5-7 minutes, which delays pipeline SLAs. The clusters all use the same instance type (`i3.xlarge`) and Databricks Runtime version. The team wants to reduce startup time without changing the job definitions significantly.

**Question**: Which approach most effectively reduces cluster startup time for these jobs?

A) Switch all jobs to use a single shared all-purpose cluster with auto-scaling to avoid repeated cluster creation
B) Create an instance pool with `i3.xlarge` instances and configure each job cluster to use the pool, keeping warm instances available for immediate allocation
C) Increase the cluster size for each job so that Spark initialization is parallelized across more nodes
D) Attach init scripts to pre-install all libraries at the cluster level so startup only involves launching the runtime

> [!success]- Answer
> **Correct Answer: B**
>
> Instance pools maintain a set of warm (pre-provisioned) cloud instances that can be allocated to clusters instantly, reducing startup time from minutes to seconds. Since all jobs use the same instance type, a shared pool maximizes reuse. Option A sacrifices job isolation and cost optimization, Option C does not reduce provisioning time, and Option D addresses library install time but not the dominant cost of instance provisioning.

---

## Question 24 *(Medium)*

**Scenario**: A governance team needs to enforce that all data engineering clusters in the workspace use specific Databricks Runtime versions (13.3 LTS or 14.3 LTS only), have a maximum of 8 worker nodes, are tagged with a `cost_center` value, and cannot enable credential passthrough. They want these rules applied automatically when any engineer creates a cluster.

**Question**: Which Databricks feature allows the governance team to enforce these constraints?

A) Cluster policies that define allowed attribute values, maximum limits, and required tags, then assign the policy to data engineering groups
B) Workspace-level admin settings that globally restrict all cluster configurations to the approved runtime versions
C) Unity Catalog metastore-level compute restrictions that govern runtime versions and node counts
D) Custom init scripts that validate cluster configuration at startup and terminate non-compliant clusters

> [!success]- Answer
> **Correct Answer: A**
>
> Cluster policies provide fine-grained, declarative constraints on cluster attributes including runtime versions (allowlist), maximum nodes (range), required tags (fixed values), and disabled features. Policies are assigned to groups so engineers can only create compliant clusters. Option B lacks the granularity needed, Option C does not manage compute configurations, and Option D is reactive rather than preventive.

---

## Question 25 *(Medium)*

**Scenario**: A workspace administrator creates a folder structure `/Workspace/Projects/TeamAlpha/` and grants the `data_engineers` group CAN MANAGE permission on the `TeamAlpha` folder. A team member creates a new notebook inside this folder. Another engineer from the `data_analysts` group, who has no explicit permissions on the folder, reports that they cannot view the notebook.

**Question**: Which statement correctly explains the permission behavior in this scenario?

A) The analyst cannot view the notebook because notebook-level permissions always override folder-level permissions
B) The analyst should be able to view the notebook because all authenticated users have implicit read access to all workspace objects
C) The analyst cannot view the notebook because Databricks workspace permissions are additive and do not grant implicit access
D) The analyst cannot view the notebook because folder-level ACLs are inherited by child objects, and without explicit permissions on the folder or notebook, the analyst has no access

> [!success]- Answer
> **Correct Answer: D**
>
> Workspace folder permissions use inheritance: child objects (notebooks, sub-folders) inherit the ACLs of their parent folder. Since the `data_analysts` group was not granted any permission on the `TeamAlpha` folder, they inherit no access to objects within it. Option A incorrectly states that notebook permissions override folder permissions (they supplement them), Option B is false, and Option C is partially correct but misses the inheritance mechanism.

---

## Question 26 *(Medium)*

**Scenario**: A data engineer has a main orchestration notebook that needs to call a utility notebook. When using `%run ./utils`, all variables and functions defined in `utils` become available in the main notebook's scope. The engineer considers switching to `dbutils.notebook.run("./utils", timeout_seconds=120)` instead. A colleague warns that the behavior will be different.

**Question**: Which statement correctly describes a key behavioral difference between `%run` and `dbutils.notebook.run()`?

A) `%run` executes the child notebook in a separate process while `dbutils.notebook.run()` executes in the same process
B) `dbutils.notebook.run()` executes the child notebook in an isolated context and returns only a string result, whereas `%run` merges the child's execution context (variables, functions, imports) into the calling notebook
C) `dbutils.notebook.run()` supports passing DataFrames as parameters while `%run` only supports string parameters
D) `%run` is asynchronous and returns immediately while `dbutils.notebook.run()` blocks until completion

> [!success]- Answer
> **Correct Answer: B**
>
> `%run` is a compile-time inclusion that merges the child notebook's entire execution context (all variables, functions, and imports) into the parent, as if the code were pasted inline. `dbutils.notebook.run()` launches the child in an isolated context and can only return a single string via `dbutils.notebook.exit()`. Option A reverses the isolation model, Option C is incorrect since neither method passes DataFrames directly, and Option D is incorrect since `%run` also blocks.

---

## Question 27 *(Medium)*

**Scenario**: A data analytics team is evaluating Databricks SQL warehouse tiers. They need to run interactive dashboards for executives, support concurrent BI tool connections from 20 analysts, and use query federation to join Databricks tables with data in an external PostgreSQL database. Cost is a consideration but not the primary driver.

**Question**: Which Databricks SQL warehouse type meets all of these requirements?

A) Serverless SQL warehouse, which provides instant scaling, high concurrency, built-in query federation, and eliminates infrastructure management overhead
B) Pro SQL warehouse, which supports query federation and high concurrency but requires manual cluster management
C) Classic SQL warehouse, which provides the lowest cost and supports all the required features including query federation
D) Any warehouse type works since query federation, concurrency, and dashboards are available on all tiers

> [!success]- Answer
> **Correct Answer: A**
>
> Serverless SQL warehouses provide instant elastic scaling for high concurrency, built-in support for query federation (including external databases like PostgreSQL), and require no infrastructure management. Pro warehouses support federation but lack serverless scaling benefits. Classic warehouses do not support query federation, making Option C incorrect. Option D is wrong because feature availability varies across tiers.

---

## Question 28 *(Medium)*

**Scenario**: A data engineer needs to store raw CSV and JSON files uploaded by external partners in Unity Catalog for governed access. The files should be accessible via SQL and Python, and the team wants Unity Catalog to manage the lifecycle and permissions of the stored files. The files should not be converted to Delta format since downstream systems require the original file formats.

**Question**: Which Unity Catalog feature is most appropriate for this requirement?

A) Create an external table with `STORED AS CSV` format to register the files in Unity Catalog
B) Create an external location pointing to the cloud storage path where partner files are uploaded
C) Create a managed volume within a Unity Catalog schema so that files are stored under Unity Catalog's managed storage with full lifecycle governance
D) Create a Delta table and use `COPY INTO` to ingest the CSV/JSON files, then export them back to the original format when needed

> [!success]- Answer
> **Correct Answer: C**
>
> Managed volumes in Unity Catalog store files in the catalog's managed storage location, providing full lifecycle management (files are deleted when the volume is dropped) and governed access through Unity Catalog permissions. Files retain their original format and are accessible via `/Volumes/` paths. Option A does not apply since the requirement is for file storage, not tabular data. Option B provides governance over a location but not lifecycle management. Option D adds unnecessary conversion steps.

---

## Question 29 *(Hard)*

**Scenario**: A data engineer needs to schedule a job that runs Monday through Friday at 6:00 AM, 12:00 PM, and 6:00 PM UTC. The job should also be configured with a retry policy of up to 3 retries with a 5-minute interval between attempts if any task fails.

**Question**: Which configuration correctly implements both the schedule and retry policy?

A) Use three separate jobs each with a simple daily cron schedule (`0 6 * * 1-5`, `0 12 * * 1-5`, `0 18 * * 1-5`) and configure retries at the job level with `max_retries: 3`
B) Use a single cron expression `0 6,12,18 * * MON-FRI` with a task-level `retry_policy` of `max_retries: 3, min_retry_interval_millis: 300000`
C) Use a continuous trigger with a conditional check on the current hour and day, and implement retry logic within the notebook code using try/except blocks
D) Use a single cron expression `0 6,12,18 * * 1-5` with a task-level `retry_policy` specifying `max_retries: 3` and `min_retry_interval_millis: 300000`

> [!success]- Answer
> **Correct Answer: D**
>
> The cron expression `0 6,12,18 * * 1-5` correctly triggers at 6:00, 12:00, and 18:00 on weekdays (1-5 represents Monday-Friday in the Databricks/Quartz cron format). The task-level `retry_policy` with `max_retries` and `min_retry_interval_millis` (300000ms = 5 minutes) configures automatic retries. Option A unnecessarily creates three separate jobs. Option B uses `MON-FRI` which is not valid in the Quartz cron format used by Databricks. Option C is overly complex and loses built-in retry tracking.

---

## Question 30 *(Medium)*

**Scenario**: A data engineering team needs to install a custom monitoring agent on every cluster in the workspace. They also need to install a team-specific Python library only on clusters used by the data science team. An engineer proposes using init scripts but is unsure about the execution model.

**Question**: Which statement correctly describes the behavior of global and cluster-scoped init scripts in Databricks?

A) Global init scripts and cluster-scoped init scripts run in parallel during cluster startup, with no guaranteed ordering between them
B) Global init scripts run first on every cluster in the workspace, followed by cluster-scoped init scripts, allowing the monitoring agent to be installed globally while team-specific libraries are added via cluster-scoped scripts
C) Cluster-scoped init scripts run before global init scripts, so team-specific configurations take precedence over workspace-wide settings
D) Global init scripts can only be configured by metastore admins through Unity Catalog, not through workspace admin settings

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks executes global init scripts first (in the order specified by the admin), followed by cluster-scoped init scripts. This means the monitoring agent can be deployed as a global init script that runs on every cluster, while the team-specific Python library is added as a cluster-scoped init script on data science clusters only. Option A incorrectly states they run in parallel, Option C reverses the execution order, and Option D is wrong since global init scripts are managed through workspace admin settings.

---

## Section 3: Data Modeling (Questions 31–39)

## Question 31 *(Hard)*

**Scenario**: A logistics company ingests GPS telemetry data from delivery trucks into a Bronze table. The data arrives as raw JSON with minimal structure issues. The analytics team needs a Gold table that provides real-time aggregated metrics such as average speed per route and delivery time percentiles. The Silver layer would only perform minor formatting (e.g., timestamp parsing) with no significant cleansing or joins required.

**Question**: What is the most appropriate approach for building this pipeline in the medallion architecture?

A) Write directly from Bronze to Gold, skipping Silver, since the intermediate transformations add no meaningful value
B) Always create a Silver layer to maintain architectural consistency, even if transformations are trivial
C) Write the raw data directly to Gold and skip both Bronze and Silver
D) Create a Silver table but only materialize it as a view to reduce storage costs

> [!success]- Answer
> **Correct Answer: A**
>
> When the Silver layer would only perform trivial transformations that add no real cleansing or conforming value, it is acceptable to bypass it and write directly from Bronze to Gold. The medallion architecture is a guideline, not a rigid rule, and unnecessary layers add latency and storage overhead without benefit. Option B wastes resources on an empty pass-through, and option C loses the raw data auditability that Bronze provides.

---

## Question 32 *(Hard)*

**Scenario**: A data engineer is implementing SCD Type 2 on a `dim_customer` table using Delta Lake's MERGE statement. The table tracks historical changes with `effective_start_date`, `effective_end_date`, and `is_current` flag columns. When a matching customer record has changed attributes, the engineer needs to expire the old row and insert the new row.

**Question**: Which MERGE approach correctly implements SCD Type 2 with proper current/expired flag management?

A) Use MERGE with `WHEN MATCHED THEN UPDATE SET *` to overwrite the existing row with the new values
B) Use MERGE with `WHEN MATCHED THEN DELETE` followed by a separate INSERT of both the expired and new rows
C) Use MERGE with `WHEN MATCHED AND source.hash <> target.hash THEN UPDATE SET is_current = false, effective_end_date = current_date()` combined with a `WHEN NOT MATCHED THEN INSERT` clause, then run a second INSERT for the new current rows
D) Use MERGE with `WHEN MATCHED THEN UPDATE SET is_current = false` and include the new row in the WHEN NOT MATCHED clause, which automatically handles both operations in a single pass

> [!success]- Answer
> **Correct Answer: C**
>
> SCD Type 2 requires two operations for changed records: expiring the old row (updating `is_current` to false and setting `effective_end_date`) and inserting the new current row. The correct approach uses a MERGE to expire matched rows with changed attributes, then a separate INSERT statement to add the new current versions. Option D is incorrect because the `WHEN NOT MATCHED` clause only fires for source rows with no match in the target, not for rows that were just updated.

---

## Question 33 *(Hard)*

**Scenario**: A data engineering team has a production Delta table with a column named `txn_amt` that business users find confusing. They want to rename it to `transaction_amount`. They also need to drop an obsolete column called `legacy_flag`. The table has 500 million rows and they cannot afford to rewrite the entire table.

**Question**: Which approach allows the team to rename and drop columns on the Delta table without rewriting data files?

A) Use `ALTER TABLE RENAME COLUMN txn_amt TO transaction_amount` and `ALTER TABLE DROP COLUMN legacy_flag` directly, as Delta Lake supports this by default
B) Create a new table with the desired schema and use `INSERT INTO ... SELECT` to copy the data
C) Create a view on top of the existing table with column aliases to simulate the rename
D) Enable Delta column mapping by setting `delta.columnMapping.mode = 'name'` and then use `ALTER TABLE RENAME COLUMN` and `ALTER TABLE DROP COLUMN`

> [!success]- Answer
> **Correct Answer: D**
>
> Delta column mapping (`delta.columnMapping.mode = 'name'`) decouples logical column names from physical column names in Parquet files, enabling column rename and drop operations without rewriting data files. Without column mapping enabled, Delta Lake does not support column rename or drop operations. Option A would fail because the default column mapping mode (`none`) does not permit these operations. Option B requires a full data rewrite, which violates the constraint.

---

## Question 34 *(Medium)*

**Scenario**: A financial services company is building a lakehouse for regulatory reporting. They have complex queries that join customer, account, transaction, and product data. Reports require filtering by customer segment, product type, and time period. Query performance is critical because reports are generated on tight regulatory deadlines, and the data team includes SQL analysts accustomed to relational modeling.

**Question**: Which data modeling approach is most appropriate for the Gold layer of this lakehouse?

A) A fully denormalized single wide table containing all customer, account, transaction, and product attributes
B) A star schema with a central fact table for transactions and dimension tables for customer, account, and product
C) A normalized third normal form (3NF) model to minimize data redundancy
D) A Data Vault 2.0 model with hubs, links, and satellites for maximum flexibility

> [!success]- Answer
> **Correct Answer: B**
>
> A star schema is ideal for the Gold layer when queries involve multiple filter dimensions and the team includes SQL analysts familiar with relational patterns. It provides a balance of query performance (through reduced joins compared to 3NF) and manageability (compared to a single denormalized table that would be unwieldy with this many entities). Option A would create an extremely wide table with massive redundancy, while option C optimizes for storage at the cost of query performance due to excessive joins.

---

## Question 35 *(Medium)*

**Scenario**: A data engineer needs to create a copy of a 2 TB production Delta table for a development environment. The dev team will run experimental transformations that may alter or delete data, but they primarily need to read the table for testing queries. Storage costs are a concern, and the copy needs to be created quickly during a short maintenance window.

**Question**: Which cloning strategy best meets these requirements?

A) Use SHALLOW CLONE, which copies only the metadata and transaction log while referencing the original data files, providing a fast and storage-efficient copy
B) Use DEEP CLONE, which copies all data files and metadata to create a fully independent copy
C) Use CTAS (`CREATE TABLE AS SELECT`) to create a complete physical copy of the data
D) Use SHALLOW CLONE and then immediately run OPTIMIZE on the clone to consolidate files

> [!success]- Answer
> **Correct Answer: A**
>
> SHALLOW CLONE creates a copy by referencing the source table's data files without physically duplicating them, making it both fast and storage-efficient. This is ideal for development and testing environments where cost and speed matter. Option B (DEEP CLONE) would require copying all 2 TB of data, which is slow and expensive. Note that if the dev team writes to a shallow clone, only the modified files are stored separately while unchanged data still references the source.

---

## Question 36 *(Hard)*

**Scenario**: A data engineer is designing a Delta table to store IoT sensor readings. The table will hold 10 billion rows and receive 50 million new rows daily. Queries almost always filter by `device_region` (5 distinct values) and `reading_date`. Occasional queries filter by `sensor_id` (500,000 distinct values). The team is using Hive-style partitioning.

**Question**: Which partitioning strategy is most appropriate for this table?

A) Partition by `sensor_id` to ensure queries filtering on individual sensors are fast
B) Partition by both `device_region` and `reading_date` to align with the two most common filter columns
C) Partition by `device_region` only, and use Z-ORDER BY on `reading_date, sensor_id` for additional data skipping
D) Partition by `reading_date` only, since it is the most granular time-based column

> [!success]- Answer
> **Correct Answer: C**
>
> With Hive-style partitioning, partition columns should have low cardinality to avoid creating too many small files. `device_region` with 5 distinct values is an excellent partition column. Adding `reading_date` as a partition would create thousands of sub-partitions (5 regions x 365+ days), leading to a small-files problem. Z-ORDER on `reading_date` and `sensor_id` provides efficient data skipping within each partition. Option A is wrong because 500,000 partitions would cause severe performance degradation.

---

## Question 37 *(Medium)*

**Scenario**: A data platform team is migrating an existing Hive-style partitioned Delta table (`PARTITIONED BY (year, month, day)`) to a more modern layout strategy. The table suffers from partition skew (some days have 100x more data than others), requires frequent partition management, and analysts occasionally need to query by non-partition columns like `customer_segment` and `product_category`.

**Question**: What is the primary advantage of converting this table to use Liquid Clustering?

A) Liquid Clustering compresses data files more efficiently than Hive-style partitioning, reducing storage costs
B) Liquid Clustering incrementally reorganizes data without requiring full table rewrites and supports flexible, multi-column clustering that adapts to evolving query patterns
C) Liquid Clustering eliminates the need for the OPTIMIZE command entirely since data is always optimally organized at write time
D) Liquid Clustering automatically creates materialized views for the most frequently queried column combinations

> [!success]- Answer
> **Correct Answer: B**
>
> Liquid Clustering's key advantages over Hive-style partitioning are incremental data reorganization (no full rewrites needed), support for multiple clustering columns without the small-files problem of multi-column partitioning, and the ability to change clustering keys without rewriting all data. Option C is incorrect because OPTIMIZE is still used to trigger clustering; it just works incrementally. Option A is misleading because compression is not the primary differentiator.

---

## Question 38 *(Medium)*

**Scenario**: A new data engineer joins a team that uses the medallion architecture. They are asked to document the data quality expectations at each layer. The pipeline ingests raw e-commerce event data and produces analytics-ready tables for business intelligence.

**Question**: Which description correctly characterizes the transformations applied at each layer of the medallion architecture?

A) Bronze applies schema enforcement and deduplication; Silver adds business aggregations; Gold provides filtered views for consumers
B) Bronze performs data type casting and validation; Silver joins reference data; Gold stores raw backup copies
C) Bronze ingests raw data with minimal transformation (e.g., adding metadata columns and enforcing schema-on-read); Silver cleanses, deduplicates, and conforms data with schema enforcement; Gold applies business-level aggregations, joins, and curations for specific use cases
D) Bronze and Silver perform identical cleansing operations for redundancy; Gold handles all business logic and aggregation

> [!success]- Answer
> **Correct Answer: C**
>
> The medallion architecture defines clear responsibilities: Bronze preserves raw data with minimal changes (append metadata, track ingestion), Silver handles data quality (dedup, null handling, type casting, schema enforcement, conforming), and Gold delivers business-ready datasets (aggregations, dimensional models, KPI tables). Option A incorrectly places schema enforcement and deduplication at the Bronze layer, which should preserve raw data fidelity.

---

## Question 39 *(Hard)*

**Scenario**: A data engineer adds both a `NOT NULL` constraint and a `CHECK` constraint (`CHECK (quantity > 0)`) to a Delta table. During a pipeline run, a batch of 10,000 records is written where 5 records have null quantities and 3 records have `quantity = -1`.

**Question**: How does Delta Lake enforce these constraints during the write operation?

A) The NOT NULL constraint is enforced but CHECK constraints are only evaluated during reads, so only the 5 null records cause failures
B) Both constraints are treated as warnings, and violating records are logged but still written to the table
C) The CHECK constraint catches all 8 violating records (nulls and negatives) since CHECK implicitly covers nulls, and the write fails for the entire batch
D) Both constraints are enforced independently at write time, and the entire write operation fails if any record violates either constraint, with an error indicating which constraint was violated

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Lake enforces both NOT NULL and CHECK constraints at write time. If any record in the batch violates either constraint, the entire transaction is rejected with an error message identifying the violated constraint. These are independent checks: NOT NULL catches the 5 null records and CHECK catches the 3 negative-quantity records. Option C is incorrect because CHECK constraints do not implicitly handle nulls; SQL CHECK constraints evaluate to UNKNOWN (not false) for nulls, so the NOT NULL constraint is needed separately.

---

## Section 4: Security & Governance (Questions 40–45)

## Question 40 *(Medium)*

**Scenario**: Your organization recently purchased a second Databricks workspace for a newly acquired subsidiary. The platform team attaches this new workspace to the existing Unity Catalog metastore that the parent company already uses. Before the attachment, the subsidiary's workspace relied on a legacy Hive metastore with several hundred tables.

**Question**: What happens to the existing Hive metastore tables in the subsidiary workspace once it is attached to the Unity Catalog metastore?

A) The legacy Hive metastore tables are automatically migrated into Unity Catalog as managed tables
B) The legacy Hive metastore tables remain accessible through the `hive_metastore` catalog but are not governed by Unity Catalog
C) The legacy Hive metastore tables are deleted and must be recreated in Unity Catalog
D) The legacy Hive metastore tables are copied into Unity Catalog as external tables with identical permissions

> [!success]- Answer
> **Correct Answer: B**
>
> When a workspace is attached to a Unity Catalog metastore, the legacy Hive metastore does not disappear. Its tables remain accessible under the built-in `hive_metastore` catalog, but they are not governed by Unity Catalog's centralized access controls. To bring those tables under Unity Catalog governance, teams must explicitly migrate them using tools like the UCX migration utility or `CREATE TABLE` statements.

---

## Question 41 *(Hard)*

**Scenario**: A financial services company stores transaction data in a single `transactions` table containing records from all regional offices. Compliance requires that analysts in each regional group (e.g., `region_us`, `region_eu`, `region_apac`) can only query rows that belong to their own region. The security team wants this enforced at the data layer, not in the BI tool.

**Question**: Which approach correctly implements this row-level security requirement in Unity Catalog?

A) Create a dynamic view that filters rows using `SELECT * FROM transactions WHERE region = CASE WHEN is_account_group_member('region_us') THEN 'US' WHEN is_account_group_member('region_eu') THEN 'EU' WHEN is_account_group_member('region_apac') THEN 'APAC' END`
B) Apply a column mask on the `region` column so that unauthorized analysts see NULL instead of the actual region value
C) Create three separate tables partitioned by region and grant each group SELECT on only their table
D) Use a cluster-level Spark configuration to set `spark.sql.region.filter` to the user's assigned region

> [!success]- Answer
> **Correct Answer: A**
>
> Dynamic views with `is_account_group_member()` provide row-level security by evaluating the querying user's group membership at runtime and filtering rows accordingly. This approach enforces security centrally at the data layer without requiring data duplication. Option B hides column values but still returns all rows, Option C creates data management overhead with duplicated tables, and Option D is not a real Spark configuration parameter.

---

## Question 42 *(Hard)*

**Scenario**: A pharmaceutical company wants to share de-identified clinical trial results with three external research institutions. Two of the institutions use Databricks, but the third institution uses only Apache Spark on their own Hadoop cluster. The data must be shared securely without giving any institution direct access to the company's workspace.

**Question**: How does the third institution (the non-Databricks recipient) authenticate and access data shared via Delta Sharing?

A) They receive a Databricks personal access token that grants read-only access to the shared tables
B) They connect via OAuth using the pharmaceutical company's identity provider
C) They install a Databricks Connect client that tunnels into the provider's workspace
D) They download an activation link that provisions a bearer token, which the open-source Delta Sharing client uses to authenticate with the sharing server

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Sharing uses an open protocol where recipients receive an activation link to generate a bearer token stored in a credential file. The open-source Delta Sharing connector (available for Spark, pandas, and other platforms) uses this token to authenticate directly with the sharing server without requiring a Databricks account. Options A and C incorrectly assume the recipient needs Databricks credentials or workspace connectivity, and Option B is not how Delta Sharing authenticates external recipients.

---

## Question 43 *(Hard)*

**Scenario**: The security operations team has detected suspicious behavior -- a service principal that normally runs nightly ETL pipelines has been issuing `GRANT` statements during business hours. The team needs to query the audit logs to identify all privilege escalation events performed by this service principal in the last 7 days.

**Question**: Which query correctly retrieves the relevant audit log entries from the Unity Catalog system tables?

A) `SELECT * FROM system.information_schema.grants WHERE grantee = 'etl-service-principal' AND grant_date > current_date() - INTERVAL 7 DAYS`
B) `SELECT * FROM system.access.audit WHERE user_identity = 'etl-service-principal' AND event_type = 'SECURITY_ALERT'`
C) `SELECT * FROM system.access.audit WHERE user_identity.email = 'etl-service-principal' AND action_name IN ('updatePermissions', 'grantPermission') AND event_time > current_date() - INTERVAL 7 DAYS`
D) `SELECT * FROM system.billing.usage WHERE identity.email = 'etl-service-principal' AND usage_type = 'GRANT_OPERATION'`

> [!success]- Answer
> **Correct Answer: C**
>
> The `system.access.audit` table records all governance-related actions in Unity Catalog, including permission changes. Filtering on `user_identity.email` for the service principal and `action_name` for grant-related operations isolates privilege escalation events. Option A queries the information schema which shows current grants but not the audit trail of who made changes, Option B uses a non-existent `event_type` value, and Option D queries billing data which does not track security operations.

---

## Question 44 *(Medium)*

**Scenario**: A data engineering team currently uses a senior engineer's personal access token (PAT) embedded in an Airflow DAG to trigger Databricks jobs in production. The engineer is planning to leave the company in two weeks, and management is concerned about continuity and security.

**Question**: What is the recommended approach to address this situation and prevent similar issues going forward?

A) Create a service principal with a client secret, assign it only the permissions needed to run production jobs, and configure Airflow to authenticate using the service principal's credentials
B) Transfer the engineer's personal access token to a shared team account so that multiple engineers can maintain it
C) Generate a new personal access token under the engineering manager's account and update Airflow before the engineer departs
D) Disable token-based authentication entirely and switch to interactive SSO login for all Airflow-triggered jobs

> [!success]- Answer
> **Correct Answer: A**
>
> Service principals are the recommended approach for production workloads because their lifecycle is independent of any individual user. They support least-privilege access through dedicated role assignments and their credentials can be rotated without impacting a person's account. Option B creates a shared credential anti-pattern with no individual accountability, Option C merely shifts the same problem to a different person, and Option D is impractical since orchestrators like Airflow require non-interactive authentication.

---

## Question 45 *(Hard)*

**Scenario**: A government agency stores classified datasets in a Databricks workspace deployed in an isolated VNet with no public internet access. Despite these network controls, a recent internal review discovered that a user with `SELECT` access on a sensitive table was able to copy data to an external cloud storage account by running `COPY INTO 'abfss://external-container@external-account.dfs.core.windows.net/'` from a notebook.

**Question**: Which combination of controls should be implemented to prevent this type of data exfiltration while still allowing legitimate workloads?

A) Revoke all `SELECT` permissions and require users to submit data access requests for each query
B) Enable IP access lists on the workspace and restrict notebook execution to read-only mode
C) Disable the `COPY INTO` command at the cluster level using a Spark configuration override
D) Configure storage firewall rules to restrict egress to only approved storage accounts, and apply table ACLs in Unity Catalog to limit write permissions on external locations to authorized service principals only

> [!success]- Answer
> **Correct Answer: D**
>
> Defense-in-depth requires both network-level and data-level controls working together. Storage firewall rules and NSG/egress restrictions block connectivity to unapproved storage accounts, while Unity Catalog's external location permissions ensure that only authorized service principals can write to sanctioned destinations. Option A is operationally impractical, Option B does not prevent data writes to external storage, and Option C does not address other exfiltration methods such as direct Spark writes via DataFrames.

---

## Section 5: Monitoring & Logging (Questions 46–51)

## Question 46 *(Hard)*

**Scenario**: A production Spark job processing customer transaction data is intermittently failing with `java.lang.OutOfMemoryError: Java heap space` on executor nodes. The data engineer opens the Spark UI to investigate and notices that the job has multiple `.cache()` calls on large DataFrames that persist across several stages. The Storage tab shows several cached RDDs consuming the majority of available executor memory.

**Question**: Based on the Spark UI Storage tab observations, what is the most likely root cause and the recommended corrective action?

A) The shuffle partitions are too large; increase `spark.sql.shuffle.partitions` to reduce partition size
B) Cached DataFrames are consuming excessive executor memory; unpersist DataFrames that are no longer needed downstream
C) The executor JVM garbage collection is misconfigured; switch to G1GC with larger heap regions
D) The driver node is running out of memory from collecting results; increase driver memory allocation

> [!success]- Answer
> **Correct Answer: B**
>
> When the Spark UI Storage tab shows multiple large cached DataFrames consuming most executor memory, it creates memory pressure that leaves insufficient heap space for active computation. The fix is to call `.unpersist()` on DataFrames once they are no longer needed in subsequent stages, freeing executor memory for processing. Options A, C, and D address different symptoms and would not resolve memory consumed by unnecessary cached data.

---

## Question 47 *(Hard)*

**Scenario**: A Delta Live Tables (DLT) pipeline ingests clickstream events from Kafka and materializes several streaming tables. The pipeline has been running for several hours but the gold-layer aggregation table is lagging significantly behind the bronze ingestion layer. The data engineer needs to quantify the exact backlog at each stage to identify which flow is the bottleneck.

**Question**: What is the most effective method to identify backlog metrics across individual flows in the DLT pipeline?

A) Check the DLT pipeline UI graph view and look for red-highlighted tables indicating failures
B) Query `system.billing.usage` filtered by the pipeline ID to find the slowest compute phase
C) Query the pipeline's event log for `flow_progress` events and examine the `metrics.backlog_bytes` field for each flow
D) Examine the Spark UI Streaming tab for each cluster to view micro-batch processing rates

> [!success]- Answer
> **Correct Answer: C**
>
> The DLT event log stores `flow_progress` event types that include detailed metrics such as `backlog_bytes` and `num_output_rows` for each individual flow in the pipeline. Querying these events lets you pinpoint exactly which flow has the largest backlog and is causing downstream lag. Option A shows status but not quantitative backlog metrics, Option B provides cost data not pipeline throughput, and Option D is not directly accessible for DLT-managed clusters.

---

## Question 48 *(Medium)*

**Scenario**: A finance team reports that the monthly Databricks bill has increased by 40% compared to the previous month, but no new jobs or clusters were added. The platform administrator needs to identify which specific workloads or SKUs are responsible for the cost increase and compare usage patterns between the two months.

**Question**: Which approach most efficiently identifies the source of the cost anomaly?

A) Export the cluster activity logs from the Admin Console and aggregate compute hours per workspace
B) Review the Databricks account billing dashboard to compare high-level totals by workspace
C) Query `system.billing.usage` to aggregate DBU consumption by `sku_name`, `workspace_id`, and `usage_date`, then compare month-over-month
D) Check each job's run history in the Workflows UI and manually calculate DBU usage from cluster uptime

> [!success]- Answer
> **Correct Answer: C**
>
> The `system.billing.usage` system table provides granular, queryable billing records that include SKU name, workspace ID, usage quantities, and dates, enabling precise month-over-month comparisons with SQL aggregations. This is far more efficient than manual approaches. Option B gives only high-level summaries without SKU-level drill-down, Option A lacks DBU cost attribution, and Option D is impractical at scale.

---

## Question 49 *(Hard)*

**Scenario**: A long-running Spark batch job on an autoscaling cluster frequently triggers autoscale-up events, but the added executors are quickly lost with `ExecutorLostFailure` errors. The Ganglia metrics dashboard for the cluster shows that executor memory utilization spikes above 95% shortly before each executor loss, while CPU utilization remains around 40%.

**Question**: Based on the Ganglia metrics pattern, what is the most likely cause of the executor failures?

A) Executors are running out of memory due to large shuffle spills or oversized partitions; increase `spark.executor.memory` or repartition the data
B) The cluster network bandwidth is saturated during shuffle operations; switch to a compute-optimized instance type
C) The autoscaler is removing executors prematurely due to idle timeout; increase the autoscale idle timeout threshold
D) The YARN resource manager is preempting executors for higher-priority jobs; configure the job with maximum priority

> [!success]- Answer
> **Correct Answer: A**
>
> Ganglia showing memory utilization spiking to 95% with low CPU usage before executor loss is a strong indicator of out-of-memory conditions, typically caused by large shuffle operations or skewed partitions that exceed the executor memory limit. Increasing executor memory or repartitioning to reduce per-partition size resolves this. Option B would show network metrics spiking rather than memory, Option C applies when executors go idle (not when they crash), and Option D is not applicable in Databricks-managed YARN environments.

---

## Question 50 *(Hard)*

**Scenario**: A data engineering team runs hundreds of Structured Streaming jobs across multiple workspaces. They need a centralized alerting system that triggers PagerDuty notifications when any streaming query's processing rate drops below a threshold or when a query falls behind by more than 10 minutes of event-time lag.

**Question**: What is the recommended approach to implement custom monitoring and alerting for Structured Streaming queries at this scale?

A) Schedule a notebook to periodically call `spark.streams.active` and check `lastProgress` for each query, then send alerts via webhook
B) Enable Databricks SQL Alerts on the `system.billing.usage` table to detect when streaming cluster costs increase unexpectedly
C) Implement a `StreamingQueryListener` that captures `onQueryProgress` events, extracts processing rate and watermark lag metrics, and publishes them to an external monitoring system
D) Configure Ganglia metric thresholds on each cluster to trigger email alerts when CPU utilization drops below expected levels

> [!success]- Answer
> **Correct Answer: C**
>
> `StreamingQueryListener` is the official Spark API for programmatically monitoring streaming queries, providing `onQueryProgress` callbacks with detailed metrics including `inputRowsPerSecond`, `processedRowsPerSecond`, and watermark information. Publishing these to an external system like PagerDuty enables centralized alerting across all jobs. Option A requires polling and is less reliable, Option B monitors cost not streaming health, and Option D uses infrastructure metrics that do not directly reflect streaming processing rates.

---

## Question 51 *(Hard)*

**Scenario**: A Databricks SQL query that joins a 500-million-row fact table with three dimension tables is taking over 15 minutes to execute. The data analyst has verified that all tables have up-to-date statistics and the warehouse is properly sized. They open the Query Profile in the Databricks SQL UI to investigate.

**Question**: How should the analyst use the Query Profile to identify the specific bottleneck operator causing the slow performance?

A) Check the "Results" tab to see which rows are returned most frequently and identify if the output is too large
B) Examine the operator tree in the Query Profile to find the node with the highest time duration and spill-to-disk metrics, then optimize the corresponding join or aggregation
C) Review the "Query History" page to compare this query's execution time with previous runs and detect regression
D) Look at the warehouse's "Monitoring" tab to check if other concurrent queries are competing for resources

> [!success]- Answer
> **Correct Answer: B**
>
> The Query Profile's operator tree visualizes each physical operator (scan, join, aggregate, exchange) with time spent and data processed, and highlights operators that spill to disk. Identifying the node with the longest duration and largest spill reveals the exact bottleneck, allowing targeted optimization such as adding filters, changing join order, or adjusting the join strategy. Options A and C do not pinpoint the specific operator, and Option D checks for resource contention rather than query-level optimization issues.

---

## Section 6: Testing & Deployment (Questions 52–57)

## Question 52 *(Medium)*

**Scenario**: A data engineering team maintains a `databricks.yml` bundle configuration. The root-level resources section defines a job with `max_concurrent_runs: 1` and a cluster with `num_workers: 2`. The `targets.production` section redefines the same job with `max_concurrent_runs: 4` but does not specify `num_workers`.

**Question**: When the bundle is deployed to the production target, what is the effective configuration for `max_concurrent_runs` and `num_workers`?

A) `max_concurrent_runs: 1`, `num_workers: 2` -- root-level defaults always take precedence
B) `max_concurrent_runs: 4`, `num_workers: unset` -- the target completely replaces the root-level job definition
C) The deployment fails because the target cannot override root-level resource settings
D) `max_concurrent_runs: 4`, `num_workers: 2` -- the target overrides only the settings it explicitly specifies

> [!success]- Answer
> **Correct Answer: D**
>
> DAB uses a merge strategy where target-level settings are deep-merged with root-level defaults. Properties explicitly set in the target override the corresponding root-level values, while unspecified properties inherit the root-level defaults. This allows teams to define common baseline configurations at the root level and only override what differs per environment.

---

## Question 53 *(Hard)*

**Scenario**: A platform team configures OIDC-based authentication between GitHub Actions and Databricks using a service principal. During a workflow run, GitHub Actions requests an OIDC token from GitHub's cloud provider and sends it to the Databricks token endpoint.

**Question**: What happens during the OIDC token exchange with Databricks?

A) Databricks validates the GitHub OIDC token against the configured identity federation policy and issues a short-lived OAuth access token for the service principal
B) Databricks stores the GitHub OIDC token as a persistent secret and uses it for all future API calls from that service principal
C) GitHub Actions receives a Databricks personal access token that is valid for 90 days and cached in the workflow runner
D) Databricks converts the GitHub OIDC token into a workspace-level API key that must be manually rotated every 30 days

> [!success]- Answer
> **Correct Answer: A**
>
> In the OIDC token exchange flow, Databricks validates the incoming GitHub OIDC token by checking its claims against the identity federation policy configured on the service principal. If validation succeeds, Databricks issues a short-lived OAuth token scoped to the service principal's permissions. This eliminates the need to store long-lived credentials in GitHub Secrets and provides automatic token rotation per workflow run.

---

## Question 54 *(Medium)*

**Scenario**: A team is deploying a new version of a production DLT pipeline that processes 500 million records per day. They need to validate the new pipeline version with real production data before fully switching over, while ensuring zero downtime and the ability to instantly revert if issues are detected.

**Question**: Which deployment strategy best meets these requirements?

A) Blue-green deployment: deploy the new pipeline version alongside the old one, then switch all traffic instantly by updating the job definition
B) Rolling deployment: gradually update each cluster node to run the new pipeline code one at a time
C) Canary deployment: route a small percentage of incoming data to the new pipeline version, monitor its metrics, and gradually increase the percentage if results are healthy
D) Feature flag deployment: wrap all new transformation logic in feature flags and toggle them on simultaneously across the existing pipeline

> [!success]- Answer
> **Correct Answer: C**
>
> A canary deployment allows the team to validate the new pipeline version with a small subset of real production data while keeping the existing pipeline handling the majority of traffic. This provides production-grade validation with minimal blast radius -- if the canary pipeline shows errors or data quality issues, the team can instantly stop routing data to it. Unlike blue-green, canary gives gradual confidence building rather than an all-or-nothing switchover.

---

## Question 55 *(Hard)*

**Scenario**: A CI/CD pipeline runs automated tests against a DLT pipeline that uses expectations such as `CONSTRAINT valid_amount EXPECT (amount > 0) ON VIOLATION DROP ROW`. After the test pipeline run completes, the team needs to programmatically verify that no more than 0.1% of rows were dropped by expectations before promoting the code to production.

**Question**: How should the team validate the expectation results in their CI/CD pipeline?

A) Parse the DLT pipeline logs from the cluster driver output to count dropped rows
B) Query the DLT event log for expectation metrics using `expectations.dropped_records` and compare the drop rate against the 0.1% threshold
C) Add a downstream notebook that reads the target table's row count and compares it to the source table's row count
D) Configure a DLT alert that sends an email notification if the drop rate exceeds 0.1%

> [!success]- Answer
> **Correct Answer: B**
>
> The DLT event log captures detailed metrics for each expectation, including the number of records that passed, failed, and were dropped. By querying the event log for `expectations` events, the CI/CD pipeline can programmatically extract the drop counts, calculate the drop rate, and fail the pipeline promotion if the rate exceeds the defined threshold. This approach is precise, automatable, and uses the purpose-built observability layer rather than indirect row-count comparisons or non-programmatic alerts.

---

## Question 56 *(Medium)*

**Scenario**: A data engineering team deploys a production job using Databricks Asset Bundles. The job should be runnable by members of the `data-ops` group but not editable by them. Only the deploying service principal should have full management permissions.

**Question**: Which `databricks.yml` configuration correctly implements these permission requirements?

A) Set `run_as` to the `data-ops` group and leave permissions unspecified so the group inherits run access
B) Add a `permissions` block with `CAN_MANAGE` for `data-ops` and rely on Unity Catalog to restrict edit access
C) Deploy the job with no permissions block and then manually configure permissions through the Databricks workspace UI
D) Add a `permissions` block granting `CAN_VIEW` and `CAN_MANAGE_RUN` to `group_name: data-ops` while the deploying service principal retains `CAN_MANAGE` as the owner

> [!success]- Answer
> **Correct Answer: D**
>
> The DAB `permissions` block on a job resource supports fine-grained access levels including `CAN_VIEW`, `CAN_MANAGE_RUN`, and `CAN_MANAGE`. Granting `CAN_MANAGE_RUN` to the `data-ops` group allows them to trigger and monitor job runs without being able to edit the job definition. The deploying service principal automatically retains `CAN_MANAGE` as the resource owner, ensuring only the deployment pipeline can modify the job configuration.

---

## Question 57 *(Medium)*

**Scenario**: A team deployed a new version of their DAB-managed production pipeline 30 minutes ago. Monitoring alerts now indicate that the new version is producing incorrect aggregation results due to a logic error in a transformation. The team needs to revert to the previous working version as quickly as possible.

**Question**: What is the fastest way to roll back the deployment using Databricks Asset Bundles?

A) Check out the previous Git commit in the repository and run `databricks bundle deploy --target production` to redeploy the last known good version
B) Run `databricks bundle destroy --target production` to remove the broken deployment, then manually recreate the resources from the Databricks UI
C) Use `databricks bundle run --target production --version previous` to automatically roll back to the prior deployed version
D) Navigate to the Databricks workspace UI, locate each deployed resource, and manually revert the settings to match the previous configuration

> [!success]- Answer
> **Correct Answer: A**
>
> Since DAB deployments are driven from source-controlled configuration files, the fastest rollback strategy is to check out the previous known-good commit in Git and redeploy with `databricks bundle deploy`. This restores all resource configurations -- jobs, pipelines, clusters -- to their previous state in a single command. Option C uses a `--version` flag that does not exist in the DAB CLI. Options B and D are slow, error-prone, and defeat the purpose of infrastructure-as-code.

---

## Section 7: Lakeflow Pipelines & Performance (Questions 58–60)

## Question 58 *(Medium)*

**Scenario**: A data engineering team is building a Lakeflow (DLT) pipeline that ingests clickstream events from Kafka and produces aggregated session metrics consumed by two downstream systems. A real-time dashboard queries the latest session data every 30 seconds, and a nightly batch process generates a daily summary report from the same session metrics.

**Question**: How should the team define the session metrics dataset in the DLT pipeline to best serve both downstream consumers?

A) Define it as a materialized view so that both the dashboard and batch process always read a consistent, pre-computed result
B) Define it as a streaming table with Change Data Feed enabled so the batch process can read incremental changes
C) Define it as a streaming table so the real-time dashboard reads low-latency results, while the batch process queries the same table on its own schedule
D) Define two separate datasets: a streaming table for the dashboard and a materialized view for the batch process

> [!success]- Answer
> **Correct Answer: C**
>
> A streaming table continuously processes incoming records with low latency, which satisfies the real-time dashboard's requirement for fresh data. The nightly batch process can simply query the same streaming table at its scheduled time without requiring a separate materialized view. Option D introduces unnecessary duplication, and option A (materialized view) only recomputes on pipeline refresh rather than processing incrementally, adding latency unsuitable for the 30-second dashboard polling.

---

## Question 59 *(Medium)*

**Scenario**: A data engineer is evaluating whether to enable Photon on a production SQL warehouse that runs a mix of workloads. The warehouse processes nightly ETL jobs that perform large-scale joins and aggregations across Delta tables with hundreds of columns, as well as ad-hoc exploratory queries from analysts that use many UDFs written in Python.

**Question**: Which workload pattern benefits most from enabling Photon on this warehouse?

A) The ad-hoc exploratory queries, because Photon accelerates Python UDF execution through native compilation
B) The nightly ETL jobs, because Photon accelerates scan-heavy operations, joins, and aggregations on Delta tables
C) Both workloads benefit equally, because Photon replaces the entire Spark execution engine
D) Neither workload benefits significantly, because Photon only optimizes streaming workloads

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is a vectorized query engine written in C++ that significantly accelerates scan-intensive operations, hash joins, aggregations, and shuffle operations on Delta tables -- exactly the patterns in the nightly ETL jobs. Photon does not accelerate Python UDFs, which still execute in the standard Python runtime, so the ad-hoc queries with Python UDFs see limited benefit. Option C is incorrect because Photon does not replace the entire engine; unsupported operations fall back to standard Spark execution.

---

## Question 60 *(Medium)*

**Scenario**: A data engineer manages a 5TB Delta table that was originally optimized using `OPTIMIZE ... ZORDER BY (region, event_date)`. The team has decided to migrate to liquid clustering by running `ALTER TABLE events CLUSTER BY (region, event_date)`. After migration, the engineer notices that running `OPTIMIZE events` no longer requires specifying `ZORDER BY` columns.

**Question**: How does `OPTIMIZE` behave differently after the table has been converted to liquid clustering?

A) OPTIMIZE no longer performs any file compaction; it only updates clustering metadata in the Delta log
B) OPTIMIZE applies Z-ORDER clustering automatically using the columns defined in the CLUSTER BY clause, with no behavioral change to the compaction process
C) OPTIMIZE rewrites all data files on every run to ensure complete clustering, which increases write amplification compared to Z-ORDER
D) OPTIMIZE incrementally clusters only the files that need reorganization, avoiding full rewrites and enabling more efficient partial clustering over time

> [!success]- Answer
> **Correct Answer: D**
>
> With liquid clustering, `OPTIMIZE` uses an incremental approach that identifies and rewrites only the files that would benefit from better clustering, rather than rewriting the entire table or requiring a full sort. This is a key behavioral difference from Z-ORDER, which rewrites all files in the targeted partitions on each OPTIMIZE run. The incremental strategy reduces write amplification and makes it practical to run OPTIMIZE more frequently without excessive I/O cost.

---

[← Back to Mock Exam 2](./README.md)
