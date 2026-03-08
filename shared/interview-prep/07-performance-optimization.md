---
tags: [interview-prep, performance-optimization]
---

# Interview Questions — Performance Optimization

---

## Question 1: Systematic Query Troubleshooting

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
A business analyst reports that a query that used to run in 30 seconds now takes 20 minutes. It joins the `orders` Silver table (~2 billion rows) with the `customers` Silver table (~50 million rows). Walk me through your troubleshooting methodology.

> [!success]- Answer Framework
>
> **Short Answer**: Open the Spark UI and check for data skew (one task 10x slower than others), verify the join strategy with `EXPLAIN` (sort-merge on 2B rows needs more than the default 200 shuffle partitions), inspect Delta file health with `DESCRIBE DETAIL` and run `OPTIMIZE` if average file size is tiny, then increase `spark.sql.shuffle.partitions` to size partitions around 100–200MB each.
>
> ### Key Points to Cover
>
> - Start with Spark UI: check stages, tasks, time distribution
> - Look for data skew: one task taking 10x longer than others
> - Check small files: too many tasks from too many tiny files
> - Check join strategy: is it doing a broadcast join or sort-merge join?
> - Check partition count: `spark.sql.shuffle.partitions` default 200
> - Check if OPTIMIZE was run recently on the Delta tables
> - Check if statistics are up to date for AQE
>
> ### Example Answer
>
> I follow a structured diagnostic process — instrument first, then fix.
>
> **Step 1 — Spark UI**: Open the Spark UI for the failing job. Look at the Stage timeline: which stage takes the most time? Is it a shuffle (join) stage or a scan stage?
>
> **Step 2 — Check for data skew**: In the slow stage, look at the task duration distribution. If one task takes 15 minutes while all others finish in 30 seconds, you have data skew. Check `customer_id` distribution — a few customers with millions of orders will cause this.
>
> **Step 3 — Check join strategy**: Run `EXPLAIN` to see the query plan:
>
> ```sql
> EXPLAIN SELECT * FROM orders o JOIN customers c ON o.customer_id = c.customer_id;
> ```
>
> Is `customers` (50M rows) being broadcast? At 50M rows it's too large for the default 10MB broadcast threshold. Is it doing a sort-merge join with too many shuffle partitions (200 is too few for 2B rows)?
>
> **Step 4 — Check file health on Delta tables**:
>
> ```sql
> DESCRIBE DETAIL orders;
> DESCRIBE DETAIL customers;
> ```
>
> Look at `numFiles` and `sizeInBytes / numFiles`. If average file size is < 1MB, you have a small files problem causing excessive task overhead. Run `OPTIMIZE`:
>
> ```sql
> OPTIMIZE orders;
> OPTIMIZE customers ZORDER BY (customer_id);
> ```
>
> **Step 5 — Tune shuffle partitions**: For 2 billion rows, 200 partitions means 10M rows per partition — likely too large, causing spill to disk. Increase:
>
> ```python
> spark.conf.set("spark.sql.shuffle.partitions", 2000)
> ```
>
> **Step 6 — Check AQE**: Verify `spark.sql.adaptive.enabled` is `true` (it should be). AQE auto-adjusts shuffle partitions and can coalesce small partitions. If it's off, enable it.
>
> **Step 7 — Fix skew specifically**: If skew is confirmed, use AQE's skew join optimization or add a salt column to distribute skewed keys.
>
> ### Follow-up Questions
>
> - The query was fast last week and slow now — what changed, and how do you find out?
> - How does Adaptive Query Execution (AQE) help with shuffle partition sizing?
> - The `orders` table has 500,000 small Parquet files. What caused this and how do you prevent it?

---

## Question 2: Adaptive Query Execution Deep Dive

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Explain what Adaptive Query Execution (AQE) is, what specific problems it solves, and what its limitations are. When would you still need to manually tune?

> [!success]- Answer Framework
>
> **Short Answer**: AQE re-plans query stages at runtime using actual shuffle statistics rather than compile-time estimates; its three optimizations are dynamic partition coalescing (merges tiny post-shuffle partitions), skew join optimization (splits partitions 5x above median), and dynamic broadcast conversion (converts sort-merge to broadcast if one side is small after filtering) — but it cannot optimize scan-heavy queries or fix fundamental data skew.
>
> ### Key Points to Cover
>
> - AQE re-plans the query at runtime using actual shuffle data statistics
> - Three main optimizations: dynamic partition coalescing, skew join optimization, dynamic join conversion
> - Default enabled in Databricks since Spark 3.0
> - Limitations: only kicks in after shuffle boundary; doesn't help with scan-heavy queries; can't fix fundamentally skewed data
> - Manual tuning still needed for: broadcast threshold, scan optimization (Z-ORDER), cluster sizing
>
> ### Example Answer
>
> **What AQE is**: AQE is a runtime optimization framework in Spark that re-plans query stages after each shuffle, using actual data statistics rather than estimates. Before AQE, Spark's query planner had to guess statistics at compile time — often wrong for skewed or non-uniform data.
>
> **Three core optimizations:**
>
> 1. **Dynamic partition coalescing**: After a shuffle, if many output partitions are tiny (e.g., 200 partitions, 150 are empty), AQE coalesces them into fewer, larger partitions. This eliminates the overhead of scheduling thousands of tiny tasks.
>
> 2. **Skew join optimization**: AQE detects skewed partitions (one partition 5x larger than median) and automatically splits them, processing each split in parallel. This can turn a 20-minute skewed join into a 2-minute balanced join with zero code changes.
>
> 3. **Dynamic join strategy conversion**: AQE can convert a sort-merge join to a broadcast join at runtime if one side turns out to be small after filtering. This is especially useful when the planner underestimated filter selectivity.
>
> ```python
> # AQE configurations (defaults in Databricks)
> spark.conf.set("spark.sql.adaptive.enabled", "true")
> spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
> spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
> ```
>
> **Limitations — when you still need manual tuning:**
>
> - **Scan-level optimization**: AQE only optimizes *after* shuffles. It can't make a full table scan faster — that requires Z-ORDER, Liquid Clustering, or partitioning.
> - **Extremely severe skew**: If one key represents 90% of data, AQE's skew handling still can't fix fundamentally bad data distribution. You need to salt/explode the key or pre-aggregate.
> - **Broadcast threshold**: AQE converts to broadcast only up to the `autoBroadcastJoinThreshold` limit (default 10MB). Large dimension tables still need explicit `broadcast()` hints.
> - **Cluster sizing**: AQE can't add more executors. Under-provisioned clusters still need manual resizing.
>
> ### Follow-up Questions
>
> - How do you verify that AQE's skew join optimization actually triggered for a specific query?
> - AQE adds plan re-optimization overhead. For what type of queries is this overhead NOT worth it?
> - A query has no shuffles (pure scan + filter). Does AQE help? What do you use instead?

---

## Question 3: Data Skew — Diagnosis and Fixes

**Level**: Professional
**Type**: Scenario

**Scenario / Question**:
A Spark join between two tables takes 2 hours. When you look at the Spark UI, 999 tasks finish in 30 seconds each, but one task is still running after 2 hours. What is happening, and what are your options to fix it?

> [!success]- Answer Framework
>
> **Short Answer**: Data skew — one join key value (e.g., "guest" customer ID) has millions of rows, landing all on one executor while the other 999 sit idle; fix it by first enabling AQE's skew join optimization (automatic if the partition is 5x above median), or by salting the hot key with a random prefix to distribute it across N partitions, or by handling the outlier key separately and unioning the results.
>
> ### Key Points to Cover
>
> - Classic data skew: one join key value represents a disproportionate fraction of data
> - One executor processes the "hot key" partition alone while others are idle
> - Fix 1: AQE skew join (automatic if enabled and threshold met)
> - Fix 2: Salting the skewed key (add random prefix to both sides)
> - Fix 3: Broadcast the small side if possible
> - Fix 4: Pre-aggregate or pre-filter to reduce skew before the join
>
> ### Example Answer
>
> This is textbook **data skew**. One value of the join key (say, `customer_id = 0` representing "guest checkout") represents millions of rows, and all of them land in a single partition on one executor. That executor processes millions of rows while the other 999 executors are idle, waiting.
>
> **Diagnosis**:
>
> ```python
> # Check key distribution
> df.groupBy("customer_id").count().orderBy(col("count").desc()).show(10)
> ```
>
> If the top key has 100M rows while the average is 100 rows, you have severe skew.
>
> **Fix 1 — Let AQE handle it** (easiest): If AQE's skew join optimization is enabled and the skew ratio exceeds the threshold (default: partition 5x larger than median AND > 256MB), AQE splits the skewed partition automatically. Check if it triggered in the query plan.
>
> **Fix 2 — Salting** (most robust): Add a random prefix (0–N) to the skewed key on both sides of the join, then join on the salted key. This distributes one "hot" partition into N equal partitions:
>
> ```python
> from pyspark.sql.functions import concat, lit, floor, rand
>
> N = 20  # Salt factor
>
> # Salt the large side (all rows get a random salt)
> large_df_salted = large_df.withColumn(
>     "salted_key",
>     concat(col("customer_id").cast("string"), lit("_"), (rand() * N).cast("int"))
> )
>
> # Explode the small side (replicate rows for each salt value)
> small_df_salted = small_df.crossJoin(
>     spark.range(N).withColumnRenamed("id", "salt")
> ).withColumn(
>     "salted_key",
>     concat(col("customer_id").cast("string"), lit("_"), col("salt"))
> )
>
> result = large_df_salted.join(small_df_salted, "salted_key")
> ```
>
> **Fix 3 — Filter or pre-aggregate**: If the skewed key is a known outlier (e.g., guest checkouts), handle it separately with a special case and union the results.
>
> ### Follow-up Questions
>
> - How do you choose the salt factor N in salting? What's the downside of making N too large?
> - AQE skew join is enabled. How do you tell if it fired for a specific query vs. if skew was below the threshold?
> - Salting adds complexity. Is there a simpler fix that works for most skew cases?

---

## Question 4: Broadcast vs Sort-Merge Joins

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You're joining a 500GB fact table with a 100MB dimension table. Explain the difference between a broadcast hash join and a sort-merge join, which one Spark will choose here, and how you'd force the right choice.

> [!success]- Answer Framework
>
> **Short Answer**: A broadcast hash join sends the small table to every executor (no shuffle of the large side) while a sort-merge join shuffles both sides — the 100MB dimension exceeds Spark's default 10MB broadcast threshold, so Spark will choose sort-merge by default; force broadcast with `broadcast(dimension_df)` hint if the dimension fits comfortably in executor memory.
>
> ### Key Points to Cover
>
> - Broadcast hash join: small table sent to all executors, no shuffle; O(1) network for small table
> - Sort-merge join: both sides sorted and merged; requires shuffle of both sides
> - Default broadcast threshold: 10MB (`autoBroadcastJoinThreshold`)
> - 100MB > 10MB → Spark will choose sort-merge by default
> - Force broadcast with hint or increase threshold
> - Broadcast is faster but uses executor memory; large broadcasts can OOM
>
> ### Example Answer
>
> **Broadcast hash join**: The small table is serialized and sent ("broadcast") to every executor. Each executor builds a local hash table in memory, then joins against its partition of the large table without any shuffle. This is ideal when one side is small enough to fit in executor memory.
>
> **Sort-merge join**: Both sides are shuffled so matching keys end up on the same partition, then sorted within each partition and merged. Requires network shuffle of both large and small sides — much more expensive for large tables.
>
> In this scenario: fact table = 500GB, dimension = 100MB. The default `autoBroadcastJoinThreshold` is 10MB. Spark will NOT auto-broadcast the 100MB dimension because it exceeds the threshold. You'll get an expensive sort-merge join with 500GB shuffled.
>
> **Force a broadcast join** with a hint:
>
> ```python
> from pyspark.sql.functions import broadcast
>
> result = fact_df.join(broadcast(dimension_df), "key")
> ```
>
> Or increase the threshold (if you have sufficient executor memory):
>
> ```python
> spark.conf.set("spark.sql.autoBroadcastJoinThreshold", str(200 * 1024 * 1024))  # 200MB
> ```
>
> **Risk**: Broadcasting a 100MB table to each executor increases memory pressure. If executors have 8GB of RAM and you're broadcasting 100MB × multiple concurrent queries, you may run out of memory. Check executor memory before increasing the threshold.
>
> **Quick reference:**
>
> | Join Type | When to Use | Shuffle Cost |
> | --------- | ----------- | ------------ |
> | Broadcast Hash | Small side < executor memory | None (small side only) |
> | Sort-Merge | Both sides large | Both sides shuffled |
> | Shuffle Hash | Medium-small side, low memory | One side shuffled |
>
> ### Follow-up Questions
>
> - The dimension table grows from 100MB to 5GB over time. What happens to your broadcast join?
> - How does AQE help with the case where the dimension table is filtered down to 5MB at runtime?
> - What happens if you broadcast a 10GB table and your executors have 4GB of RAM?

---

## Question 5: Z-Ordering vs Liquid Clustering — Decision Framework

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You have an existing production Delta table with 5TB of data, partitioned by `event_year`/`event_month`. Users query by `user_id`, `product_category`, and `event_date`. Response times are 3–5 minutes. How do you decide between Z-ORDER and Liquid Clustering to improve this?

> [!success]- Answer Framework
>
> **Short Answer**: For this existing partitioned table, run `OPTIMIZE ZORDER BY (user_id, product_category)` within each partition now — it's safe and immediately improves data skipping; if you're on DBR 13.3+, also apply `ALTER TABLE ... CLUSTER BY (user_id, product_category)` to migrate to Liquid Clustering, which auto-maintains going forward and eliminates the need for a manual `OPTIMIZE ZORDER` schedule.
>
> ### Key Points to Cover
>
> - Existing table + existing partition scheme → Z-ORDER within partitions
> - Liquid Clustering can be added to existing tables without rewriting data immediately
> - Z-ORDER requires manual OPTIMIZE schedule; Liquid Clustering is automatic
> - `event_date` overlaps with existing partition — don't double-cluster
> - Check Databricks runtime version: Liquid Clustering requires 13.3+
> - Migration path: test both, measure with `EXPLAIN` and query timing
>
> ### Example Answer
>
> For an existing partitioned production table, here's my decision process:
>
> **Step 1 — Diagnose what's slow**: Run `EXPLAIN` on a typical user query. Is the problem too many partitions being scanned, or too many files within a partition? If partition pruning is working but each partition has 10,000 tiny files, Z-ORDER on `user_id` within the partition is the right fix.
>
> **Step 2 — Check Databricks runtime version**: Liquid Clustering requires DBR 13.3+. If you're on an older runtime, Z-ORDER is your only option.
>
> **Step 3 — For Z-ORDER (safe for existing tables)**:
>
> ```sql
> -- Run within a partition to keep the job scoped
> OPTIMIZE events
> WHERE event_year = 2025 AND event_month = 12
> ZORDER BY (user_id, product_category);
> ```
>
> Schedule this nightly or after major batch loads. The downside: you must remember to run it and it rewrites all files in the partition.
>
> **Step 4 — For Liquid Clustering (future-proof)**:
>
> ```sql
> -- Add liquid clustering to existing table
> ALTER TABLE events CLUSTER BY (user_id, product_category);
>
> -- Trigger initial clustering (rewrites unclustered files incrementally)
> OPTIMIZE events;
> ```
>
> Liquid Clustering auto-maintains after this initial OPTIMIZE. You can also remove the partition scheme over time as Liquid Clustering handles data layout.
>
> **My recommendation for this case**: If DBR 13.3+ is available, migrate to Liquid Clustering — it eliminates the maintenance burden and adapts if query patterns change. Start by adding `CLUSTER BY (user_id, product_category)` and running one full `OPTIMIZE` during a maintenance window.
>
> Don't cluster `event_date` if you're already partitioning by year/month — partition pruning already handles date filtering.
>
> ### Follow-up Questions
>
> - How do you measure whether Z-ORDER actually improved query performance? What metrics do you check?
> - If you change the Liquid Clustering columns with `ALTER TABLE`, what happens to already-clustered data?
> - Your table has 50 distinct product categories. Is that high or low cardinality for Z-ORDER purposes?

---

## Question 6: Small File Problem & Solutions

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Your Delta table has millions of small files (10-100KB each) and query performance has degraded significantly. Explain the problem and the solutions available.

> [!success]- Answer Framework
>
> **Short Answer**: Small files hurt performance because each file requires a separate cloud storage request (high overhead), the Spark driver must track metadata for millions of files (memory pressure), task scheduling overhead is high (one task per file), and compression ratios are poor; fix with `OPTIMIZE` to compact files to ~1GB, enable auto-compaction (`delta.autoOptimize.autoCompact`) for automatic post-write compaction, and enable optimized writes (`delta.autoOptimize.optimizeWrite`) to produce fewer, larger files during writes.
>
> ### Key Points to Cover
>
> - Why small files hurt: (1) high cloud storage request overhead, (2) driver metadata memory pressure, (3) task scheduling overhead, (4) poor compression ratios
> - `OPTIMIZE`: manually merges small files into ~1GB files, does NOT rewrite data — just compacts
> - Auto-compaction: `delta.autoOptimize.autoCompact = true` — runs mini-OPTIMIZE after writes
> - Optimized writes: `delta.autoOptimize.optimizeWrite = true` — shuffles data during writes to produce fewer, larger files
> - Target file size: configurable via `delta.targetFileSize`, default ~1GB
> - Common causes: frequent small-batch appends, streaming with very short trigger intervals, partitioning on high-cardinality columns
>
> ### Example Answer
>
> The small file problem is one of the most common Delta Lake performance issues. Here's why it happens and how to fix it.
>
> **Why small files hurt performance:**
>
> 1. **Cloud storage request overhead**: Each file requires a separate API call (S3 GET, ADLS read). Reading 1 million small files means 1 million API calls — each with ~5-50ms latency. Reading 1,000 optimally-sized files is 1,000x fewer API calls.
>
> 2. **Driver metadata pressure**: The Spark driver must track partition metadata for every file. Millions of files can cause driver OOM or extreme planning time before any task runs.
>
> 3. **Task scheduling overhead**: Spark creates one task per file (or file split). Scheduling 1 million tasks has significant overhead even if each task is tiny.
>
> 4. **Poor compression**: Small files can't leverage dictionary encoding or run-length encoding effectively because each file has too few values for the compressor to find patterns.
>
> **Common causes:**
>
> - Frequent small-batch appends (e.g., writing every 30 seconds from a streaming job)
> - Streaming with very short trigger intervals (`trigger(processingTime="10 seconds")`)
> - Partitioning on high-cardinality columns (e.g., `user_id` with millions of values)
> - Many concurrent writers each producing small files
>
> **Solution 1 — OPTIMIZE (manual compaction):**
>
> ```sql
> -- Compact small files into ~1GB files
> OPTIMIZE schema.table_name;
>
> -- Compact and Z-ORDER for better data skipping
> OPTIMIZE schema.table_name ZORDER BY (customer_id);
>
> -- Compact only a specific partition
> OPTIMIZE schema.table_name
> WHERE event_date = '2026-03-01';
> ```
>
> `OPTIMIZE` reads small files and rewrites them into larger files (~1GB target). It's a metadata-only change in the transaction log — old files are marked as removed, new compacted files are added.
>
> **Solution 2 — Auto-compaction (automatic):**
>
> ```sql
> -- Enable auto-compaction at the table level
> ALTER TABLE schema.table_name
> SET TBLPROPERTIES (
>     'delta.autoOptimize.autoCompact' = 'true'
> );
> ```
>
> Auto-compaction runs a mini-OPTIMIZE after each write operation. It targets files smaller than 128MB and compacts them. This is less aggressive than a full OPTIMIZE but keeps the table healthy automatically.
>
> **Solution 3 — Optimized writes (prevention):**
>
> ```sql
> -- Enable optimized writes at the table level
> ALTER TABLE schema.table_name
> SET TBLPROPERTIES (
>     'delta.autoOptimize.optimizeWrite' = 'true'
> );
> ```
>
> Optimized writes intelligently shuffle data during the write operation to produce fewer, larger output files. This adds some write latency (due to the shuffle) but prevents small files from being created in the first place.
>
> **Tuning target file size:**
>
> ```sql
> -- Adjust target file size (default ~1GB)
> ALTER TABLE schema.table_name
> SET TBLPROPERTIES ('delta.targetFileSize' = '128mb');
> ```
>
> Smaller target sizes are useful for tables with frequent point lookups; larger sizes are better for scan-heavy analytics.
>
> ### Follow-up Questions
>
> - What's the difference between OPTIMIZE and auto-compaction? When would you use both?
> - How do you prevent small files from being created in the first place with streaming workloads?
> - What's the impact of optimized writes on write latency, and when would you disable it?

---

## Question 7: Dynamic File Pruning vs Data Skipping

**Level**: Both
**Type**: Comparison

**Scenario / Question**:
Explain the difference between data skipping and dynamic file pruning in Delta Lake. When does each technique apply?

> [!success]- Answer Framework
>
> **Short Answer**: Data skipping uses min/max statistics stored per file (first 32 columns) to skip files that can't contain matching rows based on WHERE clause filters; dynamic file pruning (DFP) applies during JOINs — when a small dimension table is filtered, DFP uses the filter results to prune files from the large fact table at runtime, even without a direct WHERE clause on the fact table; Z-ordering enhances both by colocating related values in fewer files so min/max ranges are tighter.
>
> ### Key Points to Cover
>
> - Data skipping: Delta stores min/max statistics for first 32 columns in each Parquet file
> - When a query has a WHERE clause, Spark checks file-level stats and skips files that can't contain matching rows
> - Dynamic File Pruning (DFP): applies during JOINS — filter results from a small dimension table prune files from the large fact table at runtime
> - Data skipping works with: equality filters, range filters, IN clauses on columns with good stats
> - DFP works with: star-schema joins where dimension is filtered and fact table is large
> - Z-ordering enhances both: colocates related values → tighter min/max ranges → more files skipped
> - Limitations: data skipping doesn't help with high-cardinality columns without Z-ordering; DFP requires broadcast-eligible dimension tables
>
> ### Example Answer
>
> Both data skipping and dynamic file pruning (DFP) reduce the amount of data Spark reads from Delta tables, but they work at different stages of query execution.
>
> **Data skipping — WHERE clause optimization:**
>
> Delta stores min/max statistics for the first 32 columns of each Parquet data file in the transaction log. When a query has a WHERE clause, Spark checks these file-level statistics before opening any files:
>
> ```sql
> SELECT * FROM orders WHERE order_date = '2026-03-01';
> ```
>
> For each data file, Delta checks: "Is `2026-03-01` between this file's min(`order_date`) and max(`order_date`)?" If not, the entire file is skipped without reading a single row. On a well-organized table, this can eliminate 90%+ of files.
>
> Data skipping works with:
>
> - Equality filters: `WHERE region = 'West'`
> - Range filters: `WHERE amount > 1000`
> - IN clauses: `WHERE status IN ('active', 'pending')`
>
> **Dynamic File Pruning (DFP) — JOIN optimization:**
>
> DFP extends data skipping to JOIN operations. Consider a star-schema query:
>
> ```sql
> SELECT o.order_id, p.product_name, o.amount
> FROM orders o
> JOIN products p ON o.product_id = p.product_id
> WHERE p.category = 'Electronics';
> ```
>
> Without DFP, Spark would scan ALL files in `orders` even though only a subset of `product_id` values are "Electronics". With DFP:
>
> 1. Spark first filters `products` to get the set of `product_id` values in "Electronics"
> 2. It uses those values as a runtime filter to prune files from `orders` — only files whose min/max `product_id` range includes an Electronics product are read
>
> You can see DFP in action in the EXPLAIN plan:
>
> ```sql
> EXPLAIN SELECT o.order_id, p.product_name, o.amount
> FROM orders o
> JOIN products p ON o.product_id = p.product_id
> WHERE p.category = 'Electronics';
> -- Look for "DynamicPruningExpression" in the physical plan
> ```
>
> **Z-ordering enhances both techniques:**
>
> Without Z-ordering, a column's values are randomly distributed across files — many files have overlapping min/max ranges, so few files can be skipped. Z-ordering co-locates similar values in the same files, making min/max ranges much tighter:
>
> ```text
> Without Z-ORDER on product_id:
>   File 1: min=1, max=99999     ← overlaps with almost everything
>   File 2: min=5, max=98000     ← overlaps with almost everything
>   → Almost no files can be skipped
>
> With Z-ORDER on product_id:
>   File 1: min=1, max=500       ← tight range
>   File 2: min=501, max=1000    ← tight range
>   → Most files skipped for any specific product_id filter
> ```
>
> **When each technique does NOT help:**
>
> | Technique | Limitation |
> | --------- | ---------- |
> | Data skipping | High-cardinality columns without Z-ordering (wide min/max ranges) |
> | Data skipping | Columns beyond the first 32 (no stats collected by default) |
> | DFP | Dimension table too large to broadcast |
> | DFP | No filter on the dimension side of the join |
>
> ### Follow-up Questions
>
> - How does Z-ordering make data skipping more effective? What happens to min/max ranges?
> - What column statistics does Delta maintain, and can you configure which columns get stats?
> - When would DFP not be applied even with a filtered dimension table?

---

## Question 8: Caching Strategies

**Level**: Both
**Type**: Comparison

**Scenario / Question**:
A colleague cached a 500GB DataFrame and the cluster ran out of memory. Explain caching strategies and when to use each.

> [!success]- Answer Framework
>
> **Short Answer**: `df.cache()` stores in memory and spills to disk (`MEMORY_AND_DISK`); `MEMORY_ONLY` is faster but recomputes if evicted; `DISK_ONLY` is for very large DataFrames reused often; only cache DataFrames used in multiple actions, always `unpersist()` when done; Databricks Delta cache is separate — it automatically caches frequently accessed Delta data on local SSDs, persists across queries, and requires no code changes.
>
> ### Key Points to Cover
>
> - `df.cache()` = `df.persist(StorageLevel.MEMORY_AND_DISK)` — memory, spills to disk
> - `MEMORY_ONLY` — faster but recomputes if evicted
> - `DISK_ONLY` — for very large DataFrames reused often
> - When to cache: same DataFrame used in multiple actions, iterative algorithms, lookup tables
> - When NOT to cache: single-use DataFrames, very large data exceeding cluster memory, streaming
> - Always `unpersist()` when done to free resources
> - Delta cache (Databricks-specific): automatic SSD caching, persists across queries, no code changes
>
> ### Example Answer
>
> Your colleague's mistake was caching a DataFrame larger than the cluster's available memory without considering the consequences. Here's a systematic guide to caching.
>
> **Spark cache storage levels:**
>
> ```python
> from pyspark import StorageLevel
>
> # Default: memory first, spill to disk if needed
> df.cache()  # equivalent to:
> df.persist(StorageLevel.MEMORY_AND_DISK)
>
> # Memory only — recomputes partitions if evicted (no disk spill)
> df.persist(StorageLevel.MEMORY_ONLY)
>
> # Disk only — for very large DataFrames you reuse multiple times
> df.persist(StorageLevel.DISK_ONLY)
>
> # Serialized — reduces memory footprint at cost of CPU for ser/deser
> df.persist(StorageLevel.MEMORY_AND_DISK_SER)
> ```
>
> **When to cache:**
>
> - The **same DataFrame is used in multiple actions** (e.g., a `count()` followed by a `join` followed by a `write`) — without caching, Spark recomputes from scratch for each action
> - **Iterative algorithms** (e.g., ML training loops that reuse the same feature DataFrame)
> - **Lookup tables** reused across multiple transformations
>
> **When NOT to cache:**
>
> - **Single-use DataFrames**: if a DataFrame is only used once, caching adds overhead with no benefit
> - **Very large DataFrames**: caching 500GB on a cluster with 200GB of memory forces massive disk spill — defeating the purpose
> - **Streaming DataFrames**: structured streaming manages its own state; caching is not supported
> - **Before a single action**: `df.cache().write(...)` caches AND writes — the cache is useless if there's no subsequent read
>
> **Always unpersist when done:**
>
> ```python
> # Cache for multiple actions
> df.cache()
> row_count = df.count()
> df.join(other_df, "key").write.format("delta").saveAsTable("output")
>
> # Free resources immediately after last use
> df.unpersist()
> ```
>
> **Delta cache vs Spark cache:**
>
> Databricks has a separate **Delta cache** that works differently from Spark's application-level cache:
>
> | Feature | Spark Cache | Delta Cache |
> | ------- | ----------- | ----------- |
> | Storage | Executor JVM memory / local disk | Local SSDs on worker nodes |
> | Scope | Per-application (lost when app ends) | Persists across queries and notebooks |
> | Management | Manual (`cache()` / `unpersist()`) | Automatic (transparent) |
> | Eviction | LRU within application | LRU across workloads |
> | Data format | Deserialized JVM objects or serialized bytes | Compressed columnar on SSD |
> | Best for | Reused DataFrames within one job | Frequently queried Delta tables |
>
> Delta cache is enabled by default on Databricks clusters with local SSDs. It automatically caches the most frequently accessed Delta data files — no code changes needed. It's particularly effective for interactive SQL workloads where the same tables are queried repeatedly.
>
> **For the 500GB problem**: Instead of `df.cache()`, the colleague should either (1) not cache at all if the DataFrame is only used once, (2) use `DISK_ONLY` if it must be reused, or (3) increase the cluster size to accommodate the cached data in memory.
>
> ### Follow-up Questions
>
> - What's the difference between Delta cache and Spark cache? Can they interfere with each other?
> - How do you monitor cache utilization in the Spark UI?
> - When would `DISK_ONLY` be appropriate over `MEMORY_AND_DISK`?

---

## Question 9: Photon Engine & Vectorized Execution

**Level**: Both
**Type**: Conceptual

**Scenario / Question**:
Your manager asks whether upgrading to Photon-enabled clusters is worth the higher DBU cost. How do you evaluate this?

> [!success]- Answer Framework
>
> **Short Answer**: Photon is a native C++ execution engine that replaces the JVM-based Spark engine for supported operations, using vectorized columnar batch processing (CPU SIMD instructions) for 2-8x faster execution on SQL-heavy workloads; the higher DBU cost (~2x) is offset if queries run 3-4x faster (lower net cost AND faster results) — evaluate by running the same workload on standard vs Photon clusters and comparing wall-clock time multiplied by the DBU rate.
>
> ### Key Points to Cover
>
> - Photon: native C++ execution engine developed by Databricks, replaces JVM-based Spark for supported operations
> - Vectorized execution: processes data in columnar batches using CPU SIMD instructions instead of row-by-row
> - Best for: SQL-heavy workloads, scan-intensive queries, joins, aggregations, filters on large tables
> - Limited benefit for: Python UDFs (still run in Python process), ML training, very small datasets
> - Cost analysis: Photon DBUs cost ~2x standard, but faster execution can mean lower net cost
> - No code changes needed — Photon is transparent, falls back to Spark for unsupported operations
> - Requires Databricks Runtime with Photon (DBR 9.1+)
>
> ### Example Answer
>
> **What Photon is:**
>
> Photon is a native C++ execution engine developed by Databricks that replaces the standard JVM-based Spark SQL engine for supported operations. Instead of processing data row-by-row in the JVM, Photon processes data in **columnar batches** using CPU SIMD (Single Instruction, Multiple Data) instructions — the same technique used by modern columnar databases like DuckDB and ClickHouse.
>
> **Why vectorized execution is faster:**
>
> ```text
> Traditional Spark (row-at-a-time in JVM):
>   Row 1 → evaluate filter → output
>   Row 2 → evaluate filter → output
>   Row 3 → evaluate filter → output
>   ... (millions of function calls, JVM overhead per row)
>
> Photon (columnar batch with SIMD):
>   Batch of 4096 values → single SIMD instruction filters all at once
>   → 10-100x fewer function calls, CPU cache-friendly
> ```
>
> **Where Photon excels (2-8x faster):**
>
> - SQL-heavy analytical workloads (aggregations, joins, filters)
> - Scan-intensive queries on large Delta tables
> - ETL pipelines with heavy transformations
> - Dashboards and BI queries on Gold tables
>
> **Where Photon has limited benefit:**
>
> - **Python UDFs**: UDFs still execute in the Python process, not in Photon's C++ engine
> - **ML training**: Custom ML frameworks (scikit-learn, TensorFlow) run outside Spark's execution engine
> - **Very small datasets**: The overhead of Photon initialization isn't amortized on tiny queries
> - **Unsupported operations**: Photon doesn't accelerate all operations — it falls back to standard Spark transparently
>
> **Cost-benefit evaluation framework:**
>
> | Metric | Standard Cluster | Photon Cluster |
> | ------ | ---------------- | -------------- |
> | DBU rate | 1x | ~2x |
> | Query runtime | 60 minutes | 15-20 minutes |
> | Total DBU cost | 60 DBUs | 30-40 DBUs |
> | Net result | Baseline | **Lower cost AND faster** |
>
> The key insight: if Photon makes your queries 3-4x faster, you pay for 3-4x fewer minutes of compute at 2x the per-minute rate — the net cost is lower, AND your results arrive sooner.
>
> **How to evaluate for your workload:**
>
> 1. Run the same representative workload on a standard cluster and a Photon cluster of the same size
> 2. Compare wall-clock time for each query or pipeline
> 3. Calculate: `total_cost = runtime_hours × DBU_rate × cluster_size`
> 4. If Photon total cost < standard total cost, the upgrade pays for itself
>
> **Important details:**
>
> - **No code changes needed** — Photon is a drop-in replacement; your SQL and DataFrame code runs as-is
> - **Transparent fallback** — operations not supported by Photon automatically fall back to the standard Spark engine
> - **Supported runtimes** — requires Databricks Runtime with Photon (DBR 9.1+); not available on community edition
>
> ### Follow-up Questions
>
> - How do you identify which queries benefit most from Photon? What metrics would you compare?
> - What operations are NOT accelerated by Photon, and how do you check if Photon was used for a specific query?
> - How does Photon interact with AQE — do they complement each other or conflict?

---

## Question 10: Predictive Optimization — Automatic Table Maintenance

**Level**: Both
**Type**: Conceptual

**Scenario / Question**:
You manage hundreds of Delta tables with different usage patterns. Manually scheduling OPTIMIZE and VACUUM for each is becoming unmanageable. What's the modern approach?

> [!success]- Answer Framework
>
> **Short Answer**: Predictive Optimization is a Unity Catalog feature that automatically runs OPTIMIZE, VACUUM, and ANALYZE TABLE on managed tables using ML-based scheduling — eliminating the need for manual maintenance jobs.
>
> ### Key Points to Cover
>
> - Automatically runs OPTIMIZE (compaction + Z-ordering), VACUUM, and ANALYZE TABLE
> - ML model predicts which tables benefit most based on usage patterns and file statistics
> - Works only on managed Unity Catalog tables (not external tables)
> - Complements — but does not replace — auto-compaction for streaming workloads
>
> ### Example Answer
>
> Predictive Optimization removes the operational burden of table maintenance. Instead of writing cron jobs to OPTIMIZE and VACUUM each table on a fixed schedule, you enable it and let Databricks decide when each table needs maintenance.
>
> **Enabling and disabling:**
>
> ```sql
> -- Enable for a specific table
> ALTER TABLE prod.silver.orders
> SET TBLPROPERTIES ('delta.enablePredictiveOptimization' = 'true');
>
> -- Enable for all tables in a schema (inherited by new tables)
> ALTER SCHEMA prod.silver
> SET TBLPROPERTIES ('delta.enablePredictiveOptimization' = 'true');
>
> -- Disable for a specific table
> ALTER TABLE prod.silver.orders
> SET TBLPROPERTIES ('delta.enablePredictiveOptimization' = 'false');
> ```
>
> You can monitor what operations were performed through the system table `system.storage.predictive_optimization_operations_history`, which logs every auto-triggered OPTIMIZE, VACUUM, and ANALYZE with timestamps and metrics.
>
> One important distinction: predictive optimization handles batch table maintenance, while auto-compaction (`delta.autoOptimize.optimizeWrite`) handles real-time compaction during streaming writes. They serve different purposes and work together.
>
> ### Follow-up Questions
>
> - Can you use predictive optimization on external (unmanaged) Delta tables?
> - How do you verify that predictive optimization is actually improving query performance?
> - What happens if predictive optimization conflicts with a manually scheduled OPTIMIZE job?

---

**[← Previous: Data Modeling](./06-data-modeling.md) | [↑ Back to Interview Prep](./README.md) | [Next: PySpark & SQL Patterns →](./08-pyspark-sql-patterns.md)**
