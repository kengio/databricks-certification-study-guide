---
title: "Practice Questions: Developing Code for Data Processing using Python and SQL"
type: practice-questions
tags: [data-engineer-professional, practice-questions, developing-code]
---

# Section 1: Developing Code for Data Processing using Python and SQL (23 %)

Practice questions for Section 1 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 1 folder](../../01-developing-code-for-data-processing/README.md).

---

## Question 1: Streaming Triggers

**Question** *(Medium)*: A streaming job processes data from a message queue. The business requires the job to process all available data once per hour and then stop. Which trigger configuration should be used?

A) `trigger(processingTime='1 hour')`  
B) `trigger(once=True)`  
C) `trigger(availableNow=True)`  
D) `trigger(continuous='1 hour')`  

> [!success]- Answer
> **Correct Answer: C**
>
> `availableNow=True` processes all available data and stops, making it ideal for scheduled batch-like streaming. `processingTime` runs continuously. `once=True` is deprecated and only processes one batch. `continuous` is for low-latency and doesn't stop.

---

## Question 2: Watermarking in Streaming

**Question** *(Medium)*: A streaming aggregation job groups events by a 10-minute window. Events can arrive up to 30 minutes late. Which watermark configuration is correct?

A) `withWatermark("event_time", "10 minutes")`  
B) `withWatermark("event_time", "30 minutes")`  
C) `withWatermark("event_time", "40 minutes")`  
D) `withWatermark("processing_time", "30 minutes")`  

> [!success]- Answer
> **Correct Answer: B**
>
> The watermark should match the maximum expected lateness (30 minutes). This tells Spark to wait 30 minutes before finalizing windows. Using event_time (not processing_time) is required for event-time processing.

---

## Question 3: Incremental Processing with readStream

**Question** *(Medium)*: A pipeline reads from a Delta table that receives both inserts and updates. Only new and updated records should be processed. Which configuration enables this?

A) `spark.readStream.option("ignoreChanges", "true").table("source")`  
B) `spark.readStream.option("readChangeData", "true").table("source")`  
C) `spark.readStream.option("readChangeFeed", "true").table("source")`  
D) `spark.readStream.option("skipChangeCommits", "true").table("source")`  

> [!success]- Answer
> **Correct Answer: C**
>
> `readChangeFeed = true` (with CDF enabled on the table) reads the change data feed which includes inserts, updates, and deletes. Option A ignores updates/deletes. Option B uses the wrong option name (`readChangeData` is not valid; the correct name is `readChangeFeed`). Option D is not a valid option.

---

## Question 4: Stream-Stream Join

**Question** *(Medium)*: A data engineer needs to join two streaming sources - clickstream events and ad impressions - to calculate ad conversion rates. Both streams have event timestamps. What is required when performing a stream-stream join?

A) Both streams must use the same checkpoint location  
B) Both streams must have identical schemas  
C) A time-range condition (watermark) must be defined on both streams  
D) One stream must be converted to a static DataFrame first  

> [!success]- Answer
> **Correct Answer: C**
>
> Stream-stream joins require watermarks on both streams to define a time-range condition. This allows Spark to know when old state can be discarded. Checkpoint locations are per-stream. Schemas don't need to match. Both sides remain streaming.

---

## Question 5: Stream-Static Join

**Question** *(Medium)*: A streaming pipeline enriches real-time transaction data with customer details from a slowly-changing dimension table. What happens to the static DataFrame in a stream-static join when it's updated?

A) The static side is re-read for each micro-batch, picking up changes  
B) The static side is cached at query start and never refreshed  
C) The query fails if the static table changes during execution  
D) Updates to the static table require restarting the streaming query  

> [!success]- Answer
> **Correct Answer: A**
>
> In a stream-static join, the static DataFrame is re-read for each micro-batch. This means updates to the dimension table are automatically picked up without restarting the query. This makes it ideal for slowly-changing dimensions.

---

## Question 6: Stateful Streaming Operations

**Question** *(Hard)*: A real-time fraud detection system needs to maintain custom state per user session, tracking cumulative transaction amounts and flagging when thresholds are exceeded within a rolling time window. Which Spark streaming operation provides the most flexibility for this use case?

A) Window aggregation with `groupBy(window(...)).sum()`  
B) `dropDuplicatesWithinWatermark()` with session tracking  
C) `foreachBatch()` with manual state management  
D) `flatMapGroupsWithState()` with GroupStateTimeout  

> [!success]- Answer
> **Correct Answer: D**
>
> `flatMapGroupsWithState()` provides arbitrary stateful processing with full control over state shape, timeout behavior, and output. Window aggregations are limited to predefined aggregation functions. `foreachBatch()` doesn't maintain state across batches. `dropDuplicatesWithinWatermark()` is for dedup only.

---

## Question 7: Advanced Watermarking

**Question** *(Medium)*: A streaming aggregation uses a 10-minute watermark. An event arrives with a timestamp 15 minutes behind the current watermark. How does Spark handle this late event?

A) The event is added to the appropriate window and triggers a recomputation  
B) The event is silently dropped and not included in any aggregation  
C) The event is placed in a special "late data" output stream  
D) The query throws a StreamingQueryException for the late data  

> [!success]- Answer
> **Correct Answer: B**
>
> Events arriving after the watermark threshold has passed are silently dropped. Spark does not re-open completed windows. There is no "late data" output stream or exception. The watermark defines the boundary for acceptable lateness.

---

## Question 8: Streaming Deduplication

**Question** *(Hard)*: An IoT pipeline receives duplicate sensor readings due to at-least-once delivery. Each reading has a `device_id`, `reading_id`, and `event_time`. The pipeline uses a 1-hour watermark. Which approach correctly deduplicates the stream while managing state?

A) `dropDuplicatesWithinWatermark("device_id", "reading_id")` with the existing watermark  
B) `dropDuplicates("device_id", "reading_id")` without any watermark  
C) `MERGE INTO target USING stream ON target.reading_id = stream.reading_id`  
D) `groupBy("device_id", "reading_id").count().filter("count = 1")`  

> [!success]- Answer
> **Correct Answer: A**
>
> `dropDuplicatesWithinWatermark()` uses the existing watermark to bound state size - it only tracks duplicates within the watermark window. `dropDuplicates()` without watermark keeps all keys in state forever, causing unbounded state growth. MERGE is for batch. GroupBy-count doesn't actually deduplicate the output.

---

## Question 9: State Store Configuration

**Question** *(Hard)*: A stateful streaming query tracking millions of user sessions is running out of executor memory due to the state store size. Which state store backend should be used for large state volumes?

A) HDFS state store with increased `spark.executor.memory`  
B) RocksDB state store backend with `spark.sql.streaming.stateStore.providerClass`  
C) Delta Lake state store for ACID guarantees on state  
D) Redis-backed state store for distributed state management  

> [!success]- Answer
> **Correct Answer: B**
>
> RocksDB state store uses local disk (SSD) instead of JVM heap memory, allowing much larger state without OOM errors. Configure via `spark.sql.streaming.stateStore.providerClass=com.databricks.sql.streaming.state.RocksDBStateStoreProvider`. The default HDFS backend stores state in JVM memory. Delta Lake and Redis state stores are not available in Spark.

---

## Question 10: dbutils.widgets

**Question** *(Easy)*: A notebook needs to accept a date parameter that defaults to yesterday's date when not provided. Which code correctly creates this widget?

A) `dbutils.widgets.text("date", str(date.today() - timedelta(days=1)))`  
B) `dbutils.widgets.dropdown("date", str(date.today() - timedelta(days=1)), [])`  
C) `dbutils.widgets.create("date", default=str(date.today() - timedelta(days=1)))`  
D) `dbutils.widgets.parameter("date", str(date.today() - timedelta(days=1)))`  

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.widgets.text(name, defaultValue)` creates a text input widget with a default value. Option B requires a list of choices. Options C and D are not valid methods.

---

## Question 11: %run Magic Command

**Question** *(Easy)*: A main notebook needs to call a utility notebook and use variables defined in it. Which statement is true about `%run`?

A) Variables from the called notebook are not accessible in the calling notebook  
B) `%run` executes the notebook asynchronously  
C) Variables from the called notebook are available in the calling notebook's scope  
D) `%run` can only be used with notebooks in the same folder  

> [!success]- Answer
> **Correct Answer: C**
>
> `%run` executes the notebook in the current notebook's context, making all variables and functions available. It runs synchronously and can reference notebooks using relative or absolute paths.

---

## Question 12: Jobs API Run Now

**Question** *(Easy)*: A data engineer needs to trigger a job via API with custom parameters. Which API endpoint and method should be used?

A) `POST /api/2.1/jobs/run-now`  
B) `GET /api/2.1/jobs/trigger`  
C) `POST /api/2.0/jobs/start`  
D) `PUT /api/2.1/jobs/execute`  

> [!success]- Answer
> **Correct Answer: A**
>
> `POST /api/2.1/jobs/run-now` triggers a job run with optional parameter overrides. This is the current Jobs API version. The other endpoints don't exist.

---

## Question 13: Cluster Types

**Question** *(Medium)*: A production ETL job runs daily for 2 hours. Cost optimization is a priority. Which cluster configuration is most cost-effective?

A) All-purpose cluster running 24/7  
B) Job cluster created for each run  
C) All-purpose cluster with auto-termination  
D) Serverless cluster  

> [!success]- Answer
> **Correct Answer: B**
>
> Job clusters are created for the job run and terminated after completion. They have lower DBU rates (~60% less than all-purpose) and only incur costs during execution. All-purpose clusters cost more and may have idle time even with auto-termination.

---

## Question 14: Unit Testing with Nutter

**Question** *(Medium)*: A team needs to run tests inside Databricks notebooks as part of CI/CD. Which Nutter pattern is correct?

A) `def test_my_function():` followed by assertions  
B) `before_`, `run_`, and `assertion_` method prefixes for each test  
C) `@test` decorator on test methods  
D) `TestCase` class inheritance  

> [!success]- Answer
> **Correct Answer: B**
>
> Nutter uses a specific naming convention: `before_<test>` for setup, `run_<test>` for execution, and `assertion_<test>` for verification. This pattern allows tests to run inside Databricks notebooks.

---

## Question 15: Integration Testing Lakeflow Pipelines

**Question** *(Hard)*: A team needs to test a Lakeflow pipeline end-to-end as part of CI/CD, validating that expectations pass and output data is correct. What is the recommended approach for integration testing Lakeflow pipelines?

A) Deploy the pipeline to a test target with a test catalog/schema, trigger a full refresh, then validate the output tables and event log  
B) Mock the Lakeflow Pipelines framework locally using pytest and validate transformation logic without deploying  
C) Run the pipeline in `development` mode which automatically validates all expectations and reports results  
D) Use the Lakeflow Pipelines testing API `dlt.test_pipeline()` to run the pipeline in a sandbox environment  

> [!success]- Answer
> **Correct Answer: A**
>
> Lakeflow pipelines must run on Databricks infrastructure. Deploy to a test target (using a test catalog/schema for isolation), trigger a full refresh via the API, then query the output tables and event log for expectation results. Local mocking doesn't test Lakeflow Pipelines-specific behavior. Development mode runs the pipeline but doesn't automatically validate outputs. There is no `dlt.test_pipeline()` API.

---

## Question 16: Testing Strategies - Unit vs Integration

**Question** *(Medium)*: A data engineer writes a Python function that transforms a DataFrame (adding calculated columns, filtering invalid rows). The function is used inside a Lakeflow pipeline. What is the correct testing strategy for this function?

A) Only test within the Lakeflow pipeline since the function depends on the Lakeflow Pipelines runtime  
B) Write integration tests that deploy the full pipeline and verify end-to-end output  
C) Use `unittest.mock` to mock the entire SparkSession and DataFrame API  
D) Extract the function to a separate module, unit test it with a local SparkSession and sample data, then integration test the full pipeline  

> [!success]- Answer
> **Correct Answer: D**
>
> Pure transformation functions should be extracted to testable modules and unit tested locally with a SparkSession (no Lakeflow Pipelines dependency needed). This gives fast feedback. Integration tests run the full pipeline on Databricks for end-to-end validation. Mocking the entire DataFrame API is brittle and doesn't test actual Spark behavior. Testing only in Lakeflow Pipelines is slow and expensive.

---

## Question 17: Streaming Table vs Materialized View

**Question** *(Medium)*: A Lakeflow pipeline needs a table that aggregates daily sales totals from a streaming source. Which table type is most appropriate?

A) Streaming table  
B) Materialized view  
C) Live table  
D) Temporary view  

> [!success]- Answer
> **Correct Answer: B**
>
> Materialized views are appropriate for aggregations as they fully recompute results. Streaming tables are for append-only incremental processing and don't support aggregations well. "Live table" is deprecated terminology.

---

## Question 18: APPLY CHANGES

**Question** *(Medium)*: A CDC pipeline receives insert, update, and delete events. The target table should reflect the current state only. Which APPLY CHANGES configuration is correct?

A) `STORED AS SCD TYPE 1`  
B) `STORED AS SCD TYPE 2`  
C) `STORED AS SNAPSHOT`  
D) `STORED AS CURRENT`  

> [!success]- Answer
> **Correct Answer: A**
>
> SCD Type 1 maintains only the current state by overwriting on updates. SCD Type 2 maintains full history with start/end dates. Options C and D are not valid APPLY CHANGES syntax.

---

## Question 19: Lakeflow Pipelines Table Reference

**Question** *(Easy)*: A Lakeflow Pipelines SQL query needs to read from another table defined in the same pipeline. How should the source table be referenced?

A) `SELECT * FROM source_table`  
B) `SELECT * FROM LIVE.source_table`  
C) `SELECT * FROM delta.source_table`  
D) `SELECT * FROM dlt.source_table`  

> [!success]- Answer
> **Correct Answer: B**
>
> In Lakeflow Pipelines SQL, tables within the pipeline are referenced using the `LIVE.` prefix. This tells Lakeflow Pipelines that the table is defined within the same pipeline and creates the proper dependency.

---

## Question 20: Pipeline Modes

**Question** *(Easy)*: A Lakeflow pipeline processes data continuously as it arrives with minimal latency. Which pipeline configuration enables this?

A) `triggered: true`  
B) `continuous: true`  
C) `development: false`  
D) `streaming: true`  

> [!success]- Answer
> **Correct Answer: B**
>
> `continuous: true` keeps the pipeline running continuously, processing data as it arrives. Triggered mode (default) processes data in batches when manually started or scheduled. `development` affects cluster size, not processing mode.

---

## Question 21: Full Refresh

**Question** *(Easy)*: A schema change requires reprocessing all historical data in a Lakeflow pipeline. How should the pipeline be refreshed?

A) Delete the target tables and restart  
B) Use `databricks pipelines start --full-refresh`  
C) Set `reset: true` in pipeline configuration  
D) Drop and recreate the pipeline  

> [!success]- Answer
> **Correct Answer: B**
>
> `--full-refresh` flag clears checkpoints and reprocesses all data from the beginning. This preserves pipeline configuration while resetting state. Manually deleting tables or recreating pipelines is error-prone.

---

## Question 22: Bundle Resource Not Deployed *(2026 blueprint)*

**Question** *(Easy)*: A team keeps its Declarative Automation Bundle modular: `databricks.yml` at the root, one YAML file per job under `resources/`, and shared code in `src/my_project/`. A developer adds `resources/ingest.job.yml`, runs `databricks bundle deploy -t dev`, and the deployment succeeds, but the new job does not appear in the workspace. What is the most likely fix?

A) Rename the file to `databricks.yml` so the CLI reads it  
B) Add the file, or a glob such as `resources/*.yml`, to the top-level `include` mapping in `databricks.yml`  
C) Move the job definition into `src/my_project/__init__.py`  
D) Run `databricks bundle init default-python` again to regenerate the project  

> [!success]- Answer
> **Correct Answer: B**
>
> The resource file must be listed in the top-level `include` mapping.
>
> A bundle has exactly one `databricks.yml`, and every other configuration file must be listed in `include` (globs relative to the declaring file). A is wrong because a bundle can have only one `databricks.yml`. C is wrong because `src/` holds Python source, not bundle configuration. D regenerates a template and doesn't fix the missing include.

---

## Question 23: Building a Wheel as a Bundle Artifact *(2026 blueprint)*

**Question** *(Medium)*: A bundle's `src/my_project/` package must be built into a wheel on every deployment and run by a `python_wheel_task` on serverless compute. Which configuration is correct?

A) An `artifacts` entry with `type: whl` and `build: uv build --wheel`, and a job `environments` spec whose `dependencies` list the built wheel, referenced from the task by `environment_key`  
B) An init script that runs `pip install` on the serverless compute at startup  
C) A compute-scoped library attached to the serverless compute through the Libraries tab  
D) A task-level `libraries` entry only, with no environment, because serverless Python wheel tasks don't need one  

> [!success]- Answer
> **Correct Answer: A**
>
> Build the wheel with an `artifacts` entry and install it through a job environment referenced by `environment_key`.
>
> `artifacts` with `type: whl` builds the package locally before upload, and on serverless, Python wheel and Python script tasks require an environment via `environment_key`. B and C are wrong because serverless doesn't support init scripts or compute-scoped libraries. D is wrong because an environment is required for Python wheel tasks on serverless.

---

## Question 24: Stale Custom Package on Serverless *(2026 blueprint)*

**Question** *(Medium)*: A data engineer fixes a bug in an internal Python package, rebuilds the wheel with the same version number `1.4.0`, and redeploys the bundle. The serverless job still behaves as if the old code is installed. What should the engineer do?

A) Add `dbutils.library.restartPython()` at the end of the job's entry point  
B) Switch the job to standard performance mode  
C) Increase the package version (or set `dynamic_version: true` on the bundle artifact) so the cached environment is not reused  
D) Install the package from the DBFS root instead of a Unity Catalog volume  

> [!success]- Answer
> **Correct Answer: C**
>
> Change the package version, manually or with `dynamic_version: true`.
>
> Serverless caches job environments, and Databricks documents that when you change a custom package's implementation you must also update its version number. `dynamic_version: true` patches the wheel version on each deploy. A restarts Python but doesn't change what is installed. B affects startup latency and cost, not dependencies. D is wrong because DBFS-root library storage is deprecated and wouldn't bypass the cache.

---

## Question 25: Private Package Fails Only on Serverless *(2026 blueprint)*

**Question** *(Hard)*: A package hosted in an internal Artifactory repository installs correctly on classic clusters, where an init script sets proxy environment variables. When the same notebook runs on serverless compute, installing the package from the Environment side pane fails. Which fix follows Databricks guidance?

A) Set `HTTP_PROXY` with `os.environ` in the first notebook cell before the dependency installs  
B) Specify `--index-url` or `--extra-index-url` in the dependency specification, or have an admin configure the repository as a default package repository  
C) Attach the init script to the serverless compute through a compute policy  
D) Install the package as a Maven coordinate  

> [!success]- Answer
> **Correct Answer: B**
>
> Point the dependency at the private index, or configure a workspace default package repository.
>
> On serverless, dependencies are resolved before any code runs and compute-scoped environment variables aren't supported, so runtime proxy settings have no effect. A fails for that reason. C fails because serverless doesn't support init scripts or compute policies. D is wrong because the package is a Python package and Maven coordinates aren't supported on serverless.

---

## Question 26: Governed Python Function for SQL Warehouses *(2026 blueprint)*

**Question** *(Medium)*: A team wrote a session-scoped `@udf` that masks email addresses in a notebook. Analysts in several workspaces attached to the same metastore must call it from dashboards on a serverless SQL warehouse, and access must be controlled per group. What should the team do?

A) Register the function with `spark.udf.register` in a shared notebook  
B) Convert it to a pandas UDF so it runs faster  
C) Create it with `CREATE FUNCTION catalog.schema.mask_email(...) RETURNS STRING LANGUAGE PYTHON AS $$ ... $$` and grant `EXECUTE` to the analyst group  
D) Package it in a wheel and install it as a compute-scoped library on the SQL warehouse  

> [!success]- Answer
> **Correct Answer: C**
>
> Register it as a Unity Catalog Python UDF and grant `EXECUTE`.
>
> Unity Catalog functions are persisted, governed with `EXECUTE`, callable from pro and serverless SQL warehouses, and reachable from all workspaces attached to the metastore. A and B create session-scoped functions that exist only in the defining SparkSession. D is wrong because SQL warehouses don't take compute-scoped libraries.

---

## Question 27: Vectorized Governed UDF *(2026 blueprint)*

**Question** *(Hard)*: A governed Unity Catalog Python UDF computes a score row by row and is too slow on large tables. The function must stay in Unity Catalog and return exactly one value per input row, and an expensive lookup table should be loaded only once. Which definition fits?

A) `CREATE FUNCTION ... RETURNS TABLE (...) LANGUAGE PYTHON HANDLER 'Scorer'` with an `eval` method  
B) `CREATE FUNCTION ... RETURNS DOUBLE LANGUAGE PYTHON PARAMETER STYLE PANDAS HANDLER 'handler'`, with the lookup loaded outside the handler that iterates over `pandas.Series` batches  
C) A session-scoped `groupBy().applyInPandas()` call in each notebook  
D) `CREATE TEMPORARY FUNCTION ... LANGUAGE SQL` that calls the Python UDF  

> [!success]- Answer
> **Correct Answer: B**
>
> Use a Batch Unity Catalog Python UDF with `PARAMETER STYLE PANDAS` and a `HANDLER`.
>
> Batch Unity Catalog Python UDFs process iterators of `pandas.Series`, must yield the same number of rows as the input, and code outside the handler runs once. A defines a UDTF, which returns tables rather than one value per row. C is session-scoped, not governed, and loads whole groups into memory. D creates a temporary, ungoverned wrapper that still calls the slow row-at-a-time UDF.

---

## Question 28: Cheapest Serverless Nightly Job *(2026 blueprint)*

**Question** *(Easy)*: A nightly serverless job has a six-hour SLA and the team wants to minimize DBU consumption. Startup delays of several minutes are acceptable. Which setting should they change?

A) Enable high memory on the job's notebook task  
B) Turn off **Performance optimized** so the job uses standard performance mode (`performance_target: STANDARD`)  
C) Uncheck **Enable serverless auto-optimization** on every task  
D) Attach an instance pool to the serverless job  

> [!success]- Answer
> **Correct Answer: B**
>
> Use standard performance mode.
>
> Standard mode uses less compute and consumes fewer DBUs on the same SKU, with a typical startup of 4 to 6 minutes, which suits batch jobs that tolerate latency. A increases the DBU emission rate. C changes retry behaviour, not cost profile. D is wrong because serverless doesn't support instance pools.

---

## Question 29: Non-Idempotent Serverless Task *(2026 blueprint)*

**Question** *(Medium)*: A serverless job task posts invoices to an external billing API and is not idempotent. After a transient failure, invoices were sent twice even though the task's `max_retries` is 0. What should the engineer configure?

A) In the task's retry policy, uncheck **Enable serverless auto-optimization (may include additional retries)** (`disable_auto_optimization: true`)  
B) Set `max_retries` to `-1`  
C) Switch the task to high memory  
D) Pin the serverless environment version  

> [!success]- Answer
> **Correct Answer: A**
>
> Disable serverless auto-optimization for the task.
>
> Serverless auto-optimization is on by default and retries failed tasks; Databricks recommends turning it off for workloads that must run at most once, such as non-idempotent jobs. B retries indefinitely, the opposite of the goal. C and D don't affect retries.

---

## Question 30: Testing a Composed Transformation *(2026 blueprint)*

**Question** *(Medium)*: A silver pipeline is written as `df.transform(clean_names).transform(add_net_amount, tax_rate=0.1)`. A `pytest` test compares its output, which contains floating-point amounts and has no defined row order, with an expected DataFrame. Which assertion is most appropriate?

A) `assert actual.collect() == expected.collect()`  
B) `assertSchemaEqual(actual, expected)`  
C) `assertDataFrameEqual(actual, expected, checkRowOrder=True)`  
D) `assertDataFrameEqual(actual, expected, rtol=1e-5)`  

> [!success]- Answer
> **Correct Answer: D**
>
> `assertDataFrameEqual` with a relative tolerance and the default row-order handling.
>
> `assertDataFrameEqual` compares schema and data, ignores row order by default, and treats floats as equal within `rtol`/`atol`. A depends on row order and exact float equality. B compares only schemas and expects `StructType` arguments, not DataFrames. C would fail because the output isn't sorted.

---

## Question 31: Schema Contract Test *(2026 blueprint)*

**Question** *(Easy)*: A downstream team relies on the output columns and types of a `build_gold(df)` function, but the data values change daily. Which test checks only that contract?

A) `assertSchemaEqual(build_gold(df).schema, expected_schema)` where `expected_schema` is a `StructType`  
B) `assertDataFrameEqual(build_gold(df), expected_df)`  
C) `assert build_gold(df).count() > 0`  
D) `assertDataFrameEqual(build_gold(df), [], checkRowOrder=True)`  

> [!success]- Answer
> **Correct Answer: A**
>
> Compare the schemas with `assertSchemaEqual`.
>
> `assertSchemaEqual` compares two `StructType` schemas and raises `[DIFFERENT_SCHEMA]` on mismatch without looking at data. B also compares row values, which change daily. C checks only that rows exist. D compares against an empty list of rows and would fail on any data.

---

## Question 32: Auto Loader Streaming Table *(2026 blueprint)*

**Question** *(Medium)*: JSON files land continuously in a Unity Catalog volume. A data engineer must ingest them into a bronze table in a Lakeflow pipeline so that each file is processed exactly once, new files are picked up incrementally, and schema inference is handled automatically. Which SQL definition meets the requirement?

A) `CREATE OR REFRESH MATERIALIZED VIEW bronze AS SELECT * FROM read_files('/Volumes/main/landing/orders/', format => 'json')`  
B) `CREATE OR REFRESH STREAMING TABLE bronze AS SELECT * FROM STREAM read_files('/Volumes/main/landing/orders/', format => 'json')`  
C) A scheduled `COPY INTO bronze` job with `COPY_OPTIONS ('force' = 'true')`  
D) `CREATE OR REFRESH STREAMING TABLE bronze AS SELECT * FROM read_files('/Volumes/main/landing/orders/', format => 'json')` with `cloudFiles.schemaLocation` set in the pipeline configuration  

> [!success]- Answer
> **Correct Answer: B**
>
> A streaming table that reads with `STREAM read_files(...)` uses Auto Loader for incremental, exactly-once file ingestion.
>
> Databricks recommends streaming tables with Auto Loader for file ingestion, and `read_files` invokes Auto Loader only with the `STREAM` keyword. A is wrong because materialized views should not be defined over Auto Loader ingest; they are recomputed rather than processing each file once. C is wrong because `force = true` reloads every file and creates duplicates. D is wrong because a streaming table's query must be a streaming query, so `STREAM` is required, and pipelines manage the schema location automatically.

---

## Question 33: Auto Loader Schema Evolution Mode *(2026 blueprint)*

**Question** *(Medium)*: A bronze streaming table ingests JSON events with Auto Loader in a Lakeflow pipeline. Front-end teams add fields without notice. The team wants the stream never to fail because of schema changes, and wants unexpected fields preserved for later review rather than added as columns. Which `cloudFiles.schemaEvolutionMode` should they set?

A) `addNewColumns`  
B) `failOnNewColumns`  
C) `rescue`  
D) `none`  

> [!success]- Answer
> **Correct Answer: C**
>
> `rescue` never evolves the schema, never fails the stream, and records new columns in the rescued data column.
>
> A is wrong because `addNewColumns` deliberately fails the stream with `UnknownFieldException` after adding the columns and needs a restart. B is wrong because `failOnNewColumns` stops the stream until the schema or the data file is fixed. D is wrong because `none` ignores new columns and does not rescue their data unless a rescued data column is configured.

---

## Question 34: Gold Table Over Updated Silver Data *(2026 blueprint)*

**Question** *(Medium)*: A silver orders table is regularly updated with `MERGE` when refunds adjust past orders. A gold table must report revenue per customer that always reflects those adjustments. It is refreshed hourly by a serverless Lakeflow pipeline, and the team wants to avoid recomputing everything when only a few customers change. Which object should the engineer define?

A) A materialized view over the silver table  
B) A streaming table that reads the silver table with `skipChangeCommits`  
C) A temporary view over the silver table  
D) A streaming table that reads the silver table without any options  

> [!success]- Answer
> **Correct Answer: A**
>
> A materialized view always matches its query's result over the current source data, and on serverless it refreshes incrementally when the query supports it.
>
> B is wrong because `skipChangeCommits` ignores update and delete commits, so the refunds would never reach gold. C is wrong because a temporary view is not persisted or published; it is recomputed whenever it is queried and is usable only inside the pipeline. D is wrong because a streaming read fails when its source contains update or delete commits, and a streaming table never revisits rows it already processed.

---

## Question 35: Ingesting from Kafka *(2026 blueprint)*

**Question** *(Easy)*: A Kafka topic keeps messages for 7 days. The business needs every event kept permanently in a bronze table with latency of a few seconds. Which Lakeflow pipeline design fits?

A) A materialized view that reads the topic with `read_kafka`, refreshed every minute  
B) A materialized view over `read_kafka` with `REFRESH POLICY INCREMENTAL STRICT`  
C) A temporary view over `read_kafka` queried by downstream tables  
D) A streaming table that reads the topic with `STREAM read_kafka(...)` in a continuously running pipeline  

> [!success]- Answer
> **Correct Answer: D**
>
> A streaming table processes each Kafka record once and keeps it after the topic's retention expires; continuous execution gives low latency.
>
> A and B are wrong because the docs warn against defining materialized views on sources that don't retain history, such as Kafka. A recompute would lose events older than the retention period, and MVs are not designed for second-level latency. C is wrong because a view is not persisted, so nothing is kept permanently.

---

## Question 36: Selective SCD Type 2 History *(2026 blueprint)*

**Question** *(Medium)*: An AUTO CDC flow maintains an employee dimension. Auditors need a new history row only when `salary` or `department` changes. Frequent changes to `last_login` must update the current row without creating history. Which `dp.create_auto_cdc_flow` arguments meet the requirement?

A) `stored_as_scd_type=1, except_column_list=["last_login"]`  
B) `stored_as_scd_type=2, track_history_column_list=["salary", "department"]`  
C) `stored_as_scd_type=2, except_column_list=["last_login"]`  
D) `stored_as_scd_type=2, apply_as_truncates=expr("operation = 'T'")`  

> [!success]- Answer
> **Correct Answer: B**
>
> SCD Type 2 with `track_history_column_list` creates versions only for the listed columns; changes to other columns update the current version in place.
>
> A is wrong because SCD Type 1 keeps no history at all. C is wrong because `except_column_list` removes `last_login` from the target entirely and every remaining column still creates history. D is wrong because `apply_as_truncates` is supported only for SCD Type 1 and has nothing to do with history tracking.

---

## Question 37: Migrating apply_changes *(2026 blueprint)*

**Question** *(Medium)*: A pipeline contains `dlt.apply_changes(target="dim_customer", source="customer_cdc", keys=["id"], sequence_by=col("ts"), stored_as_scd_type=2)`. The engineer is moving it to the current `pyspark.pipelines` API without changing behavior. Which code is correct?

A) `dp.create_streaming_table("dim_customer")` followed by `dp.create_auto_cdc_flow(target="dim_customer", source="customer_cdc", keys=["id"], sequence_by=col("ts"), stored_as_scd_type=2)`  
B) An `@dp.materialized_view` named `dim_customer` that runs a `MERGE` against the source  
C) `dp.create_auto_cdc_from_snapshot_flow(target="dim_customer", source="customer_cdc", keys=["id"], stored_as_scd_type=2)`  
D) A managed table created with `CREATE TABLE dim_customer ... FLOW`, then `dp.create_auto_cdc_flow(...)` with the same arguments  

> [!success]- Answer
> **Correct Answer: A**
>
> `create_auto_cdc_flow` replaces `apply_changes` with the same signature, and its target must be a streaming table created first.
>
> B is wrong because dataset functions must return a DataFrame and must not run writes such as `MERGE`. C is wrong because the snapshot API compares full snapshots and is meant for sources without a change feed; it has no `sequence_by`. D is wrong because managed tables created with `CREATE TABLE ... FLOW` do not support CDC flows and fail with `MANAGED_TABLE_DOES_NOT_SUPPORT_CDC`.

---

## Question 38: When Structured Streaming Fits Better *(2026 blueprint)*

**Question** *(Hard)*: A team needs a streaming aggregation emitted in **complete** output mode to a custom sink. They also want explicit control over the trigger interval and the checkpoint location, and plan to run it on jobs compute. Which approach fits these operational constraints?

A) A streaming table in a continuous Lakeflow pipeline with its flow set to complete mode  
B) A materialized view refreshed every minute by a scheduled pipeline  
C) Spark Structured Streaming code scheduled as a Lakeflow Jobs task  
D) An AUTO CDC flow with `stored_as_scd_type=1`  

> [!success]- Answer
> **Correct Answer: C**
>
> Structured Streaming gives full control over output mode, trigger, sink, and checkpoint location.
>
> A is wrong because pipelines currently expose only append and update flows, and they manage checkpoints themselves. B is wrong because a materialized view is a batch flow, not a streaming query writing to a custom sink. D is wrong because AUTO CDC applies change events into a streaming table; it is not a complete-mode aggregation to a custom sink.

---

## Question 39: When Declarative Pipelines Fit Better *(2026 blueprint)*

**Question** *(Medium)*: A SQL-focused team is building a bronze-silver-gold pipeline. They need automatic dependency ordering, automatic retries of transient failures, data quality rules with pass/fail metrics, lineage, and CDC handling, all with minimal custom code on Databricks. Which approach best fits?

A) Structured Streaming notebooks chained as job tasks, with custom metrics tables  
B) Open-source Apache Spark Declarative Pipelines on a self-managed Spark 4.1 cluster  
C) Scheduled `COPY INTO` statements in a SQL warehouse  
D) Lakeflow Pipelines with streaming tables, materialized views, expectations, and AUTO CDC  

> [!success]- Answer
> **Correct Answer: D**
>
> Lakeflow Pipelines infer dependencies, retry failures (task, then flow, then pipeline), and add expectations, AUTO CDC, and a queryable event log on top of SDP.
>
> A is wrong because the team would have to write and maintain the orchestration, retries, checkpoints, and quality metrics themselves. B is wrong because open-source SDP does not include expectations, AUTO CDC, or the event log; those are Lakeflow additions. C is wrong because `COPY INTO` is batch file loading with no dependency graph, expectations, or CDC handling.

---

**[↑ Back to Practice Questions](./README.md) | [Next: Data Ingestion & Acquisition →](./02-data-ingestion.md)**
