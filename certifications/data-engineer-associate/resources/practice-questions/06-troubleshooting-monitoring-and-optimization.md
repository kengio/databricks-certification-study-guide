---
title: "Practice Questions: Troubleshooting, Monitoring, and Optimization"
type: practice-questions
tags: [data-engineer-associate, practice-questions, troubleshooting-monitoring-optimization]
---

# Domain 6: Troubleshooting, Monitoring, and Optimization

Exam weight: **10 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: OPTIMIZE for File Compaction

**Question** *(Easy)*: A data engineer has discovered that the data files related to a Delta table are quite small. They aim to merge these small files into larger ones to enhance performance. Which keywords can be utilized to compact the small files?

A) VACUUM
B) OPTIMIZE
C) COMPACT
D) DEFRAGMENT

> [!success]- Answer
> **Correct Answer: B**
>
> `OPTIMIZE`.
>
> The `OPTIMIZE` command compacts small files in a Delta table into larger ones, improving read performance by reducing the number of files that need to be scanned. This is different from `VACUUM`, which removes old data files no longer referenced by the transaction log.

---

## Question 2: Webhook Alert for NULL Count

**Question** *(Medium)*: A data engineer uses a Databricks SQL dashboard to monitor data quality. When the count of NULL values in a query result reaches 100, the entire team should be alerted via a messaging webhook. What method accomplishes this?

A) Set up an Alert with a new webhook alert destination
B) Add a conditional formatting rule to the dashboard visualization that sends a webhook
C) Create a Databricks Job that polls the query results and calls the webhook via Python
D) Configure a SQL warehouse event hook that triggers on query result thresholds

> [!success]- Answer
> **Correct Answer: A**
>
> Set up an Alert with a new webhook alert destination.
>
> Databricks SQL Alerts monitor query results against a threshold condition and trigger notifications when the condition is met. Webhook destinations allow alerts to be sent to external messaging services (Slack, Microsoft Teams, PagerDuty) in real-time.

---

## Question 3: Diagnosing a Slow Job Task

**Question** *(Medium)*: A single Job executes two notebooks as distinct tasks. One notebook is performing slowly during the current Job run. What method can a tech lead use to diagnose the cause?

A) Check the Databricks SQL query history for slow-running queries
B) Navigate to the Runs tab in the Jobs UI and click on the active run to review the processing notebook
C) Review the cluster event log for resource allocation errors
D) Open the Lakeflow Declarative Pipelines pipeline UI to inspect per-table processing metrics

> [!success]- Answer
> **Correct Answer: B**
>
> Navigate to the Runs tab in the Jobs UI and click on the active run to review the processing notebook.
>
> Clicking into the active run opens a live view of the notebook execution, including links to the Spark UI for the current task. This allows inspection of active stages, task metrics, shuffle data, and memory usage to identify performance bottlenecks.

---

## Question 4: Job Failure Email Notification

**Question** *(Easy)*: What approach should be taken to email the owner of a Databricks Job if it fails?

A) Write a try/except block in the notebook that sends an email on failure
B) Configure an external monitoring tool to watch the Jobs API for failure status
C) Set up an Alert in the Job's notification settings (Job page)
D) Create a downstream task that runs only on failure and sends the email

> [!success]- Answer
> **Correct Answer: C**
>
> Set up an Alert in the Job's notification settings (Job page).
>
> Databricks Jobs support email notifications for job events (failure, success, or start). The job owner's email address is added directly from the Job's "Notifications" section, requiring no custom code or external alerting systems.

---

## Question 5: Webhook Alert for Zero-Sales Stores

**Question** *(Medium)*: A data engineer tracks store-level records where sales equal zero. When this count exceeds zero, the entire team should be notified via a messaging webhook. What approach accomplishes this?

A) Configure a Lakeflow Declarative Pipelines expectation that triggers a webhook when zero-sales records appear
B) Set up an Alert with a new webhook alert destination
C) Build a custom Python script that polls the query results and posts to the webhook
D) Add a dashboard filter that highlights zero-sales stores and emails the team

> [!success]- Answer
> **Correct Answer: B**
>
> Set up an Alert with a new webhook alert destination.
>
> Configure the alert condition on the query result (value > 0) and point the destination to the team's webhook URL. Databricks SQL Alerts evaluate the query result on each refresh and trigger the webhook notification when the threshold condition is met.

---

## Question 6: Spotting a Duration Regression *(2026 blueprint)*

**Question** *(Easy)*: Stakeholders say a daily Lakeflow Job "feels slower lately". Where can the engineer compare recent run durations with the historical baseline, task by task?

A) The job's Runs tab matrix view
B) The cluster's Environment tab in the Spark UI
C) `DESCRIBE HISTORY` on the output table
D) The workspace admin settings

> [!success]- Answer
> **Correct Answer: A**
>
> The job's Runs tab matrix view.
>
> The matrix view shows one column per run, with a Run total duration row and a row per task. Bar height reflects duration, so a growing bar exposes the regression and the task responsible. History is kept for 60 days. Use `system.lakeflow` tables for longer trends ([Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)).

---

## Question 7: Finding the Upstream Blocker *(2026 blueprint)*

**Question** *(Medium)*: A job run failed. In the Graph view, three downstream tasks show **Upstream failed** and one task shows **Failed**. Where should the engineer start investigating?

A) The three Upstream failed tasks, because they're the most numerous
B) The Failed task. The Upstream failed tasks didn't run because their dependency failed
C) The cluster event log of the last task in the DAG
D) The job's schedule

> [!success]- Answer
> **Correct Answer: B**
>
> The Failed task. The Upstream failed tasks didn't run because their dependency failed.
>
> With the default Run if (*All succeeded*), a task whose dependency fails is marked `Upstream failed`. The DAG graph shows where the failure started. Fix that task, then use **Repair run** to re-run it and its dependents ([Configure task dependencies](https://docs.databricks.com/aws/en/jobs/conditional-tasks)).

---

## Question 8: Succeeded With Failures *(2026 blueprint)*

**Question** *(Medium)*: A job run shows the status **Succeeded with failures**. What does that mean?

A) Every task failed, but the job was retried successfully
B) Some tasks failed, but all leaf tasks (tasks with no downstream dependencies) succeeded
C) The run succeeded, but notifications failed to send
D) The run timed out after producing output

> [!success]- Answer
> **Correct Answer: B**
>
> Some tasks failed, but all leaf tasks (tasks with no downstream dependencies) succeeded.
>
> A run's outcome is determined by its leaf tasks. For example, a failed optional branch with no downstream dependents can leave the run "Succeeded with failures" ([Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)).

---

## Question 9: Fixing a Timed Out Task *(2026 blueprint)*

**Question** *(Easy)*: A task failed with status **Timed Out** after 45 minutes. With today's data volume it needs about 60 minutes. What should the engineer change so future runs complete?

A) The task's timeout, raised above 60 minutes with headroom
B) The job's max concurrent runs
C) The compute's auto termination setting
D) The upstream dependency's Run if condition

> [!success]- Answer
> **Correct Answer: A**
>
> The task's timeout, raised above 60 minutes with headroom.
>
> If a task doesn't finish within its configured timeout, its status is set to Timed Out. With retries configured, the timeout applies to each attempt. The run-duration *warning* threshold only raises an alert, and the other settings don't control the timeout ([Configure and edit tasks](https://docs.databricks.com/aws/en/jobs/configure-task)).

---

## Question 10: Skewed Aggregation With AQE Enabled *(2026 blueprint)*

**Question** *(Hard)*: A batch job does a `groupBy("customer_id")` aggregation. In the Spark UI, most tasks in the longest stage finish in seconds, but one runs for 12 minutes. Its shuffle read is about 10× the median. AQE is enabled with default settings. Which change most directly reduces the runtime?

A) Add more workers to the cluster
B) Reduce `spark.sql.shuffle.partitions`
C) Salt the aggregation key, then aggregate the partial results in a second pass
D) Rely on AQE skew-join handling to split the partition

> [!success]- Answer
> **Correct Answer: C**
>
> Salt the aggregation key, then aggregate the partial results in a second pass.
>
> One hot key overloads a single task. AQE splits skewed partitions only in sort-merge and shuffle-hash **joins**, not in `groupBy` aggregations. More workers leave the giant task on one core, and fewer shuffle partitions make partitions bigger. Salting spreads the hot key across many tasks ([Skew and spill](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page), [AQE](https://docs.databricks.com/aws/en/optimizations/aqe)).

---

## Question 11: Diagnosing Disk Spill *(2026 blueprint)*

**Question** *(Medium)*: A join stage shows large **Spill (Disk)** values and high peak execution memory, with no single straggler task. Which change addresses the cause?

A) Set `spark.sql.shuffle.partitions` to `auto` (or more partitions), or use workers with more memory
B) Disable AQE
C) Increase `spark.default.parallelism` only
D) Run `VACUUM` on the input tables

> [!success]- Answer
> **Correct Answer: A**
>
> Set `spark.sql.shuffle.partitions` to `auto` (or more partitions), or use workers with more memory.
>
> Spill happens when Spark runs low on execution memory during shuffles, joins, sorts, or aggregations. Smaller partitions, less data held per task, or more executor memory reduce it. `spark.default.parallelism` affects RDDs. `VACUUM` doesn't touch execution memory ([Skew and spill](https://docs.databricks.com/aws/en/optimizations/spark-ui-guide/long-spark-stage-page)).

---

## Question 12: Liquid Clustering Keys *(2026 blueprint)*

**Question** *(Medium)*: A team's Delta table uses Liquid Clustering on `event_date`. Query patterns change, and most queries now filter on `customer_id`. What should they do?

A) Rewrite the table with `PARTITIONED BY (customer_id)`
B) Run `ALTER TABLE t CLUSTER BY (customer_id)`, then run `OPTIMIZE` (use `OPTIMIZE ... FULL` to recluster existing data)
C) Run `OPTIMIZE t ZORDER BY (customer_id)`
D) Drop and recreate the table, because clustering keys can't change

> [!success]- Answer
> **Correct Answer: B**
>
> Run `ALTER TABLE t CLUSTER BY (customer_id)`, then run `OPTIMIZE` (use `OPTIMIZE ... FULL` to recluster existing data).
>
> Clustering keys can change at any time without an immediate rewrite. Later `OPTIMIZE` runs and writes use the new keys, and `OPTIMIZE FULL` reclusters all existing data. Clustering isn't compatible with partitioning or `ZORDER` ([liquid clustering](https://docs.databricks.com/aws/en/delta/clustering)).

---

## Question 13: Automatic Liquid Clustering *(2026 blueprint)*

**Question** *(Medium)*: A team wants Databricks to choose and evolve clustering keys from actual query patterns. What do they need?

A) `CLUSTER BY AUTO` on a Unity Catalog managed table with predictive optimization enabled
B) `ZORDER BY AUTO` in a nightly `OPTIMIZE` job
C) Partitioning by every filter column
D) A Spark configuration that enables auto clustering on external tables

> [!success]- Answer
> **Correct Answer: A**
>
> `CLUSTER BY AUTO` on a Unity Catalog managed table with predictive optimization enabled.
>
> Automatic liquid clustering "requires predictive optimization" for key selection and clustering operations. Predictive optimization runs only on UC managed tables ([liquid clustering](https://docs.databricks.com/aws/en/delta/clustering), [predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)).

---

## Question 14: What Predictive Optimization Does *(2026 blueprint)*

**Question** *(Easy)*: Which statement about predictive optimization is correct?

A) It runs `OPTIMIZE`, `VACUUM`, and `ANALYZE` automatically on Unity Catalog managed tables
B) It tunes Spark configurations for every notebook session
C) It applies to external tables and tables received through sharing
D) It runs `OPTIMIZE ... ZORDER BY` on all partitioned tables

> [!success]- Answer
> **Correct Answer: A**
>
> It runs `OPTIMIZE`, `VACUUM`, and `ANALYZE` automatically on Unity Catalog managed tables.
>
> Predictive optimization runs on serverless jobs compute, applies only to UC managed tables, doesn't run `ZORDER`, and can be enabled, disabled, or inherited per catalog, schema, or table. Its history is in `system.storage.predictive_optimization_operations_history` ([predictive optimization](https://docs.databricks.com/aws/en/optimizations/predictive-optimization)).

---

## Question 15: Cluster Fails to Start *(2026 blueprint)*

**Question** *(Medium)*: A classic job cluster terminates during startup with `INIT_SCRIPT_FAILURE`. What should the engineer check first?

A) The Spark UI Stages tab
B) The init script logs, to find why the cluster-scoped script failed (path, permissions, or a failing command)
C) The job's max concurrent runs
D) The Delta transaction log of the output table

> [!success]- Answer
> **Correct Answer: B**
>
> The init script logs, to find why the cluster-scoped script failed (path, permissions, or a failing command).
>
> `INIT_SCRIPT_FAILURE` means a cluster-scoped init script couldn't load or exited non-zero. The Spark UI doesn't exist yet because Spark never started. Other startup codes point to cloud capacity, quota, or subnet issues ([termination error codes](https://docs.databricks.com/aws/en/compute/troubleshooting/cluster-error-codes)).

---

## Question 16: Library Conflict on Shared Compute *(2026 blueprint)*

**Question** *(Medium)*: Two notebooks on the same all-purpose cluster need different versions of a Python library. A compute-scoped install of one version breaks the other notebook. What is the recommended fix?

A) Install each version with notebook-scoped `%pip install pkg==x.y` in the notebook that needs it
B) Install both versions as compute-scoped libraries
C) Install the library with a global init script
D) Copy the library files to DBFS root

> [!success]- Answer
> **Correct Answer: A**
>
> Install each version with notebook-scoped `%pip install pkg==x.y` in the notebook that needs it.
>
> Notebook-scoped libraries take precedence over compute-scoped libraries, which take precedence over Runtime built-ins, and they apply only to that notebook session. Databricks doesn't recommend installing libraries with init scripts, and DBFS library storage is deprecated ([Install libraries](https://docs.databricks.com/aws/en/libraries/)).

---

## Question 17: Driver Out of Memory *(2026 blueprint)*

**Question** *(Medium)*: A notebook crashes with a driver `OutOfMemoryError` on `pdf = spark.table("events").toPandas()`, where `events` has 300 million rows. Adding workers didn't help. What is the right fix?

A) Aggregate or filter in Spark and collect only the small result (or write results to a table)
B) Add even more workers
C) Increase `spark.sql.shuffle.partitions`
D) Enable autoscaling on the cluster

> [!success]- Answer
> **Correct Answer: A**
>
> Aggregate or filter in Spark and collect only the small result (or write results to a table).
>
> `toPandas()` and `collect()` pull every row into driver memory. Workers add executor capacity, not driver memory. Raising `spark.driver.memory` at compute level is a last resort. The real fix is to keep large data distributed ([Spark configuration: driver memory](https://spark.apache.org/docs/latest/configuration.html)).

---

## Question 18: Job Failure Rate Across the Workspace *(2026 blueprint)*

**Question** *(Medium)*: A platform team wants a weekly dashboard of failure rates for every Lakeflow Job over the past 90 days. Which source fits best?

A) The `system.lakeflow.job_run_timeline` system table
B) Each job's matrix view, screenshotted weekly
C) `DESCRIBE HISTORY` on each job's output tables
D) The driver logs of the last run

> [!success]- Answer
> **Correct Answer: A**
>
> The `system.lakeflow.job_run_timeline` system table.
>
> Job run system tables record runs and their result states across the account and can be queried with SQL for dashboards. The UI keeps run history for 60 days, and system tables aren't meant for real-time alerting ([System tables](https://docs.databricks.com/aws/en/admin/system-tables/), [Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)).

---

**[← Previous: Domain 5: Implementing CI/CD](./05-implementing-cicd.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 7: Governance and Security →](./07-governance-and-security.md)**
