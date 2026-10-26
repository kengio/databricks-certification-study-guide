---
title: Declarative Automation Bundles — Part 2
type: study-material
tags:
  - data-engineer-professional
  - declarative-automation-bundles
  - deployment
  - cicd
status: published
---

# Declarative Automation Bundles — Part 2

## Overview

This part covers file sync and deployment state, running bundles from CI/CD, bundle templates, common patterns, and the errors you hit most often when deploying Declarative Automation Bundles.

> For bundle structure, resource definitions, variables, commands, targets, modes, presets, `run_as`, and artifacts, see [Part 1](./03-declarative-automation-bundles-part1.md).

> [!abstract]
>
> - `sync` decides which local files reach the workspace (`.gitignore` syntax, applied on top of the bundle's `.gitignore`)
> - Deployment state lives in the workspace under `workspace.state_path`; the **direct deployment engine** replaced Terraform as the default
> - CI/CD runs `databricks bundle validate` → `deploy -t <target>` → `run`, authenticated as a service principal (ideally with workload identity federation)
> - `databricks bundle init` starts from a default or custom template

> [!tip] What the Exam Tests
>
> - Deploying the same bundle to dev, staging, and prod from source control with CI/CD
> - Recognizing the right fix for common deploy failures (missing variables, permissions, existing resources, stale locks)
> - Knowing that bundles, not manual UI recreation or workspace imports, give reproducible multi-environment deployment

---

## Sync and State Management

### Sync Configuration

```yaml
# databricks.yml

sync:
  include:
    - "src/**"
    - "resources/**"
  exclude:
    - "**/__pycache__"
    - "*.pyc"
    - "tests/**"
```

- `include` and `exclude` use standard `.gitignore` pattern syntax.
- `exclude` is applied **on top of** the bundle root's `.gitignore`, so files Git ignores are not synced by default.
- Patterns only filter files inside folders covered by `sync.paths`. They cannot pull in files from outside those paths.
- For one-way, local-to-workspace syncing during development, use `databricks bundle sync --watch`.

### Deployment State

```text
Workspace (source of truth for deployments):
${workspace.root_path}/
├── artifacts/     # artifact_path: built wheels and JARs
├── files/         # file_path: synced source files
└── state/         # state_path: deployment state for this target

Local working directory:
.databricks/       # CLI cache and per-target files: add to .gitignore
```

- Each target has its own `root_path`, so dev, staging, and prod keep separate state.
- Because state is stored in the workspace, a different machine (for example a CI runner) can deploy the same target. Use `databricks bundle summary --force-pull` to refresh from the remote state.
- `bundle deploy` takes a **deployment lock** so concurrent deploys do not interfere (development mode disables it). `--force-lock` should be used only when a crashed or interrupted deploy left a stale lock.

> [!note] Deployment engine
> The **direct deployment engine** (built on the Databricks Go SDK, no Terraform) became GA on June 10, 2026 and is the default for bundles created with CLI 1.3.0 and above. CLI 1.14+ auto-migrates Terraform-based bundles on deploy, and the Terraform engine was removed in CLI 1.20.0. One visible change: removing a field from YAML reverts it to the resource default on the next deploy. Sources: [Declarative Automation Bundles feature release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles), [Direct deployment engine](https://docs.databricks.com/aws/en/dev-tools/bundles/direct)

## Integration with CI/CD

### GitHub Actions Workflow (Workload Identity Federation)

```yaml
# .github/workflows/deploy.yml

name: Deploy Bundle

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  id-token: write   # lets the job request a GitHub OIDC token
  contents: read

env:
  DATABRICKS_AUTH_TYPE: github-oidc
  DATABRICKS_HOST: ${{ vars.DATABRICKS_HOST }}
  DATABRICKS_CLIENT_ID: ${{ vars.DATABRICKS_SP_CLIENT_ID }}   # service principal application ID

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main
      - name: Validate bundle
        run: databricks bundle validate -t staging

  deploy-staging:
    needs: validate
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main
      - name: Deploy to staging
        run: databricks bundle deploy -t staging
      - name: Run integration tests
        run: databricks bundle run -t staging integration_tests

  deploy-prod:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: databricks/setup-cli@main
      - name: Deploy to production
        run: databricks bundle deploy -t prod
```

- With `DATABRICKS_AUTH_TYPE: github-oidc`, the CLI exchanges the GitHub workload identity token for a Databricks OAuth token. No PAT or client secret is stored in GitHub.
- The service principal needs a **federation policy** whose issuer is `https://token.actions.githubusercontent.com` and whose subject matches the token, for example `repo:my-org/my-repo:environment:production`. Databricks recommends the GitHub **environment** entity type over a branch.
- Use a separate service principal (and policy) per environment for least privilege. See [Bundle Deployment Strategies — Part 2](./04-bundle-deployment-strategies-part2.md) for the policy setup.

### Azure DevOps Pipeline (OAuth M2M)

```yaml
# azure-pipelines.yml

trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Validate
    jobs:
      - job: ValidateBundle
        steps:
          - script: |
              curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
            displayName: 'Install Databricks CLI'

          - script: databricks bundle validate -t staging
            displayName: 'Validate Bundle'
            env:
              DATABRICKS_HOST: $(DATABRICKS_HOST)
              DATABRICKS_CLIENT_ID: $(DATABRICKS_CLIENT_ID)
              DATABRICKS_CLIENT_SECRET: $(DATABRICKS_CLIENT_SECRET)

  - stage: DeployProd
    dependsOn: Validate
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProduction
        environment: production
        strategy:
          runOnce:
            deploy:
              steps:
                - script: databricks bundle deploy -t prod
                  env:
                    DATABRICKS_HOST: $(PROD_DATABRICKS_HOST)
                    DATABRICKS_CLIENT_ID: $(PROD_DATABRICKS_CLIENT_ID)
                    DATABRICKS_CLIENT_SECRET: $(PROD_DATABRICKS_CLIENT_SECRET)
```

`DATABRICKS_CLIENT_ID` + `DATABRICKS_CLIENT_SECRET` select OAuth machine-to-machine (`oauth-m2m`) authentication for a service principal. `DATABRICKS_TOKEN` (a personal access token) still works, but the docs mark PAT authentication as legacy. Azure DevOps can also use workload identity federation (`DATABRICKS_AUTH_TYPE: azure-devops-oidc`).

## Bundle Templates

### Default and Custom Templates

```bash
# Interactive: choose from the default templates
databricks bundle init

# A specific default template
databricks bundle init default-python

# A custom template from Git or a local path
databricks bundle init https://github.com/company/bundle-template

# Custom template whose schema file is in a subfolder of the repo
databricks bundle init https://github.com/company/templates --template-dir dab-container-template

# Non-interactive (CI): answer the prompts from a JSON file
databricks bundle init default-python --config-file ./init-params.json --output-dir ./new-project
```

| Template | What you get |
| :--- | :--- |
| `default-python` | A job and an ETL pipeline (requires `uv`) |
| `default-minimal` | Only the required files and catalog variables, no sample code |
| `default-sql` | A job that runs SQL on a SQL warehouse |
| `default-scala` | A Scala JAR set up for serverless |
| `dbt-sql` | dbt-core locally, deployed as a job with a dbt task |
| `mlops-stacks` | Full-stack MLOps Stacks project |
| `pydabs` | Like `default-python`, but bundle configuration written in Python |

### Custom Template Structure

```text
my-template/
├── databricks_template_schema.json   # prompts shown to the user
├── library/                          # optional template helpers
└── template/
    ├── databricks.yml.tmpl
    ├── resources/
    │   └── {{.project_name}}_job.yml.tmpl
    └── src/
        └── {{.project_name}}/
            └── main.py.tmpl
```

Templates use Go `text/template` syntax (`{{.project_name}}`), including in file and folder names.

### Template Schema

```json
{
  "properties": {
    "project_name": {
      "type": "string",
      "description": "Project name",
      "default": "my_project"
    },
    "include_pipeline": {
      "type": "string",
      "description": "Include a Lakeflow pipeline (yes/no)",
      "default": "no"
    }
  }
}
```

## Common Patterns

### Multi-Environment Deployment

```yaml
# databricks.yml

variables:
  environment:
    default: dev

targets:
  dev:
    mode: development
    default: true
    variables:
      environment: dev
    workspace:
      host: https://dev.cloud.databricks.com

  staging:
    variables:
      environment: staging
    workspace:
      host: https://staging.cloud.databricks.com

  prod:
    mode: production
    variables:
      environment: prod
    workspace:
      host: https://prod.cloud.databricks.com
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"
```

The same `resources` deploy to every target; only the target overrides differ. This is the pattern behind "deploy identically to dev, staging, and prod with environment-specific overrides."

### Shared Resources Across Teams

```yaml
# Include shared configurations (globs are relative to this file)

include:
  - ./shared/common-clusters.yml
  - ./shared/notification-settings.yml
  - ./team-specific/*.yml
```

### Parameterized Notebooks

```python
# Notebook task: read a job parameter defined in the bundle's job `parameters`
dbutils.widgets.text("catalog", "dev_catalog")  # default for interactive runs only
catalog = dbutils.widgets.get("catalog")

spark.sql(f"USE CATALOG {catalog}")
```

Use a job parameter whose default is `${var.catalog}` so the value is set per target at deploy time but can still be overridden per run.

## Use Cases

- **Environment promotion**: define `dev`, `staging`, and `prod` targets in `databricks.yml` and deploy the same pipeline configuration to each workspace with `databricks bundle deploy -t <target>`.
- **Infrastructure as code**: keep job schedules, cluster definitions, and Lakeflow pipeline settings in the same Git repository as the code, reviewed through pull requests.
- **Adopting existing jobs**: run `databricks bundle generate job --existing-job-id <id>` to write YAML for a job built in the UI, then `deployment bind` it so the bundle manages it.
- **Per-developer sandboxes**: `mode: development` gives every engineer a prefixed, paused copy of the same jobs and pipelines.

## Common Issues & Errors

### Bundle Validation Fails

**Scenario:** `databricks bundle validate` reports that a variable has no value.

```bash
# Provide the variable on the command line...
databricks bundle validate -t prod --var="notification_email=ops@company.com"

# ...or as an environment variable (BUNDLE_VAR_<name>)
export BUNDLE_VAR_notification_email=ops@company.com
databricks bundle validate -t prod
```

Do not use bundle variables for secrets. Reference secrets from a secret scope in the code instead.

### Permission Denied on Deploy

**Scenario:** Deploy fails with a permission error.

**Fix:** Check the deploying identity's workspace permissions, the `run_as` identity (the deployer needs CAN_USE on a `run_as` service principal), and the bundle `permissions`:

```yaml
targets:
  prod:
    run_as:
      service_principal_name: "00000000-0000-0000-0000-000000000000"
    permissions:
      - level: CAN_MANAGE
        group_name: data-engineers
```

### Resource Already Exists

**Scenario:** A job or pipeline with the same name already exists in the workspace, created outside the bundle.

**Fix:** Bind the existing resource to the bundle instead of creating a duplicate:

```bash
# Bind workspace job 123456789 to the bundle key etl_daily_job, then deploy
databricks bundle deployment bind etl_daily_job 123456789 -t prod
databricks bundle deploy -t prod

# Stop managing it from the bundle (the workspace job is kept)
databricks bundle deployment unbind etl_daily_job -t prod
```

### Stale Deployment Lock

**Scenario:** Deploy fails because a lock is held, after a previous CI run was killed.

**Fix:** Confirm nothing else is deploying, then:

```bash
databricks bundle deploy -t prod --force-lock
```

In CI, prevent the problem by serializing deploys per target (for example a GitHub Actions `concurrency` group).

### Artifact Build Failure

**Scenario:** The wheel build fails during `bundle deploy`.

**Fix:** Run the same build command locally first, and check the artifact's `path` and `build`:

```bash
cd src/python
poetry build
```

```yaml
artifacts:
  etl_package:
    type: whl
    path: ./src/python   # relative to databricks.yml
    build: poetry build  # must succeed on the CI runner too
```

## Exam Tips

> [!tip]
>
> - **Same definitions, many environments** → one `databricks.yml` with `targets` and per-target overrides, deployed with `databricks bundle deploy -t <target>`. Manually recreating jobs, workspace imports, or one shared workspace are the wrong answers.
> - **Commands**: `validate` (syntax), `plan` (preview), `deploy` (create/update), `run` (trigger), `destroy` (delete), `summary` (list). The command group is still `databricks bundle` after the rename.
> - **Development mode**: `[dev <short_name>]` prefix, `dev` tag, paused schedules and triggers, development pipelines, cluster override allowed, no deployment lock.
> - **Production mode**: pipelines must not be in development mode, optional Git branch check, no cluster override, and a service principal in `run_as` is recommended.
> - **Variables** (`${var.x}`) resolve at deploy time; per-run values belong in **job parameters**.
> - **CI auth**: service principal via workload identity federation (`github-oidc`) or OAuth M2M; PATs are legacy.
> - **Existing resources** → `bundle deployment bind` (or `bundle generate ... --bind`).

## Key Takeaways

- **Development mode behavior**: `mode: development` prefixes names with `[dev ${workspace.current_user.short_name}]`, adds a `dev` tag, pauses schedules and triggers, marks pipelines as development, and disables the deployment lock.
- **Variable syntax**: custom variables are `${var.name}`; context substitutions include `${bundle.target}`, `${workspace.current_user.userName}`, and `${workspace.file_path}`; values come from `--var`, `BUNDLE_VAR_<name>`, target variables, then defaults.
- **Core CLI commands**: `validate` checks configuration; `deploy` creates or updates resources; `run` triggers a job or pipeline; `destroy` removes what the bundle deployed.
- **`run_as` for production**: a service principal in `run_as` separates the run identity from the deployer; without one, production mode requires `run_as` and `permissions` and rejects user-specific paths.
- **State**: deployment state is stored per target in the workspace (`state_path`); keep the local `.databricks/` folder out of Git. The direct deployment engine is now the default and the Terraform engine is gone in current CLIs.
- **Sync**: `sync` include/exclude use `.gitignore` syntax and build on the bundle's `.gitignore`.
- **Artifacts**: `bundle deploy` builds and uploads `whl` and `jar` artifacts declared in `artifacts:`.
- **Composition**: `include:` merges shared YAML (clusters, notifications, permissions) into one bundle.

## Related Topics

- [Declarative Automation Bundles — Part 1](./03-declarative-automation-bundles-part1.md) - Structure, targets, modes, presets, `run_as`
- [Bundle Deployment Strategies — Part 1](./04-bundle-deployment-strategies-part1.md) - Advanced bundle patterns, blue/green, canary
- [CI/CD Integration — Part 1](./05-cicd-integration-part1.md) - Pipeline workflows on CI platforms
- [Git Folders](./06-git-folders.md) - Git folders vs bundles
- [Job Repair and Parameter Overrides](./02-job-repair-and-parameter-overrides.md) - Overriding job parameters at run time

## Official Documentation

- [What are Declarative Automation Bundles?](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Declarative Automation Bundles feature release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles)
- [Bundle configuration](https://docs.databricks.com/aws/en/dev-tools/bundles/settings)
- [Configuration reference](https://docs.databricks.com/aws/en/dev-tools/bundles/reference)
- [Bundle resources](https://docs.databricks.com/aws/en/dev-tools/bundles/resources)
- [Deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes)
- [Substitutions and variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)
- [Specify a run identity (`run_as`)](https://docs.databricks.com/aws/en/dev-tools/bundles/run-as)
- [Override cluster settings](https://docs.databricks.com/aws/en/dev-tools/bundles/cluster-override)
- [Configure job parameters in bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/job-parameters)
- [Bundle project templates](https://docs.databricks.com/aws/en/dev-tools/bundles/templates)
- [`bundle` command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)
- [Direct deployment engine](https://docs.databricks.com/aws/en/dev-tools/bundles/direct)
- [Enable workload identity federation for GitHub Actions](https://docs.databricks.com/aws/en/dev-tools/auth/provider-github)
- [Environment variables for unified authentication](https://docs.databricks.com/aws/en/dev-tools/auth/env-vars)

---

**[← Previous: Declarative Automation Bundles — Part 1](./03-declarative-automation-bundles-part1.md) | [↑ Back to Section](./README.md) | [Next: Bundle Deployment Strategies — Part 1: Bundle Patterns & CI/CD Pipelines →](./04-bundle-deployment-strategies-part1.md)**
