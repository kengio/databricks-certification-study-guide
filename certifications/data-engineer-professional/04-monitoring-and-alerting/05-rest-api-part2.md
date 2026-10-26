---
title: Databricks REST API — Part 2 (Monitoring with SDK, REST & CLI; Permissions, SQL & Error Handling)
type: study-material
tags:
  - data-engineer-professional
  - api
  - sdk
  - monitoring
status: published
---

# Databricks REST API — Part 2: Monitoring with SDK, REST & CLI; Permissions, SQL & Error Handling

## Overview

This part shows how to monitor and analyze Lakeflow Jobs and Lakeflow Pipelines programmatically with the Databricks SDK for Python, the REST API, and the Databricks CLI. It then covers the Permissions API, the SQL Statement Execution API, error handling, and rate limits. For API basics, authentication, and the Jobs, Clusters, DBFS, and Workspace APIs, see [Part 1](./05-rest-api-part1.md).

> [!abstract]
>
> - The same operations exist in three interfaces: SDK method (`w.jobs.list_runs`), REST endpoint (`GET /api/2.2/jobs/runs/list`), and CLI command (`databricks jobs list-runs`).
> - Jobs monitoring uses `list_runs`, `get_run`, and `get_run_output`. Pipelines monitoring uses `list_pipelines`, `get`, `list_updates`, `get_update`, and `list_pipeline_events`.
> - Run health comes from `status.state` and `status.termination_details` (the `state` object is deprecated), plus the duration fields (`queue_duration`, `setup_duration`, `execution_duration`, `cleanup_duration`, `run_duration`, all in milliseconds).
> - The SDK handles authentication, pagination (`next_page_token`), and waiting (`run_now_and_wait`, `.result()`) for you.

> [!tip] What the Exam Tests
>
> - "Use Databricks REST APIs / CLI and SDK for monitoring and analyzing jobs and pipelines."
> - Mapping a monitoring need (active runs, failed runs since yesterday, why a run failed, pipeline errors, update history) to the right method, endpoint, or command and its filter parameters.
> - Knowing the current Jobs API version (2.2), its pagination behavior, and the per-endpoint rate limits that affect polling scripts.

> [!note] Platform update (Oct 2026)
> Databricks recommends **Jobs API 2.2** for new and existing clients. Version 2.2 enables queueing by default, removes `has_more` from list responses (check for `next_page_token` instead), and paginates arrays longer than 100 elements in `jobs/get` and `jobs/runs/get`. Part 1 shows `/api/2.1/` paths for the Jobs API. Source: [Updating from Jobs API 2.1 to 2.2](https://docs.databricks.com/aws/en/reference/jobs-api-2-2-updates)

---

## Monitoring Jobs and Pipelines: SDK, REST, and CLI

### Interface map

| Need | Python SDK (`w = WorkspaceClient()`) | REST endpoint | Databricks CLI |
| :--- | :--- | :--- | :--- |
| List runs (filters: job, active/completed, time range, run type) | `w.jobs.list_runs(...)` | `GET /api/2.2/jobs/runs/list` | `databricks jobs list-runs --job-id ... --active-only` |
| One run with task details and repair history | `w.jobs.get_run(run_id, include_history=True)` | `GET /api/2.2/jobs/runs/get` | `databricks jobs get-run RUN_ID --include-history` |
| Output or error of one **task** run | `w.jobs.get_run_output(run_id)` | `GET /api/2.2/jobs/runs/get-output` | `databricks jobs get-run-output RUN_ID` |
| Trigger and wait | `w.jobs.run_now_and_wait(job_id, timeout=...)` | `POST /api/2.2/jobs/run-now`, then poll `runs/get` | `databricks jobs run-now JOB_ID` |
| Find pipelines | `w.pipelines.list_pipelines(filter="name LIKE '%x%'")` | `GET /api/2.0/pipelines` | `databricks pipelines list-pipelines --filter ...` |
| Pipeline state and health | `w.pipelines.get(pipeline_id)` | `GET /api/2.0/pipelines/{pipeline_id}` | `databricks pipelines get PIPELINE_ID` |
| Pipeline update history | `w.pipelines.list_updates(pipeline_id)` | `GET /api/2.0/pipelines/{pipeline_id}/updates` | `databricks pipelines list-updates PIPELINE_ID` |
| One pipeline update | `w.pipelines.get_update(pipeline_id, update_id)` | `GET /api/2.0/pipelines/{pipeline_id}/updates/{update_id}` | `databricks pipelines get-update PIPELINE_ID UPDATE_ID` |
| Pipeline event log entries | `w.pipelines.list_pipeline_events(pipeline_id, filter=...)` | `GET /api/2.0/pipelines/{pipeline_id}/events` | `databricks pipelines list-pipeline-events PIPELINE_ID --filter ...` |

### Databricks SDK for Python: jobs

The SDK (`pip install databricks-sdk`) is in Beta and is fine to use in production. Databricks recommends pinning the minor version. `WorkspaceClient()` with no arguments uses Databricks unified authentication: environment variables, a `.databrickscfg` profile, or default notebook authentication when the code runs inside a Databricks notebook.

```python
from datetime import datetime, timedelta, timezone

from databricks.sdk import WorkspaceClient

w = WorkspaceClient()
job_id = 123456
since_ms = int((datetime.now(timezone.utc) - timedelta(days=1)).timestamp() * 1000)

# Completed runs of one job in the last 24 hours (the iterator follows next_page_token)
for run in w.jobs.list_runs(job_id=job_id, completed_only=True, start_time_from=since_ms):
    details = run.status.termination_details if run.status else None
    print(
        run.run_id,
        run.status.state.value if run.status else None,      # e.g. TERMINATED
        details.code.value if details and details.code else None,  # e.g. RUN_EXECUTION_ERROR
        (run.run_duration or 0) / 1000,                      # seconds, includes repairs
        run.run_page_url,
    )

# Runs still in flight (QUEUED, PENDING, RUNNING, or TERMINATING)
active = list(w.jobs.list_runs(job_id=job_id, active_only=True))
```

```python
# Drill into one run: per-task status and time breakdown
run = w.jobs.get_run(run_id=987654321, include_history=True)
print("queued ms:", run.queue_duration, "total ms:", run.run_duration)

for task in run.tasks or []:
    print(
        task.task_key,
        task.status.state.value if task.status else None,
        task.setup_duration, task.execution_duration, task.cleanup_duration,  # ms
    )

# Why did a task fail? get_run_output takes a TASK run_id
failed = [t for t in run.tasks or []
          if t.status and t.status.termination_details
          and t.status.termination_details.type
          and t.status.termination_details.type.value != "SUCCESS"]
for t in failed:
    out = w.jobs.get_run_output(run_id=t.run_id)
    print(t.task_key, out.error, out.error_trace)
```

```python
# Trigger a job and block until it finishes (default timeout is 20 minutes)
finished = w.jobs.run_now_and_wait(job_id=job_id, timeout=timedelta(minutes=60))
print(finished.status.state, finished.status.termination_details)

# Equivalent: run_now returns a Wait object, and .result() blocks
finished = w.jobs.run_now(job_id=job_id).result(timeout=timedelta(minutes=60))
```

Key `Run` fields for monitoring:

| Field | Meaning |
| :--- | :--- |
| `status.state` | `QUEUED`, `PENDING`, `BLOCKED`, `WAITING`, `RUNNING`, `TERMINATING`, `TERMINATED` |
| `status.termination_details.code` | Why it ended: `SUCCESS`, `SUCCESS_WITH_FAILURES`, `USER_CANCELED`, `CANCELED`, `SKIPPED`, `RUN_EXECUTION_ERROR`, `CLUSTER_ERROR`, `DRIVER_ERROR`, `LIBRARY_INSTALLATION_ERROR`, `MAX_CONCURRENT_RUNS_EXCEEDED`, `WORKSPACE_RUN_LIMIT_EXCEEDED`, `UNAUTHORIZED_ERROR`, `INTERNAL_ERROR`, ... |
| `status.termination_details.type` | `SUCCESS`, `CLIENT_ERROR`, `INTERNAL_ERROR`, `CLOUD_FAILURE` |
| `state` (**deprecated**) | `life_cycle_state` (`PENDING`, `RUNNING`, `TERMINATED`, `SKIPPED`, `INTERNAL_ERROR`, ...) and `result_state` (`SUCCESS`, `FAILED`, `TIMEDOUT`, `CANCELED`, `UPSTREAM_FAILED`, ...) |
| `start_time`, `end_time` | Epoch milliseconds. `end_time` is `0` while the run is still running. |
| `queue_duration`, `setup_duration`, `execution_duration`, `cleanup_duration` | Milliseconds. For multitask runs the job-level setup, execution, and cleanup durations are `0`, so read them per task. |
| `run_duration` | Milliseconds for the job run **and all of its repairs** |
| `tasks[]` | Per-task `task_key`, `run_id`, `status`, durations, `attempt_number` |
| `repair_history` | Returned when you request `include_history=True` |
| `run_page_url`, `trigger`, `run_type` | Link to the UI, what triggered the run, and `JOB_RUN` / `SUBMIT_RUN` / `WORKFLOW_RUN` |

`get_run_output` returns the first 5 MB of a **task** run's output: `notebook_output.result` (the `dbutils.notebook.exit()` value), `error`, `error_trace`, `logs`, and `sql_output`. For a SQL alert task, `alert_output.alert_state` gives the evaluated alert state. Runs are removed after **60 days**, so export or copy anything you need longer. For account-wide history up to 365 days, query `system.lakeflow.job_run_timeline` instead.

### Databricks SDK for Python: pipelines

```python
w = WorkspaceClient()

# Find a pipeline by name (filters: name LIKE '...' or notebook='<path>')
pipeline = next(iter(w.pipelines.list_pipelines(filter="name LIKE '%orders%'")))
pid = pipeline.pipeline_id

# Current state and health
p = w.pipelines.get(pipeline_id=pid)
print(p.state, p.health)            # e.g. IDLE / RUNNING / FAILED, HEALTHY / UNHEALTHY
for u in p.latest_updates or []:
    print(u.update_id, u.state, u.creation_time)

# Update history: list_updates returns ListUpdatesResponse (not an iterator)
resp = w.pipelines.list_updates(pipeline_id=pid, max_results=25)
for u in resp.updates or []:
    print(u.update_id, u.state.value if u.state else None, u.cause, u.full_refresh)

# Errors and warnings from the event log
for ev in w.pipelines.list_pipeline_events(
    pipeline_id=pid,
    filter="level in ('ERROR', 'WARN') AND timestamp > '2026-10-25T00:00:00Z'",
    order_by=["timestamp desc"],
):
    print(ev.timestamp, ev.level, ev.event_type, ev.message)
```

| Pipeline object | Values to know |
| :--- | :--- |
| `GetPipelineResponse.state` | `IDLE`, `DEPLOYING`, `STARTING`, `RUNNING`, `STOPPING`, `RECOVERING`, `RESETTING`, `FAILED`, `DELETED` |
| `GetPipelineResponse.health` | `HEALTHY`, `UNHEALTHY` |
| `UpdateInfo.state` | `QUEUED`, `CREATED`, `WAITING_FOR_RESOURCES`, `INITIALIZING`, `RESETTING`, `SETTING_UP_TABLES`, `RUNNING`, `STOPPING`, `COMPLETED`, `FAILED`, `CANCELED` |
| `PipelineEvent` | `id`, `timestamp`, `level` (`INFO`, `WARN`, `ERROR`, `METRICS`), `event_type`, `message`, `error`, `origin` |
| `list_pipeline_events` filter | `level='ERROR'`, `level in ('INFO','WARN')`, `id='<event-id>'`, `timestamp > 'TIMESTAMP'`, combinable with `AND` |

> [!tip]
> The events API returns the same records as the pipeline **event log**. For SQL analytics over many updates (expectation pass/fail counts, flow progress, lineage), query the event log table instead. See [Lakeflow Event Logs](./02-lakeflow-event-logs.md).

### REST API equivalents

```bash
HOST="https://<workspace-url>"

# Active runs of a job (limit is 1-25, default 20; page with page_token)
curl -s -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/2.2/jobs/runs/list?job_id=123456&active_only=true&limit=25"

# Completed runs since a UTC epoch-millisecond timestamp
curl -s -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/2.2/jobs/runs/list?job_id=123456&completed_only=true&start_time_from=1761436800000"

# One run with repair history
curl -s -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/2.2/jobs/runs/get?run_id=987654321&include_history=true"

# Output and error of one task run
curl -s -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/2.2/jobs/runs/get-output?run_id=987654322"

# Pipeline updates and ERROR events (URL-encode the filter)
curl -s -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/2.0/pipelines/<pipeline-id>/updates?max_results=25"
curl -s -G -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "filter=level='ERROR'" --data-urlencode "max_results=50" \
  "$HOST/api/2.0/pipelines/<pipeline-id>/events"
```

Pagination: list endpoints return `next_page_token` (and `prev_page_token` for jobs). Pass it back as `page_token`. In Jobs API 2.2 there is no `has_more` field, so "no `next_page_token`" means "no more results". The `offset` parameter is deprecated in favor of `page_token`.

### Databricks CLI equivalents

```bash
# Jobs
databricks jobs list-runs --job-id 123456 --active-only
databricks jobs list-runs --job-id 123456 --completed-only --start-time-from 1761436800000
databricks jobs get-run 987654321 --include-history
databricks jobs get-run-output 987654322

# Pipelines (resource commands)
databricks pipelines list-pipelines --filter "name LIKE '%orders%'"
databricks pipelines get <pipeline-id>
databricks pipelines list-updates <pipeline-id> --max-results 25
databricks pipelines get-update <pipeline-id> <update-id>
databricks pipelines list-pipeline-events <pipeline-id> --filter "level='ERROR'" --max-results 50

# Pipelines (project commands, using the pipeline KEY from the bundle YAML)
databricks pipelines history my_pipeline --start-time 2026-10-25T00:00:00Z
databricks pipelines logs my_pipeline --level ERROR,METRICS --event-type update_progress
```

`databricks pipelines logs` shows the events of the most recent update by default. Use `--update-id`, `--level`, `--event-type`, `--start-time`/`--end-time`, and `-n` to narrow it.

### Choosing the interface

| Situation | Best fit |
| :--- | :--- |
| Python automation, CI checks, or polling until done | SDK (typed objects, auto-pagination, built-in waiters, retries) |
| Shell scripts, ad hoc checks, CI steps without Python | CLI (one command per operation, scriptable) |
| Non-Python clients or tools that only speak HTTP | REST API |
| Account-wide history, trends, or cost (beyond 60 days, across jobs) | System tables (`system.lakeflow.*`), not the API |

---

## Permissions API 2.0

### Get permissions

```bash
# Get job permissions
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/jobs/123456' \
  -H "Authorization: Bearer $TOKEN"

# Get cluster permissions
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/clusters/1234-567890-abc' \
  -H "Authorization: Bearer $TOKEN"
```

### Set permissions

```bash
curl -X PATCH \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/jobs/123456' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "access_control_list": [
      {
        "user_name": "user@company.com",
        "permission_level": "CAN_MANAGE_RUN"
      },
      {
        "group_name": "data-engineers",
        "permission_level": "CAN_VIEW"
      }
    ]
  }'
```

### Permission levels

| Resource | Levels |
| :--- | :--- |
| Jobs | `CAN_VIEW`, `CAN_MANAGE_RUN`, `IS_OWNER`, `CAN_MANAGE` |
| Lakeflow pipelines | `CAN_VIEW`, `CAN_RUN`, `CAN_MANAGE`, `IS_OWNER` |
| Clusters | `CAN_ATTACH_TO`, `CAN_RESTART`, `CAN_MANAGE` (`CAN_VIEW` is in Beta) |
| Notebooks | `CAN_READ` (shown as CAN VIEW in the UI), `CAN_RUN`, `CAN_EDIT`, `CAN_MANAGE` |

To monitor a job you need at least `CAN_VIEW`. To see a run's Spark UI and logs, or to cancel or run it, you need `CAN_MANAGE_RUN`.

## SQL Statement Execution API

Execute SQL statements on SQL warehouses:

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/sql/statements' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "warehouse_id": "abc123def456",
    "statement": "SELECT * FROM main.default.my_table LIMIT 100",
    "wait_timeout": "30s"
  }'
```

```python
# Using the SDK
statement = w.statement_execution.execute_statement(
    warehouse_id="abc123def456",
    statement="SELECT * FROM main.default.my_table LIMIT 100",
    wait_timeout="30s",
)

for row in statement.result.data_array:
    print(row)
```

This is also how an external tool can query `system.lakeflow.*` or `system.billing.*` for monitoring data without a notebook.

## Error Handling

### HTTP status codes

| Code | Meaning |
| :--- | :--- |
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |

### Error response format

```json
{
  "error_code": "RESOURCE_DOES_NOT_EXIST",
  "message": "Job 123456 does not exist"
}
```

### Common error codes

| Error Code | Meaning |
| :--- | :--- |
| `INVALID_PARAMETER_VALUE` | Invalid request parameter |
| `RESOURCE_DOES_NOT_EXIST` | Job, cluster, or notebook not found |
| `RESOURCE_ALREADY_EXISTS` | Name conflict |
| `PERMISSION_DENIED` | Insufficient access |
| `QUOTA_EXCEEDED` | Resource limits reached |
| `TEMPORARILY_UNAVAILABLE` | Service temporarily down |

For 500-level errors from the Jobs API, Databricks recommends retrying for up to 10 minutes, with at least 30 seconds between retries.

### Python error handling

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.errors import NotFound, PermissionDenied

w = WorkspaceClient()

try:
    job = w.jobs.get(job_id=999999)
except NotFound:
    print("Job not found")
except PermissionDenied:
    print("Access denied")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Rate Limiting

### Jobs and Pipelines API limits (per workspace, fixed)

| Endpoint | Limit |
| :--- | :--- |
| `/jobs/runs/get` | 100 requests per second |
| `/jobs/runs/list` | 30 requests per second |
| `/jobs/runs/get-output` | 20 requests per second |
| `/jobs/run-now`, `/jobs/create`, `/jobs/get`, `/jobs/list` | 20 requests per second each |
| `/jobs/runs/submit` | 35 requests per second |
| `/jobs/runs/repair` | 5 requests per second |
| Pipelines API `GET` | 150 requests per second |
| Pipelines API `POST` / `PUT` / `DELETE` | 50 requests per second |

These limits are marked **Fixed**, which means Databricks cannot raise them on request. A dashboard that polls `runs/get` for hundreds of runs every second can hit them. Use backoff, poll less often, or move to system tables for history.

### Handling rate limits

```python
import time
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

def call_with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if "429" in str(e):  # Rate limited
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")

# Usage
result = call_with_retry(lambda: list(w.jobs.list()))
```

## Use Cases

### Automated job deployment

```python
from databricks.sdk import WorkspaceClient

def deploy_job(w, job_config):
    """Deploy or update a job based on configuration."""
    existing_jobs = list(w.jobs.list(name=job_config["name"]))

    if existing_jobs:
        job_id = existing_jobs[0].job_id
        w.jobs.reset(job_id=job_id, new_settings=job_config)
        return job_id
    job = w.jobs.create(**job_config)
    return job.job_id
```

### Failure report for the last 24 hours

```python
from datetime import datetime, timedelta, timezone

def failed_runs_last_day(w, job_id):
    """Return (run_id, termination code, URL) for runs that did not succeed."""
    since_ms = int((datetime.now(timezone.utc) - timedelta(days=1)).timestamp() * 1000)
    report = []
    for run in w.jobs.list_runs(job_id=job_id, completed_only=True, start_time_from=since_ms):
        details = run.status.termination_details if run.status else None
        if details and details.code and details.code.value != "SUCCESS":
            report.append((run.run_id, details.code.value, run.run_page_url))
    return report
```

### Pipeline health check in CI

```python
def assert_pipeline_healthy(w, pipeline_id):
    p = w.pipelines.get(pipeline_id=pipeline_id)
    errors = list(w.pipelines.list_pipeline_events(
        pipeline_id=pipeline_id, filter="level='ERROR'", max_results=10))
    if (p.health and p.health.value == "UNHEALTHY") or errors:
        raise RuntimeError(f"{p.name}: {len(errors)} recent ERROR events")
```

## Common Issues & Errors

### Polling a run shows `state` but the code expects `status`

**Cause:** `state` (`life_cycle_state` / `result_state`) is deprecated in favor of `status` (`state` plus `termination_details`).

**Fix:** read `run.status.state` and `run.status.termination_details.code`. Keep any `state` handling only for older clients.

### `get_run_output` fails on a multitask job run

**Cause:** the endpoint takes a **task** run ID, not the parent job run ID.

**Fix:** call `get_run` first, then pass each `tasks[i].run_id` to `get_run_output`.

### Script only sees 20 runs, or stops paging

**Cause:** `limit` defaults to 20 (maximum 25), and Jobs API 2.2 removed `has_more`.

**Fix:** follow `next_page_token` until it is absent, or use the SDK iterator, which pages for you.

### Old runs return 400 or are missing

**Cause:** runs are automatically removed after 60 days.

**Fix:** export run results, or query `system.lakeflow.job_run_timeline` (365 days).

### Invalid token format

**Cause:** the token doesn't start with `dapi`, or it is malformed.

**Fix:** regenerate the personal access token under Settings > Developer > Access tokens, or use OAuth through a CLI profile.

### Workspace URL with a trailing slash

**Cause:** a doubled slash breaks the API path.

```text
Wrong:   https://adb-xxx.azuredatabricks.net//api/2.2/jobs/list
Correct: https://adb-xxx.azuredatabricks.net/api/2.2/jobs/list
```

## Exam Tips

> [!tip]
>
> - **Jobs API is 2.2** (Databricks recommends it for new and existing clients). The Pipelines API is `/api/2.0/pipelines`.
> - **Monitor runs:** `list_runs` / `runs/list` / `jobs list-runs` with `job_id`, `active_only` or `completed_only`, `start_time_from` and `start_time_to` (epoch ms), and `run_type`.
> - **Diagnose a run:** `get_run` (per-task `status`, durations, `include_history`) and then `get_run_output` with a **task** `run_id` (`error`, `error_trace`, `notebook_output.result`).
> - **`status` replaces `state`.** `termination_details.code` tells you why the run ended.
> - **Pipelines:** `get` (state, health, latest updates), `list_updates` / `get_update` (update states), and `list_pipeline_events` with `filter="level='ERROR'"`.
> - **Pagination:** `page_token` / `next_page_token`. `limit` for runs/list is 1–25. The SDK auto-paginates.
> - **Retention:** API run history lasts 60 days. Use `system.lakeflow` tables for 365-day account-wide analysis.
> - **Authentication:** `Authorization: Bearer <token>`. The SDK and CLI use unified auth (profiles, env vars, notebook context).

## Key Takeaways

- **Three interfaces, one API:** every SDK method maps to a REST endpoint and a CLI command (`w.jobs.list_runs` = `GET /api/2.2/jobs/runs/list` = `databricks jobs list-runs`).
- **Jobs monitoring fields:** `status.state`, `status.termination_details.{code,type,message}`, `start_time` and `end_time` (epoch ms), the duration fields (ms), `tasks[]`, and `run_page_url`.
- **Pipelines monitoring:** pipeline `state` and `health`, update `state` (`COMPLETED`, `FAILED`, `CANCELED`, ...), and events with `level`, `event_type`, and `message`.
- **The SDK** handles authentication, pagination, retries, and waiting (`run_now_and_wait`, `Wait.result()`), so it's the preferred way to script monitoring.
- **Rate limits are per endpoint and fixed** (for example, `runs/get` 100/s, `runs/list` 30/s, Pipelines `GET` 150/s). Back off on 429 responses.
- **Permission levels:** jobs use `CAN_VIEW` / `CAN_MANAGE_RUN` / `IS_OWNER` / `CAN_MANAGE`, and pipelines use `CAN_VIEW` / `CAN_RUN` / `CAN_MANAGE` / `IS_OWNER`.

## Related Topics

- [Databricks REST API — Part 1](./05-rest-api-part1.md) - Authentication and the core Jobs, Clusters, DBFS, and Workspace APIs
- [Databricks CLI — Part 1](./04-databricks-cli-part1.md) - CLI installation, profiles, and jobs commands
- [Databricks CLI — Part 2](./04-databricks-cli-part2.md) - Output formats and scripting patterns
- [System Tables](./01-system-tables.md) - Account-wide job and pipeline history in `system.lakeflow`
- [Lakeflow Event Logs](./02-lakeflow-event-logs.md) - Event log schema behind `list_pipeline_events`
- [Lakeflow Jobs — Part 2](../01-developing-code-for-data-processing/08-lakeflow-jobs-part2.md) - Jobs UI monitoring and notifications
- [CI/CD Integration — Part 1](../08-debugging-and-deploying/05-cicd-integration-part1.md) - Using the API in pipelines

## Official Documentation

- [Databricks REST API reference](https://docs.databricks.com/api/workspace/introduction)
- [Jobs API: List job runs](https://docs.databricks.com/api/workspace/jobs/listruns)
- [Jobs API: Get a single job run](https://docs.databricks.com/api/workspace/jobs/getrun)
- [Updating from Jobs API 2.1 to 2.2](https://docs.databricks.com/aws/en/reference/jobs-api-2-2-updates)
- [Pipelines API: List pipeline events](https://docs.databricks.com/api/workspace/pipelines/listpipelineevents)
- [Pipelines API: List pipeline updates](https://docs.databricks.com/api/workspace/pipelines/listupdates)
- [Databricks SDK for Python](https://docs.databricks.com/aws/en/dev-tools/sdk-python)
- [SDK reference: `w.jobs`](https://databricks-sdk-py.readthedocs.io/en/latest/workspace/jobs/jobs.html)
- [SDK reference: `w.pipelines`](https://databricks-sdk-py.readthedocs.io/en/latest/workspace/pipelines/pipelines.html)
- [CLI reference: jobs command group](https://docs.databricks.com/aws/en/dev-tools/cli/reference/jobs-commands)
- [CLI reference: pipelines command group](https://docs.databricks.com/aws/en/dev-tools/cli/reference/pipelines-commands)
- [Resource limits (API rate limits)](https://docs.databricks.com/aws/en/resources/limits)
- [Access control lists](https://docs.databricks.com/aws/en/security/auth/access-control/)
- [Monitor Lakeflow Jobs](https://docs.databricks.com/aws/en/jobs/monitor)

---

**[← Previous: Databricks REST API — Part 1: Jobs, Clusters, DBFS & Workspace APIs](./05-rest-api-part1.md) | [↑ Back to Section](./README.md) | [Next: Streaming Monitoring & Optimization →](./06-streaming-monitoring-optimization.md)**
