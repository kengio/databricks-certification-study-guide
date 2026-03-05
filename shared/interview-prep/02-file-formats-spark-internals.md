---
tags: [interview-prep, file-formats, spark]
---

# Interview Questions — File Formats & Spark Internals

---

## Question 1: When to Choose Parquet vs CSV

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A new data engineer asks: "Our team uses both Parquet files and CSVs in the data lake. When should I choose each? Our vendor delivers daily CSV exports — should we convert them to Parquet immediately on arrival?"

> [!success]- Answer Framework
>
> **Short Answer**: Use Parquet for any analytical table that will be queried repeatedly — columnar layout, predicate pushdown, and better compression make reads 10–100x faster than CSV; use CSV for raw landing zones, vendor delivery, human-readable audits, and data exchanged with non-technical consumers — but always convert CSV to Delta/Parquet at the Silver layer, never query CSV directly in production workloads.
>
> ### Key Points to Cover
>
> - CSV: row-oriented, human-readable, no schema metadata, slow for analytics
> - Parquet: columnar, compressed, stores min/max statistics per column, fast for analytics
> - Column projection: Parquet reads only requested columns; CSV reads every column for every row
> - Predicate pushdown: Parquet row group min/max stats skip entire chunks; CSV has no such metadata
> - Best practice: land raw CSV in Bronze as-is (preserve the original), convert to Delta/Parquet in Silver
> - When CSV is appropriate: vendor delivery, Excel/BI tool exports, small ad-hoc files, audit exports
>
> ### Example Answer
>
> The choice comes down to who reads the data and how often.
>
> **Why Parquet wins for analytics:**
>
> Parquet is columnar — all values for one column are stored together on disk. To compute `SUM(revenue)` across 100 million rows of a 50-column table, Spark reads only the `revenue` column pages (2% of the data). CSV is row-oriented — Spark must parse every column of every row to reach `revenue`.
>
> ```text
> CSV layout (row-oriented):
> Row 1: order_id | customer_id | product | qty | revenue | region | ... (50 cols)
> Row 2: order_id | customer_id | product | qty | revenue | region | ...
> → Reading revenue requires parsing EVERY column of EVERY row
>
> Parquet layout (columnar):
> revenue column: [99.00, 49.00, 120.00, ...]  ← only this is read
> order_id column: [1, 2, 3, ...]              ← skipped entirely
> customer_id column: [42, 77, 15, ...]        ← skipped entirely
> ```
>
> Parquet also stores **min/max statistics** per row group. A query with `WHERE revenue > 1000` can skip entire row groups where `max(revenue) < 1000` — without reading a single data byte from them. CSV has no such metadata.
>
> Finally, Parquet compresses much better than CSV: values within a single column are homogeneous in type and range (e.g., all `region` values are one of 10 strings), enabling efficient run-length encoding and dictionary encoding.
>
> **When CSV is appropriate:**
>
> | Situation | Use CSV |
> | --------- | ------- |
> | Vendor delivers data in CSV | Yes — accept as-is, convert in Silver |
> | Audit export for a regulator | Yes — human-readable, no special tooling |
> | Small reference file opened in Excel | Yes |
> | Table queried > 1x per day in Databricks | No — convert to Delta |
> | Bronze landing zone (raw preservation) | Yes — land as-is for replay |
>
> **Best practice for vendor CSV files:**
>
> Land the raw CSV in Bronze exactly as received (preserving the original for replay and audit), then convert to Delta/Parquet in Silver with an explicit schema:
>
> ```python
> from pyspark.sql.types import StructType, StructField, LongType, StringType, DoubleType
>
> orders_schema = StructType([
>     StructField("order_id", LongType()),
>     StructField("customer_id", LongType()),
>     StructField("revenue", DoubleType()),
>     StructField("region", StringType()),
> ])
>
> # Bronze: land raw CSV as-is (no schema enforcement, rescue unknown columns)
> (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "csv")
>     .option("cloudFiles.schemaLocation", "/checkpoints/schema/vendor_orders")
>     .option("header", "true")
>     .option("cloudFiles.schemaEvolutionMode", "rescue")
>     .load("s3://landing/vendor/orders/")
>     .writeStream
>     .format("delta")
>     .option("checkpointLocation", "/checkpoints/bronze/vendor_orders")
>     .toTable("bronze.vendor_orders"))
>
> # Silver: parse with explicit schema, convert types, enforce structure
> silver_df = (spark.read.table("bronze.vendor_orders")
>     .select(
>         col("order_id").cast(LongType()),
>         col("revenue").cast(DoubleType()),
>         col("region"),
>     ))
> ```
>
> Never use `inferSchema=True` in production — it forces a full file scan before writing a single row (doubles read time) and can infer wrong types (e.g., a column with 99.9% integers and one decimal becomes `DoubleType`).
>
> ### Follow-up Questions
>
> - CSV has no predicate pushdown. How does Databricks handle `WHERE region = 'West'` on a CSV source?
> - A vendor adds three new columns to their CSV export without warning. How does Auto Loader's rescue column handle this vs. a plain `spark.read.csv`?
> - What is a Parquet "row group" and how does its size (target: 128MB) affect data skipping effectiveness?

---

## Question 2: How Delta Lake Improves on Plain Parquet

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A data architect says: "We already store everything in Parquet on S3. Why should we migrate to Delta Lake? What does Delta add that plain Parquet doesn't give us?" Give a clear, structured answer.

> [!success]- Answer Framework
>
> **Short Answer**: Plain Parquet is just immutable files with no coordination layer — no transactions, no schema enforcement, no versioning, and no built-in mechanism to prevent concurrent write corruption; Delta Lake adds a `_delta_log/` write-ahead log on top of Parquet that enables ACID transactions, time travel, schema enforcement and evolution, file-level data skipping statistics, automatic compaction (OPTIMIZE/VACUUM), Change Data Feed, and optimistic concurrency control for safe concurrent writes.
>
> ### Key Points to Cover
>
> - Plain Parquet: immutable files, no transaction log, no schema enforcement, no versioning
> - Delta adds `_delta_log/` as a write-ahead log: every commit is an atomic JSON entry
> - ACID: atomic multi-file commits, concurrent write safety via optimistic concurrency
> - Schema enforcement: writes that don't match the table schema are rejected at write time
> - Schema evolution: new columns can be added with `mergeSchema` without rewriting data
> - Time travel: old Parquet files stay on disk until VACUUM, enabling `VERSION AS OF` queries
> - Data skipping: min/max statistics stored in the log speed up query filtering
> - OPTIMIZE / VACUUM: compacts small files, cleans up old versions
> - Change Data Feed: row-level change tracking for incremental downstream processing
>
> ### Example Answer
>
> Plain Parquet on S3 is a collection of immutable files with no coordination layer. This creates several operational problems:
>
> **Problem 1 — No atomicity**: If a write job fails halfway through, you have partial data in S3 with no way to distinguish "good" files from "partial write" files. Readers see inconsistent state.
>
> **Problem 2 — No concurrent write safety**: Two jobs writing to the same directory simultaneously can corrupt each other's output. Parquet has no locking or conflict detection.
>
> **Problem 3 — No schema enforcement**: Any job can write files with a different schema into the same directory. Readers may silently get wrong data or `null` values.
>
> **Problem 4 — No versioning or rollback**: If a bug corrupts data, your only recovery option is from a backup — if you have one.
>
> **What Delta adds:**
>
> | Capability | Plain Parquet | Delta Lake |
> | ---------- | ------------- | ---------- |
> | Atomic multi-file commits | No | Yes (`_delta_log/`) |
> | Concurrent write safety | No | Yes (optimistic concurrency) |
> | Schema enforcement | No | Yes (rejects non-conforming writes) |
> | Schema evolution | Manual file management | `mergeSchema`, `autoMerge` |
> | Time travel / rollback | No | Yes (`VERSION AS OF`, `RESTORE`) |
> | Data skipping statistics | No | Yes (min/max per file in log) |
> | File compaction | Manual | `OPTIMIZE`, `VACUUM` |
> | Row-level change tracking | No | Yes (Change Data Feed) |
> | Streaming + batch on same table | Fragile | Yes (unified table model) |
>
> ```sql
> -- Delta enforces schema at write time
> INSERT INTO prod.silver.orders VALUES (NULL, NULL, NULL);
> -- Error: NOT NULL constraint violated for column order_id
>
> -- Delta supports time travel
> SELECT * FROM prod.silver.orders VERSION AS OF 42;
>
> -- Delta tracks row-level changes for downstream incremental processing
> ALTER TABLE prod.silver.orders
> SET TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');
>
> SELECT * FROM table_changes('prod.silver.orders', 50);
> ```
>
> The `_delta_log/` directory is Delta's write-ahead log — every successful commit appends a JSON file listing exactly which Parquet files were added or removed. This log is the source of all Delta's guarantees. Readers always read the log first to determine which files constitute the current (or any historical) version of the table.
>
> For more detail on optimistic concurrency and checkpoint files in the log, see `02-delta-lake-internals.md` Q1.
>
> ### Follow-up Questions
>
> - If I query a Delta table while a long MERGE is running, do I see partial results?
> - How does Delta's schema enforcement interact with Auto Loader's schema evolution mode?
> - Plain Parquet on S3 is "eventually consistent" — what specific race condition does this create and how does Delta eliminate it?

---

## Question 3: Parquet Schema Evolution vs CSV Schema Drift

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
Two Bronze ingestion pipelines broke this week: one ingesting Parquet files from a vendor data feed (they added two new columns), and one ingesting CSV exports from a legacy ERP (a column was reordered and three new columns appeared). Walk me through how you'd handle schema changes robustly for each format going forward.

> [!success]- Answer Framework
>
> **Short Answer**: Parquet embeds schema metadata, so Delta's `mergeSchema=true` safely adds new columns (old files return null for the new column), but column renames and type narrowing are breaking changes requiring Silver-level remapping; CSV has no schema metadata so column reordering silently corrupts positional reads — defend with Auto Loader's `rescue` column to capture all unexpected fields as JSON in `_rescued_data`, then alert when that column is non-empty.
>
> ### Key Points to Cover
>
> - Parquet: schema embedded in file footer; `mergeSchema` adds new columns safely
> - Safe Parquet changes: add column, widen type (INT → BIGINT); old files return null for new column
> - Breaking Parquet changes: rename column (no mapping between old and new name), narrow type
> - CSV: no schema metadata; column reordering is silent corruption with positional schemas
> - Auto Loader rescue mode: unexpected columns → `_rescued_data` JSON column
> - Monitor `_rescued_data` with an alert query to detect schema drift
> - Multiline CSV caveat: `multiLine=true` prevents file splitting, hurts parallelism
>
> ### Example Answer
>
> The two formats present fundamentally different schema change problems.
>
> **Parquet — structured and manageable:**
>
> Parquet embeds the full schema in each file footer. When a vendor adds two new columns, the new files have a different schema than the existing Delta table. Delta handles this with `mergeSchema`:
>
> ```python
> # Option 1: mergeSchema at write time
> (spark.read.format("parquet")
>     .load("s3://vendor/new-batch/")
>     .write
>     .format("delta")
>     .option("mergeSchema", "true")
>     .mode("append")
>     .saveAsTable("bronze.vendor_feed"))
>
> # Option 2: enable permanently at the table level
> spark.sql("""
>     ALTER TABLE bronze.vendor_feed
>     SET TBLPROPERTIES ('delta.schema.autoMerge.enabled' = 'true')
> """)
> ```
>
> Safe backward-compatible changes with `mergeSchema`:
>
> - **Adding a column**: new files have it, old files return `null` for it — safe
> - **Widening a type** (`INT` → `BIGINT`): safe
>
> Breaking changes that require Silver-level handling:
>
> - **Renaming a column**: old files have the old name, new files have the new name — no mapping exists; readers see both as separate nullable columns
> - **Narrowing a type** (`DOUBLE` → `INT`): precision loss; must cast explicitly
>
> For breaking changes, keep Bronze schema-agnostic (store raw bytes or use `_rescued_data`), and apply the rename/cast mapping explicitly in Silver:
>
> ```python
> silver_df = (spark.read.table("bronze.vendor_feed")
>     .select(
>         coalesce(col("new_column_name"), col("old_column_name")).alias("canonical_name"),
>         col("revenue").cast(DoubleType()),
>     ))
> ```
>
> **CSV — unstructured and silent:**
>
> CSV has no embedded schema. A reordered column in a CSV file, read with a positional schema, silently maps column 5 to column 6's data — no error, just wrong values. This is the most dangerous form of schema change.
>
> The defense is Auto Loader's rescue column:
>
> ```python
> (spark.readStream
>     .format("cloudFiles")
>     .option("cloudFiles.format", "csv")
>     .option("cloudFiles.schemaLocation", "/checkpoints/schema/erp")
>     .option("header", "true")
>     .option("cloudFiles.schemaEvolutionMode", "rescue")
>     .option("enforceSchema", "true")
>     .load("s3://erp/exports/")
>     .writeStream
>     .format("delta")
>     .option("checkpointLocation", "/checkpoints/erp")
>     .toTable("bronze.erp_export"))
> ```
>
> With `schemaEvolutionMode = "rescue"`, any column not in the expected schema is captured as JSON in a `_rescued_data` column — no data is silently lost. Monitor it with an alert query:
>
> ```sql
> -- Alert if schema drift detected (non-empty rescue column)
> SELECT COUNT(*) AS drifted_records,
>        collect_set(_rescued_data) AS sample_rescued
> FROM bronze.erp_export
> WHERE _rescued_data IS NOT NULL
>   AND _ingestion_date = current_date();
> ```
>
> For CSV with embedded newlines in field values, add `.option("multiLine", "true")` — but note this prevents Spark from splitting the file across tasks, reducing parallelism. Prefer vendor-negotiated quoting conventions over multiline when possible.
>
> ### Follow-up Questions
>
> - `mergeSchema` adds a new column to the Delta table schema. What do existing Parquet files in the table return for that column?
> - A vendor changes a column type from `STRING` to `DECIMAL(10,2)`. Is this a safe Parquet schema evolution with `mergeSchema`?
> - How does the `_rescued_data` column support regulatory audit requirements for CSV ingestion pipelines?

---

## Question 4: Wide vs Narrow Transformations and DAG Stage Boundaries

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
A junior engineer on your team wrote a PySpark job with 10 transformation steps and is confused: "I wrote 10 steps but the Spark UI shows only 3 stages. Why?" Explain what's happening.

> [!success]- Answer Framework
>
> **Short Answer**: Spark uses lazy evaluation to build a DAG of transformations, then groups consecutive narrow transformations (filter, select, withColumn — each output partition depends on one input partition) into a single stage; a new stage only starts at a wide transformation (groupBy, join, orderBy — output partitions depend on many input partitions) where a network shuffle is required, so 10 transformations with 2 shuffles produces 3 stages.
>
> ### Key Points to Cover
>
> - Lazy evaluation: transformations build a DAG, nothing executes until an action is called
> - Narrow transformation: one input partition → one output partition; no shuffle; pipelined into one stage
> - Wide transformation: many input partitions → one output partition; requires network shuffle; creates stage boundary
> - Within a stage, tasks process partitions end-to-end in memory without writing intermediate results
> - Shuffle: write shuffle data to local disk (shuffle write) + read from other executors (shuffle read) = expensive
> - Stage count = number of shuffles + 1
>
> ### Example Answer
>
> **Lazy evaluation**: Spark doesn't execute transformations when you call them. Instead, it builds a Directed Acyclic Graph (DAG) of operations. The DAG is only compiled into an execution plan when an action is called (`count`, `write`, `show`, etc.).
>
> When compiling the DAG, Spark groups consecutive **narrow transformations** into a single stage. A new stage begins only when a **wide transformation** requires a shuffle.
>
> **Narrow transformations** — each output partition depends on at most one input partition:
> `filter`, `select`, `withColumn`, `map`, `flatMap`, `union`, `coalesce` (when reducing)
>
> **Wide transformations** — output partitions depend on multiple input partitions (shuffle required):
> `groupBy`, `join` (sort-merge), `distinct`, `orderBy`, `repartition`
>
> With 10 transformations and 2 shuffles, you get exactly 3 stages:
>
> ```text
> 10 transformations → 3 stages:
>
> Stage 1: filter → select → withColumn → withColumn
>          (4 narrow transforms — pipelined, no shuffle)
>          ↓ shuffle (groupBy — wide transform)
> Stage 2: groupBy → agg → filter
>          (no shuffle within this stage)
>          ↓ shuffle (join with second DataFrame — wide transform)
> Stage 3: join → select → withColumn → write
>          (no shuffle after join — pipelined to sink)
>
> Total: 2 shuffles → 3 stages
> ```
>
> Within a stage, all tasks run the full chain of narrow transformations in memory — no intermediate results written to disk. This is highly efficient.
>
> Between stages, Spark must:
>
> 1. **Shuffle write**: each task writes its output records (sorted by target partition key) to local disk
> 2. **Shuffle read**: each downstream task reads its records from all upstream tasks' shuffle files over the network
>
> This network I/O is the most expensive part of Spark execution — minimizing unnecessary shuffles is the single highest-leverage performance optimization.
>
> ```python
> # Check how many shuffles your job has with EXPLAIN
> df.groupBy("customer_id").agg(sum("revenue")).explain(mode="formatted")
> # Look for "Exchange" nodes in the plan — each Exchange = a shuffle = a stage boundary
> ```
>
> ### Follow-up Questions
>
> - `coalesce` is often described as narrow, but `repartition` is wide. What structural difference makes `repartition` trigger a shuffle?
> - A job has 5 stages with 4 shuffle boundaries. Your manager asks you to reduce it to 3 stages. What's your approach?
> - Spark's Catalyst optimizer can reorder or collapse some transformations. Does this change the stage count from what you'd expect?

---

## Question 5: Shuffle Internals and repartition vs coalesce

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You have a 500GB DataFrame with only 20 partitions after reading a Delta table (each ~25GB). You need to write it to a new Delta table optimized for downstream processing. A colleague says "just use `coalesce(200)` to get more partitions." Another says "`repartition` and `coalesce` are the same thing." How do you respond?

> [!success]- Answer Framework
>
> **Short Answer**: `repartition(n)` always triggers a full network shuffle and can both increase and decrease partition count with even distribution; `coalesce(n)` merges partitions locally on each executor (no shuffle) but can ONLY decrease the partition count — calling `coalesce(200)` on a 20-partition DataFrame silently returns 20 partitions unchanged; to go from 20 to 200 partitions you must use `repartition(200)`.
>
> ### Key Points to Cover
>
> - Shuffle: writes data to local disk (shuffle write) then reads across the network (shuffle read)
> - `repartition(n)`: always shuffles; even distribution via hash or round-robin; can increase or decrease
> - `coalesce(n)`: no shuffle; merges adjacent partitions locally; can ONLY decrease; produces uneven sizes
> - Critical: `coalesce(200)` on 20 partitions returns 20 (silently ignores the larger target)
> - Optimal partition target: ~100–200MB per partition
> - `repartition(n, col("key"))`: hash-partitions by key; use before groupBy or join on that key
>
> ### Example Answer
>
> Both colleagues are wrong. `repartition` and `coalesce` are NOT the same, and `coalesce(200)` on a 20-partition DataFrame silently does nothing.
>
> **What a shuffle physically does:**
>
> When Spark shuffles, every task writes its output records (sorted by target partition key) to local disk — the **shuffle write**. Then each downstream task reads the records it owns from ALL upstream tasks over the network — the **shuffle read**. For a 500GB DataFrame, a shuffle reads and writes ~500GB over the network. This is expensive but necessary when you need to redistribute data.
>
> **`repartition(n)` — always triggers a full shuffle:**
>
> ```python
> # Always shuffles — even distribution, 200 partitions
> df.repartition(200).rdd.getNumPartitions()  # → 200 ✓
>
> # Can also partition by key (useful before joins/groupBy on that key)
> df.repartition(200, col("customer_id")).rdd.getNumPartitions()  # → 200 ✓
> ```
>
> After `repartition`, every partition is approximately equal in size. Use this when you need to **increase** partition count or need **even sizes** before a downstream operation.
>
> **`coalesce(n)` — avoids shuffle, but can only decrease:**
>
> ```python
> # Merges adjacent partitions locally — no shuffle, fast, but uneven sizes
> df.coalesce(5).rdd.getNumPartitions()    # → 5 ✓ (reduced from 20)
>
> # CRITICAL: coalesce CANNOT increase partition count
> df.coalesce(200).rdd.getNumPartitions()  # → 20 ✗ (silently unchanged!)
> ```
>
> `coalesce` combines partitions that already exist on the same executor — no data moves over the network. It's much cheaper than `repartition`, but the resulting partition sizes will be **uneven** (it merges, not redistributes).
>
> **For this scenario** (20 partitions → 200 partitions needed): you MUST use `repartition(200)`. `coalesce(200)` silently returns 20 partitions.
>
> **Decision guide:**
>
> | Situation | Use |
> | --------- | --- |
> | Increase partition count | `repartition(n)` |
> | Decrease partition count, even sizes | `repartition(n)` |
> | Decrease partition count, cheaply (uneven OK) | `coalesce(n)` |
> | Partition by key before join/groupBy | `repartition(n, col("key"))` |
> | Reduce output file count before write | `coalesce(n)` |
>
> **Optimal partition count formula:**
>
> ```python
> data_size_bytes = 500 * 1024 ** 3   # 500GB
> target_size = 128 * 1024 ** 2       # 128MB target per partition
> optimal = data_size_bytes // target_size  # ≈ 4000 partitions
>
> df.repartition(optimal).write.format("delta").saveAsTable("silver.large_table")
> ```
>
> ### Follow-up Questions
>
> - After a `groupBy().agg()`, Spark outputs `spark.sql.shuffle.partitions` partitions (default 200). For a 500GB input, is 200 too many or too few?
> - Your final write produces 10,000 small Delta files. You want fewer files without running `OPTIMIZE`. How do you use `coalesce` or `repartition` before the write?
> - `repartitionByRange` is a third option. When would you choose it over hash-based `repartition`?

---

## Question 6: Spark Memory Model — Execution, Storage, and Spill

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
A Spark job processing a 2TB DataFrame is running slowly. You open the Spark UI and see "Spill (Memory): 800GB, Spill (Disk): 800GB" on the shuffle stage. Your manager asks you to explain what's happening and how to fix it.

> [!success]- Answer Framework
>
> **Short Answer**: Spill occurs when execution memory (used for shuffle buffers, sort buffers, and aggregation state) is exhausted — Spark writes intermediate data to local disk (800GB shuffle write) then re-reads it (800GB read back), nearly doubling I/O; fix by increasing `spark.sql.shuffle.partitions` so each partition is smaller (fits in execution memory), or by increasing executor memory, or by unpersisting cached DataFrames that are crowding out execution memory.
>
> ### Key Points to Cover
>
> - Spark unified memory model: reserved → Spark unified (execution + storage) → user memory
> - Execution memory: shuffle buffers, sort buffers, aggregation state
> - Storage memory: cached DataFrames/RDDs (shared pool with execution)
> - Spill: execution memory exhausted → write to local disk, re-read = 2x I/O
> - Root causes: too few shuffle partitions (huge per-task data), cached data crowding execution, large aggregations
> - Fixes: increase shuffle partitions, increase executor memory, unpersist caches, tune memory fractions
> - Spill in Spark UI: "Spill (Memory)" = uncompressed in-memory size; "Spill (Disk)" = compressed on-disk size
>
> ### Example Answer
>
> The job is spilling — running out of execution memory and writing intermediate shuffle data to disk, then reading it back. 800GB of spill means the job performs nearly double the I/O it needs to, dramatically slowing execution.
>
> **Spark's unified memory model:**
>
> Each executor's JVM heap is divided into three regions:
>
> ```text
> Executor JVM Heap (e.g., 16GB)
> ├── Reserved Memory (300MB fixed) — Spark internal objects
> ├── Spark Unified Memory (60% of remaining heap, default)
> │   ├── Execution Memory — shuffle buffers, sort, aggregation state
> │   └── Storage Memory — df.cache(), df.persist()
> └── User Memory (40% of remaining heap) — UDFs, user data structures
> ```
>
> **Execution and storage share the same pool.** If you cache a large DataFrame, storage memory expands and execution memory shrinks. When execution needs more space for a shuffle, it evicts cached blocks — but if there's nothing to evict, it spills to disk.
>
> **Root cause analysis:**
>
> With 2TB of data and `spark.sql.shuffle.partitions = 200` (default), each shuffle partition is 2TB / 200 = **10GB**. An executor with 16GB heap has maybe 4–6GB of available execution memory. 10GB doesn't fit → spill.
>
> **Fix 1 — Increase shuffle partitions (most common fix):**
>
> ```python
> # Target ~200MB per partition: 2TB / 200MB ≈ 10,000 partitions
> spark.conf.set("spark.sql.shuffle.partitions", 10000)
> ```
>
> Smaller partitions fit in execution memory → no spill.
>
> **Fix 2 — Increase executor memory** (cluster config):
>
> Larger executors give more execution memory per task. Useful when you can't increase partition count further.
>
> **Fix 3 — Unpersist cached DataFrames before shuffle-heavy operations:**
>
> ```python
> # Free storage memory before the expensive shuffle
> df_cached.unpersist()
> result = run_heavy_shuffle(df)
> ```
>
> **Fix 4 — Tune memory fractions** (advanced):
>
> ```python
> # Give more of the heap to Spark (less to user memory)
> spark.conf.set("spark.memory.fraction", "0.8")        # default 0.6
> # Give more of Spark's pool to execution (less to storage)
> spark.conf.set("spark.memory.storageFraction", "0.2")  # default 0.5
> ```
>
> **Caution**: increasing `spark.memory.fraction` to 0.9 leaves only 10% for user memory — UDFs and user objects can cause OOM if they allocate more than that.
>
> **Reading the Spark UI:**
>
> In the Stages tab:
>
> - **Spill (Memory)**: the in-memory representation of spilled data (uncompressed) — this is the "true" size
> - **Spill (Disk)**: bytes actually written to disk (compressed) — typically smaller than memory spill
>
> A healthy production job should show 0 for both. Any non-zero spill warrants investigation.
>
> ### Follow-up Questions
>
> - `spark.memory.fraction` defaults to 0.6. You increase it to 0.9 to reduce spill. What is the risk?
> - A job runs without spill on a 100GB test dataset but spills heavily on 2TB in production. What configuration didn't scale?
> - How does Databricks' Photon engine interact with the JVM memory model — does it use the same execution memory pool?

---

## Question 7: Catalyst Optimizer & Query Planning

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
You run `EXPLAIN EXTENDED` on a slow query and see an unexpected physical plan. Walk me through how Spark's Catalyst optimizer works and how you would interpret the output to fix the query.

> [!success]- Answer Framework
>
> **Short Answer**: Catalyst converts SQL/DataFrame code through 4 phases — (1) Unresolved Logical Plan → (2) Analyzed Logical Plan (resolve column names, types) → (3) Optimized Logical Plan (apply rules: predicate pushdown, constant folding, column pruning, filter reordering) → (4) Physical Plan (choose join strategies, scan methods); reading `EXPLAIN` output, you look for `BroadcastHashJoin` vs `SortMergeJoin`, `Filter` position relative to `Scan`, and `Project` for column pruning — common pitfalls include stale statistics, UDFs blocking predicate pushdown, and implicit type casts preventing optimization.
>
> ### Key Points to Cover
>
> - Catalyst converts SQL/DataFrame code through 4 phases: Unresolved Logical Plan → Analyzed Logical Plan → Optimized Logical Plan → Physical Plan
> - Rule-based optimization: deterministic rewrites (push filters before joins, eliminate redundant projections, constant folding)
> - Cost-based optimization (CBO): uses table/column statistics (`ANALYZE TABLE ... COMPUTE STATISTICS`) to choose join order and strategy
> - Reading EXPLAIN output: look for `BroadcastHashJoin` vs `SortMergeJoin`, `Filter` position relative to `Scan`, `Project` for column pruning
> - Common pitfalls: stale statistics, UDFs blocking predicate pushdown, implicit type casts preventing optimization
>
> ### Example Answer
>
> Spark's Catalyst optimizer is the engine that transforms your SQL or DataFrame code into an efficient physical execution plan. It operates in four phases:
>
> **Phase 1 — Unresolved Logical Plan**: Parses SQL text or DataFrame operations into a tree of logical operators. Column names and types are NOT yet resolved — they're just strings.
>
> **Phase 2 — Analyzed Logical Plan**: Catalyst resolves column names against the catalog (Unity Catalog or Hive metastore), validates types, and confirms that all referenced tables and columns exist. A query referencing a non-existent column fails here.
>
> **Phase 3 — Optimized Logical Plan**: This is where the magic happens. Catalyst applies a set of **rule-based optimizations**:
>
> - **Predicate pushdown**: move `WHERE` filters as close to the data source as possible (before joins, into scan operators)
> - **Column pruning**: drop columns that are never used downstream — reduces I/O
> - **Constant folding**: evaluate `1 + 1` at compile time, not at runtime for every row
> - **Filter reordering**: apply the most selective filter first to reduce rows early
>
> If **Cost-Based Optimization (CBO)** is enabled and statistics are available, Catalyst also uses table/column statistics to choose optimal join order and join strategy:
>
> ```sql
> -- Collect statistics for CBO
> ANALYZE TABLE orders COMPUTE STATISTICS FOR ALL COLUMNS;
> ANALYZE TABLE customers COMPUTE STATISTICS FOR ALL COLUMNS;
> ```
>
> **Phase 4 — Physical Plan**: Catalyst generates one or more physical plans and selects the best one based on cost estimates. This is where it decides between `BroadcastHashJoin` and `SortMergeJoin`, chooses scan methods, and plans shuffle boundaries.
>
> **Reading EXPLAIN output:**
>
> ```python
> df.explain(mode="formatted")
> ```
>
> ```text
> == Physical Plan ==
> *(3) Project [customer_id, name, total_revenue]
> +- *(3) BroadcastHashJoin [customer_id], [customer_id], Inner
>    :- *(3) Filter (total_revenue > 1000)        ← Filter AFTER join = bad
>    :  +- *(3) HashAggregate(keys=[customer_id], functions=[sum(revenue)])
>    :     +- Exchange hashpartitioning(customer_id, 200)   ← Shuffle
>    :        +- *(1) Scan delta [customer_id, revenue]     ← Column pruning ✓
>    +- BroadcastExchange                          ← Small table broadcast ✓
>       +- *(2) Scan delta [customer_id, name]
> ```
>
> **What to look for:**
>
> | Pattern | Good Sign | Bad Sign |
> | ------- | --------- | -------- |
> | `Filter` position | Before `Join` or inside `Scan` | After `Join` (filter too late) |
> | Join type | `BroadcastHashJoin` for small dims | `SortMergeJoin` when one side is tiny |
> | `Project` | Only needed columns listed | All columns passed through |
> | `Exchange` | Minimal shuffles | Redundant shuffles |
>
> **Common pitfalls that block optimization:**
>
> - **Stale statistics**: CBO makes bad decisions (e.g., choosing sort-merge when broadcast is better) because row counts are outdated — re-run `ANALYZE TABLE`
> - **UDFs blocking predicate pushdown**: Catalyst cannot push a Python UDF into a scan operator because it can't reason about UDF semantics — rewrite as built-in SQL functions when possible
> - **Implicit type casts**: `WHERE string_col = 123` forces a cast on every row, preventing index/statistics use — always match types explicitly
>
> ### Follow-up Questions
>
> - How do stale statistics affect CBO decisions? What symptoms would you see?
> - Why do UDFs prevent predicate pushdown, and how would you rewrite a UDF to allow it?
> - How does AQE interact with Catalyst — does it replace Catalyst or complement it?

---

**[← Previous: Associate Fundamentals](./01-associate-fundamentals.md) | [↑ Back to Interview Prep](./README.md) | [Next: Delta Lake Internals →](./03-delta-lake-internals.md)**
