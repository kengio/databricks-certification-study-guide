---
title: REST API — Part 1 (Jobs, Clusters, DBFS & Workspace APIs)
type: topic
tags:
  - data-engineering
  - api
  - automation
status: published
---

# Databricks REST API — Part 1: Jobs, Clusters, DBFS & Workspace APIs

The Databricks REST API provides programmatic access to workspace resources for automation, integration, and custom tooling. This part covers API basics, authentication, Jobs API, Clusters API, DBFS API, Workspace API, and Secrets API.

## Overview

```mermaid
flowchart TB
    Client[API Client] --> Auth[Authentication]
    Auth --> API[REST API]

    API --> Jobs["Jobs API 2.1"]
    API --> Clusters["Clusters API 2.0"]
    API --> DBFS["DBFS API 2.0"]
    API --> Workspace["Workspace API 2.0"]
    API --> Secrets["Secrets API 2.0"]
    API --> UC["Unity Catalog API"]

    Jobs --> Create[Create/Update Jobs]
    Jobs --> Run[Run Jobs]
    Jobs --> Monitor[Monitor Runs]
```

## API Basics

### Base URL

```text
https://<workspace-url>/api/<version>/<endpoint>

Examples:
https://adb-1234567890.12.azuredatabricks.net/api/2.1/jobs/list
https://adb-1234567890.12.azuredatabricks.net/api/2.0/clusters/list
```

### API Versions

| Version | Endpoints | Status |
| :--- | :--- | :--- |
| 2.0 | Clusters, DBFS, Workspace, Secrets | Stable |
| 2.1 | Jobs (enhanced) | Current |
| 2.2 | SQL Statements | Current |

## Authentication

### Personal Access Token (PAT)

```bash
# Bearer token authentication

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/list' \
  -H 'Authorization: Bearer dapi1234567890abcdef'
```

### Python SDK Authentication

```python
from databricks.sdk import WorkspaceClient

# Using environment variables (recommended)
# DATABRICKS_HOST and DATABRICKS_TOKEN

w = WorkspaceClient()

# Explicit configuration

w = WorkspaceClient(
    host="https://adb-xxx.azuredatabricks.net",
    token="dapi1234567890abcdef"
)

# Using config profile

w = WorkspaceClient(profile="production")
```

### OAuth (Service Principal)

```python
from databricks.sdk import WorkspaceClient

# Service principal authentication

w = WorkspaceClient(
    host="https://adb-xxx.azuredatabricks.net",
    client_id="your-client-id",
    client_secret="your-client-secret"
)
```

## Jobs API 2.1

The Jobs API manages job definitions and runs.

### List Jobs

```bash
# List all jobs

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/list' \
  -H 'Authorization: Bearer $TOKEN'

# List with pagination

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/list?limit=25&offset=0' \
  -H 'Authorization: Bearer $TOKEN'
```

```python
# Python SDK

from databricks.sdk import WorkspaceClient

w = WorkspaceClient()
for job in w.jobs.list():
    print(f"{job.job_id}: {job.settings.name}")
```

### Get Job Details

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/get?job_id=123456' \
  -H 'Authorization: Bearer $TOKEN'
```

```python
job = w.jobs.get(job_id=123456)
print(job.settings.name)
print(job.settings.tasks)
```

### Create Job

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/create' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My ETL Job",
    "tasks": [{
      "task_key": "extract_task",
      "notebook_task": {
        "notebook_path": "/Users/user/etl/extract",
        "base_parameters": {
          "date": "2024-01-01"
        }
      },
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "num_workers": 2,
        "node_type_id": "Standard_DS3_v2"
      }
    }],
    "schedule": {
      "quartz_cron_expression": "0 0 8 * * ?",
      "timezone_id": "America/New_York"
    }
  }'
```

```python
from databricks.sdk.service.jobs import Task, NotebookTask, JobCluster

job = w.jobs.create(
    name="My ETL Job",
    tasks=[
        Task(
            task_key="extract_task",
            notebook_task=NotebookTask(
                notebook_path="/Users/user/etl/extract",
                base_parameters={"date": "2024-01-01"}
            ),
            new_cluster={
                "spark_version": "14.3.x-scala2.12",
                "num_workers": 2,
                "node_type_id": "Standard_DS3_v2"
            }
        )
    ]
)
print(f"Created job: {job.job_id}")
```

### Job Task Types

```mermaid
flowchart LR
    Task[Task Types] --> Notebook[notebook_task]
    Task --> Python[python_wheel_task]
    Task --> Spark[spark_python_task]
    Task --> SQL[sql_task]
    Task --> DLT[pipeline_task]
    Task --> DBT[dbt_task]
```

| Task Type | Use Case | Key Fields |
|-----------|----------|------------|
| `notebook_task` | Run notebook | `notebook_path`, `base_parameters` |
| `spark_python_task` | Run Python file | `python_file`, `parameters` |
| `python_wheel_task` | Run Python wheel | `package_name`, `entry_point` |
| `sql_task` | Run SQL query | `query`, `warehouse_id` |
| `pipeline_task` | Run DLT pipeline | `pipeline_id` |
| `dbt_task` | Run dbt project | `project_directory`, `commands` |

### Run Job (run-now)

Trigger an existing job immediately:

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/run-now' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "job_id": 123456,
    "notebook_params": {
      "date": "2024-01-15",
      "env": "prod"
    }
  }'
```

```python
run = w.jobs.run_now(
    job_id=123456,
    notebook_params={"date": "2024-01-15", "env": "prod"}
)
print(f"Run ID: {run.run_id}")
```

### Submit One-Time Run (runs/submit)

Create and run a job without saving the job definition:

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/runs/submit' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "run_name": "One-time ETL",
    "tasks": [{
      "task_key": "main",
      "notebook_task": {
        "notebook_path": "/Users/user/one_time_job"
      },
      "new_cluster": {
        "spark_version": "14.3.x-scala2.12",
        "num_workers": 1,
        "node_type_id": "Standard_DS3_v2"
      }
    }]
  }'
```

### run-now vs runs/submit

| Feature | run-now | runs/submit |
|---------|---------|-------------|
| Requires existing job | Yes | No |
| Job definition saved | Yes | No |
| Use case | Production scheduled jobs | Ad-hoc runs, testing |
| Parameter override | Yes | Define inline |
| Appears in job run history | Yes | No (separate runs list) |

### Get Run Status

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/runs/get?run_id=789012' \
  -H 'Authorization: Bearer $TOKEN'
```

```python
run = w.jobs.get_run(run_id=789012)
print(f"State: {run.state.life_cycle_state}")
print(f"Result: {run.state.result_state}")
```

### Run States

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> RUNNING
    RUNNING --> TERMINATING
    TERMINATING --> TERMINATED
    TERMINATED --> [*]

    RUNNING --> INTERNAL_ERROR
    INTERNAL_ERROR --> [*]

    PENDING --> SKIPPED
    SKIPPED --> [*]
```

| Life Cycle State | Meaning |
|-----------------|---------|
| PENDING | Run queued, waiting for resources |
| RUNNING | Actively executing |
| TERMINATING | Finishing up |
| TERMINATED | Completed |
| SKIPPED | Skipped due to conditions |
| INTERNAL_ERROR | Platform error |

| Result State | Meaning |
|--------------|---------|
| SUCCESS | Completed successfully |
| FAILED | Task failed |
| TIMEDOUT | Exceeded timeout |
| CANCELED | Manually canceled |

### Cancel Run

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/runs/cancel' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"run_id": 789012}'
```

```python
w.jobs.cancel_run(run_id=789012)
```

### Update Job

```bash
# Reset entire job configuration

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/reset' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "job_id": 123456,
    "new_settings": {
      "name": "Updated Job Name",
      "tasks": [...]
    }
  }'

# Partial update

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/update' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "job_id": 123456,
    "new_settings": {
      "name": "New Name Only"
    }
  }'
```

### Delete Job

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.1/jobs/delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"job_id": 123456}'
```

## Clusters API 2.0

### List Clusters

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/list' \
  -H 'Authorization: Bearer $TOKEN'
```

```python
for cluster in w.clusters.list():
    print(f"{cluster.cluster_id}: {cluster.cluster_name} ({cluster.state})")
```

### Get Cluster Details

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/get?cluster_id=1234-567890-abc' \
  -H 'Authorization: Bearer $TOKEN'
```

### Create Cluster

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/create' \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "cluster_name": "my-cluster",
    "spark_version": "14.3.x-scala2.12",
    "node_type_id": "Standard_DS3_v2",
    "num_workers": 2,
    "autotermination_minutes": 60,
    "spark_conf": {
      "spark.speculation": "true"
    },
    "custom_tags": {
      "team": "data-engineering"
    }
  }'
```

```python
cluster = w.clusters.create(
    cluster_name="my-cluster",
    spark_version="14.3.x-scala2.12",
    node_type_id="Standard_DS3_v2",
    num_workers=2,
    autotermination_minutes=60
).result()  # Wait for creation
print(f"Cluster ID: {cluster.cluster_id}")
```

### Cluster Operations

```bash
# Start cluster

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/start' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"cluster_id": "1234-567890-abc"}'

# Restart cluster

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/restart' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"cluster_id": "1234-567890-abc"}'

# Terminate cluster

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"cluster_id": "1234-567890-abc"}'

# Permanently delete

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/clusters/permanent-delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"cluster_id": "1234-567890-abc"}'
```

### Cluster States

| State | Description |
|-------|-------------|
| PENDING | Being created |
| RUNNING | Ready for use |
| RESTARTING | Restarting |
| RESIZING | Changing size |
| TERMINATING | Shutting down |
| TERMINATED | Stopped |
| ERROR | Failed to start |

## DBFS API 2.0

### List Files

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/list?path=/data/' \
  -H 'Authorization: Bearer $TOKEN'
```

### Read File

```bash
# Read file (base64 encoded, max 1MB)

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/read?path=/data/sample.txt&offset=0&length=1000' \
  -H 'Authorization: Bearer $TOKEN'
```

### Upload File

For files larger than 1MB, use the streaming upload API:

```bash
# Create upload handle

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/create' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"path": "/data/large_file.csv", "overwrite": true}'

# Response: {"handle": 123456789}

# Add blocks (repeat for each chunk, max 1MB per block)

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/add-block' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"handle": 123456789, "data": "base64_encoded_data"}'

# Close handle

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/close' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"handle": 123456789}'
```

### File Operations

```bash
# Create directory

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/mkdirs' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"path": "/data/new_folder/"}'

# Delete file/directory

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"path": "/data/temp/", "recursive": true}'

# Move file

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/dbfs/move' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"source_path": "/old/path.csv", "destination_path": "/new/path.csv"}'
```

## Workspace API 2.0

### List Workspace

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/workspace/list?path=/Users/user/' \
  -H 'Authorization: Bearer $TOKEN'
```

### Export Notebook

```bash
# Export as SOURCE format

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/workspace/export?path=/Users/user/notebook&format=SOURCE' \
  -H 'Authorization: Bearer $TOKEN'

# Response contains base64 encoded content

```

### Import Notebook

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/workspace/import' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    "path": "/Users/user/new_notebook",
    "format": "SOURCE",
    "language": "PYTHON",
    "content": "base64_encoded_content",
    "overwrite": true
  }'
```

### Delete Workspace Object

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/workspace/delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"path": "/Users/user/old_notebook", "recursive": false}'
```

## Secrets API 2.0

### List Scopes

```bash
curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/secrets/scopes/list' \
  -H 'Authorization: Bearer $TOKEN'
```

### Create Scope

```bash
curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/secrets/scopes/create' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"scope": "my-scope"}'
```

### Manage Secrets

```bash
# List secrets (names only)

curl -X GET \
  'https://adb-xxx.azuredatabricks.net/api/2.0/secrets/list?scope=my-scope' \
  -H 'Authorization: Bearer $TOKEN'

# Put secret

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/secrets/put' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{
    "scope": "my-scope",
    "key": "db-password",
    "string_value": "secret123"
  }'

# Delete secret

curl -X POST \
  'https://adb-xxx.azuredatabricks.net/api/2.0/secrets/delete' \
  -H 'Authorization: Bearer $TOKEN' \
  -d '{"scope": "my-scope", "key": "db-password"}'
```

> **Continue reading:** [Part 2 — Permissions, SQL, Error Handling & Use Cases](./03-rest-api-part2.md)

---

**[← Previous: Databricks CLI — Part 2](./02-databricks-cli-part2.md) | [↑ Back to Databricks Tooling](./README.md) | [Next: Databricks REST API — Part 2 (Permissions, SQL, Error Handling & Use Cases)](./03-rest-api-part2.md) →**
