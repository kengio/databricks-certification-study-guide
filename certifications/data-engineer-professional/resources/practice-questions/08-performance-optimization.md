---
title: "Practice Questions: Performance Optimization"
type: practice-questions
tags: [data-engineer-professional, practice-questions, performance-optimization]
---

# Practice Questions - Section 08: Performance Optimization (5%)

## Question 8.1: OPTIMIZE and ZORDER

**Scenario**: A table frequently filters on `region` and `date` columns. Small files are causing performance issues.

**Question** *(Easy)*: Which command best optimizes query performance?

A) `OPTIMIZE table_name`
B) `OPTIMIZE table_name ZORDER BY (region)`
C) `OPTIMIZE table_name ZORDER BY (region, date)`
D) `VACUUM table_name`

> [!success]- Answer
> **Correct Answer: C**
>
> ZORDER on both frequently filtered columns provides the best data skipping. Option A compacts files but doesn't optimize data layout. Option B only optimizes for one column. VACUUM removes old files but doesn't improve layout.

---

## Question 8.2: Shuffle Partitions

**Scenario**: A Spark job processing 10GB of data is running slowly with default settings.

**Question** *(Medium)*: What is the default value of `spark.sql.shuffle.partitions` and how should it be adjusted?

A) 100; increase for large data
B) 200; decrease for small data
C) 200; increase for large data
D) 500; keep default for all data

> [!success]- Answer
> **Correct Answer: B**
>
> Default is 200. For 10GB (relatively small), reducing partitions can improve performance by reducing overhead. Rule of thumb: target ~128MB per partition. 10GB / 128MB = 80 partitions.

---

## Question 8.3: Broadcast Join

**Scenario**: A large fact table (100GB) is joined with a small dimension table (50MB).

**Question** *(Easy)*: How can the join be optimized?

A) Increase shuffle partitions
B) Use a broadcast hint on the large table
C) Use a broadcast hint on the small table
D) Partition both tables by the join key

> [!success]- Answer
> **Correct Answer: C**
>
> Broadcasting the small table avoids shuffling the large table. The small table is sent to all executors for a local join. Default broadcast threshold is 10MB, so a hint may be needed for 50MB: `/*+ BROADCAST(small_table) */`.

---

## Question 8.4: AQE (Adaptive Query Execution)

**Scenario**: A query has skewed data causing one task to run much longer than others.

**Question** *(Medium)*: Which AQE feature helps with this?

A) Coalesce partitions
B) Skew join optimization
C) Dynamic broadcast join
D) Local shuffle reader

> [!success]- Answer
> **Correct Answer: B**
>
> AQE's skew join optimization automatically detects and splits skewed partitions to distribute work more evenly. Coalesce combines small partitions. Dynamic broadcast switches join strategies. Local shuffle reader reduces I/O.

---

## Question 8.5: File Size Optimization

**Scenario**: A streaming job creates many small files, degrading query performance.

**Question** *(Easy)*: Which configuration helps?

A) `spark.sql.shuffle.partitions = 1`
B) `delta.autoOptimize.optimizeWrite = true`
C) `spark.databricks.delta.vacuum.enabled = true`
D) `delta.checkpoint.writeStatsAsJson = false`

> [!success]- Answer
> **Correct Answer: B**
>
> `optimizeWrite` bins data during writes to create better-sized files. This is especially helpful for streaming which naturally creates small files. Option A would create single-file outputs (bad for parallelism). Vacuum removes old files but doesn't compact.

---

## Question 8.6: Cost Optimization

**Scenario**: A daily ETL job runs for 3 hours. The team wants to reduce costs.

**Question** *(Easy)*: Which change provides the biggest cost savings?

A) Switch from all-purpose to job cluster
B) Increase cluster size to finish faster
C) Run during business hours
D) Disable auto-scaling

> [!success]- Answer
> **Correct Answer: A**
>
> Job clusters have ~60% lower DBU rates than all-purpose clusters. They're created for the job and terminated after, eliminating idle time costs. Larger clusters may cost more overall. Auto-scaling typically helps with costs.

---

## Question 8.7: EXPLAIN Plan Analysis

**Scenario**: A data engineer runs `EXPLAIN EXTENDED` on a slow query and sees `SortMergeJoin` in the physical plan where one table is only 5MB.

**Question** *(Hard)*: What does this indicate and how should it be fixed?

A) The join is optimal; SortMergeJoin is always the fastest strategy
B) Add a Z-ORDER on the join key to improve data locality
C) The broadcast threshold is too low; increase `spark.sql.autoBroadcastJoinThreshold` or add a broadcast hint
D) The query needs more shuffle partitions to distribute the sort

> [!success]- Answer
> **Correct Answer: C**
>
> A 5MB table should be broadcast-joined (avoiding shuffle), not sort-merge-joined. The default threshold is 10MB, but if statistics are inaccurate, Spark may choose SortMergeJoin. Increasing the threshold or using `/*+ BROADCAST(t) */` forces the more efficient BroadcastHashJoin.

---

## Question 8.8: Photon Engine

**Scenario**: A team enables Photon on their cluster expecting all queries to run faster. Some queries show improvement while others show no change.

**Question** *(Medium)*: Which workload type benefits MOST from Photon acceleration?

A) Machine learning model training with MLlib
B) Scan-heavy queries with aggregations and joins on large Delta tables
C) Python UDF-heavy transformations
D) Streaming micro-batches with very small data volumes

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is a C++ vectorized execution engine optimized for scan-heavy SQL/DataFrame operations including aggregations, joins, and filters. It doesn't accelerate Python UDFs (which run in Python), MLlib (which uses different execution paths), or very small data volumes (where overhead exceeds benefit).

---

## Question 8.9: Memory and Spill Diagnostics

**Scenario**: A Spark job shows "spill to disk" warnings in the Spark UI. The job completes but is much slower than expected.

**Question** *(Medium)*: What is the primary cause of disk spill and the best remediation?

A) Disk spill is caused by too many tasks; reduce `spark.sql.shuffle.partitions`
B) Disk spill is caused by insufficient CPU cores; increase cluster size
C) Disk spill indicates corrupted data blocks; run OPTIMIZE on source tables
D) Disk spill occurs when partition data exceeds available memory; increase `spark.sql.shuffle.partitions` or executor memory

> [!success]- Answer
> **Correct Answer: D**
>
> Spill to disk happens when a partition's data cannot fit in memory. Either increase shuffle partitions (smaller partitions) or executor memory (more room per partition). Reducing partitions makes the problem worse. CPU cores don't affect memory spill. OPTIMIZE affects file sizes, not in-memory partition sizes.

---

## Question 8.10: Spark UI Stage Analysis

**Scenario**: A data engineer examines the Spark UI and notices one stage has 200 tasks where 199 complete in 2 seconds but 1 task takes 15 minutes.

**Question** *(Medium)*: What is this pattern called and which AQE feature addresses it?

A) A straggler task; enable speculative execution with `spark.speculation = true`
B) Data skew; AQE's `spark.sql.adaptive.skewJoin.enabled` splits the skewed partition
C) A scheduling delay; increase `spark.executor.cores` for faster task scheduling
D) Garbage collection overhead; tune JVM GC with `spark.executor.extraJavaOptions`

> [!success]- Answer
> **Correct Answer: B**
>
> One task taking much longer than others with the same data is classic data skew. AQE's skew join optimization detects skewed partitions and splits them into smaller sub-partitions. Speculative execution re-runs slow tasks but doesn't fix the root cause. This isn't a scheduling or GC issue.

---

## Question 8.11: Liquid Clustering

**Scenario**: A table currently uses `OPTIMIZE ... ZORDER BY (region, date)` which must be run manually after each batch load. The team wants automatic incremental data layout optimization.

**Question** *(Hard)*: What is the correct approach to migrate to liquid clustering?

A) `ALTER TABLE t CLUSTER BY (region, date)` and future writes/OPTIMIZE runs apply clustering incrementally
B) `ALTER TABLE t SET TBLPROPERTIES ('delta.liquidClustering' = true, 'clusterColumns' = 'region,date')`
C) Drop and recreate the table with `CREATE TABLE t CLUSTER BY (region, date)` using CTAS
D) Liquid clustering and Z-ORDER cannot coexist; the table must be fully rewritten first

> [!success]- Answer
> **Correct Answer: A**
>
> `ALTER TABLE ... CLUSTER BY` enables liquid clustering on an existing table. Future writes and OPTIMIZE runs will incrementally cluster data without rewriting the entire table. Option B uses incorrect syntax. Option C loses table history unnecessarily. Liquid clustering replaces Z-ORDER; they don't need to coexist since liquid clustering is incremental.

---

## Question 8.12: Query Optimization with Predicate Pushdown

**Scenario**: A query reads from a Delta table partitioned by `date` and filtered by `region`. The EXPLAIN plan shows a `Filter` node above the `Scan` node for the `region` predicate.

**Question** *(Hard)*: How can predicate pushdown for the `region` column be improved?

A) Add a WHERE clause earlier in the SQL query to force pushdown
B) Enable `spark.sql.optimizer.enablePredicatePushDown = true` (disabled by default)
C) Apply Z-ORDER or liquid clustering on `region` to enable data skipping via file-level statistics
D) Convert the `region` column to a partition column for physical-level pushdown

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake uses file-level min/max statistics for data skipping. Z-ORDER or liquid clustering by `region` co-locates similar values, making file statistics effective for skipping irrelevant files. Predicate pushdown is enabled by default. Query order doesn't affect pushdown. While partitioning by `region` works, it's not always advisable if cardinality is very high. Data skipping with Z-ORDER/clustering is the better approach for non-partition columns.

---

## Question 8.13: Auto Optimize Settings

**Scenario**: A streaming pipeline writes to a Delta table using `foreachBatch`. The table accumulates many small files between manual OPTIMIZE runs. The team wants to automate file compaction.

**Question** *(Medium)*: Which combination of settings prevents small file accumulation for this use case?

A) Set `spark.databricks.delta.autoCompact.enabled = true` only
B) Set `spark.databricks.delta.optimizeWrite.enabled = true` only
C) Enable both auto compaction and optimize write on the SparkSession
D) Set both `delta.autoOptimize.optimizeWrite` and `delta.autoOptimize.autoCompact` as table properties

> [!success]- Answer
> **Correct Answer: D**
>
> Setting both as table properties ensures they persist regardless of cluster configuration. `optimizeWrite` bins data during writes for better sizes. `autoCompact` runs a lightweight OPTIMIZE after writes. Using table properties (`ALTER TABLE SET TBLPROPERTIES`) is more reliable than SparkSession configs which must be set on every cluster/session.

---

**[← Previous: Practice Questions - Section 07: Lakeflow Pipelines](./07-lakeflow-pipelines.md) | [↑ Back to Practice Questions](./README.md)**
