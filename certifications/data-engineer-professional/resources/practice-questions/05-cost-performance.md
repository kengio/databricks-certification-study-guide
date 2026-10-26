---
title: "Practice Questions: Cost & Performance Optimization"
type: practice-questions
tags: [data-engineer-professional, practice-questions, cost-performance]
---

# Section 5: Cost & Performance Optimization (15 %)

Practice questions for Section 5 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 5 folder](../../05-cost-and-performance-optimization/README.md).

---

## Question 1: Change Data Feed

**Question** *(Easy)*: A data engineer needs to track all changes (inserts, updates, deletes) to a Delta table for downstream CDC processing. Which statement correctly enables this capability?

A) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataFeed' = true)`  
B) `ALTER TABLE orders SET TBLPROPERTIES ('delta.enableChangeDataCapture' = true)`  
C) `ALTER TABLE orders ENABLE CHANGE TRACKING`  
D) `CREATE TABLE orders WITH (CDC = ENABLED)`  

> [!success]- Answer
> **Correct Answer: A**
>
> `delta.enableChangeDataFeed = true` enables Change Data Feed (CDF) on a Delta table. This allows reading changes using `table_changes()` function or `readChangeData` option. The other options use incorrect syntax.

---

## Question 2: Back-Pressure and Rate Limiting

**Question** *(Medium)*: A streaming query reads from Kafka and the processing time per micro-batch is consistently exceeding the trigger interval, causing increasing latency. Which configuration limits the amount of data processed per micro-batch?

A) `trigger(processingTime="10 seconds")` to increase batch frequency  
B) `spark.sql.streaming.stateStore.maintenanceInterval` to reduce state overhead  
C) `spark.sql.shuffle.partitions` to increase parallelism  
D) `maxOffsetsPerTrigger` to limit records consumed from Kafka per batch  

> [!success]- Answer
> **Correct Answer: D**
>
> `maxOffsetsPerTrigger` controls the maximum number of offsets (records) read from Kafka per trigger, providing back-pressure control. Changing the trigger interval doesn't reduce per-batch data. State maintenance affects state cleanup, not ingestion. Shuffle partitions affect parallelism, not input volume.

---

## Question 3: Liquid Clustering vs Z-ORDER

**Question** *(Medium)*: A table is frequently filtered by `customer_id` and `order_date`. The team wants automatic optimization. Which approach provides automatic maintenance?

A) `ALTER TABLE table CLUSTER BY (customer_id, order_date)`  
B) `OPTIMIZE table ZORDER BY (customer_id, order_date)` scheduled daily  
C) `CREATE TABLE table PARTITIONED BY (customer_id, order_date)`  
D) Both A and B provide automatic maintenance  

> [!success]- Answer
> **Correct Answer: A**
>
> Liquid Clustering (`CLUSTER BY`) provides automatic, incremental clustering without manual OPTIMIZE commands. Z-ORDER requires scheduled OPTIMIZE runs. Partitioning is for low-cardinality columns and doesn't cluster data within partitions.

---

## Question 4: Query Profiler

**Question** *(Medium)*: A SQL query is running slowly. The data engineer wants to see if partition pruning is working. What should they look for in EXPLAIN output?

A) `PartitionFilters` showing filter conditions  
B) `DataFilters` showing filter conditions  
C) `PushedFilters` showing filter conditions  
D) All of the above indicate different types of filtering  

> [!success]- Answer
> **Correct Answer: D**
>
> `PartitionFilters` shows partition pruning (best). `DataFilters` shows filters applied after scan. `PushedFilters` shows filters pushed to the file format. Ideally, filters should appear in PartitionFilters for best performance.

---

## Question 5: Identifying Data Skew

**Question** *(Medium)*: A job has 99 tasks completing in 1 minute but one task takes 30 minutes. What is the most likely cause?

A) Insufficient cluster memory  
B) Data skew in partition keys  
C) Network timeout  
D) Corrupt data file  

> [!success]- Answer
> **Correct Answer: B**
>
> One task taking much longer than others typically indicates data skew - one partition has significantly more data. Solutions include salting keys, using AQE skew handling, or repartitioning data more evenly.

---

## Question 6: OPTIMIZE and ZORDER

**Question** *(Easy)*: A table frequently filters on `region` and `date` columns. Small files are causing performance issues. Which command best optimizes query performance?

A) `OPTIMIZE table_name`  
B) `OPTIMIZE table_name ZORDER BY (region)`  
C) `OPTIMIZE table_name ZORDER BY (region, date)`  
D) `VACUUM table_name`  

> [!success]- Answer
> **Correct Answer: C**
>
> ZORDER on both frequently filtered columns provides the best data skipping. Option A compacts files but doesn't optimize data layout. Option B only optimizes for one column. VACUUM removes old files but doesn't improve layout.

---

## Question 7: Shuffle Partitions

**Question** *(Medium)*: A Spark job processing 10GB of data is running slowly with default settings. What is the default value of `spark.sql.shuffle.partitions` and how should it be adjusted?

A) 100; increase for large data  
B) 200; decrease for small data  
C) 200; increase for large data  
D) 500; keep default for all data  

> [!success]- Answer
> **Correct Answer: B**
>
> Default is 200. For 10GB (relatively small), reducing partitions can improve performance by reducing overhead. Rule of thumb: target ~128MB per partition. 10GB / 128MB = 80 partitions.

---

## Question 8: Broadcast Join

**Question** *(Easy)*: A large fact table (100GB) is joined with a small dimension table (50MB). How can the join be optimized?

A) Increase shuffle partitions  
B) Use a broadcast hint on the large table  
C) Use a broadcast hint on the small table  
D) Partition both tables by the join key  

> [!success]- Answer
> **Correct Answer: C**
>
> Broadcasting the small table avoids shuffling the large table. The small table is sent to all executors for a local join. Default broadcast threshold is 10MB, so a hint may be needed for 50MB: `/*+ BROADCAST(small_table) */`.

---

## Question 9: AQE (Adaptive Query Execution)

**Question** *(Medium)*: A query has skewed data causing one task to run much longer than others. Which AQE feature helps with this?

A) Coalesce partitions  
B) Skew join optimization  
C) Dynamic broadcast join  
D) Local shuffle reader  

> [!success]- Answer
> **Correct Answer: B**
>
> AQE's skew join optimization automatically detects and splits skewed partitions to distribute work more evenly. Coalesce combines small partitions. Dynamic broadcast switches join strategies. Local shuffle reader reduces I/O.

---

## Question 10: File Size Optimization

**Question** *(Easy)*: A streaming job creates many small files, degrading query performance. Which configuration helps?

A) `spark.sql.shuffle.partitions = 1`  
B) `delta.autoOptimize.optimizeWrite = true`  
C) `spark.databricks.delta.vacuum.enabled = true`  
D) `delta.checkpoint.writeStatsAsJson = false`  

> [!success]- Answer
> **Correct Answer: B**
>
> `optimizeWrite` bins data during writes to create better-sized files. This is especially helpful for streaming which naturally creates small files. Option A would create single-file outputs (bad for parallelism). Vacuum removes old files but doesn't compact.

---

## Question 11: Cost Optimization

**Question** *(Easy)*: A daily ETL job runs for 3 hours. The team wants to reduce costs. Which change provides the biggest cost savings?

A) Switch from all-purpose to job cluster  
B) Increase cluster size to finish faster  
C) Run during business hours  
D) Disable auto-scaling  

> [!success]- Answer
> **Correct Answer: A**
>
> Job clusters have ~60% lower DBU rates than all-purpose clusters. They're created for the job and terminated after, eliminating idle time costs. Larger clusters may cost more overall. Auto-scaling typically helps with costs.

---

## Question 12: EXPLAIN Plan Analysis

**Question** *(Hard)*: A data engineer runs `EXPLAIN EXTENDED` on a slow query and sees `SortMergeJoin` in the physical plan where one table is only 5MB. What does this indicate and how should it be fixed?

A) The join is optimal; SortMergeJoin is always the fastest strategy  
B) Add a Z-ORDER on the join key to improve data locality  
C) The broadcast threshold is too low; increase `spark.sql.autoBroadcastJoinThreshold` or add a broadcast hint  
D) The query needs more shuffle partitions to distribute the sort  

> [!success]- Answer
> **Correct Answer: C**
>
> A 5MB table should be broadcast-joined (avoiding shuffle), not sort-merge-joined. The default threshold is 10MB, but if statistics are inaccurate, Spark may choose SortMergeJoin. Increasing the threshold or using `/*+ BROADCAST(t) */` forces the more efficient BroadcastHashJoin.

---

## Question 13: Photon Engine

**Question** *(Medium)*: A team enables Photon on their cluster expecting all queries to run faster. Some queries show improvement while others show no change. Which workload type benefits MOST from Photon acceleration?

A) Machine learning model training with MLlib  
B) Scan-heavy queries with aggregations and joins on large Delta tables  
C) Python UDF-heavy transformations  
D) Streaming micro-batches with very small data volumes  

> [!success]- Answer
> **Correct Answer: B**
>
> Photon is a C++ vectorized execution engine optimized for scan-heavy SQL/DataFrame operations including aggregations, joins, and filters. It doesn't accelerate Python UDFs (which run in Python), MLlib (which uses different execution paths), or very small data volumes (where overhead exceeds benefit).

---

## Question 14: Memory and Spill Diagnostics

**Question** *(Medium)*: A Spark job shows "spill to disk" warnings in the Spark UI. The job completes but is much slower than expected. What is the primary cause of disk spill and the best remediation?

A) Disk spill is caused by too many tasks; reduce `spark.sql.shuffle.partitions`  
B) Disk spill is caused by insufficient CPU cores; increase cluster size  
C) Disk spill indicates corrupted data blocks; run OPTIMIZE on source tables  
D) Disk spill occurs when partition data exceeds available memory; increase `spark.sql.shuffle.partitions` or executor memory  

> [!success]- Answer
> **Correct Answer: D**
>
> Spill to disk happens when a partition's data cannot fit in memory. Either increase shuffle partitions (smaller partitions) or executor memory (more room per partition). Reducing partitions makes the problem worse. CPU cores don't affect memory spill. OPTIMIZE affects file sizes, not in-memory partition sizes.

---

## Question 15: Liquid Clustering

**Question** *(Hard)*: A table currently uses `OPTIMIZE ... ZORDER BY (region, date)` which must be run manually after each batch load. The team wants automatic incremental data layout optimization. What is the correct approach to migrate to liquid clustering?

A) `ALTER TABLE t CLUSTER BY (region, date)` and future writes/OPTIMIZE runs apply clustering incrementally  
B) `ALTER TABLE t SET TBLPROPERTIES ('delta.liquidClustering' = true, 'clusterColumns' = 'region,date')`  
C) Drop and recreate the table with `CREATE TABLE t CLUSTER BY (region, date)` using CTAS  
D) Liquid clustering and Z-ORDER cannot coexist; the table must be fully rewritten first  

> [!success]- Answer
> **Correct Answer: A**
>
> `ALTER TABLE ... CLUSTER BY` enables liquid clustering on an existing table. Future writes and OPTIMIZE runs will incrementally cluster data without rewriting the entire table. Option B uses incorrect syntax. Option C loses table history unnecessarily. Liquid clustering replaces Z-ORDER; they don't need to coexist since liquid clustering is incremental.

---

## Question 16: Query Optimization with Predicate Pushdown

**Question** *(Hard)*: A query reads from a Delta table partitioned by `date` and filtered by `region`. The EXPLAIN plan shows a `Filter` node above the `Scan` node for the `region` predicate. How can predicate pushdown for the `region` column be improved?

A) Add a WHERE clause earlier in the SQL query to force pushdown  
B) Enable `spark.sql.optimizer.enablePredicatePushDown = true` (disabled by default)  
C) Apply Z-ORDER or liquid clustering on `region` to enable data skipping via file-level statistics  
D) Convert the `region` column to a partition column for physical-level pushdown  

> [!success]- Answer
> **Correct Answer: C**
>
> Delta Lake uses file-level min/max statistics for data skipping. Z-ORDER or liquid clustering by `region` co-locates similar values, making file statistics effective for skipping irrelevant files. Predicate pushdown is enabled by default. Query order doesn't affect pushdown. While partitioning by `region` works, it's not always advisable if cardinality is very high. Data skipping with Z-ORDER/clustering is the better approach for non-partition columns.

---

## Question 17: Auto Optimize Settings

**Question** *(Medium)*: A streaming pipeline writes to a Delta table using `foreachBatch`. The table accumulates many small files between manual OPTIMIZE runs. The team wants to automate file compaction. Which combination of settings prevents small file accumulation for this use case?

A) Set `spark.databricks.delta.autoCompact.enabled = true` only  
B) Set `spark.databricks.delta.optimizeWrite.enabled = true` only  
C) Enable both auto compaction and optimize write on the SparkSession  
D) Set both `delta.autoOptimize.optimizeWrite` and `delta.autoOptimize.autoCompact` as table properties  

> [!success]- Answer
> **Correct Answer: D**
>
> Setting both as table properties ensures they persist regardless of cluster configuration. `optimizeWrite` bins data during writes for better sizes. `autoCompact` runs a lightweight OPTIMIZE after writes. Using table properties (`ALTER TABLE SET TBLPROPERTIES`) is more reliable than SparkSession configs which must be set on every cluster/session.

---

## Question 18: Reading Row-Level Changes *(2026 blueprint)*

**Question** *(Medium)*: A Delta table has `delta.enableChangeDataFeed = true`. A downstream process must incrementally handle only rows that were updated or deleted since its last run, using the new values for updated rows, without scanning the whole table. Which approach is most efficient?

A) Read with `.option("readChangeFeed", "true")` from the last processed version and keep rows where `_change_type` is `update_postimage` or `delete`  
B) Read with `readChangeFeed` and keep rows where `_change_type` is `update_preimage`  
C) Compare the current table with `VERSION AS OF` the previous version using a full anti-join  
D) Run `DESCRIBE HISTORY` and reprocess the full table whenever a new version exists  

> [!success]- Answer
> **Correct Answer: A**
>
> The change data feed returns only the changed rows; `update_postimage` carries the values after an update and `delete` marks removed rows.
>
> B is wrong because `update_preimage` holds the values before the update. C works but scans both versions in full, which defeats incremental processing. D reprocesses everything and gives no row-level change information.

---

## Question 19: CDF and Retention *(2026 blueprint)*

**Question** *(Hard)*: A stream that reads a Delta table's change data feed was paused for six weeks. The table uses default retention settings and is vacuumed regularly. When restarted from a new checkpoint with `startingVersion` set to the last version it processed, the stream fails to start. What is the most likely cause?

A) Change data feed is disabled automatically whenever `VACUUM` runs  
B) `readChangeFeed` works only for batch reads, not streaming reads  
C) The requested version and its change data are no longer in the table history; `VACUUM` removed the change files and log retention (default 30 days) expired the version  
D) `OPTIMIZE` renamed the `_change_type` column, breaking the stream schema  

> [!success]- Answer
> **Correct Answer: C**
>
> CDF is not a permanent record: change data follows the table's retention, and a stream cannot start from a version that is no longer in history.
>
> A is wrong because `VACUUM` deletes old files but does not turn off the table property. B is wrong because CDF supports streaming reads, and streaming is the recommended way to consume it. D is wrong because `OPTIMIZE` does not rename CDF metadata columns. The fix is to restart from an available version, and to archive the change feed if a long history is required.

---

## Question 20: Retiring Maintenance Jobs *(2026 blueprint)*

**Question** *(Medium)*: A team owns 40 external Delta tables registered in Unity Catalog. Every night an all-purpose cluster runs notebooks that execute `OPTIMIZE`, `VACUUM`, and `ANALYZE TABLE` on each table, and the team spends hours tuning the schedule. Predictive optimization is enabled at the account level. They want the platform to handle this maintenance automatically with the least ongoing effort. What should they do?

A) Run `ALTER TABLE ... ENABLE PREDICTIVE OPTIMIZATION` on each external table and keep the nightly notebooks as a fallback  
B) Enable auto compaction on every table and move the notebooks to a job cluster to lower the DBU rate  
C) Convert the tables to Unity Catalog managed tables with `ALTER TABLE ... SET MANAGED`, let them inherit predictive optimization, and remove the scheduled maintenance jobs  
D) Add `ZORDER BY` to the nightly `OPTIMIZE` statements so that fewer runs are needed  

> [!success]- Answer
> **Correct Answer: C**
>
> Convert the tables to UC managed tables and let predictive optimization run `OPTIMIZE`, `VACUUM`, and `ANALYZE` automatically.
>
> Predictive optimization only supports Unity Catalog managed tables; it runs maintenance on serverless jobs compute when it is cost-effective, and Databricks recommends disabling scheduled `OPTIMIZE` jobs once it is on. `SET MANAGED` keeps the table name, permissions, and history. A is wrong because predictive optimization does not run on external tables, whatever the table-level setting. B still leaves the team owning `VACUUM` and statistics jobs. D adds work: Z-order must be re-applied manually and predictive optimization never runs `ZORDER`.

---

## Question 21: Predictive Optimization Inheritance *(2026 blueprint)*

**Question** *(Hard)*: Predictive optimization is enabled for the account. An admin runs `ALTER CATALOG finance DISABLE PREDICTIVE OPTIMIZATION;` and later `ALTER SCHEMA finance.reporting ENABLE PREDICTIVE OPTIMIZATION;`. No table-level settings exist, and all tables are Unity Catalog managed tables. Which statement describes the result?

A) Managed tables in `finance.reporting` are maintained by predictive optimization, while managed tables in other `finance` schemas are not  
B) No tables in the `finance` catalog are maintained, because a catalog-level `DISABLE` overrides every schema below it  
C) All tables in `finance` are maintained, because the account-level setting always takes precedence  
D) Only tables created after the schema-level `ENABLE` are maintained; existing tables must be re-created  

> [!success]- Answer
> **Correct Answer: A**
>
> The schema-level `ENABLE` overrides the catalog's `DISABLE` for `finance.reporting`, and the other schemas inherit the catalog's `DISABLE`.
>
> Predictive optimization uses an inheritance model: account → catalog → schema → table, where an explicit `ENABLE` or `DISABLE` at a lower level overrides its parent and `INHERIT` resets it. B is wrong because lower levels can override the catalog. C is wrong because the account value is only the default that objects inherit. D is wrong because the setting applies to existing managed tables in the schema; no re-creation is needed.

---

## Question 22: Changing Filter Patterns *(2026 blueprint)*

**Question** *(Medium)*: A 30 TB Unity Catalog managed gold table is queried by hundreds of analysts. One quarter most queries filter on `region`, the next on `product_id` and `order_date`, and the platform team has no time to keep re-tuning the layout. Predictive optimization is enabled for the catalog. Which approach best fits this access pattern?

A) Partition the table by `region` and run a nightly `OPTIMIZE ... ZORDER BY (product_id, order_date)`  
B) Enable deletion vectors so that layout changes are applied at read time  
C) Define liquid clustering with all five frequently filtered columns as keys and run `OPTIMIZE FULL` every night  
D) Run `ALTER TABLE ... CLUSTER BY AUTO` so that predictive optimization selects and evolves the clustering keys from the query workload  

> [!success]- Answer
> **Correct Answer: D**
>
> `CLUSTER BY AUTO` lets predictive optimization choose clustering keys from the table's query history and change them as patterns shift.
>
> Automatic liquid clustering is available for UC managed tables with predictive optimization; it analyzes the historical query workload and changes keys only when the expected data-skipping savings outweigh the clustering cost. A hard-codes one pattern, needs manual Z-order runs, and partitioning is not recommended under 100 TB. B is wrong because deletion vectors reduce write amplification for row-level changes; they do not cluster data. C is invalid because liquid clustering allows at most four keys, and nightly `OPTIMIZE FULL` is unnecessary since clustering is incremental.

---

## Question 23: Physically Removing Deleted Rows *(2026 blueprint)*

**Question** *(Hard)*: A customer table has deletion vectors enabled because it receives frequent small `MERGE` and `DELETE` operations. For a GDPR request, the engineer runs `DELETE FROM main.crm.customers WHERE customer_id = 42`. The compliance team requires that the deleted record's bytes no longer exist in any data file in storage. What should the engineer do next?

A) Run `VACUUM` with the default retention; it removes soft-deleted rows from current data files  
B) Run `REORG TABLE main.crm.customers APPLY (PURGE)`, then run `VACUUM` so the old files from earlier table versions are removed  
C) Run `OPTIMIZE main.crm.customers ZORDER BY (customer_id)`, which guarantees every deletion vector is applied  
D) Disable deletion vectors with `ALTER TABLE ... SET TBLPROPERTIES ('delta.enableDeletionVectors' = false)`, which rewrites the affected files immediately  

> [!success]- Answer
> **Correct Answer: B**
>
> `REORG TABLE ... APPLY (PURGE)` rewrites files that contain soft-deleted rows, and `VACUUM` then deletes the older files that still hold the data.
>
> With deletion vectors, a `DELETE` only marks the row in metadata, so the bytes stay in the existing Parquet file. The docs say to run `REORG TABLE ... APPLY (PURGE)` and then `VACUUM` to physically remove old data. A is wrong because `VACUUM` only deletes files no longer referenced by the table; the current file with the soft-deleted row is still referenced. C is wrong because compaction gives no strict guarantee that every deletion-vector change is applied. D is wrong because changing the property affects future writes; it does not purge existing soft-deleted data.

---

## Question 24: Speeding Up Repeated Reads *(2026 blueprint)*

**Question** *(Easy)*: Analysts on a classic all-purpose cluster run many different queries against the same few Delta tables throughout the day. Each query reads the data again from cloud object storage, and the team wants repeated reads to be faster without changing any notebook code. What should they do?

A) Add `df.cache()` after every `spark.read.table()` call in the notebooks  
B) Run `CACHE SELECT * FROM` each table at the start of the day  
C) Choose a worker instance type with local SSDs so the disk (Delta) cache is enabled and stores copies of the Parquet files locally after the first read  
D) Increase `spark.sql.shuffle.partitions` so that more tasks read from storage in parallel  

> [!success]- Answer
> **Correct Answer: C**
>
> Use SSD-backed workers so the disk cache automatically keeps local copies of the data files.
>
> The disk cache (formerly Delta cache) is enabled by default on worker types that support it; when a node fetches a Parquet file, it stores a copy on local storage, so later reads of the same data, from any query, run locally. A requires code changes and caches DataFrames manually in memory; Databricks recommends the disk cache instead of the Spark cache for repeated reads of Parquet and Delta data. B is wrong because `CACHE SELECT` is ignored on Databricks Runtime 14.2 and above and on SQL warehouses. D affects shuffle parallelism, not how often files are fetched from object storage.

---

## Question 25: Disk Cache Consistency *(2026 blueprint)*

**Question** *(Medium)*: A cluster with the disk cache enabled has been serving dashboard queries on a Delta table for hours. A job then runs a `MERGE` that rewrites several of the table's files. A data engineer worries that the dashboards will keep returning old data from the cache. What happens?

A) The cache keeps serving the old files until someone runs `CLEAR CACHE` on the cluster  
B) The cluster must be restarted to clear the local SSD cache  
C) The disk cache only stores query results, so the dashboards show old results until the 24-hour cache life cycle ends  
D) The disk cache detects that the data files were modified, invalidates the stale entries, and later reads return the current data with no manual action  

> [!success]- Answer
> **Correct Answer: D**
>
> The disk cache keeps itself consistent by detecting created, deleted, modified, or overwritten files.
>
> The docs state that you can write, modify, and delete table data with no need to explicitly invalidate cached data; stale entries are invalidated and evicted automatically. A and B describe manual invalidation that the disk cache does not require (restarting only clears it). C confuses the disk cache, which stores data files, with the Databricks SQL result cache; the result cache has a 24-hour life cycle but is also invalidated when the underlying tables are updated.

---

## Question 26: Stats Unused in the Query Profile *(2026 blueprint)*

**Question** *(Medium)*: A SQL warehouse query filters a large liquid-clustered table with `WHERE CAST(event_date AS STRING) = '2026-10-01'`, and `event_date` is a clustering key. The query profile shows the Scan operator taking most of the time, a low percentage of data pruned, and a `COVERAGE_STATS_DELTA` insight with the status Unused. What is the best fix?

A) Increase the warehouse size so the full scan finishes faster  
B) Rewrite the predicate to compare the column directly, for example `WHERE event_date = DATE'2026-10-01'`  
C) Add a `/*+ BROADCAST */` hint to the query  
D) Run `SET use_cached_result = false` so the profile reflects a fresh execution  

> [!success]- Answer
> **Correct Answer: B**
>
> Compare `event_date` directly so its min/max statistics can be used for file skipping.
>
> The `COVERAGE_STATS_DELTA` insight reports Unused when statistics can't be used because the filter converts the data type; data skipping relies on per-file min/max values of the column itself. A treats the symptom and costs more without restoring skipping. C is about join strategy and the query has no join problem. D only bypasses the result cache; it doesn't change how many files are read.

---

## Question 27: Missed Broadcast Join *(2026 blueprint)*

**Question** *(Hard)*: A query joins a 2 TB fact table to a 5 MB country dimension on `country_code`. In the query profile, Shuffle operators feed both inputs of the Join, and the Shuffle on the fact side has the highest Time spent and Memory peak. The dimension table has no optimizer statistics. What change most directly removes the expensive shuffle of the fact table?

A) Increase `spark.sql.shuffle.partitions` so each shuffle partition is smaller  
B) Add a `/*+ MERGE(d) */` hint so the join uses a sort-merge join  
C) Add a `/*+ BROADCAST(d) */` hint on the dimension (or collect statistics with `ANALYZE TABLE`) so the small side is broadcast and the fact table is not shuffled  
D) Z-order the fact table by `country_code`  

> [!success]- Answer
> **Correct Answer: C**
>
> Broadcasting the small dimension avoids shuffling the 2 TB fact table.
>
> Shuffle operators on both join inputs mean a shuffled join; in a broadcast hash join the small side is sent to every executor and the large side isn't shuffled. The `BROADCAST` hint broadcasts the hinted side regardless of `autoBroadcastJoinThreshold`, and missing or stale statistics (the `COVERAGE_STATS_OPTIMIZER` insight) lead to wrong size estimates and a slow join strategy. A only resizes the shuffle; the fact table is still moved across the network. B forces a strategy that also shuffles (and sorts) both sides. D improves file skipping for filters, not the join's data movement.

---

## Question 28: Small Table, Many Partitions *(2026 blueprint)*

**Question** *(Medium)*: A 400 GB orders table is partitioned by `order_date`, which has produced thousands of small partitions. Most queries filter on `customer_id` (millions of distinct values) and a date range. The team wants the layout Databricks currently recommends for this size and query pattern. What should they choose?

A) Re-partition the table by `customer_id` to match the most common filter  
B) Keep the date partitioning and schedule a nightly `OPTIMIZE ... ZORDER BY (customer_id)`  
C) Keep the date partitioning and add a Bloom filter index on `customer_id`  
D) Remove the partitioning and use liquid clustering on `order_date` and `customer_id`  

> [!success]- Answer
> **Correct Answer: D**
>
> Drop partitioning and cluster the table on the filter columns with liquid clustering.
>
> Databricks says tables under 1 TB should not be partitioned, recommends liquid clustering for all new tables, and notes that liquid clustering works for both low- and high-cardinality columns without the small-file issues of static partitioning. A is worse: partitioning only suits low or known cardinality, and millions of `customer_id` values would create millions of tiny partitions. B keeps the over-partitioned layout and adds a manual Z-order job that predictive optimization never maintains. C is wrong because Bloom filter indexes are deprecated and superseded by predictive I/O and liquid clustering.

---

## Question 29: Migrating a Partitioned, Z-Ordered Table *(2026 blueprint)*

**Question** *(Hard)*: A 60 TB Delta table is partitioned by `event_date` and Z-ordered nightly by `device_id`. The team wants to move to liquid clustering with minimal reader and writer downtime while keeping data skipping on both columns, using Databricks Runtime 18.1. Which approach should they use?

A) Run `ALTER TABLE events REPLACE PARTITIONED BY WITH CLUSTER BY (event_date, device_id)` and then run `OPTIMIZE`  
B) Run `ALTER TABLE events CLUSTER BY (device_id)` on the partitioned table and keep the nightly Z-order job  
C) Create a new table with both `PARTITIONED BY (event_date)` and `CLUSTER BY (device_id)` using CTAS  
D) Run `OPTIMIZE events ZORDER BY (event_date, device_id)` once, which converts the table to liquid clustering  

> [!success]- Answer
> **Correct Answer: A**
>
> Use the in-place `REPLACE PARTITIONED BY WITH CLUSTER BY` conversion with the partition and Z-order columns as keys, then `OPTIMIZE`.
>
> Databricks recommends this conversion (DBR 18.1+) because it minimizes reader and writer downtime, and its migration guidance says to use both the partition columns and the `ZORDER BY` columns as clustering keys; running `OPTIMIZE` afterwards applies the new clustering. B is wrong because `ALTER TABLE ... CLUSTER BY` enables liquid clustering only on unpartitioned tables, and liquid clustering is incompatible with `ZORDER`. C is invalid because clustering is not compatible with partitioning. D only rewrites files with Z-order; it never enables liquid clustering.

---

**[← Previous: Monitoring and Alerting](./04-monitoring-alerting.md) | [↑ Back to Practice Questions](./README.md) | [Next: Ensuring Data Security and Compliance →](./06-security-compliance.md)**
