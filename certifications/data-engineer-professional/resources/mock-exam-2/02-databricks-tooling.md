# Mock Exam 2 - Section 2: Databricks Tooling (Questions 19-30)

[Back to Exam Overview](./README.md) | [Previous: Data Processing](01-data-processing.md) | [Next: Data Modeling](03-data-modeling.md)

---

## Question 19

**Scenario**: A data engineering team builds a notebook that generates reports for different business units. The notebook must allow users to select a business unit from a predefined list when running interactively, and the same notebook must accept the business unit as a parameter when triggered by a scheduled job. The engineer uses `dbutils.widgets.dropdown("business_unit", "finance", ["finance", "marketing", "operations", "engineering"])` to create the parameter.

**Question**: When the scheduled job needs to generate the report for the "operations" business unit, how should the job task be configured to override the widget default?

A) Set a cluster environment variable `BUSINESS_UNIT=operations` and modify the notebook to read from `os.environ`
B) In the notebook task configuration, set `base_parameters: {"business_unit": "operations"}` to override the widget default
C) Create a separate copy of the notebook with the dropdown default changed to "operations"
D) Use `spark.conf.set("business_unit", "operations")` in an init script attached to the job cluster

> [!success]- Answer
> **Correct Answer: B**
>
> The `base_parameters` field in a notebook task directly maps to widget names and overrides their default values at runtime. This is the intended mechanism for parameterizing notebooks across interactive and job contexts. Options A and D bypass the widget system entirely, and Option C creates maintenance overhead with duplicated notebooks.

---

## Question 20

**Scenario**: A platform team is migrating their deployment pipelines from the legacy Databricks CLI (version 0.x) to Databricks Asset Bundles (DABs) using the new Databricks CLI (version 0.200+). They currently use JSON template files and shell scripts to deploy jobs, clusters, and notebooks. A team member asks what key difference they should expect during the migration.

**Question**: Which statement correctly describes a key difference between Databricks Asset Bundles and the legacy CLI approach?

A) Asset Bundles require all resources to be defined in Python rather than YAML or JSON
B) Asset Bundles only support job deployments and cannot manage clusters or permissions
C) Asset Bundles use declarative YAML configuration files (`databricks.yml`) that define resources, environments, and deployment targets in a single project structure
D) Asset Bundles replace the REST API entirely and cannot be used alongside direct API calls

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Asset Bundles introduce a declarative, project-based approach using `databricks.yml` files where resources (jobs, pipelines, etc.), environment-specific overrides, and deployment targets are defined together. This replaces the imperative scripting approach of the legacy CLI. Option A is wrong because DABs use YAML, Option B understates their capabilities, and Option D is incorrect since the API and bundles can coexist.

---

## Question 21

**Scenario**: A data engineer needs to create a multi-task job using the REST API (Jobs 2.1) where Task B and Task C both depend on Task A completing successfully, and Task D depends on both Task B and Task C completing. The engineer constructs the JSON payload for the `POST /api/2.1/jobs/create` endpoint.

**Question**: Which JSON structure correctly defines the task dependency graph for this job?

A) Define each task with a `depends_on` array referencing parent task keys, such as Task B having `"depends_on": [{"task_key": "task_a"}]` and Task D having `"depends_on": [{"task_key": "task_b"}, {"task_key": "task_c"}]`
B) Set a single `execution_order` array at the job level listing tasks in sequential order: `["task_a", "task_b", "task_c", "task_d"]`
C) Use `run_after` fields on each task with a single string value referencing one parent, requiring a separate mechanism for multi-parent dependencies
D) Define a `dag` object at the job level with an adjacency list of task edges separate from the task definitions

> [!success]- Answer
> **Correct Answer: A**
>
> The Jobs API 2.1 uses a `depends_on` array within each task definition to specify upstream dependencies by `task_key`. This allows expressing complex DAGs including fan-out and fan-in patterns directly within the task list. Option B would enforce purely sequential execution, Option C incorrectly limits dependencies to a single parent, and Option D describes a structure not used by the Jobs API.

---

## Question 22

**Scenario**: A startup runs ad hoc data exploration notebooks during business hours and nightly batch ETL pipelines. The exploration workloads are unpredictable in timing and size, often sitting idle between queries. The nightly ETL pipelines are well-characterized with stable resource requirements and run for approximately 2 hours each night. The team wants to minimize cost while maintaining fast startup times for interactive work.

**Question**: Which compute configuration best balances cost and responsiveness for these two workload types?

A) Use a single large all-purpose cluster for both workloads with auto-scaling enabled
B) Use job clusters for interactive exploration and serverless compute for nightly ETL
C) Use all-purpose clusters with auto-termination for both workloads to ensure resources are freed
D) Use serverless compute for ad hoc exploration notebooks and job clusters for the nightly ETL pipelines

> [!success]- Answer
> **Correct Answer: D**
>
> Serverless compute eliminates startup latency and charges only for active usage, making it ideal for unpredictable, bursty interactive workloads. Job clusters are cost-optimized for scheduled batch work since they offer lower DBU rates and auto-terminate after each run. Option A wastes resources during idle periods, Option B reverses the optimal assignment, and Option C still incurs higher DBU rates for production workloads.

---

## Question 23

**Scenario**: A data engineering team runs 50 scheduled jobs throughout the day, each creating a new job cluster. They notice that cluster startup time averages 5-7 minutes, which delays pipeline SLAs. The clusters all use the same instance type (`i3.xlarge`) and Databricks Runtime version. The team wants to reduce startup time without changing the job definitions significantly.

**Question**: Which approach most effectively reduces cluster startup time for these jobs?

A) Switch all jobs to use a single shared all-purpose cluster with auto-scaling to avoid repeated cluster creation
B) Create an instance pool with `i3.xlarge` instances and configure each job cluster to use the pool, keeping warm instances available for immediate allocation
C) Increase the cluster size for each job so that Spark initialization is parallelized across more nodes
D) Attach init scripts to pre-install all libraries at the cluster level so startup only involves launching the runtime

> [!success]- Answer
> **Correct Answer: B**
>
> Instance pools maintain a set of warm (pre-provisioned) cloud instances that can be allocated to clusters instantly, reducing startup time from minutes to seconds. Since all jobs use the same instance type, a shared pool maximizes reuse. Option A sacrifices job isolation and cost optimization, Option C does not reduce provisioning time, and Option D addresses library install time but not the dominant cost of instance provisioning.

---

## Question 24

**Scenario**: A governance team needs to enforce that all data engineering clusters in the workspace use specific Databricks Runtime versions (13.3 LTS or 14.3 LTS only), have a maximum of 8 worker nodes, are tagged with a `cost_center` value, and cannot enable credential passthrough. They want these rules applied automatically when any engineer creates a cluster.

**Question**: Which Databricks feature allows the governance team to enforce these constraints?

A) Cluster policies that define allowed attribute values, maximum limits, and required tags, then assign the policy to data engineering groups
B) Workspace-level admin settings that globally restrict all cluster configurations to the approved runtime versions
C) Unity Catalog metastore-level compute restrictions that govern runtime versions and node counts
D) Custom init scripts that validate cluster configuration at startup and terminate non-compliant clusters

> [!success]- Answer
> **Correct Answer: A**
>
> Cluster policies provide fine-grained, declarative constraints on cluster attributes including runtime versions (allowlist), maximum nodes (range), required tags (fixed values), and disabled features. Policies are assigned to groups so engineers can only create compliant clusters. Option B lacks the granularity needed, Option C does not manage compute configurations, and Option D is reactive rather than preventive.

---

## Question 25

**Scenario**: A workspace administrator creates a folder structure `/Workspace/Projects/TeamAlpha/` and grants the `data_engineers` group CAN MANAGE permission on the `TeamAlpha` folder. A team member creates a new notebook inside this folder. Another engineer from the `data_analysts` group, who has no explicit permissions on the folder, reports that they cannot view the notebook.

**Question**: Which statement correctly explains the permission behavior in this scenario?

A) The analyst cannot view the notebook because notebook-level permissions always override folder-level permissions
B) The analyst should be able to view the notebook because all authenticated users have implicit read access to all workspace objects
C) The analyst cannot view the notebook because Databricks workspace permissions are additive and do not grant implicit access
D) The analyst cannot view the notebook because folder-level ACLs are inherited by child objects, and without explicit permissions on the folder or notebook, the analyst has no access

> [!success]- Answer
> **Correct Answer: D**
>
> Workspace folder permissions use inheritance: child objects (notebooks, sub-folders) inherit the ACLs of their parent folder. Since the `data_analysts` group was not granted any permission on the `TeamAlpha` folder, they inherit no access to objects within it. Option A incorrectly states that notebook permissions override folder permissions (they supplement them), Option B is false, and Option C is partially correct but misses the inheritance mechanism.

---

## Question 26

**Scenario**: A data engineer has a main orchestration notebook that needs to call a utility notebook. When using `%run ./utils`, all variables and functions defined in `utils` become available in the main notebook's scope. The engineer considers switching to `dbutils.notebook.run("./utils", timeout_seconds=120)` instead. A colleague warns that the behavior will be different.

**Question**: Which statement correctly describes a key behavioral difference between `%run` and `dbutils.notebook.run()`?

A) `%run` executes the child notebook in a separate process while `dbutils.notebook.run()` executes in the same process
B) `dbutils.notebook.run()` executes the child notebook in an isolated context and returns only a string result, whereas `%run` merges the child's execution context (variables, functions, imports) into the calling notebook
C) `dbutils.notebook.run()` supports passing DataFrames as parameters while `%run` only supports string parameters
D) `%run` is asynchronous and returns immediately while `dbutils.notebook.run()` blocks until completion

> [!success]- Answer
> **Correct Answer: B**
>
> `%run` is a compile-time inclusion that merges the child notebook's entire execution context (all variables, functions, and imports) into the parent, as if the code were pasted inline. `dbutils.notebook.run()` launches the child in an isolated context and can only return a single string via `dbutils.notebook.exit()`. Option A reverses the isolation model, Option C is incorrect since neither method passes DataFrames directly, and Option D is incorrect since `%run` also blocks.

---

## Question 27

**Scenario**: A data analytics team is evaluating Databricks SQL warehouse tiers. They need to run interactive dashboards for executives, support concurrent BI tool connections from 20 analysts, and use query federation to join Databricks tables with data in an external PostgreSQL database. Cost is a consideration but not the primary driver.

**Question**: Which Databricks SQL warehouse type meets all of these requirements?

A) Serverless SQL warehouse, which provides instant scaling, high concurrency, built-in query federation, and eliminates infrastructure management overhead
B) Pro SQL warehouse, which supports query federation and high concurrency but requires manual cluster management
C) Classic SQL warehouse, which provides the lowest cost and supports all the required features including query federation
D) Any warehouse type works since query federation, concurrency, and dashboards are available on all tiers

> [!success]- Answer
> **Correct Answer: A**
>
> Serverless SQL warehouses provide instant elastic scaling for high concurrency, built-in support for query federation (including external databases like PostgreSQL), and require no infrastructure management. Pro warehouses support federation but lack serverless scaling benefits. Classic warehouses do not support query federation, making Option C incorrect. Option D is wrong because feature availability varies across tiers.

---

## Question 28

**Scenario**: A data engineer needs to store raw CSV and JSON files uploaded by external partners in Unity Catalog for governed access. The files should be accessible via SQL and Python, and the team wants Unity Catalog to manage the lifecycle and permissions of the stored files. The files should not be converted to Delta format since downstream systems require the original file formats.

**Question**: Which Unity Catalog feature is most appropriate for this requirement?

A) Create an external table with `STORED AS CSV` format to register the files in Unity Catalog
B) Create an external location pointing to the cloud storage path where partner files are uploaded
C) Create a managed volume within a Unity Catalog schema so that files are stored under Unity Catalog's managed storage with full lifecycle governance
D) Create a Delta table and use `COPY INTO` to ingest the CSV/JSON files, then export them back to the original format when needed

> [!success]- Answer
> **Correct Answer: C**
>
> Managed volumes in Unity Catalog store files in the catalog's managed storage location, providing full lifecycle management (files are deleted when the volume is dropped) and governed access through Unity Catalog permissions. Files retain their original format and are accessible via `/Volumes/` paths. Option A does not apply since the requirement is for file storage, not tabular data. Option B provides governance over a location but not lifecycle management. Option D adds unnecessary conversion steps.

---

## Question 29

**Scenario**: A data engineer needs to schedule a job that runs Monday through Friday at 6:00 AM, 12:00 PM, and 6:00 PM UTC. The job should also be configured with a retry policy of up to 3 retries with a 5-minute interval between attempts if any task fails.

**Question**: Which configuration correctly implements both the schedule and retry policy?

A) Use three separate jobs each with a simple daily cron schedule (`0 6 * * 1-5`, `0 12 * * 1-5`, `0 18 * * 1-5`) and configure retries at the job level with `max_retries: 3`
B) Use a single cron expression `0 6,12,18 * * MON-FRI` with a task-level `retry_policy` of `max_retries: 3, min_retry_interval_millis: 300000`
C) Use a continuous trigger with a conditional check on the current hour and day, and implement retry logic within the notebook code using try/except blocks
D) Use a single cron expression `0 6,12,18 * * 1-5` with a task-level `retry_policy` specifying `max_retries: 3` and `min_retry_interval_millis: 300000`

> [!success]- Answer
> **Correct Answer: D**
>
> The cron expression `0 6,12,18 * * 1-5` correctly triggers at 6:00, 12:00, and 18:00 on weekdays (1-5 represents Monday-Friday in the Databricks/Quartz cron format). The task-level `retry_policy` with `max_retries` and `min_retry_interval_millis` (300000ms = 5 minutes) configures automatic retries. Option A unnecessarily creates three separate jobs. Option B uses `MON-FRI` which is not valid in the Quartz cron format used by Databricks. Option C is overly complex and loses built-in retry tracking.

---

## Question 30

**Scenario**: A data engineering team needs to install a custom monitoring agent on every cluster in the workspace. They also need to install a team-specific Python library only on clusters used by the data science team. An engineer proposes using init scripts but is unsure about the execution model.

**Question**: Which statement correctly describes the behavior of global and cluster-scoped init scripts in Databricks?

A) Global init scripts and cluster-scoped init scripts run in parallel during cluster startup, with no guaranteed ordering between them
B) Global init scripts run first on every cluster in the workspace, followed by cluster-scoped init scripts, allowing the monitoring agent to be installed globally while team-specific libraries are added via cluster-scoped scripts
C) Cluster-scoped init scripts run before global init scripts, so team-specific configurations take precedence over workspace-wide settings
D) Global init scripts can only be configured by metastore admins through Unity Catalog, not through workspace admin settings

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks executes global init scripts first (in the order specified by the admin), followed by cluster-scoped init scripts. This means the monitoring agent can be deployed as a global init script that runs on every cluster, while the team-specific Python library is added as a cluster-scoped init script on data science clusters only. Option A incorrectly states they run in parallel, Option C reverses the execution order, and Option D is wrong since global init scripts are managed through workspace admin settings.

---

[Back to Exam Overview](./README.md) | [Previous: Data Processing](01-data-processing.md) | [Next: Data Modeling](03-data-modeling.md)
