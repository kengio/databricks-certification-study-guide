---
title: "Practice Questions: Monitoring and Alerting"
type: practice-questions
tags: [data-engineer-professional, practice-questions, monitoring-alerting]
---

# Section 4: Monitoring and Alerting (10 %)

Practice questions for Section 4 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 4 folder](../../04-monitoring-and-alerting/README.md).

---

## Question 1: System Tables

**Question** *(Easy)*: A data engineer needs to track compute costs by team over the past month. Which system table provides this information?

A) `system.access.audit`  
B) `system.billing.usage`  
C) `system.compute.clusters`  
D) `system.query.history`  

> [!success]- Answer
> **Correct Answer: B**
>
> `system.billing.usage` contains cost and usage data including DBUs consumed. `audit` tracks access events. `clusters` contains cluster metadata. `query.history` tracks SQL queries, not costs.

---

## Question 2: Lakeflow Pipelines Event Log

**Question** *(Easy)*: A Lakeflow pipeline ran with data quality issues. The team needs to find how many records failed expectations. How can this information be retrieved?

A) Query the Delta table directly  
B) Check the Spark UI  
C) Query the pipeline's event log  
D) Review the cluster logs  

> [!success]- Answer
> **Correct Answer: C**
>
> The Lakeflow Pipelines event log contains expectation metrics including passed/failed record counts. Query it using `event_log(TABLE(pipeline))` or access via the system tables. The event log provides detailed pipeline observability.

---

## Question 3: Attribute DBU Spend to Jobs *(2026 blueprint)*

**Question** *(Medium)*: A data engineer must report last month's list cost per job. They join `system.billing.usage` to `system.billing.list_prices` only on `sku_name` and the totals come out several times higher than the invoice. What change fixes the join?

A) Filter `system.billing.usage` to `record_type = 'ORIGINAL'` only  
B) Also join on `cloud` and require `usage_start_time` to fall between `price_start_time` and `price_end_time` (or `price_end_time IS NULL`)  
C) Replace `pricing.default` with `usage_quantity` from `list_prices`  
D) Join to `system.compute.clusters` on `sku_name` instead  

> [!success]- Answer
> **Correct Answer: B**
>
> Join on `cloud`, `sku_name`, and the price validity window.
>
> `list_prices` stores one row per price change, so joining on `sku_name` alone multiplies each usage row by every historical price. The docs join on `cloud`, `sku_name`, and `usage_start_time >= price_start_time AND (usage_end_time <= price_end_time OR price_end_time IS NULL)`, then multiply by `pricing.default`. Filtering to ORIGINAL rows (A) would drop corrections that should be summed. `list_prices` has no `usage_quantity` (C). `compute.clusters` has no prices and no `sku_name` (D).

---

## Question 4: Missing Job Cost in Billing *(2026 blueprint)*

**Question** *(Hard)*: A team notices that several scheduled jobs never appear when they group `system.billing.usage` by `usage_metadata.job_id`, even though `system.lakeflow.job_run_timeline` shows the jobs ran successfully every day. What is the most likely explanation?

A) The jobs ran on all-purpose compute, where `usage_metadata.job_id` is not populated  
B) Billing records for jobs are only written after 365 days  
C) `usage_metadata.job_id` is only populated for jobs triggered by the REST API  
D) The jobs ran in a different region, so `system.billing.usage` cannot see them  

> [!success]- Answer
> **Correct Answer: A**
>
> `job_id` is populated only for jobs on job compute or serverless compute.
>
> The billable usage reference states that `usage_metadata.job_id` and `job_run_id` are populated for serverless jobs and jobs on job compute, but not for jobs run on all-purpose compute. That usage can only be approximated through `cluster_id`. Billing arrives within hours, not after 365 days (B). The trigger type doesn't matter (C). `system.billing.usage` is a global table that covers every region (D).

---

## Question 5: Monitor Failed Pipeline Events from a Script *(2026 blueprint)*

**Question** *(Medium)*: A data engineer writes a Python CI check that must fail when a Lakeflow pipeline logged any ERROR events. They use the Databricks SDK for Python with `w = WorkspaceClient()`. Which call returns those events?

A) `w.jobs.get_run_output(run_id=pipeline_id)`  
B) `w.pipelines.list_updates(pipeline_id=pid, filter="level='ERROR'")`  
C) `w.pipelines.list_pipeline_events(pipeline_id=pid, filter="level='ERROR'")`  
D) `w.pipelines.get(pipeline_id=pid).events`  

> [!success]- Answer
> **Correct Answer: C**
>
> Use `list_pipeline_events` with `filter="level='ERROR'"`.
>
> `list_pipeline_events` (REST `GET /api/2.0/pipelines/{pipeline_id}/events`, CLI `databricks pipelines list-pipeline-events`) supports SQL-like filters such as `level='ERROR'` and `timestamp > '...'`. `list_updates` lists updates and takes no level filter (B). `get_run_output` is for job task runs (A). `GetPipelineResponse` has `state`, `health`, and `latest_updates`, but no `events` attribute (D).

---

## Question 6: Why Did a Task Fail via the Jobs API *(2026 blueprint)*

**Question** *(Medium)*: A multitask job run failed. An engineer calls the Jobs API `runs/get-output` with the job run's `run_id` and gets an error instead of the task's stack trace. What should they do?

A) Use Jobs API 2.0, because 2.2 removed run output  
B) Call `runs/get` for the job run, then call `runs/get-output` with the failed task's `run_id` from `tasks[]`  
C) Call `runs/list` with `expand_tasks=true`, which returns `error_trace`  
D) Read `state.result_state` from `runs/get`, which contains the stack trace  

> [!success]- Answer
> **Correct Answer: B**
>
> Pass the task run ID from `runs/get` to `runs/get-output`.
>
> `runs/get-output` (SDK `get_run_output`) returns the output, `error`, and `error_trace` of a single task run, so you first read `tasks[].run_id` from `runs/get`. Jobs API 2.2 still provides run output (A). `runs/list` returns run metadata, not error traces (C). `state` is deprecated, and its `result_state` is only an enum (D).

---

## Question 7: Branch a Job on an Alert *(2026 blueprint)*

**Question** *(Hard)*: A job refreshes a silver table and then must run a quarantine notebook only when a Databricks SQL alert on null rates is TRIGGERED, and otherwise publish to gold. The engineer adds a SQL alert task, but the quarantine step never runs, even when the alert triggers, because the alert task always shows Succeeded. What should they add?

A) Set `run_if: AT_LEAST_ONE_FAILED` on the quarantine task  
B) An If/else condition task comparing `{{tasks.<alert_task>.output.alert_state}}` to `TRIGGERED`, with quarantine depending on the true outcome and publish on the false outcome  
C) A schedule on the underlying alert so it runs before the job  
D) Increase the alert task's retries so it fails when triggered  

> [!success]- Answer
> **Correct Answer: B**
>
> Add an If/else condition task on `output.alert_state`.
>
> A SQL alert task reports Succeeded whenever evaluation completes, whether or not the alert triggered. It fails only on evaluation errors. The dynamic value `{{tasks.<task>.output.alert_state}}` (UNKNOWN, OK, or TRIGGERED) feeds an If/else task whose dependents use the true and false outcomes. `AT_LEAST_ONE_FAILED` never fires because the task succeeds (A). The alert's own schedule is independent of the job (C). Retries don't change a successful evaluation (D).

---

## Question 8: Schema-Wide Freshness Alerts *(2026 blueprint)*

**Question** *(Medium)*: A platform team wants Slack notifications whenever any table in the `main.sales` schema becomes stale or receives far fewer rows than usual, without writing or maintaining SQL for each table. Which approach fits best?

A) Create one Databricks SQL alert per table on `DESCRIBE HISTORY`  
B) Enable anomaly detection on the schema and create a Data Quality Monitoring alert rule scoped to `main.sales` with a Slack notification destination  
C) Configure a budget in the account console with the schema as a tag filter  
D) Add a duration warning health rule to every job that writes the schema  

> [!success]- Answer
> **Correct Answer: B**
>
> Use anomaly detection with a Data Quality Monitoring alert rule.
>
> Anomaly detection checks freshness and completeness for every table in a schema. Alert rules created in the Data Quality Monitoring UI are scoped to a catalog or schema and notify users or destinations such as Slack, with no SQL to write. A SQL alert per table (A) means manual work for each table. Budgets track spend, not data quality (C). Job duration warnings track run time, not table freshness (D).

---

## Question 9: Interpret Job Run Status *(2026 blueprint)*

**Question** *(Easy)*: In the Lakeflow Jobs UI, a multitask job run shows Succeeded with failures. What does this mean?

A) All tasks succeeded after at least one retry  
B) Some tasks failed, but all leaf tasks succeeded  
C) The run exceeded its duration warning threshold  
D) The run was skipped because of max concurrent runs  

> [!success]- Answer
> **Correct Answer: B**
>
> Some tasks failed, but every leaf task succeeded.
>
> The run outcome is determined by the leaf tasks, the tasks with no downstream dependencies. Succeeded with failures means some tasks failed but all leaf tasks succeeded, and notifications treat it as a success. Retries that eventually succeed show as Succeeded (A). Exceeding a duration threshold triggers a warning, not a status (C). A run blocked by concurrency limits is Skipped (D).

---

## Question 10: Find the Slow Phase of a Job Run *(2026 blueprint)*

**Question** *(Medium)*: A scheduled job on classic compute has recently started finishing 15 minutes later than usual, even though its code and data volume are unchanged. In the Jobs UI, where can an engineer quickly see whether the extra time is spent queueing, waiting for compute, installing libraries, or running?

A) The run breakdown shown when hovering the run's Duration on the job run details page  
B) The Spark UI event timeline of the driver  
C) The Top 5 error types table on the Runs tab  
D) The `system.billing.usage` table filtered by `job_run_id`  

> [!success]- Answer
> **Correct Answer: A**
>
> Hover the run's Duration to see the run breakdown by phase.
>
> The job run details page breaks Duration into Queued, Waiting for resources, Library installation, and Running, for both job runs and task runs. The Spark UI (B) only covers execution inside Spark. The Top 5 error types table (C) summarizes failures. Billing (D) shows DBUs, not a timing breakdown.

---

**[← Previous: Data Manipulation](./03-data-manipulation.md) | [↑ Back to Practice Questions](./README.md) | [Next: Cost & Performance Optimization →](./05-cost-performance.md)**
