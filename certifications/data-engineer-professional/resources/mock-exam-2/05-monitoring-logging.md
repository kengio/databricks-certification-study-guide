# Mock Exam 2 - Section 5: Monitoring & Logging (Questions 46-51)

[Back to Exam Overview](./README.md) | [Previous: Security & Governance](04-security-governance.md) | [Next: Testing & Deployment](06-testing-deployment.md)

---

### Question 46

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

### Question 47

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

### Question 48

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

### Question 49

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

### Question 50

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

### Question 51

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

[Back to Exam Overview](./README.md) | [Previous: Security & Governance](04-security-governance.md) | [Next: Testing & Deployment](06-testing-deployment.md)
