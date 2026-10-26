---
title: Declarative Automation Bundles
type: study-material
tags:
  - data-engineer-associate
  - cicd
  - declarative-automation-bundles
  - asset-bundles
  - databricks-cli
status: published
---

# Declarative Automation Bundles

## Overview

**Declarative Automation Bundles** (formerly **Databricks Asset Bundles**, often abbreviated **DABs**) describe Lakeflow Jobs, Lakeflow (Declarative) Pipelines, dashboards, and other workspace assets as YAML alongside your source code. The **Databricks CLI** validates and deploys them. **Targets** (dev, test, prod) with **variables** and **overrides** let one codebase be promoted across environments, which is the backbone of the exam's CI/CD domain.

> [!note] Platform update (Oct 2026)
> "Databricks Asset Bundles has been renamed to Declarative Automation Bundles" (Mar 16, 2026, [bundles release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles)). The CLI command group is still `databricks bundle` and the root file is still `databricks.yml`. The exam guide uses the new name with "(formerly Databricks Asset Bundles)".

> [!abstract]
>
> - A bundle is `databricks.yml` (root) plus included resource YAML plus source code, versioned in Git
> - **Variables** (`${var.name}`) are resolved at deploy time from `--var`, `BUNDLE_VAR_<name>`, `variable-overrides.json`, target-level values, or the default, **in that order of precedence**
> - **Targets** override settings per environment. `mode: development` prefixes names and pauses triggers. `mode: production` adds safety validations
> - CLI: `databricks bundle validate`, `deploy -t <target>`, `run`, `summary`, `plan`, `destroy`

> [!tip] What the Exam Tests
>
> - Exam guide skills: environment-specific configuration with bundle variables and overrides across dev, test, and prod; deploying bundles to package and promote jobs, pipelines, and other assets; using the Databricks CLI to validate, deploy, and manage bundles in automated CI/CD
> - Keeping secrets out of YAML (`BUNDLE_VAR_` environment variables fed by CI secrets)
> - Differences between development and production mode
> - Which CLI command does what

---

## Bundle Anatomy

```text
orders-pipeline/
├── databricks.yml            # bundle name, includes, variables, targets
├── resources/
│   ├── orders_job.yml        # Lakeflow Job definition
│   └── orders_pipeline.yml   # Lakeflow (Declarative) Pipeline definition
├── src/
│   ├── ingest_orders.py
│   └── silver_orders.sql
└── tests/
```

```yaml
# databricks.yml
bundle:
  name: orders_pipeline

include:
  - resources/*.yml

variables:
  catalog:
    description: Unity Catalog catalog for this environment
    default: dev
  warehouse_id:
    description: SQL warehouse used by SQL tasks
    lookup:
      warehouse: "Shared Serverless"     # resolved to an ID at deploy time
  db_password:
    description: Source database password (never committed; supplied by CI)

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://dev-workspace.cloud.databricks.com

  test:
    workspace:
      host: https://test-workspace.cloud.databricks.com
    variables:
      catalog: test

  prod:
    mode: production
    workspace:
      host: https://prod-workspace.cloud.databricks.com
      root_path: /Workspace/Shared/.bundle/${bundle.name}/${bundle.target}
    variables:
      catalog: prod
    run_as:
      service_principal_name: 6d5c-orders-sp-application-id
```

```yaml
# resources/orders_job.yml
resources:
  jobs:
    orders_job:
      name: orders_job
      tasks:
        - task_key: refresh_pipeline
          pipeline_task:
            pipeline_id: ${resources.pipelines.orders_pipeline.id}
        - task_key: publish
          depends_on: [{task_key: refresh_pipeline}]
          notebook_task:
            notebook_path: ../src/ingest_orders.py
            base_parameters:
              catalog: ${var.catalog}
      schedule:
        quartz_cron_expression: "0 0 2 * * ?"
        timezone_id: UTC
```

## Variables and Overrides

Declare variables in a top-level `variables` mapping and reference them as `${var.<name>}` ([Substitutions and variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)).

| Value source | Example | Precedence |
| :--- | :--- | :---: |
| `--var` CLI option | `databricks bundle deploy -t prod --var="catalog=prod"` | **1** (highest) |
| `BUNDLE_VAR_<name>` environment variable | `export BUNDLE_VAR_db_password=$DB_PASSWORD` (from GitHub secrets) | 2 |
| `.databricks/bundle/<target>/variable-overrides.json` | `{"catalog": "prod"}` | 3 |
| `variables` under a **target** | `targets.prod.variables.catalog: prod` | 4 |
| `default` in the top-level declaration | `default: dev` | 5 (lowest) |

- **`lookup`** resolves an object's ID by name (`cluster`, `job`, `pipeline`, `warehouse`, ...). It errors if the name matches no object or more than one
- `type: complex` allows structured values, such as a whole cluster definition
- Variables are resolved at **deploy** time. Use **job parameters** for values that change on every run
- Built-in substitutions: `${bundle.name}`, `${bundle.target}` (use this, not the old `${bundle.environment}`), `${workspace.current_user.userName}`, `${resources.jobs.<name>.id}`

> [!tip] Secrets in CI
> Never hard-code passwords in `databricks.yml` or notebooks. Declare a variable with no default and have the CI runner export `BUNDLE_VAR_<name>` from its secret store, so the value never touches Git. For runtime credentials, notebooks can read Databricks secrets with `dbutils.secrets.get`.

**Target overrides** aren't limited to variables. Any top-level mapping (workspace host, `run_as`, permissions, or resource settings such as cluster size or schedule) can be overridden per target, so the same `resources/*.yml` serves every environment.

## Deployment Modes

| | `mode: development` | `mode: production` |
| :--- | :--- | :--- |
| Resource names | Prefixed `[dev ${workspace.current_user.short_name}]` and tagged `dev` | Unchanged |
| Schedules and triggers | **Paused** on deployed resources | Active |
| Concurrent runs | Enabled, for fast iteration | As configured |
| Pipelines | Marked `development: true` | Validated as `development: false` |
| Cluster override | `--cluster-id` / `cluster_id` allowed | **Not allowed** |
| Git branch | — | Must match the target's configured branch (override with `--force`) |
| Identity | The deployer | Service principal recommended. Validations check `run_as`, `permissions`, and that paths aren't user-specific |
| Deployment lock | Disabled | Enabled |

**Presets** customize target behaviour beyond the mode defaults, for example a name prefix, trigger pause status, or job concurrency. Individual resource settings override presets. Source: [Deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes).

## The `databricks bundle` CLI

| Command | Purpose |
| :--- | :--- |
| `databricks bundle init` | "Initialize a new bundle using a bundle template" |
| `databricks bundle validate` | "Validate bundle configuration files are syntactically correct" |
| `databricks bundle plan` | "Show the deployment plan for the current bundle configuration" |
| `databricks bundle deploy -t <target>` | "Deploy a bundle to the remote workspace" |
| `databricks bundle run <resource> -t <target>` | "Run a job, pipeline, app, or script" |
| `databricks bundle summary` | Summarize the bundle's identity and deployed resources, with workspace links |
| `databricks bundle generate` | Generate bundle YAML for a resource that already exists in the workspace |
| `databricks bundle deployment bind` / `unbind` | Link a bundle resource to an existing workspace resource, or remove that link |
| `databricks bundle destroy` | "Delete jobs, pipelines, other resources, and artifacts that were previously deployed" |

Global flags: `-t, --target` selects the target, and `--var="key=value"` sets variables. Source: [bundle command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands).

## A CI/CD Pipeline With Bundles

```yaml
# .github/workflows/deploy.yml (sketch)
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DATABRICKS_HOST: ${{ secrets.PROD_HOST }}
      DATABRICKS_CLIENT_ID: ${{ secrets.SP_CLIENT_ID }}          # service principal OAuth
      DATABRICKS_CLIENT_SECRET: ${{ secrets.SP_CLIENT_SECRET }}
      BUNDLE_VAR_db_password: ${{ secrets.DB_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main
      - run: databricks bundle validate -t prod
      - run: databricks bundle deploy -t prod
      - run: databricks bundle run orders_job -t prod
```

1. **Feature branch** → `databricks bundle deploy -t dev` (personal, prefixed, paused copy)
2. **PR merged to `main`** → CI runs `validate`, then `deploy -t test` and integration tests
3. **Release** → CI runs `deploy -t prod` as the **service principal**. The same YAML is used, with target overrides supplying prod values

## Use Cases

- **Promote one pipeline across three workspaces** with target-level `catalog` and `host` overrides
- **Secrets from CI**: `BUNDLE_VAR_db_password` injected from the CI secret store at deploy time
- **Adopt existing jobs**: `bundle generate` turns a UI-built job into YAML, and `deployment bind` links it
- **Lakeflow Connect ingestion as code**: ingestion pipelines are deployed with bundles like any other pipeline

## Common Issues & Errors

### Password Committed to `databricks.yml`

**Scenario:** A reviewer finds a database password in the bundle's `variables` default.
**Fix:** Remove the default, rotate the password, and supply it through `BUNDLE_VAR_<name>` from CI secrets, or read it at runtime with `dbutils.secrets.get`.

### Production Deploy Rejected

**Scenario:** `databricks bundle deploy -t prod` fails validation.
**Fix:** Production mode checks the Git branch, `run_as`/permissions, and user-specific paths. Deploy from the configured branch as a service principal, with shared `root_path` values.

### Dev Deployment Schedules Never Fire

**Scenario:** A job deployed with `-t dev` never runs on its schedule.
**Fix:** Development mode pauses schedules and triggers by design. Run it with `databricks bundle run`, or unpause it explicitly in dev.

### Wrong Environment Deployed

**Scenario:** `databricks bundle deploy` without `-t` deploys to dev when prod was intended.
**Fix:** Without `-t`, the bundle uses the target marked `default: true`. Always pass `-t` in CI.

### Variable Value Ignored

**Scenario:** A target sets `catalog: prod`, but the deploy still uses `dev`.
**Fix:** A higher-precedence source is winning: a `--var` flag, a `BUNDLE_VAR_catalog` environment variable, or `variable-overrides.json`. Check those first.

## Exam Tips

> [!tip] Exam Tips
>
> - **Declarative Automation Bundles** = the former **Databricks Asset Bundles**. Same CLI (`databricks bundle`), same `databricks.yml`
> - Secrets → `BUNDLE_VAR_<name>` environment variables (or `--var`), never committed YAML
> - Variable precedence: `--var` > `BUNDLE_VAR_` > `variable-overrides.json` > target `variables` > `default`
> - `mode: development` prefixes names and **pauses** schedules. `mode: production` validates branch, identity, and paths
> - `validate` checks the config, `deploy -t` deploys, `run` runs a job or pipeline, `destroy` removes deployed resources

## Key Takeaways

- Bundles make jobs, pipelines, and other assets versioned, reviewable, and repeatable
- Targets plus variables and overrides promote one codebase from dev to test to prod
- Production deploys run as a service principal, from CI, on the release branch
- The Databricks CLI (`databricks bundle ...`) is the automation interface

## Related Topics

- [Git Folders](./01-git-folders.md)
- [Lakeflow Jobs and Tasks](../04-working-with-lakeflow-jobs/01-lakeflow-jobs-and-tasks.md)
- [DE Pro — Declarative Automation Bundles (deeper)](../../data-engineer-professional/08-debugging-and-deploying/03-declarative-automation-bundles-part1.md)
- [Hands-on Lab 03 — Lakeflow Declarative Pipelines](../../../labs/03-lakeflow-declarative-pipelines.md)

## Official Documentation

- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Substitutions and variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)
- [Deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes)
- [bundle command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)
- [Bundles release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles)

---

**[← Previous: Git Folders](./01-git-folders.md) | [↑ Back to Implementing CI/CD](./README.md)**
