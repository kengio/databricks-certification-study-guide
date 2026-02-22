---
title: Databricks CLI — Part 2
type: topic
tags:
  - data-engineering
  - cli
  - automation
status: published
---

# Databricks CLI — Part 2

This file covers cluster management, secrets, Databricks Asset Bundles (DAB), Unity Catalog CLI commands, output formats, common scripting patterns, and exam preparation.

## Cluster Commands

### List Clusters

```bash
# List all clusters

databricks clusters list

# Output as JSON

databricks clusters list --output json
```

### Cluster Operations

```bash
# Get cluster details

databricks clusters get --cluster-id 1234-567890-abcdef

# Start cluster

databricks clusters start --cluster-id 1234-567890-abcdef

# Restart cluster

databricks clusters restart --cluster-id 1234-567890-abcdef

# Terminate cluster

databricks clusters delete --cluster-id 1234-567890-abcdef

# Permanently delete cluster

databricks clusters permanent-delete --cluster-id 1234-567890-abcdef
```

### Create Cluster

```bash
# Create cluster from JSON

databricks clusters create --json '{
  "cluster_name": "my-cluster",
  "spark_version": "14.3.x-scala2.12",
  "node_type_id": "Standard_DS3_v2",
  "num_workers": 2,
  "autotermination_minutes": 60
}'
```

### Edit Cluster

```bash
# Edit existing cluster

databricks clusters edit --json '{
  "cluster_id": "1234-567890-abcdef",
  "num_workers": 4,
  "autotermination_minutes": 120
}'
```

## Secrets Commands

### Secret Scopes

```bash
# List all secret scopes

databricks secrets list-scopes

# Create Databricks-backed scope

databricks secrets create-scope --scope my-scope

# Create scope with specific ACL

databricks secrets create-scope --scope my-scope --initial-manage-principal users

# Delete scope

databricks secrets delete-scope --scope my-scope
```

### Manage Secrets

```bash
# List secrets in scope (names only, not values)

databricks secrets list --scope my-scope

# Create/update secret

databricks secrets put --scope my-scope --key db-password --string-value "secret123"

# Create secret from file

databricks secrets put --scope my-scope --key ssh-key --binary-file ./id_rsa

# Delete secret

databricks secrets delete --scope my-scope --key db-password
```

### Secret ACLs

```bash
# List ACLs for scope

databricks secrets list-acls --scope my-scope

# Grant access

databricks secrets put-acl --scope my-scope --principal user@company.com --permission READ

# Revoke access

databricks secrets delete-acl --scope my-scope --principal user@company.com
```

| Permission | Capabilities |
| ---------- | ------------ |
| READ | Read secrets |
| WRITE | Read and write secrets |
| MANAGE | Full control including ACLs |

## Bundle Commands (DAB)

Databricks Asset Bundles (DAB) enable infrastructure-as-code for Databricks resources.

### Initialize Bundle

```bash
# Create new bundle from template

databricks bundle init

# Initialize in existing directory

databricks bundle init --template default-python ./my-project
```

### Bundle Workflow

```bash
# Validate bundle configuration

databricks bundle validate

# Deploy to target environment

databricks bundle deploy

# Deploy to specific target

databricks bundle deploy --target production

# Run a resource from bundle

databricks bundle run my-job

# Destroy deployed resources

databricks bundle destroy
```

### Bundle Configuration (databricks.yml)

```yaml
bundle:
  name: my-etl-project

workspace:
  host: https://adb-1234567890.12.azuredatabricks.net

resources:
  jobs:
    daily_etl:
      name: "Daily ETL Job"
      tasks:
        - task_key: extract
          notebook_task:
            notebook_path: ./notebooks/extract.py

targets:
  development:
    mode: development
    default: true
    workspace:
      host: https://dev.azuredatabricks.net

  production:
    mode: production
    workspace:
      host: https://prod.azuredatabricks.net
    resources:
      jobs:
        daily_etl:
          schedule:
            quartz_cron_expression: "0 0 8 * * ?"
            timezone_id: "America/New_York"
```

### Bundle Commands Summary

| Command | Purpose |
| ------- | ------- |
| `bundle init` | Create new bundle |
| `bundle validate` | Check configuration |
| `bundle deploy` | Deploy resources |
| `bundle run` | Execute resource |
| `bundle destroy` | Remove deployed resources |
| `bundle sync` | Sync files to workspace |

## Unity Catalog Commands

### List Catalogs and Schemas

```bash
# List catalogs

databricks unity-catalog catalogs list

# List schemas in catalog

databricks unity-catalog schemas list --catalog-name main

# List tables in schema

databricks unity-catalog tables list --catalog-name main --schema-name default
```

### Manage Permissions

```bash
# Get table permissions

databricks unity-catalog permissions tables get --full-name main.default.my_table

# Grant permissions

databricks unity-catalog permissions tables update --full-name main.default.my_table --json '{
  "changes": [{
    "principal": "user@company.com",
    "add": ["SELECT", "MODIFY"]
  }]
}'
```

## Output Formats

### JSON Output

```bash
# Get JSON output for parsing

databricks jobs list --output json | jq '.jobs[].settings.name'

# Pretty print JSON

databricks clusters get --cluster-id xxx --output json | jq '.'
```

### Table Output (Default)

```bash
# Default table format

databricks jobs list
```

## Common Patterns

### CI/CD Pipeline Integration

```bash
#!/bin/bash
# Deploy pipeline script

set -e

# Configure authentication

export DATABRICKS_HOST=${{ secrets.DATABRICKS_HOST }}
export DATABRICKS_TOKEN=${{ secrets.DATABRICKS_TOKEN }}

# Validate bundle

databricks bundle validate

# Deploy to staging

databricks bundle deploy --target staging

# Run tests

databricks bundle run integration-tests --target staging

# Deploy to production (manual approval required)

databricks bundle deploy --target production
```

### Backup Workspace

```bash
#!/bin/bash
# Backup all notebooks

BACKUP_DIR="./backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Export shared notebooks

databricks workspace export-dir /Shared/ $BACKUP_DIR/Shared/ --overwrite

# Export user notebooks

for user in $(databricks workspace list /Users/ --output json | jq -r '.[].path'); do
    databricks workspace export-dir "$user" "$BACKUP_DIR$user" --overwrite
done
```

### Migrate Jobs Between Workspaces

```bash
#!/bin/bash
# Export job from source, import to target

# Export from source

DATABRICKS_CONFIG_PROFILE=source databricks jobs get --job-id 123 --output json > job.json

# Remove job_id and created_time for import

jq 'del(.job_id, .created_time)' job.json > job_clean.json

# Import to target

DATABRICKS_CONFIG_PROFILE=target databricks jobs create --json-file job_clean.json
```

## Use Cases

- **CI/CD Automation**: Integrating Databricks Asset Bundles (DABs) deployment into GitHub Actions or Azure DevOps pipelines.
- **Bulk Operations**: Managing hundreds of secrets, creating cluster policies, or syncing workspace directories automatically.
- **Local IDE Integration**: Interacting with the remote Databricks workspace directly from a local terminal or IDE.

## Common Issues & Errors

### Authentication Failed

**Scenario:** Invalid or expired token.

```bash
# Error: INVALID_PARAMETER_VALUE: Invalid access token

```

**Fix:** Regenerate PAT and reconfigure:

```bash
databricks configure --token
```

### Profile Not Found

**Scenario:** Specified profile doesn't exist in config.

```bash
# Error: cannot find profile "nonexistent" in ~/.databrickscfg

```

**Fix:** Check profile name matches config file or create profile.

### Permission Denied on Workspace

**Scenario:** User lacks permission for workspace operation.

```bash
# Error: PERMISSION_DENIED: User does not have permission

```

**Fix:** Request appropriate workspace permissions from admin.

### Cluster Not Found

**Scenario:** Cluster ID is invalid or cluster was deleted.

```bash
# Error: RESOURCE_DOES_NOT_EXIST: Cluster xxx does not exist

```

**Fix:** Verify cluster ID with `databricks clusters list`.

### Rate Limiting

**Scenario:** Too many API requests.

```bash
# Error: 429 Too Many Requests

```

**Fix:** Add delays between requests or batch operations.

## Exam Tips

1. **Authentication order** - Environment variables > profile flag > config file
2. **Profile syntax** - Use `--profile name` or `DATABRICKS_CONFIG_PROFILE`
3. **Workspace paths** - Always start with `/` for absolute paths
4. **Export formats** - SOURCE for version control, DBC for archives
5. **Jobs API** - `run-now` triggers existing job, `submit` creates one-time run
6. **Secret scopes** - `create-scope` for new, `put` to add secrets
7. **Bundle commands** - validate → deploy → run workflow
8. **DBFS paths** - Use `dbfs:/` prefix for fs commands
9. **JSON output** - Use `--output json` for scripting and automation
10. **Cluster states** - Know PENDING, RUNNING, TERMINATED, ERROR states

## Key Takeaways

- **Authentication precedence**: environment variables (`DATABRICKS_HOST`, `DATABRICKS_TOKEN`) override profile flag (`--profile`), which overrides the default profile in `~/.databrickscfg`
- **Databricks Asset Bundle (DAB) workflow**: `bundle validate` → `bundle deploy --target <env>` → `bundle run <resource>`; `databricks.yml` defines resources, targets, and workspace settings
- **`jobs run-now`** triggers an existing job by ID; **`jobs submit`** creates a one-time run without a persistent job definition
- **Secret scope management**: `databricks secrets create-scope` creates the scope; `databricks secrets put --scope ... --key ... --string-value ...` adds or updates a secret; values can never be retrieved via CLI, only key names are listed
- **DBFS paths** in CLI commands require the `dbfs:/` prefix (e.g., `databricks fs ls dbfs:/data/`)
- **Output format**: default is human-readable table; `--output json` enables scripting with tools like `jq`
- **Cluster lifecycle states**: PENDING → RUNNING → TERMINATED (or ERROR); use `databricks clusters list --output json` to check state programmatically
- **Bundle `mode: development`** applies a prefix to deployed resource names to prevent collision with production resources; `mode: production` deploys without prefix

## Related Topics

- [REST API — Part 1](./03-rest-api-part1.md) - Programmatic API access
- [Asset Bundles](../06-testing-deployment/01-asset-bundles-part1.md) - Infrastructure as code
- [CI/CD Integration](../06-testing-deployment/02-cicd-integration-part1.md) - Pipeline automation

## Official Documentation

- [Databricks CLI Reference](https://docs.databricks.com/dev-tools/cli/index.html)
- [CLI Authentication](https://docs.databricks.com/dev-tools/cli/authentication.html)
- [Databricks Asset Bundles](https://docs.databricks.com/dev-tools/bundles/index.html)

---

**[← Previous: Databricks CLI — Part 1](./02-databricks-cli-part1.md) | [↑ Back to Databricks Tooling](./README.md) | [Next: REST API — Part 1 (Jobs, Clusters, DBFS & Workspace APIs)](./03-rest-api-part1.md) →**
