---
title: "Practice Questions: Databricks Tooling"
type: practice-questions
tags: [data-engineer-professional, practice-questions, databricks-tooling]
---

# Practice Questions - Section 02: Databricks Tooling (20%)

## Question 2.1: dbutils.widgets

**Scenario**: A notebook needs to accept a date parameter that defaults to yesterday's date when not provided.

**Question** *(Easy)*: Which code correctly creates this widget?

A) `dbutils.widgets.text("date", str(date.today() - timedelta(days=1)))`
B) `dbutils.widgets.dropdown("date", str(date.today() - timedelta(days=1)), [])`
C) `dbutils.widgets.create("date", default=str(date.today() - timedelta(days=1)))`
D) `dbutils.widgets.parameter("date", str(date.today() - timedelta(days=1)))`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.widgets.text(name, defaultValue)` creates a text input widget with a default value. Option B requires a list of choices. Options C and D are not valid methods.

---

## Question 2.2: %run Magic Command

**Scenario**: A main notebook needs to call a utility notebook and use variables defined in it.

**Question** *(Easy)*: Which statement is true about `%run`?

A) Variables from the called notebook are not accessible in the calling notebook
B) `%run` executes the notebook asynchronously
C) Variables from the called notebook are available in the calling notebook's scope
D) `%run` can only be used with notebooks in the same folder

> [!success]- Answer
> **Correct Answer: C**
>
> `%run` executes the notebook in the current notebook's context, making all variables and functions available. It runs synchronously and can reference notebooks using relative or absolute paths.

---

## Question 2.3: Databricks CLI Authentication

**Scenario**: A CI/CD pipeline needs to authenticate with Databricks using a service principal.

**Question** *(Medium)*: Which environment variables should be set?

A) `DATABRICKS_HOST` and `DATABRICKS_TOKEN`
B) `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, and `DATABRICKS_CLIENT_SECRET`
C) `DATABRICKS_URL` and `DATABRICKS_API_KEY`
D) `DATABRICKS_WORKSPACE` and `DATABRICKS_PAT`

> [!success]- Answer
> **Correct Answer: B**
>
> Service principal authentication requires the workspace host URL, client ID (application ID), and client secret. Option A is for PAT token authentication. Options C and D use invalid variable names.

---

## Question 2.4: Jobs API Run Now

**Scenario**: A data engineer needs to trigger a job via API with custom parameters.

**Question** *(Easy)*: Which API endpoint and method should be used?

A) `POST /api/2.1/jobs/run-now`
B) `GET /api/2.1/jobs/trigger`
C) `POST /api/2.0/jobs/start`
D) `PUT /api/2.1/jobs/execute`

> [!success]- Answer
> **Correct Answer: A**
>
> `POST /api/2.1/jobs/run-now` triggers a job run with optional parameter overrides. This is the current Jobs API version. The other endpoints don't exist.

---

## Question 2.5: Cluster Types

**Scenario**: A production ETL job runs daily for 2 hours. Cost optimization is a priority.

**Question** *(Medium)*: Which cluster configuration is most cost-effective?

A) All-purpose cluster running 24/7
B) Job cluster created for each run
C) All-purpose cluster with auto-termination
D) Serverless cluster

> [!success]- Answer
> **Correct Answer: B**
>
> Job clusters are created for the job run and terminated after completion. They have lower DBU rates (~60% less than all-purpose) and only incur costs during execution. All-purpose clusters cost more and may have idle time even with auto-termination.

---

## Question 2.6: Unity Catalog Volumes vs DBFS

**Scenario**: A team needs to store raw data files that will be governed by Unity Catalog.

**Question** *(Easy)*: Which storage option should they use?

A) DBFS root storage
B) Mounted cloud storage
C) Unity Catalog Volume
D) Workspace files

> [!success]- Answer
> **Correct Answer: C**
>
> Unity Catalog Volumes provide governed file storage with access controls, auditing, and lineage. DBFS and mounts are legacy approaches without UC governance. Workspace files are for notebooks and small files, not data.

---

**[← Previous: Practice Questions - Section 01: Data Processing](./01-data-processing.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 03: Data Modeling](./03-data-modeling.md) →**
