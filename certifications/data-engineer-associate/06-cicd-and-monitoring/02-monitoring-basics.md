---
title: Monitoring Basics
type: study-material
tags:
  - data-engineer-associate
  - monitoring
  - lakeflow-jobs
  - system-tables
  - spark-ui
status: published
---

# Monitoring Basics

## Overview

Three layers an associate-level DE should know how to monitor:

1. **Lakeflow Jobs UI + notifications** — per-job run state, success / failure / duration alerts, retries
2. **Spark UI** — reading task / stage / shuffle metrics to diagnose a slow or failing run
3. **System tables** — querying `system.lakeflow.*`, `system.access.*`, `system.billing.*` for SQL-driven dashboards on usage, audit, and cost

> [!abstract]
>
> - **Lakeflow Jobs notifications** — email + webhook (Slack, PagerDuty, generic HTTP) on success / failure / duration
> - **Repair runs** — re-run only the failed tasks of a Lakeflow Job, not the whole DAG
> - **Spark UI** — Stages, Tasks, SQL, Storage, Environment, Executors tabs — start with the failed stage
> - **System tables** — refresh on a delay (minutes to ~1 hour); queryable via DBSQL

> [!tip] What the Exam Tests
>
> - How to set up notifications on a Lakeflow Job
> - When to use **Repair run** vs a fresh run
> - Reading the Spark UI's stages tab to identify the slowest stage
> - The system-table family names and the kind of data each contains

---

## Lakeflow Jobs notifications

Configure per-job in the Jobs UI under **Notifications** or in YAML (Asset Bundle):

```yaml
resources:
  jobs:
    orders_ingest:
      name: orders_ingest
      email_notifications:
        on_success:  [data-team@example.com]
        on_failure:  [data-team@example.com, oncall@example.com]
        on_duration_warning_threshold_exceeded: [oncall@example.com]
      webhook_notifications:
        on_failure:
          - id: pagerduty-webhook   # configured under Notification destinations
      timeout_seconds: 1800   # auto-fail if a run exceeds 30 min
```

## Repair runs

When a multi-task Lakeflow Job fails on task 4 of 6:

| Option | Re-runs |
| :--- | :--- |
| **Repair run** | Just the failed task (and its descendants), reusing the upstream artifacts |
| **Run now** (new run) | The whole DAG from task 1 |

Use **Repair run** when upstream tasks completed successfully and you don't want to pay to re-run them.

## Spark UI — diagnosing slowness

A typical fault-finding flow:

1. **Stages tab** → sort by Duration → find the slowest stage
2. Click into the stage → check **Task duration distribution** (look for outliers / skew)
3. Check the **Shuffle Read** + **Shuffle Write** numbers — large shuffles suggest a join needs broadcasting or a different partitioning
4. Check the **SQL** tab → click the query → see the physical plan (`Exchange`, `BroadcastHashJoin`, `SortMergeJoin`)
5. If GC time is high → memory pressure → consider larger workers or fewer partitions in the worst stage

## System tables you should know

| Table | What it contains |
| :--- | :--- |
| `system.lakeflow.job_run_timeline` | Per-job-run history with start / end / status / cluster / cost |
| `system.lakeflow.job_task_run_timeline` | Per-task-of-a-run history |
| `system.access.audit` | Every UC access decision (GRANT / SELECT / etc.) |
| `system.access.table_lineage` | Table-to-table read/write lineage |
| `system.billing.usage` | DBU usage per workspace / cluster / job |
| `system.compute.clusters` | Cluster history with creator / config |

Example query — last 24 h failed jobs:

```sql
SELECT job_id, run_id, start_time, end_time, result_state
FROM system.lakeflow.job_run_timeline
WHERE start_time >= current_timestamp - INTERVAL 24 HOURS
  AND result_state = 'FAILED'
ORDER BY start_time DESC;
```

## Use Cases

- **On-call alerting** — Slack webhook on job failure routes to the team channel
- **Cost dashboard** — DBSQL dashboard over `system.billing.usage` showing daily DBU spend per workspace
- **Audit reporting** — query `system.access.audit` to satisfy compliance "who accessed table X" requests
- **Performance triage** — Spark UI to find the slowest stage in a failed job
- **Capacity planning** — historical job-duration trends inform cluster-sizing decisions

## Common Issues & Errors

- **No notification destination configured** — failure happens, no one is paged
- **Misreading Spark UI shuffle metrics** — a 50 GB shuffle isn't always bad; a *skewed* shuffle is
- **System-table latency surprises** — events from 5 minutes ago may not appear; tune dashboard refresh accordingly
- **Repair-running with stale code** — repair re-runs use the *current* notebook source; if you've already pushed a fix, repair will pick it up

## Exam Tips

> [!tip]
>
> - **Repair run** re-runs only failed tasks (+ their descendants). It's the cost-saver vs **Run now**.
> - The Spark UI **Stages** tab is the first place to look for slowness — sort by duration.
> - System tables refresh on a *delay* (minutes to ~1 hour). Don't expect real-time data.
> - Webhook notifications go through the workspace's **Notification destinations** — set those up first.

## Key Takeaways

- Three monitoring layers: Lakeflow Jobs notifications, Spark UI, system tables
- Repair runs save cost vs full re-runs
- Spark UI Stages tab is the fault-finding starting point
- System tables live under `system.lakeflow.*`, `system.access.*`, `system.billing.*`, `system.compute.*`

## Related Topics

- [Asset Bundles and Git Folders](./01-asset-bundles-and-git-folders.md)
- [DE Associate — Workflows & Orchestration](../04-workflows-orchestration/03-job-monitoring.md)
- [DE Pro — Monitoring and Alerting (deeper)](../../data-engineer-professional/04-monitoring-and-alerting/README.md)
- [DE Pro — Spark UI debugging](../../data-engineer-professional/06-debugging-and-deploying/07-spark-ui-debugging.md)

## Official Documentation

- [Lakeflow Jobs notifications](https://docs.databricks.com/en/jobs/notifications.html)
- [Repair a job run](https://docs.databricks.com/en/jobs/repair-job-failures.html)
- [System tables documentation](https://docs.databricks.com/en/admin/system-tables/index.html)
- [Spark UI overview](https://docs.databricks.com/en/optimizations/spark-ui-guide/index.html)

---

**[← Previous: Asset Bundles and Git Folders](./01-asset-bundles-and-git-folders.md) | [↑ Back to CI/CD and Monitoring](./README.md)**
