# Mock Exam - Section 2: Databricks Tooling (Questions 19-30)

[Back to Exam Overview](./README.md) | [Previous: Data Processing](01-data-processing.md) | [Next: Data Modeling](03-data-modeling.md)

---

## Question 19

**Scenario**: A data engineer is creating a notebook that should accept runtime parameters for the environment (dev, staging, prod) and a date range. The notebook will be called both interactively during development and by a scheduled job.

**Question**: Which approach correctly implements parameterization for both use cases?

A) Use `dbutils.widgets.text()` with defaults that can be overridden by job parameters
B) Use environment variables set at cluster startup
C) Use `spark.conf.get()` to read parameters from cluster configuration
D) Hard-code values and create separate notebooks for each environment

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.widgets` creates parameters with defaults for interactive use that can be overridden when called from jobs using the notebook task parameters. Option B requires cluster configuration. Option C requires cluster-level settings. Option D is unmaintainable.

---

## Question 20

**Scenario**: A notebook needs to execute SQL queries and store the results in a Python variable for further processing. The data engineer wants to use the most appropriate magic command.

**Question**: Which approach correctly captures SQL results in a Python variable?

A) Use `%sql` and reference the `_sqldf` variable
B) Use `%sql` with `INTO :variable_name` syntax
C) Use `spark.sql()` and assign to a variable
D) Use `%run` to execute a SQL notebook and capture results

> [!success]- Answer
> **Correct Answer: C**
>
> `spark.sql("SELECT ...")` returns a DataFrame that can be assigned to a variable for further processing in Python. This is the recommended programmatic approach. Option A's `_sqldf` does exist in Databricks notebooks (it captures the last %sql result) but is implicit and less reliable for production code. Option B has invalid syntax. Option D doesn't capture SQL results.

---

## Question 21

**Scenario**: A data engineer needs to securely access a third-party API from a Databricks notebook. The API requires an authentication token that should not be stored in code or version control.

**Question**: Which approach correctly implements secure credential management?

A) Store the token in a notebook cell and delete it after running
B) Store the token in a Delta table with restricted access
C) Use environment variables on the cluster
D) Use `dbutils.secrets.get(scope="api_scope", key="api_token")`

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Secrets provides secure credential storage with access control. Secrets are encrypted at rest and redacted in logs. Option A exposes secrets in notebook history. Option B is not designed for secrets. Option C requires cluster admin access and isn't as secure.

---

## Question 22

**Scenario**: A team maintains a library of shared utility functions used across multiple notebooks. When the library is updated, all notebooks using it should automatically get the latest version without modification.

**Question**: Which approach provides centralized code sharing with automatic updates?

A) Copy utility functions into each notebook
B) Use `%run /Workspace/Shared/utilities` at the start of each notebook
C) Package utilities as a wheel file and install via `%pip install`
D) Store utilities in a Delta table and read them at runtime

> [!success]- Answer
> **Correct Answer: B**
>
> `%run` executes another notebook in the current notebook's context, making all its functions available. Changes to the shared notebook are immediately available to all callers. Option A requires manual updates. Option C requires reinstallation for updates. Option D is impractical for code.

---

## Question 23

**Scenario**: A data engineer is configuring the Databricks CLI for a CI/CD pipeline. The pipeline runs in a containerized environment where storing credentials in `~/.databrickscfg` is not practical.

**Question**: Which authentication method is most appropriate for this CI/CD scenario?

A) OAuth user-to-machine authentication
B) Personal access token stored in `DATABRICKS_TOKEN` environment variable
C) Service principal with `DATABRICKS_CLIENT_ID` and `DATABRICKS_CLIENT_SECRET`
D) Username and password authentication

> [!success]- Answer
> **Correct Answer: C**
>
> Service principals with OAuth are the recommended approach for CI/CD automation. They provide machine identity without personal credentials and can be scoped with specific permissions. Option A requires user interaction. Option B uses personal tokens that expire. Option D is deprecated.

---

## Question 24

**Scenario**: A REST API call to create a cluster returns successfully with a cluster_id. However, a subsequent API call to run a job on that cluster fails with "Cluster not found."

**Question**: What is the most likely cause and solution?

A) The cluster creation is asynchronous; poll the cluster status until it's RUNNING
B) The API token doesn't have permission to access the cluster
C) The cluster_id was not properly formatted in the job request
D) Rate limiting is preventing the second API call

> [!success]- Answer
> **Correct Answer: A**
>
> Cluster creation via API returns immediately with a cluster_id, but the cluster takes time to provision. The job API call failed because the cluster wasn't ready yet. The solution is to poll `GET /api/2.0/clusters/get` until state is RUNNING. Options B-D are possible but less likely given the described sequence.

---

## Question 25

**Scenario**: A team is deciding between all-purpose clusters and job clusters for their production ETL workloads that run on a schedule four times daily.

**Question**: Which recommendation optimizes for cost while maintaining reliability?

A) Use all-purpose clusters with auto-termination to save costs
B) Use a shared all-purpose cluster across all jobs to maximize utilization
C) Use serverless compute for all jobs regardless of workload characteristics
D) Use job clusters which are automatically created and terminated per job run

> [!success]- Answer
> **Correct Answer: D**
>
> Job clusters are created for each job run and terminated afterward, providing cost savings (lower DBU rates) and isolation between runs. Option A still has higher DBU rates. Option B risks resource contention and failures affecting multiple jobs. Option C may not be cost-effective for predictable scheduled workloads.

---

## Question 26

**Scenario**: A data engineer needs to list all files in a Unity Catalog volume and filter for Parquet files created in the last 24 hours.

**Question**: Which approach correctly accesses Unity Catalog volumes?

A) `dbutils.fs.ls("dbfs:/Volumes/catalog/schema/volume")`
B) `dbutils.fs.ls("/Volumes/catalog/schema/volume")`
C) `spark.read.format("binaryFile").load("dbfs:/Volumes/catalog/schema/volume")`
D) `os.listdir("/dbfs/Volumes/catalog/schema/volume")`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog volumes are accessed via the `/Volumes` path without the `dbfs:` prefix. Option A uses the wrong path format. Option C reads file content, not metadata. Option D may work but `dbutils.fs` is the recommended approach for Databricks.

---

## Question 27

**Scenario**: A notebook widget is created with `dbutils.widgets.dropdown("env", "dev", ["dev", "staging", "prod"])`. When the notebook runs as part of a job, the job needs to override this value to "prod".

**Question**: How should the job task be configured to pass the parameter?

A) In the notebook task configuration, set `base_parameters: {"env": "prod"}`
B) Set cluster environment variable `ENV=prod`
C) Use `spark.conf.set("env", "prod")` in the job configuration
D) Create a separate notebook for production without widgets

> [!success]- Answer
> **Correct Answer: A**
>
> The notebook task's `base_parameters` map directly to widget values, overriding defaults when the notebook runs as a job. Option B doesn't connect to widgets. Option C sets Spark config, not widget values. Option D is unmaintainable.

---

## Question 28

**Scenario**: A data engineer is using the Jobs API 2.1 to submit a job run. The job includes a notebook task that accepts parameters. The engineer wants to pass dynamic values based on the current date.

**Question**: Which API endpoint and request body correctly submits this job run?

A) POST `/api/2.1/jobs/create` with `notebook_params` in the request
B) PUT `/api/2.1/jobs/update` with `notebook_params` in the settings
C) POST `/api/2.1/jobs/runs/submit` with `notebook_params` in the task configuration
D) POST `/api/2.1/jobs/run-now` with `notebook_params` in the request

> [!success]- Answer
> **Correct Answer: D**
>
> `run-now` triggers an existing job with parameter overrides via `notebook_params`. Option A creates a job definition but doesn't run it. Option C submits a one-time run (requires full job spec). Option B updates job definition, doesn't run it.

---

## Question 29

**Scenario**: A team is migrating from DBFS mounts to Unity Catalog external locations. Their existing code uses paths like `dbfs:/mnt/data/bronze/`.

**Question**: What is the recommended migration approach for accessing cloud storage with Unity Catalog?

A) Update all paths to use `abfss://` or `s3://` URLs directly
B) Create external locations in Unity Catalog and use `/Volumes/` paths
C) Keep using mounts but register them as external locations
D) Use storage credentials to access cloud storage via `dbutils.fs`

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog volumes provide governed access to cloud storage with paths like `/Volumes/catalog/schema/volume/`. External locations and volumes replace the ungoverned mount pattern. Option A bypasses governance. Option C mixes patterns incorrectly. Option D doesn't leverage Unity Catalog.

---

## Question 30

**Scenario**: A data engineer needs to run a SQL query from the Databricks CLI and output the results as JSON for processing by another script.

**Question**: Which CLI command correctly executes a SQL query and formats output as JSON?

A) `databricks sql execute --query "SELECT * FROM table" --format JSON`
B) `databricks workspace execute-sql --statement "SELECT * FROM table" --output json`
C) `databricks sql-cli -e "SELECT * FROM table" -o json`
D) `databricks api post /api/2.0/sql/statements -d '{"statement": "SELECT * FROM table"}'`

> [!success]- Answer
> **Correct Answer: D**
>
> The Databricks CLI can make arbitrary API calls. The SQL Statement Execution API (`/api/2.0/sql/statements`) executes SQL queries programmatically. Options A-C use non-existent CLI commands. The actual implementation may vary by CLI version, but the API approach always works.

---

**[← Previous: Mock Exam - Section 1: Data Processing](./01-data-processing.md) | [↑ Back to Full-Length Practice Exam](./README.md) | [Next: Mock Exam - Section 3: Data Modeling](./03-data-modeling.md) →**
