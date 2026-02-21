---
title: Scheduling and Triggers
type: study-material
tags:
  - scheduling
  - triggers
  - cron
---

# Scheduling and Triggers

## Overview

Scheduling and triggering mechanisms automate job execution based on time (cron) or external events. Databricks supports cron-based scheduling, event-based triggers, and programmatic run submission.

## Cron Scheduling

### Cron Syntax Overview

```mermaid
flowchart TB
    Minute["Minute<br/>0-59"]
    Hour["Hour<br/>0-23"]
    DayOfMonth["Day of Month<br/>1-31"]
    Month["Month<br/>1-12"]
    DayOfWeek["Day of Week<br/>0-6<br/>0=Sunday"]
    Command["Command"]

    Minute --> Syntax["Cron Expression<br/>M H DOM MON DOW"]
    Hour --> Syntax
    DayOfMonth --> Syntax
    Month --> Syntax
    DayOfWeek --> Syntax
    Syntax --> Command
```text

### Cron Format: `minute hour day_of_month month day_of_week`

| Field | Range | Examples |
|-------|-------|----------|
| Minute | 0-59 | `0`, `15`, `*/15` |
| Hour | 0-23 | `0`, `2`, `9-17` |
| Day of Month | 1-31 | `1`, `15`, `*/2` |
| Month | 1-12 | `1`, `6-8`, `*` |
| Day of Week | 0-6 | `0=Sunday`, `5=Friday`, `1-5=Mon-Fri` |

### Cron Examples

```text
# Daily at 2 AM UTC
0 2 * * * ?

# Every 15 minutes
*/15 * * * * ?

# Monday-Friday at 9 AM
0 9 * * 1-5 ?

# Every hour at the top of the hour
0 * * * * ?

# First day of month at midnight
0 0 1 * * ?

# Every Sunday at 3 PM
0 15 * * 0 ?

# Weekdays (Mon-Fri) at 8 AM and 5 PM
0 8,17 * * 1-5 ?

# Every 6 hours
0 0,6,12,18 * * * ?
```text

### Databricks Cron Format

Databricks uses Quartz Cron, which requires a seconds field:

```text
second minute hour day_of_month month day_of_week ?
```text

### Common Databricks Cron Expressions

```json
{
  "schedule": {
    "quartz_cron_expression": "0 0 2 * * ?",
    "timezone_id": "America/Los_Angeles"
  }
}
```text

| Frequency | Expression | Notes |
|-----------|-----------|-------|
| Every minute | `0 * * * * ?` | High frequency, not recommended |
| Every 5 minutes | `0 */5 * * * ?` | Mid frequency |
| Every hour | `0 0 * * * ?` | Hourly at :00 |
| Daily 2 AM UTC | `0 0 2 * * ?` | Single run per day |
| Business days 9 AM | `0 0 9 * * 1-5 ?` | Mon-Fri |
| Weekly Monday midnight | `0 0 0 * * 1 ?` | Once per week |
| Monthly 1st at midnight | `0 0 0 1 * ?` | Monthly schedule |

## Timezones

### Timezone Configuration

```json
{
  "schedule": {
    "quartz_cron_expression": "0 0 9 * * 1-5 ?",
    "timezone_id": "America/New_York"
  }
}
```text

### Common Timezone IDs

| Timezone | Identifier |
|----------|-----------|
| UTC | `UTC` |
| US Eastern | `America/New_York` |
| US Central | `America/Chicago` |
| US Mountain | `America/Denver` |
| US Pacific | `America/Los_Angeles` |
| UK | `Europe/London` |
| Europe Central | `Europe/Berlin` |
| Asia Tokyo | `Asia/Tokyo` |
| Australia Sydney | `Australia/Sydney` |

## Scheduling Policies

### Max Concurrent Runs

Prevents multiple instances of the same job from running simultaneously:

```json
{
  "name": "daily_load",
  "max_concurrent_runs": 1,
  "schedule": {
    "quartz_cron_expression": "0 0 * * * ?"
  }
}
```text

If a job runs longer than the schedule interval with `max_concurrent_runs: 1`:

- New scheduled runs are skipped
- No queue builds up
- Prevents cascading failures

### Timeout Behavior

```json
{
  "tasks": [
    {
      "timeout_seconds": 3600,  // 1 hour max
      "max_retries": 2
    }
  ]
}
```text

When timeout exceeded:

1. Task is terminated
2. On-failure alerts sent
3. Retry logic triggered (if configured)
4. Overall job run marked as failed

## Event-Based Triggers

### Webhook Triggers

External systems trigger jobs via webhook:

```bash
# Example: Trigger job from CI/CD pipeline
curl -X POST \
  https://databricks-instance.cloud.databricks.com/api/2.1/jobs/run-now \
  -H "Authorization: Bearer <PAT>" \
  -d '{
    "job_id": 123,
    "notebook_params": {
      "environment": "prod",
      "version": "1.2.3"
    }
  }'
```text

### File-Based Triggers

Monitor for new files in cloud storage:

```python
# Check for new files before running (in notebook before main logic)
import os
from datetime import datetime

wait_time = 0
timeout = 300  # 5 minutes

while not os.path.exists("/mnt/data/trigger_file.txt"):
    if wait_time > timeout:
        raise TimeoutError("Trigger file not found")

    dbutils.notebook.run("wait", 60)  # Wait 1 minute
    wait_time += 60

# Continue with main logic
```text

### Object Storage Events (S3, ADLS)

```python
# Databricks can monitor object storage for trigger events
# Setup via Databricks Events API or UI

# When configured, jobs trigger when:
# - New files uploaded to S3/ADLS
# - Specific pattern matches (e.g., *.csv)
# - File size thresholds met
```text

## Scheduling Patterns

### Pattern 1: Daily at Specific Time

```json
{
  "name": "daily_analytics",
  "schedule": {
    "quartz_cron_expression": "0 0 6 * * ?",
    "timezone_id": "America/New_York"
  }
}
```text

Runs once daily at 6 AM Eastern Time.

### Pattern 2: Multiple Times Per Day

```json
{
  "name": "hourly_load",
  "schedule": {
    "quartz_cron_expression": "0 0 * * * ?"
  }
}
```text

Runs every hour at :00.

### Pattern 3: Business Day at Business Hours

```json
{
  "name": "business_hours_refresh",
  "schedule": {
    "quartz_cron_expression": "0 0 9-17 * * 1-5 ?",
    "timezone_id": "America/Chicago"
  }
}
```text

Runs every hour (9 AM - 5 PM) Monday-Friday.

### Pattern 4: Staggered Jobs (Avoid Conflicts)

```json
[
  {
    "name": "region_a_load",
    "schedule": {"quartz_cron_expression": "0 0 * * * ?"}
  },
  {
    "name": "region_b_load",
    "schedule": {"quartz_cron_expression": "0 10 * * * ?"}
  },
  {
    "name": "region_c_load",
    "schedule": {"quartz_cron_expression": "0 20 * * * ?"}
  }
]
```text

Stagger regional loads to distribute compute load.

## Pause and Resume

### Pause Job from UI

In Workflows > Jobs:

1. Click job row
2. Click "Pause" button
3. No new runs scheduled

### Pause via API

```bash
curl -X POST \
  https://databricks-instance.cloud.databricks.com/api/2.1/jobs/pause \
  -H "Authorization: Bearer <PAT>" \
  -d '{"job_id": 123}'
```text

### Resume via API

```bash
curl -X POST \
  https://databricks-instance.cloud.databricks.com/api/2.1/jobs/unpause \
  -H "Authorization: Bearer <PAT>" \
  -d '{"job_id": 123}'
```text

## Manual Trigger

### One-Time Run

```bash
# Run job immediately (ignores schedule)
curl -X POST \
  https://databricks-instance.cloud.databricks.com/api/2.1/jobs/run-now \
  -H "Authorization: Bearer <PAT>" \
  -d '{"job_id": 123}'
```text

### Run with Custom Parameters

```bash
curl -X POST \
  https://databricks-instance.cloud.databricks.com/api/2.1/jobs/run-now \
  -H "Authorization: Bearer <PAT>" \
  -d '{
    "job_id": 123,
    "notebook_params": {
      "date": "2025-01-20",
      "environment": "staging"
    }
  }'
```text

## Scheduling Best Practices

### 1. Avoid Peak Hours When Possible

```json
{
  "schedule": {
    "quartz_cron_expression": "0 0 2 * * ?",  // 2 AM
    "timezone_id": "UTC"
  }
}
```text

Off-peak scheduling reduces contention with interactive users.

### 2. Stagger Interdependent Jobs

```text
Job A: 0 0 * * * ?       // Top of every hour
Job B: 0 15 * * * ?      // 15 min past every hour
Job C: 0 30 * * * ?      // 30 min past every hour
```text

### 3. Set Appropriate Timeouts

```json
{
  "tasks": [
    {
      "timeout_seconds": 3600,  // 1 hour
      "max_retries": 2
    }
  ]
}
```text

Prevents hanging jobs from consuming resources.

### 4. Use Max Concurrent Runs for Safety

```json
{
  "max_concurrent_runs": 1
}
```text

Prevents duplicate processing if previous run still running.

### 5. Different Schedules for Environments

```json
[
  {
    "name": "daily_load_prod",
    "schedule": {"quartz_cron_expression": "0 0 2 * * ?"}
  },
  {
    "name": "daily_load_test",
    "schedule": {"quartz_cron_expression": "0 0 6 * * ?"}
  }
]
```text

Separate schedules by environment prevent cross-environment issues.

## Daylight Saving Time Considerations

When DST changes occur:

- Jobs scheduled with `timezone_id` automatically adjust
- `UTC` timezone unaffected
- Check your scheduled time before/after DST transition
- Document timezone explicitly in job config

## Key Exam Concepts

- **Cron Syntax**: `minute hour day month day_of_week`
- **Quartz Format**: Requires seconds field (7 fields)
- **Timezone**: Affects when cron fires (different regions)
- **Max Concurrent Runs**: Prevents duplicate execution
- **Timeout**: Maximum execution time per task
- **Pause/Resume**: Control scheduling without deleting job
- **Webhooks**: External systems trigger via API
- **Off-Peak**: Schedule during low-demand hours
- **Staggering**: Space jobs to avoid resource contention
- **Daylight Saving**: Automatic adjustment with timezone

---

**[← Back to Workflows](README.md)**

## Use Cases

- **Scheduling and Triggers Implementation**: Incorporating Scheduling and Triggers principles to build scalable and maintainable solutions in Databricks environments.
- **Optimized Scheduling and Triggers Workflows**: Using the advanced capabilities of Scheduling and Triggers to automate processes and reduce manual operational overhead.

## Common Issues & Errors

### 1. Configuration Oversights
**Scenario:** The default settings for Scheduling and Triggers do not scale well with sudden spikes in data volume.
**Fix:** Explicitly define and tune the configuration parameters for Scheduling and Triggers to handle production-scale workloads.

### 2. Integration Bottlenecks
**Scenario:** Connecting Scheduling and Triggers to other downstream components results in unexpected failures.
**Fix:** Ensure that permissions and network access rules are correctly provisioned for Scheduling and Triggers prior to deployment.

