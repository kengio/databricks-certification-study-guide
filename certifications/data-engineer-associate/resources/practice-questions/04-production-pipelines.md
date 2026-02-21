# Domain 4: Production Pipelines

[Back to Practice Questions](./README.md) | [Prev: Incremental Processing](03-incremental-processing.md) | [Next: Data Governance](05-data-governance.md)

---

## Question 1: When to Use Cluster Pools

**Question**: When would a data team use cluster pools?

> [!success]- Answer
> When an automated report needs to be refreshed as quickly as possible.
>
> Cluster pools maintain a set of pre-warmed, idle VM instances that can be assigned to clusters immediately on startup. This eliminates the VM provisioning delay (which can take several minutes), reducing cluster startup time to seconds for time-sensitive jobs.

---

## Question 2: Adding an Upstream Task to an Existing Job

**Question**: A data engineer executes a single-task job each morning. Upon discovering an upstream data issue, they must add a new notebook to run before the original task. What is the correct approach to set up this new upstream task?

> [!success]- Answer
> Create a new task in the existing Job, and then add the original task as a dependency of the new task.
>
> In Databricks Jobs, task dependencies are defined by specifying which tasks a given task "depends on." To insert an upstream step, the new task should have no dependencies (runs first), and the original task should be configured to depend on the new task (runs after).

---

## Question 3: Limiting Query Refresh Schedule Duration

**Question**: An engineering manager wants a query to refresh every minute for the first week after a project launch, with no compute costs after that week. What strategy ensures the query stops refreshing and generating costs beyond week one?

> [!success]- Answer
> Set the query's refresh schedule to end on a specific date in the query scheduler.
>
> Databricks SQL query schedulers support an optional end date/time, allowing the refresh to automatically stop once the date is reached. No manual intervention is needed after the initial setup.

---

## Question 4: SQL Endpoint Performance for Concurrent Queries

**Question**: A data analysis team's Databricks SQL queries perform poorly when multiple members execute small queries simultaneously on an always-on SQL endpoint. All queries use the same endpoint. What strategy improves performance?

> [!success]- Answer
> Increase the maximum bound of the SQL endpoint's scaling range.
>
> A SQL endpoint (warehouse) can auto-scale by adding more clusters when concurrent query load increases. Raising the maximum cluster count allows the endpoint to serve more parallel queries simultaneously, reducing wait times during peak concurrent usage.

---

## Question 5: Reducing SQL Endpoint Cost on Daily Dashboard

**Question**: A data engineer sets a Databricks SQL dashboard to refresh daily and wants the related SQL endpoint to run only when needed. What strategy reduces the overall running time of the SQL endpoint?

> [!success]- Answer
> Turn on the Auto Stop feature for the SQL endpoint.
>
> Auto Stop automatically terminates the SQL endpoint after a configurable idle period. After the dashboard refresh completes, the endpoint shuts down automatically — avoiding continuous compute charges during the long idle period between daily refreshes.

---

## Question 6: Webhook Alert for NULL Count

**Question**: A data engineer uses a Databricks SQL dashboard to monitor data quality. When the count of NULL values in a query result reaches 100, the entire team should be alerted via a messaging webhook. What method accomplishes this?

> [!success]- Answer
> Set up an Alert with a new webhook alert destination.
>
> Databricks SQL Alerts monitor query results against a threshold condition and trigger notifications when the condition is met. Webhook destinations allow alerts to be sent to external messaging services (Slack, Microsoft Teams, PagerDuty) in real-time.

---

## Question 7: Diagnosing a Slow Job Task

**Question**: A single Job executes two notebooks as distinct tasks. One notebook is performing slowly during the current Job run. What method can a tech lead use to diagnose the cause?

> [!success]- Answer
> Navigate to the Runs tab in the Jobs UI and click on the active run to review the processing notebook.
>
> Clicking into the active run opens a live view of the notebook execution, including links to the Spark UI for the current task. This allows inspection of active stages, task metrics, shuffle data, and memory usage to identify performance bottlenecks.

---

## Question 8: Faster Cluster Startup for Nightly Jobs

**Question**: A data engineer manages a nightly job with several tasks that run slowly due to long cluster startup times. What action improves cluster startup time?

> [!success]- Answer
> Use clusters from a cluster pool.
>
> Cluster pools pre-provision and maintain idle instances that are immediately available for cluster creation. Tasks using pool-backed clusters skip the VM provisioning step, reducing startup from several minutes to a few seconds.

---

## Question 9: Programmatic Job Schedule Representation

**Question**: A data engineer manages a complex job schedule and wants to represent and submit it to other jobs programmatically rather than manually selecting values in the Databricks scheduling form. Which tool enables this?

> [!success]- Answer
> Cron syntax.
>
> Databricks Jobs support quartz cron expressions for scheduling. Cron strings are compact, human-readable, and can be programmatically constructed and submitted via the Jobs API or embedded in Databricks Asset Bundles YAML configuration files.

---

## Question 10: Job Failure Email Notification

**Question**: What approach should be taken to email the owner of a Databricks Job if it fails?

> [!success]- Answer
> Set up an Alert in the Job's notification settings (Job page).
>
> Databricks Jobs support email notifications for job events (failure, success, or start). The job owner's email address is added directly from the Job's "Notifications" section, requiring no custom code or external alerting systems.

---

## Question 11: Scheduling a Daily SQL Query Refresh

**Question**: An engineering manager reviews a query daily but currently reruns it manually and waits for results. What strategy guarantees the query results are refreshed daily automatically?

> [!success]- Answer
> Schedule the query to refresh every 1 day from the query's page in Databricks SQL.
>
> Databricks SQL provides a built-in scheduler accessible directly from the query editor. Setting a recurring daily refresh interval ensures results are always up-to-date without manual intervention or external orchestration tools.

---

## Question 12: When to Use "Depends On" for a Job Task

**Question**: In what situations should a data engineer choose a task in the "Depends On" field when creating a new Databricks Job task?

> [!success]- Answer
> When another task needs to successfully complete before the new task begins.
>
> The "Depends On" field establishes execution order in a Databricks Job DAG. The new task will only start after all specified upstream tasks have completed successfully. If any dependency fails, the downstream task is skipped.

---

## Question 13: Webhook Alert for Zero-Sales Stores

**Question**: A data engineer tracks store-level records where sales equal zero. When this count exceeds zero, the entire team should be notified via a messaging webhook. What approach accomplishes this?

> [!success]- Answer
> Set up an Alert with a new webhook alert destination.
>
> Configure the alert condition on the query result (value > 0) and point the destination to the team's webhook URL. Databricks SQL Alerts evaluate the query result on each refresh and trigger the webhook notification when the threshold condition is met.

---

## Question 14: Minimizing SQL Endpoint Runtime on Hourly Dashboard

**Question**: A data engineer has an hourly Databricks SQL dashboard whose underlying data is managed by an automated Databricks Job. How can they minimize the total running time of the SQL endpoint during the dashboard's hourly refresh?

> [!success]- Answer
> Turn on the Auto Stop feature for the SQL endpoint.
>
> Auto Stop shuts down the SQL endpoint after a defined idle period following the last query. Since the dashboard only needs the endpoint during the brief refresh window each hour, Auto Stop ensures the endpoint is off for the remaining idle time between refreshes.

---

## Question 15: Persist to Memory and Disk

**Question**: Which Spark method persists data to both memory and disk when memory is insufficient?

> [!success]- Answer
> `persist()` with `StorageLevel.MEMORY_AND_DISK`.
>
> `persist()` allows specifying a `StorageLevel` such as `MEMORY_AND_DISK`, which stores partitions in memory and spills excess to disk when memory is exhausted. `cache()` is a shortcut for `persist(StorageLevel.MEMORY_ONLY)` and does not spill to disk automatically.

---

**[← Previous: Domain 3: Incremental Data Processing](./03-incremental-processing.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 5: Data Governance](./05-data-governance.md) →**
