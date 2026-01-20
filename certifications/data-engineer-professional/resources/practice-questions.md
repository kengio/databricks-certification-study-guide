# Practice Questions

Comprehensive practice questions organized by exam section. Each section includes scenario-based questions that mirror the actual exam format.

---

## Section 01: Data Processing (30%)

### Question 1.1: Auto Loader Schema Evolution

**Scenario**: A data engineering team ingests JSON files from cloud storage using Auto Loader. New fields are occasionally added to the source data.

**Question**: Which configuration ensures new columns are automatically added to the target table schema?

A) `cloudFiles.schemaEvolutionMode = "addNewColumns"`
B) `cloudFiles.schemaEvolutionMode = "rescue"`
C) `cloudFiles.inferColumnTypes = "true"`
D) `cloudFiles.mergeSchema = "true"`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `schemaEvolutionMode = "addNewColumns"` automatically adds new columns to the schema. Option B rescues unexpected data to a separate column. Option C enables type inference but not schema evolution. Option D is not a valid Auto Loader option (that's for Delta writes).

</details>

---

### Question 1.2: Streaming Triggers

**Scenario**: A streaming job processes data from a message queue. The business requires the job to process all available data once per hour and then stop.

**Question**: Which trigger configuration should be used?

A) `trigger(processingTime='1 hour')`
B) `trigger(once=True)`
C) `trigger(availableNow=True)`
D) `trigger(continuous='1 hour')`

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> `availableNow=True` processes all available data and stops, making it ideal for scheduled batch-like streaming. `processingTime` runs continuously. `once=True` is deprecated and only processes one batch. `continuous` is for low-latency and doesn't stop.

</details>

---

### Question 1.3: MERGE Operation

**Scenario**: A data engineer needs to update existing records and insert new ones from a source table into a target Delta table.

**Question**: Which MERGE clause handles records that exist in the source but not in the target?

A) `WHEN MATCHED THEN UPDATE`
B) `WHEN NOT MATCHED THEN INSERT`
C) `WHEN MATCHED THEN INSERT`
D) `WHEN NOT MATCHED BY SOURCE THEN DELETE`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `WHEN NOT MATCHED THEN INSERT` handles source records that don't have a matching key in the target. `WHEN MATCHED` handles existing records. Option C is invalid syntax. Option D handles records in target not in source.

</details>

---

### Question 1.4: Change Data Feed

**Scenario**: A data engineer needs to track all changes (inserts, updates, deletes) to a Delta table for downstream CDC processing.

**Question**: Which statement correctly enables this capability?

A) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataCapture' = true)`
B) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataFeed' = true)`
C) `ALTER TABLE orders ENABLE CHANGE TRACKING`
D) `CREATE TABLE orders WITH (CDC = ENABLED)`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `delta.enableChangeDataFeed = true` enables Change Data Feed (CDF) on a Delta table. This allows reading changes using `table_changes()` function or `readChangeData` option. The other options use incorrect syntax.

</details>

---

### Question 1.5: Watermarking in Streaming

**Scenario**: A streaming aggregation job groups events by a 10-minute window. Events can arrive up to 30 minutes late.

**Question**: Which watermark configuration is correct?

A) `withWatermark("event_time", "10 minutes")`
B) `withWatermark("event_time", "30 minutes")`
C) `withWatermark("event_time", "40 minutes")`
D) `withWatermark("processing_time", "30 minutes")`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The watermark should match the maximum expected lateness (30 minutes). This tells Spark to wait 30 minutes before finalizing windows. Using event_time (not processing_time) is required for event-time processing.

</details>

---

### Question 1.6: Incremental Processing with readStream

**Scenario**: A pipeline reads from a Delta table that receives both inserts and updates. Only new and updated records should be processed.

**Question**: Which configuration enables this?

A) `spark.readStream.option("ignoreChanges", "true").table("source")`
B) `spark.readStream.option("readChangeData", "true").table("source")`
C) `spark.readStream.option("readChangeFeed", "true").table("source")`
D) `spark.readStream.option("skipChangeCommits", "true").table("source")`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `readChangeData = true` (with CDF enabled on the table) reads the change data feed which includes inserts, updates, and deletes. Option A ignores updates/deletes. Options C and D are not valid options.

</details>

---

## Section 02: Databricks Tooling (20%)

### Question 2.1: dbutils.widgets

**Scenario**: A notebook needs to accept a date parameter that defaults to yesterday's date when not provided.

**Question**: Which code correctly creates this widget?

A) `dbutils.widgets.text("date", str(date.today() - timedelta(days=1)))`
B) `dbutils.widgets.dropdown("date", str(date.today() - timedelta(days=1)), [])`
C) `dbutils.widgets.create("date", default=str(date.today() - timedelta(days=1)))`
D) `dbutils.widgets.parameter("date", str(date.today() - timedelta(days=1)))`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `dbutils.widgets.text(name, defaultValue)` creates a text input widget with a default value. Option B requires a list of choices. Options C and D are not valid methods.

</details>

---

### Question 2.2: %run Magic Command

**Scenario**: A main notebook needs to call a utility notebook and use variables defined in it.

**Question**: Which statement is true about `%run`?

A) Variables from the called notebook are not accessible in the calling notebook
B) `%run` executes the notebook asynchronously
C) Variables from the called notebook are available in the calling notebook's scope
D) `%run` can only be used with notebooks in the same folder

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> `%run` executes the notebook in the current notebook's context, making all variables and functions available. It runs synchronously and can reference notebooks using relative or absolute paths.

</details>

---

### Question 2.3: Databricks CLI Authentication

**Scenario**: A CI/CD pipeline needs to authenticate with Databricks using a service principal.

**Question**: Which environment variables should be set?

A) `DATABRICKS_HOST` and `DATABRICKS_TOKEN`
B) `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, and `DATABRICKS_CLIENT_SECRET`
C) `DATABRICKS_URL` and `DATABRICKS_API_KEY`
D) `DATABRICKS_WORKSPACE` and `DATABRICKS_PAT`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Service principal authentication requires the workspace host URL, client ID (application ID), and client secret. Option A is for PAT token authentication. Options C and D use invalid variable names.

</details>

---

### Question 2.4: Jobs API Run Now

**Scenario**: A data engineer needs to trigger a job via API with custom parameters.

**Question**: Which API endpoint and method should be used?

A) `POST /api/2.1/jobs/run-now`
B) `GET /api/2.1/jobs/trigger`
C) `POST /api/2.0/jobs/start`
D) `PUT /api/2.1/jobs/execute`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `POST /api/2.1/jobs/run-now` triggers a job run with optional parameter overrides. This is the current Jobs API version. The other endpoints don't exist.

</details>

---

### Question 2.5: Cluster Types

**Scenario**: A production ETL job runs daily for 2 hours. Cost optimization is a priority.

**Question**: Which cluster configuration is most cost-effective?

A) All-purpose cluster running 24/7
B) Job cluster created for each run
C) All-purpose cluster with auto-termination
D) Serverless cluster

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Job clusters are created for the job run and terminated after completion. They have lower DBU rates (~60% less than all-purpose) and only incur costs during execution. All-purpose clusters cost more and may have idle time even with auto-termination.

</details>

---

### Question 2.6: Unity Catalog Volumes vs DBFS

**Scenario**: A team needs to store raw data files that will be governed by Unity Catalog.

**Question**: Which storage option should they use?

A) DBFS root storage
B) Mounted cloud storage
C) Unity Catalog Volume
D) Workspace files

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> Unity Catalog Volumes provide governed file storage with access controls, auditing, and lineage. DBFS and mounts are legacy approaches without UC governance. Workspace files are for notebooks and small files, not data.

</details>

---

## Section 03: Data Modeling (15%)

### Question 3.1: Medallion Architecture

**Scenario**: A data architect is designing a lakehouse. Raw JSON data needs to be ingested, cleaned, and then aggregated.

**Question**: In which layer should data type casting and null handling occur?

A) Bronze layer
B) Silver layer
C) Gold layer
D) Landing zone

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The Silver layer is for cleaned, conformed data including type casting, null handling, deduplication, and standardization. Bronze stores raw data as-is. Gold is for business-level aggregations. Landing zone is temporary staging.

</details>

---

### Question 3.2: Delta Lake Time Travel

**Scenario**: A user accidentally deleted important records 3 days ago. The table has default retention settings.

**Question**: Which command restores the data?

A) `RESTORE TABLE orders TO VERSION AS OF 100`
B) `SELECT * FROM orders TIMESTAMP AS OF '2024-01-12'`
C) `ROLLBACK TABLE orders TO 3 DAYS AGO`
D) Both A and B can be used to access historical data

<details>
<summary>Answer</summary>

> **Correct Answer: D**
>
> Both version-based (`VERSION AS OF`) and timestamp-based (`TIMESTAMP AS OF`) time travel work. RESTORE actually reverts the table, while SELECT reads historical data. Default retention is 7 days, so 3-day-old data is available.

</details>

---

### Question 3.3: Schema Evolution

**Scenario**: A streaming pipeline receives data with a new column. The target Delta table should automatically accept this change.

**Question**: Which option enables this?

A) `.option("mergeSchema", "true")`
B) `.option("overwriteSchema", "true")`
C) `.option("schemaEvolution", "true")`
D) Schema evolution is automatic in Delta

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `mergeSchema = true` allows adding new columns during writes. `overwriteSchema` replaces the entire schema (dangerous). Option C is not a valid option. Schema evolution must be explicitly enabled.

</details>

---

### Question 3.4: SCD Type 2

**Scenario**: A dimension table needs to track full history of changes with effective dates.

**Question**: Which columns are typically added for SCD Type 2?

A) `is_current`, `version`
B) `start_date`, `end_date`, `is_current`
C) `created_at`, `updated_at`
D) `previous_value`, `current_value`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> SCD Type 2 tracks history using `start_date` (when version became active), `end_date` (when superseded, NULL for current), and often `is_current` flag. This allows point-in-time queries and current state queries.

</details>

---

### Question 3.5: Liquid Clustering vs Z-ORDER

**Scenario**: A table is frequently filtered by `customer_id` and `order_date`. The team wants automatic optimization.

**Question**: Which approach provides automatic maintenance?

A) `OPTIMIZE table ZORDER BY (customer_id, order_date)` scheduled daily
B) `ALTER TABLE table CLUSTER BY (customer_id, order_date)`
C) `CREATE TABLE table PARTITIONED BY (customer_id, order_date)`
D) Both A and B provide automatic maintenance

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Liquid Clustering (`CLUSTER BY`) provides automatic, incremental clustering without manual OPTIMIZE commands. Z-ORDER requires scheduled OPTIMIZE runs. Partitioning is for low-cardinality columns and doesn't cluster data within partitions.

</details>

---

### Question 3.6: Partitioning Best Practices

**Scenario**: A table has 100 million rows with a `status` column containing 5 distinct values and a `customer_id` column with 1 million distinct values.

**Question**: Which partitioning strategy is correct?

A) Partition by `customer_id`
B) Partition by `status`
C) Partition by both `customer_id` and `status`
D) Don't partition, use Z-ORDER on `customer_id`

<details>
<summary>Answer</summary>

> **Correct Answer: D**
>
> Partitioning works best for low-cardinality columns with ~1000 or fewer values. `customer_id` has too many values (would create 1M partitions). `status` has too few values (only 5 partitions, may not help much). Z-ORDER or liquid clustering on high-cardinality columns is better.

</details>

---

## Section 04: Security & Governance (10%)

### Question 4.1: Unity Catalog Permission Inheritance

**Scenario**: A user is granted SELECT on a schema in Unity Catalog.

**Question**: What happens to tables created in that schema after the grant?

A) User automatically has SELECT on new tables
B) User must be granted SELECT on each new table
C) User has no access to new tables
D) User has MODIFY access to new tables

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Permissions in Unity Catalog inherit downward. A SELECT grant on a schema applies to all current and future tables in that schema. This simplifies access management compared to table-level grants.

</details>

---

### Question 4.2: Row-Level Security

**Scenario**: Different sales teams should only see data for their assigned regions.

**Question**: Which approach implements row-level security in Unity Catalog?

A) Create separate tables for each region
B) Use dynamic views with `current_user()` function
C) Apply column masking policies
D) Use secret scopes for each region

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Dynamic views using `current_user()` or `is_member()` functions filter rows based on the querying user's identity or group membership. Column masking hides column values. Separate tables don't scale. Secret scopes are for credentials.

</details>

---

### Question 4.3: Delta Sharing

**Scenario**: A company needs to share data with an external partner who uses Snowflake.

**Question**: Which statement about Delta Sharing is correct?

A) The recipient must have a Databricks workspace
B) The recipient can read shared data using any Delta Sharing client
C) Data is physically copied to the recipient's storage
D) Delta Sharing only works within the same cloud provider

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Delta Sharing is an open protocol. Recipients can use any compatible client (Spark, pandas, Power BI, Snowflake, etc.) without needing Databricks. Data is read in place, not copied. It works across cloud providers.

</details>

---

### Question 4.4: Secret Management

**Scenario**: A notebook needs to access a database password without exposing it in code.

**Question**: Which approach correctly retrieves the secret?

A) `dbutils.secrets.get(scope="db-scope", key="password")`
B) `spark.conf.get("db.password")`
C) `dbutils.credentials.get("db-scope", "password")`
D) `os.environ.get("DB_PASSWORD")`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> `dbutils.secrets.get(scope, key)` retrieves secrets from Databricks secret scopes. The value is automatically redacted in notebook output. The other options either don't exist or expose credentials.

</details>

---

### Question 4.5: Managed vs External Tables

**Scenario**: A team needs to register an existing data lake path in Unity Catalog without moving the data.

**Question**: What type of table should they create?

A) Managed table
B) External table
C) View
D) Materialized view

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> External tables point to data at a user-specified location. Managed tables store data in Unity Catalog-managed storage (data would be moved/copied). Views don't store data. Materialized views persist computed results.

</details>

---

## Section 05: Monitoring & Logging (10%)

### Question 5.1: System Tables

**Scenario**: A data engineer needs to track compute costs by team over the past month.

**Question**: Which system table provides this information?

A) `system.access.audit`
B) `system.billing.usage`
C) `system.compute.clusters`
D) `system.query.history`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `system.billing.usage` contains cost and usage data including DBUs consumed. `audit` tracks access events. `clusters` contains cluster metadata. `query.history` tracks SQL queries, not costs.

</details>

---

### Question 5.2: Spark UI Debugging

**Scenario**: A Spark job is experiencing long task times with high "Shuffle Read Blocked Time."

**Question**: What does this indicate?

A) Too few partitions
B) Network congestion or slow shuffle fetch
C) Out of memory errors
D) Insufficient disk space

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Shuffle Read Blocked Time indicates tasks waiting for shuffle data from other executors, typically due to network issues or executors being slow to serve shuffle blocks. Solutions include increasing shuffle retry settings or investigating network.

</details>

---

### Question 5.3: DLT Event Log

**Scenario**: A DLT pipeline ran with data quality issues. The team needs to find how many records failed expectations.

**Question**: How can this information be retrieved?

A) Query the Delta table directly
B) Check the Spark UI
C) Query the pipeline's event log
D) Review the cluster logs

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> The DLT event log contains expectation metrics including passed/failed record counts. Query it using `event_log(TABLE(pipeline))` or access via the system tables. The event log provides detailed pipeline observability.

</details>

---

### Question 5.4: Query Profiler

**Scenario**: A SQL query is running slowly. The data engineer wants to see if partition pruning is working.

**Question**: What should they look for in EXPLAIN output?

A) `PartitionFilters` showing filter conditions
B) `DataFilters` showing filter conditions
C) `PushedFilters` showing filter conditions
D) All of the above indicate different types of filtering

<details>
<summary>Answer</summary>

> **Correct Answer: D**
>
> `PartitionFilters` shows partition pruning (best). `DataFilters` shows filters applied after scan. `PushedFilters` shows filters pushed to the file format. Ideally, filters should appear in PartitionFilters for best performance.

</details>

---

### Question 5.5: Identifying Data Skew

**Scenario**: A job has 99 tasks completing in 1 minute but one task takes 30 minutes.

**Question**: What is the most likely cause?

A) Insufficient cluster memory
B) Data skew in partition keys
C) Network timeout
D) Corrupt data file

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> One task taking much longer than others typically indicates data skew - one partition has significantly more data. Solutions include salting keys, using AQE skew handling, or repartitioning data more evenly.

</details>

---

## Section 06: Testing & Deployment (10%)

### Question 6.1: Databricks Asset Bundles

**Scenario**: A team needs to deploy the same pipeline to dev, staging, and production environments.

**Question**: How should environments be configured in Databricks Asset Bundles?

A) Create separate bundle files for each environment
B) Use targets in databricks.yml with environment-specific settings
C) Use Git branches for each environment
D) Manually modify settings before each deployment

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> DAB uses targets to define environment-specific configurations in a single databricks.yml. This is the recommended approach for multi-environment deployments. Separate files or manual changes lead to drift and errors.

</details>

---

### Question 6.2: Bundle Deployment Mode

**Scenario**: A developer wants to test their bundle without affecting shared resources.

**Question**: Which target mode should they use?

A) `mode: production`
B) `mode: development`
C) `mode: testing`
D) `mode: sandbox`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Development mode prefixes resource names with the username, pauses schedules, and uses personal workspace paths. This prevents conflicts with other developers or production resources.

</details>

---

### Question 6.3: Git Folders

**Scenario**: A team wants to version control their notebooks with automatic sync to Git.

**Question**: Which statement about Git Folders is correct?

A) Git Folders require manual sync after each change
B) Git Folders can only connect to GitHub
C) Git Folders replace the need for Databricks Asset Bundles
D) Git Folders provide native Git operations like pull, commit, and push

<details>
<summary>Answer</summary>

> **Correct Answer: D**
>
> Git Folders provide native Git operations directly in the Databricks UI. They support multiple Git providers (GitHub, GitLab, Azure DevOps, etc.). They complement DAB (which handles deployment), not replace it.

</details>

---

### Question 6.4: Unit Testing with Nutter

**Scenario**: A team needs to run tests inside Databricks notebooks as part of CI/CD.

**Question**: Which Nutter pattern is correct?

A) `def test_my_function():` followed by assertions
B) `before_`, `run_`, and `assertion_` method prefixes for each test
C) `@test` decorator on test methods
D) `TestCase` class inheritance

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Nutter uses a specific naming convention: `before_<test>` for setup, `run_<test>` for execution, and `assertion_<test>` for verification. This pattern allows tests to run inside Databricks notebooks.

</details>

---

### Question 6.5: CI/CD Pipeline

**Scenario**: A GitHub Actions workflow needs to deploy a bundle to Databricks.

**Question**: Which step is required before running `databricks bundle deploy`?

A) Install Python
B) Run `databricks bundle init`
C) Set up Databricks CLI with authentication
D) Create the workspace manually

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> The Databricks CLI must be installed and authenticated (via `databricks/setup-cli` action or environment variables) before deployment commands work. The bundle already exists in the repo. Python is helpful but CLI is essential.

</details>

---

## Section 07: Lakeflow Pipelines (5%)

### Question 7.1: Streaming Table vs Materialized View

**Scenario**: A DLT pipeline needs a table that aggregates daily sales totals from a streaming source.

**Question**: Which table type is most appropriate?

A) Streaming table
B) Materialized view
C) Live table
D) Temporary view

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Materialized views are appropriate for aggregations as they fully recompute results. Streaming tables are for append-only incremental processing and don't support aggregations well. "Live table" is deprecated terminology.

</details>

---

### Question 7.2: Expectations

**Scenario**: A DLT pipeline requires that all records have a non-null customer_id. Invalid records should be removed but not fail the pipeline.

**Question**: Which expectation syntax achieves this?

A) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL)`
B) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION DROP ROW`
C) `CONSTRAINT valid_id EXPECT (customer_id IS NOT NULL) ON VIOLATION FAIL UPDATE`
D) `@dlt.expect_all("valid_id", "customer_id IS NOT NULL")`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `ON VIOLATION DROP ROW` removes invalid records without failing the pipeline. Option A only logs warnings but keeps invalid rows. Option C fails the entire pipeline. Option D has incorrect syntax.

</details>

---

### Question 7.3: APPLY CHANGES

**Scenario**: A CDC pipeline receives insert, update, and delete events. The target table should reflect the current state only.

**Question**: Which APPLY CHANGES configuration is correct?

A) `STORED AS SCD TYPE 1`
B) `STORED AS SCD TYPE 2`
C) `STORED AS SNAPSHOT`
D) `STORED AS CURRENT`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> SCD Type 1 maintains only the current state by overwriting on updates. SCD Type 2 maintains full history with start/end dates. Options C and D are not valid APPLY CHANGES syntax.

</details>

---

### Question 7.4: DLT Table Reference

**Scenario**: A DLT SQL query needs to read from another table defined in the same pipeline.

**Question**: How should the source table be referenced?

A) `SELECT * FROM source_table`
B) `SELECT * FROM LIVE.source_table`
C) `SELECT * FROM delta.source_table`
D) `SELECT * FROM dlt.source_table`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> In DLT SQL, tables within the pipeline are referenced using the `LIVE.` prefix. This tells DLT that the table is defined within the same pipeline and creates the proper dependency.

</details>

---

### Question 7.5: Pipeline Modes

**Scenario**: A DLT pipeline processes data continuously as it arrives with minimal latency.

**Question**: Which pipeline configuration enables this?

A) `triggered: true`
B) `continuous: true`
C) `development: false`
D) `streaming: true`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `continuous: true` keeps the pipeline running continuously, processing data as it arrives. Triggered mode (default) processes data in batches when manually started or scheduled. `development` affects cluster size, not processing mode.

</details>

---

### Question 7.6: Full Refresh

**Scenario**: A schema change requires reprocessing all historical data in a DLT pipeline.

**Question**: How should the pipeline be refreshed?

A) Delete the target tables and restart
B) Use `databricks pipelines start --full-refresh`
C) Set `reset: true` in pipeline configuration
D) Drop and recreate the pipeline

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `--full-refresh` flag clears checkpoints and reprocesses all data from the beginning. This preserves pipeline configuration while resetting state. Manually deleting tables or recreating pipelines is error-prone.

</details>

---

## Section 08: Performance Optimization (5%)

### Question 8.1: OPTIMIZE and ZORDER

**Scenario**: A table frequently filters on `region` and `date` columns. Small files are causing performance issues.

**Question**: Which command best optimizes query performance?

A) `OPTIMIZE table_name`
B) `OPTIMIZE table_name ZORDER BY (region)`
C) `OPTIMIZE table_name ZORDER BY (region, date)`
D) `VACUUM table_name`

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> ZORDER on both frequently filtered columns provides the best data skipping. Option A compacts files but doesn't optimize data layout. Option B only optimizes for one column. VACUUM removes old files but doesn't improve layout.

</details>

---

### Question 8.2: Shuffle Partitions

**Scenario**: A Spark job processing 10GB of data is running slowly with default settings.

**Question**: What is the default value of `spark.sql.shuffle.partitions` and how should it be adjusted?

A) 100; increase for large data
B) 200; decrease for small data
C) 200; increase for large data
D) 500; keep default for all data

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Default is 200. For 10GB (relatively small), reducing partitions can improve performance by reducing overhead. Rule of thumb: target ~128MB per partition. 10GB / 128MB ≈ 80 partitions.

</details>

---

### Question 8.3: Broadcast Join

**Scenario**: A large fact table (100GB) is joined with a small dimension table (50MB).

**Question**: How can the join be optimized?

A) Increase shuffle partitions
B) Use a broadcast hint on the large table
C) Use a broadcast hint on the small table
D) Partition both tables by the join key

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> Broadcasting the small table avoids shuffling the large table. The small table is sent to all executors for a local join. Default broadcast threshold is 10MB, so a hint may be needed for 50MB: `/*+ BROADCAST(small_table) */`.

</details>

---

### Question 8.4: AQE (Adaptive Query Execution)

**Scenario**: A query has skewed data causing one task to run much longer than others.

**Question**: Which AQE feature helps with this?

A) Coalesce partitions
B) Skew join optimization
C) Dynamic broadcast join
D) Local shuffle reader

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> AQE's skew join optimization automatically detects and splits skewed partitions to distribute work more evenly. Coalesce combines small partitions. Dynamic broadcast switches join strategies. Local shuffle reader reduces I/O.

</details>

---

### Question 8.5: File Size Optimization

**Scenario**: A streaming job creates many small files, degrading query performance.

**Question**: Which configuration helps?

A) `spark.sql.shuffle.partitions = 1`
B) `delta.autoOptimize.optimizeWrite = true`
C) `spark.databricks.delta.vacuum.enabled = true`
D) `delta.checkpoint.writeStatsAsJson = false`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> `optimizeWrite` bins data during writes to create better-sized files. This is especially helpful for streaming which naturally creates small files. Option A would create single-file outputs (bad for parallelism). Vacuum removes old files but doesn't compact.

</details>

---

### Question 8.6: Cost Optimization

**Scenario**: A daily ETL job runs for 3 hours. The team wants to reduce costs.

**Question**: Which change provides the biggest cost savings?

A) Switch from all-purpose to job cluster
B) Increase cluster size to finish faster
C) Run during business hours
D) Disable auto-scaling

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Job clusters have ~60% lower DBU rates than all-purpose clusters. They're created for the job and terminated after, eliminating idle time costs. Larger clusters may cost more overall. Auto-scaling typically helps with costs.

</details>

---

## Scoring Guide

| Score | Assessment |
|-------|------------|
| 38-45 correct | Excellent - Ready for exam |
| 30-37 correct | Good - Review weak areas |
| 22-29 correct | Fair - More study needed |
| 15-21 correct | Needs improvement - Focus on fundamentals |
| 0-14 correct | Significant preparation required |

## Question Distribution

| Section | Questions | Exam Weight |
|---------|-----------|-------------|
| 01: Data Processing | 6 | 30% |
| 02: Databricks Tooling | 6 | 20% |
| 03: Data Modeling | 6 | 15% |
| 04: Security & Governance | 5 | 10% |
| 05: Monitoring & Logging | 5 | 10% |
| 06: Testing & Deployment | 5 | 10% |
| 07: Lakeflow Pipelines | 6 | 5% |
| 08: Performance Optimization | 6 | 5% |
| **Total** | **45** | **100%** |

## Additional Practice Resources

- [Databricks Academy](https://www.databricks.com/learn/training/home) - Official training
- [Udemy Practice Exams](https://www.udemy.com/topic/databricks-certified-data-engineer-professional/)
- [ExamTopics](https://www.examtopics.com/exams/databricks/certified-data-engineer-professional/)
- [SkillCertPro](https://skillcertpro.com/product/databricks-data-engineer-professional-practice-tests/)
