# Practice Questions - Section 08: Performance Optimization (5%)

[Back to Overview](README.md) | [Previous: Lakeflow Pipelines](07-lakeflow-pipelines.md)

---

## Question 8.1: OPTIMIZE and ZORDER

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

## Question 8.2: Shuffle Partitions

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
> Default is 200. For 10GB (relatively small), reducing partitions can improve performance by reducing overhead. Rule of thumb: target ~128MB per partition. 10GB / 128MB = 80 partitions.

</details>

---

## Question 8.3: Broadcast Join

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

## Question 8.4: AQE (Adaptive Query Execution)

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

## Question 8.5: File Size Optimization

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

## Question 8.6: Cost Optimization

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

[Back to Overview](README.md) | [Previous: Lakeflow Pipelines](07-lakeflow-pipelines.md)
