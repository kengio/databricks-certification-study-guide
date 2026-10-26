---
title: "Practice Questions: Working with Lakeflow Jobs"
type: practice-questions
tags: [data-engineer-associate, practice-questions, working-with-lakeflow-jobs]
---

# Domain 4: Working with Lakeflow Jobs

Exam weight: **16 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: Adding an Upstream Task to an Existing Job

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

## Question 2: Limiting Query Refresh Schedule Duration

**Question** *(Medium)*: An engineering manager wants a query to refresh every minute for the first week after a project launch, with no compute costs after that week. What strategy ensures the query stops refreshing and generating costs beyond week one?

A) Set the SQL warehouse to auto-stop after one week of total runtime
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

## Question 3: Programmatic Job Schedule Representation

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

## Question 4: Scheduling a Daily SQL Query Refresh

**Question** *(Easy)*: An engineering manager reviews a query daily but currently reruns it manually and waits for results. What strategy guarantees the query results are refreshed daily automatically?

A) Schedule the query to refresh every 1 day from the query's page in Databricks SQL
B) Create a Databricks Job that runs the query notebook on a daily cron schedule
C) Set up an Apache Airflow DAG to trigger the query execution daily
D) Use a Lakeflow Declarative Pipelines pipeline with a daily trigger to refresh the query

> [!success]- Answer
> **Correct Answer: A**
>
> Schedule the query to refresh every 1 day from the query's page in Databricks SQL.
>
> Databricks SQL provides a built-in scheduler accessible directly from the query editor. Setting a recurring daily refresh interval ensures results are always up-to-date without manual intervention or external orchestration tools.

---

## Question 5: When to Use "Depends On" for a Job Task

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
> The "Depends On" field establishes execution order in a Databricks Job DAG. The new task will only start after all specified upstream tasks have completed successfully. With the default Run if condition (*All succeeded*), if a dependency fails the downstream task doesn't run and is marked `Upstream failed`.

---

## Question 6: Branching on New Data *(2026 blueprint)*

**Question** *(Medium)*: An ingestion task publishes the number of rows it loaded as a task value. The transformation tasks should run only when that number is greater than zero. Which Lakeflow Jobs feature implements this?

A) A For each task over the task value
B) An If/else condition task comparing `{{tasks.ingest.values.rows_loaded}} > 0`, with transformations depending on its `true` outcome
C) A retry policy on the transformation task
D) Setting max concurrent runs to 0 when no data arrives

> [!success]- Answer
> **Correct Answer: B**
>
> An If/else condition task comparing `{{tasks.ingest.values.rows_loaded}} > 0`, with transformations depending on its `true` outcome.
>
> The If/else task evaluates a boolean expression on two operands (task values, job parameters, literals). Downstream tasks depend on its `(true)` or `(false)` outcome. `>` performs a numeric comparison ([If/else task](https://docs.databricks.com/aws/en/jobs/if-else)).

---

## Question 7: Looping Over Tables *(2026 blueprint)*

**Question** *(Medium)*: The same load notebook must run for 30 source tables, at most five at a time, without defining 30 tasks. Which configuration meets this?

A) A For each task with the table list as input, the notebook as the nested task, and concurrency set to 5
B) Thirty notebook tasks with no dependencies
C) A single notebook task with `max_retries` set to 30
D) A Run Job task pointing at itself

> [!success]- Answer
> **Correct Answer: A**
>
> A For each task with the table list as input, the notebook as the nested task, and concurrency set to 5.
>
> For each runs one nested task once per input element, passing `{{input}}` (or `{{input.<key>}}`). Concurrency defaults to 1, and the nested task can't itself be a For each ([For each task](https://docs.databricks.com/aws/en/jobs/for-each)).

---

## Question 8: Retrying Transient Failures *(2026 blueprint)*

**Question** *(Easy)*: A task that calls an external API fails a few times a week with transient network errors, and succeeds when re-run minutes later. What is the built-in way to handle this?

A) Increase the task timeout
B) Configure a retry policy on the task, with a retry interval
C) Set the job's max concurrent runs to 2
D) Add an If/else task after it

> [!success]- Answer
> **Correct Answer: B**
>
> Configure a retry policy on the task, with a retry interval.
>
> Task-level retries automatically re-run a failed task after the configured interval. A timeout limits how long one attempt may run, and when both are set the timeout applies to each retry. Concurrency and branching don't retry anything ([Configure and edit tasks](https://docs.databricks.com/aws/en/jobs/configure-task)).

---

## Question 9: Cleanup That Always Runs *(2026 blueprint)*

**Question** *(Medium)*: A job's final task drops temporary staging tables. It must run whether the upstream transform succeeds or fails. Which Run if condition should it use?

A) All succeeded
B) At least one succeeded
C) All done
D) All failed

> [!success]- Answer
> **Correct Answer: C**
>
> All done.
>
> *All done* runs the task after all dependencies finish, whatever their status. The default, *All succeeded*, would mark the task `Upstream failed` and skip it when the transform fails. *All failed* runs it only after failures ([Configure task dependencies](https://docs.databricks.com/aws/en/jobs/conditional-tasks)).

---

## Question 10: Processing Files Soon After Unpredictable Drops *(2026 blueprint)*

**Question** *(Medium)*: A partner uploads JSON files to a Unity Catalog external location at unpredictable times: sometimes several an hour, sometimes nothing for a day. Each drop should be processed shortly after it lands, without empty runs or idle compute. Which trigger should the Lakeflow Job use?

A) Scheduled trigger every 5 minutes
B) File arrival trigger on the external location
C) Continuous trigger
D) Manual trigger by an operator

> [!success]- Answer
> **Correct Answer: B**
>
> File arrival trigger on the external location.
>
> A file arrival trigger monitors a UC external location or volume and starts a run only when new files appear. *Wait after last change* can batch bursts into one run. Polling schedules start runs that find nothing, and continuous triggers keep compute running ([file arrival triggers](https://docs.databricks.com/aws/en/jobs/file-arrival-triggers)).

---

## Question 11: Running When Upstream Tables Change *(2026 blueprint)*

**Question** *(Medium)*: A Gold build job must run after **both** `main.silver.orders` and `main.silver.customers` are updated. Those tables are maintained by two other teams' jobs, which run at varying times. Which trigger configuration fits?

A) A table update trigger on both tables with "All tables are updated"
B) A table update trigger on both tables with "Any table is updated"
C) A scheduled trigger at 06:00
D) A file arrival trigger on the tables' storage paths

> [!success]- Answer
> **Correct Answer: A**
>
> A table update trigger on both tables with "All tables are updated".
>
> Table update triggers start a run when monitored UC tables change. With multiple tables, *Trigger when* can be set to **All tables are updated** or **Any table is updated**. The job's Run as principal needs `SELECT` on the tables. File arrival triggers can't target managed table locations ([table update triggers](https://docs.databricks.com/aws/en/jobs/trigger-table-update)).

---

## Question 12: Time-Based vs Data-Driven Triggers *(2026 blueprint)*

**Question** *(Easy)*: A regulatory report must be published at exactly 07:00 every weekday, using whatever data has arrived by then. Which trigger fits best?

A) Scheduled trigger with Quartz cron `0 0 7 ? * MON-FRI`
B) File arrival trigger
C) Table update trigger
D) Continuous trigger

> [!success]- Answer
> **Correct Answer: A**
>
> Scheduled trigger with Quartz cron `0 0 7 ? * MON-FRI`.
>
> When the deadline, not data availability, decides when work runs, a time-based schedule is right. Quartz cron puts seconds first, and `?` goes in day-of-month when day-of-week is constrained. Data-driven triggers fit when work should follow data arrival ([schedules and triggers](https://docs.databricks.com/aws/en/jobs/triggers)).

---

## Question 13: Configuring a Dashboard Task *(2026 blueprint)*

**Question** *(Easy)*: After a pipeline task refreshes Gold tables, an AI/BI dashboard must be refreshed in the same job. Which task configuration achieves this?

A) A Dashboards task that depends on the pipeline task and uses a SQL warehouse
B) A notebook task that calls `display()` on the Gold tables
C) A For each task over the dashboard's widgets
D) A second job with a scheduled trigger 30 minutes later

> [!success]- Answer
> **Correct Answer: A**
>
> A Dashboards task that depends on the pipeline task and uses a SQL warehouse.
>
> Lakeflow Jobs has native task types for notebooks, SQL, dashboards, and pipelines. Making the Dashboards task depend on the pipeline task guarantees the order inside one DAG. A separate job on a fixed delay can run before the data is ready ([Configure and edit tasks](https://docs.databricks.com/aws/en/jobs/configure-task)).

---

## Question 14: Passing a Value Between Tasks *(2026 blueprint)*

**Question** *(Medium)*: Task `ingest` computes the latest order date. Task `report` needs that value. Which code sets it in `ingest`?

A) `dbutils.widgets.text("max_date", value)`
B) `dbutils.jobs.taskValues.set(key="max_date", value=value)`
C) `spark.conf.set("max_date", value)`
D) `dbutils.notebook.exit(value)` in every task

> [!success]- Answer
> **Correct Answer: B**
>
> `dbutils.jobs.taskValues.set(key="max_date", value=value)`.
>
> Task values pass small, JSON-serializable results (up to 48 KiB) between tasks. Downstream tasks read them with `dbutils.jobs.taskValues.get(taskKey="ingest", key="max_date")` or, preferably, the reference `{{tasks.ingest.values.max_date}}` in parameters ([task values](https://docs.databricks.com/aws/en/jobs/task-values)).

---

## Question 15: Reading Quartz Cron *(2026 blueprint)*

**Question** *(Easy)*: A Lakeflow Job schedule uses the Quartz expression `0 30 2 * * ?`. When does it run?

A) Every 30 minutes past 2 o'clock, every hour
B) At 02:30:00 every day
C) At 00:30 on the 2nd of every month
D) Every 2 minutes at second 30

> [!success]- Answer
> **Correct Answer: B**
>
> At 02:30:00 every day.
>
> Quartz fields are seconds, minutes, hours, day-of-month, month, day-of-week, and an optional year. So `0 30 2 * * ?` means second 0, minute 30, hour 2, every day of every month, with no specific day-of-week ([Quartz CronTrigger tutorial](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)).

---

**[← Previous: Domain 3: Data Transformation and Modeling](./03-data-transformation-and-modeling.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 5: Implementing CI/CD →](./05-implementing-cicd.md)**
