---
title: Databricks REST API — Part 2 (Permissions, SQL, Error Handling & Use Cases)
type: topic
tags:
  - data-engineering
  - api
  - automation
status: published
---

# Databricks REST API — Part 2: Permissions, SQL, Error Handling & Use Cases

> For API basics, authentication, Jobs API, Clusters API, DBFS API, and Workspace API, see [Part 1](./03-rest-api-part1.md).

This part covers the Permissions API, SQL Statement Execution API, error handling, rate limiting, automation use cases, and common issues.

## Permissions API 2.0

### Get Permissions

```bash
# Get job permissions

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/jobs/123456' \
  -H 'Authorization: Bearer $TOKEN'

# Get cluster permissions

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/clusters/1234-567890-abc' \
  -H 'Authorization: Bearer $TOKEN'
```

### Set Permissions

```bash
curl -X PATCH \
  'https://adb-xxx.azuredatabricks.net/api/2.0/permissions/jobs/123456' \
  -H 'Authorization: Bearer $TOKEN' \
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

### Permission Levels

| Resource | Levels |
| :--- | :--- |
| Jobs | CAN_VIEW, CAN_MANAGE_RUN, IS_OWNER |
| Clusters | CAN_ATTACH_TO, CAN_RESTART, CAN_MANAGE |
| Notebooks | CAN_READ, CAN_RUN, CAN_EDIT, CAN_MANAGE |

## SQL Statement Execution API 2.2

Execute SQL statements on SQL warehouses:

```bash
# Execute SQL

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/sql/statements' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    "warehouse_id": "abc123def456",
    "statement": "SELECT * FROM main.default.my_table LIMIT 100",
    "wait_timeout": "30s"
  }'
```

```python
# Using SDK

statement = w.statement_execution.execute_statement(
    warehouse_id="abc123def456",
    statement="SELECT * FROM main.default.my_table LIMIT 100",
    wait_timeout="30s"
)

# Get results

for row in statement.result.data_array:
    print(row)
```

## Error Handling

### HTTP Status Codes

| Code | Meaning |
| :--- | :--- |
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |

### Error Response Format

```json
{
  "error_code": "RESOURCE_DOES_NOT_EXIST",
  "message": "Job 123456 does not exist"
}
```

### Common Error Codes

| Error Code | Meaning |
| :--- | :--- |
| INVALID_PARAMETER_VALUE | Invalid request parameter |
| RESOURCE_DOES_NOT_EXIST | Job/cluster/notebook not found |
| RESOURCE_ALREADY_EXISTS | Name conflict |
| PERMISSION_DENIED | Insufficient access |
| QUOTA_EXCEEDED | Resource limits reached |
| TEMPORARILY_UNAVAILABLE | Service temporarily down |

### Python Error Handling

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

### Default Limits

| Endpoint | Rate Limit |
| :--- | :--- |
| Most endpoints | 100 requests/minute |
| Jobs run-now | 1000 runs/hour |
| Cluster create | 10/minute |

### Handling Rate Limits

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

result = call_with_retry(lambda: w.jobs.list())
```

## Use Cases

### Automated Job Deployment

```python
from databricks.sdk import WorkspaceClient
from databricks.sdk.service.jobs import Task, NotebookTask

def deploy_job(w, job_config):
    """Deploy or update a job based on configuration."""
    # Check if job exists
    existing_jobs = [j for j in w.jobs.list() if j.settings.name == job_config["name"]]

    if existing_jobs:
        # Update existing job
        job_id = existing_jobs[0].job_id
        w.jobs.reset(job_id=job_id, new_settings=job_config)
        return job_id
    else:
        # Create new job
        job = w.jobs.create(**job_config)
        return job.job_id
```

### Monitoring Job Runs

```python
import time

def wait_for_run(w, run_id, timeout_seconds=3600):
    """Wait for job run to complete."""
    start_time = time.time()

    while True:
        run = w.jobs.get_run(run_id=run_id)
        state = run.state.life_cycle_state

        if state == "TERMINATED":
            return run.state.result_state
        elif state in ["INTERNAL_ERROR", "SKIPPED"]:
            raise Exception(f"Run failed: {state}")

        if time.time() - start_time > timeout_seconds:
            raise TimeoutError("Run timed out")

        time.sleep(30)

# Usage

run = w.jobs.run_now(job_id=123456)
result = wait_for_run(w, run.run_id)
print(f"Run completed with: {result}")
```

## Common Issues & Errors

### Invalid Token Format

**Scenario:** Token doesn't start with `dapi` or is malformed.

**Fix:** Regenerate PAT from Databricks UI: Settings > Developer > Access tokens.

### Workspace URL Trailing Slash

**Scenario:** API calls fail due to URL formatting.

```bash
# Wrong

https://adb-xxx.azuredatabricks.net//api/2.0/jobs/list

# Correct

https://adb-xxx.azuredatabricks.net/api/2.0/jobs/list
```

### JSON Encoding Issues

**Scenario:** Special characters break JSON payload.

**Fix:** Properly escape strings or use SDK:

```python
import json

payload = json.dumps({"name": "Job with \"quotes\""})
```

### Cluster Not Running for Job

**Scenario:** Job fails because cluster is terminated.

**Fix:** Use `new_cluster` for job clusters or ensure existing cluster is running:

```python
# Check cluster state before running

cluster = w.clusters.get(cluster_id="xxx")
if cluster.state != "RUNNING":
    w.clusters.start(cluster_id="xxx")
    # Wait for startup...
```

## Exam Tips

1. **API versions** - Jobs API is 2.1, most others are 2.0
2. **run-now vs submit** - `run-now` triggers existing job, `submit` is one-time
3. **Run states** - Know PENDING → RUNNING → TERMINATED flow
4. **Result states** - SUCCESS, FAILED, TIMEDOUT, CANCELED
5. **Authentication** - Bearer token header format: `Authorization: Bearer <token>`
6. **Permission levels** - Different resources have different permission hierarchies
7. **Rate limits** - 100 req/min default, use exponential backoff for 429s
8. **DBFS upload** - Files >1MB need streaming (create/add-block/close)
9. **Error codes** - RESOURCE_DOES_NOT_EXIST, INVALID_PARAMETER_VALUE common
10. **SDK vs REST** - SDK handles pagination, retries automatically

## Key Takeaways

- **Jobs API version**: the Jobs API is v2.1; most other APIs (clusters, workspace, DBFS, permissions) are v2.0
- **`run-now` vs `submit`**: `POST /api/2.1/jobs/run-now` triggers an existing persistent job; `POST /api/2.1/jobs/runs/submit` creates a one-time run that does not persist as a job
- **Job run lifecycle**: PENDING → RUNNING → TERMINATED; result states are SUCCESS, FAILED, TIMEDOUT, or CANCELED
- **Authentication header**: `Authorization: Bearer <token>`; tokens must start with `dapi` for Personal Access Tokens
- **HTTP status codes**: 400 (bad request / invalid parameters), 401 (unauthorized), 403 (forbidden / permission denied), 404 (resource not found), 429 (rate limited)
- **Rate limiting**: default is ~100 requests/minute; handle 429 responses with exponential backoff; the SDK handles retries automatically
- **Databricks SDK for Python** (`WorkspaceClient`) wraps REST calls and handles pagination, retries, and authentication automatically — preferred over raw `curl` for scripting
- **Permission levels differ by resource**: Jobs use CAN_VIEW / CAN_MANAGE_RUN / IS_OWNER; clusters use CAN_ATTACH_TO / CAN_RESTART / CAN_MANAGE; notebooks use CAN_READ / CAN_RUN / CAN_EDIT / CAN_MANAGE

## Related Topics

- [Databricks CLI — Part 1](02-databricks-cli-part1.md) - CLI wraps REST API
- [CI/CD Integration](../06-testing-deployment/02-cicd-integration-part1.md) - API in pipelines
- [Asset Bundles](../06-testing-deployment/01-asset-bundles-part1.md) - IaC for Databricks

## Official Documentation

- [Databricks REST API Reference](https://docs.databricks.com/api/workspace/introduction)
- [Jobs API 2.1](https://docs.databricks.com/api/workspace/jobs)
- [Clusters API](https://docs.databricks.com/api/workspace/clusters)
- [Databricks SDK for Python](https://docs.databricks.com/dev-tools/sdk-python.html)

---

**[← Previous: REST API — Part 1 (Jobs, Clusters, DBFS & Workspace APIs)](./03-rest-api-part1.md) | [↑ Back to Databricks Tooling](./README.md) | [Next: Databricks Compute](./04-databricks-compute.md) →**
