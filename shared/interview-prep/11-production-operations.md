---
tags: [interview-prep, production-operations, devops, ci-cd]
---

# Interview Questions — Production Operations & DevOps

---

## Question 1: CI/CD for Databricks Pipelines

**Level**: Both
**Type**: System Design

**Scenario / Question**:
How do you set up a CI/CD pipeline for Databricks? Walk me through your promotion workflow from development to production, including testing, code review, and deployment tooling.

> [!success]- Answer Framework
>
> **Short Answer**: Use Databricks Asset Bundles (DABs) to define entire projects — code, jobs, clusters, and configs — as YAML templates, stored in Git and deployed across Dev/QA/Prod via CI/CD. Databricks Repos sync notebooks from Git branches, PRs gate promotion with code review, CI runs tests (nutter or pytest), and `databricks bundle deploy --target prod` pushes validated changes to production.
>
> ### Key Points to Cover
>
> - Databricks Repos: Git integration for notebooks and files directly in the workspace
> - Databricks Asset Bundles (DABs): define jobs, clusters, pipelines, and configs as code in `databricks.yml`
> - Terraform provider: infrastructure-as-code for workspace-level resources (clusters, instance pools, permissions)
> - Promotion flow: feature branch → PR with code review → CI tests in staging → merge → deploy to prod
> - Testing in CI: nutter framework for notebook testing, pytest for Python modules, integration tests against staging workspace
> - Environment-specific configs: DAB targets (`dev`, `staging`, `prod`) with variable overrides
>
> ### Example Answer
>
> A production-grade CI/CD pipeline for Databricks has three layers:
>
> **Layer 1 — Source Control with Databricks Repos**:
> Engineers develop in the workspace using notebooks synced to Git via Databricks Repos. Each engineer works on a feature branch. Changes are committed and pushed from the workspace UI or CLI.
>
> **Layer 2 — Databricks Asset Bundles (DABs)**:
> DABs define the entire project as code — jobs, cluster configurations, DLT pipelines, and environment-specific overrides — in a `databricks.yml` file:
>
> ```yaml
> # databricks.yml
> bundle:
>   name: sales_etl_pipeline
>
> targets:
>   dev:
>     workspace:
>       host: https://dev.cloud.databricks.com
>     default: true
>   prod:
>     workspace:
>       host: https://prod.cloud.databricks.com
>     variables:
>       cluster_size: "i3.2xlarge"
>       max_workers: 8
>
> resources:
>   jobs:
>     daily_etl:
>       name: "Sales Daily ETL"
>       tasks:
>         - task_key: ingest
>           notebook_task:
>             notebook_path: ./src/ingest.py
>           new_cluster:
>             spark_version: "14.3.x-scala2.12"
>             num_workers: ${var.max_workers}
> ```
>
> **Layer 3 — CI/CD Pipeline (GitHub Actions example)**:
>
> ```yaml
> # .github/workflows/deploy.yml
> on:
>   push:
>     branches: [main]
>
> jobs:
>   test-and-deploy:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v4
>       - name: Run unit tests
>         run: pytest tests/ -v
>       - name: Validate bundle
>         run: databricks bundle validate --target prod
>       - name: Deploy to production
>         run: databricks bundle deploy --target prod
>         env:
>           DATABRICKS_TOKEN: ${{ secrets.PROD_TOKEN }}
> ```
>
> **Promotion workflow**: Developer creates feature branch → pushes notebook changes → opens PR → CI runs pytest + nutter tests against staging workspace → peer review → merge to main → CD deploys bundle to production.
>
> **Testing frameworks**:
>
> - **nutter**: Databricks-native notebook testing framework that runs notebooks and asserts outputs
> - **pytest**: for Python modules and utility functions outside notebooks
> - **Integration tests**: run actual Spark jobs against staging data to validate end-to-end
>
> ### Follow-up Questions
>
> - How do you handle notebook-specific vs repo-based development?
> - What testing frameworks work in CI for Databricks?
> - How do you manage environment-specific configs (e.g., different cluster sizes for dev vs prod)?

---

## Question 2: Production Pipeline Failure Debugging

**Level**: Both
**Type**: Scenario

**Scenario / Question**:
A critical nightly ETL pipeline failed at 3 AM. Walk me through your systematic approach to diagnose and recover.

> [!success]- Answer Framework
>
> **Short Answer**: Systematic triage: (1) check the Runs tab in the Jobs UI for error logs and stack traces, (2) check cluster health for OOM errors, spot instance preemption, or driver crashes, (3) inspect data quality for source schema drift or format changes, (4) use Delta Time Travel to restore corrupted tables, (5) fix the root cause and trigger a Repair Run for failed tasks only.
>
> ### Key Points to Cover
>
> - Jobs UI Runs tab: error message, stack trace, task-level status
> - Cluster issues: OOM, spot instance reclamation, driver crash, disk space
> - Data issues: schema drift, null keys, file format changes, missing partitions
> - DLT event log or Spark UI for input record anomalies
> - Recovery: Delta Time Travel `RESTORE TABLE`, Repair Run for partial failures
> - Post-mortem: root cause documentation, monitoring improvements
>
> ### Example Answer
>
> I follow a systematic five-step triage process:
>
> **Step 1 — Check the Jobs UI**: Open the failed run in the Runs tab. Read the error message and stack trace. Identify which task failed (in a multi-task job) and at what stage (read, transform, write). Common errors:
>
> - `OutOfMemoryError` → cluster undersized for data volume
> - `AnalysisException: cannot resolve column` → schema drift in source
> - `FileNotFoundException` → upstream data not delivered
>
> **Step 2 — Check cluster health**: Was the cluster still running when the job failed? Common cluster-level issues:
>
> - Spot instance preemption (especially on AWS) — the cloud provider reclaimed workers mid-job
> - Driver OOM — the driver ran out of memory collecting results or managing broadcast joins
> - Auto-termination fired before job completed (misconfigured idle timeout)
>
> **Step 3 — Inspect the data**: If the code and cluster are fine, the data changed. Check:
>
> - Did the source system change its schema? New columns, renamed fields, type changes?
> - Are there unexpected nulls in join keys causing massive row explosion?
> - Did the upstream file delivery arrive late or in a different format?
>
> **Step 4 — Recover corrupted tables**: If the pipeline partially wrote bad data before failing, use Delta Time Travel to restore:
>
> ```sql
> -- Check table history to find the last good version
> DESCRIBE HISTORY prod.silver.transactions;
>
> -- Restore to the last known good version
> RESTORE TABLE prod.silver.transactions TO VERSION AS OF 354;
> ```
>
> **Step 5 — Fix and re-run**: Fix the root cause (code change, cluster resize, data validation), then use the **Repair Run** feature in the Jobs UI to re-execute only the failed tasks — not the entire pipeline. This saves time and avoids re-processing already-succeeded tasks.
>
> **Post-mortem**: Document the root cause, add monitoring to detect the condition earlier (e.g., schema drift check before processing), and add alerting thresholds.
>
> ### Follow-up Questions
>
> - How do you prevent the same failure from recurring?
> - What metrics would you monitor to catch issues before they cause failures?
> - How do you handle partial pipeline completion where some downstream tables consumed bad data?

---

## Question 3: Monitoring & Alerting Strategy

**Level**: Both
**Type**: System Design

**Scenario / Question**:
You're responsible for 50+ production ETL pipelines. How do you design a monitoring and alerting strategy?

> [!success]- Answer Framework
>
> **Short Answer**: Configure Databricks Workflows with email and webhook alerts for job success/failure/SLA breach, write execution metadata (row counts, durations, error messages) to Delta audit tables via structured logging, integrate with Slack/PagerDuty for on-call alerting, monitor cluster resources through the compute metrics tab, and build Databricks SQL dashboards showing pipeline health trends and SLA compliance.
>
> ### Key Points to Cover
>
> - Databricks Workflows: built-in email + webhook alerts for success/failure/SLA
> - Execution metadata: write row counts, durations, error messages to Delta log tables
> - Structured error handling: try/except blocks logging to audit tables
> - External integration: Slack, PagerDuty, or Opsgenie for on-call alerting
> - Cluster monitoring: Ganglia UI / compute metrics tab for CPU, memory, disk
> - Dashboards: Databricks SQL dashboards for pipeline health trends
> - SLA tracking: time-based alerts for late-arriving data
>
> ### Example Answer
>
> For 50+ production pipelines, I implement a three-tier monitoring strategy:
>
> **Tier 1 — Built-in Databricks Alerts**: Configure each Workflow job with email notifications for failure and webhook notifications that post to Slack. Set SLA breach alerts so that if a pipeline hasn't completed by its expected time, the on-call engineer is notified.
>
> **Tier 2 — Custom audit logging**: Every pipeline writes execution metadata to a central Delta audit table. This gives you historical trends, not just pass/fail:
>
> ```python
> from pyspark.sql.functions import current_timestamp, lit
> from datetime import datetime
>
> def log_pipeline_execution(spark, pipeline_name, status,
>                            row_count, error_msg=None):
>     """Log pipeline execution metadata to audit table."""
>     log_data = [{
>         "pipeline_name": pipeline_name,
>         "status": status,
>         "row_count": row_count,
>         "error_message": error_msg,
>         "execution_timestamp": datetime.now().isoformat()
>     }]
>     log_df = spark.createDataFrame(log_data)
>     (log_df.write
>         .mode("append")
>         .saveAsTable("ops.monitoring.pipeline_audit_log"))
>
>
> # Usage in pipeline code with error handling
> try:
>     result_count = process_daily_sales(spark)
>     log_pipeline_execution(
>         spark, "daily_sales_etl", "SUCCESS", result_count
>     )
> except Exception as e:
>     log_pipeline_execution(
>         spark, "daily_sales_etl", "FAILED", 0, str(e)
>     )
>     raise  # Re-raise so the job still shows as failed
> ```
>
> **Tier 3 — Dashboards and trend analysis**: Build a Databricks SQL dashboard querying the audit table to show:
>
> - Pipeline success rate over the last 30 days
> - Average execution duration with anomaly detection (sudden 3x increase = investigation needed)
> - Row count trends (sudden drop = missing source data, sudden spike = duplicate ingestion)
> - SLA compliance: percentage of pipelines completing before their deadline
>
> ```sql
> -- Dashboard query: pipeline health summary
> SELECT
>     pipeline_name,
>     COUNT(*) AS total_runs,
>     SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successes,
>     ROUND(AVG(row_count), 0) AS avg_row_count,
>     MAX(execution_timestamp) AS last_run
> FROM ops.monitoring.pipeline_audit_log
> WHERE execution_timestamp >= current_date() - INTERVAL 30 DAYS
> GROUP BY pipeline_name
> ORDER BY successes * 1.0 / total_runs ASC;
> ```
>
> **External alerting**: Webhook notifications from Databricks trigger PagerDuty for critical pipelines (revenue, regulatory) and Slack for non-critical pipelines. This prevents alert fatigue — not every failure needs a 3 AM page.
>
> ### Follow-up Questions
>
> - How do you distinguish between transient failures (retry-safe) and persistent failures (needs human intervention)?
> - What SLAs do you set for different pipeline types (batch vs streaming vs reporting)?
> - How do you handle alert fatigue when managing 50+ pipelines?

---

## Question 4: Secrets Management

**Level**: Both
**Type**: Conceptual

**Scenario / Question**:
A junior engineer hardcoded an API key in a notebook. How should credentials be managed in Databricks?

> [!success]- Answer Framework
>
> **Short Answer**: Use Databricks Secret Scopes — either Databricks-backed (stored within Databricks) or Key Vault-backed (Azure Key Vault, AWS Secrets Manager) — accessed via `dbutils.secrets.get(scope, key)`, which automatically redacts values in notebook output. Never hardcode secrets in notebooks. Use scope ACLs to control access and service principals for automated jobs instead of personal tokens.
>
> ### Key Points to Cover
>
> - Secret Scopes: Databricks-backed vs Azure Key Vault-backed (or AWS Secrets Manager-backed)
> - Access via `dbutils.secrets.get(scope="my_scope", key="api_key")` — values redacted in output
> - Never hardcode secrets — they persist in notebook revisions and logs
> - Scope ACLs: MANAGE vs READ permissions for different groups
> - Service principals for automated jobs instead of personal access tokens
> - Rotation strategies: periodic key rotation without pipeline downtime
>
> ### Example Answer
>
> Hardcoded secrets are a critical security incident — the key is now in notebook revision history, potentially in Git, and visible to anyone with notebook access. Here is the correct approach:
>
> **Step 1 — Revoke the exposed key immediately**. Rotate the API key in the external system so the exposed credential is no longer valid.
>
> **Step 2 — Set up Secret Scopes**:
>
> Databricks offers two types of secret scopes:
>
> - **Databricks-backed**: secrets stored within Databricks, managed via CLI. Good for single-cloud, simpler setups.
> - **Key Vault-backed** (Azure) or **AWS Secrets Manager-backed**: enterprise-grade, centralized secret management with audit logging and automatic rotation.
>
> ```bash
> # Create a Databricks-backed secret scope
> databricks secrets create-scope my_scope
>
> # Store a secret
> databricks secrets put-secret my_scope api_key --string-value "sk-abc123..."
>
> # List scopes and secrets
> databricks secrets list-scopes
> databricks secrets list-secrets my_scope
> ```
>
> **Step 3 — Access secrets in notebooks**:
>
> ```python
> # Correct: secret is automatically redacted in notebook output
> api_key = dbutils.secrets.get(scope="my_scope", key="api_key")
>
> # If you try to print it, Databricks shows [REDACTED]
> print(api_key)  # Output: [REDACTED]
>
> # Use the secret in your API call
> import requests
> response = requests.get(
>     "https://api.example.com/data",
>     headers={"Authorization": f"Bearer {api_key}"}
> )
> ```
>
> **Step 4 — Control access with scope ACLs**:
>
> ```bash
> # Grant READ to data engineers (can use secrets, can't manage them)
> databricks secrets put-acl my_scope data_engineers READ
>
> # Grant MANAGE to platform team (can add/remove secrets)
> databricks secrets put-acl my_scope platform_team MANAGE
> ```
>
> **Step 5 — Use service principals for production jobs**: Instead of personal access tokens (tied to an individual), create a service principal with its own token. If an engineer leaves, their personal token is revoked without breaking production jobs.
>
> **Step 6 — Rotation strategy**: Schedule periodic key rotation. During rotation, store the new key alongside the old one (e.g., `api_key_v2`), update pipeline code to use the new key, then delete the old one. Key Vault-backed scopes support automatic rotation policies.
>
> ### Follow-up Questions
>
> - What is the difference between Databricks-backed and Key Vault-backed scopes?
> - How do you rotate secrets without pipeline downtime?
> - How do service principals differ from personal access tokens?

---

## Question 5: Cost Optimization & Cluster Strategy

**Level**: Both
**Type**: Comparison

**Scenario / Question**:
Your team's Databricks bill has tripled in 6 months. Walk me through your approach to diagnose and optimize costs.

> [!success]- Answer Framework
>
> **Short Answer**: Audit cluster usage patterns — replace all-purpose clusters with job clusters for scheduled work (50%+ savings), enable autoscaling with conservative min/max bounds, use spot instances for fault-tolerant batch jobs (60-90% cheaper), right-size instance types based on Spark UI utilization metrics, evaluate Photon for SQL-heavy workloads (higher DBU rate but 2-8x faster = net cheaper), and enforce auto-termination on all interactive clusters.
>
> ### Key Points to Cover
>
> - All-purpose vs job clusters: job clusters auto-terminate after the job, 50%+ cheaper
> - DBU pricing: varies by compute type (Jobs Compute vs All-Purpose) and tier
> - Autoscaling: set min/max workers based on actual workload patterns
> - Spot/preemptible instances: 60-90% cheaper, suitable for batch, risky for streaming
> - Right-sizing: analyze Spark UI for CPU/memory utilization
> - Photon: higher DBU rate but faster execution for scan-heavy SQL workloads
> - Serverless compute: zero management, premium pricing, best for bursty workloads
> - Auto-termination: 10-15 minutes for interactive clusters
>
> ### Example Answer
>
> I approach cost optimization in three phases: diagnose, quick wins, and structural changes.
>
> **Phase 1 — Diagnose where the money goes**:
>
> Check the account console billing dashboard. Typical findings:
>
> - Engineers running all-purpose clusters 24/7 for jobs that run 2 hours/day
> - Oversized clusters for small workloads (i3.4xlarge when i3.xlarge would suffice)
> - No auto-termination configured — idle clusters running overnight
> - Multiple teams each running their own cluster for identical workloads
>
> **Phase 2 — Quick wins** (immediate savings):
>
> | Change | Savings |
> | ------ | ------- |
> | Switch scheduled jobs from all-purpose to job clusters | 50%+ per job |
> | Enable auto-termination (10 min) on all interactive clusters | 30-60% on idle time |
> | Add spot instances as worker nodes for batch jobs | 60-90% on worker compute |
> | Set autoscaling min_workers to 1 (not 10) for dev clusters | Proportional to over-provisioning |
>
> **Phase 3 — Structural optimization**:
>
> **Right-sizing**: Analyze the Spark UI after jobs complete. If executor memory utilization is consistently below 40%, downsize to a smaller instance type. If CPU utilization is low but I/O wait is high, switch to storage-optimized instances.
>
> **Photon evaluation**: For SQL-heavy workloads (dashboard queries, large aggregations), Photon-enabled clusters charge a higher DBU rate but execute 2-8x faster. Run the same workload on both and compare total DBU cost:
>
> ```python
> # Cost comparison calculation
> standard_dbus = 10  # DBUs per hour
> standard_runtime = 4  # hours
> standard_cost = standard_dbus * standard_runtime  # 40 DBUs
>
> photon_dbus = 15    # DBUs per hour (higher rate)
> photon_runtime = 1  # hours (4x faster)
> photon_cost = photon_dbus * photon_runtime  # 15 DBUs (63% cheaper!)
> ```
>
> **Serverless compute**: Best for bursty or variable workloads where you cannot predict cluster size. Premium per-DBU pricing but zero idle cost and zero management overhead. Ideal for SQL warehouses with unpredictable query patterns.
>
> **Spot instance strategy**: Use spot instances for worker nodes on fault-tolerant batch ETL jobs. Never use spot for the driver node. For streaming jobs, prefer on-demand — spot reclamation causes checkpoint recovery delays.
>
> **Team cost allocation**: Tag clusters and jobs with team identifiers, then use the billing API or account console to generate per-team cost reports. This creates accountability and helps identify which team's usage is growing fastest.
>
> ### Follow-up Questions
>
> - How do you calculate the ROI of Photon vs standard clusters?
> - When would you choose serverless over provisioned clusters?
> - How do you allocate costs across teams using cluster tags and billing reports?

---

## Question 6: Disaster Recovery Planning

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
Your company requires a disaster recovery plan for its Databricks Lakehouse. Design a comprehensive DR strategy.

> [!success]- Answer Framework
>
> **Short Answer**: A comprehensive DR strategy combines cross-region storage replication (S3 CRR or ADLS GRS) for data durability, Delta table versioning for point-in-time recovery, deep clones of critical Gold tables to a DR region, workspace configuration backup via Terraform state files, Git-stored job definitions via DABs for quick re-deployment, and quarterly DR drills with defined RTO/RPO targets per data tier.
>
> ### Key Points to Cover
>
> - Cross-region storage replication: S3 CRR, ADLS geo-redundant storage
> - Delta versioning: built-in point-in-time recovery via `RESTORE TABLE`
> - Deep clones of critical Gold tables to DR region
> - Workspace config backup via Terraform state files
> - RTO vs RPO: define targets per data tier (Gold = strict, Bronze = relaxed)
> - Quarterly DR testing: simulate region outage, full restore, validate integrity
> - Unity Catalog / metastore recovery: export metadata, recreate in DR region
> - Job definitions in Git (DABs) for rapid re-deployment
>
> ### Example Answer
>
> A Lakehouse DR strategy must address four dimensions: data, metadata, compute, and orchestration.
>
> **Dimension 1 — Data replication**:
>
> The foundation is cross-region storage replication:
>
> - **AWS**: S3 Cross-Region Replication (CRR) — asynchronous, typically < 15 minutes lag
> - **Azure**: ADLS with Geo-Redundant Storage (GRS) or Geo-Zone-Redundant Storage (GZRS)
> - **GCP**: Cloud Storage dual-region or multi-region buckets
>
> Not all tables need cross-region replication. Tier your tables:
>
> | Tier | Tables | RPO | Replication |
> | ---- | ------ | --- | ----------- |
> | Critical | Gold reporting, regulatory | < 1 hour | Cross-region + deep clones |
> | Important | Silver curated | < 4 hours | Cross-region replication |
> | Rebuildable | Bronze raw (can re-ingest) | < 24 hours | Storage replication only |
>
> **Dimension 2 — Point-in-time recovery with Delta**:
>
> Delta Lake's transaction log provides built-in point-in-time recovery without separate backup infrastructure:
>
> ```sql
> -- Check available versions
> DESCRIBE HISTORY prod.gold.revenue_report;
>
> -- Restore to a specific version
> RESTORE TABLE prod.gold.revenue_report TO VERSION AS OF 142;
>
> -- Or restore to a specific timestamp
> RESTORE TABLE prod.gold.revenue_report
> TO TIMESTAMP AS OF '2026-03-01T06:00:00';
> ```
>
> For critical Gold tables, create periodic deep clones to the DR region:
>
> ```sql
> -- Deep clone copies data + metadata to a separate location
> CREATE TABLE dr_region.gold.revenue_report
> DEEP CLONE prod.gold.revenue_report
> LOCATION 's3://dr-bucket-us-west-2/gold/revenue_report';
> ```
>
> **Dimension 3 — Workspace and metadata recovery**:
>
> - **Terraform**: All workspace resources (cluster policies, instance pools, permissions, secret scopes) defined as Terraform code. State files stored in a remote backend (S3/GCS). To recover: `terraform apply` against the DR workspace.
> - **Unity Catalog**: Metastore metadata (catalogs, schemas, table definitions, permissions) can be exported and recreated. If using a single metastore per region, the DR region needs its own metastore with replicated catalog structure.
> - **DABs**: All job definitions, pipeline configs, and cluster specs stored in Git. Re-deploy to DR workspace with `databricks bundle deploy --target dr`.
>
> **Dimension 4 — RTO and RPO definitions**:
>
> - **RPO (Recovery Point Objective)**: How much data can you lose? Defined by replication lag.
> - **RTO (Recovery Time Objective)**: How quickly must you be operational? Defined by re-deployment speed.
>
> For a typical enterprise:
>
> - Gold/reporting tier: RPO < 1 hour, RTO < 2 hours
> - Silver/curated tier: RPO < 4 hours, RTO < 4 hours
> - Bronze/raw tier: RPO < 24 hours, RTO < 8 hours (can re-ingest from source)
>
> **Quarterly DR testing**: Simulate a region outage every quarter. Execute the full playbook — spin up DR workspace, restore tables from clones, re-deploy jobs, run validation queries, and measure actual RTO. Document gaps and update the runbook.
>
> ### Follow-up Questions
>
> - How do you prioritize which tables get cross-region replication vs periodic deep clones?
> - What is the cost-benefit of active-active vs active-passive DR?
> - How does Unity Catalog affect DR strategy when metastores are region-scoped?

---

**[← Previous: Governance & Security](./10-governance-security.md) | [↑ Back to Interview Prep](./README.md) | [Next: Data Compliance & Quality →](./12-data-compliance-quality.md)**
