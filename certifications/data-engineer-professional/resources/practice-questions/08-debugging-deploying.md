---
title: "Practice Questions: Debugging and Deploying"
type: practice-questions
tags: [data-engineer-professional, practice-questions, debugging-deploying]
---

# Section 8: Debugging and Deploying (10 %)

Practice questions for Section 8 of the Oct 9, 2026 exam guide. Questions marked *(2026 blueprint)* target skills that are new or reworded in that guide. Study material: [Section 8 folder](../../08-debugging-and-deploying/README.md).

---

## Question 1: Databricks CLI Authentication

**Question** *(Medium)*: A CI/CD pipeline needs to authenticate with Databricks using a service principal. Which environment variables should be set?

A) `DATABRICKS_HOST` and `DATABRICKS_TOKEN`  
B) `DATABRICKS_HOST`, `DATABRICKS_CLIENT_ID`, and `DATABRICKS_CLIENT_SECRET`  
C) `DATABRICKS_URL` and `DATABRICKS_API_KEY`  
D) `DATABRICKS_WORKSPACE` and `DATABRICKS_PAT`  

> [!success]- Answer
> **Correct Answer: B**
>
> Service principal authentication requires the workspace host URL, client ID (application ID), and client secret. Option A is for PAT token authentication. Options C and D use invalid variable names.

---

## Question 2: Spark UI Debugging

**Question** *(Medium)*: A Spark job is experiencing long task times with high "Shuffle Read Blocked Time." What does this indicate?

A) Too few partitions  
B) Network congestion or slow shuffle fetch  
C) Out of memory errors  
D) Insufficient disk space  

> [!success]- Answer
> **Correct Answer: B**
>
> Shuffle Read Blocked Time indicates tasks waiting for shuffle data from other executors, typically due to network issues or executors being slow to serve shuffle blocks. Solutions include increasing shuffle retry settings or investigating network.

---

## Question 3: Declarative Automation Bundles

**Question** *(Medium)*: A team needs to deploy the same pipeline to dev, staging, and production environments. How should environments be configured in Declarative Automation Bundles?

A) Create separate bundle files for each environment  
B) Use targets in databricks.yml with environment-specific settings  
C) Use Git branches for each environment  
D) Manually modify settings before each deployment  

> [!success]- Answer
> **Correct Answer: B**
>
> DAB uses targets to define environment-specific configurations in a single databricks.yml. This is the recommended approach for multi-environment deployments. Separate files or manual changes lead to drift and errors.

---

## Question 4: Bundle Deployment Mode

**Question** *(Easy)*: A developer wants to test their bundle without affecting shared resources. Which target mode should they use?

A) `mode: production`  
B) `mode: development`  
C) `mode: testing`  
D) `mode: sandbox`  

> [!success]- Answer
> **Correct Answer: B**
>
> Development mode prefixes resource names with the username, pauses schedules, and uses personal workspace paths. This prevents conflicts with other developers or production resources.

---

## Question 5: Git Folders

**Question** *(Easy)*: A team wants to version control their notebooks with automatic sync to Git. Which statement about Git Folders is correct?

A) Git Folders require manual sync after each change  
B) Git Folders can only connect to GitHub  
C) Git Folders replace the need for Declarative Automation Bundles  
D) Git Folders provide native Git operations like pull, commit, and push  

> [!success]- Answer
> **Correct Answer: D**
>
> Git Folders provide native Git operations directly in the Databricks UI. They support multiple Git providers (GitHub, GitLab, Azure DevOps, etc.). They complement DAB (which handles deployment), not replace it.

---

## Question 6: CI/CD Pipeline

**Question** *(Easy)*: A GitHub Actions workflow needs to deploy a bundle to Databricks. Which step is required before running `databricks bundle deploy`?

A) Install Python  
B) Run `databricks bundle init`  
C) Set up Databricks CLI with authentication  
D) Create the workspace manually  

> [!success]- Answer
> **Correct Answer: C**
>
> The Databricks CLI must be installed and authenticated (via `databricks/setup-cli` action or environment variables) before deployment commands work. The bundle already exists in the repo. Python is helpful but CLI is essential.

---

## Question 7: OIDC Federation for CI/CD

**Question** *(Hard)*: A security team requires that CI/CD pipelines authenticate to Databricks without storing long-lived tokens in GitHub Actions secrets. What is the recommended authentication approach?

A) Use OIDC federation with GitHub's identity provider so the pipeline exchanges a short-lived GitHub token for a Databricks access token  
B) Generate a personal access token (PAT) and store it as an encrypted GitHub secret with automatic rotation  
C) Use a service principal with a client secret stored in a vault and injected at runtime  
D) Configure SSH key-based authentication between GitHub Actions runners and the Databricks workspace  

> [!success]- Answer
> **Correct Answer: A**
>
> OIDC (OpenID Connect) federation allows GitHub Actions to authenticate to Databricks without storing any secrets. The pipeline receives a short-lived OIDC token from GitHub's identity provider and exchanges it for a Databricks token. This eliminates secret management entirely. PATs and client secrets still require secret storage and rotation. SSH authentication is not supported for Databricks API calls.

---

## Question 8: Blue/Green Deployment

**Question** *(Hard)*: A production pipeline processes financial data and cannot tolerate downtime during updates. The team needs a zero-downtime deployment strategy. How should a blue/green deployment be implemented with Declarative Automation Bundles?

A) Deploy the new version to the same target and rely on Databricks to handle the transition automatically  
B) Maintain two separate DAB targets (blue and green), deploy the new version to the inactive target, run validation, then switch traffic  
C) Use `databricks bundle deploy --rolling` to gradually replace running tasks  
D) Deploy to a staging target, run all tests, then use `databricks bundle promote` to move to production  

> [!success]- Answer
> **Correct Answer: B**
>
> Blue/green deployment uses two parallel environments. Deploy to the inactive one, validate, then switch traffic (e.g., by updating a job alias or routing). This provides instant rollback by switching back. Databricks doesn't auto-handle transitions. There is no `--rolling` or `promote` command in the DAB CLI.

---

## Question 9: Bundle Variable Substitution

**Question** *(Medium)*: A DAB project needs different cluster sizes, catalog names, and notification emails for dev vs. production targets. Which approach correctly parameterizes these differences?

A) Use shell environment variables like `$CLUSTER_SIZE` directly in databricks.yml  
B) Create separate databricks.yml files for each environment (databricks-dev.yml, databricks-prod.yml)  
C) Use Jinja2 templating syntax `{{ env.CLUSTER_SIZE }}` in the bundle configuration  
D) Define variables in the bundle and override them per target using `variables:` blocks with `${var.variable_name}` syntax  

> [!success]- Answer
> **Correct Answer: D**
>
> DAB supports native variable substitution with `${var.variable_name}` syntax. Variables are defined at the bundle level and can be overridden per target in the `targets:` section. Shell variables, separate files, and Jinja2 are not supported in DAB configuration syntax.

---

## Question 10: Deployment Validation

**Question** *(Easy)*: A deployment pipeline needs to verify that a bundle is correctly configured before deploying to production, checking for missing permissions, invalid references, and configuration errors. Which command performs this validation?

A) `databricks bundle test -t production`  
B) `databricks bundle lint -t production`  
C) `databricks bundle validate -t production`  
D) `databricks bundle check -t production`  

> [!success]- Answer
> **Correct Answer: C**
>
> `databricks bundle validate` checks the bundle configuration for errors including missing resources, invalid references, schema validation, and permission issues. It should always run before `databricks bundle deploy`. There is no `test`, `lint`, or `check` subcommand in the DAB CLI.

---

## Question 11: GitOps Workflow

**Question** *(Medium)*: A team implements GitOps where the Git repository is the single source of truth. Changes to production should only occur through merged pull requests. How should the CI/CD pipeline enforce this GitOps principle?

A) Allow direct deployments from any branch but require admin approval in the Databricks workspace  
B) Configure the deployment pipeline to only trigger on merges to the main branch, with PR reviews and bundle validation as required checks  
C) Use Git Folders to auto-sync the main branch to the production workspace  
D) Lock the production workspace to read-only and require API-only deployments  

> [!success]- Answer
> **Correct Answer: B**
>
> GitOps requires that all changes flow through Git. The CI/CD pipeline should only deploy from main branch (after PR merge), with validation and tests as required GitHub/GitLab checks before merge is allowed. Git Folders sync notebooks but don't handle full bundle deployment. Read-only workspaces break operational needs. Direct deployment from any branch bypasses review.

---

## Question 12: Spark UI Stage Analysis

**Question** *(Medium)*: A data engineer examines the Spark UI and notices one stage has 200 tasks where 199 complete in 2 seconds but 1 task takes 15 minutes. What is this pattern called and which AQE feature addresses it?

A) A straggler task; enable speculative execution with `spark.speculation = true`  
B) Data skew; AQE's `spark.sql.adaptive.skewJoin.enabled` splits the skewed partition  
C) A scheduling delay; increase `spark.executor.cores` for faster task scheduling  
D) Garbage collection overhead; tune JVM GC with `spark.executor.extraJavaOptions`  

> [!success]- Answer
> **Correct Answer: B**
>
> One task taking much longer than others with the same data is classic data skew. AQE's skew join optimization detects skewed partitions and splits them into smaller sub-partitions. Speculative execution re-runs slow tasks but doesn't fix the root cause. This isn't a scheduling or GC issue.

---

## Question 13: Diagnosing on Serverless *(2026 blueprint)*

**Question** *(Medium)*: A notebook task in a Lakeflow Jobs run on serverless compute became much slower after a code change, and the data engineer wants operator-level detail (time spent, rows, memory, pruning) for the slow statement. The compute page shows no Spark UI tab. Where should the engineer look?

A) The Driver logs tab on the serverless compute  
B) The compute event log for the serverless compute  
C) The query profile for the statement, opened from the task's timeline in the job run (or from query history)  
D) Log delivery output in a Unity Catalog volume configured on the serverless compute  

> [!success]- Answer
> **Correct Answer: C**
>
> The query profile replaces the Spark UI for serverless workloads.
>
> Serverless compute does not provide the Spark UI or Spark logs; Databricks says to use the query profile, which shows per-operator time spent, rows, memory peak, and pruning, and serverless job runs list each statement in the task timeline with a link to its profile. A and D are wrong because Spark driver logs and compute log delivery are not available on serverless (only client-side application logs). B is wrong because compute event logs are not supported on serverless and only describe compute lifecycle, not query execution.

---

## Question 14: Fleet-Wide Failure Analysis *(2026 blueprint)*

**Question** *(Medium)*: A platform team must find every job task that failed or timed out across all workspaces in the last week, grouped by failure reason, without opening each run in the UI. Which source gives this most directly?

A) The Spark UI Jobs tab of each job cluster  
B) The `system.lakeflow.job_task_run_timeline` system table, filtered on `result_state` and grouped by `termination_code`  
C) The driver logs of each job cluster delivered to a volume  
D) The `system.billing.usage` system table filtered on failed SKUs  

> [!success]- Answer
> **Correct Answer: B**
>
> The `system.lakeflow.job_task_run_timeline` table records each task run's `result_state` and `termination_code` across the account.
>
> System tables are governed, queryable records with 365-day retention, so one SQL query can count `FAILED`, `ERROR`, and `TIMED_OUT` task runs by `termination_code` (for example `RUN_EXECUTION_ERROR` or `CLUSTER_ERROR`). A is per-application and disappears when compute is restarted. C requires parsing raw log files per cluster and does not give outcomes. D tracks usage and cost, not run outcomes.

---

## Question 15: What a Repair Re-runs *(2026 blueprint)*

**Question** *(Medium)*: A job has tasks `ingest`, then `clean_a` and `clean_b` in parallel, then `publish` depending on both. In last night's run `ingest` and `clean_a` succeeded, `clean_b` failed, and `publish` was skipped. The engineer fixes the bug in `clean_b`'s notebook and clicks **Repair run** with default settings. What happens?

A) All four tasks run again in a new job run with a new run ID  
B) Only `clean_b` runs again; `publish` must be triggered manually  
C) `clean_b` and `publish` run again as part of the original run, using the current job and task settings  
D) `ingest`, `clean_b`, and `publish` run again because repairs always restart from the first task  

> [!success]- Answer
> **Correct Answer: C**
>
> A repair re-runs only the unsuccessful tasks and their dependents, inside the original run.
>
> Repair re-runs the failed `clean_b` and the skipped dependent `publish`, does not re-run successful tasks (`ingest`, `clean_a`), uses the current job and task settings so the fix is picked up, and records the repair in the original run's history. A describes Run now, not repair. B ignores dependent tasks. D is wrong because successful tasks are not re-run.

---

## Question 16: Repair with a Parameter Override via API *(2026 blueprint)*

**Question** *(Hard)*: A run that was already repaired once failed again because its `run_date` job parameter was wrong. An orchestration script must repair all failed tasks again, this time with `run_date` set to `2026-10-25`, through `POST /api/2.2/jobs/runs/repair`. Which request body is correct?

A) `{"run_id": 455644833, "rerun_all_failed_tasks": true, "job_parameters": {"run_date": "2026-10-25"}}`  
B) `{"run_id": 455644833, "latest_repair_id": 734650698524280, "rerun_all_failed_tasks": true, "job_parameters": {"run_date": "2026-10-25"}}`  
C) `{"run_id": 455644833, "latest_repair_id": 734650698524280, "rerun_tasks": ["clean_b"], "rerun_all_failed_tasks": true}`  
D) `{"job_id": 11223344, "job_parameters": {"run_date": "2026-10-25"}, "only": ["clean_b"]}`  

> [!success]- Answer
> **Correct Answer: B**
>
> Option B supplies `latest_repair_id`, `rerun_all_failed_tasks`, and the `job_parameters` override.
>
> `latest_repair_id` is not needed for the first repair but must be provided on later repairs of the same run, and `job_parameters` carries the override. A omits `latest_repair_id` for a second repair. C sets both `rerun_tasks` and `rerun_all_failed_tasks`, which are mutually exclusive, and has no override. D is a `run-now` request that starts a new run instead of repairing the existing one.

---

## Question 17: Same Definitions in Every Environment *(2026 blueprint)*

**Question** *(Easy)*: A team wants one job and one Lakeflow pipeline, stored in Git, deployed to dev, staging, and prod workspaces with a different catalog per environment and a service principal running production. Which approach fits?

A) Build the job in the dev UI, export its JSON, and import it into staging and prod  
B) Define the resources once in a `databricks.yml` bundle with `targets` that override a `catalog` variable and set `run_as` on `prod`, then run `databricks bundle deploy -t <target>`  
C) Keep the job in a Git folder and copy the folder to each workspace with the workspace import CLI  
D) Use one shared workspace for all three environments to avoid configuration drift  

> [!success]- Answer
> **Correct Answer: B**
>
> A Declarative Automation Bundle with per-target overrides deploys identical definitions to each environment.
>
> Bundles declare resources as code, `targets` override variables per environment, `run_as` sets a production service principal, and `databricks bundle deploy -t <target>` deploys reproducibly from CI/CD. A is manual and drifts. C moves code only, not job or pipeline definitions. D removes environment isolation instead of managing it.

---

## Question 18: Development Mode Behavior *(2026 blueprint)*

**Question** *(Medium)*: An engineer deploys a bundle with `databricks bundle deploy -t dev`, where the `dev` target sets `mode: development`. The bundle's job has a daily schedule. What does the deployed job look like?

A) Same name as production, schedule active  
B) Name prefixed with `[dev <short_name>]`, a `dev` tag added, and the schedule paused  
C) Same name as production, schedule paused, and the job runs as a service principal automatically  
D) Deployment fails because development mode requires `run_as`  

> [!success]- Answer
> **Correct Answer: B**
>
> Development mode prefixes names, tags resources `dev`, and pauses schedules and triggers.
>
> `mode: development` prepends `[dev ${workspace.current_user.short_name}]` to resource names, adds a `dev` tag, pauses all schedules and triggers, marks pipelines as development, and disables the deployment lock. A and C keep the production name, which development mode changes. D confuses it with production mode, which is where `run_as` (a service principal) is recommended or required.

---

## Question 19: Updating a Production Git Folder from CI *(2026 blueprint)*

**Question** *(Medium)*: A team deploys only notebooks and Python files through a production Git folder at `/Workspace/Production/etl`. After each pull request merges into `main`, their GitHub Actions workflow must bring that folder to the latest commit of `main`. Which command should the workflow run, authenticated as a service principal that has a Git credential?

A) `databricks repos update /Workspace/Production/etl --branch main`  
B) `databricks workspace import-dir ./src /Workspace/Production/etl --overwrite`  
C) `databricks repos create https://github.com/org/etl.git gitHub --path /Workspace/Production/etl`  
D) `databricks bundle destroy -t prod` followed by `databricks bundle deploy -t prod`  

> [!success]- Answer
> **Correct Answer: A**
>
> `databricks repos update ... --branch main` checks out `main` and pulls its latest commit into the Git folder.
>
> The Repos API update (`PATCH /api/2.0/repos/{id}`) switches a Git folder to a branch or tag or updates it to the latest commit on the same branch, which is the documented automation for a production Git folder. B bypasses Git and turns the folder's contents into untracked copies. C clones a new Git folder and fails if the path already exists. D tears down bundle resources and is unrelated to updating a Git folder.

---

## Question 20: Git Folders vs Bundles *(2026 blueprint)*

**Question** *(Medium)*: A team uses personal Git folders for development. They now need CI/CD that deploys both the notebook code and the job definitions (schedules, clusters, task graph) to production. What does Databricks recommend?

A) A production Git folder only, because pulling the branch also updates job definitions  
B) Declarative Automation Bundles, with the jobs defined in source and deployed by `databricks bundle deploy`  
C) Editing the production jobs in the UI after each Git folder pull  
D) Storing job JSON in the Git folder and relying on Databricks to apply it automatically  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks recommends Declarative Automation Bundles to package and deploy CI/CD workflows.
>
> Bundles deploy code plus jobs and pipelines as code, while a production Git folder deploys code only. A is wrong because updating a Git folder does not change job definitions. C is manual and error-prone. D is wrong because Databricks does not apply job JSON files from a Git folder automatically.

---

**[← Previous: Data Governance](./07-data-governance.md) | [↑ Back to Practice Questions](./README.md) | [Next: Data Modeling →](./09-data-modeling.md)**
