---
title: Asset Bundles and Git Folders
type: study-material
tags:
  - data-engineer-associate
  - cicd
  - asset-bundles
  - git-folders
status: published
---

# Asset Bundles and Git Folders

## Overview

**Databricks Asset Bundles (DAB)** package Lakeflow Jobs, Lakeflow Declarative Pipelines, notebooks, ML models, and dashboards into a YAML-defined deployment unit. **Git folders** host the source code in the workspace and tie deployments to a branch. Together they give the DE Associate exam's CI/CD coverage: source code in Git → bundle YAML → deploy to dev / staging / prod targets.

> [!abstract]
>
> - **Asset Bundle** = `databricks.yml` (entry) + `resources/*.yml` (jobs, pipelines, etc.) + source code
> - **Targets**: `development`, `staging`, `production` — each with its own workspace, identity, and overrides
> - **`mode: development`** auto-prefixes resource names and pauses schedules
> - **`mode: production`** runs as the configured service principal with no name prefix
> - **Git folders** sync a Git repo into the workspace (formerly known as Repos)
> - Deploy with `databricks bundle deploy --target production`

> [!tip] What the Exam Tests
>
> - Recognising the YAML shape of a bundle (`bundle:`, `resources:`, `targets:`)
> - Difference between dev and prod modes
> - When to use Git folders vs the workspace file browser
> - That production bundles should run as a service principal, not a personal token

---

## Bundle anatomy

```yaml
# databricks.yml
bundle:
  name: orders_pipeline

include:
  - resources/*.yml      # jobs, pipelines, dashboards

variables:
  catalog:
    description: "UC catalog for the pipeline"
    default: main_dev
  schema:
    description: "UC schema"
    default: bronze

targets:
  development:
    mode: development    # prefixes resource names with [dev <user>]; pauses schedules
    workspace:
      host: https://e2-demo-field-eng.cloud.databricks.com

  production:
    mode: production     # no prefix; runs as the configured service principal
    workspace:
      host: https://prod.cloud.databricks.com
    variables:
      catalog: main_prod
    run_as:
      service_principal_name: orders-pipeline-sp
```

```yaml
# resources/jobs.orders.yml
resources:
  jobs:
    orders_ingest:
      name: orders_ingest
      tasks:
        - task_key: bronze_load
          notebook_task:
            notebook_path: ../notebooks/bronze_load
            base_parameters:
              catalog: ${var.catalog}
              schema:  ${var.schema}
          job_cluster_key: shared_cluster
      job_clusters:
        - job_cluster_key: shared_cluster
          new_cluster:
            spark_version: 15.4.x-scala2.12
            node_type_id: i3.xlarge
            num_workers: 2
      schedule:
        quartz_cron_expression: "0 0 * * * ?"   # hourly
        timezone_id: UTC
```

## Deployment commands

```bash
# Validate
databricks bundle validate

# Deploy to development (default target if --target is omitted)
databricks bundle deploy --target development

# Run a specific job from the bundle
databricks bundle run orders_ingest --target development

# Promote to production
databricks bundle deploy --target production
```

## Dev vs Prod mode side-by-side

| Aspect | `development` | `production` |
| :--- | :--- | :--- |
| Resource names | `[dev <username>] orders_ingest` | `orders_ingest` |
| Schedules | Paused on deploy | Active |
| Run-as identity | Deployer's identity | Service principal (configured) |
| Risk profile | Safe for iteration | Treat every deploy as a change-management event |

## Git folders

Git folders are the workspace's view of a Git repository.

| Operation | Where it happens |
| :--- | :--- |
| Create a Git folder | Workspace UI: **+ New** → **Git folder** → paste repo URL |
| Pull / branch / commit | The Git-folder UI (or CLI) |
| Push / open PR | The remote Git host (GitHub, GitLab, Azure DevOps, Bitbucket) |

A typical workflow:

1. Developer creates a feature branch in the Git folder, edits notebooks + bundle YAML
2. `databricks bundle deploy --target development` deploys their dev copy
3. Pull request reviewed + merged to `main`
4. CI runs `databricks bundle deploy --target production` against the production target
5. Production runs under the configured service principal

## Use Cases

- **Reproducible deployments** — every change to production traces back to a Git commit + a bundle target
- **Multi-environment promotion** — dev → staging → prod with the same YAML, different overrides
- **Pull-request review** — bundle YAML diffs are reviewable like any other code
- **CI/CD** — GitHub Actions / Azure DevOps run `bundle deploy` after a merge to `main`

## Common Issues & Errors

- **Personal access tokens in production** — fragile and tied to a human user; use a service principal
- **Mutating production schedules manually** — drift from the bundle; the next deploy may unexpectedly revert
- **Skipping `databricks bundle validate`** — catches YAML errors before deploy
- **Forgetting `--target production`** — `bundle deploy` defaults to the first listed target if none is specified

## Exam Tips

> [!tip]
>
> - `mode: development` vs `mode: production` — know the resource-name and schedule differences
> - Production = service principal, not a personal token
> - `databricks bundle deploy --target <name>` is the canonical deploy command
> - Git folders are the *current* term (formerly Repos)

## Key Takeaways

- Asset Bundles = YAML + source code + targets
- Dev mode prefixes resource names and pauses schedules; prod mode does neither
- Git folders sync a repo into the workspace
- The combination = reproducible deploys + CI/CD-ready workflow

## Related Topics

- [Monitoring Basics](./02-monitoring-basics.md)
- [DE Pro — Asset Bundles (deeper)](../../data-engineer-professional/06-debugging-and-deploying/01-asset-bundles-part1.md)
- [Hands-on Lab 03 — Lakeflow Declarative Pipelines](../../../labs/03-lakeflow-declarative-pipelines.md)

## Official Documentation

- [Databricks Asset Bundles](https://docs.databricks.com/en/dev-tools/bundles/index.html)
- [Bundle settings reference](https://docs.databricks.com/en/dev-tools/bundles/reference.html)
- [Git folders documentation](https://docs.databricks.com/en/repos/index.html)

---

**[↑ Back to CI/CD and Monitoring](./README.md) | [Next: Monitoring Basics →](./02-monitoring-basics.md)**
