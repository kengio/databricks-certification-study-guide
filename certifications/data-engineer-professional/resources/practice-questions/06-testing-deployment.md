---
title: "Practice Questions: Testing & Deployment"
type: practice-questions
tags: [data-engineer-professional, practice-questions, testing-deployment]
---

# Practice Questions - Section 06: Testing & Deployment (10%)

## Question 6.1: Databricks Asset Bundles

**Scenario**: A team needs to deploy the same pipeline to dev, staging, and production environments.

**Question** *(Medium)*: How should environments be configured in Databricks Asset Bundles?

A) Create separate bundle files for each environment
B) Use targets in databricks.yml with environment-specific settings
C) Use Git branches for each environment
D) Manually modify settings before each deployment

> [!success]- Answer
> **Correct Answer: B**
>
> DAB uses targets to define environment-specific configurations in a single databricks.yml. This is the recommended approach for multi-environment deployments. Separate files or manual changes lead to drift and errors.

---

## Question 6.2: Bundle Deployment Mode

**Scenario**: A developer wants to test their bundle without affecting shared resources.

**Question** *(Easy)*: Which target mode should they use?

A) `mode: production`
B) `mode: development`
C) `mode: testing`
D) `mode: sandbox`

> [!success]- Answer
> **Correct Answer: B**
>
> Development mode prefixes resource names with the username, pauses schedules, and uses personal workspace paths. This prevents conflicts with other developers or production resources.

---

## Question 6.3: Git Folders

**Scenario**: A team wants to version control their notebooks with automatic sync to Git.

**Question** *(Easy)*: Which statement about Git Folders is correct?

A) Git Folders require manual sync after each change
B) Git Folders can only connect to GitHub
C) Git Folders replace the need for Databricks Asset Bundles
D) Git Folders provide native Git operations like pull, commit, and push

> [!success]- Answer
> **Correct Answer: D**
>
> Git Folders provide native Git operations directly in the Databricks UI. They support multiple Git providers (GitHub, GitLab, Azure DevOps, etc.). They complement DAB (which handles deployment), not replace it.

---

## Question 6.4: Unit Testing with Nutter

**Scenario**: A team needs to run tests inside Databricks notebooks as part of CI/CD.

**Question** *(Medium)*: Which Nutter pattern is correct?

A) `def test_my_function():` followed by assertions
B) `before_`, `run_`, and `assertion_` method prefixes for each test
C) `@test` decorator on test methods
D) `TestCase` class inheritance

> [!success]- Answer
> **Correct Answer: B**
>
> Nutter uses a specific naming convention: `before_<test>` for setup, `run_<test>` for execution, and `assertion_<test>` for verification. This pattern allows tests to run inside Databricks notebooks.

---

## Question 6.5: CI/CD Pipeline

**Scenario**: A GitHub Actions workflow needs to deploy a bundle to Databricks.

**Question** *(Easy)*: Which step is required before running `databricks bundle deploy`?

A) Install Python
B) Run `databricks bundle init`
C) Set up Databricks CLI with authentication
D) Create the workspace manually

> [!success]- Answer
> **Correct Answer: C**
>
> The Databricks CLI must be installed and authenticated (via `databricks/setup-cli` action or environment variables) before deployment commands work. The bundle already exists in the repo. Python is helpful but CLI is essential.

---

## Question 6.6: OIDC Federation for CI/CD

**Scenario**: A security team requires that CI/CD pipelines authenticate to Databricks without storing long-lived tokens in GitHub Actions secrets.

**Question** *(Hard)*: What is the recommended authentication approach?

A) Use OIDC federation with GitHub's identity provider so the pipeline exchanges a short-lived GitHub token for a Databricks access token
B) Generate a personal access token (PAT) and store it as an encrypted GitHub secret with automatic rotation
C) Use a service principal with a client secret stored in a vault and injected at runtime
D) Configure SSH key-based authentication between GitHub Actions runners and the Databricks workspace

> [!success]- Answer
> **Correct Answer: A**
>
> OIDC (OpenID Connect) federation allows GitHub Actions to authenticate to Databricks without storing any secrets. The pipeline receives a short-lived OIDC token from GitHub's identity provider and exchanges it for a Databricks token. This eliminates secret management entirely. PATs and client secrets still require secret storage and rotation. SSH authentication is not supported for Databricks API calls.

---

## Question 6.7: Blue/Green Deployment

**Scenario**: A production pipeline processes financial data and cannot tolerate downtime during updates. The team needs a zero-downtime deployment strategy.

**Question** *(Hard)*: How should a blue/green deployment be implemented with Databricks Asset Bundles?

A) Deploy the new version to the same target and rely on Databricks to handle the transition automatically
B) Maintain two separate DAB targets (blue and green), deploy the new version to the inactive target, run validation, then switch traffic
C) Use `databricks bundle deploy --rolling` to gradually replace running tasks
D) Deploy to a staging target, run all tests, then use `databricks bundle promote` to move to production

> [!success]- Answer
> **Correct Answer: B**
>
> Blue/green deployment uses two parallel environments. Deploy to the inactive one, validate, then switch traffic (e.g., by updating a job alias or routing). This provides instant rollback by switching back. Databricks doesn't auto-handle transitions. There is no `--rolling` or `promote` command in the DAB CLI.

---

## Question 6.8: Bundle Variable Substitution

**Scenario**: A DAB project needs different cluster sizes, catalog names, and notification emails for dev vs. production targets.

**Question** *(Medium)*: Which approach correctly parameterizes these differences?

A) Use shell environment variables like `$CLUSTER_SIZE` directly in databricks.yml
B) Create separate databricks.yml files for each environment (databricks-dev.yml, databricks-prod.yml)
C) Use Jinja2 templating syntax `{{ env.CLUSTER_SIZE }}` in the bundle configuration
D) Define variables in the bundle and override them per target using `variables:` blocks with `${var.variable_name}` syntax

> [!success]- Answer
> **Correct Answer: D**
>
> DAB supports native variable substitution with `${var.variable_name}` syntax. Variables are defined at the bundle level and can be overridden per target in the `targets:` section. Shell variables, separate files, and Jinja2 are not supported in DAB configuration syntax.

---

## Question 6.9: Integration Testing DLT Pipelines

**Scenario**: A team needs to test a DLT pipeline end-to-end as part of CI/CD, validating that expectations pass and output data is correct.

**Question** *(Hard)*: What is the recommended approach for integration testing DLT pipelines?

A) Deploy the pipeline to a test target with a test catalog/schema, trigger a full refresh, then validate the output tables and event log
B) Mock the DLT framework locally using pytest and validate transformation logic without deploying
C) Run the pipeline in `development` mode which automatically validates all expectations and reports results
D) Use the DLT testing API `dlt.test_pipeline()` to run the pipeline in a sandbox environment

> [!success]- Answer
> **Correct Answer: A**
>
> DLT pipelines must run on Databricks infrastructure. Deploy to a test target (using a test catalog/schema for isolation), trigger a full refresh via the API, then query the output tables and event log for expectation results. Local mocking doesn't test DLT-specific behavior. Development mode runs the pipeline but doesn't automatically validate outputs. There is no `dlt.test_pipeline()` API.

---

## Question 6.10: Deployment Validation

**Scenario**: A deployment pipeline needs to verify that a bundle is correctly configured before deploying to production, checking for missing permissions, invalid references, and configuration errors.

**Question** *(Easy)*: Which command performs this validation?

A) `databricks bundle test -t production`
B) `databricks bundle lint -t production`
C) `databricks bundle validate -t production`
D) `databricks bundle check -t production`

> [!success]- Answer
> **Correct Answer: C**
>
> `databricks bundle validate` checks the bundle configuration for errors including missing resources, invalid references, schema validation, and permission issues. It should always run before `databricks bundle deploy`. There is no `test`, `lint`, or `check` subcommand in the DAB CLI.

---

## Question 6.11: GitOps Workflow

**Scenario**: A team implements GitOps where the Git repository is the single source of truth. Changes to production should only occur through merged pull requests.

**Question** *(Medium)*: How should the CI/CD pipeline enforce this GitOps principle?

A) Allow direct deployments from any branch but require admin approval in the Databricks workspace
B) Configure the deployment pipeline to only trigger on merges to the main branch, with PR reviews and bundle validation as required checks
C) Use Git Folders to auto-sync the main branch to the production workspace
D) Lock the production workspace to read-only and require API-only deployments

> [!success]- Answer
> **Correct Answer: B**
>
> GitOps requires that all changes flow through Git. The CI/CD pipeline should only deploy from main branch (after PR merge), with validation and tests as required GitHub/GitLab checks before merge is allowed. Git Folders sync notebooks but don't handle full bundle deployment. Read-only workspaces break operational needs. Direct deployment from any branch bypasses review.

---

## Question 6.12: Testing Strategies - Unit vs Integration

**Scenario**: A data engineer writes a Python function that transforms a DataFrame (adding calculated columns, filtering invalid rows). The function is used inside a DLT pipeline.

**Question** *(Medium)*: What is the correct testing strategy for this function?

A) Only test within the DLT pipeline since the function depends on the DLT runtime
B) Write integration tests that deploy the full pipeline and verify end-to-end output
C) Use `unittest.mock` to mock the entire SparkSession and DataFrame API
D) Extract the function to a separate module, unit test it with a local SparkSession and sample data, then integration test the full pipeline

> [!success]- Answer
> **Correct Answer: D**
>
> Pure transformation functions should be extracted to testable modules and unit tested locally with a SparkSession (no DLT dependency needed). This gives fast feedback. Integration tests run the full pipeline on Databricks for end-to-end validation. Mocking the entire DataFrame API is brittle and doesn't test actual Spark behavior. Testing only in DLT is slow and expensive.

---

**[← Previous: Practice Questions - Section 05: Monitoring & Logging](./05-monitoring-logging.md) | [↑ Back to Practice Questions](./README.md) | [Next: Practice Questions - Section 07: Lakeflow Pipelines](./07-lakeflow-pipelines.md) →**
