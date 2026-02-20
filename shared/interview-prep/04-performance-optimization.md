# Interview Questions — Performance Optimization

[Back to Interview Prep](./README.md) | [Previous: Pipeline Architecture](03-pipeline-architecture.md) | [Next: Streaming & CDC](05-streaming-cdc.md)

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
> ```text
>
> Is `customers` (50M rows) being broadcast? At 50M rows it's too large for the default 10MB broadcast threshold. Is it doing a sort-merge join with too many shuffle partitions (200 is too few for 2B rows)?
>
> **Step 4 — Check file health on Delta tables**:
>
> ```sql
> DESCRIBE DETAIL orders;
> DESCRIBE DETAIL customers;
> ```text
>
> Look at `numFiles` and `sizeInBytes / numFiles`. If average file size is < 1MB, you have a small files problem causing excessive task overhead. Run `OPTIMIZE`:
>
> ```sql
> OPTIMIZE orders;
> OPTIMIZE customers ZORDER BY (customer_id);
> ```text
>
> **Step 5 — Tune shuffle partitions**: For 2 billion rows, 200 partitions means 10M rows per partition — likely too large, causing spill to disk. Increase:
>
> ```python
> spark.conf.set("spark.sql.shuffle.partitions", 2000)
> ```text
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
> ```text
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
> ```text
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
> ```text
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
> ```text
>
> Or increase the threshold (if you have sufficient executor memory):
>
> ```python
> spark.conf.set("spark.sql.autoBroadcastJoinThreshold", str(200 * 1024 * 1024))  # 200MB
> ```text
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
> ```text
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
> ```text
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

[Back to Interview Prep](./README.md) | [Previous: Pipeline Architecture](03-pipeline-architecture.md) | [Next: Streaming & CDC](05-streaming-cdc.md)
