# Mock Exam 2 - Section 6: Testing & Deployment (Questions 52-57)

[Back to Exam Overview](./README.md) | [Previous: Monitoring & Logging](05-monitoring-logging.md) | [Next: Lakeflow & Performance](07-lakeflow-performance.md)

---

## Question 52

**Scenario**: A data engineering team maintains a `databricks.yml` bundle configuration. The root-level resources section defines a job with `max_concurrent_runs: 1` and a cluster with `num_workers: 2`. The `targets.production` section redefines the same job with `max_concurrent_runs: 4` but does not specify `num_workers`.

**Question**: When the bundle is deployed to the production target, what is the effective configuration for `max_concurrent_runs` and `num_workers`?

A) `max_concurrent_runs: 1`, `num_workers: 2` -- root-level defaults always take precedence
B) `max_concurrent_runs: 4`, `num_workers: unset` -- the target completely replaces the root-level job definition
C) The deployment fails because the target cannot override root-level resource settings
D) `max_concurrent_runs: 4`, `num_workers: 2` -- the target overrides only the settings it explicitly specifies

> [!success]- Answer
> **Correct Answer: D**
>
> DAB uses a merge strategy where target-level settings are deep-merged with root-level defaults. Properties explicitly set in the target override the corresponding root-level values, while unspecified properties inherit the root-level defaults. This allows teams to define common baseline configurations at the root level and only override what differs per environment.

---

## Question 53

**Scenario**: A platform team configures OIDC-based authentication between GitHub Actions and Databricks using a service principal. During a workflow run, GitHub Actions requests an OIDC token from GitHub's cloud provider and sends it to the Databricks token endpoint.

**Question**: What happens during the OIDC token exchange with Databricks?

A) Databricks validates the GitHub OIDC token against the configured identity federation policy and issues a short-lived OAuth access token for the service principal
B) Databricks stores the GitHub OIDC token as a persistent secret and uses it for all future API calls from that service principal
C) GitHub Actions receives a Databricks personal access token that is valid for 90 days and cached in the workflow runner
D) Databricks converts the GitHub OIDC token into a workspace-level API key that must be manually rotated every 30 days

> [!success]- Answer
> **Correct Answer: A**
>
> In the OIDC token exchange flow, Databricks validates the incoming GitHub OIDC token by checking its claims against the identity federation policy configured on the service principal. If validation succeeds, Databricks issues a short-lived OAuth token scoped to the service principal's permissions. This eliminates the need to store long-lived credentials in GitHub Secrets and provides automatic token rotation per workflow run.

---

## Question 54

**Scenario**: A team is deploying a new version of a production DLT pipeline that processes 500 million records per day. They need to validate the new pipeline version with real production data before fully switching over, while ensuring zero downtime and the ability to instantly revert if issues are detected.

**Question**: Which deployment strategy best meets these requirements?

A) Blue-green deployment: deploy the new pipeline version alongside the old one, then switch all traffic instantly by updating the job definition
B) Rolling deployment: gradually update each cluster node to run the new pipeline code one at a time
C) Canary deployment: route a small percentage of incoming data to the new pipeline version, monitor its metrics, and gradually increase the percentage if results are healthy
D) Feature flag deployment: wrap all new transformation logic in feature flags and toggle them on simultaneously across the existing pipeline

> [!success]- Answer
> **Correct Answer: C**
>
> A canary deployment allows the team to validate the new pipeline version with a small subset of real production data while keeping the existing pipeline handling the majority of traffic. This provides production-grade validation with minimal blast radius -- if the canary pipeline shows errors or data quality issues, the team can instantly stop routing data to it. Unlike blue-green, canary gives gradual confidence building rather than an all-or-nothing switchover.

---

## Question 55

**Scenario**: A CI/CD pipeline runs automated tests against a DLT pipeline that uses expectations such as `CONSTRAINT valid_amount EXPECT (amount > 0) ON VIOLATION DROP ROW`. After the test pipeline run completes, the team needs to programmatically verify that no more than 0.1% of rows were dropped by expectations before promoting the code to production.

**Question**: How should the team validate the expectation results in their CI/CD pipeline?

A) Parse the DLT pipeline logs from the cluster driver output to count dropped rows
B) Query the DLT event log for expectation metrics using `expectations.dropped_records` and compare the drop rate against the 0.1% threshold
C) Add a downstream notebook that reads the target table's row count and compares it to the source table's row count
D) Configure a DLT alert that sends an email notification if the drop rate exceeds 0.1%

> [!success]- Answer
> **Correct Answer: B**
>
> The DLT event log captures detailed metrics for each expectation, including the number of records that passed, failed, and were dropped. By querying the event log for `expectations` events, the CI/CD pipeline can programmatically extract the drop counts, calculate the drop rate, and fail the pipeline promotion if the rate exceeds the defined threshold. This approach is precise, automatable, and uses the purpose-built observability layer rather than indirect row-count comparisons or non-programmatic alerts.

---

## Question 56

**Scenario**: A data engineering team deploys a production job using Databricks Asset Bundles. The job should be runnable by members of the `data-ops` group but not editable by them. Only the deploying service principal should have full management permissions.

**Question**: Which `databricks.yml` configuration correctly implements these permission requirements?

A) Set `run_as` to the `data-ops` group and leave permissions unspecified so the group inherits run access
B) Add a `permissions` block with `CAN_MANAGE` for `data-ops` and rely on Unity Catalog to restrict edit access
C) Deploy the job with no permissions block and then manually configure permissions through the Databricks workspace UI
D) Add a `permissions` block granting `CAN_VIEW` and `CAN_MANAGE_RUN` to `group_name: data-ops` while the deploying service principal retains `CAN_MANAGE` as the owner

> [!success]- Answer
> **Correct Answer: D**
>
> The DAB `permissions` block on a job resource supports fine-grained access levels including `CAN_VIEW`, `CAN_MANAGE_RUN`, and `CAN_MANAGE`. Granting `CAN_MANAGE_RUN` to the `data-ops` group allows them to trigger and monitor job runs without being able to edit the job definition. The deploying service principal automatically retains `CAN_MANAGE` as the resource owner, ensuring only the deployment pipeline can modify the job configuration.

---

## Question 57

**Scenario**: A team deployed a new version of their DAB-managed production pipeline 30 minutes ago. Monitoring alerts now indicate that the new version is producing incorrect aggregation results due to a logic error in a transformation. The team needs to revert to the previous working version as quickly as possible.

**Question**: What is the fastest way to roll back the deployment using Databricks Asset Bundles?

A) Check out the previous Git commit in the repository and run `databricks bundle deploy --target production` to redeploy the last known good version
B) Run `databricks bundle destroy --target production` to remove the broken deployment, then manually recreate the resources from the Databricks UI
C) Use `databricks bundle run --target production --version previous` to automatically roll back to the prior deployed version
D) Navigate to the Databricks workspace UI, locate each deployed resource, and manually revert the settings to match the previous configuration

> [!success]- Answer
> **Correct Answer: A**
>
> Since DAB deployments are driven from source-controlled configuration files, the fastest rollback strategy is to check out the previous known-good commit in Git and redeploy with `databricks bundle deploy`. This restores all resource configurations -- jobs, pipelines, clusters -- to their previous state in a single command. Option C uses a `--version` flag that does not exist in the DAB CLI. Options B and D are slow, error-prone, and defeat the purpose of infrastructure-as-code.

---

**[← Previous: Mock Exam 2 - Section 5: Monitoring & Logging](./05-monitoring-logging.md) | [↑ Back to Mock Exam 2 - Databricks Data Engineer Professional](./README.md) | [Next: Mock Exam 2 - Section 7: Lakeflow Pipelines & Performance](./07-lakeflow-performance.md) →**
