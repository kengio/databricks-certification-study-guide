---
title: "Practice Questions: Production Pipelines"
type: practice-questions
tags: [data-engineer-associate, practice-questions, production-pipelines]
---

# Domain 4: Production Pipelines

## Question 1: When to Use Cluster Pools

**Question** *(Medium)*: When would a data team use cluster pools?

A) When clusters need to share data between concurrent jobs
B) When an automated report needs to be refreshed as quickly as possible
C) When reducing cloud storage costs for intermediate data is the priority
D) When enforcing uniform cluster configurations across all team members

> [!success]- Answer
> **Correct Answer: B**
>
> When an automated report needs to be refreshed as quickly as possible.
>
> Cluster pools maintain a set of pre-warmed, idle VM instances that can be assigned to clusters immediately on startup. This eliminates the VM provisioning delay (which can take several minutes), reducing cluster startup time to seconds for time-sensitive jobs.

---

## Question 2: Adding an Upstream Task to an Existing Job

**Question** *(Medium)*: A data engineer executes a single-task job each morning. Upon discovering an upstream data issue, they must add a new notebook to run before the original task. What is the correct approach to set up this new upstream task?

A) Clone the existing Job and add the new notebook as a second task in the clone
B) Create a separate Job for the new notebook and schedule it to run 30 minutes before the original Job
C) Create a new task in the existing Job, and then add the original task as a dependency of the new task
D) Replace the original task's notebook with a wrapper notebook that runs both notebooks sequentially

> [!success]- Answer
> **Correct Answer: C**
>
> Create a new task in the existing Job, and then add the original task as a dependency of the new task.
>
> In Databricks Jobs, task dependencies are defined by specifying which tasks a given task "depends on." To insert an upstream step, the new task should have no dependencies (runs first), and the original task should be configured to depend on the new task (runs after).

---

## Question 3: Limiting Query Refresh Schedule Duration

**Question** *(Medium)*: An engineering manager wants a query to refresh every minute for the first week after a project launch, with no compute costs after that week. What strategy ensures the query stops refreshing and generating costs beyond week one?

A) Set the SQL endpoint to auto-stop after one week of total runtime
B) Create a Databricks Job to disable the query refresh after seven days
C) Manually cancel the refresh schedule at the end of the week
D) Set the query's refresh schedule to end on a specific date in the query scheduler

> [!success]- Answer
> **Correct Answer: D**
>
> Set the query's refresh schedule to end on a specific date in the query scheduler.
>
> Databricks SQL query schedulers support an optional end date/time, allowing the refresh to automatically stop once the date is reached. No manual intervention is needed after the initial setup.

---

## Question 4: SQL Endpoint Performance for Concurrent Queries

**Question** *(Medium)*: A data analysis team's Databricks SQL queries perform poorly when multiple members execute small queries simultaneously on an always-on SQL endpoint. All queries use the same endpoint. What strategy improves performance?

A) Increase the maximum bound of the SQL endpoint's scaling range
B) Switch from a Pro to a Classic SQL endpoint type
C) Increase the size (T-shirt size) of each individual cluster in the endpoint
D) Enable query result caching on the SQL endpoint

> [!success]- Answer
> **Correct Answer: A**
>
> Increase the maximum bound of the SQL endpoint's scaling range.
>
> A SQL endpoint (warehouse) can auto-scale by adding more clusters when concurrent query load increases. Raising the maximum cluster count allows the endpoint to serve more parallel queries simultaneously, reducing wait times during peak concurrent usage.

---

## Question 5: Reducing SQL Endpoint Cost on Daily Dashboard

**Question** *(Medium)*: A data engineer sets a Databricks SQL dashboard to refresh daily and wants the related SQL endpoint to run only when needed. What strategy reduces the overall running time of the SQL endpoint?

A) Downgrade the SQL endpoint to a smaller cluster size
B) Configure the SQL endpoint to start only during business hours
C) Switch the dashboard to use a shared all-purpose cluster instead
D) Turn on the Auto Stop feature for the SQL endpoint

> [!success]- Answer
> **Correct Answer: D**
>
> Turn on the Auto Stop feature for the SQL endpoint.
>
> Auto Stop automatically terminates the SQL endpoint after a configurable idle period. After the dashboard refresh completes, the endpoint shuts down automatically — avoiding continuous compute charges during the long idle period between daily refreshes.

---

## Question 6: Webhook Alert for NULL Count

**Question** *(Medium)*: A data engineer uses a Databricks SQL dashboard to monitor data quality. When the count of NULL values in a query result reaches 100, the entire team should be alerted via a messaging webhook. What method accomplishes this?

A) Set up an Alert with a new webhook alert destination
B) Add a conditional formatting rule to the dashboard visualization that sends a webhook
C) Create a Databricks Job that polls the query results and calls the webhook via Python
D) Configure a SQL endpoint event hook that triggers on query result thresholds

> [!success]- Answer
> **Correct Answer: A**
>
> Set up an Alert with a new webhook alert destination.
>
> Databricks SQL Alerts monitor query results against a threshold condition and trigger notifications when the condition is met. Webhook destinations allow alerts to be sent to external messaging services (Slack, Microsoft Teams, PagerDuty) in real-time.

---

## Question 7: Diagnosing a Slow Job Task

**Question** *(Medium)*: A single Job executes two notebooks as distinct tasks. One notebook is performing slowly during the current Job run. What method can a tech lead use to diagnose the cause?

A) Check the Databricks SQL query history for slow-running queries
B) Navigate to the Runs tab in the Jobs UI and click on the active run to review the processing notebook
C) Review the cluster event log for resource allocation errors
D) Open the DLT pipeline UI to inspect per-table processing metrics

> [!success]- Answer
> **Correct Answer: B**
>
> Navigate to the Runs tab in the Jobs UI and click on the active run to review the processing notebook.
>
> Clicking into the active run opens a live view of the notebook execution, including links to the Spark UI for the current task. This allows inspection of active stages, task metrics, shuffle data, and memory usage to identify performance bottlenecks.

---

## Question 8: Faster Cluster Startup for Nightly Jobs

**Question** *(Easy)*: A data engineer manages a nightly job with several tasks that run slowly due to long cluster startup times. What action improves cluster startup time?

A) Increase the driver node memory allocation
B) Switch to a single-node cluster to avoid worker provisioning
C) Use clusters from a cluster pool
D) Enable autoscaling with a higher maximum worker count

> [!success]- Answer
> **Correct Answer: C**
>
> Use clusters from a cluster pool.
>
> Cluster pools pre-provision and maintain idle instances that are immediately available for cluster creation. Tasks using pool-backed clusters skip the VM provisioning step, reducing startup from several minutes to a few seconds.

---

## Question 9: Programmatic Job Schedule Representation

**Question** *(Medium)*: A data engineer manages a complex job schedule and wants to represent and submit it to other jobs programmatically rather than manually selecting values in the Databricks scheduling form. Which tool enables this?

A) Databricks Asset Bundles YAML configuration
B) Cron syntax
C) Apache Airflow DAG definitions
D) JSON job templates via the Databricks CLI

> [!success]- Answer
> **Correct Answer: B**
>
> Cron syntax.
>
> Databricks Jobs support quartz cron expressions for scheduling. Cron strings are compact, human-readable, and can be programmatically constructed and submitted via the Jobs API or embedded in Databricks Asset Bundles YAML configuration files.

---

## Question 10: Job Failure Email Notification

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

## Question 11: Scheduling a Daily SQL Query Refresh

**Question** *(Easy)*: An engineering manager reviews a query daily but currently reruns it manually and waits for results. What strategy guarantees the query results are refreshed daily automatically?

A) Schedule the query to refresh every 1 day from the query's page in Databricks SQL
B) Create a Databricks Job that runs the query notebook on a daily cron schedule
C) Set up an Apache Airflow DAG to trigger the query execution daily
D) Use a Delta Live Tables pipeline with a daily trigger to refresh the query

> [!success]- Answer
> **Correct Answer: A**
>
> Schedule the query to refresh every 1 day from the query's page in Databricks SQL.
>
> Databricks SQL provides a built-in scheduler accessible directly from the query editor. Setting a recurring daily refresh interval ensures results are always up-to-date without manual intervention or external orchestration tools.

---

## Question 12: When to Use "Depends On" for a Job Task

**Question** *(Easy)*: In what situations should a data engineer choose a task in the "Depends On" field when creating a new Databricks Job task?

A) When the new task needs to run on a different cluster than other tasks
B) When the new task should only run if a previous task has completed successfully
C) When the new task processes data from a different database than other tasks
D) When another task needs to successfully complete before the new task begins

> [!success]- Answer
> **Correct Answer: D**
>
> When another task needs to successfully complete before the new task begins.
>
> The "Depends On" field establishes execution order in a Databricks Job DAG. The new task will only start after all specified upstream tasks have completed successfully. If any dependency fails, the downstream task is skipped.

---

## Question 13: Webhook Alert for Zero-Sales Stores

**Question** *(Medium)*: A data engineer tracks store-level records where sales equal zero. When this count exceeds zero, the entire team should be notified via a messaging webhook. What approach accomplishes this?

A) Configure a DLT expectation that triggers a webhook when zero-sales records appear
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

## Question 14: Minimizing SQL Endpoint Runtime on Hourly Dashboard

**Question** *(Medium)*: A data engineer has an hourly Databricks SQL dashboard whose underlying data is managed by an automated Databricks Job. How can they minimize the total running time of the SQL endpoint during the dashboard's hourly refresh?

A) Reduce the SQL endpoint cluster size to the smallest available
B) Use a shared all-purpose cluster instead of a SQL endpoint
C) Pre-compute dashboard results in the Databricks Job and cache them
D) Turn on the Auto Stop feature for the SQL endpoint

> [!success]- Answer
> **Correct Answer: D**
>
> Turn on the Auto Stop feature for the SQL endpoint.
>
> Auto Stop shuts down the SQL endpoint after a defined idle period following the last query. Since the dashboard only needs the endpoint during the brief refresh window each hour, Auto Stop ensures the endpoint is off for the remaining idle time between refreshes.

---

## Question 15: Persist to Memory and Disk

**Question** *(Medium)*: Which Spark method persists data to both memory and disk when memory is insufficient?

A) `cache()` with `StorageLevel.MEMORY_ONLY`
B) `checkpoint()` with eager evaluation
C) `persist()` with `StorageLevel.MEMORY_AND_DISK`
D) `broadcast()` with local storage fallback

> [!success]- Answer
> **Correct Answer: C**
>
> `persist()` with `StorageLevel.MEMORY_AND_DISK`.
>
> `persist()` allows specifying a `StorageLevel` such as `MEMORY_AND_DISK`, which stores partitions in memory and spills excess to disk when memory is exhausted. `cache()` is a shortcut for `persist(StorageLevel.MEMORY_ONLY)` and does not spill to disk automatically.

---

**[← Previous: Domain 3: Incremental Data Processing](./03-incremental-processing.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 5: Data Governance](./05-data-governance.md) →**
