---
title: Spark UI and System Tables
type: study-material
tags:
  - data-engineer-associate
  - monitoring
  - spark-ui
  - skew
  - spill
  - system-tables
status: published
---

# Spark UI and System Tables

## Overview

When a job's run history shows a regression, the **Spark UI** explains *why*. Its stage-level metrics reveal the three bottlenecks the exam guide names: **data skew**, **shuffling**, and **disk spilling**. **System tables** add a SQL-queryable history of job runs, audit events, lineage, and billing for trends beyond what one run can show.

> [!abstract]
>
> - Start in the **Stages** tab: sort by duration, open the slowest stage, and read its **Summary Metrics** (Min / 25th / Median / 75th / Max) for task duration, shuffle read, and spill
> - **Skew**: "If the Max duration exceeds the 75th percentile by 50 % or more, the stage might have skew"
> - **Spill**: execution memory ran out, so data was written to disk. Spill statistics appear in the stage details
> - **AQE** splits skewed partitions only in **sort-merge and shuffle-hash joins**. Skewed **aggregations** need **salting**

> [!tip] What the Exam Tests
>
> - Exam guide skill: identify common performance bottlenecks such as data skew, shuffling, and disk spilling by interpreting stage-level metrics in the Spark UI
> - Choosing the fix that matches the symptom: salting, broadcast, partition count, memory, or Liquid Clustering
> - Why adding executors doesn't fix a single skewed task, and why fewer shuffle partitions makes skew worse
> - Which system table answers "which jobs failed?", "who read this table?", or "what did this cost?"

---

## Reading the Spark UI

| Tab | Use it for |
| :--- | :--- |
| **Jobs** | Each Spark job triggered by an action, and its stages |
| **Stages** | **Start here.** Duration per stage. Click in for Summary Metrics and per-task details |
| **SQL / DataFrame** | The physical plan: `Exchange` (shuffle), `BroadcastHashJoin` vs `SortMergeJoin`, and AQE re-plans |
| **Storage** | Cached DataFrames and their memory or disk footprint |
| **Executors** | GC time, memory, and failed tasks per executor |
| **Environment** | Effective Spark configuration |

A fault-finding flow:

1. Find the slowest **stage** (sort by Duration)
2. Read its **Summary Metrics**: compare **Max** with the **75th percentile / Median** for duration and shuffle read size
3. Check the stage's **spill (memory) / spill (disk)** and **Peak Execution Memory**
4. Open the **SQL / DataFrame** tab to see which operator (join, aggregation, sort) produced the stage

## The Three Bottlenecks

| Symptom in stage metrics | Diagnosis | Fixes |
| :--- | :--- | :--- |
| Most tasks finish fast, but one or a few run far longer. Max shuffle read is much larger than the median | **Data skew**: a hot key puts too much data in one partition | Joins: confirm AQE skew handling (or tune its thresholds). **Aggregations: salt the key** and aggregate in two passes. Stored-table skew: **Liquid Clustering**. When writing: the `REBALANCE` hint |
| Large **Shuffle Read/Write** on a join stage, with an `Exchange` before a `SortMergeJoin` | **Expensive shuffle** | Broadcast the small side. Filter and select columns before the join. Avoid unnecessary `repartition` |
| **Spill (disk)** > 0, high Peak Execution Memory, slow tasks | **Disk spill**: execution memory ran out during shuffle, join, sort, or aggregation | `spark.sql.shuffle.partitions=auto` (or more partitions). Reduce rows and wide columns held in memory. More executor memory (fewer, larger workers for heavy ETL) |
| Neither skew nor spill, but slow | Likely **I/O bound** | Check file sizes and layout (`OPTIMIZE`, Liquid Clustering), and predicate pushdown |

Source: [Skew and spill](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page), [Adaptive query execution](https://docs.databricks.com/aws/en/optimizations/aqe).

### Skew in an Aggregation: Salting

AQE "splits and, if needed, replicates skewed partitions in sort merge joins and shuffle hash joins", and never in broadcast joins. It does **not** fix a skewed `groupBy`. Spread the hot key across tasks with a salt, then combine the partial results:

```python
from pyspark.sql import functions as F

SALT_BUCKETS = 16

# Pass 1: aggregate on (customer_id, salt). The hot customer is now split across 16 tasks
partial = (spark.table("main.silver.events")
    .withColumn("salt", (F.rand() * SALT_BUCKETS).cast("int"))
    .groupBy("customer_id", "salt")
    .agg(F.count("*").alias("cnt"), F.sum("amount").alias("amt")))

# Pass 2: combine the partial aggregates per customer_id
result = (partial
    .groupBy("customer_id")
    .agg(F.sum("cnt").alias("events"), F.sum("amt").alias("amount")))
```

> [!warning] Common Mistakes With Skew
>
> - **Adding executors** doesn't help: the one giant partition is still processed by one task
> - **Lowering `spark.sql.shuffle.partitions`** makes partitions bigger, which makes skew and spill worse
> - **"AQE is on, so skew is handled"** is true only for sort-merge and shuffle-hash **joins**

### Shuffle: Broadcast the Small Side

```sql
-- Before: Exchange + SortMergeJoin on both sides
-- After: the 20 MB dimension is shipped to every executor; the large side isn't shuffled
SELECT /*+ BROADCAST(d) */ f.*, d.region
FROM main.silver.sales f JOIN main.silver.stores d ON f.store_id = d.store_id;
```

See [Spark Tuning Parameters](../03-data-transformation-and-modeling/07-spark-tuning-parameters.md) for `spark.sql.autoBroadcastJoinThreshold` and AQE's runtime broadcast threshold.

## System Tables You Should Know

| Table | Contains |
| :--- | :--- |
| `system.lakeflow.jobs` | Job definitions |
| `system.lakeflow.job_run_timeline` | Job runs: start, end, result state |
| `system.lakeflow.job_task_run_timeline` | Task runs within job runs |
| `system.access.audit` | Audit events: who did what, and when |
| `system.access.table_lineage` | Table-to-table read/write lineage |
| `system.billing.usage` | Billable usage (DBUs) by workspace, SKU, job, warehouse, and more |
| `system.storage.predictive_optimization_operations_history` | `OPTIMIZE` / `VACUUM` / `ANALYZE` runs by predictive optimization |

"System tables do not support real-time monitoring", and freshness varies by table ([System tables](https://docs.databricks.com/aws/en/admin/system-tables/)).

```sql
-- Failure rate per job over the last 7 days
SELECT job_id,
       COUNT(*) AS runs,
       COUNT_IF(result_state = 'FAILED') AS failed,
       ROUND(100 * COUNT_IF(result_state = 'FAILED') / COUNT(*), 1) AS failure_pct
FROM system.lakeflow.job_run_timeline
WHERE period_start_time >= current_timestamp() - INTERVAL 7 DAYS
GROUP BY job_id
ORDER BY failure_pct DESC;
```

> [!note]
> Column names in system tables evolve. Check the [jobs system table reference](https://docs.databricks.com/aws/en/admin/system-tables/jobs) before you build dashboards on them.

## Notifications and Repair Runs

- **Notifications**: email and system destinations (for example Slack or a webhook) on run start, success, failure, and duration warnings, configured per job or per task
- **Repair run**: re-runs only the failed tasks of a multi-task run and their dependents, reusing the successful upstream results. It's cheaper than **Run now**, which reruns the whole DAG

## Use Cases

- **Skewed customer aggregation**: a `groupBy("customer_id")` stage has one 10-minute task among 30-second tasks. Salting reduces it to minutes
- **Spilling join**: disk spill on a 2 TB join disappears with `auto` shuffle partitions and larger workers
- **Shuffle-heavy dimension join**: a broadcast hint removes the `Exchange` on the fact table
- **Weekly reliability report**: a dashboard over `system.lakeflow.job_run_timeline` tracks failure rate per job

## Common Issues & Errors

### Scaling Up Doesn't Fix a Straggler

**Scenario:** After doubling the workers, the slowest stage still has one task running for 10 minutes.
**Fix:** That's skew. Salt the aggregation key, or for joins rely on or tune AQE skew handling. More executors can't split one partition.

### Spark UI Gone After the Job Cluster Terminated

**Scenario:** Engineers want to inspect a past run's stages, but the job cluster no longer exists.
**Fix:** Open the Spark UI from the task's run details. Restarted compute shows only its latest Spark UI, so capture key metrics or configure log delivery for later analysis.

### Expecting Real-Time Data From System Tables

**Scenario:** An alert built on `system.lakeflow.job_run_timeline` fires late.
**Fix:** System tables don't support real-time monitoring. Use job notifications for immediate alerts and system tables for trends.

## Exam Tips

> [!tip] Exam Tips
>
> - Max task duration or shuffle read far above the median or 75th percentile = **skew**
> - Skewed **groupBy** with AQE already on → **salt the key** (two-stage aggregation)
> - Skewed **join** → AQE skew-join handling (sort-merge or shuffle-hash), or salting
> - **Spill** → more or `auto` shuffle partitions, less data per task, or more executor memory
> - Large **shuffle** with a small dimension → **broadcast** it
> - System tables are for trends and audits, not real-time alerts

## Key Takeaways

- Stage Summary Metrics are the evidence for skew, shuffle, and spill
- AQE helps with joins and partition coalescing. Aggregation skew needs salting
- Broadcast small tables to avoid shuffles, and size partitions to avoid spill
- `system.lakeflow.*`, `system.access.*`, and `system.billing.usage` cover runs, audit, lineage, and cost

## Related Topics

- [Job Monitoring](./01-job-monitoring.md)
- [Spark Tuning Parameters](../03-data-transformation-and-modeling/07-spark-tuning-parameters.md)
- [Liquid Clustering and Predictive Optimization](./04-liquid-clustering-and-predictive-optimization.md)
- [DE Pro — Spark UI debugging](../../data-engineer-professional/08-debugging-and-deploying/01-spark-ui-debugging.md)
- [DE Pro — Monitoring and Alerting (deeper)](../../data-engineer-professional/04-monitoring-and-alerting/README.md)

## Official Documentation

- [Skew and spill](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page)
- [Adaptive query execution](https://docs.databricks.com/aws/en/optimizations/aqe)
- [System tables](https://docs.databricks.com/aws/en/admin/system-tables/)
- [Add notifications on a job](https://docs.databricks.com/aws/en/jobs/notifications)
- [Repair a failed job run](https://docs.databricks.com/aws/en/jobs/repair-job-failures)

---

**[← Previous: Job Monitoring](./01-job-monitoring.md) | [↑ Back to Troubleshooting, Monitoring, and Optimization](./README.md) | [Next: Delta Optimization →](./03-delta-optimization.md)**
