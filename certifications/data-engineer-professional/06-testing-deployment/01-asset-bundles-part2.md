---
title: Asset Bundles — Part 2
type: topic
tags:
  - data-engineering
  - dab
  - deployment
  - bundles
status: published
---

# Databricks Asset Bundles (DAB) — Part 2

This part covers sync and state management, CI/CD integration, bundle templates, common patterns, common issues, and exam tips for Databricks Asset Bundles.

> For bundle structure, resource definitions, variables, commands, target configuration, and artifact packaging, see [Part 1](./01-asset-bundles.md).

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
    - ".git/**"
    - "tests/**"
```text

### State Files

```text
Bundle state is stored locally:

.databricks/
├── bundle/
│   ├── dev/
│   │   └── terraform.tfstate
│   └── prod/
│       └── terraform.tfstate

# Add to .gitignore:
.databricks/
```text

## Integration with CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Bundle

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Databricks CLI
        uses: databricks/setup-cli@main

      - name: Validate bundle
        run: databricks bundle validate -t staging
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

  deploy-staging:
    needs: validate
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Deploy to staging
        run: databricks bundle deploy -t staging
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

      - name: Run integration tests
        run: databricks bundle run integration_tests -t staging
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

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
        env:
          DATABRICKS_HOST: ${{ secrets.PROD_DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.PROD_DATABRICKS_TOKEN }}
```text

### Azure DevOps Pipeline

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
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '3.10'

          - script: |
              curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
            displayName: 'Install Databricks CLI'

          - script: databricks bundle validate -t staging
            displayName: 'Validate Bundle'
            env:
              DATABRICKS_HOST: $(DATABRICKS_HOST)
              DATABRICKS_TOKEN: $(DATABRICKS_TOKEN)

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
                    DATABRICKS_HOST: $(PROD_HOST)
                    DATABRICKS_TOKEN: $(PROD_TOKEN)
```text

## Bundle Templates

### Available Templates

```bash
# List available templates
databricks bundle init --help

# Initialize from default template
databricks bundle init

# Initialize from specific template
databricks bundle init default-python

# Initialize from custom template URL
databricks bundle init https://github.com/company/bundle-template
```text

### Custom Template Structure

```text
my-template/
├── databricks_template_schema.json
├── template/
│   ├── databricks.yml.tmpl
│   ├── resources/
│   │   └── {{.project_name}}_job.yml.tmpl
│   └── src/
│       └── notebooks/
│           └── main.py.tmpl
```text

### Template Schema

```json
{
  "properties": {
    "project_name": {
      "type": "string",
      "description": "Project name",
      "default": "my_project"
    },
    "include_dlt": {
      "type": "boolean",
      "description": "Include DLT pipeline",
      "default": false
    }
  }
}
```text

## Common Patterns

### Multi-Environment Deployment

```yaml
# databricks.yml
variables:
  environment:
    default: dev

targets:
  dev:
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
    variables:
      environment: prod
    workspace:
      host: https://prod.cloud.databricks.com
    run_as:
      service_principal_name: prod-sp
```text

### Shared Resources Across Teams

```yaml
# Include shared configurations
include:
  - ./shared/common-clusters.yml
  - ./shared/notification-settings.yml
  - ./team-specific/*.yml
```text

### Parameterized Notebooks

```python
# In notebook
dbutils.widgets.text("catalog", "dev_catalog")
dbutils.widgets.text("environment", "dev")

catalog = dbutils.widgets.get("catalog")
environment = dbutils.widgets.get("environment")

# Use in queries
spark.sql(f"USE CATALOG {catalog}")
```text

## Common Issues & Errors

### 1. Bundle Validation Fails

**Scenario:** `databricks bundle validate` returns errors.

**Common causes and fixes:**

```bash
# Missing required variables
# Error: variable 'db_password' is required but not set

# Fix: Provide variable
databricks bundle validate --var db_password=secret

# Or set environment variable
export BUNDLE_VAR_db_password=secret
```text

### 2. Permission Denied on Deploy

**Scenario:** Deploy fails with permission error.

**Fix:** Check workspace permissions and run_as configuration:

```yaml
targets:
  prod:
    run_as:
      service_principal_name: sp-with-correct-permissions
    permissions:
      - level: CAN_MANAGE
        group_name: data-engineers
```text

### 3. Resource Already Exists

**Scenario:** Deploy fails because resource exists.

**Fix:** Either destroy existing or import:

```bash
# Destroy and redeploy
databricks bundle destroy -t dev
databricks bundle deploy -t dev

# Or modify to allow updates
# Check for naming conflicts in development mode
```text

### 4. State File Conflicts

**Scenario:** State file out of sync with workspace.

**Fix:** Refresh or remove state:

```bash
# Remove local state (will recreate)
rm -rf .databricks/bundle/dev/

# Redeploy
databricks bundle deploy -t dev
```text

### 5. Artifact Build Failure

**Scenario:** Wheel build fails during deploy.

**Fix:** Verify build command and dependencies:

```bash
# Test build locally first
cd src/python
poetry build  # or python setup.py bdist_wheel

# Check artifact configuration
artifacts:
  my_package:
    type: whl
    path: ./src/python
    build: poetry build  # Ensure command is correct
```text

## Exam Tips

1. **Bundle structure** - Know standard project layout (databricks.yml, resources/, src/)
2. **Target modes** - development vs production mode differences
3. **Variable syntax** - `${var.name}`, `${bundle.target}`, `${workspace.current_user.userName}`
4. **Commands** - validate, deploy, run, destroy, summary
5. **Development mode** - Prefixes names, pauses schedules, uses personal paths
6. **run_as** - Required for production deployments, uses service principal
7. **Include directive** - Combine multiple YAML files
8. **Artifacts** - Build and deploy Python wheels, JARs
9. **Sync exclude** - Prevent unwanted files from deploying
10. **State management** - Local .databricks/ folder, target-specific state

## Related Topics

- [CI/CD Integration](02-cicd-integration.md) - Pipeline workflows
- [Git Folders](03-git-folders.md) - Version control integration

## Official Documentation

- [Databricks Asset Bundles](https://docs.databricks.com/dev-tools/bundles/index.html)
- [Bundle Configuration](https://docs.databricks.com/dev-tools/bundles/settings.html)
- [Bundle Templates](https://docs.databricks.com/dev-tools/bundles/templates.html)
- [CI/CD with Bundles](https://docs.databricks.com/dev-tools/bundles/ci-cd.html)
